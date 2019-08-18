import React, { Component } from 'react';
import { Text, View } from 'react-native';
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
          renderItem={({ itemIndex, currentIndex, item, animatedValue }) => {
            return (
              <View style={styles.card}>
                <Text>{item.displayName}</Text>
              </View>
            );
          }}
        />
        <Text>{this.state.currentIndex}</Text>
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
    sjustifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResultsScreen;
