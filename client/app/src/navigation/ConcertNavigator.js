import { createStackNavigator } from 'react-navigation';

import ColorPickerScreen from '../screens/ColorPicker';
import WelcomeScreen from '../screens/Welcome';

const ConcertNavigator = createStackNavigator(
  {
    Welcome: WelcomeScreen,
    Colors: ColorPickerScreen,
  },
  {
    headerMode: 'none',
  }
);

export default ConcertNavigator;
