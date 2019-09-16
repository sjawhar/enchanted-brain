const TIME_SECONDS = 1000;
const TIME_MINUTES = 60 * TIME_SECONDS;

const getTimes = (minutes, seconds = 0) => ({
  startTime: new Date().toISOString(),
  endTime: new Date(
    Date.now() + minutes * TIME_MINUTES + seconds * TIME_SECONDS
  ).toISOString()
});

const STAGE_DATA = [
  () => ({
    stageId: 'STAGE_CHOICE_IMAGERY',
    formUrl: 'https://ucsf.co1.qualtrics.com/jfe/form/SV_eEBoIQ1RAp6UxdH'
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Vaughan Williams/Fantasia on a Theme by Thomas Tallis/sad',
    choiceTypes: ['CHOICE_COLOR'],
    interval: 20,
    timeout: 5,
    ...getTimes(2, 51)
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Grieg/Two Elegiac Melodies/calm',
    choiceTypes: ['CHOICE_COLOR'],
    interval: 20,
    timeout: 5,
    ...getTimes(1, 52)
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Beethoven/Symphony No. 7 in A Major, Op. 92, 4th Mvt./happy',
    choiceTypes: ['CHOICE_COLOR'],
    interval: 20,
    timeout: 5,
    ...getTimes(1, 55)
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Shostakovich/Chamber Symphony, Op. 110a, 2nd Mvt./angry',
    choiceTypes: ['CHOICE_COLOR'],
    interval: 20,
    timeout: 5,
    ...getTimes(3, 12)
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Coriolan Overture',
    choiceTypes: [
      'CHOICE_COLOR',
      'CHOICE_EMOTION_HAPPINESS',
      'CHOICE_EMOTION_ANGER'
    ],
    interval: 20,
    timeout: 5,
    ...getTimes(8, 0)
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_CHILLS',
    displayName: 'Barber/Adagio for Strings',
    interval: 0.2,
    ...getTimes(5, 0)
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_CHILLS',
    displayName: 'Vivaldi/The Four Seasons - Summer (Storm)',
    interval: 0.2,
    ...getTimes(2, 59)
  }),
  () => ({
    stageId: 'STAGE_END'
  })
];

export const getStageData = stage => {
  const generator = STAGE_DATA[stage];
  if (!generator) {
    return null;
  }
  return generator(new Date());
};
