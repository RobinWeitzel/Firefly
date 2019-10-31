import React from 'react';
import { ScrollView, TouchableOpacity, FlatList, Text, View, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

class Item extends React.Component {
    render() {
        const account = this.props.account;
        const selected = this.props.selected;

        return (
            <TouchableOpacity key={account.id} style={{padding: 20}} onPress={() => selected(account, true)}>
              <Text style={{fontSize: 20}}>{account.name}</Text>
            </TouchableOpacity>
        );
    }
}

class Item2 extends React.Component {
    render() {
        const l = this.props.location;
        const selected = this.props.selected;

        return (
            <TouchableOpacity key={l.account.id} style={{padding: 20, flexDirection: "row", justifyContent: "space-between"}} onPress={() => selected(l.account, false)}>
              <Text style={{fontSize: 20}}>{l.account.name}</Text>
              <Text style={{fontSize: 20}}>{Math.round(l.distance) + "m"}</Text>
            </TouchableOpacity>
        );
    }
}

export default class AssetAccountsScreen extends React.Component {
    static navigationOptions  = {
        title: 'Expense Accounts'
    };

    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const accounts = navigation.getParam('accounts');
        const close = navigation.getParam('close');

        this.state = {
            accounts,
            close,
            search: ""
        }
    }

    selected = (account, location) => {
        this.props.navigation.getParam('selected')(account, location);
        this.props.navigation.goBack();
    };

    newOther = (name, type) => {
        this.props.navigation.getParam('newOther')(name, type);
        this.props.navigation.goBack();
    }

    search(item, searchTerm) {
        for (let word of item.split(' ')) {
            if (word.startsWith(searchTerm)) {
                return true;
            }
        }
        return false;
    }

    newItem = show => {
        if(!show)
            return null;

        return (
            <TouchableOpacity style={{padding: 20, flexDirection: "row", justifyContent: "space-between"}} onPress={() => this.newOther(this.state.search, 'expense')}>
                <Text style={{fontSize: 20 }}>
                    {this.state.search}
                </Text>
                <Icon
                        name={'add'}
                        size={30}
                        color='#009688'
                    />
            </TouchableOpacity>
        );
    }

    render() {
        const close = this.state.close.filter(l => this.search(l.account.name.toLowerCase(), this.state.search.toLowerCase()));
        const account = this.state.accounts.filter(a => this.search(a.name.toLowerCase(), this.state.search.toLowerCase()));

        let showNewItem = true;
        for(const a of [...close.map(l => l.account), ...account]) {
            if(this.state.search === "" || this.state.search.toLowerCase() === a.name.toLowerCase()) {
                showNewItem = false;
                break;
            }
        }

        return (
            <ScrollView  style={{flex: 1}} keyboardShouldPersistTaps={'always'}>
                <View style={{backgroundColor: "#F5F5F5", padding: 10}}>
                    <TextInput style={{fontSize: 20}} placeholder="Search Accounts" value={this.state.search} onChangeText={search => this.setState({ search })} />
                </View>
                {this.newItem(showNewItem)}
                <FlatList
                    keyboardShouldPersistTaps={'always'}
                    data={close}
                    renderItem={({ item }) => <Item2 location={item} selected={this.selected} />}
                    keyExtractor={item => item.account.id.toString()}
                />
                <FlatList
                    keyboardShouldPersistTaps={'always'}
                    data={account}
                    renderItem={({ item }) => <Item account={item} selected={this.selected} />}
                    keyExtractor={item => item.id.toString()}
                />
            </ScrollView >
        );
    }
}
