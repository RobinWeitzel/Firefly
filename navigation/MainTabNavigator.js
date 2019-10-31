import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import TabBarIcon from '../components/TabBarIcon';
import NewTransactionScreen from '../screens/NewTransaction/NewTranscationScreen';
import AssetAccountsScreen from '../screens/NewTransaction/AssetAccountsScreen';
import ExpenseAccountsScreen from '../screens/NewTransaction/ExpenseAccountsScreen';
import RevenueAccountsScreen from '../screens/NewTransaction/RevenueAccountsScreen';
import BudgetsScreen from '../screens/NewTransaction/BudgetsScreen';
import CameraScreen from '../screens/NewTransaction/CameraScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const NewTransactionStack = createStackNavigator({
  Transaction: NewTransactionScreen,
  Asset: AssetAccountsScreen,
  Expense: ExpenseAccountsScreen,
  Revenue: RevenueAccountsScreen,
  Budget: BudgetsScreen,
  Camera: CameraScreen
});

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen
});

NewTransactionStack.navigationOptions = {
  tabBarLabel: 'New Transactions',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name='edit'
    />
  ),
  tabBarOptions: {
    activeTintColor: '#009688',
    inactiveTintColor: '#ccc'
  }
};

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name='edit'
    />
  ),
  tabBarOptions: {
    activeTintColor: '#009688',
    inactiveTintColor: '#ccc'
  }
};

export default createBottomTabNavigator({
  NewTransactionStack,
  SettingsStack
});
