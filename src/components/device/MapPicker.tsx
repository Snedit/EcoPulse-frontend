// src/components/device/MapPicker.tsx

import { useCallback, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 22.5726,
  lng: 88.3639,
};

type Props = {
  onSelect: (latlng: string) => void;
};

export default function MapPicker({ onSelect }: Props) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Make sure this exists in .env
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const handleClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      onSelect(`${lat}, ${lng}`);
    }
  }, [onSelect]);

  if (!isLoaded) return <div className="text-gray-500">Loading map...</div>;

  return (
    <div className="border rounded overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={marker ?? defaultCenter}
        zoom={14}
        onClick={handleClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}
