import React, { Component } from 'react';
import CountDown from 'react-native-countdown-component';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { CONCERT_START_TIME } from 'react-native-dotenv';
import { Auth } from 'aws-amplify';

import WaitingScreen from './Waiting';
import { store, actions } from '../state';
import concertApi from '../api/concertApi';
import COLORS from '../constants/Colors';
import { STAGE_WAITING } from '../constants/Stages';

const START_TIME = isNaN(parseInt(CONCERT_START_TIME, 10))
  ? CONCERT_START_TIME
  : new Date(Date.now() + parseInt(CONCERT_START_TIME, 10)).toISOString();

export default class WelcomeScreen extends Component {
  handleFinish = async () => {
    // Async update, timers in CountDown must clear before unmount
    await Promise.resolve();
    this.forceUpdate();
  };

  handleConnect = async () => {
    const idToken = (await Auth.currentSession()).getIdToken();
    concertApi.connect(idToken.getJwtToken());
    store.dispatch(actions.setUID(idToken.payload['cognito:username']));
  };

  handleDisconnect = async () => {
    concertApi.disconnect();
    await Auth.signOut();
    this.props.navigation.state.params.onStateChange('signIn');
  };

  render() {
    const { headerText, messageText, stageId } = this.props.navigation.state.params || {};
    const isCountdown = !!CONCERT_START_TIME && !concertApi.isConnected();
    const until = (Date.parse(START_TIME) - Date.now()) / 1000;
    const isCountdownComplete = isCountdown && until <= 0;

    return (
      <WaitingScreen
        headerText={headerText}
        messageText={!messageText && isCountdown ? '' : messageText}>
        {isCountdown &&
          (isCountdownComplete ? (
            <Button
              title="CONNECT"
              onPress={this.handleConnect}
              buttonStyle={styles.buttonConnect}
            />
          ) : (
            <CountDown
              digitStyle={styles.countdownDigit}
              onFinish={this.handleFinish}
              size={24}
              timeLabelStyle={styles.countdownLabel}
              until={until}
            />
          ))}
        {(isCountdown || stageId === STAGE_WAITING) && (
          <Button
            title="SIGNOUT"
            onPress={this.handleDisconnect}
            buttonStyle={styles.buttonDisconnect}
          />
        )}
      </WaitingScreen>
    );
  }
}

const styles = EStyleSheet.create({
  buttonConnect: {
    backgroundColor: COLORS.primaryOrange,
  },
  buttonDisconnect: {
    marginTop: 24,
    backgroundColor: COLORS.primaryBlue,
  },
  countdownDigit: {
    backgroundColor: COLORS.primaryOrange,
  },
  countdownLabel: {
    color: 'white',
  },
});
