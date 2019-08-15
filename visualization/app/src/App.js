import React, { Component } from 'react';
import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import './App.css';
import concertApi from './util/concertApi';
import amplifyConfig from './config/amplify';
import Bee from './Bee';
import {
  CHOICE_COLOR,
  CHOICE_EMOTION_ANGER,
  CHOICE_EMOTION_HAPPINESS
} from './constants/ChoiceTypes';

Amplify.configure(amplifyConfig);

const BUFFER_RING_SIZE = parseInt(process.env.REACT_APP_BUFFER_RING_SIZE, 10);
const OFFSET_SIZE = 15;
const BEE_SIZE = 48;

const UPDATE_BATCH_SIZE = parseInt(process.env.REACT_APP_UPDATE_BATCH_SIZE, 10);
const UPDATE_TIMEOUT = parseInt(process.env.REACT_APP_UPDATE_TIMEOUT, 10);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      animationDelays: Array(BUFFER_RING_SIZE)
        .fill(0)
        .map(() => `${-Math.random().toFixed(2)}s`),
      buffers: [],
      choiceCount: 0,
      listening: false,
      minTimestamp: 0,
      timeout: null
    };
    [CHOICE_EMOTION_HAPPINESS, CHOICE_EMOTION_ANGER, CHOICE_COLOR].forEach(
      choiceType => {
        const buffer = Array(BUFFER_RING_SIZE);
        this.state[choiceType] = {
          buffer,
          index: 0
        };
        this.state.buffers.push(buffer);
      }
    );
    concertApi.on('CONNECTED', this.handleStageChanged);
    concertApi.on('EVENT_STAGE_CHANGED', this.handleStageChanged);
    concertApi.on('CHOICE_MADE', this.handleChoiceMade);
  }

  async componentDidMount() {
    const idToken = (await Auth.currentSession()).getIdToken();
    concertApi.connect(idToken.getJwtToken());
  }

  componentWillUnmount() {
    concertApi.disconnect();
  }

  shouldComponentUpdate(props, { choiceCount }) {
    return choiceCount === 0;
  }

  perturb = val => 20 * (val + 2.5) + OFFSET_SIZE * (Math.random() - 0.5);

  handleStageChanged = ({ stageId, choiceTypes, startTime }) => {
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
    this.setState(
      ({ choiceCount, timeout, [choiceType]: { buffer, index } }) => {
        buffer[index] =
          choiceType === CHOICE_COLOR ? choice : this.perturb(choice);
        if (timeout) {
          clearTimeout(timeout);
        }
        return {
          choiceCount: (choiceCount + 1) % UPDATE_BATCH_SIZE,
          timeout: setTimeout(() => {
            if (this.state.choiceCount === 0) {
              return;
            }
            this.setState({ choiceCount: 0 });
          }, UPDATE_TIMEOUT),
          [choiceType]: {
            buffer,
            index: (index + 1) % BUFFER_RING_SIZE
          }
        };
      }
    );
  };

  render() {
    const { animationDelays, buffers } = this.state;
    const bees = Array.from(buffers[0], (x, index) => {
      const y = buffers[1][index];
      const color = buffers[2][index];
      if (x === undefined || y === undefined || color === undefined) {
        return null;
      }
      return { x, y, color };
    }).filter(el => el);

    return (
      <div>
        <div style={styles.axesContainer}>
          <span className="axis-label" style={styles.happy}>
            Happy
          </span>
          <span className="axis-label" style={styles.sad}>
            Sad
          </span>
          <span className="axis-label" style={styles.angry}>
            Angry
          </span>
          <span className="axis-label" style={styles.calm}>
            Calm
          </span>
          <div className="axis" style={styles.axisX} />
          <div className="axis" style={styles.axisY} />
        </div>
        <div style={styles.beesContainer}>
          {bees.map(({ x, y, color }, index) => {
            const style = {
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: animationDelays[index],
            };

            return (
              <Bee
                key={index}
                width={BEE_SIZE}
                style={[style, styles.bee]}
                fill="white"
                stroke={color}
                className="jitter"
              />
            );
          })}
        </div>
      </div>
    );
  }
}

const styles = {
  axesContainer: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 100
  },
  happy: {
    top: '50%',
    right: 0,
    width: '7%',
    marginTop: '-21px'
  },
  sad: {
    top: '50%',
    left: 0,
    width: '7%',
    marginTop: '-21px'
  },
  angry: {
    left: 0,
    width: '100%',
    top: 0,
    marginTop: '10px'
  },
  calm: {
    left: 0,
    width: '100%',
    bottom: 0,
    marginBottom: '10px'
  },
  axisX: {
    top: '50%',
    left: '7%',
    height: '2px',
    width: '86%'
  },
  axisY: {
    top: '7%',
    left: '50%',
    height: '86%',
    width: '2px'
  },
  beesContainer: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 150
  },
  bee: {
    zIndex: 160,
    position: 'absolute',
    marginTop: `-${BEE_SIZE / 2}px`,
    marginLeft: `-${BEE_SIZE / 2}px`
  }
};

export default withAuthenticator(App, {
  includeGreetings: process.env.REACT_APP_AMPLIFY_INCLUDE_GREETING === 'true'
});
