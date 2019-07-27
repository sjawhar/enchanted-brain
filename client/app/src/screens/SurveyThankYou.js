import React from 'react';
import { Text, SafeAreaView, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const ThankYouScreen = props => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={[styles.text, styles.titleText]}>Thank for you taking the survey</Text>
        <Text style={styles.text}>
          Please wait here for the next stage of the concert to begin.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = EStyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  text: {
    fontSize: '1rem',
    textAlign: 'center',
  },
  titleText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
});

export default ThankYouScreen;
