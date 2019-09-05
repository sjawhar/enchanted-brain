import React, { Component } from 'react';
import { Modal, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';

import LOCALES from './locales';
import COLORS from '../../constants/Colors';

export default class UserExistsModal extends Component {
  render() {
    const { locale, onConfirm, onSignIn, visible } = this.props;
    const { modal, buttons } = LOCALES[locale];
    return (
      <Modal animationType="slide" transparent={false} visible={visible}>
        <View style={styles.modal}>
          <Text style={styles.modalHeader}>{modal.header}</Text>
          <Text style={styles.modalText}>{modal.body}</Text>
          <Button
            buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
            onPress={onConfirm}
            title={buttons.confirmUser}
          />
          <Button
            buttonStyle={{ backgroundColor: COLORS.primaryBlue, ...styles.button }}
            onPress={onSignIn}
            title={buttons.signIn}
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
