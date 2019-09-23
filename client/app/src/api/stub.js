import { sendChoice } from '../state/actions';
import {
  STAGE_CHOICE_CHILLS,
  STAGE_CHOICE_IMAGERY,
  STAGE_CHOICE_SYNESTHESIA,
  STAGE_END,
  STAGE_WAITING,
} from '../constants/Stages';
import { swatchColors } from '../constants/Colors';
import {
  CHOICE_CHILLS,
  CHOICE_COLOR,
  CHOICE_EMOTION_ANGER,
  CHOICE_EMOTION_HAPPINESS,
} from '../constants/Choices';

const TIME_SECONDS = 1000;
const TIME_MINUTES = 60 * 1000;

const colors = swatchColors.flat();

const STAGE_DATA = {
  [STAGE_CHOICE_CHILLS]: () => ({
    eventData: {
      startTime: new Date(Date.now() + 5 * TIME_SECONDS).toISOString(),
      endTime: new Date(Date.now() + 2 * TIME_MINUTES).toISOString(),
      interval: 0.2,
    },
  }),
  [STAGE_CHOICE_IMAGERY]: () => ({
    eventData: {
      formUrl: 'https://ucsf.co1.qualtrics.com/jfe/form/SV_eEBoIQ1RAp6UxdH',
    },
  }),
  [STAGE_CHOICE_SYNESTHESIA]: () => {
    const choiceTypes = [CHOICE_EMOTION_ANGER, CHOICE_EMOTION_HAPPINESS, CHOICE_COLOR];
    return {
      eventData: {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * TIME_MINUTES).toISOString(),
        interval: 20,
        timeout: 5,
        choiceTypes,
        choiceType: CHOICE_EMOTION_ANGER,
        choiceInverted: Math.random() < 0.5,
      },
    };
  },
  [STAGE_END]: () => {
    const eventData = require('./results.json');
    const storeActions = [];

    eventData.songs
      .filter(({ choiceType }) => choiceType === CHOICE_COLOR)
      .forEach(({ startTime, endTime }) => {
        let time = new Date(startTime);

        while (time.valueOf() < Date.parse(endTime)) {
          time.setSeconds(time.getSeconds() + 20);
          const timestamp = time.toISOString();

          if (Math.random() < 0.25) {
            continue;
          }
          storeActions.push(
            sendChoice({
              choice: colors[Math.floor(Math.random() * colors.length)].hex,
              choiceType: CHOICE_COLOR,
              timestamp,
            })
          );
        }
      });

    eventData.songs
      .filter(({ choiceType }) => choiceType === CHOICE_CHILLS)
      .forEach(({ startTime, endTime, choices }) => {
        let time = new Date(startTime);
        while (time.valueOf() < Date.parse(endTime)) {
          time.setSeconds(time.getSeconds() + 5);
          const timestamp = time.toISOString();

          let { chills = 0 } = choices.slice(-1)[0] || {};
          if (chills < 0.5) {
            chills += Math.random() * 0.1;
          } else {
            chills += 0.5 * (Math.random() - 0.5);
          }

          choices.push({
            timestamp,
            sum: parseFloat(Math.max(0, 10 * chills).toFixed(2)),
            count: Math.ceil(chills) + Math.ceil(2 * Math.random() - 0.5),
          });
        }

        time = new Date(startTime);
        time.setSeconds(time.getSeconds() + 5);
        let isChilled = true;
        let lastChoice = 0;
        while (time.valueOf() < Date.parse(endTime)) {
          if (!isChilled && Math.random() < 0.25) {
            isChilled = true;
          }

          let choice = !isChilled
            ? 0
            : Math.min(1, Math.max(0, lastChoice + 0.5 * (Math.random() - 0.5)));

          choice = parseFloat(choice.toFixed(2));

          if (choice < 0.2 && choice < lastChoice) {
            lastChoice = 0;
            isChilled = false;
          }
          if (!isChilled) {
            time.setSeconds(time.getSeconds() + 5);
            continue;
          }

          storeActions.push(
            sendChoice({
              choice,
              choiceType: CHOICE_CHILLS,
              timestamp: time.toISOString(),
            })
          );
          lastChoice = choice;
          time.setMilliseconds(time.getMilliseconds() + 200);
        }
      });

    return { eventData, storeActions };
  },
  [STAGE_WAITING]: () => ({}),
};

export default stageId => {
  const { eventData, ...stageData } = STAGE_DATA[stageId]();
  return {
    eventData: {
      stageId,
      ...eventData,
    },
    ...stageData,
  };
};
