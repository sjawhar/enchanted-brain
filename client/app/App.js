import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import EStyleSheet from 'react-native-extended-stylesheet';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import layout from './constants/Layout';

const SCREEN_WIDTH = layout.window.width;

// Abitrary min, max for rem and width
const MIN_WIDTH = 300
const MAX_WIDTH = 900
const MIN_REM = 14
const MAX_REM = 36

// returns a rem value based on the screen width, within max and min screen and rem bounds
const calculateRem = (width, minWidth, maxWidth, minRem, maxRem) => {
  if (width <= minWidth) {
    return minRem
  }
  if (width >= maxWidth) {
    return maxRem
  }
  // get the difference in min and max rem values
  const remDiff = maxRem - minRem

  // get the difference in min and max widths
  const widthRange = maxWidth - minWidth

  // get the difference between the actual screen's width and the min width
  const widthDiff = width - minWidth

  // the rem scaling factor is based on the proportion of width range
  // the actual screen width takes up
  const remFactor = widthDiff / widthRange

  // the calculated rem is the min rem plus the difference between
  // min and max rem times the proportion of the width range
  // the actual screen width takes up
  const calculatedRem = minRem + (remDiff * remFactor)

  return calculatedRem
}

EStyleSheet.build({
  $rem: calculateRem(SCREEN_WIDTH, MIN_WIDTH, MAX_WIDTH, MIN_REM, MAX_REM)
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    accent: 'yellow',
  },
};

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <PaperProvider theme={theme}>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <AppNavigator />
          </View>
        </PaperProvider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
