import React, { Component } from 'react';

import WaitingScreen from './Waiting';

export default class WelcomeScreen extends Component {
  render() {
    const { headerText, messageText } = this.props.navigation.state.params || {};
    return <WaitingScreen headerText={headerText} messageText={messageText} />;
  }
}
