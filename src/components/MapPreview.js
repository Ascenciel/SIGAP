import React from 'react';
import { View, Text, Pressable } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { STATUS } from '../data/reports';

function MapPreview({ reports, onReport }) {
  return <View style={styles.mapBox}>
    <View style={styles.mapGrid} />
    <View style={[styles.road, styles.roadOne]} /><View style={[styles.road, styles.roadTwo]} /><View style={[styles.road, styles.roadThree]} />
    <View style={styles.river} />
    <Text style={[styles.mapPlace, { top: '18%', left: '9%' }]}>SUKOLILO</Text>
    <Text style={[styles.mapPlace, { top: '48%', left: '41%' }]}>SURABAYA</Text>
    <Text style={[styles.mapPlace, { top: '75%', left: '63%' }]}>RUNGKUT</Text>
    {reports.slice(0, 4).map((r) => <Pressable key={r.id} onPress={() => onReport(r)} style={[styles.pin, { top: `${r.lat}%`, left: `${r.lon}%`, backgroundColor: (STATUS[r.status] || STATUS['Menunggu verifikasi']).dot }]}><View style={styles.pinInner} /></Pressable>)}
    <View style={styles.mapCaption}><View style={styles.liveDot} /><Text style={styles.mapCaptionText}>PETA LAPORAN · SIMULASI</Text></View>
  </View>;
}

export default MapPreview;
