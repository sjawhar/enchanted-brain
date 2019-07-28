import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import ChillsScreen from '../screens/Chills';
import ColorPickerScreen from '../screens/ColorPicker';
import MentalImageryScreen from '../screens/MentalImagery';
import ResultsScreen from '../screens/Results';
import WelcomeScreen from '../screens/Welcome';

export default createAppContainer(
  createSwitchNavigator(
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
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
  )
);
