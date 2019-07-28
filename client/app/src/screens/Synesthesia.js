import React, { Component } from 'react';
import { Vibration } from 'react-native';

import EmotionPicker from './EmotionPicker';
import WaitingScreen from './Waiting';
import HexagonGrid from '../features/colors/HexagonGrid';
import { VIBRATION_PATTERN } from '../config';
import concertApi from '../api/concertApi';
import { CHOICE_COLOR } from '../constants/Choices';
import { CHOICE_MADE } from '../constants/Events';

const MESSAGE_MISSED_HEADER = '';

const MESSAGE_WAITING_HEADER = 'Response recorded';
const MESSAGE_WAITING_BODY = 'Please continue listening to the music';

const MESSAGE_COMPLETE_HEADER = 'Get Enchanted!';
const MESSAGE_COMPLETE_BODY = 'Please enjoy the next stage of the concert!';

export default class SynesthsiaScreen extends Component {
  constructor(props) {
    super(props);
    const {
      startTime,
      endTime,
      frequency,
      timeout,
      choiceType,
      choiceInverted,
    } = props.navigation.state.params;

    this.state = {
      choiceType,
      choiceInverted,
      endTime,
      frequency: frequency * 1000,
      isShowPrompt: false,
      startTime,
      timeout: timeout * 1000,
      waitingHeader: MESSAGE_COMPLETE_HEADER,
      waitingMessage: MESSAGE_WAITING_BODY,
    };
  }

  componentDidMount() {
    this.scheduleNextPrompt();
  }

  scheduleNextPrompt = () => {
    const { timestamp: lastTimestamp, endTime, frequency, startTime } = this.state;
    let timestamp = lastTimestamp || Date.parse(startTime);

    const now = Date.now();
    while (timestamp < now) {
      timestamp += frequency;
    }

    if (timestamp > Date.parse(endTime)) {
      this.setState({
        waitingHeader: MESSAGE_COMPLETE_HEADER,
        waitingMessage: MESSAGE_COMPLETE_BODY,
      });
      return;
    }

    this.setState({ timestamp });
    setTimeout(this.showPrompt, timestamp - Date.now());
  };

  showPrompt = () => {
    this.setState({ isShowPrompt: true });
    Vibration.vibrate(VIBRATION_PATTERN);
    setTimeout(this.handleChoice, this.state.timeout);
  };

  handleChoice = choice => {
    if (choice === undefined && !this.state.isShowPrompt) {
      return;
    }

    this.setState({
      isShowPrompt: false,
      waitingHeader: choice ? MESSAGE_WAITING_HEADER : MESSAGE_MISSED_HEADER,
    });
    Vibration.cancel();

    if (choice !== undefined) {
      concertApi.send({
        event: CHOICE_MADE,
        data: {
          choiceType: this.state.choiceType,
          choice,
          timestamp: new Date(this.state.timestamp).toISOString(),
        },
      });
    }

    this.scheduleNextPrompt();
  };

  render() {
    const { choiceInverted, choiceType, isShowPrompt, waitingHeader, waitingMessage } = this.state;
    if (!isShowPrompt) {
      return <WaitingScreen headerText={waitingHeader} messageText={waitingMessage} />;
    } else if (choiceType === CHOICE_COLOR) {
      return <HexagonGrid onChoice={this.handleChoice} />;
    }
    return (
      <EmotionPicker
        onChoice={this.handleChoice}
        choiceType={choiceType}
        choiceInverted={choiceInverted}
      />
    );
  }
}
