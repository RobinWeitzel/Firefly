/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import codePush from "react-native-code-push";

export default class App extends React.Component {
  render() {
    return <AppNavigator />;
  }
}

/*const App: () => React$Node = () => {
  const onButtonPress = () => {
    codePush.sync({
      updateDialog: true,
      installMode: codePush.InstallMode.IMMEDIATE
    });
  }

  return (
    <AppNavigator />
  );
};

export default App;*/
