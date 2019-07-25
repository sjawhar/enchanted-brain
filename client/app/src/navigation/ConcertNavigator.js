import { createStackNavigator } from 'react-navigation';

import ChillsScreen from '../screens/Chills';
import ColorPickerScreen from '../screens/ColorPicker';
import MentalImageryScreen from '../screens/MentalImagery';
import ResultsScreen from '../screens/Results';
import WelcomeScreen from '../screens/Welcome';

const ConcertNavigator = createStackNavigator(
  {
    Welcome: WelcomeScreen,
    MentalImagery: MentalImageryScreen,
    Colors: ColorPickerScreen,
    Chills: ChillsScreen,
    Results: ResultsScreen,
  },
  {
    headerMode: 'none',
  }
);

export default ConcertNavigator;
