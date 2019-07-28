import React from 'react';
import { TouchableNativeFeedback, TouchableOpacity } from 'react-native';

import { IS_IOS } from '../config';

const Touchable = ({ children, ...props }) => {
  if (IS_IOS) {
    return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
  }

  return <TouchableNativeFeedback {...props}>{children}</TouchableNativeFeedback>;
};

export default Touchable;
