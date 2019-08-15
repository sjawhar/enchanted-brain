import React, { Component } from 'react';
import { View, Text, Animated, PanResponder } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import Constants from 'expo-constants';
import Layout from '../constants/Layout';

const WINDOW_HEIGHT = Layout.window.height;

class ChillsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      touches: [],
    };

    this.interval = this.props.navigation.state.params.interval * 1000;

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this._onPanResponderGrant,
      onPanResponderMove: this._onPanResponderMove,
      onPanResponderRelease: this._onPanResponderRelease,
      onPanResponderTerminate: this._onPanResponderRelease,
    });
  }

  _onPanResponderGrant = event => {
    this.setState({ touches: [] });
    this._onPanResponderMove(event);
  };

  _onPanResponderMove = ({ timeStamp, nativeEvent: { locationY } }) => {
    const { nextPollTime: pollTime = this.roundTime(timeStamp) } = this.state;
    if (timeStamp < pollTime) {
      return;
    }

    let nextPollTime = pollTime;
    const now = Date.now();
    while (nextPollTime <= now) {
      nextPollTime += this.interval;
    }

    // TODO: Scale locationY to 0-1
    this.setState(({ touches }) => ({
      touches: [...touches, { choice: locationY, timestamp: pollTime }],
      nextPollTime: this.roundTime(nextPollTime),
    }));
  };

  _onPanResponderRelease = () => {
    const { touches } = this.state;
    this.setState({ nextPollTime: undefined });
    this.sendTouches(touches);
  };

  roundTime = time => this.interval * Math.floor(time / this.interval);

  sendTouches = touches => {
    console.log('SENDING', touches);
  };

  render() {
    return (
      <View style={styles.container}>
        <Animated.View style={styles.waveform}>
          {this.state.touches.slice(-25).map(touch => (
            <Text key={touch.timestamp}>{touch.choice}</Text>
          ))}
        </Animated.View>
        <View {...this._panResponder.panHandlers} style={styles.input} />
        <View style={styles.instructions}>
          <Text>Instructions here</Text>
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  waveform: {
    backgroundColor: 'black',
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  input: {
    width: '25%',
    backgroundColor: 'red',
  },
  instructions: {
    width: '25%',
  },
});

export default ChillsScreen;
