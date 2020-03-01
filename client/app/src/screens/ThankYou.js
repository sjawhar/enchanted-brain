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
import { getChoiceKey } from '../constants/Choices';

export default class ThankYouScreen extends Component {
  state = {
    token: null,
  };

  async componentWillMount() {
    const token = uuidv4();
    this.setState({ token });

    const {
      songId,
      choiceType,
      choiceInverted,
      interval,
      timeout,
    } = this.props.navigation.state.params;

    const { demographics } = store.getState();

    const fetchParams = [
      MTURK_API_URL,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${MTURK_APP_SECRET}`,
        },
        body: JSON.stringify({
          id: token,
          songId,
          choiceType,
          choiceInverted,
          interval,
          timeout,
          demographics,
          choices: this.getChoices(),
        }),
      },
    ];

    if (MTURK_API_STUB === 'true') {
      console.debug('FETCH params:', ...fetchParams);
      return;
    }

    try {
      const response = await fetch(...fetchParams);
      if (!response.ok) {
        throw response;
      }
    } catch (error) {
      console.debug('FETCH error:', error);
    }
  }

  getChoices() {
    const choiceKey = getChoiceKey(this.props.navigation.state.params.choiceType);
    return Object.values(store.getState().choices[choiceKey])
      .map(({ choice, songPosition }) => ({
        choice,
        songPosition,
      }))
      .sort((a, b) => a.songPosition - b.songPosition);
  }

  render() {
    const { token } = this.state;
    return (
      <WaitingScreen headerText={MESSAGE_THANK_YOU_HEADER} messageText={MESSAGE_THANK_YOU_BODY}>
        <View>
          <Text style={styles.idText}>{token}</Text>
          <Button
            buttonStyle={styles.button}
            title="COPY TO CLIPBOARD"
            onPress={() => Clipboard.setString(token)}
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
