const aws = require('aws-sdk');
const crypto = require('crypto');
const { getError, getErrorResponse } = require('./utils');
const {
  ATTR_AGE,
  ATTR_CHOICE_INVERTED,
  ATTR_CHOICE_TYPE,
  ATTR_CHOICE,
  ATTR_CHOICES,
  ATTR_COLOR_PERCEPTION,
  ATTR_COUNTRY_OF_BIRTH,
  ATTR_COUNTRY_OF_RESIDENCE,
  ATTR_DEMOGRAPHICS,
  ATTR_GENDER,
  ATTR_ID,
  ATTR_INTERVAL,
  ATTR_SONG_ID,
  ATTR_SONG_POSITION,
  ATTR_TIMEOUT,
} = require('./attributes');

const {
  ENCHANTED_BRAIN_APP_SECRET_ARN,
  ENCHANTED_BRAIN_S3_BUCKET_NAME,
  ENCHANTED_BRAIN_VALID_CHOICE_TYPES = '',
  ENCHANTED_BRAIN_VALID_SONG_IDS = '',
} = process.env;

const VALID_CHOICE_TYPES = ENCHANTED_BRAIN_VALID_CHOICE_TYPES.split(',');
const VALID_SONG_IDS = ENCHANTED_BRAIN_VALID_SONG_IDS.split(',');
const VALID_GENDERS = ['GENDER_MALE', 'GENDER_FEMALE', 'GENDER_OTHER'];
const VALID_UUID_REGEX = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;

const s3 = new aws.S3();
const secretsManager = new aws.SecretsManager();

let appSecretPromise = null;
const getAppSecret = () => {
  if (appSecretPromise) {
    return appSecretPromise;
  }
  appSecretPromise = (async () => {
    try {
      const { SecretString: secret } = await secretsManager
        .getSecretValue({
          SecretId: ENCHANTED_BRAIN_APP_SECRET_ARN,
        })
        .promise();
      return secret;
    } catch (error) {
      appSecretPromise = null;
      throw Object.assign(error, { statusCode: 500 });
    }
  })();
  return appSecretPromise;
};

const validateSongParameters = ({ [ATTR_CHOICE_INVERTED]: choiceInverted, ...sample }) => {
  if (typeof choiceInverted !== 'boolean') {
    throw getError([ATTR_CHOICE_INVERTED, choiceInverted, 'Expected a boolean.']);
  }
  [
    [ATTR_CHOICE_TYPE, VALID_CHOICE_TYPES],
    [ATTR_SONG_ID, VALID_SONG_IDS],
  ].forEach(([attribute, validValues]) => {
    const value = sample[attribute];
    if (!validValues.includes(value)) {
      throw getError([attribute, value, '']);
    }
  });

  [ATTR_INTERVAL, ATTR_TIMEOUT].forEach(attribute => {
    const value = sample[attribute];
    if (typeof value !== 'number' || value % 1 || value <= 0) {
      throw getError([attribute, value, 'Expected a positive integer.']);
    }
  });
};

const validateDemographics = ({
  [ATTR_AGE]: age,
  [ATTR_COLOR_PERCEPTION]: colorPerception,
  [ATTR_GENDER]: gender,
  ...demographics
}) => {
  if (typeof age !== 'number' || age % 1 || age <= 0) {
    throw getError([ATTR_AGE, age, 'Expected a positive integer.']);
  }
  if (
    typeof colorPerception !== 'number'
    || colorPerception % 1
    || colorPerception < 0
    || colorPerception > 3
  ) {
    throw getError([ATTR_COLOR_PERCEPTION, colorPerception, 'Expected an integer between 0 and 3']);
  }
  if (!VALID_GENDERS.includes(gender)) {
    throw getError([ATTR_GENDER, gender, '']);
  }
  [ATTR_COUNTRY_OF_BIRTH, ATTR_COUNTRY_OF_RESIDENCE].forEach(attribute => {
    const value = demographics[attribute];
    if (!/[A-Z]{2}/.test(value)) {
      throw getError([attribute, value, 'Expected an uppercase, two-letter country code.']);
    }
  });
};
const validateChoices = choices => {
  if (!(choices instanceof Array) || choices.length === 0) {
    throw getError('choices must be a non-empty array');
  }
  choices.forEach(({ [ATTR_CHOICE]: choice, [ATTR_SONG_POSITION]: songPosition }) => {
    if (typeof choice !== 'number' || choice % 1 || choice < -2 || choice > 2) {
      throw getError([ATTR_CHOICE, choice, 'Expected an integer between -2 and 2']);
    }
    if (typeof songPosition !== 'number' || !Number.isInteger(songPosition) || songPosition <= 0) {
      throw getError([ATTR_SONG_POSITION, songPosition, 'Expected a positive integer']);
    }
  });
};

const getSample = async ({ headers: { Authorization, authorization }, body: bodyString }) => {
  const token = (Authorization || authorization || '').split('Bearer ')[1];
  if (!token || token !== (await getAppSecret())) {
    throw getError('Unauthorized', 401);
  }
  if (!bodyString) {
    throw new Error('Request body must not be empty');
  }

  let sample;
  try {
    sample = JSON.parse(bodyString);
  } catch (error) {
    throw new Error('Request body must be valid JSON');
  }

  const { [ATTR_ID]: id } = sample;
  if (!VALID_UUID_REGEX.test(id)) {
    throw getError([ATTR_ID, id, 'Expected a UUID']);
  }
  validateSongParameters(sample);
  validateDemographics(sample[ATTR_DEMOGRAPHICS] || {});
  validateChoices(sample[ATTR_CHOICES] || []);
  return sample;
};

const saveSample = sample => {
  const body = JSON.stringify(sample);
  const { choiceType, id, songId } = sample;
  return s3
    .putObject({
      Body: body,
      Bucket: ENCHANTED_BRAIN_S3_BUCKET_NAME,
      Key: `Choices/${songId}/${choiceType}/${id}.json`,
      ContentType: 'application/json',
      ContentMD5: crypto
        .createHash('md5')
        .update(body, 'utf-8')
        .digest('base64'),
    })
    .promise();
};

exports.handler = async event => {
  let sample;
  try {
    sample = await getSample(event);
  } catch (error) {
    console.error(error);
    return getErrorResponse(error, 400);
  }

  try {
    await saveSample(sample);
    return { statusCode: 204 };
  } catch (error) {
    console.error(error);
    return getErrorResponse(error);
  }
};
