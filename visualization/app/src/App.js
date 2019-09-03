import React, { Component } from 'react';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import concertApi from './util/concertApi';
import { Chills, Colors, Synesthesia } from './components';
import amplifyConfig from './config/amplify';
import { CONNECTED, EVENT_STAGE_CHANGED } from './constants/Events';

Amplify.configure(amplifyConfig);

class App extends Component {
  state = {
    Component: null,
  };

  componentDidMount() {
    concertApi.connect();
    concertApi.on(CONNECTED, this.handleStageChanged);
    concertApi.on(EVENT_STAGE_CHANGED, this.handleStageChanged);
  }

  componentWillUnmount() {
    concertApi.removeListener(CONNECTED, this.handleStageChanged);
    concertApi.removeListener(EVENT_STAGE_CHANGED, this.handleStageChanged);
    concertApi.disconnect();
  }

  handleStageChanged = eventData => {
    const { stageId, choiceTypes } = eventData;
    const Component = (() => {
      switch (stageId) {
        case 'STAGE_CHOICE_SYNESTHESIA':
          if (choiceTypes && choiceTypes.length > 1) {
            return Synesthesia;
          }
          return Colors;
        case 'STAGE_END':
          return Chills;
        default:
          return null;
      }
    })();
    if (Component) {
      this.setState({ Component, eventData });
    }
  };

  render() {
    const { Component, eventData } = this.state;
    if (!Component) {
      return <div style={styles.notConnected}>Collecting data...</div>;
    }
    return <Component {...eventData} />;
  }
}

const styles = {
  notConnected: {
    height: '100vh',
    widht: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
  },
};

export default withAuthenticator(App, {
  includeGreetings: process.env.REACT_APP_AMPLIFY_INCLUDE_GREETING === 'true',
});
