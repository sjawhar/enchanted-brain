import React, { Component } from 'react';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import PropTypes from 'prop-types';
import Layout from '../../constants/Layout';

import { swatchColors } from '../../constants/Colors';

import Hexagon from './Hexagon';

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
    longDiagonal,
  };
};

const HEXAGON_WIDTH = WINDOW_WIDTH / 5;
const ROW_WIDTH = (4 * WINDOW_WIDTH + HEXAGON_WIDTH) / 5;
const HEXAGON_MARGIN = ((4 * WINDOW_WIDTH + HEXAGON_WIDTH) / 5 - 3 * HEXAGON_WIDTH) / 4;

const { triangleHeight } = getHexagonComponents(HEXAGON_WIDTH);
const Y_OFFSET = triangleHeight * 0.8;

class HexagonGrid extends Component {
  _handleScreenPress = () => {
    this.setState({
      list: this.state.list === 'basic' ? 'material' : 'basic',
    });
  };

  render() {
    const { onChoice } = this.props;
    return (
      <View style={styles.container}>
        {swatchColors.map((row, i) => (
          <View
            style={[
              styles.row,
              i % 2 ? styles.rowLeft : styles.rowRight,
              !i ? styles.firstRow : '',
            ]}
            key={i}>
            {row.map((color, j) => (
              <View
                style={[
                  i % 2 ? styles.hexagonContainerLeft : styles.hexagonContainerRight,
                  !j && i % 2 ? styles.lastHexagonContainerLeft : '',
                ]}
                key={color.id}>
                <Hexagon
                  onPress={() => onChoice(color.id)}
                  width={HEXAGON_WIDTH}
                  fill={color.value}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    height: '100%',
    backgroundColor: 'rgb(95, 95, 95)',
    justifyContent: 'center',
  },
  row: {
    width: ROW_WIDTH,
    flexDirection: 'row',
    marginTop: -Y_OFFSET,
  },
  firstRow: {
    marginTop: 0,
  },
  rowLeft: {
    alignSelf: 'flex-start',
    marginLeft: HEXAGON_MARGIN / 4,
  },
  rowRight: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: HEXAGON_MARGIN / 4,
  },
  grayscaleRow: {
    width: '100%',
    justifyContent: 'space-evenly',
    marginTop: HEXAGON_WIDTH / 5,
  },
  hexagonContainerLeft: {
    marginLeft: HEXAGON_MARGIN,
  },
  hexagonContainerRight: {
    marginRight: HEXAGON_MARGIN,
  },
});

HexagonGrid.propTypes = {
  onChoice: PropTypes.func.isRequired,
};

export default HexagonGrid;
