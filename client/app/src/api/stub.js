import { sendChoice } from '../state/actions';
import { swatchColors } from '../constants/Colors';
import { CHOICE_COLOR } from '../constants/Choices';

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
      },
      {
        displayName: 'Color Song 2',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 28)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 25)).toISOString(),
      },
      {
        displayName: 'Color Song 3',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 22)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 19)).toISOString(),
      },
      {
        displayName: 'Color Song 4',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 16)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 13)).toISOString(),
      },
      {
        displayName: 'Synesthesia Song',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 10)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 7)).toISOString(),
      },
      {
        displayName: 'Chills Song',
        startTime: new Date(new Date().setMinutes(now.getMinutes() - 4)).toISOString(),
        endTime: new Date(new Date().setMinutes(now.getMinutes() - 1)).toISOString(),
      },
    ],
    colors: [],
    chills: [],
  };
  const storeActions = [];

  eventData.songs.slice(0, -1).forEach(({ startTime, endTime }) => {
    let time = new Date(startTime);

    while (time.valueOf() < Date.parse(endTime)) {
      time.setSeconds(time.getSeconds() + 20);
      const timestamp = time.toISOString();

      eventData.colors.push({
        timestamp,
        choices: colors.reduce(
          (choices, color) =>
            Object.assign(choices, { [color.hex]: Math.floor(Math.random() * 25) }),
          {}
        ),
      });

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

  const [{ startTime, endTime }] = eventData.songs.slice(-1);
  let time = new Date(startTime);
  let isChilled = false;

  while (time.valueOf() < Date.parse(endTime)) {
    time.setSeconds(time.getSeconds() + 5);
    const timestamp = time.toISOString();

    let { chills = 0 } = eventData.chills.slice(-1)[0] || {};
    if (chills < 0.5) {
      chills += Math.random() * 0.1;
    } else {
      chills += 0.5 * (Math.random() - 0.5);
    }

    eventData.chills.push({
      timestamp,
      sum: parseFloat(Math.max(0, chills).toFixed(2)),
      count: Math.ceil(chills) + Math.ceil(Math.random() * 4),
    });
  }

  return { eventData, storeActions };
};

const STAGE_END = generateStageEnd();

export default { STAGE_END };
