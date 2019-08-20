import { SEND_CHOICE, SET_CHOICE_TYPE, SET_CHOICE_INVERTED, SET_UID } from './actions';
import { CHOICE_COLOR } from '../constants/Choices';

const INITIAL_STATE = {
  choices: [],
  choiceType: CHOICE_COLOR,
  choiceInverted: false,
  uid: null,
};

const reducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case SEND_CHOICE: {
      const { choices, ...otherState } = state;
      choices.push(payload.choice);
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
