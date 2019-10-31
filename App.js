import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import codePush from "react-native-code-push";

class App extends React.Component {
  render() {
    return <AppNavigator />;
  }
}

export default codePush(App);