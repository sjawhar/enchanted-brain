import React, { Component } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';

import SignUp, { STEP_DEMOGRAPHICS } from '../components/SignUp';
import { store, actions } from '../state';
import { CHOICE_EMOTION_ANGER, CHOICE_EMOTION_HAPPINESS } from '../constants/Choices';
import { COLOR_BACKGROUND_DARK } from '../constants/Colors';
import { MESSAGE_WELCOME_BODY, MESSAGE_WELCOME_HEADER } from '../constants/Messages';

class SignUpScreen extends Component {
  handleSubmit = ({ demographics }) => {
    store.dispatch(actions.setDemographics(demographics));
    // TODO: Get from MTurk
    this.props.navigation.navigate({
      routeName: 'Instructions',
      params: {
        choiceType: CHOICE_EMOTION_ANGER,
        choiceInverted: false,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 120 * 1000).toISOString(),
        interval: 20,
        timeout: 5,
      },
    });
  };

  render() {
    console.debug("SIGN UP SCREEN RENDERED")
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
