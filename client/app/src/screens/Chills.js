import React, { Component } from 'react';
import { View, Text, Animated, PanResponder, InteractionManager } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'expo-constants';

import { store, actions } from '../state';
import WaitingScreen from './Waiting';
import COLORS, { COLOR_BACKGROUND_DARK } from '../constants/Colors';
import { CHOICE_CHILLS } from '../constants/Choices';
import Layout from '../constants/Layout';
import {
  MESSAGE_INSTRUCTION_CHILLS,
  MESSAGE_STAGE_COMPLETE_BODY,
  MESSAGE_STAGE_COMPLETE_HEADER,
} from '../constants/Messages';

const VIEW_HEIGHT = Layout.window.height - Constants.statusBarHeight;
const INPUT_HEIGHT = 0.8 * VIEW_HEIGHT;
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

  componentDidMount() {
    this.scheduleRecording(this.props.navigation.state.params);
  }

  componentWillUnmount() {
    const { songTimeoutId } = this.state;
    if (songTimeoutId) {
      clearTimeout(songTimeoutId);
    }
  }

  scheduleRecording = ({ startTime, endTime }) => {
    const startDelay = Date.parse(startTime) - Date.now();
    this.setState({
      songTimeoutId: setTimeout(
        () => this.setState({ isShowPrompt: true }),
        Math.max(startDelay, 0)
      ),
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
    const waitingTime = ttl - Date.now();
    if (waitingTime <= 1) {
      const { songTimeoutId } = this.state;
      InteractionManager.runAfterInteractions(() => {
        if (!songTimeoutId) {
          return;
        }
        this.setState({ songTimeoutId: undefined });
        fn(args);
      });
      return;
    }
    const afterTime = Math.min(waitingTime, MAX_TIMER_DURATION_MS);
    this.setState({
      songTimeoutId: setTimeout(() => this.scheduleEndRecording(fn, ttl, args), afterTime),
    });
  };

  _onPanResponderGrant = event => {
    this.setState({
      touches: [],
      opacity: new Animated.Value(1),
    });
    this._onPanResponderMove(event);
  };

  _onPanResponderMove = ({ timeStamp, nativeEvent: { pageY } }) => {
    this.registerChoice({
      choice: Math.min(Math.max(1 - (pageY - Constants.statusBarHeight) / INPUT_HEIGHT, 0), 1),
      timestamp: this.roundTime(timeStamp),
      source: 'touch',
    });
  };

  _onPanResponderRelease = () => {
    const { touches, panTimeoutId } = this.state;
    if (panTimeoutId) {
      clearTimeout(panTimeoutId);
    }
    this.setState({ nextPollTime: undefined });
    this.sendTouches(touches);
    Animated.timing(this.state.opacity, {
      toValue: 0,
      duration: 500,
    }).start();
  };

  registerChoice = ({ choice, timestamp }) => {
    const { nextPollTime: pollTime = timestamp, panTimeoutId } = this.state;
    if (timestamp < pollTime) {
      return;
    }
    if (panTimeoutId) {
      clearTimeout(panTimeoutId);
    }

    let nextPollTime = pollTime;
    const now = Date.now();
    while (nextPollTime <= now) {
      nextPollTime += this.interval;
    }
    nextPollTime = this.roundTime(nextPollTime);

    this.setState(
      ({ touches }) => ({
        nextPollTime,
        offset: new Animated.Value(-WAVEFORM_SIZE),
        panTimeoutId: setTimeout(
          () => this.registerChoice({ choice, timestamp: nextPollTime }),
          0.5 * this.interval + nextPollTime - Date.now()
        ),
        touches: [
          ...touches,
          {
            choice,
            timestamp: pollTime,
          },
        ],
      }),
      () =>
        Animated.timing(this.state.offset, {
          toValue: 0,
          duration: this.interval,
        }).start()
    );
  };

  roundTime = time => time - (time % this.interval);

  sendTouches = touches => {
    const maxIndex = touches.length - 1;
    const filtered = touches
      .map(({ choice, ...touch }) => ({
        choice: parseFloat(choice).toFixed(2),
        ...touch,
      }))
      .filter(({ choice }, index) => {
        // Remove zeros that aren't bordering a non-zero value
        // So that we don't send a long string of zeros
        if (choice > 0) {
          return true;
        } else if (maxIndex === 0) {
          return true;
        } else if (index > 0 && touches[index - 1].choice > 0) {
          return true;
        } else if (index < maxIndex && touches[index + 1].choice > 0) {
          return true;
        }
        return false;
      });

    filtered.forEach(({ timestamp, choice }) =>
      store.dispatch(
        actions.sendChoice({
          choice,
          choiceType: CHOICE_CHILLS,
          timestamp: new Date(timestamp).toISOString(),
        })
      )
    );
  };

  render() {
    const { isShowPrompt, touches, opacity, offset } = this.state;
    if (!isShowPrompt) {
      return <WaitingScreen headerText={''} messageText={MESSAGE_INSTRUCTION_CHILLS} />;
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
                  top: (1 - choice) * INPUT_HEIGHT,
                  right: Animated.add(index * WAVEFORM_SIZE, offset),
                }}
              />
            ))}
        </View>
        <View style={styles.rightBar}>
          <View {...this._panResponder.panHandlers} style={styles.input} />
          <View style={styles.scaleContainer}>
            <Text style={{ marginTop: 10, ...styles.instruction }}>High</Text>
            <Text style={styles.instruction}>Touch and drag to indicate chills</Text>
            <Text style={{ marginBottom: 10, ...styles.instruction }}>Low</Text>
          </View>
          <View style={styles.noneZone}>
            <Text style={styles.instruction}>None</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    width: '100%',
    height: VIEW_HEIGHT,
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
    marginTop: -WAVEFORM_SIZE / 2,
    borderRadius: WAVEFORM_SIZE,
  },
  rightBar: {
    width: Layout.window.width - WAVEFORM_WIDTH,
    backgroundColor: COLORS.primaryOrange,
    flexDirection: 'column',
  },
  scaleContainer: {
    height: INPUT_HEIGHT,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  input: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: VIEW_HEIGHT,
    width: '100%',
    zIndex: 999,
  },
  noneZone: {
    backgroundColor: COLORS.primaryBlue,
    height: VIEW_HEIGHT - INPUT_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChillsScreen;
