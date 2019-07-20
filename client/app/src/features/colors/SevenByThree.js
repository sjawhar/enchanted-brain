import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Layout from '../../constants/Layout';

import Stepper from '../../components/Stepper';

import { materialColors } from '../../constants/Colors';

const { window } = Layout;
const WINDOW_WIDTH = window.width;
const WINDOW_HEIGHT = window.height;

class SevenByThree extends Component {
  state = {
    boxSideLength: WINDOW_WIDTH * 0.28,
  };

  handleDecrement = () => {
    this.setState({
      boxSideLength: this.state.boxSideLength - 1,
    });
  };

  handleIncrement = () => {
    this.setState({
      boxSideLength: this.state.boxSideLength + 1,
    });
  };

  _getColorList = colors => {
    const list = [];
    for (const hue in colors) {
      if (colors.hasOwnProperty(hue)) {
        list.push(colors[hue][200]);
        list.push(colors[hue][400]);
        list.push(colors[hue][700]);
      }
    }

    return list;
  };

  _renderColorBoxes = colors => {
    return colors.map(color => {
      const { boxSideLength } = this.state;
      const colorBoxStyle = {
        backgroundColor: color,
        width: boxSideLength,
        height: boxSideLength,
        marginTop: WINDOW_HEIGHT * 0.01,
      };

      return <View key={color} style={colorBoxStyle} />;
    });
  };

  _renderStepper = () => (
    <View style={styles.stepperContainer}>
      <Stepper
        handleDecrement={this.handleDecrement}
        handleIncrement={this.handleIncrement}
        count={this.state.boxSideLength}
      />
    </View>
  );

  render() {
    const colorList = this._getColorList(materialColors);
    return (
      <View>
        <ScrollView>
          <View style={styles.container}>{this._renderColorBoxes(colorList)}</View>
        </ScrollView>
        {/* {this._renderStepper()} */}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgb(95, 95, 95)',
  },
  stepperContainer: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
  },
});

export default SevenByThree;
