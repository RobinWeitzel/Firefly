import React from 'react';
import { View, ScrollView, Text, TextInput, Button, ToastAndroid, Keyboard} from 'react-native';
import Storage from '../../helpers/Storage';

export default class SettingsScreen extends React.Component {
    static navigationOptions = {
        title: 'Settings'
    };

    constructor(props) {
        super(props);

        this.storage = new Storage();
        this.state = this.storage.getSettings();
    }

    save = () => {
        try {
            Keyboard.dismiss();
            this.storage.saveSettings(this.state.url, this.state.token);
        } catch (e) {
            ToastAndroid.show('Could not save settings.', ToastAndroid.SHORT);
        }
    }

    render() {
        return (
            <View style={{ flex: 1, padding: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>Firefly URL</Text>
                <TextInput placeholder="URL" value={this.state.url} style={{ fontSize: 20 }} onChangeText={url => this.setState({ url: url, token: this.state.token })} autoCorrect={false} />

                <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>Firefly API Token</Text>
                <ScrollView style={{ marginBottom: 20 }}>
                    <TextInput autoCompleteType="off" autoCorrect={false} placeholder="API Token" value={this.state.token} style={{ fontSize: 20, textAlignVertical: "top" }} onChangeText={token => this.setState({ url: this.state.url, token: token })} multiline numberOfLines={6} />
                </ScrollView>
                <Button title="Save" color='#3c8dbc' onPress={this.save}></Button>
            </View >
        );
    }
}
