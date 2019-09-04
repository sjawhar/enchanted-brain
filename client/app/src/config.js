import { Platform } from 'react-native';
import {
  AMPLIFY_REGION,
  AMPLIFY_USER_POOL_ID,
  AMPLIFY_USER_POOL_WEB_CLIENT_ID,
} from 'react-native-dotenv';

export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = !IS_ANDROID;

// Vibrate immediately for 500ms, wait 1s, vibrate again for 500ms`
export const VIBRATION_PATTERN = Platform.select({
  ios: [0, 1000],
  android: [0, 500, 1000, 500],
});

export const AMPLIFY_CONFIG = {
  Auth: {
    region: AMPLIFY_REGION,
    userPoolId: AMPLIFY_USER_POOL_ID,
    userPoolWebClientId: AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  },
  Analytics: {
    disabled: true,
  },
};

let clockOffsetPromise = null;

export const getClockOffset = () => {
  if (!clockOffsetPromise) {
    clockOffsetPromise = new Promise(async resolve => {
      const start = Date.now();
      const response = await fetch('https://worldtimeapi.org/api/timezone/UTC');
      const end = Date.now();
      const { datetime } = await response.json();
      resolve(Date.parse(datetime) - 0.5 * (start + end));
    });
  }
  return clockOffsetPromise;
};

export default { AMPLIFY_CONFIG };
