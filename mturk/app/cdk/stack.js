const cdk = require('@aws-cdk/core');
const apiGateway = require('@aws-cdk/aws-apigateway');
const lambda = require('@aws-cdk/aws-lambda');
const s3 = require('@aws-cdk/aws-s3');
const secretsManager = require('@aws-cdk/aws-secretsmanager');

const APP_NAME = 'enchanted-brain';
const APP_COMPONENT = 'mturk';

class AppStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props = {}) {
    super(scope, id, props);
    const { environment, validChoiceTypes, validSongIds } = props;

    const getResourceName = params => {
      let name = params;
      let delimiter;
      if (typeof params === 'object') {
        ({ name, delimiter } = params);
      }

      const parts = [environment, APP_NAME, APP_COMPONENT];
      if (name) {
        parts.push(name);
      }
      return parts.join(delimiter || '-');
    };

    const s3Bucket = new s3.Bucket(this, 'S3Bucket', {
      bucketName: getResourceName(),
      accessControl: s3.BucketAccessControl.PRIVATE,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const appSecret = new secretsManager.Secret(this, 'AppSecret', {
      secretName: getResourceName({ name: 'app-secret', delimiter: '/' }),
      generateSecretString: { passwordLength: 32 },
    });

    const choiceWriter = new lambda.Function(this, 'ChoiceWriter', {
      functionName: getResourceName('choice-writer'),
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.AssetCode('src/functions/choice-writer'),
      handler: 'index.handler',
      environment: {
        ENCHANTED_BRAIN_APP_SECRET_ARN: appSecret.secretArn,
        ENCHANTED_BRAIN_S3_BUCKET_NAME: s3Bucket.bucketName,
        ENCHANTED_BRAIN_VALID_CHOICE_TYPES: validChoiceTypes,
        ENCHANTED_BRAIN_VALID_SONG_IDS: validSongIds,
      },
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),
    });
    appSecret.grantRead(choiceWriter);
    s3Bucket.grantPut(choiceWriter);

    // eslint-disable-next-line no-new
    new apiGateway.LambdaRestApi(this, 'ChoiceWriterApi', {
      restApiName: getResourceName(),
      handler: choiceWriter,
    });
  }
}

Object.assign(exports, { AppStack });

if (require.main === module) {
  const app = new cdk.App();
  const { ENCHANTED_BRAIN_ENVIRONMENT: environment = 'test' } = process.env;

  // eslint-disable-next-line no-new
  new AppStack(app, 'AppStack', {
    stackName: [environment, APP_NAME, APP_COMPONENT].join('-'),
    tags: {
      environment,
      system: APP_NAME,
    },
    environment,
    validChoiceTypes: process.env.ENCHANTED_BRAIN_VALID_CHOICE_TYPES,
    validSongIds: process.env.ENCHANTED_BRAIN_VALID_SONG_IDS,
  });
}
