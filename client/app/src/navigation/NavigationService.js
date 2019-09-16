import { NavigationActions } from 'react-navigation';

let _navigator;

const getState = () => {
  const { index, routes } = _navigator.state.nav;
  return routes[index].key;
};

const setTopLevelNavigator = navigatorRef => {
  _navigator = navigatorRef;
};

const navigate = (routeName, params) => {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
};

export default {
  getState,
  navigate,
  setTopLevelNavigator,
};
