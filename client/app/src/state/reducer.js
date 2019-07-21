import * as actionTypes from './actionTypes';

const INITIAL_STATE = {
  choiceType: '',
  choiceInverted: null,
  uid: null,
};

const reducer = (state = INITIAL_STATE, action) => {
  const { type } = action;
  switch (type) {
    case actionTypes.SET_CHOICE_TYPE: {
      return { ...state, choiceType: action.payload.choiceType };
    }
    case actionTypes.SET_CHOICE_INVERTED: {
      return { ...state, choiceInverted: action.payload.choiceInverted };
    }
    case actionTypes.SET_UID: {
      return { ...state, uid: action.payload.uid };
    }
    default: {
      return { ...state };
    }
  }
};

export default reducer;