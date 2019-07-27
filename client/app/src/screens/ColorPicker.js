import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'expo-constants';
import ThreeHexagonsWithMargin from '../features/colors/ThreeHexagonsWithMargin';
import concertApi from '../api/concertApi';

class ColorsScreen extends Component {
  handleChoice = color => () => {
    console.log(`Color choice made. Emitting color choice ${color}`);
    concertApi.send(
      JSON.stringify({
        event: 'CHOICE_MADE',
        data: {
          choiceType: 'CHOICE_COLOR',
          choice: color,
          timestamp: new Date().toISOString(), // temporary
        },
      })
    );
    this.props.navigation.goBack();
  };

  render() {
    return (
      <ScrollView horizontal pagingEnabled style={styles.container}>
        <ThreeHexagonsWithMargin onChoice={this.handleChoice} />
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
