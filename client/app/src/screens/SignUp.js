import React, { Component } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import uuidv4 from 'uuid/v4';
import {
  MTURK_CHOICE_INTERVAL,
  MTURK_CHOICE_TIMEOUT,
  MTURK_CHOICE_TYPE,
  MTURK_SONG_ID,
  MTURK_API_URL,
  MTURK_API_STUB,
  MTURK_APP_SECRET
} from 'react-native-dotenv';

import SignUp, { STEP_DEMOGRAPHICS } from '../components/SignUp';
import { store, actions } from '../state';
import { COLOR_BACKGROUND_DARK } from '../constants/Colors';

class SignUpScreen extends Component {
  handleSubmit = ({ demographics }) => {
    store.dispatch(actions.setDemographics(demographics));
    const params = {
      songId: MTURK_SONG_ID,
      choiceType: MTURK_CHOICE_TYPE,
      choiceInverted: Math.random() > 0.5,
      interval: MTURK_CHOICE_INTERVAL,
      timeout: MTURK_CHOICE_TIMEOUT,
    };
    this.props.navigation.navigate({
      routeName: 'Instructions',
      params: {
        ...params,
        onEnd: this.getOnEndCallback(params),
      },
    });
  };

  getOnEndCallback = ({
    songId,
    choiceType,
    choiceInverted,
    interval,
    timeout,
  }) => () => {
    const id = uuidv4();

    this.props.navigation.navigate({
      routeName: 'Welcome',
      params: {
        headerText: "-- complete", //todo
        messageText: "-- here's the uuid: " + id, //todo. 
      },
    })

    const { demographics, choices } = store.getState();

    const fetchParams = {
      method: 'POST',
      headers: {
        authentication: "Bearer " + MTURK_APP_SECRET,
      },
      body: JSON.stringify({
        id,
        songId,
        choiceType,
        choiceInverted,
        interval,
        timeout,
        demographics,
        choices,
      }),
    }

    if (MTURK_API_STUB == "true") {
      console.log(fetchParams)
      return;
    }
    fetch(MTURK_API_URL, fetchParams);

  }

  render() {
    return (
      <SignUp
        authState="signUp"
        finalStep={STEP_DEMOGRAPHICS}
        onFinalStep={this.handleSubmit}
        requireAcceptResearch
      />
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_BACKGROUND_DARK,
    paddingHorizontal: 13,
  },
});

export default SignUpScreen;
