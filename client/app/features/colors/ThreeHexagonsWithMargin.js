import React, { Component } from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import Layout from "../../constants/Layout";

import {
  sixBasicColorTerms as basicColors,
  materialColorsWithGrayscale as materialColors,
  heringPrimaries,
  hsluvColors
} from "../../constants/Colors";

import Hexagon from "./Hexagon";

const { window } = Layout;
const WINDOW_WIDTH = window.width;

const getHexagonComponents = width => {
  const { sin, PI } = Math;
  const sideLength = width / 2 / sin(PI / 3);
  const triangleHeight = sideLength * sin(PI / 6);
  const longDiagonal = sideLength + 2 * triangleHeight;
  return {
    sideLength,
    triangleHeight,
    longDiagonal
  };
};

const HEXAGON_WIDTH = WINDOW_WIDTH / 5;
const ROW_WIDTH = (4 * WINDOW_WIDTH + HEXAGON_WIDTH) / 5;
const HEXAGON_MARGIN =
  ((4 * WINDOW_WIDTH + HEXAGON_WIDTH) / 5 - 3 * HEXAGON_WIDTH) / 4;

const { triangleHeight } = getHexagonComponents(HEXAGON_WIDTH);
const Y_OFFSET = triangleHeight * 0.8;

class FourStaggeredHexagons extends Component {
  _handleScreenPress = () => {
    this.setState({
      list: this.state.list === "basic" ? "material" : "basic"
    });
  };

  render() {
    // const colors = basicColors;
    const colors = materialColors;
    // const colors = heringPrimaries;
    // const colors = hsluvColors;
    return (
      <View style={styles.container}>
        <View style={[styles.row, styles.rowLeft, styles.firstRow]}>
          <View
            style={[
              styles.hexagonContainerLeft,
              styles.lastHexagonContainerLeft
            ]}
          >
            <Hexagon width={HEXAGON_WIDTH} fill={colors[0]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[1]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[2]} />
          </View>
        </View>
        <View style={[styles.row, styles.rowRight]}>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[3]} />
          </View>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[4]} />
          </View>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[5]} />
          </View>
        </View>
        <View style={[styles.row, styles.rowLeft]}>
          <View
            style={[
              styles.hexagonContainerLeft,
              styles.lastHexagonContainerLeft
            ]}
          >
            <Hexagon width={HEXAGON_WIDTH} fill={colors[6]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[7]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[8]} />
          </View>
        </View>
        <View style={[styles.row, styles.rowRight]}>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[9]} />
          </View>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[10]} />
          </View>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[11]} />
          </View>
        </View>
        <View style={[styles.row, styles.rowLeft]}>
          <View
            style={[
              styles.hexagonContainerLeft,
              styles.lastHexagonContainerLeft
            ]}
          >
            <Hexagon width={HEXAGON_WIDTH} fill={colors[12]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[13]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[14]} />
          </View>
        </View>

        {/* Comment out below when showing Hering primaries */}
        <View style={[styles.row, styles.rowRight]}>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[15]} />
          </View>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[16]} />
          </View>
          <View style={styles.hexagonContainerRight}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[17]} />
          </View>
        </View>

        {/* Special grayscale row containing 4 hexagons */}
        <View style={[styles.row, styles.grayscaleRow]}>
          <Hexagon width={HEXAGON_WIDTH} fill={colors[18]} />

          <Hexagon width={HEXAGON_WIDTH} fill={colors[19]} />

          <Hexagon width={HEXAGON_WIDTH} fill={colors[20]} />

          <Hexagon width={HEXAGON_WIDTH} fill={colors[21]} bordered />
        </View>

        {/* Regular final row (that happens to contain grayscale colors) */}
        {/* <View style={[styles.row, styles.rowLeft]}>
          <View
            style={[
              styles.hexagonContainerLeft,
              styles.lastHexagonContainerLeft
            ]}
          >
            <Hexagon width={HEXAGON_WIDTH} fill={colors[18]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[19]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[20]} />
          </View>
          <View style={styles.hexagonContainerLeft}>
            <Hexagon width={HEXAGON_WIDTH} fill={colors[21]} bordered />
          </View>
        </View> */}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    height: "100%",
    backgroundColor: "rgba(0,0,0,1)",
    // backgroundColor: "rgb(95, 95, 95)",
    justifyContent: "center"
  },

  row: {
    width: ROW_WIDTH,
    flexDirection: "row",
    marginTop: -Y_OFFSET
  },
  firstRow: {
    marginTop: 0
  },
  rowLeft: {
    alignSelf: "flex-start",
    marginLeft: HEXAGON_MARGIN / 4
  },
  rowRight: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginRight: HEXAGON_MARGIN / 4
  },
  grayscaleRow: {
    width: "100%",
    justifyContent: "space-evenly",
    marginTop: HEXAGON_WIDTH / 5
  },
  hexagonContainerLeft: {
    marginLeft: HEXAGON_MARGIN
  },
  hexagonContainerRight: {
    marginRight: HEXAGON_MARGIN
  }
});

export default FourStaggeredHexagons;
