// components/MapPicker.tsx
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

function LocationMarker({ onSelect }: { onSelect: (latlng: string) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(`${e.latlng.lat}, ${e.latlng.lng}`);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({
  onSelect,
  defaultLocation = [22.5726, 88.3639], // Kolkata default
}: {
  onSelect: (latlng: string) => void;
  defaultLocation?: [number, number];
}) {
  return (
    <div className="h-64 rounded overflow-hidden">
      <MapContainer center={defaultLocation} zoom={13} style={{ height: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={onSelect} />
      </MapContainer>
    </div>
  );
}
