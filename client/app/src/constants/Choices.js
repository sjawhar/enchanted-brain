export const CHOICE_CHILLS = 'CHOICE_CHILLS';
export const CHOICE_COLOR = 'CHOICE_COLOR';
export const CHOICE_EMOTION_ANGER = 'CHOICE_EMOTION_ANGER';
export const CHOICE_EMOTION_HAPPINESS = 'CHOICE_EMOTION_HAPPINESS';
export const CHOICE_MENTAL_IMAGERY = 'CHOICE_MENTAL_IMAGERY';

export const CHOICE_KEY_CHILLS = 'chills';
export const CHOICE_KEY_COLOR = 'colors';
export const CHOICE_KEY_EMOTION = 'emotions';

export const getChoiceKey = choiceType => {
  switch (choiceType) {
    case CHOICE_CHILLS:
      return CHOICE_KEY_CHILLS;
    case CHOICE_COLOR:
      return CHOICE_KEY_COLOR;
    case CHOICE_EMOTION_HAPPINESS:
    case CHOICE_EMOTION_ANGER:
      return CHOICE_KEY_EMOTION;
    default:
      throw new Error(`Unknown choice type ${choiceType}`);
  }
};
