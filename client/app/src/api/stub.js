import { sendChoice } from '../state/actions';
import { swatchColors } from '../constants/Colors';
import { CHOICE_COLOR, CHOICE_CHILLS } from '../constants/Choices';

const colors = swatchColors.flat();
const now = new Date();

const generateStageEnd = () => {
  const eventData = {
    stageId: 'STAGE_END',
    songs: [
      {
        displayName: 'Color Song 1',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 34)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 31)).toISOString(),
        choiceType: CHOICE_COLOR,
        choices: [],
      },
      {
        displayName: 'Color Song 2',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 28)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 25)).toISOString(),
        choiceType: CHOICE_COLOR,
        choices: [],
      },
      {
        displayName: 'Color Song 3',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 22)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 19)).toISOString(),
        choiceType: CHOICE_COLOR,
        choices: [],
      },
      {
        displayName: 'Color Song 4',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 16)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 13)).toISOString(),
        choiceType: CHOICE_COLOR,
        choices: [],
      },
      {
        displayName: 'Synesthesia Song',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 10)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 7)).toISOString(),
        choiceType: CHOICE_COLOR,
        choices: [],
      },
      {
        displayName: 'Chills Song',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 4)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 1)).toISOString(),
        choiceType: CHOICE_CHILLS,
        choices: [],
      },
    ],
  };
  const storeActions = [];

  eventData.songs
    .filter(({ choiceType }) => choiceType === CHOICE_COLOR)
    .forEach(({ startTime, endTime, choices }) => {
      let time = new Date(startTime);

      while (time.valueOf() < Date.parse(endTime)) {
        time.setSeconds(time.getSeconds() + 20);
        const timestamp = time.toISOString();

        choices.push(
          colors.reduce(
            (choices, color) =>
              Object.assign(choices, { [color.hex]: Math.floor(Math.random() * 25) }),
            { timestamp }
          )
        );

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
};

const STAGE_END = generateStageEnd();

export default { STAGE_END };