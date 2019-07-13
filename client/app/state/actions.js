import actionTypes from "./actionTypes";
// import NavigationManager from "../navigation/NavigationManager";

const eventNameToScreenMap = {
  SHOW_COLOR_PICKER: "Colors"
};

const setChoiceType = choiceType => dispatch => {
  dispatch({
    type: actionTypes.SET_CHOICE_TYPE,
    payload: {
      choiceType
    }
  });
};

const setChoiceInverted = choiceInverted => dispatch => {
  dispatch({
    type: actionTypes.SET_CHOICE_INVERTED,
    payload: {
      choiceInverted
    }
  });
};

const setLastKnownScreen = screen => dispatch => {
  console.log("in setLastKNownScreen");
  console.log("screen is:", screen);
  // const screen = eventNameToScreenMap[eventName];

  // NavigationManager.navigate(screen);
  dispatch({
    type: actionTypes.SET_LAST_KNOWN_STAGE,
    payload: {
      screen
    }
  });
};

export default {
  setChoiceType,
  setChoiceInverted,
  setLastKnownScreen
};
