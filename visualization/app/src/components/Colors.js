import React, { Component } from 'react';

import concertApi from '../util/concertApi';
import { CHOICE_COLOR } from '../constants/ChoiceTypes';
import { CHOICE_MADE } from '../constants/Events';

export default class Colors extends Component {
  state = {
    songs: [
      {
        displayName: 'Vaughan Williams/Fantasia on a Theme by Thomas Tallis/sad',
        startTime: '2019-09-03T09:18:19.003Z',
        endTime: '2019-09-03T09:20:19.003Z',
        choices: {
          '#0000FF': 22,
          '#8080FF': 17,
          '#FFFF00': 15,
        }
      },
      {
        displayName: 'Grieg/Two Elegiac Melodies/calm',
        startTime: '2019-09-03T09:19:49.897Z',
        endTime: '2019-09-03T09:21:49.897Z',
        choices: {
          '#FFFF00': 20,
          '#00FF00': 17,
          '#8080FF': 16,
        }
      },
      {
        displayName: 'Beethoven/Symphony No. 7 in A Major, Op. 92, 4th Mvt./happy',
        startTime: '2019-09-03T09:22:07.505Z',
        endTime: '2019-09-03T09:24:07.505Z',
        choices: {
          '#FF0000': 73,
          '#FFFF00': 25,
          '#FF8000': 24,
        }
      },
      {
        displayName: 'Shostakovich/Chamber Symphony, Op. 110a, 2nd Mvt./angry',
        startTime: '2019-09-03T09:24:28.440Z',
        endTime: '2019-09-03T09:26:28.440Z',
        choices: {
          '#000000': 82,
          '#FF0000': 55,
          '#AB0000': 48,
        }
      }
    ]
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
