import React from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { SectionTitle, ReportCard, Legend, SafetyNote } from '../components/UI';
import MapPreview from '../components/MapPreview';
import WeatherCard from '../components/WeatherCard';
import NewsPreview from '../components/NewsPreview';

function HomeScreen({ reports, onNavigate, onSelect, isModerator, weather, news, onRefreshWeather, onOpenNews }) {
  const verified = reports.filter(r => r.status === 'Terverifikasi').length;
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.welcomeRow}><View><Text style={styles.eyebrow}>SURABAYA · JAWA TIMUR</Text><Text style={styles.greeting}>Halo, warga 👋</Text></View><View style={styles.cityPill}><Text style={{ color: C.green }}>⌖</Text><Text style={styles.cityText}>Surabaya</Text></View></View>
    <View style={styles.simulationBanner}><View style={styles.simIcon}><Text>i</Text></View><Text style={styles.simText}><Text style={{ fontWeight: '800' }}>Mode simulasi.</Text> Seluruh laporan di aplikasi ini adalah data contoh.</Text></View>
    <View style={styles.hero}><View style={{ flex: 1 }}><Text style={styles.heroOverline}>INFORMASI KOMUNITAS</Text><Text style={styles.heroTitle}>Tetap tahu.{ '\n' }Tetap peduli.</Text><Text style={styles.heroBody}>Pantau laporan sekitar dan bantu informasi tetap terbarui.</Text></View><View style={styles.heroGlyph}><Text style={{ fontSize: 35 }}>⌖</Text><View style={styles.heroOrbit} /></View></View>
    <SectionTitle title="Cuaca sekitar" />
    <WeatherCard data={weather.data} loading={weather.loading} error={weather.error} onRefresh={onRefreshWeather} />
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
