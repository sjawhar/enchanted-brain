import React, { Component } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import EStyleSheet from 'react-native-extended-stylesheet';

import WaitingScreen from './Waiting';
import { store } from '../state';

export default class MentalImageryScreen extends Component {
  constructor(props) {
    super(props);

    const { formUrl } = props.navigation.state.params;
    this.state = {
      isShowPrompt: true,
      endpoint: `${formUrl}?uid=${store.getState().uid}`,
    };
  }

  handleNavigationStateChange = ({ url }) => {
    if (url === this.state.endpoint) {
      return;
    }
    this.setState({ isShowPrompt: false });
  };

  render() {
    if (!this.state.isShowPrompt) {
      return (
        <WaitingScreen
          headerText="Get Enchanted!"
          messageText="Please enjoy the next stage of the concert!"
        />
      );
    }

    const loadingIndicator = (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        <WebView
          source={{ uri: this.state.endpoint }}
          startInLoadingState
          renderLoading={() => loadingIndicator}
          onNavigationStateChange={this.handleNavigationStateChange}
        />
      </SafeAreaView>
    );
  }
}

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
