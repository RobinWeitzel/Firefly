import React from 'react';
import { Text } from 'react-native';

export default class TabBarLabel extends React.Component {
  render() {
    return (
      <Text style= {{fontSize: 16, color: this.props.focused ? '#009688' : '#ccc'}}>{this.props.name}</Text>
    );
  }
}