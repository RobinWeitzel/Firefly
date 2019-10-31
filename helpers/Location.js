import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export async function getLocation() {
    return new Promise(async (resolve, reject) => {
        let permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            permission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'This App need access to your location',
                    message:
                        'Shops near you can only be found by accessing your location.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
        }

        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            reject();
        }
        Geolocation.getCurrentPosition(
            (position) => {
                resolve(position);
            },
            (error) => {
                reject();
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    });
}


function deg2rad(deg) {
    return deg * (Math.PI/180)
}

export function calcDistance(pos1, pos2) {
    const lat1 = pos1.latitude;
    const lat2 = pos2.latitude;
    const lon1 = pos1.longitude;
    const lon2 = pos2.longitude;

    const R = 6371e3; // metres
    const φ1 = deg2rad(lat1);
    const φ2 = deg2rad(lat2);
    const Δφ = deg2rad(lat2-lat1);
    const Δλ = deg2rad(lon2-lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c;

    return d;
}