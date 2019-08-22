import React, { Component } from 'react';
import { SafeAreaView, Text } from 'react-native';
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet';

import { COLOR_BACKGROUND_DARK } from '../constants/Colors';
import { MESSAGE_WELCOME_BODY, MESSAGE_WELCOME_HEADER } from '../constants/Messages';

class WaitingScreen extends Component {
  static propTypes = {
    headerText: PropTypes.string,
    messageText: PropTypes.string,
  };

  static defaultProps = {
    headerText: MESSAGE_WELCOME_HEADER,
    messageText: MESSAGE_WELCOME_BODY,
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerText}>{this.props.headerText}</Text>
        <Text style={styles.messageText}>{this.props.messageText}</Text>
      </SafeAreaView>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_BACKGROUND_DARK,
    paddingHorizontal: 13,
  },
  headerText: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
    color: 'white',
  },
  messageText: {
    fontSize: '1rem',
    textAlign: 'center',
    color: 'white',
  },
});

export default WaitingScreen;
