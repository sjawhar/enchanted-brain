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

export { setChoiceType, setChoiceInverted };
