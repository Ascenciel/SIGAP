import C from '../theme/colors';

const SEED = [
  { id: 'SG-2408', title: 'Genangan mulai naik di Jalan Raya Darmo', category: 'Banjir', place: 'Wonokromo, Surabaya', time: '12 menit lalu', status: 'Terverifikasi', description: 'Air mulai menggenangi bahu jalan setelah hujan deras. Kendaraan masih dapat melintas dengan hati-hati.', source: 'Laporan warga · diperiksa moderator', note: 'Dikonfirmasi melalui dua laporan warga yang berbeda.', lat: 28, lon: 69 },
  { id: 'SG-2407', title: 'Pohon tumbang menutup sebagian jalan', category: 'Cuaca ekstrem', place: 'Sukolilo, Surabaya', time: '28 menit lalu', status: 'Sedang diperiksa', description: 'Pohon tumbang menutup satu lajur. Mohon berhati-hati saat melintas.', source: 'Laporan warga', note: '', lat: 61, lon: 44 },
  { id: 'SG-2406', title: 'Asap terlihat di area lahan kosong', category: 'Kebakaran', place: 'Rungkut, Surabaya', time: '1 jam lalu', status: 'Menunggu verifikasi', description: 'Terlihat asap dari lahan kosong di dekat permukiman. Belum diketahui penyebabnya.', source: 'Laporan warga · belum diperiksa', note: '', lat: 72, lon: 72 },
  { id: 'SG-2405', title: 'Permukaan air sungai kembali normal', category: 'Banjir', place: 'Gunung Anyar, Surabaya', time: 'Kemarin', status: 'Perlu pembaruan', description: 'Laporan kondisi sungai setelah hujan. Informasi terakhir perlu dikonfirmasi ulang.', source: 'Laporan warga', note: 'Status lama; mohon cek informasi terbaru.', lat: 42, lon: 83 },
];

const STATUS = {
  'Terverifikasi': { fg: C.green, bg: C.mint, dot: C.green },
  'Sedang diperiksa': { fg: C.orange, bg: C.orangeBg, dot: C.orange },
  'Menunggu verifikasi': { fg: C.blue, bg: C.blueBg, dot: C.blue },
  'Ditolak': { fg: C.red, bg: C.redBg, dot: C.red },
  'Perlu pembaruan': { fg: C.muted, bg: '#EDF0EF', dot: '#909C98' },
};

const CATEGORIES = ['Banjir', 'Kebakaran', 'Cuaca ekstrem', 'Longsor', 'Kekeringan'];
const REVIEW_STATES = ['Menunggu verifikasi', 'Sedang diperiksa', 'Terverifikasi', 'Ditolak', 'Perlu pembaruan'];

export { SEED, STATUS, CATEGORIES, REVIEW_STATES };
