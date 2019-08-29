import React, { Component } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import SideSwipe from 'react-native-sideswipe';
import { AreaChart, BarChart, LineChart, StackedAreaChart } from 'react-native-svg-charts';
import { curveNatural } from 'd3-shape';
import { scaleTime } from 'd3-scale';
import Constants from 'expo-constants';

import { store } from '../state';
import Layout from '../constants/Layout';
import COLORS, { swatchColorInfo, COLOR_BACKGROUND_DARK } from '../constants/Colors';
import { CHOICE_COLOR, CHOICE_CHILLS } from '../constants/Choices';

const COLOR_KEYS = Object.keys(swatchColorInfo);
const COLOR_EMPTY = Object.fromEntries(COLOR_KEYS.map(color => [color, 0]));
const CARD_MARGIN = 0.05 * Layout.window.width;
const CARD_WIDTH = 0.9 * Layout.window.width;
const CONTAINER_HEIGHT = Layout.window.height - Constants.statusBarHeight;
const CARD_HEIGHT = 0.85 * CONTAINER_HEIGHT;
const CHART_COLOR_AGGREGATE_HEIGHT = 0.75 * CARD_HEIGHT;
const CHART_COLOR_USER_HEIGHT = 0.075 * CARD_HEIGHT;
const CHART_CHILLS_HEIGHT = 0.8 * CARD_HEIGHT;

class ResultsScreen extends Component {
  constructor(props) {
    super(props);

    const { songs } = props.navigation.state.params;
    const { choices: userChoices } = store.getState();

    this.songs = songs
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(({ startTime, endTime, choices, choiceType, ...songInfo }) => {
        const song = {
          startTime,
          endTime,
          choices: choices.map(({ timestamp, ...choice }) => ({
            timestamp: new Date(timestamp),
            ...choice,
          })),
          choiceType,
          chartProps: {
            xAccessor: ({ item }) => item.timestamp,
            xMax: new Date(endTime),
            xMin: new Date(startTime),
            xScale: scaleTime,
            contentInset: {
              top: Platform.select({
                ios: 0,
                android: 0.1 * CHART_COLOR_AGGREGATE_HEIGHT,
              }),
            },
          },
          ...songInfo,
        };
        switch (choiceType) {
          case CHOICE_COLOR:
            this.prepChoices({
              song,
              leftPad: COLOR_EMPTY,
              userChoices: userChoices.colors,
              userChoiceModifier: choice => ({ value: 1, svg: { fill: choice } }),
            });
            return song;
          case CHOICE_CHILLS:
            this.prepChoices({
              song,
              chartProps: {
                yAccessor: ({ item }) => item.value,
                yMax: 1,
                yMin: 0,
              },
              modifier: ({ sum, count }) => ({ value: sum / count }),
              leftPad: { value: 0 },
              userChoices: userChoices.chills,
              userChoiceModifier: choice => ({ value: choice }),
            });
            return song;
          default:
            return null;
        }
      })
      .filter(song => !!song);

    this.state = {
      currentIndex: 0,
    };
  }

  prepChoices = ({ chartProps = {}, leftPad, modifier, song, userChoiceModifier, userChoices }) => {
    Object.assign(song.chartProps, chartProps);
    if (modifier) {
      song.choices = song.choices.map(choice => Object.assign(choice, modifier(choice)));
    }
    if (song.chartProps.xMin < song.choices[0].timestamp) {
      song.choices.unshift({ timestamp: song.chartProps.xMin, ...leftPad });
    }
    song.userChoices = userChoices
      .filter(({ timestamp }) => timestamp >= song.startTime && timestamp <= song.endTime)
      .map(({ timestamp, choice }) => ({
        timestamp: new Date(timestamp),
        ...userChoiceModifier(choice),
      }));

    let filled = false;
    song.choices.forEach(({ timestamp }) => {
      const userChoice = song.userChoices.find(
        choice => choice.timestamp.valueOf() === timestamp.valueOf()
      );
      if (userChoice) {
        return;
      }
      song.userChoices.push({ timestamp, value: 0 });
      filled = true;
    });
    if (filled) {
      song.userChoices.sort(({ timestamp: a }, { timestamp: b }) =>
        a.valueOf() === b.valueOf() ? 0 : a < b ? -1 : 1
      );
    }
  };

  handleIndexChange = index => this.setState({ currentIndex: index });

