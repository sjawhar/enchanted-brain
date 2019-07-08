import React from "react";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";

import TabBarIcon from "../components/TabBarIcon";
import EmotionPickerScreen from "../screens/EmotionPicker";
import ColorPickerScreen from "../screens/ColorPicker";
import ChillsScreen from "../screens/Chills";

const EmotionStack = createStackNavigator(
  {
    Emotions: EmotionPickerScreen
  },
  {
    headerMode: "none"
  }
);

EmotionStack.navigationOptions = {
  tabBarLabel: "Emotions",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name="emoji-happy" />
  )
};

const ColorStack = createStackNavigator(
  {
    Colors: ColorPickerScreen
  },
  {
    headerMode: "none"
  }
);

ColorStack.navigationOptions = {
  tabBarLabel: "Colors",
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="colours" />
};

const ChillsStack = createStackNavigator(
  {
    Chills: ChillsScreen
  },
  {
    headerMode: "none"
  }
);

ChillsStack.navigationOptions = {
  tabBarLabel: "Chills"
};

export default createBottomTabNavigator(
  {
    EmotionStack,
    ColorStack,
    ChillsStack
  },
  {
    initialRouteName: "ColorStack"
  }
);
