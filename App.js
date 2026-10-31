import 'expo-dev-client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, Modal, Platform, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import * as ExpoLinking from 'expo-linking';
import C from './src/theme/colors';
import styles from './src/theme/styles';
import { SEED } from './src/data/reports';
import useRemoteData from './src/hooks/useRemoteData';
import { fetchWeather } from './src/services/weatherApi';
import { fetchNews } from './src/services/newsApi';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import ReportScreen from './src/screens/ReportScreen';
import AidScreen from './src/screens/AidScreen';
import NewsScreen from './src/screens/NewsScreen';
import ModeratorScreen from './src/screens/ModeratorScreen';
import DetailScreen from './src/screens/DetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import { isSupabaseConfigured, supabase } from './src/services/supabase';

WebBrowser.maybeCompleteAuthSession();

const TABS = [
  { id: 'home', icon: '⌂', label: 'Beranda' },
  { id: 'map', icon: '⌖', label: 'Peta' },
  { id: 'report', icon: '+', label: 'Lapor' },
  { id: 'aid', icon: '✚', label: 'Bantuan' },
  { id: 'news', icon: '▤', label: 'Berita' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState('home');
  const [isModerator, setIsModerator] = useState(false);
  const [profileRole, setProfileRole] = useState('warga');
  const [displayName, setDisplayName] = useState('');
  const [weatherLocation, setWeatherLocation] = useState(null);
  const [weatherLocationLoading, setWeatherLocationLoading] = useState(false);
  const [locationConsentVisible, setLocationConsentVisible] = useState(false);
  const [reports, setReports] = useState(SEED);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');
  const weatherLoader = useCallback(() => fetchWeather(weatherLocation), [weatherLocation]);
  const weather = useRemoteData(weatherLoader);
  const news = useRemoteData(fetchNews);
  const reportCount = useMemo(() => reports.length, [reports]);

  const updateWeatherLocation = useCallback(async (requestPermission = false) => {
    setWeatherLocationLoading(true);
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && requestPermission) permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) return false;

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      let area = 'Lokasi saat ini';
      let address = null;
      try { address = (await Location.reverseGeocodeAsync(coordinates))?.[0]; } catch { }
      const addressParts = [...new Set([address?.district, address?.subregion, address?.city, address?.region].filter(Boolean))];
      if (addressParts.length) area = addressParts.join(', ');
      setWeatherLocation({ ...coordinates, area });
      return true;
    } catch {
      return false;
    } finally {
      setWeatherLocationLoading(false);
    }
  }, []);

  useEffect(() => { updateWeatherLocation(false); }, [updateWeatherLocation]);

  const chooseWeatherLocation = async () => {
    const loaded = await updateWeatherLocation(true);
    if (!loaded) Alert.alert('Lokasi tidak tersedia', 'Izinkan akses lokasi dan pastikan layanan lokasi perangkat aktif.');
  };

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return undefined; }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadProfileRole(data.session.user);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) setTimeout(() => {
        syncProfile(nextSession.user).then(() => loadProfileRole(nextSession.user)).catch(() => { });
      }, 0);
      if (_event === 'SIGNED_IN' && nextSession?.user) setTimeout(async () => {
        try {
          const permission = await Location.getForegroundPermissionsAsync();
          if (!permission.granted) setLocationConsentVisible(true);
        } catch { setLocationConsentVisible(true); }
      }, 250);
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = async user => {
    if (!supabase || !user) return;
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    }, { onConflict: 'id' });
  };

  const loadProfileRole = async user => {
    if (!supabase || !user) { setProfileRole('warga'); return; }
    const { data } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
    setProfileRole(data?.role === 'moderator' ? 'moderator' : 'warga');
    const fullName = data?.full_name?.trim() || user.user_metadata?.full_name?.trim() || user.user_metadata?.name?.trim();
    setDisplayName(fullName?.split(/\s+/)[0] || user.email?.split('@')[0] || '');
    if (data?.role !== 'moderator') setIsModerator(false);
  };

  const handleAuth = async ({ mode, name, email, password }) => {
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw error;
      if (data.session && data.user) await syncProfile(data.user);
      if (data.user) await loadProfileRole(data.user);
      return data.session ? '' : 'Pendaftaran berhasil. Periksa email Anda untuk konfirmasi sebelum masuk.';
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await syncProfile(data.user);
    await loadProfileRole(data.user);
    return '';
  };


  const handleGoogle = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase belum dikonfigurasi.');
      }

      const redirectTo =
        Platform.OS === 'web'
          ? `${window.location.origin}/auth/callback`
          : ExpoLinking.createURL('auth/callback');

      console.log('[OAuth] Redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      console.log('[OAuth] Opening browser...');

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      console.log('[OAuth] Browser result:', result.type);

      if (result.type !== 'success' || !result.url) {
        throw new Error(
          `Login Google tidak selesai. Browser result: ${result.type}`
        );
      }

      const callbackUrl = new URL(result.url);

      const fragment = new URLSearchParams(
        callbackUrl.hash.replace(/^#/, '')
      );

      const query = callbackUrl.searchParams;

      const oauthError =
        query.get('error_description') ||
        query.get('error') ||
        fragment.get('error_description') ||
        fragment.get('error');

      if (oauthError) throw new Error(oauthError);

      const code = query.get('code') || fragment.get('code');

      const access_token =
        fragment.get('access_token') ||
        query.get('access_token');

      const refresh_token =
        fragment.get('refresh_token') ||
        query.get('refresh_token');

      console.log('[OAuth] Callback received:', {
        hasCode: !!code,
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        queryKeys: [...query.keys()],
        fragmentKeys: [...fragment.keys()],
      });

      if (!code && (!access_token || !refresh_token)) {
        throw new Error(
          `Callback tidak memiliki kredensial login. Redirect: ${redirectTo}`
        );
      }

      const { data: sessionData, error: sessionError } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

      if (sessionError) throw sessionError;

      console.log('[OAuth] Session created:', !!sessionData.session);

      if (sessionData.user) {
        await syncProfile(sessionData.user);
        await loadProfileRole(sessionData.user);
      }

      return '';
    } catch (error) {
      console.error('[OAuth] Login failed:', error);
      throw error;
    }
  };


  if (!authReady) return <SafeAreaView style={[styles.app, { alignItems: 'center', justifyContent: 'center' }]}><StatusBar barStyle="dark-content" backgroundColor={C.paper} /><Image source={require('./assets/sigap-logo.png')} resizeMode="contain" style={{ width: 320, height: 320 }} accessibilityLabel="Logo SIGAP" /></SafeAreaView>;
  if (!session) return <SafeAreaView style={styles.app}><StatusBar barStyle="dark-content" backgroundColor={C.paper} /><AuthScreen onSubmit={handleAuth} onGoogle={handleGoogle} configured={isSupabaseConfigured} /></SafeAreaView>;

  const navigate = id => { setSelected(null); setTab(id); };
  const chooseReport = report => setSelected(report.id);
  const openNews = article => {
    if (article?.url) Linking.openURL(article.url).catch(() => { });
    else navigate('news');
  };
  const createReport = draft => {
    const report = {
      id: `SG-${String(2409 + reports.length - SEED.length).padStart(4, '0')}`,
      ...draft,
      title: `${draft.category} dilaporkan di ${draft.place}`,
      time: 'Baru saja',
      updated: 'Baru saja',
      status: 'Menunggu verifikasi',
      source: 'Laporan warga · belum diperiksa',
      note: '', latitude: draft.latitude ?? -7.2756, longitude: draft.longitude ?? 112.6426,
    };
    setReports(previous => [report, ...previous]);
  };
  const changeStatus = (report, status, note) => {
    const next = reports.map(item => item.id === report.id ? {
      ...item,
      status,
      note: note?.trim() || (status === 'Terverifikasi' ? 'Diperiksa oleh moderator demo.' : item.note),
      updated: 'Baru saja',
      history: [...(item.history || []), {
        status,
        note: note?.trim() || (status === 'Terverifikasi' ? 'Diperiksa oleh moderator demo.' : `Status diubah menjadi ${status}.`),
        time: 'Baru saja',
      }],
      source: status === 'Terverifikasi' ? 'Laporan warga · diperiksa moderator' : item.source,
    } : item);
    setReports(next);
    setToast(`${report.id} diperbarui · ${status}`);
    setTimeout(() => setToast(''), 2300);
  };

  const selectedReport = reports.find(report => report.id === selected);
  const pageTitles = { home: 'Beranda', map: 'Peta komunitas', report: 'Pelaporan', aid: 'Bantuan & posko', news: 'Berita kebencanaan' };
  const pageTitle = selectedReport ? 'Detail laporan' : isModerator ? 'Ruang moderator' : pageTitles[tab];

  return <SafeAreaView style={styles.app}>
    <StatusBar barStyle="dark-content" backgroundColor={C.paper} />
    <View style={styles.header}>
      <Pressable onPress={() => navigate('home')} style={styles.brand}>
        <Image source={require('./assets/sigap-mark.png')} resizeMode="contain" style={{ width: 42, height: 42 }} accessibilityLabel="Logo perisai SIGAP" />
        <View style={styles.brandCopy}><Text style={styles.brandName}>SIGAP</Text><Text style={styles.brandSub}>Sistem Informasi dan Gerak Aksi Penanggulangan Bencana</Text></View>
      </Pressable>
      {profileRole === 'moderator' ? <Pressable accessibilityLabel="Ganti tampilan warga atau moderator" onPress={() => { setSelected(null); setIsModerator(value => !value); }} style={[styles.modePill, isModerator && styles.modePillActive]}>
        <View style={[styles.modeDot, isModerator && { backgroundColor: '#B6E8D8' }]} />
        <Text style={[styles.modeText, isModerator && { color: C.white }]}>{isModerator ? 'MODERATOR' : 'WARGA'}</Text>
        <Text style={[styles.modeChevron, isModerator && { color: C.white }]}>⌄</Text>
      </Pressable> : null}
      {session?.user ? <Pressable accessibilityLabel="Keluar" onPress={() => supabase.auth.signOut()} style={{ padding: 8 }}><Text style={{ color: C.muted, fontSize: 10, fontWeight: '700' }}>Keluar</Text></Pressable> : null}
    </View>

    <View style={styles.pageBar}><Text style={styles.pageTitle}>{pageTitle}</Text><Text style={styles.simTag}>{tab === 'news' && !selected ? 'SUMBER BERITA' : isModerator ? 'DEMO' : 'SIMULASI'}</Text></View>
    <View style={{ flex: 1 }}>
      {selectedReport ? <DetailScreen key={selectedReport.id} report={selectedReport} onBack={() => setSelected(null)} isModerator={isModerator} onStatus={changeStatus} />
        : isModerator ? <ModeratorScreen reports={reports} onSelect={chooseReport} onStatus={changeStatus} />
          : tab === 'home' ? <HomeScreen reports={reports} displayName={displayName} onNavigate={navigate} onSelect={chooseReport} isModerator={isModerator} weather={weather} news={news} onRefreshWeather={weather.refresh} onUseWeatherLocation={chooseWeatherLocation} weatherLocationLoading={weatherLocationLoading} onOpenNews={openNews} />
            : tab === 'map' ? <MapScreen reports={reports} onSelect={chooseReport} />
              : tab === 'report' ? <ReportScreen onSubmit={createReport} onNavigate={navigate} />
                : tab === 'aid' ? <AidScreen />
                  : <NewsScreen articles={news.data} loading={news.loading} error={news.error} onRefresh={news.refresh} />}
    </View>

    {toast ? <View style={styles.toast}><Text style={styles.toastText}>✓  {toast}</Text></View> : null}
    {!isModerator && !selectedReport ? <View style={styles.tabBar}>{TABS.map(item =>
      <Pressable key={item.id} onPress={() => navigate(item.id)} style={styles.tabItem}>
        <View style={[styles.tabIconWrap, tab === item.id && styles.tabIconWrapActive]}>
          <Text style={[styles.tabIcon, tab === item.id && styles.tabIconActive]}>{item.icon}</Text>
          {item.id === 'map' && reportCount > 0 ? <View style={styles.tabBadge} /> : null}
        </View>
        <Text style={[styles.tabLabel, tab === item.id && styles.tabLabelActive]}>{item.label}</Text>
      </Pressable>)}
    </View> : null}
    {isModerator && !selectedReport ? <View style={styles.tabBar}><Pressable onPress={() => setIsModerator(false)} style={styles.exitMode}><Text style={styles.exitModeIcon}>‹</Text><Text style={styles.exitModeText}>Kembali ke tampilan warga</Text></Pressable></View> : null}
    <Modal transparent visible={locationConsentVisible} animationType="fade" onRequestClose={() => setLocationConsentVisible(false)}>
      <View style={styles.locationConsentBackdrop}>
        <View style={styles.locationConsentCard}>
          <View style={styles.locationConsentIcon}><Text style={styles.locationConsentGlyph}>⌖</Text></View>
          <Text style={styles.locationConsentTitle}>Aktifkan akses lokasi?</Text>
          <Text style={styles.locationConsentBody}>Lokasi dipakai untuk menandai posisi Anda di peta dan menampilkan cuaca sekitar. Anda bisa memilih Nanti dan mengaktifkannya kapan saja.</Text>
          <Pressable onPress={async () => { setLocationConsentVisible(false); await chooseWeatherLocation(); }} style={styles.locationConsentPrimary}><Text style={styles.locationConsentPrimaryText}>Izinkan lokasi</Text></Pressable>
          <Pressable onPress={() => setLocationConsentVisible(false)} style={styles.locationConsentSecondary}><Text style={styles.locationConsentSecondaryText}>Nanti</Text></Pressable>
        </View>
      </View>
    </Modal>
  </SafeAreaView>;
}
