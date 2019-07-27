import * as actionTypes from './actionTypes';

const setChoiceType = choiceType => ({
  type: actionTypes.SET_CHOICE_TYPE,
  payload: {
    choiceType,
  },
});

const setChoiceInverted = choiceInverted => ({
  type: actionTypes.SET_CHOICE_INVERTED,
  payload: {
    choiceInverted,
  },
});

const setUID = uid => ({
  type: actionTypes.SET_UID,
  payload: {
    uid,
  },
});

export { setChoiceType, setChoiceInverted, setUID };
