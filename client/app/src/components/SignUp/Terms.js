import React, { Component } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import t from 'tcomb-form-native';

import COLORS from '../../constants/Colors';

const TermsType = t.struct({
  acceptTerms: t.Boolean,
  acceptResearch: t.Boolean,
});

const options = {
  order: ['acceptTerms', 'acceptResearch'],
  fields: {
    acceptTerms: {
      label: 'I agree with these terms and conditions',
    },
    acceptResearch: {
      label: 'I agree that my anonymized data will be used for research (cf. Article 5)',
    },
  },
};

export default class Terms extends Component {
  state = {
    formData: {},
    isSubmitDisabled: true,
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
    const { onCancel } = this.props;
    const { formData, isSubmitDisabled } = this.state;
    return (
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.header}>Mobile Application Terms and Conditions of Use</Text>

        <Text style={styles.articleText}>
          These terms and conditions of use are intended to define how NeuroTech makes available
          this mobile application, and the services available to the benefit of the user. By using
          the NeuroTech mobile application, the user accepts without reservation these terms and
          conditions of use.
        </Text>

        <Text style={styles.articleHeader}>Article 1 - Description of the application</Text>
        <Text style={styles.articleText}>
          This mobile application aims to allow spectators of the concert "Le Cerveau Enchanté" to
          interact in real-time on various activities proposed in connection with the program of the
          concert. The application is edited and distributed by NeuroTech.
        </Text>

        <Text style={styles.articleHeader}>Article 2 - Liability of the publisher</Text>
        <Text style={styles.articleText}>
          The use of information and documents available on this application are under the
          responsibility of the user, who assumes all the consequences.
        </Text>

        <Text style={styles.articleHeader}>2.1. Technical constraints</Text>
        <Text style={styles.articleText}>
          The mobile app works with mobile devices using Apple iOS and Android operating systems.
          NeuroTech does not guarantee the absence of bugs, inaccuracies, errors, or other harmful
          elements. The mobile application is dependent on the mobile network and internet to
          operate. Therefore, the alert system can only work subject to the availability of the
          network. NeuroTech declines any responsibility in case of unavailability of the network.
        </Text>

        <Text style={styles.articleHeader}>Article 3 - Intellectual property rights</Text>
        <Text style={styles.articleText}>
          The application and each of the elements that compose it are the exclusive property of the
          University of California San Francisco Neuroscape Center in accordance with the provisions
          of the Code of Intellectual Property (copyright, patent rights, trademarks, designs,
          logos).
        </Text>
        <Text style={styles.articleText}>
          The provision of the application would not be analyzed as a transfer of ownership to the
          benefits of the user.
        </Text>
        <Text style={styles.articleText}>
          The user is not authorized to decompile or disassemble the application, reproduce,
          represent, modify, translate, adapt, partially or totally without the prior written
          consent of the University of California San Francisco Neuroscape Center.
        </Text>

        <Text style={styles.articleHeader}>
          Article 4 - Processing and publication of personal anonymized data
        </Text>
        <Text style={styles.articleText}>
          Data collected via the application are anonymized and hosted on a server at the Centre
          Hospitalier Universitaire Vaudois.
        </Text>
        <Text style={styles.articleText}>
          The collected data are the demographic data as requested on the registration form, as well
          as the answers to the questions and various activities proposed in the application. There
          is no collection of medical data.
        </Text>
        <Text style={styles.articleText}>
          The collected anonymized data may be used and incorporated in its full form in future
          versions of this application and other applications, including radio and television
          broadcast, online publication and virtual reality scenarios – in scientific, commercial
          and non-profit domains.{' '}
        </Text>

        <Text style={styles.articleHeader}>
          Article 5 – Scientific use of personal anonymized data
        </Text>
        <Text style={styles.articleText}>
          The user agrees that the collected anonymized data as described above may be used for
          research and scientific publications, and made available for other researchers through
          online data repositories.
        </Text>

        <Text style={styles.articleHeader}>
          Article 6 - Right of access, modification and deletion of collected data
        </Text>
        <Text style={styles.articleText}>
          According to the Federal Data Protection Act (SDG) 235.1 dated 19 June 1992 (status as of
          March 1, 2019), upon written request, the user has the right to access, modify, correct,
          oppose and delete his/her data collected on this application.
        </Text>
        <Text style={styles.articleText}>
          These rights are strictly personal and can only be exercised by the user for data
          concerning him/her, or concerning another user of which he/she is the legal
          representative. The user can exercise these rights, by sending an e-mail to the address
          info@neurotech.healthcare or by sending a letter to the following address:
        </Text>
        <Text style={styles.indented} />
        <Text style={styles.indented}>NeuroTech</Text>
        <Text style={styles.indented}>Biopôle</Text>
        <Text style={styles.indented}>Route de la Corniche 9A</Text>
        <Text style={styles.indented}>Secteur Croisettes/ Bâtiment SC-A</Text>
        <Text style={styles.indented}>1066 Epalinges</Text>
        <Text style={styles.indented}>Switzerland</Text>

        <Text style={styles.articleText}>
          The user must specify his last name, first name, email address, and his user ID. The user
          must attach to his request any element allowing to identify him/her with certainty. The
          reply will be sent within a maximum of two (2) months following receipt of the request.
        </Text>

        <Text style={styles.articleHeader}>Article 7 - Applicable law</Text>
        <Text style={styles.articleText}>
          Swiss law applies to this contract. In case of absence of amicable resolution of a dispute
          born between the parties, the Swiss courts will be the only competent to settle it.
        </Text>
        <Text style={styles.articleText}>
          For any question relating to the application of the present UGC, you can join the
          publisher at the coordinates inscribed in Article 8.
        </Text>

        <Text style={styles.articleHeader}>Article 8 - Legal Notice</Text>
        <Text style={styles.indented}>The application is edited by: NeuroTech</Text>
        <Text style={styles.indented}>President: Professor Philippe Ryvlin</Text>
        <Text style={styles.indented}>Publication Director: Dr Arseny Sokolov</Text>

        <View style={styles.formContainer}>
          <t.form.Form
            onChange={this.handleChange}
            options={options}
            type={TermsType}
            value={formData}
          />

          <Button
            buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
            title="NEXT"
            disabled={isSubmitDisabled}
            onPress={this.handleSubmit}
          />
          <Button
            buttonStyle={{ backgroundColor: 'gray', ...styles.button }}
            title="CANCEL"
            onPress={onCancel}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = EStyleSheet.create({
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
