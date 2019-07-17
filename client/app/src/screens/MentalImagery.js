import React, { useRef } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import EStyleSheet from 'react-native-extended-stylesheet';

// replace preview survey root with published survey when it's available.
const PREVIEW_SURVEY_ROOT = 'https://ucsf.co1.qualtrics.com/jfe/preview/SV_eEBoIQ1RAp6UxdH';
const FAKE_UID = 'Im from the app!';

const MentalImageryScreen = props => {
  const { navigation } = props;
  const webViewRef = useRef(null);

  const loadingIndicator = (
    <View style={styles.indicatorContainer}>
      <ActivityIndicator size="large" color="red" />
    </View>
  );

  const handleNavigationStateChange = navState => {
    const { url } = navState;
    if (url === 'https://www.google.com/') {
      navigation.navigate('SurveyThankYou');
    }
  };

  const endpoint = `${PREVIEW_SURVEY_ROOT}/?uid=${FAKE_UID}`;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: endpoint }}
        startInLoadingState
        renderLoading={() => loadingIndicator}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </SafeAreaView>
  );
};

const styles = EStyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    ...EStyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MentalImageryScreen;
