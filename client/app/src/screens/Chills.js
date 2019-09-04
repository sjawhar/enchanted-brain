import React, { Component } from 'react';
import { View, Text, Animated, PanResponder, InteractionManager } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'expo-constants';

import { store, actions } from '../state';
import WaitingScreen from './Waiting';
import { getClockOffset } from '../config';
import COLORS, { COLOR_BACKGROUND_DARK } from '../constants/Colors';
import { CHOICE_CHILLS } from '../constants/Choices';
import Layout from '../constants/Layout';
import { MESSAGE_STAGE_COMPLETE_BODY, MESSAGE_STAGE_COMPLETE_HEADER } from '../constants/Messages';

const INPUT_HEIGHT = Layout.window.height - Constants.statusBarHeight;
const INPUT_BUFFER = 25;
const WAVEFORM_WIDTH = Math.floor(0.67 * Layout.window.width);
const WAVEFORM_SIZE = Math.floor(WAVEFORM_WIDTH / INPUT_BUFFER);

const MAX_TIMER_DURATION_MS = 60 * 1000;

class ChillsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowPrompt: false,
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

  async componentDidMount() {
    this.clockOffset = await getClockOffset();
    this.scheduleRecording(this.props.navigation.state.params);
  }

  componentWillUnmount() {
    const { timeoutId } = this.state;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  scheduleRecording = ({ startTime, endTime }) => {
    const startDelay = Date.parse(startTime) - (Date.now() + this.clockOffset);
    this.setState({
      timeoutId: setTimeout(() => this.setState({ isShowPrompt: true }), Math.max(startDelay, 0)),
    });

    this.scheduleEndRecording(this.props.navigation.navigate, Date.parse(endTime), {
      routeName: 'Welcome',
      params: {
        headerText: MESSAGE_STAGE_COMPLETE_HEADER,
        messageText: MESSAGE_STAGE_COMPLETE_BODY,
      },
    });
  };

  // https://github.com/facebook/react-native/issues/12981#issuecomment-499827072
  scheduleEndRecording = (fn, ttl, args) => {
    const waitingTime = ttl - (Date.now() + this.clockOffset);
    if (waitingTime <= 1) {
      const { timeoutId } = this.state;
      InteractionManager.runAfterInteractions(() => {
        if (!timeoutId) {
          return;
        }
        this.setState({ timeoutId: undefined });
        fn(args);
      });
      return;
    }
    const afterTime = Math.min(waitingTime, MAX_TIMER_DURATION_MS);
    this.setState({
      timeoutId: setTimeout(() => this.scheduleEndRecording(fn, ttl, args), afterTime),
    });
  };

  _onPanResponderGrant = event => {
    this.setState({
      touches: [],
      opacity: new Animated.Value(1),
    });
    this._onPanResponderMove(event);
  };

  _onPanResponderMove = ({ timeStamp, nativeEvent: { locationY } }) => {
    const { nextPollTime: pollTime = this.roundTime(timeStamp) } = this.state;
    if (timeStamp < pollTime) {
      return;
    }

    let nextPollTime = pollTime;
    const now = Date.now() + this.clockOffset;
    while (nextPollTime <= now) {
      nextPollTime += this.interval;
    }

    this.setState(
      ({ touches }) => ({
        touches: [
          ...touches,
          { choice: Math.max(0, 1 - locationY / INPUT_HEIGHT), timestamp: pollTime },
        ],
        offset: new Animated.Value(-WAVEFORM_SIZE),
        nextPollTime: this.roundTime(nextPollTime),
      }),
      () =>
        Animated.timing(this.state.offset, {
          toValue: 0,
          duration: this.interval,
        }).start()
    );
  };

  _onPanResponderRelease = () => {
    const { touches } = this.state;
    this.setState({ nextPollTime: undefined });
    this.sendTouches(touches);
    Animated.timing(this.state.opacity, {
      toValue: 0,
      duration: 500,
    }).start();
  };

  roundTime = time => time - (time % this.interval);

  sendTouches = touches =>
    touches.forEach(({ timestamp, choice }) =>
      store.dispatch(
        actions.sendChoice({
          choiceType: CHOICE_CHILLS,
          choice: parseFloat(choice.toFixed(2)),
          timestamp: new Date(timestamp).toISOString(),
        })
      )
    );

  render() {
    const { isShowPrompt, touches, opacity, offset } = this.state;
    if (!isShowPrompt) {
      return (
        <WaitingScreen
          headerText={MESSAGE_STAGE_COMPLETE_HEADER}
          messageText={MESSAGE_STAGE_COMPLETE_BODY}
        />
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.waveformContainer}>
          {touches
            .slice(-INPUT_BUFFER)
            .reverse()
            .map(({ timestamp, choice }, index) => (
              <Animated.View
                key={timestamp}
                style={{
                  ...styles.waveform,
                  opacity,
                  bottom: choice * INPUT_HEIGHT,
                  right: Animated.add(index * WAVEFORM_SIZE, offset),
                }}
              />
            ))}
        </View>
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
    backgroundColor: COLOR_BACKGROUND_DARK,
  },
  waveformContainer: {
    overflow: 'hidden',
    width: WAVEFORM_WIDTH,
  },
  waveform: {
    position: 'absolute',
    backgroundColor: COLORS.primaryOrange,
    width: WAVEFORM_SIZE,
    height: WAVEFORM_SIZE,
    marginBottom: -WAVEFORM_SIZE / 2,
    borderRadius: WAVEFORM_SIZE,
  },
  inputContainer: {
    width: Layout.window.width - WAVEFORM_WIDTH,
    backgroundColor: COLORS.primaryOrange,
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
