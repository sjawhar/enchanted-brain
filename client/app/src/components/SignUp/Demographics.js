import React, { Component } from 'react';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import t from 'tcomb-form-native';
import { getCodeList } from 'country-list';

import COLORS from '../../constants/Colors';

const COUNTRIES = Object.entries(getCodeList())
  .sort(([_, a], [__, b]) => a.localeCompare(b))
  .reduce((countries, [code, name]) => Object.assign(countries, { [code]: name }), {});

const DemographicsType = t.struct({
  age: t.Number,
  colorPerception: t.enums({
    0: 'No Difficulty at all',
    1: 'Slight or Infrequent Difficulty',
    2: 'Moderate Difficulty',
    3: 'Definite or Frequent Difficulty',
  }),
  gender: t.enums({
    male: 'Male',
    female: 'Female',
    other: 'Other',
  }),
  countryOfBirth: t.enums(COUNTRIES),
  countryOfResidence: t.enums(COUNTRIES),
});

const options = {
  order: ['age', 'gender', 'countryOfBirth', 'countryOfResidence', 'colorPerception'],
  fields: {
    countryOfBirth: {
      label: 'Country of Birth',
    },
    countryOfResidence: {
      label: 'Country of Residence',
    },
    colorPerception: {
      label:
        'To what extent, if any, do you have difficulty in telling colors apart that other people are easily able to tell apart?',
    },
  },
};

export default class Demographics extends Component {
  handleSubmit = () => {
    const formData = this.refs.form.getValue();
    if (!formData) {
      return;
    }
    this.props.onSubmit(formData);
  };

  render() {
    const { formData, onCancel, onChange } = this.props;
    return (
      <KeyboardAvoidingView
        behavior="padding"
        enabled
        keyboardVerticalOffset={50}
        style={styles.container}>
        <ScrollView>
          <t.form.Form
            onChange={onChange}
            options={options}
            ref="form"
            type={DemographicsType}
            value={formData}
          />
          <Button
            buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
            title="NEXT"
            onPress={this.handleSubmit}
          />
          <Button
            buttonStyle={{ backgroundColor: 'gray', ...styles.button }}
            title="BACK"
            onPress={onCancel}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
});
