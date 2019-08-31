import React, { Component } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import t from 'tcomb-form-native';

import COLORS from '../../constants/Colors';

const UserType = t.struct({
  email: t.refinement(t.String, val => /^[^ ]+@[^ ]+\.[^ ]+$/.test(val)),
  password: t.String,
});

const options = {
  order: ['email', 'password'],
  fields: {
    email: {
      autoCompleteType: 'email',
      keyboardType: 'email-address',
      textContentType: 'emailAddress',
    },
    password: {
      secureTextEntry: true,
      autoCompleteType: 'password',
      textContentType: 'password',
    },
  },
};

export default class User extends Component {
  state = {
    password: '',
  };

  handleChange = ({ password, ...formData }) =>
    this.setState({ password }, () => this.props.onChange(formData));

  handleSubmit = () => {
    const formData = this.refs.form.getValue();
    if (!formData) {
      return;
    }
    this.props.onSubmit(formData);
  };

  render() {
    const { password } = this.state;
    const { error, formData, isLoading, onCancel } = this.props;
    return (
      <View style={styles.container}>
        <t.form.Form
          onChange={this.handleChange}
          options={options}
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
              title="SIGN UP"
            />
            <Button
              buttonStyle={{ backgroundColor: 'gray', ...styles.button }}
              onPress={onCancel}
              title="BACK"
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
