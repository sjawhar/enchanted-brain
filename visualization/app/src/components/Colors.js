import React, { Component } from 'react';

import concertApi from '../util/concertApi';
import { CHOICE_COLOR } from '../constants/ChoiceTypes';
import { CHOICE_MADE } from '../constants/Events';

export default class Colors extends Component {
  state = {
    songs: [],
  };

  componentDidMount() {
    concertApi.on(CHOICE_MADE, this.handleChoiceMade);
  }

  componentWillUnmount() {
    concertApi.removeListener(CHOICE_MADE, this.handleChoiceMade);
  }

  handleChoiceMade = ({ choice, choiceType, timestamp }) => {
    if (choiceType !== CHOICE_COLOR) {
      return;
    }

    const { displayName, startTime, endTime } = this.props;
    const { songs } = this.state;
    if (!songs.find(song => song.displayName === displayName)) {
      songs.push({ displayName, startTime, endTime, choices: {} });
      songs.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    const song = songs.find(song => song.startTime <= timestamp && song.endTime >= timestamp);
    if (!song) {
      return;
    }

    song.choices[choice] = (song.choices[choice] || 0) + 1;
    this.setState({ songs });
  };

  render() {
    return (
      <div style={styles.container}>
        {this.state.songs.map(({ displayName, choices }) => {
          const [composer, songName] = displayName.split('/');
          return (
            <div key={displayName} style={styles.songContainer}>
              <div style={styles.songNameContainer}>
                <div style={styles.composerText}>{composer}</div>
                <div style={styles.songName}>{songName}</div>
              </div>
              <div style={styles.swatchesWrapper}>
                {Object.entries(choices)
                  .sort(([_, a], [__, b]) => b - a)
                  .slice(0, 3)
                  .map(([color, count]) => (
                    <div key={color} style={styles.swatchContainer}>
                      <div style={{ backgroundColor: color, ...styles.swatch }}>
                        <span style={styles.swatchCount}>{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  songContainer: {
    border: '1px solid #999',
    height: 'calc(50vh - 2px)',
    width: 'calc(50vw - 2px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  songNameContainer: {
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#222',
    padding: '8px 0px 13px',
  },
  composerText: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  songName: {
    fontSize: 34,
    margin: '5px 0px 8px',
  },
  swatchesWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  swatchContainer: {
    width: '30%',
    display: 'flex',
    flexDirection: 'column',
  },
  swatch: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchCount: {
    fontSize: 55,
    color: 'white',
    fontWeight: 'bold',
    textShadow: '2px 2px black',
  },
};
