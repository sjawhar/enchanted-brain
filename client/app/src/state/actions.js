import concertApi from '../api/concertApi';
import { CHOICE_MADE } from '../constants/Events';

export const SEND_CHOICE = 'SEND_CHOICE';
export const sendChoice = choice => {
  if (choice.choice > 0) {
    concertApi.send({
      event: CHOICE_MADE,
      data: choice,
    });
  }
  return {
    type: SEND_CHOICE,
    payload: { choice },
  };
};

export const SET_CHOICE_TYPE = 'SET_CHOICE_TYPE';
export const setChoiceType = choiceType => ({
  type: SET_CHOICE_TYPE,
  payload: {
    choiceType,
  },
});

export const SET_CHOICE_INVERTED = 'SET_CHOICE_INVERTED';
export const setChoiceInverted = choiceInverted => ({
  type: SET_CHOICE_INVERTED,
  payload: {
    choiceInverted,
  },
});

export const SET_UID = 'SET_UID';
export const setUID = uid => ({
  type: SET_UID,
  payload: {
    uid,
  },
});
