import React from 'react';
import { Platform, TouchableNativeFeedback, TouchableOpacity } from 'react-native';

const Touchable = props => {
  const { children, ...rest } = props;
  if (Platform.OS === 'ios') {
    return <TouchableOpacity {...rest}>{children}</TouchableOpacity>;
  }

  return <TouchableNativeFeedback {...rest}>{children}</TouchableNativeFeedback>;
};

export default Touchable;
