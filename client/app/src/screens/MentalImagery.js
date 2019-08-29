import React, { Component } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import EStyleSheet from 'react-native-extended-stylesheet';

import { store } from '../state';
import { COLOR_BACKGROUND_DARK } from '../constants/Colors';
import { MESSAGE_STAGE_COMPLETE_HEADER, MESSAGE_STAGE_COMPLETE_BODY } from '../constants/Messages';

export default class MentalImageryScreen extends Component {
  constructor(props) {
    super(props);

    const { formUrl } = props.navigation.state.params;
    this.endpoint = `${formUrl}?uid=${store.getState().uid}`;
  }

  handleNavigationStateChange = ({ url }) => {
    if (url === this.endpoint) {
      return;
    }

    this.props.navigation.navigate({
      routeName: 'Welcome',
      params: {
        headerText: MESSAGE_STAGE_COMPLETE_HEADER,
        messageText: MESSAGE_STAGE_COMPLETE_BODY,
      },
    });
  };

  render() {
    const loadingIndicator = (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        <WebView
          source={{ uri: this.endpoint }}
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
    backgroundColor: COLOR_BACKGROUND_DARK,
  },
});
