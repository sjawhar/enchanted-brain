import React, { Component } from 'react';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'expo-constants';

import EmotionButton from '../features/emotions/EmotionButton';
import Layout from '../constants/Layout';

const { window } = Layout;
const WINDOW_HEIGHT = window.height;

class EmotionPicker extends Component {
  state = {
    selected: {
      'angry-calm': '',
      'happy-sad': '',
    },
  };

  _handleEmotionPress = (choice, spectrum) => () => {
    if (choice === this.state.selected[spectrum]) {
      this.setState({
        selected: {
          ...this.state.selected,
          [spectrum]: '',
        },
      });
    } else {
      this.setState({
        selected: {
          ...this.state.selected,
          [spectrum]: choice,
        },
      });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.emotionChoiceColumn}>
          <Text style={styles.columnTitle}>Angry/Calm</Text>
          <EmotionButton
            title="Very angry"
            onPress={this._handleEmotionPress('Very angry', 'angry-calm')}
            buttonStyle={this.state.selected['angry-calm'] === 'Very angry' && styles.selected}
          />
          <EmotionButton
            title="Somewhat angry"
            onPress={this._handleEmotionPress('Somewhat angry', 'angry-calm')}
            buttonStyle={this.state.selected['angry-calm'] === 'Somewhat angry' && styles.selected}
          />
          <EmotionButton
            title="Neutral"
            onPress={this._handleEmotionPress('Neutral', 'angry-calm')}
            buttonStyle={this.state.selected['angry-calm'] === 'Neutral' && styles.selected}
          />
          <EmotionButton
            title="Somewhat calm"
            onPress={this._handleEmotionPress('Somewhat calm', 'angry-calm')}
            buttonStyle={this.state.selected['angry-calm'] === 'Somewhat calm' && styles.selected}
          />
          <EmotionButton
            title="Very calm"
            onPress={this._handleEmotionPress('Very calm', 'angry-calm')}
            buttonStyle={this.state.selected['angry-calm'] === 'Very calm' && styles.selected}
          />
        </View>
        <View style={styles.emotionChoiceColumn}>
          <Text style={styles.columnTitle}>Happy/Sad</Text>
          <EmotionButton
            title="Very happy"
            onPress={this._handleEmotionPress('Very happy', 'happy-sad')}
            buttonStyle={this.state.selected['happy-sad'] === 'Very happy' && styles.selected}
          />
          <EmotionButton
            title="Somewhat happy"
            onPress={this._handleEmotionPress('Somewhat happy', 'happy-sad')}
            buttonStyle={this.state.selected['happy-sad'] === 'Somewhat happy' && styles.selected}
          />
          <EmotionButton
            title="Neutral"
            onPress={this._handleEmotionPress('Neutral', 'happy-sad')}
            buttonStyle={this.state.selected['happy-sad'] === 'Neutral' && styles.selected}
          />
          <EmotionButton
            title="Somewhat sad"
            onPress={this._handleEmotionPress('Somewhat sad', 'happy-sad')}
            buttonStyle={this.state.selected['happy-sad'] === 'Somewhat sad' && styles.selected}
          />
          <EmotionButton
            title="Very sad"
            onPress={this._handleEmotionPress('Very sad', 'happy-sad')}
            buttonStyle={this.state.selected['happy-sad'] === 'Very sad' && styles.selected}
          />
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
  selected: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export default EmotionPicker;
