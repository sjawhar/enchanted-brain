import React, { Component } from "react";
import { ScrollView } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import SevenByThree from "../features/colors/SevenByThree";
import SixByFour from "../features/colors/SixByFour";
import FourThreeHexagons from "../features/colors/FourThreeHexagons";
import FourStaggeredHexagons from "../features/colors/FourStaggeredHexagons";
import FourHexagonsWithMargin from "../features/colors/FourHexagonsWithMargin";
import ThreeHexagonsWithMargin from "../features/colors/ThreeHexagonsWithMargin";
import { Constants } from "expo";

class ColorsScreen extends Component {
  render() {
    return (
      <ScrollView horizontal pagingEnabled style={styles.container}>
        <ThreeHexagonsWithMargin />
        {/* <FourHexagonsWithMargin />
        <FourStaggeredHexagons />
        <FourThreeHexagons />
        <SevenByThree />
        <SixByFour /> */}
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
