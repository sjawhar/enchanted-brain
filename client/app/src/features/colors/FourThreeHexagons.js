import React, { Component } from 'react';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Layout from '../../constants/Layout';

import { materialColors } from '../../constants/Colors';

import Hexagon from './Hexagon';

const { window } = Layout;
const WINDOW_WIDTH = window.width;
const WINDOW_HEIGHT = window.height;

const getHexagonComponents = width => {
  const { sin, PI } = Math;
  const sideLength = width / 2 / sin(PI / 3);
  const triangleHeight = sideLength * sin(PI / 6);
  const longDiagonal = sideLength + 2 * triangleHeight;
  return {
    sideLength,
    triangleHeight,
    longDiagonal,
  };
};

const hexagonWidth = WINDOW_WIDTH * 0.25;
const components = getHexagonComponents(hexagonWidth);
const yOffset = components.triangleHeight;

class FourThreeHexagons extends Component {
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
    if (type === 'first row' || type === 'even row') {
      if (colors.length !== 4) {
        console.log('Incorrect combination of type and colors.', type, colors);
        return null;
      }
      const hexagons = [
        <Hexagon key={colors[0]} fill={colors[0]} width={hexagonWidth} />,
        <Hexagon key={colors[1]} fill={colors[1]} width={hexagonWidth} />,
        <Hexagon key={colors[2]} fill={colors[2]} width={hexagonWidth} />,
        <Hexagon key={colors[3]} fill={colors[3]} width={hexagonWidth} />,
      ];

      if (type === 'first row') {
        return (
          <View key={`${colors[0]}+${colors[1]}+${colors[2]}+${colors[3]}`} style={styles.row0}>
            {hexagons}
          </View>
        );
      }
      return (
        <View key={`${colors[0]}+${colors[1]}+${colors[2]}+${colors[3]}`} style={styles.evenRow}>
          {hexagons}
        </View>
      );
    } else {
      if (colors.length !== 3) {
        console.log('Incorrect combination of type and colors.', type, colors);
        return null;
      }
      const hexagons = [
        <Hexagon key={colors[0]} fill={colors[0]} width={hexagonWidth} />,
        <Hexagon key={colors[1]} fill={colors[1]} width={hexagonWidth} />,
        <Hexagon key={colors[2]} fill={colors[2]} width={hexagonWidth} />,
      ];
      return (
        <View key={`${colors[0]}+${colors[1]}+${colors[2]}`} style={styles.oddRow}>
          {hexagons}
        </View>
      );
    }
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
          rowType = 'first row';
          increment = 4;
        } else if (rowNumber % 2 === 0) {
          rowType = 'even row';
          increment = 4;
        } else if (rowNumber % 2 === 1) {
          rowType = 'odd row';
          increment = 3;
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
    height: WINDOW_HEIGHT,
    backgroundColor: 'rgb(95, 95, 95)', // temporary?
  },
  row0: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: hexagonWidth / 2,
    marginTop: -yOffset,
  },
  evenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -yOffset,
  },
});

export default FourThreeHexagons;
