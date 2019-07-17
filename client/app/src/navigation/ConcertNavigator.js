import { createStackNavigator } from 'react-navigation';

import ColorPickerScreen from '../screens/ColorPicker';
import MentalImageryScreen from '../screens/MentalImagery';
import ThankYouScreen from '../screens/SurveyThankYou';
import WelcomeScreen from '../screens/Welcome';

const ConcertNavigator = createStackNavigator(
  {
    Welcome: WelcomeScreen,
    MentalImagery: MentalImageryScreen,
    SurveyThankYou: ThankYouScreen,
    Colors: ColorPickerScreen,
  },
  {
    headerMode: 'none',
  }
);

export default ConcertNavigator;
