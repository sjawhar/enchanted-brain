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

export default class ThankYouScreen extends Component {
  state = {
    uuid: null,
  };

  async componentWillMount() {
    const id = uuidv4();
    this.setState({ uuid: id });

    const { songId, choiceType, choiceInverted, interval, timeout } = this.props.navigation.state;

    const { demographics, choices } = store.getState();

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
        choices,
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
