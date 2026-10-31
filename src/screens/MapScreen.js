import React, { useState } from 'react';
import { Alert, ScrollView, Pressable, Text, View } from 'react-native';
import * as Location from 'expo-location';
import C from '../theme/colors';
import styles from '../theme/styles';
import { CATEGORIES } from '../data/reports';
import { SectionTitle, ReportCard, Legend, SafetyNote } from '../components/UI';
import MapPreview from '../components/MapPreview';

function MapScreen({ reports, onSelect }) {
  const [filter, setFilter] = useState('Semua');
  const [userLocation, setUserLocation] = useState(null);
  const filtered = filter === 'Semua' ? reports : reports.filter(r => r.category === filter);
  const showMyLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin lokasi diperlukan', 'Izinkan akses lokasi untuk memusatkan peta ke posisi Anda.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    } catch {
      Alert.alert('Lokasi tidak tersedia', 'Periksa pengaturan lokasi perangkat lalu coba lagi.');
    }
  };
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>PETA KOMUNITAS</Text><Text style={styles.screenTitle}>Laporan sekitar</Text><Text style={styles.screenSubtitle}>Lihat lokasi dan status setiap laporan.</Text>
    <Pressable onPress={showMyLocation} style={styles.locationPill}><Text style={{ color: C.green }}>⌖</Text><Text style={styles.locationText}>{userLocation ? 'Lokasi saya' : 'Surabaya, Jawa Timur'}</Text><Text style={styles.changeText}>{userLocation ? 'Perbarui' : 'Lokasi saya'}</Text></Pressable>
    <MapPreview key={userLocation ? `${userLocation.latitude},${userLocation.longitude}` : 'surabaya'} reports={filtered} onReport={onSelect} height={290} userLocation={userLocation} />
    <View style={styles.legendRow}><Legend color={C.green} label="Terverifikasi" /><Legend color={C.orange} label="Diperiksa" /><Legend color={C.blue} label="Menunggu" /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>{['Semua', ...CATEGORIES].map(c => <Pressable key={c} onPress={() => setFilter(c)} style={[styles.filterChip, filter === c && styles.filterChipActive]}><Text style={[styles.filterChipText, filter === c && styles.filterChipTextActive]}>{c}</Text></Pressable>)}</ScrollView>
    <SectionTitle title={`${filtered.length} laporan`} />
    {filtered.map(r => <ReportCard key={r.id} report={r} onPress={() => onSelect(r)} />)}
    <View style={styles.mapCaveat}><Text style={styles.caveatIcon}>ⓘ</Text><Text style={styles.caveatText}>Tidak adanya laporan di suatu lokasi bukan berarti lokasi tersebut aman.</Text></View>
    <SafetyNote />
  </ScrollView>;
}

export default MapScreen;
