import React, { Component } from 'react';
import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import concertApi from './util/concertApi';
import amplifyConfig from './config/amplify';
import CHOICE_TYPES, {
  CHOICE_COLOR,
  CHOICE_EMOTION_ENERGY,
  CHOICE_EMOTION_HAPPINESS
} from './constants/ChoiceTypes';

Amplify.configure(amplifyConfig);

const BUFFER_RING_SIZE = parseInt(process.env.REACT_APP_BUFFER_RING_SIZE, 10);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = Object.values(CHOICE_TYPES).reduce(
      (state, choiceType) =>
        Object.assign(state, {
          [choiceType]: {
            buffer: Array(BUFFER_RING_SIZE),
            index: 0
          }
        }),
      {}
    );
    this.state.buffers = [
      this.state[CHOICE_EMOTION_HAPPINESS].buffer,
      this.state[CHOICE_EMOTION_ENERGY].buffer,
      this.state[CHOICE_COLOR].buffer
    ];
    this.state.listening = false;
    this.state.minTimestamp = 0;
    concertApi.on('CONNECTED', this.handleStageChange);
    concertApi.on('EVENT_STAGE_CHANGED', this.handleStageChange);
    concertApi.on('CHOICE_MADE', this.handleChoiceMade);
  }

  async componentWillMount() {
    Object.assign(document.body.style, styles.body);
    const idToken = (await Auth.currentSession()).getIdToken();
    concertApi.connect(idToken.getJwtToken());
  }

  componentWillUnmount() {
    document.body.style.backgroundColor = null;
    concertApi.disconnect();
  }

  handleStageChange = ({ stageId, choiceTypes, startTime }) => {
    if (
      stageId === 'STAGE_CHOICE_SYNESTHESIA' &&
      choiceTypes &&
      choiceTypes.length > 1
    ) {
      this.setState({
        listening: true,
        minTimestamp: Date.parse(startTime)
      });
    }
  };

  handleChoiceMade = ({ choiceType, choice, timestamp }) => {
    if (
      !this.state.listening ||
      Date.parse(timestamp) < this.state.minTimestamp ||
      !this.state[choiceType]
    ) {
      return;
    }
    this.setState(({ [choiceType]: { buffer, index } }) => {
      buffer[index] = choice;
      return {
        [choiceType]: {
          buffer,
          index: (index + 1) % BUFFER_RING_SIZE
        }
      };
    });
  };

  render() {
    const { buffers } = this.state;
    const bees = Array.from(buffers[0], (x, index) => {
      const y = buffers[1][index];
      const color = buffers[2][index];
      if (x === undefined || y === undefined || color === undefined) {
        return null;
      }
      return { x: 50 * (x + 1), y: 50 * (y + 1), color };
    }).filter(el => el);

    return (
      <div style={styles.App}>
        {bees.map(({ x, y, color }, index) => {
          const style = {
            left: `${x}%`,
            top: `${y}%`,
            backgroundColor: color,
            ...styles.bee
          };

          return <span key={index} style={style}></span>;
        })}
      </div>
    );
  }
}

const styles = {
  body: {
    backgroundColor: 'rgb(95, 95, 95)',
    overflow: 'hidden'
  },
  App: {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  bee: {
    position: 'absolute',
    width: '50px',
    height: '50px',
    marginTop: '-25px',
    marginLeft: '-25px'
  }
};

export default withAuthenticator(App, {
  includeGreetings: process.env.REACT_APP_AMPLIFY_INCLUDE_GREETING === 'true'
});
