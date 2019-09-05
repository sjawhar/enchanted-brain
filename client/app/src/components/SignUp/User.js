import React, { Component } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import t from 'tcomb-form-native';

import LOCALES from './locales';
import COLORS from '../../constants/Colors';

const UserType = t.struct({
  phoneNumber: t.refinement(t.String, val => /^\+[0-9]+$/.test(val)),
  password: t.String,
});

export default class User extends Component {
  state = {
    password: '',
  };

  getFormOptions = () => {
    const { password, phoneNumber, phoneNumberHelp } = LOCALES[this.props.locale].fields;
    return {
      order: ['phoneNumber', 'password'],
      fields: {
        phoneNumber: {
          label: phoneNumber,
          help: phoneNumberHelp,
          autoCompleteType: 'tel',
          keyboardType: 'phone-pad',
          textContentType: 'telephoneNumber',
        },
        password: {
          label: password,
          secureTextEntry: true,
          autoCompleteType: 'password',
          textContentType: 'password',
        },
      },
    };
  };

  handleChange = ({ phoneNumber, password, ...formData }) => {
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }
    this.setState({ password }, () => this.props.onChange({ phoneNumber, ...formData }));
  };

  handleSubmit = () => {
    const formData = this.refs.form.getValue();
    if (!formData) {
      return;
    }
    this.props.onSubmit(formData);
  };

  render() {
    const { password } = this.state;
    const { error, formData, locale, isLoading, onCancel } = this.props;
    const { buttons } = LOCALES[locale];
    return (
      <View style={styles.container}>
        <t.form.Form
          onChange={this.handleChange}
          options={this.getFormOptions()}
          ref="form"
          type={UserType}
          value={{ password, ...formData }}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primaryOrange} />
        ) : (
          <View>
            {error && <Text style={styles.error}>{error}</Text>}
            <Button
              buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
              onPress={this.handleSubmit}
              title={buttons.signUp}
            />
            <Button
              buttonStyle={{ backgroundColor: 'gray', ...styles.button }}
              onPress={onCancel}
              title={buttons.back}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    marginTop: 24,
  },
  error: {
    color: 'firebrick',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
