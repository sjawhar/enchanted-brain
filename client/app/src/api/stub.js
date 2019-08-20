import { swatchColors } from '../constants/Colors';
import { CHOICE_COLOR } from '../constants/Choices';

const colors = swatchColors.flat();

const now = new Date();

const STAGE_END = {
  eventData: {
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
    chills: [
      {
        timestamp: String,
        chills: Number,
      },
    ],
  },
  storeActions: [],
};

STAGE_END.eventData.songs.slice(0, -1).forEach(({ startTime, endTime }) => {
  let time = new Date(startTime);

  while (time.valueOf() < Date.parse(endTime)) {
    time.setSeconds(time.getSeconds() + 20);
    const timestamp = time.toISOString();
    STAGE_END.eventData.colors.push({
      timestamp,
      choices: colors.reduce(
        (choices, color) => Object.assign(choices, { [color.hex]: Math.floor(Math.random() * 25) }),
        {}
      ),
    });

    if (Math.random() < 0.25) {
      continue;
    }
    STAGE_END.storeActions.push({
      action: 'sendChoice',
      args: [
        {
          choice: colors[Math.floor(Math.random() * colors.length)].hex,
          choiceType: CHOICE_COLOR,
          timestamp,
        },
      ],
    });
  }
});

export default { STAGE_END };
