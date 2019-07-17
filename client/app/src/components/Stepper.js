import React, { Component } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const HEIGHT = 100;
const WIDTH = 250;
const RADIUS = HEIGHT / 2;
const THRESHOLD = (WIDTH * 13) / 30 - HEIGHT / 2;
const MAX_TRANSLATE_X = WIDTH / 2;

export default class App extends Component {
  state = {
    animation: new Animated.Value(0),
  };

  constructor(props) {
    super(props);

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.state.animation,
        },
      ]),
      onPanResponderRelease: (e, { dx }) => {
        if (dx < -THRESHOLD) {
          this.handleDecrement();
        }
        if (dx > THRESHOLD) {
          this.handleIncrement();
        }

        if (dx < -MAX_TRANSLATE_X) {
          this.state.animation.setValue(-MAX_TRANSLATE_X);
        }
        if (dx > MAX_TRANSLATE_X) {
          this.state.animation.setValue(MAX_TRANSLATE_X);
        }

        Animated.spring(this.state.animation, {
          toValue: 0,
          friction: 3,
          tension: 5,
        }).start();
      },
    });
  }

  handleDecrement = () => {
    const { handleDecrement } = this.props;
    handleDecrement();
  };

  handleIncrement = () => {
    const { handleIncrement } = this.props;
    handleIncrement();
  };

  render() {
    const translateXInterpolate = this.state.animation.interpolate({
      inputRange: [-MAX_TRANSLATE_X, MAX_TRANSLATE_X],
      outputRange: [-MAX_TRANSLATE_X, MAX_TRANSLATE_X],
      extrapolate: 'clamp',
    });

    const circleStyle = {
      transform: [
        {
          translateX: translateXInterpolate,
        },
      ],
    };

    return (
      <View style={styles.backdrop}>
        <View style={styles.stepperContainer}>
          <View style={styles.pill}>
            <TouchableWithoutFeedback onPress={this.handleDecrement}>
              <Text style={styles.increment}>—</Text>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={this.handleIncrement}>
              <Text style={styles.increment}>+</Text>
            </TouchableWithoutFeedback>
          </View>
          <Animated.View style={[styles.circle, circleStyle]} {...this._panResponder.panHandlers}>
            <Text style={styles.number}>{Math.round(this.props.count)}</Text>
          </Animated.View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  stepperContainer: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: RADIUS,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
  },
  increment: {
    fontSize: WIDTH / 5,
    color: '#fff',
    paddingHorizontal: 25,
  },
  circle: {
    width: RADIUS * 2,
    height: RADIUS * 2,
    borderRadius: RADIUS,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: WIDTH / 2 - RADIUS,
    top: 0,
  },
  number: {
    fontSize: 50,
    color: 'rgba(0,0,0,1)',
  },
});
