import React, { Component } from 'react';
import {
  MTURK_CHOICE_INTERVAL,
  MTURK_CHOICE_TIMEOUT,
  MTURK_CHOICE_TYPE,
  MTURK_SONG_ID,
} from 'react-native-dotenv';

import SignUp, { STEP_DEMOGRAPHICS } from '../components/SignUp';
import { store, actions } from '../state';

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
        onEnd: () =>
          this.props.navigation.navigate({
            routeName: 'ThankYou',
            params,
          }),
      },
    });
  };

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

export default SignUpScreen;
