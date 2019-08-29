import React, { Component } from 'react';
import CountDown from 'react-native-countdown-component';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { CONCERT_START_TIME } from 'react-native-dotenv';

import WaitingScreen from './Waiting';
import COLORS from '../constants/Colors';
import { STAGE_WAITING } from '../constants/Stages';

const START_TIME = isNaN(Number(CONCERT_START_TIME))
  ? CONCERT_START_TIME
  : new Date(Date.now() + Number(CONCERT_START_TIME)).toISOString();

export default class WelcomeScreen extends Component {
  handleFinish = async () => {
    // Async update, timers in CountDown must clear before unmount
    await Promise.resolve();
    this.forceUpdate();
  };

  render() {
    const { headerText, messageText, stageId, isConnected, onConnect, onDisconnect } =
      this.props.navigation.state.params || {};
    const isCountdown = !!CONCERT_START_TIME && !isConnected;
    const until = (Date.parse(START_TIME) - Date.now()) / 1000;
    const isCountdownComplete = isCountdown && until <= 0;

    return (
      <WaitingScreen
        headerText={headerText}
        messageText={!messageText && isCountdown ? '' : messageText}>
        {isCountdown &&
          (isCountdownComplete ? (
            <Button title="CONNECT" onPress={onConnect} buttonStyle={styles.buttonConnect} />
          ) : (
            <CountDown
              digitStyle={styles.countdownDigit}
              digitTxtStyle={styles.countdownDigitText}
              onFinish={this.handleFinish}
              size={24}
              timeLabelStyle={styles.countdownLabel}
              until={until}
            />
          ))}
        {(isCountdown || stageId === STAGE_WAITING) && (
          <Button title="SIGN OUT" onPress={onDisconnect} buttonStyle={styles.buttonDisconnect} />
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
  countdownDigitText: {
    color: 'white',
  },
  countdownLabel: {
    color: 'white',
  },
});
