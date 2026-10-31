import React from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import styles from '../theme/styles';
import { STATUS } from '../data/reports';

const SURABAYA = { latitude: -7.2756, longitude: 112.6426 };

function MapPreview({ reports = [], onReport, height = 175, userLocation }) {
  const coordinates = reports.filter(report => Number.isFinite(report.latitude) && Number.isFinite(report.longitude));
  const initialRegion = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 }
    : coordinates.length
    ? { latitude: coordinates.reduce((sum, item) => sum + item.latitude, 0) / coordinates.length,
      longitude: coordinates.reduce((sum, item) => sum + item.longitude, 0) / coordinates.length,
      latitudeDelta: coordinates.length > 1 ? 0.075 : 0.035,
      longitudeDelta: coordinates.length > 1 ? 0.075 : 0.035 }
    : { ...SURABAYA, latitudeDelta: 0.08, longitudeDelta: 0.08 };

  return <View style={[styles.mapBox, { height }]}>
    <MapView style={{ flex: 1 }} initialRegion={initialRegion} showsUserLocation={Boolean(userLocation)}>
      {coordinates.map(report => <Marker
        key={report.id}
        coordinate={{ latitude: report.latitude, longitude: report.longitude }}
        pinColor={(STATUS[report.status] || STATUS['Menunggu verifikasi']).dot}
        title={report.title}
        description={`${report.category} · ${report.status}`}
        onPress={() => onReport?.(report)}
      />)}
    </MapView>
    <View pointerEvents="none" style={styles.mapCaption}><View style={styles.liveDot} /><Text style={styles.mapCaptionText}>PETA INTERAKTIF · PETA PERANGKAT</Text></View>
  </View>;
}

export default MapPreview;
