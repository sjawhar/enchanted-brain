import { AMPLIFY_AUTH_DISABLE } from 'react-native-dotenv';
import concertApi from '../api/concertApi';
import { CHOICE_CHILLS } from '../constants/Choices';
import { CHOICE_MADE } from '../constants/Events';

export const SEND_CHOICE = 'SEND_CHOICE';
export const sendChoice = choice => {
  // doesn't send if MTURK
  if (
    AMPLIFY_AUTH_DISABLE !== 'true' &&
    !(choice.choiceType === CHOICE_CHILLS && choice.choice === 0)
  ) {
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

export const SET_CHOICE_INVERTED = 'SET_CHOICE_INVERTED';
export const setChoiceInverted = choiceInverted => ({
  type: SET_CHOICE_INVERTED,
  payload: {
    choiceInverted,
  },
});

export const SET_CHOICE_TYPE = 'SET_CHOICE_TYPE';
export const setChoiceType = choiceType => ({
  type: SET_CHOICE_TYPE,
  payload: {
    choiceType,
  },
});

export const SET_DEMOGRAPHICS = 'SET_DEMOGRAPHICS';
export const setDemographics = demographics => ({
  type: SET_DEMOGRAPHICS,
  payload: { demographics },
});

export const SET_LANGUAGE = 'SET_LANGUAGE';
export const setLanguage = language => ({
  type: SET_LANGUAGE,
  payload: { language },
});

export const SET_UID = 'SET_UID';
export const setUID = uid => ({
  type: SET_UID,
  payload: {
    uid,
  },
});
