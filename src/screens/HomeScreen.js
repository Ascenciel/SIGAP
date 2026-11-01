import React from 'react';
import { Image, ScrollView, Pressable, Text, View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { SectionTitle, ReportCard, Legend, SafetyNote } from '../components/UI';
import MapPreview from '../components/MapPreview';
import WeatherCard from '../components/WeatherCard';
import NewsPreview from '../components/NewsPreview';

function HomeScreen({ reports, displayName, onNavigate, onSelect, isModerator, weather, news, onRefreshWeather, onUseWeatherLocation, weatherLocationLoading, onOpenNews }) {
  const verified = reports.filter(r => r.status === 'Terverifikasi').length;
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.welcomeRow}><Text style={styles.greeting}>Halo, {displayName || 'warga'} 👋</Text></View>
    <View style={[styles.heroRedesign, { marginBottom: 14 }]}>
      <View style={styles.heroDecoration} />
      <View style={styles.heroContent}>
        <View style={styles.heroEyebrowRow}><View style={styles.heroStatusDot} /><Text style={styles.heroOverlineModern}>INFO KOMUNITAS</Text></View>
        <Text style={styles.heroTitleModern}>Siaga bersama,{ '\n' }lebih siap.</Text>
        <Text style={styles.heroBodyModern}>Pantau situasi sekitar dan bagikan informasi penting kepada warga.</Text>
      </View>
      <View style={styles.heroArt}>
        <View style={styles.heroArtRing} />
        <View style={styles.heroArtCircle}><Image source={require('../../assets/sigap-mark.png')} resizeMode="contain" style={styles.heroLogo} /></View>
      </View>
    </View>
    <WeatherCard data={weather.data} loading={weather.loading} error={weather.error} onRefresh={onRefreshWeather} onUseLocation={onUseWeatherLocation} locationLoading={weatherLocationLoading} />
    <View style={styles.statsRow}><View style={styles.stat}><Text style={styles.statNumber}>{reports.length}</Text><Text style={styles.statLabel}>Laporan aktif</Text></View><View style={styles.statDivider} /><View style={styles.stat}><Text style={[styles.statNumber, { color: C.green }]}>{verified}</Text><Text style={styles.statLabel}>Terverifikasi</Text></View><View style={styles.statDivider} /><View style={styles.stat}><Text style={[styles.statNumber, { color: C.orange }]}>{reports.filter(r => r.status === 'Menunggu verifikasi').length}</Text><Text style={styles.statLabel}>Perlu ditinjau</Text></View></View>
    <SectionTitle title="Pantau sekitar" action="Lihat peta" onPress={() => onNavigate('map')} />
    <MapPreview reports={reports} onReport={onSelect} />
    <View style={styles.legendRow}><Legend color={C.green} label="Terverifikasi" /><Legend color={C.orange} label="Diperiksa" /><Legend color={C.blue} label="Menunggu" /></View>
    <SectionTitle title="Laporan terbaru" action="Semua" onPress={() => onNavigate('map')} />
    {reports.slice(0, 2).map(r => <ReportCard key={r.id} report={r} onPress={() => onSelect(r)} />)}
    <NewsPreview articles={news.data} loading={news.loading} onOpen={onOpenNews} />
    <View style={styles.ctaCard}><View style={{ flex: 1 }}><Text style={styles.ctaTitle}>Ada kondisi yang perlu diketahui?</Text><Text style={styles.ctaText}>Bantu warga sekitar dengan mengirim laporan.</Text></View><Pressable onPress={() => onNavigate('report')} style={styles.ctaButton}><Text style={styles.ctaButtonText}>Lapor  ›</Text></Pressable></View>
    {isModerator ? <Text style={styles.modeHint}>Mode moderator aktif · data tetap simulasi</Text> : null}
    <SafetyNote />
  </ScrollView>;
}

export default HomeScreen;
