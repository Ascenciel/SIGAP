
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import C from '../theme/colors';
import styles from '../theme/styles';
import { STATUS, REVIEW_STATES } from '../data/reports';
import { Badge, SafetyNote } from '../components/UI';
import MapPreview from '../components/MapPreview';
import { fetchReportPhotos } from '../services/reportService';

function DetailScreen({ report, onBack, isModerator, onStatus }) {
  const [note, setNote] = useState(report.note || '');
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadPhotos = async () => {
      try {
        setPhotosLoading(true);

        const result = await fetchReportPhotos(report.id);

        if (active) setPhotos(result);
      } catch (error) {
        console.error('[Reports] Failed to load photos:', error);

        if (active) setPhotos([]);
      } finally {
        if (active) setPhotosLoading(false);
      }
    };

    loadPhotos();

    return () => {
      active = false;
    };
  }, [report.id]);

  const history = (
    report.history?.length
      ? report.history
      : [{
        status: report.status,
        note: report.note || 'Laporan diterima untuk pemeriksaan.',
        time: report.time,
      }]
  ).slice().reverse();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹  Kembali</Text>
      </Pressable>

      <Text style={styles.eyebrow}>
        {report.id} · {report.category.toUpperCase()}
      </Text>

      <Text style={styles.detailTitle}>{report.title}</Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginTop: 12,
        }}
      >
        <Badge status={report.status} />
        <Text style={styles.metaText}>{report.time}</Text>
      </View>

      {/* Lokasi laporan */}
      <View style={styles.detailMap}>
        {Number.isFinite(Number(report.latitude)) &&
          Number.isFinite(Number(report.longitude)) &&
          report.latitude !== null &&
          report.longitude !== null ? (
          <MapPreview
            reports={[report]}
            onReport={() => { }}
            height={190}
          />
        ) : (
          <View
            style={{
              height: 190,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#EDF0EF',
              borderRadius: 14,
              padding: 20,
            }}
          >
            <Text style={{ color: C.muted, textAlign: 'center' }}>
              Koordinat GPS tidak tersedia untuk laporan ini.
            </Text>
          </View>
        )}

        <View style={styles.detailLocation}>
          <Text style={{ color: C.green }}>⌖</Text>
          <Text style={styles.detailPlace}>{report.place}</Text>
        </View>
      </View>

      {/* Keterangan */}
      <Text style={styles.sectionHeading}>Keterangan laporan</Text>
      <Text style={styles.detailDescription}>
        {report.description}
      </Text>

      {/* Foto pendukung */}
      <Text style={[styles.sectionHeading, { marginTop: 20 }]}>
        Foto pendukung
      </Text>

      {photosLoading ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <ActivityIndicator color={C.green} />
          <Text style={[styles.helperText, { marginTop: 8 }]}>
            Memuat foto laporan...
          </Text>
        </View>
      ) : photos.length > 0 ? (
        <View style={{ gap: 12, marginTop: 10 }}>
          {photos.map(photo => (
            <Image
              key={photo.id}
              source={{ uri: photo.url }}
              style={{
                width: '100%',
                height: 220,
                borderRadius: 14,
                backgroundColor: '#EDF0EF',
              }}
              resizeMode="cover"
            />
          ))}
        </View>
      ) : (
        <View
          style={{
            padding: 18,
            marginTop: 10,
            borderRadius: 12,
            backgroundColor: '#EDF0EF',
          }}
        >
          <Text
            style={{
              color: C.muted,
              textAlign: 'center',
            }}
          >
            Tidak ada foto pendukung pada laporan ini.
          </Text>
        </View>
      )}

      {/* Informasi laporan */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>SUMBER</Text>
        <Text style={styles.infoValue}>{report.source}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>DIPERBARUI</Text>
        <Text style={styles.infoValue}>
          {report.updated || report.time}
        </Text>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Catatan pemeriksaan</Text>
        <Text style={styles.noteText}>
          {report.note || 'Belum ada catatan pemeriksaan.'}
        </Text>
      </View>

      {/* Riwayat status */}
      <Text
        style={[
          styles.sectionHeading,
          { marginTop: 20, marginBottom: 9 },
        ]}
      >
        Riwayat status
      </Text>

      {history.map((event, index) => (
        <View
          key={`${event.status}-${index}`}
          style={styles.historyRow}
        >
          <View
            style={[
              styles.historyMarker,
              {
                backgroundColor:
                  (STATUS[event.status] ||
                    STATUS['Menunggu verifikasi']).dot,
              },
            ]}
          />

          <View style={{ flex: 1 }}>
            <View style={styles.historyHeading}>
              <Text style={styles.historyStatus}>
                {event.status}
              </Text>
              <Text style={styles.historyTime}>
                {event.time}
              </Text>
            </View>

            <Text style={styles.historyNote}>
              {event.note || 'Status laporan diperbarui.'}
            </Text>
          </View>
        </View>
      ))}

      {/* Moderator */}
      {isModerator ? (
        <>
          <Text style={[styles.sectionHeading, { marginTop: 23 }]}>
            Perbarui status
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Alasan atau sumber pemeriksaan…"
            placeholderTextColor="#9AA6A2"
            style={styles.noteInput}
            multiline
          />

          <View style={styles.statusActions}>
            {REVIEW_STATES.map(state => (
              <Pressable
                key={state}
                onPress={() => onStatus(report, state, note)}
                style={[
                  styles.statusAction,
                  report.status === state &&
                  styles.statusActionCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.statusActionText,
                    report.status === state && { color: C.green },
                  ]}
                >
                  {state === report.status ? '✓ ' : ''}
                  {state}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.mapCaveat}>
        <Text style={styles.caveatIcon}>ⓘ</Text>
        <Text style={styles.caveatText}>
          Status komunitas ini bukan arahan resmi. Ikuti informasi dari
          otoritas terkait.
        </Text>
      </View>

      <SafetyNote />
    </ScrollView>
  );
}

export default DetailScreen;
