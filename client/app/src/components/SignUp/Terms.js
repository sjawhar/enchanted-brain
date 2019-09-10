import React, { Component } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import t from 'tcomb-form-native';

import COLORS from '../../constants/Colors';
import Layout from '../../constants/Layout';
import LANGUAGES, { LANGUAGE_EN, LANGUAGE_FR } from '../../languages';

const TermsType = t.struct({
  acceptTerms: t.Boolean,
  acceptResearch: t.Boolean,
});

export default class Terms extends Component {
  state = {
    formData: {},
    isSubmitDisabled: true,
  };

  getFormOptions = () => {
    const { acceptTerms, acceptResearch } = LANGUAGES[this.props.language].fields;
    return {
      order: ['acceptTerms', 'acceptResearch'],
      fields: {
        acceptTerms: {
          label: acceptTerms,
        },
        acceptResearch: {
          label: acceptResearch,
        },
      },
    };
  };

  handleChange = formData => {
    const { acceptTerms = false } = formData || {};
    this.setState({
      formData,
      isSubmitDisabled: !acceptTerms,
    });
  };

  handleSubmit = () => this.props.onSubmit(this.state.formData);

  render() {
    const { language, onCancel, onLanguageChange } = this.props;
    const { formData, isSubmitDisabled } = this.state;
    const { terms, buttons } = LANGUAGES[language];
    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.languageButtonContainer}>
          <Button
            buttonStyle={styles.languageButton}
            disabled={language === LANGUAGE_FR}
            onPress={() => onLanguageChange(LANGUAGE_FR)}
            title="Français"
          />
          <Button
            buttonStyle={styles.languageButton}
            disabled={language === LANGUAGE_EN}
            onPress={() => onLanguageChange(LANGUAGE_EN)}
            title="English"
          />
        </View>
        <Text style={styles.header}>{terms.title}</Text>
        <Text style={styles.articleText}>{terms.purpose}</Text>
        {['One', 'Two', 'TwoSectionOne', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'].map(
          article => (
            <React.Fragment key={article}>
              <Text style={styles.articleHeader}>{terms[`article${article}Title`]}</Text>
              {terms[`article${article}Body`].map((body, i) => {
                if (!(body instanceof Array)) {
                  return (
                    <Text key={`${article}body${i}`} style={styles.articleText}>
                      {body}
                    </Text>
                  );
                }
                return body.map((bodyPart, j) => (
                  <Text key={`${article}body${i}part${j}`} style={styles.indented}>
                    {bodyPart}
                  </Text>
                ));
              })}
            </React.Fragment>
          )
        )}

        <View style={styles.formContainer}>
          <t.form.Form
            onChange={this.handleChange}
            options={this.getFormOptions()}
            type={TermsType}
            value={formData}
          />

          <Button
            buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
            title={buttons.next}
            disabled={isSubmitDisabled}
            onPress={this.handleSubmit}
          />
          <Button
            buttonStyle={{ backgroundColor: 'gray', ...styles.button }}
            title={buttons.cancel}
            onPress={onCancel}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = EStyleSheet.create({
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
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginBottom: 21,
    textAlign: 'center',
  },
  articleHeader: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
    marginTop: 18,
  },
  articleText: {
    fontSize: '1rem',
    marginTop: 12,
  },
  indented: {
    fontSize: '1rem',
    marginLeft: 12,
  },
  button: {
    marginTop: 24,
  },
  formContainer: {
    paddingTop: 24,
    marginTop: 24,
    borderTopColor: '#CCC',
    borderTopWidth: 1,
  },
});
