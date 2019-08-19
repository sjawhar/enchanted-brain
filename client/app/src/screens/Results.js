import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import SideSwipe from 'react-native-sideswipe';
import Constants from 'expo-constants';

import Layout from '../constants/Layout';

const CARD_WIDTH = 0.9 * Layout.window.width;
const CARD_MARGIN = 0.05 * Layout.window.width;

class ResultsScreen extends Component {
  state = {
    currentIndex: 0,
  };

  handleIndexChange = index => this.setState({ currentIndex: index });

  render() {
    const { songs } = this.props.navigation.state.params;
    songs.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return (
      <View style={styles.container}>
        <View styles={styles.header}>
          <Text>Results</Text>
        </View>
        <SideSwipe
          data={songs}
          extractKey={({ displayName }) => displayName}
          index={this.state.currentIndex}
          itemWidth={Layout.window.width}
          onIndexChange={this.handleIndexChange}
          style={styles.carousel}
          renderItem={({ itemIndex, currentIndex, item, animatedValue }) => (
            <View style={styles.card}>
              <Text>{item.displayName}</Text>
            </View>
          )}
        />
        <View style={styles.pagination}>
          {songs.map((_, index) => (
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
    height: Layout.window.height - Constants.statusBarHeight,
    marginTop: Constants.statusBarHeight,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carousel: {
    height: '90%',
  },
  card: {
    width: CARD_WIDTH,
    marginLeft: CARD_MARGIN,
    marginRight: CARD_MARGIN,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paginationDotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    marginHorizontal: 13,
  },
});

export default ResultsScreen;
