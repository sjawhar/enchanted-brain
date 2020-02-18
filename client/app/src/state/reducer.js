import {
  SEND_CHOICE,
  SET_CHOICE_TYPE,
  SET_CHOICE_INVERTED,
  SET_DEMOGRAPHICS,
  SET_LANGUAGE,
  SET_UID,
} from './actions';
import { CHOICE_COLOR, getChoiceKey } from '../constants/Choices';
import { LANGUAGE_FR } from '../languages';

const INITIAL_STATE = () => ({
  choices: {
    colors: {},
    emotions: {},
    chills: {},
  },
  choiceInverted: false,
  choiceType: CHOICE_COLOR,
  demographics: {},
  language: LANGUAGE_FR,
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
      const { timestamp, ...choice } = payload.choice;
      const choiceKey = getChoiceKey(choice.choiceType);
      choices[choiceKey][timestamp] = choice;
      return { choices, ...otherState };
    }
    case SET_CHOICE_TYPE: {
      return { ...state, choiceType: payload.choiceType };
    }
    case SET_CHOICE_INVERTED: {
      return { ...state, choiceInverted: payload.choiceInverted };
    }
    case SET_DEMOGRAPHICS: {
      return { ...state, demographics: payload.demographics };
    }
    case SET_LANGUAGE: {
      return { ...state, language: payload.language };
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
