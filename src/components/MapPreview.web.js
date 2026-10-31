import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { STATUS } from '../data/reports';

function MapPreview({ reports = [], onReport, height = 175, userLocation, selectable = false, selectedLocation, onLocationSelect }) {
  const mapDocument = useMemo(() => {
    const points = reports.filter(report => Number.isFinite(Number(report.latitude)) && Number.isFinite(Number(report.longitude))).map(report => ({
      id: report.id,
      latitude: Number(report.latitude),
      longitude: Number(report.longitude),
      title: report.title,
      category: report.category,
      status: report.status,
      color: (STATUS[report.status] || STATUS['Menunggu verifikasi']).dot,
    }));
    const serialized = JSON.stringify({ points, userLocation, selectedLocation, selectable }).replace(/</g, '\\u003c');
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;width:100%;margin:0;background:#e8f0e9}.leaflet-control-attribution{font-size:8px}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
      const data=${serialized};
      const center=data.selectedLocation||data.userLocation||{latitude:-7.2756,longitude:112.6426};
      const map=L.map('map').setView([center.latitude,center.longitude],data.selectedLocation?15:12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
      const bounds=[];
      const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
      data.points.forEach(point=>{const coords=[point.latitude,point.longitude];bounds.push(coords);L.circleMarker(coords,{radius:8,color:'#fff',weight:2,fillColor:point.color,fillOpacity:1}).addTo(map).bindPopup('<b>'+escapeHtml(point.title)+'</b><br>'+escapeHtml(point.category)+'<br>'+escapeHtml(point.status)).on('click',()=>window.parent.postMessage({sigapReport:point.id},'*'));});
      if(data.userLocation)L.circleMarker([data.userLocation.latitude,data.userLocation.longitude],{radius:8,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}).addTo(map).bindPopup('Lokasi Anda');
      let selectedMarker=null;
      function setSelected(point){if(selectedMarker)map.removeLayer(selectedMarker);selectedMarker=L.circleMarker([point.latitude,point.longitude],{radius:10,color:'#fff',weight:3,fillColor:'#087e70',fillOpacity:1}).addTo(map);}
      if(data.selectedLocation)setSelected(data.selectedLocation);
      if(data.selectable)map.on('click',event=>{const point={latitude:event.latlng.lat,longitude:event.latlng.lng};setSelected(point);window.parent.postMessage({sigapLocation:point},'*');});
      if(bounds.length>1)map.fitBounds(bounds,{padding:[28,28],maxZoom:14});else if(bounds.length===1&&!data.selectedLocation)map.setView(bounds[0],14);
    </script></body></html>`;
  }, [reports, userLocation, selectable, selectedLocation]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const receive = event => {
      if (event.data?.sigapReport) {
        const report = reports.find(item => String(item.id) === String(event.data.sigapReport));
        if (report) onReport?.(report);
      }
      const point = event.data?.sigapLocation;
      if (point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude)) onLocationSelect?.(point);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [reports, onReport, onLocationSelect]);

  return <View style={[styles.mapBox, { height }]}>
    {React.createElement('iframe', { title: selectable ? 'Pilih lokasi laporan' : 'Peta laporan SIGAP', srcDoc: mapDocument, style: { width: '100%', height: '100%', border: 0 }, loading: 'lazy', referrerPolicy: 'no-referrer' })}
  </View>;
}

export default MapPreview;
