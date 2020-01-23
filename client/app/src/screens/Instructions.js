import React, { Component } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';

import { loadMusic, playMusic } from '../services/musicPlayer';
import COLORS from '../constants/Colors';
import WaitingScreen from './Waiting';

import {
  CHOICE_CHILLS,
  CHOICE_COLOR,
  CHOICE_EMOTION_ANGER,
  CHOICE_EMOTION_HAPPINESS,
} from '../constants/Choices';

import {
  MESSAGE_INSTRUCTION_CHILLS,
  MESSAGE_INSTRUCTION_EMOTION,
  MESSAGE_INSTRUCTION_COLOR,
} from '../constants/Messages';

export default class InstructionsScreen extends Component {
  state = {
    isSongLoaded: false,
    isSongPlaying: false,
    isError: false,
  };

  componentDidMount() {
    this.loadSong();
  }

  loadSong = async () => {
    try {
      await loadMusic(this.props.navigation.state.params.songId);
      this.setState({ isSongLoaded: true });
    } catch (error) {
      console.error(error);
      this.setState({ isError: true });
    }
  };

  startSong = async () => {
    const { params } = this.props.navigation.state;
    this.setState({ isSongPlaying: true });
    try {
      const songDuration = await playMusic();
      const startTime = new Date();
      this.props.navigation.navigate({
        routeName: params.choiceType === CHOICE_CHILLS ? 'Chills' : 'Synesthesia',
        params: {
          ...params,
          startTime: startTime.toISOString(),
          endTime: new Date(startTime.valueOf() + songDuration).toISOString(),
        },
      });
    } catch (error) {
      console.error(error);
      this.setState({ isSongPlaying: false });
    }
  };

  getInstructionMessage = () => {
    switch (this.props.navigation.state.params.choiceType) {
      case CHOICE_EMOTION_ANGER:
        return MESSAGE_INSTRUCTION_EMOTION;
      case CHOICE_EMOTION_HAPPINESS:
        return MESSAGE_INSTRUCTION_EMOTION;
      case CHOICE_COLOR:
        return MESSAGE_INSTRUCTION_COLOR;
      case CHOICE_CHILLS:
        return MESSAGE_INSTRUCTION_CHILLS;
      default:
        throw new Error(`Unknown choice type ${this.props.navigation.state.params.choiceType}`);
    }
  };

  render() {
    const { isSongPlaying, isSongLoaded } = this.state;
    return (
      <WaitingScreen messageText={this.getInstructionMessage()}>
        {isSongLoaded ? (
          <Button
            disabled={isSongPlaying}
            buttonStyle={styles.button}
            title="BEGIN"
            onPress={this.startSong}
          />
        ) : this.state.isError ? (
          <Text style={styles.errorText}>An error has occurred. Please try again.</Text>
        ) : (
          <ActivityIndicator size="large" color="white" style={styles.loader} />
        )}
      </WaitingScreen>
    );
  }
}

const styles = EStyleSheet.create({
  button: {
    alignContent: 'center',
    marginTop: 24,
    backgroundColor: COLORS.primaryOrange,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    color: 'white',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
  },
});
