import React, { Component } from 'react';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import t from 'tcomb-form-native';
import { getCodeList } from 'country-list';

import COLORS from '../../constants/Colors';
import LANGUAGES from '../../languages';

const COUNTRIES = Object.entries(getCodeList())
  .sort(([_, a], [__, b]) => a.localeCompare(b))
  .reduce((countries, [code, name]) => Object.assign(countries, { [code]: name }), {});

export default class Demographics extends Component {
  getFormProps = () => {
    const { fields, enums } = LANGUAGES[this.props.language];
    const order = ['age', 'gender', 'countryOfBirth', 'countryOfResidence', 'colorPerception'];
    return {
      type: t.struct({
        age: t.Number,
        colorPerception: t.enums(enums.colorPerception),
        gender: t.enums(enums.gender),
        countryOfBirth: t.enums(COUNTRIES),
        countryOfResidence: t.enums(COUNTRIES),
      }),
      options: {
        order,
        fields: order.reduce(
          (fieldLabels, field) => ({ ...fieldLabels, [field]: { label: fields[field] } }),
          {}
        ),
      },
    };
  };

  handleSubmit = () => {
    const formData = this.refs.form.getValue();
    if (!formData) {
      return;
    }
    this.props.onSubmit(formData);
  };

  render() {
    const { formData, language, onCancel, onChange } = this.props;
    const { buttons } = LANGUAGES[language];
    return (
      <KeyboardAvoidingView
        behavior="padding"
        enabled
        keyboardVerticalOffset={50}
        style={styles.container}>
        <ScrollView>
          <t.form.Form {...this.getFormProps()} onChange={onChange} ref="form" value={formData} />
          <Button
            buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
            title={buttons.next}
            onPress={this.handleSubmit}
          />
          <Button
            buttonStyle={{ backgroundColor: 'gray', ...styles.button }}
            title={buttons.back}
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
