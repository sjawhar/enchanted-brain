import React, { Component } from 'react';
import { View, Text, Animated, PanResponder, PixelRatio } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import Constants from 'expo-constants';
import Layout from '../constants/Layout';

const INPUT_HEIGHT = Layout.window.height - Constants.statusBarHeight;
const INPUT_BUFFER = 25;

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

    this.setState(({ touches }) => ({
      touches: [
        ...touches,
        { choice: Math.max(0, 1 - locationY / INPUT_HEIGHT), timestamp: pollTime },
      ],
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
        <Animated.View style={styles.waveformContainer}>
          {this.state.touches.slice(-INPUT_BUFFER).map(({ timestamp, choice }) => (
            <View
              key={timestamp}
              style={[styles.waveform, { height: `${Math.ceil(100 * choice)}%` }]}
            />
          ))}
        </Animated.View>
        <View style={styles.inputContainer}>
          <View {...this._panResponder.panHandlers} style={styles.input} />
          <Text style={styles.instruction}>High</Text>
          <Text style={styles.instruction}>Touch and drag to indicate chills</Text>
          <Text style={styles.instruction}>Low</Text>
        </View>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    width: '100%',
    height: INPUT_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  waveformContainer: {
    backgroundColor: 'black',
    width: '67%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  waveform: {
    borderTopColor: 'red',
    borderTopWidth: 2 * PixelRatio.get(),
    width: `${100 / INPUT_BUFFER}%`,
  },
  inputContainer: {
    width: '33%',
    backgroundColor: 'red',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  input: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: '100%',
    zIndex: 999,
  },
  instruction: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChillsScreen;
