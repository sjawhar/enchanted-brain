import { Platform } from 'react-native';
import {
  AMPLIFY_REGION,
  AMPLIFY_USER_POOL_ID,
  AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  WEBSOCKET_API_URL,
} from 'react-native-dotenv';

export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = !IS_ANDROID;

export const VIBRATION_PATTERN = [0, 1000];
if (IS_ANDROID) {
  VIBRATION_PATTERN.splice(2, 0, 500);
  VIBRATION_PATTERN.splice(1, 0, 500);
}

export default {
  AMPLIFY_REGION,
  AMPLIFY_USER_POOL_ID,
  AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  WEBSOCKET_API_URL,
};
