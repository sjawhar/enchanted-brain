import React, { Component } from "react";
import { Text, View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

class ResultsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>I'll be the Results screen someday.</Text>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default ResultsScreen;
