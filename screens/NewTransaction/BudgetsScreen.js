import React from 'react';
import { ScrollView, TouchableOpacity, FlatList, Text, View, TextInput } from 'react-native';

class Item extends React.Component {
    render() {
        const budget = this.props.budget;
        const selected = this.props.selected;

        return (
            <TouchableOpacity key={budget.id} style={{padding: 20}} onPress={() => selected(budget)}>
              <Text style={{fontSize: 20}}>{budget.name}</Text>
            </TouchableOpacity>
        );
    }
}

export default class BudgetsScreen extends React.Component {
    static navigationOptions  = {
        title: 'Budgets'
    };

    constructor(props) {
        super(props);
        const { navigation } = this.props;
        const budgets = navigation.getParam('budgets');
        this.selected = budget => {
            navigation.getParam('selected')(budget);
            this.props.navigation.goBack();
        };

        this.state = {
            budgets,
            search: ""
        }
    }

    search(item, searchTerm) {
        for (let word of item.split(' ')) {
            if (word.startsWith(searchTerm)) {
                return true;
            }
        }
        return false;
    }

    render() {
        const budgets = this.state.budgets.filter(b => this.search(b.name.toLowerCase(), this.state.search.toLowerCase()));

        return (
        <ScrollView  style={{flex: 1}}>
            <View style={{backgroundColor: "#F5F5F5", padding: 10}}>
                <TextInput style={{fontSize: 20}} placeholder="Search Budgets" value={this.state.search} onChangeText={search => this.setState({ search })} />
            </View>
            <FlatList
                data={budgets}
                renderItem={({ item }) => <Item budget={item} selected={this.selected}/>}
                keyExtractor={item => item.id.toString()}
            />
        </ScrollView >
        );
    }
}
