import React, { Component } from 'react';

import WaitingScreen from './Waiting';
import HexagonGrid from '../features/colors/HexagonGrid';
import concertApi from '../api/concertApi';

const MESSAGE_MISSED_HEADER = '';

const MESSAGE_WAITING_HEADER = 'Response recorded';
const MESSAGE_WAITING_BODY = 'Please continue listening to the music';

const MESSAGE_COMPLETE_HEADER = 'Get Enchanted!';
const MESSAGE_COMPLETE_BODY = 'Please enjoy the next stage of the concert!';

export default class ColorsScreen extends Component {
  constructor(props) {
    super(props);
    const { startTime, endTime, frequency, timeout } = props.navigation.state.params;

    this.state = {
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
    setTimeout(this.handleChoice, this.state.timeout);
  };

  handleChoice = color => {
    this.setState({
      isShowPrompt: false,
      waitingHeader: MESSAGE_MISSED_HEADER,
    });
    if (color) {
      this.setState({
        waitingHeader: MESSAGE_WAITING_HEADER,
      });
      concertApi.send({
        event: 'CHOICE_MADE',
        data: {
          choiceType: 'CHOICE_COLOR',
          choice: color,
          timestamp: new Date(this.state.timestamp).toISOString(),
        },
      });
    }
    this.scheduleNextPrompt();
  };

  render() {
    if (this.state.isShowPrompt) {
      return <HexagonGrid onChoice={this.handleChoice} />;
    }
    return (
      <WaitingScreen
        headerText={this.state.waitingHeader}
        messageText={this.state.waitingMessage}
      />
    );
  }
}
