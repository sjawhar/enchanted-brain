import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';

import { loadMusic, playMusic } from '../services/musicPlayer';
import COLORS from '../constants/Colors';
import Layout from '../constants/Layout';
import LANGUAGES, { LANGUAGE_EN, LANGUAGE_FR } from '../languages';
import {
  CHOICE_CHILLS,
  CHOICE_COLOR,
  CHOICE_EMOTION_ANGER,
  CHOICE_EMOTION_HAPPINESS,
} from '../constants/Choices';

import { MESSAGE_INSTRUCTION_EMOTION, MESSAGE_INSTRUCTION_CHILLS } from '../constants/Messages';

export default class InstructionsScreen extends Component {
  state = {
    songDuration: null,
    isSongLoaded: false,
    isSongPlaying: false,
  };

  componentDidMount() {
    this.loadSong();
  }

  loadSong = async () => {
    const { songId } = this.props.navigation.state.params;
    try {
      const songDuration = await loadMusic(songId);
      this.setState({ isSongLoaded: true, songDuration });
    } catch (error) {
      console.error(error);
      // TODO: Show error message
    }
  };

  startSong = async () => {
    const { params } = this.props.navigation.state;
    this.setState({ isSongPlaying: true });
    try {
      await playMusic();
      const startTime = new Date();
      this.props.navigation.navigate({
        routeName: 'Synesthesia', // TODO: Get from choiceType
        params: {
          ...params,
          startTime: startTime.toISOString(),
          endTime: new Date(startTime.valueOf() + this.state.songDuration).toISOString(),
        },
      });
    } catch (error) {
      console.error(error);
      this.setState({ isSongPlaying: false });
    }
  };

  getInstructionMessage = () => {
    const { choiceType } = this.props.navigation.state.params;
    switch (choiceType) {
      case CHOICE_EMOTION_ANGER:
        return MESSAGE_INSTRUCTION_EMOTION;
      case CHOICE_EMOTION_HAPPINESS:
        return MESSAGE_INSTRUCTION_EMOTION;
      case CHOICE_COLOR:
        return MESSAGE_INSTRUCTION_COLOR;
      case CHOICE_CHILLS:
        return MESSAGE_INSTRUCTION_CHILLS;
      default:
        throw new Error(`Unknown choice type ${choiceType}`);
    }
  };

  render() {
    const { isSongPlaying, isSongLoaded } = this.state;
    return (
      <View style={styles.container}>
        <Text>{this.getInstructionMessage()}</Text>
        {isSongLoaded ? (
          <Button
            disabled={isSongPlaying}
            buttonStyle={styles.button}
            title="Begin"
            onPress={this.startSong}
          />
        ) : (
          // TODO: Add nice loading UI
          <Text>Loading...</Text>
        )}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    // flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  button: {
    // width: '100%',
    marginTop: 24,
    backgroundColor: COLORS.primaryOrange,
  },
});
