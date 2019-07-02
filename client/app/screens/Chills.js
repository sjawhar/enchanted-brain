import React, { Component } from "react";
import { View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

import BackgroundColorInterpolation from "../features/chills/BackgroundColorInterpolation";
import { Constants } from "expo";

class ChillsScreen extends Component {
  render() {
    return (
      // <View style={styles.container}>
      <BackgroundColorInterpolation />
      // </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight
  }
});

export default ChillsScreen;
