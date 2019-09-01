import React, { Component } from 'react';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import concertApi from './util/concertApi';
import { Chills, Colors, Synesthesia } from './components';
import amplifyConfig from './config/amplify';

Amplify.configure(amplifyConfig);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Component: null,
    };
    concertApi.on('CONNECTED', this.handleStageChanged);
    concertApi.on('EVENT_STAGE_CHANGED', this.handleStageChanged);
  }

  async componentDidMount() {
    concertApi.connect();
  }

  componentWillUnmount() {
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
      return <div>Coming soon...</div>;
    }
    return <Component {...eventData} />;
  }
}

export default withAuthenticator(App, {
  includeGreetings: process.env.REACT_APP_AMPLIFY_INCLUDE_GREETING === 'true',
});
