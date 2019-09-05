import React, { Component } from 'react';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';

import Terms from './Terms';
import Demographics from './Demographics';
import User from './User';
import UserExistsModal from './UserExistsModal';
import Layout from '../../constants/Layout';

const INITIAL_STATE = {
  acceptResearch: false,
  demographics: {},
  error: null,
  isLoading: false,
  isShowModal: false,
  step: 0,
  user: { phoneNumber: '+41' },
  locale: 'fr',
};

export default class Signup extends Component {
  state = { ...INITIAL_STATE };

  gotoSignIn = () => {
    this.setState(INITIAL_STATE, () => this.props.onStateChange('signIn', {}));
  };

  gotoConfirm = () => {
    const { phoneNumber } = this.state.user;
    this.setState(INITIAL_STATE, () => this.props.onStateChange('confirmSignUp', phoneNumber));
  };

  gotoNextStep = (state = {}) =>
    this.setState(({ step }) => ({
      step: step + 1,
      ...state,
    }));

  handleBack = () =>
    this.setState(({ step }) => ({
      step: step - 1,
    }));

  handleLocaleChange = locale => this.setState({ locale });

  handleSubmitTerms = ({ acceptResearch }) => this.gotoNextStep({ acceptResearch });

  handleSubmitDemographics = demographics => this.gotoNextStep({ demographics });

  handleSubmitUser = async user => {
    const { phoneNumber, password } = user;
    const {
      demographics: { age, colorPerception, countryOfBirth, countryOfResidence, gender },
      acceptResearch,
    } = this.state;

    this.setState({ isLoading: true, error: null });
    try {
      const { userConfirmed } = await Auth.signUp({
        username: phoneNumber.toLowerCase().trim(),
        password,
        attributes: {
          'custom:acceptResearch': acceptResearch ? 'Y' : 'N',
          'custom:age': age.toString(),
          'custom:colorPerception': colorPerception,
          'custom:countryOfBirth': countryOfBirth.toUpperCase(),
          'custom:countryOfResidence': countryOfResidence.toUpperCase(),
          gender,
        },
      });
      if (!userConfirmed) {
        this.gotoConfirm();
      }
    } catch (error) {
      const isUserExists = error.code === 'UsernameExistsException';
      this.setState({
        isShowModal: isUserExists,
        error: isUserExists ? null : error.message,
      });
    }
    this.setState({ isLoading: false });
  };

  render() {
    if (this.props.authState !== 'signUp') {
      return null;
    }
    const { error, step, isLoading, isShowModal, demographics, user, locale } = this.state;
    return (
      <View style={styles.container}>
        <UserExistsModal
          locale={locale}
          onConfirm={this.gotoConfirm}
          onSignIn={this.gotoSignIn}
          visible={isShowModal}
        />
        {(() => {
          switch (step) {
            case 2:
              return (
                <User
                  error={error}
                  formData={user}
                  isLoading={isLoading}
                  locale={locale}
                  onCancel={this.handleBack}
                  onChange={formData => this.setState({ user: formData })}
                  onSubmit={this.handleSubmitUser}
                />
              );
            case 1:
              return (
                <Demographics
                  formData={demographics}
                  locale={locale}
                  onCancel={this.handleBack}
                  onChange={formData => this.setState({ demographics: formData })}
                  onSubmit={this.handleSubmitDemographics}
                />
              );
            case 0:
            default:
              return (
                <Terms
                  locale={locale}
                  onCancel={this.gotoSignIn}
                  onLocaleChange={this.handleLocaleChange}
                  onSubmit={this.handleSubmitTerms}
                />
              );
          }
        })()}
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
});
