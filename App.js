import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import codePush from "react-native-code-push";

export default class App extends React.Component {
  render() {
    return <AppNavigator />;
  }
}