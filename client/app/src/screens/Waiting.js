import React, { Component } from 'react';
import { SafeAreaView, Text } from 'react-native';
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet';

class WaitingScreen extends Component {
  static propTypes = {
    headerText: PropTypes.string,
    messageText: PropTypes.string,
  };

  static defaultProps = {
    headerText: 'Welcome to the Enchanted Brain Concert!',
    messageText: 'Please listen to the concert and wait to be prompted for a response.',
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
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  messageText: {
    fontSize: '1rem',
    textAlign: 'center',
  },
});

export default WaitingScreen;
