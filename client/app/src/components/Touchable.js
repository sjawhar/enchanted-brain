import React from 'react';
import { Platform, TouchableNativeFeedback, TouchableOpacity } from 'react-native';

const Touchable = ({ children, ...props }) => {
  if (Platform.OS === 'ios') {
    return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
  }

  return <TouchableNativeFeedback {...props}>{children}</TouchableNativeFeedback>;
};

export default Touchable;
