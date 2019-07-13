import { NavigationActions } from "react-navigation";
import concertApi from "../api/concertApi";
import { store, actions } from "../state";

let _navigator;

const setTopLevelNavigator = navigatorRef => {
  _navigator = navigatorRef;
};

const navigate = (routeName, params) => {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params
    })
  );
};

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
  navigate(screen);
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

export default {
  navigate,
  setTopLevelNavigator
};
