import React, { Component } from 'react';

import Bee from './Bee';
import concertApi from '../../util/concertApi';
import {
  CHOICE_COLOR,
  CHOICE_EMOTION_ANGER,
  CHOICE_EMOTION_HAPPINESS,
} from '../../constants/ChoiceTypes';
import { CHOICE_MADE } from '../../constants/Events';

const BUFFER_RING_SIZE = parseInt(process.env.REACT_APP_BUFFER_RING_SIZE, 10);
const OFFSET_SIZE = 15;
const BEE_SIZE = 48;

const UPDATE_BATCH_SIZE = parseInt(process.env.REACT_APP_UPDATE_BATCH_SIZE, 10);
const UPDATE_TIMEOUT = parseInt(process.env.REACT_APP_UPDATE_TIMEOUT, 10);

export default class Synesthesia extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buffers: [],
      choiceCount: 0,
      minTimestamp: Date.parse(props.startTime),
      timeout: null,
    };
    [CHOICE_EMOTION_HAPPINESS, CHOICE_EMOTION_ANGER, CHOICE_COLOR].forEach(choiceType => {
      const buffer = Array(BUFFER_RING_SIZE);
      this.state[choiceType] = {
        buffer,
        index: 0,
      };
      this.state.buffers.push(buffer);
    });
  }

  componentDidMount() {
    concertApi.on(CHOICE_MADE, this.handleChoiceMade);
  }

  componentWillUnmount() {
    concertApi.removeListener(CHOICE_MADE, this.handleChoiceMade);
  }

  shouldComponentUpdate(props, { choiceCount }) {
    return choiceCount === 0;
  }

  perturb = val => 20 * (val + 2.5) + OFFSET_SIZE * (Math.random() - 0.5);

  handleChoiceMade = ({ choiceType, choice, timestamp }) => {
    if (!this.state[choiceType]) {
      return;
    } else if (Date.parse(timestamp) < this.state.minTimestamp || !this.state[choiceType]) {
      return;
    }
    this.setState(({ choiceCount, timeout, [choiceType]: { buffer, index } }) => {
      buffer[index] = choiceType === CHOICE_COLOR ? choice : this.perturb(choice);
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
          index: (index + 1) % BUFFER_RING_SIZE,
        },
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
      return { x, y, color };
    }).filter(el => el);

    return (
      <div>
        <div style={styles.axesContainer}>
          <span style={{ ...styles.axisLabel, ...styles.happy }}>Happy</span>
          <span style={{ ...styles.axisLabel, ...styles.sad }}>Sad</span>
          <span style={{ ...styles.axisLabel, ...styles.angry }}>Angry</span>
          <span style={{ ...styles.axisLabel, ...styles.calm }}>Calm</span>
          <div style={{ ...styles.axis, ...styles.axisX }} />
          <div style={{ ...styles.axis, ...styles.axisY }} />
        </div>
        <div style={styles.beesContainer}>
          {bees.map(({ x, y, color }, index) => (
            <Bee
              key={index}
              width={BEE_SIZE}
              style={{
                ...styles.bee,
                left: `${x}%`,
                top: `${y}%`,
              }}
              fill="white"
              stroke={color}
              className="jitter"
            />
          ))}
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
    zIndex: 100,
  },
  happy: {
    top: '50%',
    right: 0,
    width: '7%',
    marginTop: '-21px',
  },
  sad: {
    top: '50%',
    left: 0,
    width: '7%',
    marginTop: '-21px',
  },
  angry: {
    left: 0,
    width: '100%',
    top: 0,
    marginTop: '10px',
  },
  calm: {
    left: 0,
    width: '100%',
    bottom: 0,
    marginBottom: '10px',
  },
  axis: {
    background: '#999',
    position: 'absolute',
  },
  axisX: {
    top: '50%',
    left: '7%',
    height: '2px',
    width: '86%',
  },
  axisY: {
    top: '7%',
    left: '50%',
    height: '86%',
    width: '2px',
  },
  axisLabel: {
    color: 'white',
    fontSize: '35px',
    fontWeight: 'bold',
    padding: 0,
    position: 'absolute',
    textAlign: 'center',
  },
  beesContainer: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 150,
  },
  bee: {
    zIndex: 160,
    position: 'absolute',
    marginTop: `-${BEE_SIZE / 2}px`,
    marginLeft: `-${BEE_SIZE / 2}px`,
  },
};
