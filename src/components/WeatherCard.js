import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { WEATHER_SOURCE } from '../services/weatherApi';

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function WeatherCard({ data, loading, error, onRefresh, onUseLocation, locationLoading }) {
  return <View style={styles.weatherCard}>
    <View style={styles.weatherHeader}>
      <View style={{ flex: 1 }}><Text style={styles.weatherKicker}>CUACA SAAT INI</Text><Text style={styles.weatherArea}>{data?.area || 'Lokasi belum dipilih'}</Text></View>
      <Text style={styles.weatherGlyph}>☁</Text>
    </View>
    <Pressable accessibilityRole="button" onPress={onUseLocation} disabled={locationLoading} style={styles.weatherLocationButton}>
      <Text style={styles.weatherLocationText}>{locationLoading ? 'Mengambil lokasi…' : data?.area ? 'Perbarui lokasi saya' : 'Gunakan lokasi saya'}</Text>
    </Pressable>
    {loading && !data ? <Text style={styles.weatherMessage}>Mengambil cuaca untuk lokasi Anda…</Text> : error && !data ? <View style={styles.weatherError}>
      <Text style={styles.weatherMessage}>{error}</Text>
      <Pressable onPress={onUseLocation}><Text style={styles.link}>Aktifkan lokasi</Text></Pressable>
    </View> : <>
      <View style={styles.weatherMain}>
        <Text style={styles.weatherTemperature}>{data?.temperature ?? '—'}°C</Text>
        <View style={styles.weatherDivider} />
        <View><Text style={styles.weatherCondition}>{data?.description || 'Cuaca belum tersedia'}</Text><Text style={styles.weatherMeta}>Kelembapan {data?.humidity ?? '—'}%  ·  Angin {data?.wind ?? '—'} km/j</Text></View>
      </View>
      {error ? <Text style={styles.weatherWarning}>Data terakhir tersedia · gagal diperbarui</Text> : null}
      <Text style={styles.weatherValid}>Pembaruan {formatTime(data?.updatedAt || data?.localTime)}</Text>
    </>}
    <View style={styles.weatherFooter}>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://open-meteo.com/').catch(() => {})}><Text style={styles.weatherSource}>{WEATHER_SOURCE}</Text></Pressable>
      <Pressable accessibilityLabel="Perbarui cuaca" onPress={onRefresh}><Text style={styles.weatherRefresh}>↻</Text></Pressable>
    </View>
    <Text style={styles.weatherDisclaimer}>Informasi cuaca umum, bukan peringatan dini. Ikuti informasi resmi BMKG.</Text>
  </View>;
}
