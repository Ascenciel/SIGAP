
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import styles from '../theme/styles';
import { STATUS } from '../data/reports';

const SURABAYA = {
  latitude: -7.2756,
  longitude: 112.6426,
};

function MapPreview({
  reports = [],
  onReport,
  height = 175,
  userLocation,
}) {
  const coordinates = reports.filter(
    report =>
      Number.isFinite(Number(report.latitude)) &&
      Number.isFinite(Number(report.longitude))
  );

  const center = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }

    if (coordinates.length > 0) {
      return {
        latitude:
          coordinates.reduce(
            (sum, item) => sum + Number(item.latitude),
            0
          ) / coordinates.length,
        longitude:
          coordinates.reduce(
            (sum, item) => sum + Number(item.longitude),
            0
          ) / coordinates.length,
      };
    }

    return SURABAYA;
  }, [userLocation, reports]);

  const mapHtml = useMemo(() => {
    const markerData = coordinates.map(report => ({
      id: String(report.id),
      latitude: Number(report.latitude),
      longitude: Number(report.longitude),
      title: report.title || 'Laporan',
      category: report.category || 'Lainnya',
      status: report.status || 'Menunggu verifikasi',
      color: (STATUS[report.status] ||
        STATUS['Menunggu verifikasi']).dot,
    }));

    // Escape karakter HTML agar data laporan aman
    // ketika dimasukkan ke dalam script.
    const safeMarkers = JSON.stringify(markerData)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');

    const safeCenter = JSON.stringify(center);

    const safeUserLocation = JSON.stringify(userLocation);

    const initialZoom = userLocation
      ? 14
      : coordinates.length > 1
        ? 12
        : 13;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
          />

          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />

          <style>
            html, body, #map {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }

            .leaflet-popup-content {
              font-family: Arial, sans-serif;
              font-size: 12px;
            }

            .marker-dot {
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 1px 5px rgba(0,0,0,0.35);
            }
          </style>
        </head>

        <body>
          <div id="map"></div>

          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

          <script>
            const markers = ${safeMarkers};
            const center = ${safeCenter};
            const userLocation = ${safeUserLocation};

            const map = L.map('map', {
              zoomControl: true
            }).setView(
              [center.latitude, center.longitude],
              ${initialZoom}
            );

            L.tileLayer(
              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
              }
            ).addTo(map);

            markers.forEach(report => {
              const marker = L.circleMarker(
                [report.latitude, report.longitude],
                {
                  radius: 8,
                  color: '#ffffff',
                  weight: 2,
                  fillColor: report.color,
                  fillOpacity: 1,
                  className: 'marker-dot'
                }
              ).addTo(map);

              marker.bindPopup(
                '<b>' + escapeHtml(report.title) + '</b><br>' +
                escapeHtml(report.category) + '<br>' +
                escapeHtml(report.status)
              );

              marker.on('click', () => {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({
                    type: 'select-report',
                    id: report.id
                  })
                );
              });
            });

            if (userLocation) {
              L.circleMarker(
                [userLocation.latitude, userLocation.longitude],
                {
                  radius: 8,
                  color: '#ffffff',
                  weight: 3,
                  fillColor: '#2563eb',
                  fillOpacity: 1
                }
              )
              .addTo(map)
              .bindPopup('Lokasi Anda');
            }

            function escapeHtml(value) {
              return String(value).replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
              })[char]);
            }
          </script>
        </body>
      </html>
    `;
  }, [reports, userLocation, center]);

  const handleMessage = event => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'select-report') {
        const selectedReport = reports.find(
          report => String(report.id) === message.id
        );

        if (selectedReport) {
          onReport?.(selectedReport);
        }
      }
    } catch (error) {
      console.warn('Map message error:', error);
    }
  };

  return (
    <View style={[styles.mapBox, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled={false}
        onMessage={handleMessage}
        style={{ flex: 1, backgroundColor: '#e8f0ed' }}
      />
    </View>
  );
}

export default MapPreview;
