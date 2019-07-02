import React, { Component } from "react";
import { View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import Layout from "../../constants/Layout";

import { materialColors } from "../../constants/Colors";

import Hexagon from "./Hexagon";

// TODO: Do math on layout to correctly align hexagons.

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

const HEXAGON_WIDTH = WINDOW_WIDTH / 5.5;
const ROW_MARGIN = HEXAGON_WIDTH / 4;
const ROW_WIDTH =
  WINDOW_WIDTH - HEXAGON_WIDTH * (25 / 36) - ROW_MARGIN / (22 / 36);
const { triangleHeight, longDiagonal } = getHexagonComponents(HEXAGON_WIDTH);
const yOffset = triangleHeight;
const MIN_GRID_HEIGHT = 4 * longDiagonal + 6 * yOffset;

class FourStaggeredHexagons extends Component {
  _getColorList = colors => {
    const list = [];
    for (const hue in colors) {
      if (colors.hasOwnProperty(hue)) {
        list.push(colors[hue][100]);
        list.push(colors[hue][200]);
        list.push(colors[hue][400]);
        list.push(colors[hue][700]);
      }
    }
    return list;
  };

  getHexagonRow = (type, colors) => {
    if (colors.length !== 4) {
      console.log(
        "Incorrect number of colors. Should be 4. Is: ",
        colors.length
      );
      return null;
    }
    const hexagons = [
      <Hexagon key={colors[0]} fill={colors[0]} width={HEXAGON_WIDTH} />,
      <Hexagon key={colors[1]} fill={colors[1]} width={HEXAGON_WIDTH} />,
      <Hexagon key={colors[2]} fill={colors[2]} width={HEXAGON_WIDTH} />,
      <Hexagon key={colors[3]} fill={colors[3]} width={HEXAGON_WIDTH} />
    ];

    const key = `${colors[0]}+${colors[1]}+${colors[2]}+${colors[3]}`;
    // const paddingHexagon = (
    //   <Hexagon key={"grey"} fill="grey" width={HEXAGON_WIDTH / 2} />
    // );
    if (type === "first row") {
      // hexagons.push(paddingHexagon);
      return (
        <View key={key} style={styles.row0}>
          {hexagons}
        </View>
      );
    } else if (type === "odd row") {
      // hexagons.unshift(paddingHexagon);
      return (
        <View key={key} style={styles.oddRow}>
          {hexagons}
        </View>
      );
    }

    // hexagons.push(paddingHexagon);
    return (
      <View key={key} style={styles.evenRow}>
        {hexagons}
      </View>
    );
  };

  renderHexagons = colorList => {
    const hexagonRows = [];
    const length = colorList.length;
    let i = 0,
      increment = 4,
      rowType,
      rowNumber = 0;
    while (i < length) {
      if (i + 3 < length) {
        if (rowNumber === 0) {
          rowType = "first row";
        } else if (rowNumber % 2 === 0) {
          rowType = "even row";
        } else if (rowNumber % 2 === 1) {
          rowType = "odd row";
        }
        const rowColors = colorList.slice(i, i + increment);
        const hexagonRow = this.getHexagonRow(rowType, rowColors);
        hexagonRows.push(hexagonRow);
      }
      rowNumber += 1;
      i += increment;
    }
    return <View style={styles.hexGrid}>{hexagonRows}</View>;
  };

  render() {
    return (
      <View style={styles.container}>
        {this.renderHexagons(this._getColorList(materialColors))}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    height: "100%",
    backgroundColor: "rgb(95, 95, 95)",
    alignItems: "center",
    justifyContent: "space-around"
  },
  hexGrid: {
    width: "100%",
    height: "100%",
    minHeight: MIN_GRID_HEIGHT,
    height: MIN_GRID_HEIGHT * 1.25,
    maxHeight: "80%",
    justifyContent: "space-around"
  },
  row0: {
    width: ROW_WIDTH,
    flexDirection: "row",
    alignSelf: "flex-start",
    marginLeft: ROW_MARGIN,
    alignItems: "center",
    justifyContent: "space-between"
  },
  oddRow: {
    width: ROW_WIDTH,
    flexDirection: "row",
    alignSelf: "flex-end",
    marginRight: ROW_MARGIN,
    alignItems: "center",
    marginTop: -yOffset,
    justifyContent: "space-between"
  },
  evenRow: {
    width: ROW_WIDTH,
    flexDirection: "row",
    alignSelf: "flex-start",
    marginLeft: ROW_MARGIN,
    alignItems: "center",
    marginTop: -yOffset,
    justifyContent: "space-between"
  }
});

export default FourStaggeredHexagons;
