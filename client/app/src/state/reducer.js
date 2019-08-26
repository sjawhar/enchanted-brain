import { SEND_CHOICE, SET_CHOICE_TYPE, SET_CHOICE_INVERTED, SET_UID } from './actions';
import {
  CHOICE_CHILLS,
  CHOICE_COLOR,
  CHOICE_EMOTION_ANGER,
  CHOICE_EMOTION_HAPPINESS,
} from '../constants/Choices';

const INITIAL_STATE = () => ({
  choices: {
    colors: [],
    emotions: [],
    chills: [],
  },
  choiceType: CHOICE_COLOR,
  choiceInverted: false,
  uid: null,
});

const reducer = (state, action) => {
  if (!state) {
    state = INITIAL_STATE();
  }
  const { type, payload } = action;
  switch (type) {
    case SEND_CHOICE: {
      const { choices, ...otherState } = state;
      const { choiceType } = payload.choice;
      switch (choiceType) {
        case CHOICE_CHILLS:
          choices.chills.push(payload.choice);
          break;
        case CHOICE_COLOR:
          choices.colors.push(payload.choice);
          break;
        case CHOICE_EMOTION_HAPPINESS:
        case CHOICE_EMOTION_ANGER:
          choices.emotions.push(payload.choice);
          break;
        default:
          throw new Error(`Unknown choice type ${choiceType}`);
      }
      return { choices, ...otherState };
    }
    case SET_CHOICE_TYPE: {
      return { ...state, choiceType: payload.choiceType };
    }
    case SET_CHOICE_INVERTED: {
      return { ...state, choiceInverted: payload.choiceInverted };
    }
    case SET_UID: {
      return { ...state, uid: payload.uid };
    }
    default: {
      return { ...state };
    }
  }
};

export default reducer;
