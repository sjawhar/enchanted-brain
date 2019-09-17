import React, { Component } from 'react';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import concertApi from './util/concertApi';
import { getStageData } from './util/stages';
import amplifyConfig from './config/amplify';

import './App.css';

Amplify.configure(amplifyConfig);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      stageNumber: 0,
      lastReceived: null
    };
    concertApi.on('CONNECTED', this.handleConnected);
    concertApi.on('EVENT_STAGE_CHANGED', this.handleStageChanged);
  }

  async componentDidMount() {
    concertApi.connect();
  }

  componentWillUnmount() {
    concertApi.removeListener('CONNECTED', this.handleConnected);
    concertApi.removeListener('EVENT_STAGE_CHANGED', this.handleStageChanged);
    concertApi.disconnect();
    this.setState({ isConnected: false });
  }

  getNextStage = () => {
    const { stageNumber } = this.state;
    return { stageNumber, data: getStageData(stageNumber) };
  };

  handleBack = () =>
    this.setState(({ stageNumber }) => ({ stageNumber: stageNumber - 1 }));

  handleConnected = () => this.setState({ isConnected: true });

  handleNextStage = () => {
    const { stageNumber, data } = this.getNextStage();
    concertApi.send({ event: 'EVENT_STAGE_CHANGED', data });
    this.setState({ stageNumber: stageNumber + 1 });
  };

  handleSkipNext = () =>
    this.setState(({ stageNumber }) => ({ stageNumber: stageNumber + 1 }));

  handleStageChanged = lastReceived => this.setState({ lastReceived });

  render() {
    const { isConnected, lastReceived } = this.state;
    return (
      <div style={styles.container}>
        {!isConnected ? (
          <div style={styles.notConnected}>Not connected</div>
        ) : (
          <React.Fragment>
            <div style={styles.codeContainer}>
              <h1>Next Stage</h1>
              <pre style={styles.code}>
                {JSON.stringify(this.getNextStage().data, null, 2)}
              </pre>
              <button onClick={this.handleNextStage}>Send Next Stage</button>
              <button onClick={this.handleBack}>Back</button>
              <button onClick={this.handleSkipNext}>Skip</button>
            </div>
            <div style={styles.codeContainer}>
              <h1>Last Received</h1>
              <pre style={styles.code}>
                {JSON.stringify(lastReceived, null, 2)}
              </pre>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    height: 'calc(100vh - 67px)'
  },
  notConnected: {
    textAlign: 'center',
    fontSize: 35,
    fontWeight: 'bold'
  },
  codeContainer: {
    flex: 1,
    padding: '0 20px'
  },
  code: {
    wordWrap: 'break-word'
  }
};

export default withAuthenticator(App, {
  includeGreetings: true,
  usernameAttributes: 'phone_number'
});
