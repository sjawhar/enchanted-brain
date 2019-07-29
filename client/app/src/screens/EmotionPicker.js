import React, { Component } from 'react';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'expo-constants';

import EmotionButton from '../features/emotions/EmotionButton';
import Layout from '../constants/Layout';
import { CHOICE_EMOTION_ENERGY, CHOICE_EMOTION_HAPPINESS } from '../constants/Choices';

const EMOTIONS = {
  [CHOICE_EMOTION_ENERGY]: {
    header: 'Energetic/Calm',
    emotions: ['Very energetic', 'Somewhat energetic', 'Neutral', 'Somewhat calm', 'Very calm'],
  },
  [CHOICE_EMOTION_HAPPINESS]: {
    header: 'Happy/Sad',
    emotions: ['Very happy', 'Somewhat happy', 'Neutral', 'Somewhat sad', 'Very sad'],
  },
};

const { window } = Layout;
const WINDOW_HEIGHT = window.height;

class EmotionPicker extends Component {
  render() {
    let { header, emotions } = EMOTIONS[this.props.choiceType];
    const offset = Math.floor(emotions.length / 2);
    let direction = -1;
    if (this.props.choiceInverted) {
      emotions = emotions.slice().reverse();
      direction = 1;
    }

    return (
      <View style={styles.container}>
        <View style={styles.emotionChoiceColumn}>
          <Text style={styles.columnTitle}>{header}</Text>
          {emotions.map((text, index) => (
            <EmotionButton
              key={text}
              title={text}
              onPress={() => this.props.onChoice(direction * (index - offset))}
            />
          ))}
        </View>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    width: '100%',
    height: WINDOW_HEIGHT - Constants.statusBarHeight,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  emotionChoiceColumn: {
    alignItems: 'center',
    padding: '0.20rem',
  },
  columnTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
});

export default EmotionPicker;
