import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Amplify from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { persistor, store, actions } from "./state";
import concertApi from "./api/concertApi";
import AppNavigator from "./navigation/AppNavigator";
import NavigationManager from "./navigation/NavigationManager";
import layout from "./constants/Layout";

// ** Event listeners ** //
const handleStageNavigation = stageId => {
  console.log("in handleStageNavigation");
  const currentState = store.getState();
  const { choiceType } = currentState;

  let screen = "Welcome";
  if (stageId === "STAGE_CHOICE_IMAGERY") {
    screen = "MentalImagery";
  } else if (stageId === "STAGE_CHOICE_COLOR_EMOTION") {
    if (choiceType === "CHOICE_COLOR") {
      screen = "Colors";
    } else {
      screen = "Emotions";
    }
  } else if (stageId === "STAGE_CHOICE_CHILLS") {
    screen = "Chills";
  } else if (stageId === "STAGE_END") {
    screen = "Results";
  } else {
    screen = "Welcome"; // temporary
    console.log("stub: something went wrong in handleStageNavigation");
    // something went wrong
    // navigate to "something went wrong screen"?
  }
  store.dispatch(actions.setLastKnownScreen(screen));
  NavigationManager.navigate(screen);
};

concertApi.on("WEBSOCKET_CONNECTED", data => {
  console.log("stream in ws connected is:", data);
  try {
    const { stageId, choiceType, choiceInverted } = data;
    console.log("choiceType in WS connected is:", choiceType);
    store.dispatch(actions.setChoiceType(choiceType));
    store.dispatch(actions.setChoiceInverted(choiceInverted));
    handleStageNavigation(stageId);
  } catch (error) {
    console.error(
      "Something went wrong in NavigationManager in WEBSOCKET_CONNECTED listener. Error:",
      error
    );
  }
});

concertApi.on("STAGE_CHANGED", data => {
  try {
    const { stageId } = data;
    handleStageNavigation(stageId);
  } catch (error) {
    console.error(
      "Something went wrong in NavigationManager in STAGE_CHANGED listener. Error:",
      error
    );
  }
});

// ** AWS Amplify config ** //
Amplify.configure({
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_mbDYzVglq",
    userPoolWebClientId: "5jppn76b0lkv0cnmmhtnk4gpvr"
  }
});

const signUpConfig = {
  header: "Sign Up",
  hideAllDefaults: true,
  defaultCountryCode: "41",
  usernameAttributes: "email",
  signUpFields: [
    {
      label: "Name",
      key: "name",
      required: true,
      displayOrder: 1,
      type: "string"
    },
    {
      label: "Email",
      key: "email",
      required: true,
      displayOrder: 3,
      type: "string"
    },
    {
      label: "Password",
      key: "password",
      required: true,
      displayOrder: 3,
      type: "password"
    },
    {
      label: "Phone",
      key: "phone_number",
      required: true,
      displayOrder: 4,
      type: "string"
    },
    {
      label: "gender",
      key: "gender",
      required: true,
      displayOrder: 5,
      type: "string",
      custom: true
    },
    {
      label: "Age",
      key: "age",
      required: true,
      displayOrder: 6,
      type: "number",
      custom: true
    },
    {
      label: "Color-perception",
      key: "color-perception",
      required: true,
      displayOrder: 7,
      type: "string",
      custom: true
    }
  ]
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
  $rem: calculateRem(SCREEN_WIDTH, MIN_WIDTH, MAX_WIDTH, MIN_REM, MAX_REM)
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "tomato",
    accent: "yellow"
  }
};

class App extends React.Component {
  render() {
    return (
      <PaperProvider theme={theme}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <View style={styles.container}>
              {Platform.OS === "ios" && <StatusBar barStyle="default" />}
              <AppNavigator
                ref={navigatorRef => {
                  NavigationManager.setTopLevelNavigator(navigatorRef);
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
    backgroundColor: "#fff"
  }
});

export default withAuthenticator(App, { signUpConfig });
