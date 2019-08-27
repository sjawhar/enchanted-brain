import React, { Component } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default class Terms extends Component {
  render() {
    return (
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.header}>Mobile Application Terms and Conditions of Use</Text>

        <Text style={styles.articleText}>
          These terms and conditions of use are intended to define how NeuroTech makes available its
          mobile application, and the services available to the benefit of the user. By using the
          NeuroTech mobile application, the user accepts without reservation these terms and
          conditions of use.
        </Text>

        <Text style={styles.articleHeader}>Article 1 - Description of the application</Text>
        <Text style={styles.articleText}>
          The mobile application aims to allow spectators of the concert "The Enchanted Brain" to
          interact in real time on various activities proposed in connection with the musical
          program of the concert.
        </Text>

        <Text style={styles.articleHeader}>Article 2 - Liability of the publisher</Text>
        <Text style={styles.articleText}>
          The use of information and documents available on this application are under the
          responsibility of the user, who assumes all the consequences.
        </Text>

        <Text style={styles.articleHeader}>2.1. Technical restraints</Text>
        <Text style={styles.articleText}>
          The mobile app works with mobile devices using Apple iOS and Android operating systems.
          NeuroTech does not guarantee the absence of bugs, inaccuracies, errors, or other harmful
          elements. The mobile application is dependent on the mobile network and internet to
          operate. Therefore, the alert system can only work subject to the availability of the
          network. NeuroTech declines any responsibility in case of unavailability of the network.
        </Text>

        <Text style={styles.articleHeader}>Article 3 - Intellectual property rights</Text>
        <Text style={styles.articleText}>
          The application and each of the elements that compose it are the exclusive property of
          NeuroTech in accordance with the provisions of the Code of Intellectual Property
          (copyright, patent rights, trademarks, designs, logos). The provision of the application
          would not be analyzed as a transfer of ownership to the benefits of the user. The user is
          not authorized to decompile or disassemble the application, reproduce, represent, modify,
          translate, adapt, partially or totally without the prior written consent of NeuroTech.
        </Text>

        <Text style={styles.articleHeader}>Article 4 - Processing of personal data</Text>
        <Text style={styles.articleText}>
          Data collected via the application are anonymised and hosted on a CHUV server. The
          collected data are the demographic data as requested on the registration form (age,
          gender, country, color discrimination), as well as the answers to the questions and
          various activities proposed in the application. There is no collection of medical data.
          Otherwise, the collected data as described above aim to be used for research and future
          scientific publications in the field of music and neurosciences.
        </Text>

        <Text style={styles.articleHeader}>
          Article 5 - Right of access, modification and deletion of collected data
        </Text>
        <Text style={styles.articleText}>
          Pursuant to the Federal Data Protection Act (SDG) 235.1 dated 19 June 1992 (status as of
          March 1, 2019), the user has the right to access, modify, correct, oppose and deletion on
          the relevant data collected on this application. These rights are strictly personal and
          can only be exercised by the user for data concerning him, or concerning another user of
          which he is the legal representative. The user can exercise these rights, by sending an
          e-mail to the address xxx or by sending a mail to the following address:
        </Text>
        <Text style={styles.articleText}>xxx</Text>
        <Text style={styles.articleText}>
          The user must specify his last name, first name, email address, and his user ID. The user
          must attach to his request any element allowing to identify it with certainty. The reply
          will be sent within a maximum of two (2) months following receipt of the request.
        </Text>

        <Text style={styles.articleHeader}>Article 6 - Applicable law</Text>
        <Text style={styles.articleText}>
          Swiss law applies to this contract. In case of absence of amicable resolution of a dispute
          born between the parties, the Swiss courts will be only competent to know. For any
          question relating to the application of the present UGC, you can join the publisher to the
          coordinates inscribed in ARTICLE 7.
        </Text>

        <Text style={styles.articleHeader}>Article 7 - Legal notice</Text>
        <Text style={styles.articleText}>The application is edited by:</Text>
        <Text style={styles.articleText}>President :</Text>
        <Text style={styles.articleText}>Publication Director :</Text>
        <Text style={styles.articleText}>The application is hosted by:</Text>
        <View style={styles.buttonWrapper}>
          <Button title="I agree to the terms and conditions" onPress={this.props.onAgree} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Cancel" color="gray" onPress={this.props.onCancel} />
        </View>
      </ScrollView>
    );
  }
}

const styles = EStyleSheet.create({
  header: {
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 21,
    textAlign: 'center',
  },
  articleHeader: {
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: 18,
    marginBottom: 6,
  },
  articleText: {
    fontSize: 18,
  },
  buttonWrapper: {
    marginTop: 24,
  },
});
