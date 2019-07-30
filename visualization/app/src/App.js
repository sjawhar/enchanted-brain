import React, { Component } from 'react';
import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import concertApi from './util/concertApi';
import amplifyConfig from './config/amplify';

Amplify.configure(amplifyConfig);

const BUFFER_RING_SIZE = 50;

class App extends Component {
  constructor(props) {
    super(props);
    const state = {
      CHOICE_EMOTION_HAPPINESS: {
        buffer: Array(BUFFER_RING_SIZE),
        index: 0
      },
      CHOICE_EMOTION_ENERGY: {
        buffer: Array(BUFFER_RING_SIZE),
        index: 0
      },
      CHOICE_COLOR: {
        buffer: Array(BUFFER_RING_SIZE),
        index: 0
      }
    };
    state.buffers = [
      state['CHOICE_EMOTION_HAPPINESS'].buffer,
      state['CHOICE_EMOTION_ENERGY'].buffer,
      state['CHOICE_COLOR'].buffer
    ];
    this.state = state;
    concertApi.on('CHOICE_MADE', this.handleChoiceMade);
  }

  async componentDidMount() {
    const idToken = (await Auth.currentSession()).getIdToken();
    concertApi.connect(idToken.getJwtToken());
  }

  componentWillUnmount() {
    concertApi.disconnect();
  }

  handleChoiceMade = ({ choiceType, choice }) => {
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

export default withAuthenticator(App, true);
