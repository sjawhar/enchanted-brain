import React, { Component } from 'react';
import { Vibration } from 'react-native';

import EmotionPicker from './EmotionPicker';
import WaitingScreen from './Waiting';
import HexagonGrid from '../features/colors/HexagonGrid';
import { store, actions } from '../state;';
import { VIBRATION_PATTERN } from '../config';
import { CHOICE_COLOR } from '../constants/Choices';

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
      interval,
      timeout,
      choiceType,
      choiceInverted,
    } = props.navigation.state.params;

    this.state = {
      choiceInverted,
      choiceType,
      endTime,
      interval: interval * 1000,
      isShowPrompt: false,
      startTime,
      timeout: timeout * 1000,
      timeoutId: undefined,
      waitingHeader: MESSAGE_COMPLETE_HEADER,
      waitingMessage: MESSAGE_WAITING_BODY,
    };
  }

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
    const { timestamp: lastTimestamp, endTime, interval, startTime } = this.state;
    let timestamp = lastTimestamp || Date.parse(startTime);

    const now = Date.now();
    while (timestamp < now) {
      timestamp += interval;
    }

    if (timestamp > Date.parse(endTime)) {
      this.props.navigation.navigate({
        routeName: 'Welcome',
        params: {
          headerText: MESSAGE_COMPLETE_HEADER,
          messageText: MESSAGE_COMPLETE_BODY,
        },
      });
      return;
    }

    const timeoutId = setTimeout(this.showPrompt, timestamp - Date.now());
    this.setState({ timeoutId, timestamp });
  };

  showPrompt = () => {
    Vibration.vibrate(VIBRATION_PATTERN);
    const timeoutId = setTimeout(this.handleChoice, this.state.timeout);
    this.setState({
      isShowPrompt: true,
      timeoutId,
    });
  };

  handleChoice = choice => {
    const isChoice = choice !== undefined;
    if (!isChoice && !this.state.isShowPrompt) {
      return;
    }

    this.setState({
      isShowPrompt: false,
      waitingHeader: isChoice ? MESSAGE_WAITING_HEADER : MESSAGE_MISSED_HEADER,
    });
    Vibration.cancel();

    if (isChoice) {
      store.dispatch(
        actions.sendChoice({
          choiceType: this.state.choiceType,
          choice,
          timestamp: new Date(this.state.timestamp).toISOString(),
        })
      );
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
