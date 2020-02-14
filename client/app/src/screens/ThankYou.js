import React, { Component } from 'react';
import { Button, Text } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import uuidv4 from 'uuid/v4';
import { Clipboard, View } from 'react-native';

import { MTURK_API_URL, MTURK_API_STUB, MTURK_APP_SECRET } from 'react-native-dotenv';
import COLORS from '../constants/Colors';
import WaitingScreen from './Waiting';
import { store } from '../state';

import { MESSAGE_THANK_YOU_HEADER, MESSAGE_THANK_YOU_BODY } from '../constants/Messages';
import {
  CHOICE_CHILLS,
  CHOICE_COLOR,
  CHOICE_EMOTION_ANGER,
  CHOICE_EMOTION_HAPPINESS,
} from '../constants/Choices';

export default class ThankYouScreen extends Component {
  state = {
    uuid: null,
  };

  async componentWillMount() {
    const id = uuidv4();
    this.setState({ uuid: id });

    const {
      songId,
      choiceType,
      choiceInverted,
      interval,
      timeout,
    } = this.props.navigation.state.params;

    const { demographics, choices } = store.getState();
    const choicesArray = this.reformatChoices(choices, choiceType);

    const fetchParams = {
      method: 'POST',
      headers: {
        authentication: 'Bearer ' + MTURK_APP_SECRET,
      },
      body: JSON.stringify({
        id,
        songId,
        choiceType,
        choiceInverted,
        interval,
        timeout,
        demographics,
        choices: choicesArray,
      }),
    };

    if (MTURK_API_STUB === 'true') {
      console.debug('FETCH params:', fetchParams);
      return;
    }

    try {
      const response = await fetch(MTURK_API_URL, fetchParams);
      if (!response.ok) {
        throw response;
      }
    } catch (error) {
      console.debug('FETCH error:', error);
    }
  }

  reformatChoices(choicesBefore, choiceType) {
    let choicesWithinType;

    switch (choiceType) {
      case CHOICE_CHILLS:
        choicesWithinType = choicesBefore['chills'];
        break;
      case CHOICE_COLOR:
        choicesWithinType = choicesBefore['colors'];
        break;
      case CHOICE_EMOTION_HAPPINESS:
      case CHOICE_EMOTION_ANGER:
        choicesWithinType = choicesBefore['emotions'];
        break;
      default:
        throw new Error(`Unknown choice type ${choiceType}`);
    }

    const choicesAfter = [];

    for (let [key, value] of Object.entries(choicesWithinType)) {
      choicesAfter.push({ timestamp: key, choice: value.choice });
    }

    return choicesAfter;
  }

  copyToClipboard = async () => {
    await Clipboard.setString(this.state.uuid);
  };

  render() {
    const id = this.state.uuid;
    return (
      <WaitingScreen headerText={MESSAGE_THANK_YOU_HEADER} messageText={MESSAGE_THANK_YOU_BODY}>
        <View>
          <Text style={styles.idText}>{id}</Text>
          <Button
            buttonStyle={styles.button}
            title="COPY TO CLIPBOARD"
            onPress={this.copyToClipboard}
          />
        </View>
      </WaitingScreen>
    );
  }
}

const styles = EStyleSheet.create({
  button: {
    alignContent: 'center',
    marginTop: 24,
    backgroundColor: COLORS.primaryOrange,
  },
  idText: {
    marginTop: 12,
    color: 'white',
  },
});
