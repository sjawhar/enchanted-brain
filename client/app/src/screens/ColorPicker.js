import React, { Component } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import Constants from 'expo-constants';
import EStyleSheet from 'react-native-extended-stylesheet';

import HexagonGrid from '../features/colors/HexagonGrid';
import concertApi from '../api/concertApi';
import Layout from '../constants/Layout';

const { window } = Layout;
const WINDOW_HEIGHT = window.height;

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
    return (
      <View style={styles.container}>
        {this.state.prompt ? (
          <HexagonGrid onChoice={this.handleChoice} />
        ) : (
          <View>
            <Text style={styles.headerText}>Get Enchanted</Text>
            <Text style={styles.messageText}>
              Please listen to the music and wait for the next prompt.
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  messageText: {
    fontSize: '1rem',
    textAlign: 'center',
  },
});

export default ColorsScreen;
