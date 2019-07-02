import React from "react";
import { Button } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import PropTypes from "prop-types";
import Layout from "../../constants/Layout";

const { window } = Layout;
const WINDOW_WIDTH = window.width;
const WINDOW_HEIGHT = window.height;

const EmotionButton = props => {
  const { buttonStyle, ...rest } = props;
  const combinedButtonStyle = EStyleSheet.flatten([
    styles.buttonStyle,
    buttonStyle
  ]);
  return <Button buttonStyle={combinedButtonStyle} type="outline" {...rest} />;
};

const styles = EStyleSheet.create({
  $height: WINDOW_HEIGHT * 0.15,

  buttonStyle: {
    height: "$height",
    width: "1.5 * $height",
    maxWidth: WINDOW_WIDTH * 0.35,
    marginVertical: "0.05 * $height"
  }
});

EmotionButton.propTypes = {
  buttonStyle: PropTypes.object
};

export default EmotionButton;
