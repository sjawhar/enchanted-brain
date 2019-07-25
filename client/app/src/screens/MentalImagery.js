import React, { useRef } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import EStyleSheet from 'react-native-extended-stylesheet';
import { store } from '../state';

const MentalImageryScreen = ({ navigation }) => {
  const webViewRef = useRef(null);

  const loadingIndicator = (
    <View style={styles.indicatorContainer}>
      <ActivityIndicator size="large" color="red" />
    </View>
  );

  const handleNavigationStateChange = navState => {
    try {
      const { url } = navState;
      if (url.includes('neurotech')) {
        navigation.navigate('Welcome');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const { state: { params: { formUrl } } } = navigation;
  const { uid } = store.getState();
  const endpoint = `${formUrl}?uid=${uid}`;
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
