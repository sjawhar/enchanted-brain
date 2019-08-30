import React, { Component } from 'react';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import concertApi from './util/concertApi';
import { getStageData } from './util/stages';
import amplifyConfig from './config/amplify';

Amplify.configure(amplifyConfig);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      stage: 0,
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
    const { stage } = this.state;
    return { stage, data: getStageData(stage) };
  };

  handleConnected = () => this.setState({ isConnected: true });

  handleNextStage = () => {
    const { stage, data } = this.getNextStage();
    concertApi.send({ event: 'EVENT_STAGE_CHANGED', data });
    this.setState({ stage: stage + 1 });
  };

  handleStageChanged = lastReceived => this.setState({ lastReceived });

  render() {
    const { isConnected, lastReceived } = this.state;

    if (!isConnected) {
      return <div>Not connected</div>;
    }
    return (
      <div style={styles.container}>
        <div style={styles.inputContainer}>
          <h1>Next Stage</h1>
          <pre>{JSON.stringify(this.getNextStage().data, null, 2)}</pre>
          <button onClick={this.handleNextStage}>Send Next Stage</button>
        </div>
        <div style={styles.outputContainer}>
          <h1>Last Received</h1>
          <pre>{JSON.stringify(lastReceived, null, 2)}</pre>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row'
  },
  inputContainer: {
    flex: 1,
    width: '50%'
  },
  outputContainer: {
    flex: 1,
    width: '50%'
  }
};

export default withAuthenticator(App, {
  includeGreetings: true
});
