import React, { Component } from 'react';
import { Modal, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';

import COLORS from '../../constants/Colors';
import LANGUAGES from '../../languages';

export default class UserExistsModal extends Component {
  render() {
    const { language, onBack, onSignIn, visible } = this.props;
    const { modal, buttons } = LANGUAGES[language];
    return (
      <Modal animationType="slide" transparent={false} visible={visible}>
        <View style={styles.modal}>
          <Text style={styles.modalHeader}>{modal.header}</Text>
          <Text style={styles.modalText}>{modal.body}</Text>
          <Button
            buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
            onPress={onSignIn}
            title={buttons.signIn}
          />
          <Button
            buttonStyle={{ backgroundColor: 'gray', ...styles.button }}
            onPress={onBack}
            title={buttons.back}
          />
        </View>
      </Modal>
    );
  }
}

const styles = EStyleSheet.create({
  button: {
    marginTop: 24,
  },
  modal: {
    padding: 40,
  },
  modalHeader: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: '1rem',
  },
});
