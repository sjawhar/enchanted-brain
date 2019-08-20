import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import SideSwipe from 'react-native-sideswipe';
import { BarChart, StackedAreaChart } from 'react-native-svg-charts';
import { curveNatural } from 'd3-shape';
import { scaleTime } from 'd3-scale';
import Constants from 'expo-constants';

import Layout from '../constants/Layout';
import { swatchColorInfo } from '../constants/Colors';
import { store } from '../state';

const COLOR_KEYS = Object.keys(swatchColorInfo);
const CARD_MARGIN = 0.05 * Layout.window.width;
const CARD_WIDTH = 0.9 * Layout.window.width;
const CONTAINER_HEIGHT = Layout.window.height - Constants.statusBarHeight;
const CARD_HEIGHT = 0.85 * CONTAINER_HEIGHT;
const CHART_AGGREGATE_HEIGHT = 0.75 * CARD_HEIGHT;
const CHART_USER_HEIGHT = 0.075 * CARD_HEIGHT;

class ResultsScreen extends Component {
  constructor(props) {
    super(props);

    const { songs, colors } = props.navigation.state.params;
    const { choices: userChoices } = store.getState();

    this.songs = songs
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(({ displayName, startTime, endTime }) => {
        const song = {
          displayName,
          startTime,
          endTime,
          colors: colors
            .filter(({ timestamp }) => timestamp >= startTime && timestamp <= endTime)
            .map(({ timestamp, choice, choices }) => ({
              timestamp: new Date(timestamp),
              choice,
              ...choices,
            })),
        };

        song.userColors = song.colors.map(({ timestamp }) => {
          const entry = { timestamp, value: 0 };

          const timeString = timestamp.toISOString();
          const userChoice = userChoices.find(choice => choice.timestamp === timeString);
          if (userChoice) {
            Object.assign(entry, {
              value: 1,
              svg: { fill: userChoice.choice },
            });
          }
          return entry;
        });

        return song;
      });
    this.state = {
      currentIndex: 0,
    };
  }

  handleIndexChange = index => this.setState({ currentIndex: index });

  renderItem = ({
    animatedValue,
    currentIndex,
    item: { colors, displayName, startTime, endTime, userColors },
    itemIndex,
  }) => (
    <View style={styles.card}>
      <Text style={styles.cardHeaderText}>{displayName}</Text>
      <Text style={styles.chartTitle}>Total Audience Choices</Text>
      <StackedAreaChart
        data={colors}
        keys={COLOR_KEYS}
        colors={COLOR_KEYS}
        style={styles.colorAggregateChart}
        curve={curveNatural}
        xAccessor={({ item }) => item.timestamp}
        xScale={scaleTime}
      />
      <BarChart
        data={userColors}
        style={styles.colorUserChart}
        xAccessor={({ item }) => item.timestamp}
        xScale={scaleTime}
        yAccessor={({ item }) => item.value}
      />
      <Text style={styles.chartTitle}>Your Choices</Text>
    </View>
  );

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderText}>Results</Text>
        </View>
        <SideSwipe
          data={this.songs}
          extractKey={({ displayName }) => displayName}
          index={this.state.currentIndex}
          itemWidth={Layout.window.width}
          onIndexChange={this.handleIndexChange}
          renderItem={this.renderItem}
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
    backgroundColor: '#000081',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pageHeaderText: {
    fontSize: 21,
    color: 'white',
    fontWeight: 'bold',
  },
  carousel: {
    height: CARD_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
    marginLeft: CARD_MARGIN,
    marginRight: CARD_MARGIN,
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgb(95, 95, 95)',
    paddingVertical: 3,
  },
  cardHeaderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartTitle: {
    color: 'white',
    fontSize: 13,
  },
  colorAggregateChart: {
    height: CHART_AGGREGATE_HEIGHT,
    width: CARD_WIDTH,
  },
  colorUserChart: {
    height: CHART_USER_HEIGHT,
    width: CARD_WIDTH,
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
