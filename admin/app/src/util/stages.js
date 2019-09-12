const STAGE_DATA = [
  () => ({
    stageId: 'STAGE_CHOICE_IMAGERY',
    formUrl: 'https://ucsf.co1.qualtrics.com/jfe/form/SV_eEBoIQ1RAp6UxdH'
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Fantasia on a Theme by Thomas Tallis',
    startTime: startTime.toISOString(),
    endTime: new Date(startTime.valueOf() + 2 * 60 * 1000).toISOString(),
    choiceTypes: ['CHOICE_COLOR'],
    interval: 20,
    timeout: 5
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Two Elegiac Melodies',
    startTime: startTime.toISOString(),
    endTime: new Date(startTime.valueOf() + 2 * 60 * 1000).toISOString(),
    choiceTypes: ['CHOICE_COLOR'],
    interval: 20,
    timeout: 5
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Symphony No. 7 - 4th Movement',
    startTime: startTime.toISOString(),
    endTime: new Date(startTime.valueOf() + 2 * 60 * 1000).toISOString(),
    choiceTypes: ['CHOICE_COLOR'],
    interval: 20,
    timeout: 5
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Chamber Symphony',
    startTime: startTime.toISOString(),
    endTime: new Date(startTime.valueOf() + 3 * 60 * 1000).toISOString(),
    choiceTypes: ['CHOICE_COLOR'],
    interval: 20,
    timeout: 5
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_SYNESTHESIA',
    displayName: 'Coriolan Overture',
    startTime: startTime.toISOString(),
    endTime: new Date(startTime.valueOf() + 2 * 60 * 1000).toISOString(),
    choiceTypes: [
      'CHOICE_COLOR',
      'CHOICE_EMOTION_HAPPINESS',
      'CHOICE_EMOTION_ANGER'
    ],
    interval: 20,
    timeout: 5
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_CHILLS',
    displayName: 'Adagio for Strings',
    startTime: new Date(startTime.valueOf() + 5000).toISOString(),
    endTime: new Date(startTime.valueOf() + 2 * 60 * 1000).toISOString(),
    interval: 0.2
  }),
  startTime => ({
    stageId: 'STAGE_CHOICE_CHILLS',
    displayName: 'The Four Seasons - Summer',
    startTime: new Date(startTime.valueOf() + 5000).toISOString(),
    endTime: new Date(startTime.valueOf() + 2 * 60 * 1000).toISOString(),
    interval: 0.2
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
