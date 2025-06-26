'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for missing marker icons in Leaflet + Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:   'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:         'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LogMap({ data }) {
  return (
    <div style={{ height: '100%', width: '100%'}}>
      <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {data.map((entry, index) => {      
          return <Marker key={index} position={[entry.latitude, entry.longitude]}>
            <Popup>
              <strong>{entry.country}</strong><br />
              Logs: {entry.count}
            </Popup>
          </Marker>
        })}
      </MapContainer>
    </div>
  );
}
