import React, { Component } from 'react';
import { Vibration } from 'react-native';

import EmotionPicker from './EmotionPicker';
import WaitingScreen from './Waiting';
import HexagonGrid from '../features/colors/HexagonGrid';
import { store, actions } from '../state';
import { VIBRATION_PATTERN } from '../config';
import { CHOICE_COLOR } from '../constants/Choices';
import {
  MESSAGE_INSTRUCTION_COLOR,
  MESSAGE_INSTRUCTION_EMOTION,
  MESSAGE_RESPONSE_MISSED_BODY,
  MESSAGE_RESPONSE_MISSED_HEADER,
  MESSAGE_RESPONSE_RECORDED_BODY,
  MESSAGE_RESPONSE_RECORDED_HEADER,
  MESSAGE_STAGE_COMPLETE_BODY,
  MESSAGE_STAGE_COMPLETE_HEADER,
} from '../constants/Messages';

const TIME_INSTRUCTIONS = 3000;

export default class SynesthsiaScreen extends Component {
  state = {
    isShowPrompt: false,
    timeoutId: undefined,
    waitingHeader: MESSAGE_STAGE_COMPLETE_HEADER,
    waitingMessage: MESSAGE_RESPONSE_RECORDED_BODY,
  };

  componentDidMount() {
    this.scheduleNextPrompt();
  }

  componentWillUnmount() {
    const { timeoutId } = this.state;
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }

  scheduleNextPrompt = () => {
    const { startTime, endTime, interval } = this.props.navigation.state.params;
    const { timestamp: lastTimestamp } = this.state;
    let timestamp = lastTimestamp || Date.parse(startTime);

    const now = Date.now();
    while (timestamp < now) {
      timestamp += interval * 1000;
    }

    if (timestamp > Date.parse(endTime)) {
      this.props.navigation.navigate({
        routeName: 'Welcome',
        params: {
          headerText: MESSAGE_STAGE_COMPLETE_HEADER,
          messageText: MESSAGE_STAGE_COMPLETE_BODY,
        },
      });
      return;
    }

    this.setState({
      timeoutId: setTimeout(
        () => this.showInstruction(timestamp),
        Math.max(0, timestamp - Date.now() - TIME_INSTRUCTIONS)
      ),
      timestamp,
    });
  };

  showInstruction = timestamp => {
    Vibration.vibrate(VIBRATION_PATTERN);
    this.setState({
      waitingHeader: '',
      waitingMessage:
        this.props.navigation.state.params.choiceType === CHOICE_COLOR
          ? MESSAGE_INSTRUCTION_COLOR
          : MESSAGE_INSTRUCTION_EMOTION,
      timeoutId: setTimeout(this.showPrompt, timestamp - Date.now()),
    });
  };

  showPrompt = () => {
    this.setState({
      isShowPrompt: true,
      timeoutId: setTimeout(this.handleChoice, this.props.navigation.state.params.timeout * 1000),
    });
  };

  handleChoice = (event = {}) => {
    const { choice, choiceType } = event;
    const isChoice = choice !== undefined;
    if (!isChoice && !this.state.isShowPrompt) {
      return;
    }

    this.setState({
      isShowPrompt: false,
      waitingHeader: isChoice ? MESSAGE_RESPONSE_RECORDED_HEADER : MESSAGE_RESPONSE_MISSED_HEADER,
      waitingMessage: isChoice ? MESSAGE_RESPONSE_RECORDED_BODY : MESSAGE_RESPONSE_MISSED_BODY,
    });
    Vibration.cancel();

    if (isChoice) {
      store.dispatch(
        actions.sendChoice({
          choiceType,
          choice,
          timestamp: new Date(this.state.timestamp).toISOString(),
        })
      );
    }

    this.scheduleNextPrompt();
  };

  render() {
    const { choiceType, choiceInverted } = this.props.navigation.state.params;
    const { isShowPrompt, waitingHeader, waitingMessage } = this.state;
    const handleChoice = choice => this.handleChoice({ choice, choiceType });

    if (!isShowPrompt) {
      return <WaitingScreen headerText={waitingHeader} messageText={waitingMessage} />;
    } else if (choiceType === CHOICE_COLOR) {
      return <HexagonGrid onChoice={handleChoice} />;
    }
    return (
      <EmotionPicker
        onChoice={handleChoice}
        choiceType={choiceType}
        choiceInverted={choiceInverted}
      />
    );
  }
}
