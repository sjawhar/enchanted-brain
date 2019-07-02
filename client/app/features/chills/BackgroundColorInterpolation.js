import React, { Component } from "react";
import { Animated, PanResponder, Text, View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

import Layout from "../../constants/Layout";
import { Constants } from "expo";

const WINDOW_HEIGHT = Layout.window.height;

class BackgroundColorInterpolation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      animated: new Animated.Value(0.5)
    };
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, { dx }) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, { moveY }) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        const fraction = moveY / WINDOW_HEIGHT;
        this.state.animated.setValue(fraction);
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      }
    });
  }
  render() {
    const backgroundColorInterpolate = this.state.animated.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(242, 38, 19, 1)", "rgba(242, 38, 19, 0)"]
    });

    const backgroundColorStyle = {
      backgroundColor: backgroundColorInterpolate
    };

    return (
      <Animated.View
        {...this._panResponder.panHandlers}
        style={[styles.container, backgroundColorStyle]}
      />
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    marginTop: Constants.statusBarHeight,
    backgroundColor: "red"
  }
});

export default BackgroundColorInterpolation;
