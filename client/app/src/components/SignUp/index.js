import React, { Component } from 'react';
import { Button, View, KeyboardAvoidingView, ScrollView } from 'react-native';
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
    formData: {},
  };

  gotoSignIn = () => {
    this.props.onStateChange('signIn', {});
  };

  handleBack = () => {
    if (this.state.isShowTerms) {
      this.gotoSignIn();
      return;
    }
    this.setState({ isShowTerms: true });
  };

  handleChange = formData => {
    this.setState({ formData });
  };

  handleSubmit = async () => {
    if (this.state.isShowTerms) {
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
    } catch (error) {
      if (error.code !== 'UsernameExistsException') {
        throw error;
      }
      // TODO: show user exists modal with options to sign in or confirm
    }

    this.props.onStateChange('confirmSignUp', email);
  };

  render() {
    if (this.props.authState !== 'signUp') {
      return null;
    }
    const { isShowTerms, formData } = this.state;
    return (
      <View style={styles.container}>
        {isShowTerms ? (
          <Terms onAgree={this.handleSubmit} onCancel={this.handleBack} />
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
});
