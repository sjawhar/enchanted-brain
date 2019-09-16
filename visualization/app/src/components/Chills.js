import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';

import { CHOICE_CHILLS } from '../constants/ChoiceTypes';

export default class Chills extends Component {
  getChillsSongs = () => {
    const yMax = {};
    return this.props.songs
      .filter(
        ({ choiceType, choices }) => choiceType === CHOICE_CHILLS && choices && choices.length
      )
      .map(({ startTime, endTime, choices, ...songInfo }) => {
        if (choices[0].timestamp > startTime) {
          choices.unshift({ timestamp: startTime, sum: 0, count: 0 });
        }
        if (choices[choices.length - 1].timestamp < endTime) {
          choices.push({ timestamp: endTime, sum: 0, count: 0 });
        }
        const song = {
          startTime,
          endTime,
          sum: Array(choices.length),
          count: Array(choices.length),
          chilliest: {},
          yMax,
          ...songInfo,
        };
        choices.forEach(({ timestamp, sum, count }, index) => {
          const x = new Date(Date.parse(timestamp) - Date.parse(startTime));
          song.sum[index] = { x, y: sum };
          song.count[index] = { x, y: count };
          song.chilliest = song.chilliest.sum > sum ? song.chilliest : { timestamp: x, sum };
          Object.assign(yMax, {
            sum: Math.max(yMax.sum || 0, sum),
            count: Math.max(yMax.count || 0, count),
          });
        });
        return song;
      });
  };

  getSongTimeString = (timestamp, includeMs) =>
    timestamp.toISOString().slice(14, 23 - (includeMs ? 0 : 4));

  getChartProps = ({ annotate, data, yMax, backgroundColor, title }) => ({
    height: 125,
    data: {
      datasets: [
        {
          backgroundColor,
          data,
          fill: 'origin',
          label: title,
          pointHitRadius: 5,
          pointRadius: 0,
        },
      ],
    },
    options: {
      annotation: annotate && {
        annotations: [
          {
            type: 'line',
            mode: 'vertical',
            scaleID: 'x-axis-0',
            value: annotate.timestamp,
            borderColor: '#000081',
            label: {
              content: `Chilliest Moment: ${this.getSongTimeString(annotate.timestamp)}`,
              enabled: true,
              position: 'top',
            },
          },
        ],
      },
      legend: {
        labels: {
          boxWidth: 0,
          fontColor: 'white',
          fontSize: 21,
        },
      },
      scales: {
        xAxes: [
          {
            ticks: { fontColor: 'white' },
            time: { displayFormats: { second: 'mm:ss' } },
            type: 'time',
          },
        ],
        yAxes: [
          {
            ticks: {
              fontColor: 'white',
              max: Math.ceil(1.1 * yMax),
              min: 0,
            },
          },
        ],
      },
      tooltips: {
        callbacks: {
          title: ([{ label }]) => `Song Time: ${this.getSongTimeString(new Date(label), true)}`,
        },
        displayColors: false,
      },
    },
  });

  render() {
    return (
      <div style={styles.container}>
        {this.getChillsSongs().map(({ displayName, startTime, sum, count, chilliest, yMax }) => {
          const [composer, songName] = displayName.split('/');
          return (
            <div key={displayName} style={styles.songContainer}>
              <div style={styles.songNameContainer}>
                <div>
                  <strong>{composer}</strong>
                </div>
                <div>{songName}</div>
              </div>
              <div style={styles.chartContainer}>
                <Line
                  {...this.getChartProps({
                    backgroundColor: '#d15700',
                    data: sum,
                    title: 'Total Chill Intensity',
                    yMax: yMax.sum,
                    annotate: chilliest,
                  })}
                />
                <div style={styles.chilliest}>
                  Chilliest Moment: {this.getSongTimeString(chilliest.timestamp)}
                </div>
              </div>
              <div style={styles.chartContainer}>
                <Line
                  {...this.getChartProps({
                    backgroundColor: '#000081',
                    data: count,
                    title: 'Audience Members Experiencing Chills',
                    yMax: yMax.count,
                  })}
                />
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
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  songContainer: {
    borderColor: '#222',
    borderStyle: 'solid',
    borderWidth: '0px 1px',
    height: 'calc(100vh - 2px)',
    width: 'calc(50vw - 2px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  songNameContainer: {
    color: 'white',
    textAlign: 'center',
    fontSize: 35,
    alignSelf: 'stretch',
    backgroundColor: '#222',
    padding: '8px 0px 13px',
  },
  chartContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 13px',
  },
  chilliest: {
    color: '#d15700',
    fontSize: 21,
    textAlign: 'center',
    fontWeight: 'bold',
  },
};
