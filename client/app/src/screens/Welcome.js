import React, { Component } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Auth } from 'aws-amplify';

import { actions } from '../state';
import concertApi from '../api/concertApi';

class WelcomeScreen extends Component {
  constructor(props) {
    super(props);
    const { setUID } = this.props;
    Auth.currentSession().then(session => {
      const idToken = session.getIdToken();
      concertApi.connect(idToken.getJwtToken());
      setUID(idToken.payload['cognito:username']);
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.welcomeText}>Welcome to the Enchanted Brain Concert!</Text>
        <Text style={styles.messageText}>
          Please listen to the concert and wait to be prompted for a response.
        </Text>
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
  welcomeText: {
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

export default connect(
  null,
  { setUID: actions.setUID }
)(WelcomeScreen);