  renderColorCard = ({ choices, userChoices, chartProps: { contentInset, ...chartProps } }) => (
    <React.Fragment>
      <Text style={styles.chartTitle}>Total Audience Choices</Text>
      <StackedAreaChart
        data={choices}
        keys={COLOR_KEYS}
        colors={COLOR_KEYS}
        style={styles.colorAggregateChart}
        curve={curveNatural}
        contentInset={contentInset}
        {...chartProps}
      />
      {userChoices.length > 0 && (
        <React.Fragment>
          <BarChart
            data={userChoices}
            style={styles.colorUserChart}
            yAccessor={({ item }) => item.value}
            {...chartProps}
          />
          <Text style={styles.chartTitle}>Your Choices</Text>
        </React.Fragment>
      )}
    </React.Fragment>
  );

  renderChillsCard = ({ choices, userChoices, chartProps }) => (
    <React.Fragment>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={styles.chillsLegendGroup}>
          <View
            style={[
              styles.chillsLegendIcon,
              {
                backgroundColor: COLORS.primaryBlue,
                height: 10,
              },
            ]}
          />
          <Text style={styles.chillsLegendText}>Audience</Text>
        </View>
        <View style={styles.chillsLegendGroup}>
          <View
            style={[
              styles.chillsLegendIcon,
              {
                backgroundColor: COLORS.primaryOrange,
                height: 4,
              },
            ]}
          />
          <Text style={styles.chillsLegendText}>Your Choices</Text>
        </View>
      </View>
      <AreaChart
        data={choices}
        curve={curveNatural}
        style={[styles.chillsChart, { marginBottom: -5, zIndex: 100 }]}
        svg={{ fill: COLORS.primaryBlue }}
        {...chartProps}
      />
      <LineChart
        data={userChoices}
        style={[
          styles.chillsChart,
          {
            position: 'absolute',
            bottom: 0,
            zIndex: 101,
          },
        ]}
        svg={{ stroke: COLORS.primaryOrange, strokeWidth: 2 }}
        {...chartProps}
      />
    </React.Fragment>
  );

  renderSongCard = ({ animatedValue, currentIndex, item: { displayName, ...item }, itemIndex }) => (
    <View style={styles.card}>
      <Text style={styles.cardHeaderText}>{displayName}</Text>
      {item.choiceType === CHOICE_COLOR ? this.renderColorCard(item) : this.renderChillsCard(item)}
    </View>
  );

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderText}>Results</Text>
          <Button
            title="SIGN OUT"
            onPress={this.props.navigation.state.params.onDisconnect}
            buttonStyle={styles.buttonDisconnect}
          />
        </View>
        <SideSwipe
          data={this.songs}
          extractKey={({ displayName }) => displayName}
          index={this.state.currentIndex}
          itemWidth={Layout.window.width}
          onIndexChange={this.handleIndexChange}
          renderItem={this.renderSongCard}
          style={styles.carousel}
          useVelocityForIndex={false}
        />
        <View style={styles.pagination}>
          {this.songs.map((_, index) => (
            <TouchableOpacity
              key={index}
              accessible={false}
              style={styles.paginationDotContainer}
              onPress={() => this.handleIndexChange(index)}>
              <View
                style={{
                  ...styles.paginationDot,
                  opacity: index === this.state.currentIndex ? 1 : 0.5,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: '100%',
    height: CONTAINER_HEIGHT,
    marginTop: Constants.statusBarHeight,
    backgroundColor: '#222',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  pageHeader: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pageHeaderText: {
    fontSize: '1.25rem',
    color: 'white',
    fontWeight: 'bold',
  },
  buttonDisconnect: {
    backgroundColor: COLORS.primaryOrange,
  },
  carousel: {
    height: CARD_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
    marginLeft: CARD_MARGIN,
    marginRight: CARD_MARGIN,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLOR_BACKGROUND_DARK,
    paddingVertical: 5,
  },
  cardHeaderText: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  chartTitle: {
    color: 'white',
    fontSize: '0.8rem',
  },
  colorAggregateChart: {
    height: CHART_COLOR_AGGREGATE_HEIGHT,
    width: CARD_WIDTH,
    overflow: 'visible',
  },
  colorUserChart: {
    height: CHART_COLOR_USER_HEIGHT,
    width: CARD_WIDTH,
  },
  chillsChart: {
    height: CHART_CHILLS_HEIGHT,
    width: CARD_WIDTH,
    overflow: 'visible',
  },
  chillsLegendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  chillsLegendIcon: {
    marginHorizontal: 3,
    width: 10,
  },
  chillsLegendText: {
    color: 'white',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 13,
  },
  paginationDotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    marginHorizontal: 13,
  },
});

export default ResultsScreen;
