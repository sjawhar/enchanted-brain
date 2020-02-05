import React, { Component } from 'react';
import { View, Text, Animated, PanResponder } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'expo-constants';

import { store, actions } from '../state';
import WaitingScreen from './Waiting';
import { getClockOffset } from '../config';
import COLORS, { COLOR_BACKGROUND_DARK } from '../constants/Colors';
import { CHOICE_CHILLS } from '../constants/Choices';
import Layout from '../constants/Layout';
import { stopMusic } from '../services/musicPlayer';
import { MESSAGE_INSTRUCTION_CHILLS } from '../constants/Messages';

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
      isEnded: false,
      isShowPrompt: false,
      isTouching: false,
      touches: [],
    };

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
    stopMusic();
    const { panTimeoutId, songTimeoutId } = this.state;
    if (panTimeoutId) {
      clearTimeout(panTimeoutId);
    }
    if (songTimeoutId) {
      clearTimeout(songTimeoutId);
    }
  }

  scheduleRecording = ({ startTime, endTime }) => {
    const now = Date.now() + this.clockOffset;
    if (Date.parse(endTime) > now) {
      this.setState({
        songTimeoutId: setTimeout(
          () => this.setState({ isShowPrompt: true }),
          Math.max(Date.parse(startTime) - now, 0)
        ),
      });
    }

    this.scheduleEndRecording();
  };

  // https://github.com/facebook/react-native/issues/12981#issuecomment-499827072
  scheduleEndRecording = () => {
    const waitingTime =
      Date.parse(this.props.navigation.state.params.endTime) - (Date.now() + this.clockOffset);
    if (waitingTime <= 1) {
      this.setState({ songTimeoutId: null, isEnded: true }, () =>
        this.props.navigation.state.params.onEnd()
      );
      return;
    }
    this.setState({
      songTimeoutId: setTimeout(
        this.scheduleEndRecording,
        Math.min(waitingTime, MAX_TIMER_DURATION_MS)
      ),
    });
  };

  _onPanResponderGrant = event => {
    if (this.state.isEnded) {
      return;
    }
    event.persist();
    this.setState({ isTouching: true }, () => this._onPanResponderMove(event));
  };

  _onPanResponderMove = ({ timeStamp, nativeEvent: { pageY } }) => {
    this.registerChoice({
      choice: Math.min(Math.max(1 - (pageY - Constants.statusBarHeight) / INPUT_HEIGHT, 0), 1),
      timestamp: this.roundTime(timeStamp + this.clockOffset),
    });
  };

  _onPanResponderRelease = () => !this.state.isEnded && this.setState({ isTouching: false });

  getInterval = () => this.props.navigation.state.params.interval * 1000;

  registerChoice = ({ choice: rawChoice, timestamp }) => {
    const { nextPollTime: pollTime = timestamp, panTimeoutId, isEnded, isTouching } = this.state;
    if (isEnded || timestamp < pollTime) {
      return;
    }
    if (panTimeoutId) {
      clearTimeout(panTimeoutId);
    }

    let nextPollTime = pollTime;
    const now = Date.now() + this.clockOffset;
    const interval = this.getInterval();
    do {
      nextPollTime += interval;
    } while (nextPollTime <= now);
    nextPollTime = this.roundTime(nextPollTime);

    const choice = isTouching ? rawChoice : 0;
    timestamp = pollTime;
    this.sendTouch({ choice, timestamp });
    this.setState(
      ({ touches }) => ({
        nextPollTime,
        offset: new Animated.Value(-WAVEFORM_SIZE),
        panTimeoutId: setTimeout(
          () => this.registerChoice({ choice, timestamp: nextPollTime }),
          0.5 * interval + nextPollTime - (Date.now() + this.clockOffset)
        ),
        touches: [{ choice, timestamp }].concat(touches.slice(0, INPUT_BUFFER - 1)),
      }),
      () =>
        Animated.timing(this.state.offset, {
          toValue: 0,
          duration: interval,
        }).start()
    );
  };

  roundTime = time => time - (time % this.getInterval());

  sendTouch = ({ timestamp, choice }) =>
    store.dispatch(
      actions.sendChoice({
        choice: parseFloat(parseFloat(choice).toFixed(2)),
        choiceType: CHOICE_CHILLS,
        timestamp: new Date(timestamp).toISOString(),
      })
    );

  render() {
    const { isEnded, isShowPrompt, touches, offset } = this.state;
    if (!isShowPrompt) {
      return <WaitingScreen headerText={''} messageText={MESSAGE_INSTRUCTION_CHILLS} />;
    }
    return (
      <View style={styles.container}>
        <View style={styles.waveformContainer}>
          {isEnded ? (
            <Text style={styles.endText}>Please release your finger</Text>
          ) : (
            touches.map(({ timestamp, choice }, index) => (
              <Animated.View
                key={timestamp}
                style={{
                  ...styles.waveform,
                  top: (1 - choice) * INPUT_HEIGHT,
                  right: Animated.add(index * WAVEFORM_SIZE, offset),
                }}
              />
            ))
          )}
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    position: 'absolute',
    backgroundColor: COLORS.primaryOrange,
    width: WAVEFORM_SIZE,
    height: WAVEFORM_SIZE,
    marginTop: -WAVEFORM_SIZE / 2,
    borderRadius: WAVEFORM_SIZE,
  },
  endText: {
    fontSize: 21,
    fontWeight: 'bold',
    color: 'white',
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
