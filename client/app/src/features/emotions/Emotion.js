import React from 'react';
import { TouchableNativeFeedback, TouchableOpacity, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Emoji from 'react-native-emoji';
import PropTypes from 'prop-types';

import { IS_ANDROID } from '../../config';

const Touchable = IS_ANDROID ? TouchableNativeFeedback : TouchableOpacity;

const Emotion = props => {
  const { name, title, selected, onPress, emojiStyle, titleStyle } = props;

  const elevation = selected ? 8 : 2;

  const elevationStyle = {
    elevation,
  };

  const scrim = <View style={styles.scrim} pointerEvents="none" />;

  return (
    <Touchable onPress={onPress}>
      <View style={[styles.container, elevationStyle]}>
        <Emoji name={name} style={[styles.emojiStyle, emojiStyle]} />
        <Text style={[styles.titleStyle, titleStyle]}>{title}</Text>
        {selected ? scrim : null}
      </View>
    </Touchable>
  );
};

const styles = EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '29%',
    margin: '1%',
    aspectRatio: 1,
    backgroundColor: '#fff',
  },
  emojiStyle: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  titleStyle: {
    fontSize: '1.2rem',
  },
  scrim: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});

Emotion.propTypes = {
  name: PropTypes.string.isRequired, // name of the emoji
  title: PropTypes.string.isRequired, // the emotion string (e.g. joy, sadness)
  selected: PropTypes.bool.isRequired, // whether this emotion is selected or not
  onPress: PropTypes.func.isRequired, // function to call when emotion is pressed
  emojiStyle: PropTypes.object, // style of the underlying emoji text element
  titleStyle: PropTypes.object, // style of the title text element
};

Emotion.defaultProps = {
  emojiStyle: undefined,
  titleStyle: undefined,
};

export default Emotion;
