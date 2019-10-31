import React from 'react';
import { AppState, View, Text, TextInput, TouchableOpacity, Image, ToastAndroid, RefreshControl } from 'react-native';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Storage from '../../helpers/Storage';
import { getLocation } from '../../helpers/Location';
import { ScrollView } from 'react-native-gesture-handler';
import Keyboard from '../../components/Keyboard';
import { thisTypeAnnotation } from '@babel/types';

export default class NewTransactionScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'New Transaction',
            headerRight: (
                <TouchableOpacity style={{ flex: 1, alignItems: "center" }} onPress={() => navigation.getParam('toggleLocation')()}>
                    <Icon
                        name={'my-location'}
                        size={24}
                        style={{ paddingRight: 10 }}
                        color={navigation.getParam('storeLocation') ? '#009688' : '#ccc'}
                    />
                </TouchableOpacity>
            )
        }
    };

    input;
    _mounted = false;

    constructor(props) {
        super(props);

        this.storage = new Storage(this.forceUpdate.bind(this), this);

        this.state = {
            isDateTimePickerVisible: false,
            type: 0,
            assets: [],
            expenses: [],
            revenues: [],
            budgets: [],
            nearby: [],
            storeLocation: false,
            location: null,
            asset: null,
            other: null,
            budget: null,
            amount: 0,
            description: "",
            date: new Date(),
            receipt: "",
            refreshing: false,
            appState: AppState.currentState
        };

        this.types = ["withdrawal", "deposit", "transfer"];
        this.accountTypes = ["expense", "revenue", "asset"];
        this.accountTypeNames = ["Expense Account", "Revenue Account", "Asset Account"];
        this.colorTypes = ["red", "green", "black"];
    }

    componentDidMount() {
        this._mounted = true;
        this.loadData();

        this.props.navigation.setParams({
            toggleLocation: this.toggleLocation,
            storeLocation: this.state.storeLocation
        });

        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        this._mounted = false;
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.loadData();
        }

        this.setState({ appState: nextAppState });
    }

    loadData = () => {
        if(!this._mounted)
            return;

        this.setState({
            assets: this.storage.getAccounts('asset'),
            expenses: this.storage.getAccounts('expense'),
            revenues: this.storage.getAccounts('revenue'),
            budgets: this.storage.getBudgets()
        });

        getLocation().then(location => {
            if(!this._mounted)
                return;

            const nearby = this.storage.getNearby(location.coords.latitude, location.coords.longitude);
            this.setState({ location: location.coords, nearby: nearby }, () => this.loadNearby());
        }
        ).catch(e => ToastAndroid.show('Could not get location.', ToastAndroid.SHORT));
    }

    loadNearby = () => {
        const filteredNearby = this.state.nearby.filter(n => n.account.type === this.accountTypes[this.state.type]);

        if (!this.state.location || filteredNearby.length === 0)
            return;

        const closest = filteredNearby[0].account;

        this.setState({
            other: closest,
            asset: closest.preferredAsset,
            budget: closest.preferredBudget
        });
    }

    reloadData = () => {
        this.loadData();
    }

    showDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: true });
    };

    hideDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: false });
    };

    handleDatePicked = date => {
        this.setState({ date });
        this.hideDateTimePicker();
    };

    toggleType = () => {
        const type = (this.state.type + 1) % this.types.length;
        this.setState({ type, other: null, budget: null }, () => this.loadNearby());
        this.toggleLocation(false);
    }

    toggleLocation = storeLocation => {
        storeLocation = storeLocation === undefined ? !this.state.storeLocation : storeLocation;
        this.setState({ storeLocation });
        this.props.navigation.setParams({storeLocation});
    }

    assetClick = () => {
        this.props.navigation.navigate('Asset', { accounts: this.state.assets, selected: this.assetSelected });
    }

    assetSelected = asset => {
        this.setState({ asset });
    }

    otherClick = () => {
        let type;
        switch(this.state.type) {
            case 0:
                type = "expense";
                break;
            case 1:
                type = "revenue";
                break;
            case 2:
                type = "asset";
                break;
        } 

        const close = this.state.nearby.filter(l => l.account.type === type);
        const closeIds = close.map(l => l.account.id);

        if (type === "expense")
            this.props.navigation.navigate('Expense', { accounts: this.state.expenses.filter(a => closeIds.indexOf(a.id) < 0), close: close, selected: this.otherSelected, newOther: this.newOther });
        else if(type === "revenue")
            this.props.navigation.navigate('Revenue', { accounts: this.state.revenues.filter(a => closeIds.indexOf(a.id) < 0), close: close, selected: this.otherSelected, newOther: this.newOther });
        else
            this.props.navigation.navigate('Asset', { accounts: this.state.assets, selected: this.otherAssetSelected });
    }

    otherSelected = (other, storeLocation) => {
        this.setState({ other, budget: other.preferredBudget, asset: other.preferredAsset });
        this.toggleLocation(storeLocation);
    }

    otherAssetSelected = (other) => {
        this.setState({ other });
        this.toggleLocation(false);
    }

    budgetSelected = budget => {
        this.setState({ budget });
    }

    cameraSelected = receipt => {
        this.setState({ receipt });
    }

    keyboardPress = value => {
        this.setState({ amount: this.state.amount * 10 + value / 100 });
    }

    keyboardDelete = () => {
        const amount = parseFloat(Math.floor(this.state.amount * 10) / 100);
        this.setState({ amount });
    }

    keyboardConfirm = () => {
        if (this.state.asset === null || this.state.other === null || this.state.amount === 0)
            return;

        const data = {
            transactions: [
                {
                    description: this.state.description || "(empty description)",
                    date: moment(this.state.date).format("YYYY-MM-DD"),
                    type: this.types[this.state.type],
                    amount: this.state.amount,
                    source_id: this.state.type === 1 ? this.state.other.id : this.state.asset.id,
                    destination_id: this.state.type === 1 ? this.state.asset.id : this.state.other.id,
                }
            ]
        };

        if(this.state.budget)
            data.transactions[0].budget_id = this.state.budget.id;

        let other = undefined;
        
        if(this.types[this.state.type] !== "transfer") {
            other = {
                id: this.state.other.id,
                updated: new Date(),
                preferredAsset: this.state.asset,
                preferredBudget: this.state.budget
            }
        }

        this.storage.saveTransaction(data, this.state.receipt, other, this.state.storeLocation ? this.state.location : null).then(() => {
            this.setState({
                description: "",
                amount: 0,
                budget: null,
                asset: null,
                other: null,
                receipt: ""
            }, () => this.loadNearby());
            this.toggleLocation(false);
        }).catch(e => ToastAndroid.show('Could not save transaction.', ToastAndroid.SHORT));
    }

    newOther = (name, type) => {
        this.storage.saveOther(name, type)
            .then(other => this.setState({ other }))
            .catch(e => {
                ToastAndroid.show('Could not create account.', ToastAndroid.SHORT);
                this.setState({ other: null });
            });
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ height: 155, backgroundColor: "#F5F5F5", alignItems: "center" }}>
                    <View style={{ height: 60, flexDirection: "row", justifyContent: "space-around", alignItems: "center", margin: 15, marginBottom: 5 }}>
                        <TouchableOpacity style={{ flex: 2 }} onPress={this.assetClick}>
                            <Text style={{ fontSize: 20, textAlign: "center", color: this.state.asset !== null ? "black" : "#ccc" }}>
                                {this.state.asset !== null ? this.state.asset.name : "Asset Account"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, alignItems: "center" }} onPress={this.toggleType}>
                            <Icon
                                name={this.state.type === 2 ? 'swap-horiz': 'trending-flat'}
                                style= {{transform: [{ rotate: this.state.type === 1 ? '180deg' : '0deg' }]}}
                                size={30}
                                color={'#ccc'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 2 }} onPress={this.otherClick}>
                            <Text style={{ fontSize: 20, textAlign: "center", color: this.state.other !== null ? "black" : "#ccc" }}>
                                {this.state.other !== null ? this.state.other.name : this.accountTypeNames[this.state.type]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                        <Text style={{ color: this.colorTypes[this.state.type], fontSize: 40 }}>
                            {"€ " + this.state.amount.toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, flexDiction: "column", justifyContent: "space-between" }}>
                    <ScrollView refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.reloadData}
                        />
                    }>
                        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" }} onPress={() => this.input.focus()}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Description</Text>
                            <TextInput
                                style={{ fontSize: 20, padding: 0 }}
                                onChangeText={(description) => this.setState({ description })}
                                value={this.state.description}
                                ref={x => this.input = x}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" }} onPress={() => this.props.navigation.navigate('Budget', { budgets: this.state.budgets, selected: this.budgetSelected })}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Budget</Text>
                            <Text style={{ fontSize: 20 }}>{this.state.budget !== null ? this.state.budget.name : ""}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" }} onPress={() => this.props.navigation.navigate('Camera', { selected: this.cameraSelected })}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Receipt</Text>
                            <Image style={{ width: 50, height: 25, resizeMode: 'center' }} source={{ uri: `data:image/gif;base64,${this.state.receipt}` }} />
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" }} onPress={this.showDateTimePicker}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Date</Text>
                            <Text style={{ fontSize: 20 }}>{this.state.date.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        <DateTimePicker
                            isVisible={this.state.isDateTimePickerVisible}
                            onConfirm={this.handleDatePicked}
                            onCancel={this.hideDateTimePicker}
                            date={this.state.date}
                        />
                    </ScrollView>
                    <View>
                        <Keyboard style={{ flex: 1 }} onPress={this.keyboardPress} delete={this.keyboardDelete} confirm={this.keyboardConfirm} />
                    </View>
                </View>
            </View>
        );
    }
}