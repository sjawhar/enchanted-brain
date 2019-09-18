import React, { Component } from 'react';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Button } from 'react-native-elements';
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';
import t from 'tcomb-form-native';

import { store, actions } from '../state';
import LANGUAGES, { LANGUAGE_EN, LANGUAGE_FR } from '../languages';
import Layout from '../constants/Layout';
import COLORS from '../constants/Colors';
import { CONCERT_PASSWORD } from '../config';

const INITIAL_STATE = {
  error: null,
  formData: {
    phoneNumber: '+41',
  },
  isButtonDisabled: false,
};

const UserType = t.struct({ phoneNumber: t.refinement(t.String, val => /^\+[0-9]+$/.test(val)) });

export default class SignIn extends Component {
  state = { ...INITIAL_STATE };

  goToSignup = () => this.setState(INITIAL_STATE, () => this.props.onStateChange('signUp'));

  getFormOptions = () => ({
    fields: {
      phoneNumber: {
        label: LANGUAGES[this.getLanguage()].fields.phoneNumber,
        autoCompleteType: 'tel',
        keyboardType: 'phone-pad',
        textContentType: 'telephoneNumber',
      },
    },
  });

  getLanguage = () => store.getState().language;

  handleFormChange = ({ phoneNumber, ...formData }) => {
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }
    this.setState({ formData: { phoneNumber, ...formData } });
  };

  handleLanguageChange = language => {
    store.dispatch(actions.setLanguage(language));
    this.forceUpdate();
  };

  handleSignIn = async () => {
    const formData = this.refs.form.getValue();
    if (!formData) {
      return;
    }

    this.setState({ error: null, isButtonDisabled: true });
    try {
      const { phoneNumber } = formData;
      await Auth.signIn({
        username: phoneNumber.trim(),
        password: CONCERT_PASSWORD,
      });
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ isButtonDisabled: false });
    }
  };

  render() {
    const language = this.getLanguage();
    if (this.props.authState !== 'signIn') {
      return null;
    }
    const { buttons } = LANGUAGES[language];
    const { error, formData, isButtonDisabled } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.languageButtonContainer}>
          <Button
            buttonStyle={styles.languageButton}
            disabled={language === LANGUAGE_FR}
            onPress={() => this.handleLanguageChange(LANGUAGE_FR)}
            title="Français"
          />
          <Button
            buttonStyle={styles.languageButton}
            disabled={language === LANGUAGE_EN}
            onPress={() => this.handleLanguageChange(LANGUAGE_EN)}
            title="English"
          />
        </View>
        <Text style={styles.header}>Welcome to the Enchanted Brain!</Text>
        <t.form.Form
          onChange={this.handleFormChange}
          options={this.getFormOptions()}
          ref="form"
          type={UserType}
          value={formData}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
          disabled={isButtonDisabled}
          onPress={this.handleSignIn}
          title={buttons.signIn}
        />
        <Button
          buttonStyle={styles.button}
          disabled={isButtonDisabled}
          onPress={this.goToSignup}
          title={buttons.signUp}
          type="outline"
        />
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  languageButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  languageButton: {
    width: Layout.window.width * 0.4,
  },
  header: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 13,
    marginBottom: 34,
  },
  error: {
    color: 'firebrick',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
  },
});
