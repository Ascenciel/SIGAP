import React, { useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { Badge, SectionTitle, SafetyNote } from '../components/UI';
import { AID } from '../data/aid';

function AidScreen() {
  const [filter, setFilter] = useState('Semua');
  const items = filter === 'Semua' ? AID : AID.filter(x => x.type.includes(filter));
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>INFORMASI DENGAN SUMBER</Text><Text style={styles.screenTitle}>Bantuan & posko</Text><Text style={styles.screenSubtitle}>Periksa status dan waktu pembaruan sebelum mengandalkan informasi.</Text>
    <View style={styles.aidBanner}><Text style={styles.aidBannerIcon}>✚</Text><View style={{ flex: 1 }}><Text style={styles.aidBannerTitle}>Butuh bantuan darurat?</Text><Text style={styles.aidBannerText}>Hubungi kanal darurat resmi atau BPBD setempat.</Text></View></View>
    <View style={styles.locationPill}><Text style={{ color: C.green }}>⌖</Text><Text style={styles.locationText}>Sekitar Surabaya</Text><Text style={styles.changeText}>Ubah</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>{['Semua', 'Posko', 'Titik distribusi'].map(c => <Pressable key={c} onPress={() => setFilter(c)} style={[styles.filterChip, filter === c && styles.filterChipActive]}><Text style={[styles.filterChipText, filter === c && styles.filterChipTextActive]}>{c}</Text></Pressable>)}</ScrollView>
    <SectionTitle title="Lokasi informasi" />
    {items.map(item => <View key={item.name} style={styles.aidCard}><View style={styles.aidCardTop}><View style={[styles.aidAvatar, { backgroundColor: item.tint }]}><Text style={{ color: C.deep, fontWeight: '800' }}>{item.initials}</Text></View><View style={{ flex: 1 }}><Text style={styles.aidName}>{item.name}</Text><Text style={styles.aidType}>{item.type}  ·  {item.distance}</Text></View><Text style={styles.chevron}>›</Text></View><Text style={styles.aidDetail}>{item.detail}</Text><View style={styles.aidCardBottom}><Badge status={item.status} small /><Text style={styles.aidUpdated}>{item.updated}</Text></View><Text style={styles.aidSource}>Sumber: data demonstrasi SIGAP</Text></View>)}
    <View style={styles.mapCaveat}><Text style={styles.caveatIcon}>ⓘ</Text><Text style={styles.caveatText}>Informasi bantuan ini adalah simulasi, bukan konfirmasi ketersediaan layanan saat ini.</Text></View><SafetyNote />
  </ScrollView>;
}

export default AidScreen;
