import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { persistor, store, actions } from './state';
import concertApi from './api/concertApi';
import NavigationService from './navigation/NavigationService';
import AppNavigator from './navigation/AppNavigator';
import layout from './constants/Layout';
import { CHOICE_COLOR } from './constants/Choices';
import { CONNECTED, EVENT_STAGE_CHANGED } from './constants/Events';
import config, { IS_IOS } from './config';

// ** Event listeners ** //
const handleStageNavigation = ({
  choiceInverted,
  choiceType,
  choiceTypes,
  stageId,
  ...stageData
}) => {
  if (choiceType) {
    store.dispatch(actions.setChoiceType(choiceType));
  }
  if (choiceInverted !== undefined) {
    store.dispatch(actions.setChoiceInverted(choiceInverted));
  }

  ({ choiceType, choiceInverted } = store.getState());

  const screen = (() => {
    switch (stageId) {
      case 'STAGE_WAITING':
        return 'Welcome';
      case 'STAGE_CHOICE_IMAGERY':
        return 'MentalImagery';
      case 'STAGE_CHOICE_SYNESTHESIA':
        return 'Synesthesia';
      case 'STAGE_CHOICE_CHILLS':
        return 'Chills';
      case 'STAGE_END':
        return 'Results';
      default:
        // something went wrong
        // navigate to 'something went wrong screen'?
        console.log('stub: something went wrong in handleStageNavigation');
        return 'Welcome';
    }
  })();

  console.debug('Screen chosen', screen);
  if (!choiceTypes) {
    choiceTypes = [CHOICE_COLOR];
  }
  NavigationService.navigate(screen, {
    ...stageData,
    choiceInverted,
    choiceType: choiceTypes.includes(choiceType) ? choiceType : choiceTypes[0],
  });
};

concertApi.on(CONNECTED, handleStageNavigation);
concertApi.on(EVENT_STAGE_CHANGED, handleStageNavigation);

// ** AWS Amplify config ** //
Amplify.configure({
  Auth: {
    region: config.AMPLIFY_REGION,
    userPoolId: config.AMPLIFY_USER_POOL_ID,
    userPoolWebClientId: config.AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  },
  Analytics: {
    disabled: true,
  },
});

const signUpConfig = {
  header: 'Sign Up',
  hideAllDefaults: true,
  defaultCountryCode: '41',
  usernameAttributes: 'email',
  signUpFields: [
    {
      label: 'Name',
      key: 'name',
      required: true,
      displayOrder: 1,
      type: 'string',
    },
    {
      label: 'Email',
      key: 'email',
      required: true,
      displayOrder: 3,
      type: 'string',
    },
    {
      label: 'Password',
      key: 'password',
      required: true,
      displayOrder: 3,
      type: 'password',
    },
    {
      label: 'Phone',
      key: 'phone_number',
      required: true,
      displayOrder: 4,
      type: 'string',
    },
    {
      label: 'gender',
      key: 'gender',
      required: true,
      displayOrder: 5,
      type: 'string',
      custom: true,
    },
    {
      label: 'Age',
      key: 'age',
      required: true,
      displayOrder: 6,
      type: 'number',
      custom: true,
    },
    {
      label: 'Color-perception',
      key: 'color-perception',
      required: true,
      displayOrder: 7,
      type: 'string',
      custom: true,
    },
  ],
};

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

class App extends React.Component {
  async componentDidMount() {
    const idToken = (await Auth.currentSession()).getIdToken();
    concertApi.connect(idToken.getJwtToken());
    store.dispatch(actions.setUID(idToken.payload['cognito:username']));
  }

  componentWillUnmount() {
    concertApi.disconnect();
  }

  render() {
    return (
      <PaperProvider theme={theme}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <View style={styles.container}>
              {IS_IOS && <StatusBar barStyle="default" />}
              <AppNavigator
                ref={navigatorRef => {
                  NavigationService.setTopLevelNavigator(navigatorRef);
                }}
              />
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

export default withAuthenticator(App, { signUpConfig });
