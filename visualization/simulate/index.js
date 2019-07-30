const aws = require('aws-sdk');
const program = require('commander');

program
  .version('0.0.1')
  .option('-u, --queue-url <queueUrl>')
  .option('-p, --prompts <prompts>', 'Number of response prompts to simulate', 5)
  .option('-i, --interval <interval>', 'Seconds between prompts', 20)
  .option('-t, --timeout <timeout>', 'Prompt timeout in seconds', 5)
  .option('-a, --audience-size <audienceSize>', 'Number of respondants', 500)
  .parse(process.argv);

const {
  queueUrl, prompts, interval, timeout, audienceSize,
} = program;

const TIME_INTERVAL = interval * 1000;
const TIME_TIMEOUT = timeout * 1000;
const COLORS = [
  '#FF8080',
  '#FF0000',
  '#AB0000',
  '#FFC080',
  '#FF8000',
  '#B35A00',
  '#FFFF80',
  '#FFFF00',
  '#B2B300',
  '#80FF80',
  '#00FF00',
  '#009900',
  '#8080FF',
  '#0000FF',
  '#0000AB',
  '#FF80FF',
  '#FF00FF',
  '#AB00AB',
  '#FFFFFF',
  '#808080',
  '#000000',
];
const CHOICE_COLOR = 'CHOICE_COLOR';
const CHOICE_EMOTION_ENERGY = 'CHOICE_EMOTION_ENERGY';
const CHOICE_EMOTION_HAPPINESS = 'CHOICE_EMOTION_HAPPINESS';

const sqs = new aws.SQS();
let intervalId;
let promptsRun = 0;
const startTime = Date.now();

const getRandomChoice = choiceType => {
  switch (choiceType) {
    case CHOICE_EMOTION_HAPPINESS:
    case CHOICE_EMOTION_ENERGY:
      return Math.floor(5 * Math.random() - 2);
    case CHOICE_COLOR:
    default:
      return COLORS[Math.floor(COLORS.length * Math.random())];
  }
};

const simulateResponses = async () => {
  console.log('Starting prompt', promptsRun + 1);
  let sent = 0;
  const intervalTime = startTime + promptsRun * TIME_INTERVAL;
  const timestamp = new Date(intervalTime).toISOString();
  const endTime = Date.now() + TIME_TIMEOUT;
  while (sent < audienceSize && Date.now() < endTime) {
    sqs
      .sendMessageBatch({
        QueueUrl: queueUrl,
        Entries: [CHOICE_COLOR, CHOICE_COLOR, CHOICE_EMOTION_ENERGY, CHOICE_EMOTION_HAPPINESS].map(
          (choiceType, index) => ({
            Id: `${intervalTime}-${index + sent}`,
            MessageBody: JSON.stringify({
              choice: getRandomChoice(choiceType),
              choiceType,
              timestamp,
            }),
          }),
        ),
      })
      .promise()
      .catch(error => {
        console.error(error);
        clearInterval(intervalId);
      });
    sent += 4;
  }
  promptsRun += 1;
  console.log('Ended prompt', promptsRun);

  if (promptsRun >= prompts) {
    clearInterval(intervalId);
  }
};

intervalId = setInterval(simulateResponses, TIME_INTERVAL);
