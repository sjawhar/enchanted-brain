import React, { Component } from 'react';
import { Button, View, Text } from 'react-native';
import t from 'tcomb-form-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';

import Layout from '../constants/Layout';

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

    console.log('DATA', formData);
    try {
      const { email, password, gender, age, colorPerception } = formData;

      const response = await Auth.signUp({
        username: email,
        password,
        attributes: {
          age: age.toString(),
          colorPerception,
          gender,
        },
      });
      console.log('SIGN UP', response);
    } catch (error) {
      console.error(error);
    }
  };

  gotoSignIn = () => {
    this.props.onStateChange('signIn', {});
  };

  render() {
    if (this.props.authState !== 'signUp') {
      return null;
    }
    const { isShowTerms, formData } = this.state;
    return (
      <View style={styles.container}>
        {isShowTerms ? (
          <Text>Terms</Text>
        ) : (
          <React.Fragment>
            <Form
              onChange={this.handleChange}
              options={options}
              ref="form"
              type={User}
              value={formData}
            />
          </React.Fragment>
        )}
        <Button onPress={this.handleSubmit} title={isShowTerms ? 'I Agree' : 'Sign Up'} />
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
});
