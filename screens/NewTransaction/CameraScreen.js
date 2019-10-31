import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

export default class CameraScreen extends React.Component {
    static navigationOptions = {
        title: 'Camera'
    };

    constructor(props) {
        super(props);

        const { navigation } = this.props;
        this.selected = picture => {
            navigation.getParam('selected')(picture);
            this.props.navigation.goBack();
        };

    }

    takePicture = async() => {
        if (this.camera) {
          const options = { quality: 0.5, base64: true, doNotSave: true, orientation : "portrait"};
          const data = await this.camera.takePictureAsync(options);
          this.selected(data.base64);
        }
      };

    render() {
        return (
            <View style={styles.container}>
            <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.preview}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.off}
              captureAudio={false}
              androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
            />
            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
              <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
                <Text style={{ fontSize: 14 }}> SNAP </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
});