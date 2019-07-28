import React, { Component } from 'react';

import WelcomeScreen from './Welcome';
import HexagonGrid from '../features/colors/HexagonGrid';
import concertApi from '../api/concertApi';

class ColorsScreen extends Component {
  constructor(props) {
    super(props);
    const { startTime, endTime, frequency, timeout } = props.navigation.state.params;

    this.state = {
      endTime,
      frequency: frequency * 1000,
      prompt: false,
      startTime,
      timeout: timeout * 1000,
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
      return;
    }

    this.setState({ timestamp });
    setTimeout(this.showPrompt, timestamp - Date.now());
  };

  showPrompt = () => {
    this.setState({ prompt: true });
    setTimeout(this.handleChoice, this.state.timeout);
  };

  handleChoice = color => {
    this.setState({ prompt: false });
    if (color) {
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
    if (this.state.prompt) {
      return <HexagonGrid onChoice={this.handleChoice} />;
    }
    return <WelcomeScreen />;
  }
}

export default ColorsScreen;
