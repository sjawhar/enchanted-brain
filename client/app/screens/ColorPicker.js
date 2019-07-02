import React, { Component } from "react";
import { ScrollView } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import ThreeHexagonsWithMargin from "../features/colors/ThreeHexagonsWithMargin";
import { Constants } from "expo";
import concertApi from "../api/concertApi";

class ColorsScreen extends Component {
  handleChoice = color => () => {
    console.log(`Color choice made. Emitting color choice ${color}`);
    concertApi.emit("CHOICE_MADE", {
      choiceType: "CHOICE_COLOR",
      choice: color,
      timestamp: new Date().toString()
    });
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
    marginTop: Constants.statusBarHeight
  }
});

export default ColorsScreen;
