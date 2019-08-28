import React, { Component } from 'react';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'expo-constants';

import EmotionButton from '../features/emotions/EmotionButton';
import COLORS, { COLOR_BACKGROUND_DARK } from '../constants/Colors';
import Layout from '../constants/Layout';
import { CHOICE_EMOTION_ANGER, CHOICE_EMOTION_HAPPINESS } from '../constants/Choices';

const EMOTIONS = {
  [CHOICE_EMOTION_ANGER]: ['Angry', 'Calm'],
  [CHOICE_EMOTION_HAPPINESS]: ['Happy', 'Sad'],
};
const INTENSITIES = ['Very', 'Somewhat'];
const INTENSITY_NEUTRAL = 'Neutral';

const { window } = Layout;
const WINDOW_HEIGHT = window.height;

class EmotionPicker extends Component {
  render() {
    let emotions = EMOTIONS[this.props.choiceType];
    let direction = 1;
    if (this.props.choiceInverted) {
      emotions = emotions.slice().reverse();
      direction = -1;
    }

    const intensities = INTENSITIES.map(
      intensity => `${intensity} ${emotions[0].toLowerCase()}`
    ).concat(
      [INTENSITY_NEUTRAL],
      INTENSITIES.slice()
        .reverse()
        .map(intensity => `${intensity} ${emotions[1].toLowerCase()}`)
    );

    const offset = Math.floor(intensities.length / 2);
    return (
      <View style={styles.container}>
        <View style={styles.emotionChoiceColumn}>
          <Text style={styles.columnTitle}>{emotions.join('/')}</Text>
          {intensities.map((text, index) => (
            <EmotionButton
              key={text}
              title={text}
              buttonStyle={styles.buttonStyle}
              onPress={() => this.props.onChoice(direction * (offset - index))}
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
    backgroundColor: COLOR_BACKGROUND_DARK,
  },
  emotionChoiceColumn: {
    alignItems: 'center',
    padding: '0.20rem',
  },
  columnTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'white',
  },
  buttonStyle: {
    backgroundColor: COLORS.primaryOrange,
    borderColor: 'white',
  },
});

export default EmotionPicker;
