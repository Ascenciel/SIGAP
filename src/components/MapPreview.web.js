import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { STATUS } from '../data/reports';

function MapPreview({ reports = [], onReport, height = 175, userLocation }) {
  const mapDocument = useMemo(() => {
    const points = reports.filter(report => Number.isFinite(report.latitude) && Number.isFinite(report.longitude)).map(report => ({
      id: report.id,
      latitude: report.latitude,
      longitude: report.longitude,
      title: report.title,
      description: `${report.category} · ${report.status}`,
      color: (STATUS[report.status] || STATUS['Menunggu verifikasi']).dot,
    }));
    const serialized = JSON.stringify({ points, userLocation }).replace(/</g, '\\u003c');
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;width:100%;margin:0;background:#e8f0e9} .leaflet-control-attribution{font-size:8px}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>const data=${serialized};const map=L.map('map').setView([-7.2756,112.6426],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);const bounds=[];data.points.forEach(p=>{const point=[p.latitude,p.longitude];bounds.push(point);const icon=L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:50%;background:'+p.color+';border:2px solid white;box-shadow:0 1px 5px #555"></div>',iconSize:[22,22],iconAnchor:[11,11]});L.marker(point,{icon}).addTo(map).bindPopup('<b>'+String(p.title).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</b><br>'+p.description).on('click',()=>window.parent.postMessage({sigapReport:p.id},'*'));});if(data.userLocation){const point=[data.userLocation.latitude,data.userLocation.longitude];bounds.push(point);L.circleMarker(point,{radius:8,color:'#fff',weight:3,fillColor:'#247A5B',fillOpacity:1}).addTo(map).bindPopup('Lokasi saya');}if(bounds.length>1)map.fitBounds(bounds,{padding:[28,28],maxZoom:14});else if(bounds.length===1)map.setView(bounds[0],14);</script></body></html>`;
  }, [reports, userLocation]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const receive = event => {
      if (event.data?.sigapReport) {
        const report = reports.find(item => item.id === event.data.sigapReport);
        if (report) onReport?.(report);
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [reports, onReport]);

  return <View style={[styles.mapBox, { height }]}>
    {React.createElement('iframe', { title: 'Peta laporan SIGAP', srcDoc: mapDocument, style: { width: '100%', height: '100%', border: 0 }, loading: 'lazy', referrerPolicy: 'no-referrer' })}
  </View>;
}

export default MapPreview;
