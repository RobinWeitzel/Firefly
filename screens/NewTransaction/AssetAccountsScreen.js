import React from 'react';
import { ScrollView, TouchableOpacity, FlatList, Text } from 'react-native';

class Item extends React.Component {
    render() {
        const account = this.props.account;
        const selected = this.props.selected;

        return (
            <TouchableOpacity key={account.id} style={{padding: 20}} onPress={() => selected(account)}>
              <Text style={{fontSize: 20}}>{account.name}</Text>
            </TouchableOpacity>
        );
    }
}

export default class AssetAccountsScreen extends React.Component {
    static navigationOptions  = {
        title: 'Asset Accounts'
    };

    constructor(props) {
        super(props);
        const { navigation } = this.props;
        const accounts = navigation.getParam('accounts');
        this.selected = account => {
            navigation.getParam('selected')(account);
            this.props.navigation.goBack();
        };

        this.state = {
            accounts
        }
    }

    render() {
        return (
        <ScrollView  style={{flex: 1}}>
            <FlatList
                data={this.state.accounts}
                renderItem={({ item }) => <Item account={item} selected={this.selected}/>}
                keyExtractor={item => item.id.toString()}
            />
        </ScrollView >
        );
    }
}
