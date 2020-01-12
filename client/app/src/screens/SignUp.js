import React, { Component } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  MTURK_CHOICE_INTERVAL,
  MTURK_CHOICE_TIMEOUT,
  MTURK_CHOICE_TYPE,
  MTURK_SONG_ID,
} from 'react-native-dotenv';

import SignUp, { STEP_DEMOGRAPHICS } from '../components/SignUp';
import { store, actions } from '../state';
import { COLOR_BACKGROUND_DARK } from '../constants/Colors';

class SignUpScreen extends Component {
  handleSubmit = ({ demographics }) => {
    store.dispatch(actions.setDemographics(demographics));
    this.props.navigation.navigate({
      routeName: 'Instructions',
      params: {
        songId: MTURK_SONG_ID,
        choiceType: MTURK_CHOICE_TYPE,
        choiceInverted: Math.random() > 0.5,
        interval: MTURK_CHOICE_INTERVAL,
        timeout: MTURK_CHOICE_TIMEOUT,
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
