import React, { Component } from 'react';
import { Modal, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';

import COLORS from '../../constants/Colors';

export default class UserExistsModal extends Component {
  render() {
    const { visible, onConfirm, onSignIn } = this.props;
    return (
      <Modal animationType="slide" transparent={false} visible={visible}>
        <View style={styles.modal}>
          <Text style={styles.modalHeader}>User already exists</Text>
          <Text style={styles.modalText}>
            Are you trying to complete the sign up process by entering a confirmation code? Or would
            you like to sign in instead?
          </Text>
          <Button
            onPress={onConfirm}
            title="CONFIRM USER"
            buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
          />
          <Button
            onPress={onSignIn}
            title="SIGN IN"
            buttonStyle={{ backgroundColor: COLORS.primaryBlue, ...styles.button }}
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
