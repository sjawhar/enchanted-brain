import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Amplify, { Auth } from 'aws-amplify';
import {
  ConfirmSignIn,
  ConfirmSignUp,
  ForgotPassword,
  RequireNewPassword,
  SignIn,
  VerifyContact,
  withAuthenticator,
} from 'aws-amplify-react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { persistor, store, actions } from './state';
import SignUp from './components/SignUp';
import concertApi from './api/concertApi';
import NavigationService from './navigation/NavigationService';
import AppNavigator from './navigation/AppNavigator';
import { IS_IOS, AMPLIFY_CONFIG } from './config';
import layout from './constants/Layout';
import { CHOICE_COLOR } from './constants/Choices';
import { CONNECTED, EVENT_STAGE_CHANGED } from './constants/Events';
import {
  STAGE_CHOICE_CHILLS,
  STAGE_CHOICE_IMAGERY,
  STAGE_CHOICE_SYNESTHESIA,
  STAGE_END,
  STAGE_WAITING,
} from './constants/Stages';

// ** Dynamic Fontsize Calculations * //
const SCREEN_WIDTH = layout.window.width;

// Abitrary min, max for rem and width
const MIN_WIDTH = 300;
const MAX_WIDTH = 900;
const MIN_REM = 14;
const MAX_REM = 36;

// returns a rem value based on the screen width, within max and min screen and rem bounds
const calculateRem = (width, minWidth, maxWidth, minRem, maxRem) => {
  if (width <= minWidth) {
    return minRem;
  }
  if (width >= maxWidth) {
    return maxRem;
  }
  // get the difference in min and max rem values
  const remDiff = maxRem - minRem;

  // get the difference in min and max widths
  const widthRange = maxWidth - minWidth;

  // get the difference between the actual screen's width and the min width
  const widthDiff = width - minWidth;

  // the rem scaling factor is based on the proportion of width range
  // the actual screen width takes up
  const remFactor = widthDiff / widthRange;

  // the calculated rem is the min rem plus the difference between
  // min and max rem times the proportion of the width range
  // the actual screen width takes up
  const calculatedRem = minRem + remDiff * remFactor;

  return calculatedRem;
};

// ** Extended Stylesheet Setup ** //
EStyleSheet.build({
  $rem: calculateRem(SCREEN_WIDTH, MIN_WIDTH, MAX_WIDTH, MIN_REM, MAX_REM),
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    accent: 'yellow',
  },
};

Amplify.configure(AMPLIFY_CONFIG);

class App extends React.Component {
  componentDidMount() {
    concertApi.on(CONNECTED, this.handleStageNavigation);
    concertApi.on(EVENT_STAGE_CHANGED, this.handleStageNavigation);
  }

  componentWillUnmount() {
    concertApi.removeListener(CONNECTED, this.handleStageNavigation);
    concertApi.removeListener(EVENT_STAGE_CHANGED, this.handleStageNavigation);
    concertApi.disconnect();
  }

  handleConnect = async () => {
    const idToken = (await Auth.currentSession()).getIdToken();
    store.dispatch(actions.setUID(idToken.payload['cognito:username']));
    concertApi.connect();
  };

  handleDisconnect = async () => {
    concertApi.disconnect();
    await Auth.signOut();
    this.props.onStateChange('signIn');
  };

  handleStageNavigation = ({ choiceInverted, choiceType, choiceTypes, stageId, ...stageData }) => {
    if (choiceType) {
      store.dispatch(actions.setChoiceType(choiceType));
    }
    if (choiceInverted !== undefined) {
      store.dispatch(actions.setChoiceInverted(choiceInverted));
    }

    ({ choiceType, choiceInverted } = store.getState());

    const screen = (() => {
      switch (stageId) {
        case STAGE_CHOICE_CHILLS:
          return 'Chills';
        case STAGE_CHOICE_IMAGERY:
          return 'MentalImagery';
        case STAGE_CHOICE_SYNESTHESIA:
          return 'Synesthesia';
        case STAGE_END:
          return 'Results';
        case STAGE_WAITING:
        default:
          return 'Welcome';
      }
    })();

    if (!choiceTypes) {
      choiceTypes = [CHOICE_COLOR];
    }
    NavigationService.navigate(screen, {
      ...stageData,
      stageId,
      choiceInverted,
      choiceType: choiceTypes.includes(choiceType) ? choiceType : choiceTypes[0],
      isConnected: concertApi.isConnected(),
      onConnect: this.handleConnect,
      onDisconnect: this.handleDisconnect,
    });
  };

  handleNavigatorRef = navigatorRef => {
    if (!navigatorRef) {
      return;
    }
    NavigationService.setTopLevelNavigator(navigatorRef);
    this.handleStageNavigation({ stageId: STAGE_WAITING });
  };

  render() {
    return (
      <PaperProvider theme={theme}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <View style={styles.container}>
              {IS_IOS && <StatusBar barStyle="default" />}
              <AppNavigator ref={this.handleNavigatorRef} />
            </View>
          </PersistGate>
        </Provider>
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default withAuthenticator(App, {
  authenticatorComponents: [
    <SignIn />,
    <ConfirmSignIn />,
    <VerifyContact />,
    <SignUp />,
    <ConfirmSignUp />,
    <ForgotPassword />,
    <RequireNewPassword />,
  ],
  includeGreetings: false,
  signUpConfig: {},
  usernameAttributes: 'email',
});
