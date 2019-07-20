import actionTypes from './actionTypes';

const setChoiceType = choiceType => dispatch => {
  dispatch({
    type: actionTypes.SET_CHOICE_TYPE,
    payload: {
      choiceType,
    },
  });
};

const setChoiceInverted = choiceInverted => dispatch => {
  dispatch({
    type: actionTypes.SET_CHOICE_INVERTED,
    payload: {
      choiceInverted,
    },
  });
};

export default {
  setChoiceType,
  setChoiceInverted,
};
