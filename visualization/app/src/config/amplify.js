export default {
  Auth: {
    region: process.env.REACT_APP_AMPLIFY_REGION,
    userPoolId: process.env.REACT_APP_AMPLIFY_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  },
  Analytics: {
    disabled: true,
  },
};
