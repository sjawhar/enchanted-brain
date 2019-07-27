import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'expo-constants';
import HexagonGrid from '../features/colors/HexagonGrid';
import concertApi from '../api/concertApi';

class ColorsScreen extends Component {
  handleChoice = color => () => {
    concertApi.send({
      event: 'CHOICE_MADE',
      data: {
        choiceType: 'CHOICE_COLOR',
        choice: color,
        timestamp: new Date().toISOString(), // temporary
      },
    });
    this.props.navigation.goBack();
  };

  render() {
    return (
      <ScrollView horizontal pagingEnabled style={styles.container}>
        <HexagonGrid onChoice={this.handleChoice} />
      </ScrollView>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
  },
});

export default ColorsScreen;
