import React, { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StatusBar, Text, View } from 'react-native';
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

const TABS = [
  { id: 'home', icon: '⌂', label: 'Beranda' },
  { id: 'map', icon: '⌖', label: 'Peta' },
  { id: 'report', icon: '+', label: 'Lapor' },
  { id: 'aid', icon: '✚', label: 'Bantuan' },
  { id: 'news', icon: '▤', label: 'Berita' },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [isModerator, setIsModerator] = useState(false);
  const [reports, setReports] = useState(SEED);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');
  const weather = useRemoteData(fetchWeather);
  const news = useRemoteData(fetchNews);
  const reportCount = useMemo(() => reports.length, [reports]);

  const navigate = id => { setSelected(null); setTab(id); };
  const chooseReport = report => setSelected(report.id);
  const openNews = article => {
    if (article?.url) Linking.openURL(article.url).catch(() => {});
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
      note: '', latitude: -7.2756, longitude: 112.6426,
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

  return <View style={styles.app}>
    <StatusBar barStyle="dark-content" backgroundColor={C.paper} />
    <View style={styles.header}>
      <Pressable onPress={() => navigate('home')} style={styles.brand}>
        <View style={styles.brandMark}><Text style={styles.brandGlyph}>S</Text><View style={styles.brandDot} /></View>
        <View><Text style={styles.brandName}>SIGAP</Text><Text style={styles.brandSub}>INFORMASI KOMUNITAS</Text></View>
      </Pressable>
      <Pressable onPress={() => { setSelected(null); setIsModerator(value => !value); }} style={[styles.modePill, isModerator && styles.modePillActive]}>
        <View style={[styles.modeDot, isModerator && { backgroundColor: '#B6E8D8' }]} />
        <Text style={[styles.modeText, isModerator && { color: C.white }]}>{isModerator ? 'MODERATOR' : 'WARGA'}</Text>
        <Text style={[styles.modeChevron, isModerator && { color: C.white }]}>⌄</Text>
      </Pressable>
    </View>

    <View style={styles.pageBar}><Text style={styles.pageTitle}>{pageTitle}</Text><Text style={styles.simTag}>{tab === 'news' && !selected ? 'SUMBER BERITA' : isModerator ? 'DEMO' : 'SIMULASI'}</Text></View>
    <View style={{ flex: 1 }}>
      {selectedReport ? <DetailScreen key={selectedReport.id} report={selectedReport} onBack={() => setSelected(null)} isModerator={isModerator} onStatus={changeStatus} />
        : isModerator ? <ModeratorScreen reports={reports} onSelect={chooseReport} onStatus={changeStatus} />
          : tab === 'home' ? <HomeScreen reports={reports} onNavigate={navigate} onSelect={chooseReport} isModerator={isModerator} weather={weather} news={news} onRefreshWeather={weather.refresh} onOpenNews={openNews} />
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
  </View>;
}
