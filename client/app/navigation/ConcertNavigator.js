import { createSwitchNavigator } from "react-navigation";

import ChillsScreen from "../screens/Chills";
import ColorPickerScreen from "../screens/ColorPicker";
import EmotionPicker from "../screens/EmotionPicker";
import MentalImageryScreen from "../screens/MentalImagery";
import ResultsScreen from "../screens/Results";
import WelcomeScreen from "../screens/Welcome";

const ConcertNavigator = createSwitchNavigator({
  Welcome: WelcomeScreen,
  MentalImagery: MentalImageryScreen,
  Colors: ColorPickerScreen,
  Emotions: EmotionPicker,
  Chills: ChillsScreen,
  Results: ResultsScreen
});

export default ConcertNavigator;
