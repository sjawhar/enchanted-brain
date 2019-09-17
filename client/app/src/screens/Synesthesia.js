import React, { Component } from 'react';
import { InteractionManager, Vibration } from 'react-native';

import EmotionPicker from './EmotionPicker';
import WaitingScreen from './Waiting';
import HexagonGrid from '../features/colors/HexagonGrid';
import { store, actions } from '../state';
import { getClockOffset, VIBRATION_PATTERN } from '../config';
import { CHOICE_COLOR } from '../constants/Choices';
import {
  MESSAGE_INSTRUCTION_COLOR,
  MESSAGE_INSTRUCTION_EMOTION,
  MESSAGE_RESPONSE_MISSED_BODY,
  MESSAGE_RESPONSE_MISSED_HEADER,
  MESSAGE_RESPONSE_RECORDED_BODY,
  MESSAGE_RESPONSE_RECORDED_HEADER,
  MESSAGE_STAGE_COMPLETE_BODY,
  MESSAGE_STAGE_COMPLETE_HEADER,
} from '../constants/Messages';

const TIME_INSTRUCTIONS = 3 * 1000;
const MAX_TIMER_DURATION_MS = 60 * 1000;

export default class SynesthsiaScreen extends Component {
  state = {
    isShowPrompt: false,
    promptTimeoutId: null,
    songTimeoutId: null,
    waitingHeader: MESSAGE_STAGE_COMPLETE_HEADER,
    waitingMessage: MESSAGE_RESPONSE_RECORDED_BODY,
  };

  async componentDidMount() {
    this.clockOffset = await getClockOffset();
    this.scheduleNextPrompt();
    this.scheduleEndRecording();
  }

  componentWillUnmount() {
    const { promptTimeoutId, songTimeoutId } = this.state;
    if (promptTimeoutId) {
      clearTimeout(promptTimeoutId);
    }
    if (songTimeoutId) {
      clearTimeout(songTimeoutId);
    }
  }

  scheduleEndRecording = () => {
    const waitingTime =
      Date.parse(this.props.navigation.state.params.endTime) - (Date.now() + this.clockOffset);
    if (waitingTime > 1) {
      this.setState({
        songTimeoutId: setTimeout(
          this.scheduleEndRecording,
          Math.min(waitingTime, MAX_TIMER_DURATION_MS)
        ),
      });
      return;
    }
    InteractionManager.runAfterInteractions(() =>
      this.props.navigation.navigate({
        routeName: 'Welcome',
        params: {
          headerText: MESSAGE_STAGE_COMPLETE_HEADER,
          messageText: MESSAGE_STAGE_COMPLETE_BODY,
        },
      })
    );
  };

  scheduleNextPrompt = () => {
    const { startTime, endTime, interval: intervalSeconds, timeout } = this.props.navigation.state.params;
    const { timestamp: lastTimestamp } = this.state;

    const interval = intervalSeconds * 1000;
    let timestamp = lastTimestamp || (Date.parse(startTime) + interval);
    const now = Date.now() + this.clockOffset;
    while (timestamp < now) {
      timestamp += interval;
    }

    const endTimeMs = Date.parse(endTime);
    if (timestamp > endTimeMs) {
      return;
    } else if (timestamp + timeout * 1000 > endTimeMs) {
      timestamp = endTimeMs - timeout * 1000;
    }

    this.setState({
      promptTimeoutId: setTimeout(
        () => this.showInstruction(timestamp),
        Math.max(0, timestamp - (Date.now() + this.clockOffset) - TIME_INSTRUCTIONS)
      ),
      timestamp,
    });
  };

  showInstruction = timestamp => {
    Vibration.vibrate(VIBRATION_PATTERN);
    this.setState({
      waitingHeader: '',
      waitingMessage:
        this.props.navigation.state.params.choiceType === CHOICE_COLOR
          ? MESSAGE_INSTRUCTION_COLOR
          : MESSAGE_INSTRUCTION_EMOTION,
      promptTimeoutId: setTimeout(this.showPrompt, timestamp - (Date.now() + this.clockOffset)),
    });
  };

  showPrompt = () => {
    this.setState({
      isShowPrompt: true,
      promptTimeoutId: setTimeout(
        this.handleChoice,
        this.props.navigation.state.params.timeout * 1000
      ),
    });
  };

  handleChoice = (event = {}) => {
    const { choice, choiceType } = event;
    const isChoice = choice !== undefined;
    if (!isChoice && !this.state.isShowPrompt) {
      return;
    }

    this.setState({
      isShowPrompt: false,
      waitingHeader: isChoice ? MESSAGE_RESPONSE_RECORDED_HEADER : MESSAGE_RESPONSE_MISSED_HEADER,
      waitingMessage: isChoice ? MESSAGE_RESPONSE_RECORDED_BODY : MESSAGE_RESPONSE_MISSED_BODY,
    });
    Vibration.cancel();

    if (isChoice) {
      store.dispatch(
        actions.sendChoice({
          choiceType,
          choice,
          timestamp: new Date(this.state.timestamp).toISOString(),
        })
      );
    }

    this.scheduleNextPrompt();
  };

  render() {
    const { choiceType, choiceInverted } = this.props.navigation.state.params;
    const { isShowPrompt, waitingHeader, waitingMessage } = this.state;
    const handleChoice = choice => this.handleChoice({ choice, choiceType });

    if (!isShowPrompt) {
      return <WaitingScreen headerText={waitingHeader} messageText={waitingMessage} />;
    } else if (choiceType === CHOICE_COLOR) {
      return <HexagonGrid onChoice={handleChoice} />;
    }
    return (
      <EmotionPicker
        onChoice={handleChoice}
        choiceType={choiceType}
        choiceInverted={choiceInverted}
      />
    );
  }
}
