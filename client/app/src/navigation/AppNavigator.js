import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import ChillsScreen from '../screens/Chills';
import SynesthesiaScreen from '../screens/Synesthesia';
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
      Synesthesia: SynesthesiaScreen,
      Chills: ChillsScreen,
      Results: ResultsScreen,
    },
    {
      headerMode: 'none',
    }
  )
);
