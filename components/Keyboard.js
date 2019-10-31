import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class Keyboard extends React.Component {
    render() {
        return (
            <View style={styles.main}>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(7)}>
                        <Text style={styles.text}>7</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(8)}>
                        <Text style={styles.text}>8</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(9)}>
                        <Text style={styles.text}>9</Text>
                    </TouchableOpacity>
                    <View style={styles.placeholder}></View>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(4)}>
                        <Text style={styles.text}>4</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(5)}>
                        <Text style={styles.text}>5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(6)}>
                        <Text style={styles.text}>6</Text>
                    </TouchableOpacity>
                    <View style={styles.placeholder}></View>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(1)}>
                        <Text style={styles.text}>1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(2)}>
                        <Text style={styles.text}>2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(3)}>
                        <Text style={styles.text}>3</Text>
                    </TouchableOpacity>
                    <View style={styles.placeholder}></View>
                </View>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}></View>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.onPress(0)}>
                        <Text style={styles.text}>0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.placeholder} onPress={this.props.delete}>
                        <Icon name="backspace" size={32} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.placeholder} onPress={this.props.confirm}>
                        <Icon name="check-circle" size={40} color='#009688' />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    main: {
        height: 200,
        flexDirection: 'column',
        borderTopColor: 'lightgray',
        borderTopWidth: 1
    },
    row: {
        flexDirection: 'row',
        flex: 1
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        fontSize: 25
    },
    placeholder: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center'
    }
});