import React, { Component } from 'react';
import { Button, KeyboardAvoidingView, Modal, ScrollView, View, Text } from 'react-native';
import t from 'tcomb-form-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';

import Terms from './Terms';
import Layout from '../../constants/Layout';
import COLORS from '../../constants/Colors';

const { Form } = t.form;

const User = t.struct({
  age: t.Number,
  colorPerception: t.enums({
    0: 'No Difficulty at all',
    1: 'Slight or Infrequent Difficulty',
    2: 'Moderate Difficulty',
    3: 'Definite or Frequent Difficulty',
  }),
  email: t.String,
  gender: t.enums({
    male: 'Male',
    female: 'Female',
    other: 'Other',
  }),
  name: t.String,
  password: t.String,
});

const options = {
  order: ['name', 'gender', 'age', 'colorPerception', 'email', 'password'],
  fields: {
    colorPerception: {
      label:
        'To what extent, if any, do you have difficulty in telling colors apart that other people are easily able to tell apart?',
    },
    password: {
      secureTextEntry: true,
      autoCompleteType: 'password',
    },
  },
};

export default class Signup extends Component {
  state = {
    isShowTerms: true,
    isShowModal: false,
    formData: {},
  };

  gotoSignIn = () => {
    this.setState({ value: {} }, () => this.props.onStateChange('signIn', {}));
  };

  gotoConfirm = email => {
    if (!email) {
      ({ email } = this.refs.form.getValue() || {});
    }
    this.setState({ value: {} }, () => this.props.onStateChange('confirmSignUp', email));
  };

  handleBack = () => {
    this.setState({ isShowTerms: true });
  };

  handleChange = formData => {
    this.setState({ formData });
  };

  handleSubmit = async () => {
    const { isShowTerms } = this.state;
    if (isShowTerms) {
      this.setState({ isShowTerms: false });
      return;
    }

    const formData = this.refs.form.getValue();
    if (!formData) {
      return;
    }

    const { age, colorPerception, email, gender, name, password } = formData;

    try {
      const { userConfirmed } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          'custom:age': age.toString(),
          'custom:colorPerception': colorPerception,
          gender,
          name,
        },
      });
      if (!userConfirmed) {
        this.gotoConfirm(email);
      }
    } catch (error) {
      if (error.code === 'UsernameExistsException') {
        this.setState({ isShowModal: true });
      }
      // TODO: showErrorModal
    }
  };

  render() {
    if (this.props.authState !== 'signUp') {
      return null;
    }
    const { isShowTerms, isShowModal, formData } = this.state;
    return (
      <View style={styles.container}>
        <Modal animationType="slide" transparent={false} visible={isShowModal}>
          <View style={styles.modal}>
            <Text style={styles.modalHeader}>User already exists</Text>
            <Text style={styles.modalText}>
              Are you trying to complete the sign up process by entering a confirmation code? Or
              would you like to sign in instead?
            </Text>
            <View style={styles.buttonWrapper}>
              <Button
                onPress={this.gotoConfirm}
                title="Confirm User"
                color={COLORS.primaryOrange}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button onPress={this.gotoSignIn} title="Sign In" color={COLORS.primaryBlue} />
            </View>
          </View>
        </Modal>

        {isShowTerms ? (
          <Terms onAgree={this.handleSubmit} onCancel={this.gotoSignIn} />
        ) : (
          <KeyboardAvoidingView
            behavior="padding"
            enabled
            keyboardVerticalOffset={50}
            style={styles.formWrapper}>
            <ScrollView>
              <Form
                onChange={this.handleChange}
                options={options}
                ref="form"
                type={User}
                value={formData}
              />
              <View style={styles.buttonWrapper}>
                <Button onPress={this.handleSubmit} title="Sign Up" color={COLORS.primaryOrange} />
              </View>
              <View style={styles.buttonWrapper}>
                <Button onPress={this.handleBack} title="Back" color="gray" />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    width: '100%',
    height: Layout.window.height - Constants.statusBarHeight,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonWrapper: {
    marginTop: 24,
  },
  formWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  modal: {
    padding: 40,
  },
  modalHeader: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 18,
  },
});
