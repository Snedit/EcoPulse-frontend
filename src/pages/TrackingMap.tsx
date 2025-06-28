import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { GoogleMap, Marker, InfoWindow, Polyline, useLoadScript } from '@react-google-maps/api';
import { deviceService } from '../services/deviceService';

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 22.5726,
  lng: 88.3639
};

interface Device {
  id: string;
  name: string;
  type: 'DUSTBIN' | 'SMART_BIN';
  lat: number;
  lng: number;
  lastValue1: number; // Fill level
  lastValue2?: number; // Secondary level for smart bins
}

interface RoutePoint {
  lat: number;
  lng: number;
  device?: Device;
  isStart?: boolean;
}

export default function TrackingMap() {
  const { interfaceId } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedCoord, setSelectedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['routes']
  });

  // Callback for when the map loads
  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    // Initialize DirectionsRenderer
    directionsRenderer.current = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll use our own markers
      polylineOptions: {
        strokeColor: '#FF0000',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
    directionsRenderer.current.setMap(map);
  }, []);

  // Effect to fetch device data
  useEffect(() => {
    deviceService.getAllDevices().then((allDevices) => {
      const filtered = allDevices
        .filter((d) => d.interfaceId === interfaceId && (d.type === 'DUSTBIN' || d.type === 'SMART_BIN'))
        .map((d) => {
          const lat = Number(d.lat);
          const lng = Number(d.lng);
          return {
            ...d,
            lat: isNaN(lat) ? undefined : lat,
            lng: isNaN(lng) ? undefined : lng
          };
        })
        .filter((d) => typeof d.lat === 'number' && typeof d.lng === 'number') as Device[];
        
      console.log('Filtered devices:', filtered);
      
      if (filtered.length === 0) {
        // Fallback dummy data with varied fill levels
        setDevices([
          { id: '1', name: 'Bin 1', type: 'DUSTBIN', lat: 22.5726, lng: 88.3639, lastValue1: 85 },
          { id: '2', name: 'Smart Bin A', type: 'SMART_BIN', lat: 22.5756, lng: 88.3699, lastValue1: 95, lastValue2: 80 },
          { id: '3', name: 'Bin 2', type: 'DUSTBIN', lat: 22.5781, lng: 88.3605, lastValue1: 60 },
          { id: '4', name: 'Smart Bin B', type: 'SMART_BIN', lat: 22.5800, lng: 88.3650, lastValue1: 40, lastValue2: 55 },
          { id: '5', name: 'Bin 3', type: 'DUSTBIN', lat: 22.5700, lng: 88.3580, lastValue1: 90 }
        ]);
      } else {
        setDevices(filtered);
      }
    }).catch((err) => {
      console.error('Device fetch failed. Using fallback data.', err);
      setDevices([
        { id: '1', name: 'Bin 1', type: 'DUSTBIN', lat: 22.5726, lng: 88.3639, lastValue1: 85 },
        { id: '2', name: 'Smart Bin A', type: 'SMART_BIN', lat: 22.5756, lng: 88.3699, lastValue1: 95, lastValue2: 80 },
        { id: '3', name: 'Bin 2', type: 'DUSTBIN', lat: 22.5781, lng: 88.3605, lastValue1: 60 },
        { id: '4', name: 'Smart Bin B', type: 'SMART_BIN', lat: 22.5800, lng: 88.3650, lastValue1: 40, lastValue2: 55 },
        { id: '5', name: 'Bin 3', type: 'DUSTBIN', lat: 22.5700, lng: 88.3580, lastValue1: 90 }
      ]);
    });
  }, [interfaceId]);

  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedCoord({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setRoute([]); // Clear previous route when selecting new start point
    }
  };

  // Function to calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Priority-based route optimization
  const optimizeRoute = useCallback((startPoint: { lat: number; lng: number }, bins: Device[]): Device[] => {
    // First, filter bins that need collection (>70% full or smart bins >60% on either sensor)
    const priorityBins = bins.filter(bin => {
      if (bin.type === 'SMART_BIN') {
        return bin.lastValue1 > 60 || (bin.lastValue2 && bin.lastValue2 > 60);
      }
      return bin.lastValue1 > 70;
    });

    if (priorityBins.length === 0) {
      // If no priority bins, take all bins
      return bins;
    }

    // Sort by priority: highest fill level first, then by distance
    const sortedBins = priorityBins.sort((a, b) => {
      const aMaxFill = Math.max(a.lastValue1, a.lastValue2 || 0);
      const bMaxFill = Math.max(b.lastValue1, b.lastValue2 || 0);
      
      // If fill levels are similar (within 10%), prioritize by distance
      if (Math.abs(aMaxFill - bMaxFill) < 10) {
        const aDist = calculateDistance(startPoint.lat, startPoint.lng, a.lat, a.lng);
        const bDist = calculateDistance(startPoint.lat, startPoint.lng, b.lat, b.lng);
        return aDist - bDist;
      }
      
      return bMaxFill - aMaxFill; // Higher fill level first
    });

    // Apply nearest neighbor algorithm starting with the highest priority bin
    const optimizedRoute: Device[] = [];
    const unvisited = [...sortedBins];
    let currentPoint = startPoint;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = calculateDistance(currentPoint.lat, currentPoint.lng, unvisited[0].lat, unvisited[0].lng);

      for (let i = 1; i < unvisited.length; i++) {
        const distance = calculateDistance(currentPoint.lat, currentPoint.lng, unvisited[i].lat, unvisited[i].lng);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      const selectedBin = unvisited.splice(nearestIndex, 1)[0];
      optimizedRoute.push(selectedBin);
      currentPoint = { lat: selectedBin.lat, lng: selectedBin.lng };
    }

    return optimizedRoute;
  }, []);

  // Calculate route using Google Directions Service
  const calculateOptimalRoute = useCallback(async () => {
    if (!selectedCoord || devices.length === 0 || !mapRef.current || !directionsRenderer.current) {
      alert("Please select a starting point on the map first.");
      return;
    }

    setIsCalculatingRoute(true);
    
    try {
      // Get optimized route
      const optimizedBins = optimizeRoute(selectedCoord, devices);
      
      if (optimizedBins.length === 0) {
        alert("No bins need collection at this time.");
        setIsCalculatingRoute(false);
        return;
      }

      // Prepare waypoints for Google Directions
      const waypoints: google.maps.DirectionsWaypoint[] = optimizedBins.slice(0, -1).map(bin => ({
        location: { lat: bin.lat, lng: bin.lng },
        stopover: true
      }));

      const directionsService = new google.maps.DirectionsService();
      
      const result = await directionsService.route({
        origin: selectedCoord,
        destination: { lat: optimizedBins[optimizedBins.length - 1].lat, lng: optimizedBins[optimizedBins.length - 1].lng },
        waypoints: waypoints,
        optimizeWaypoints: false, // We've already optimized
        travelMode: google.maps.TravelMode.DRIVING,
      });

      if (result.routes && result.routes.length > 0) {
        // Display the route on the map
        directionsRenderer.current!.setDirections(result);
        
        // Update route state for markers
        const routePoints: RoutePoint[] = [
          { ...selectedCoord, isStart: true },
          ...optimizedBins.map(bin => ({ lat: bin.lat, lng: bin.lng, device: bin }))
        ];
        setRoute(routePoints);

        // Calculate total distance and time
        let totalDistance = 0;
        let totalTime = 0;
        result.routes[0].legs.forEach(leg => {
          if (leg.distance) totalDistance += leg.distance.value;
          if (leg.duration) totalTime += leg.duration.value;
        });

        console.log(`Route calculated: ${optimizedBins.length} bins, ${(totalDistance/1000).toFixed(2)} km, ${Math.round(totalTime/60)} minutes`);
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      alert("Failed to calculate route. Please try again.");
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [selectedCoord, devices, optimizeRoute]);

  // Clear route
  const clearRoute = useCallback(() => {
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections({ routes: [] } as any);
    }
    setRoute([]);
    setSelectedCoord(null);
  }, []);

  // Get marker color based on fill level
  const getMarkerIcon = (device: Device) => {
    const maxFill = Math.max(device.lastValue1, device.lastValue2 || 0);
    let color = 'green'; // Low fill
    
    if (maxFill > 80) color = 'red';    // High priority
    else if (maxFill > 60) color = 'yellow'; // Medium priority
    
    const iconType = device.type === 'SMART_BIN' ? 'smartbin' : 'dustbin';
    return {
      url: `/icons/${iconType}_${color}.png`,
      scaledSize: new window.google.maps.Size(32, 32)
    };
  };

  if (loadError) return <div className="p-6">Error loading maps</div>;
  if (!isLoaded) return <div className="p-6">Loading map...</div>;

  return (
    <PageLayout>
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">Smart Waste Collection Route Optimizer</h2>
        
        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={calculateOptimalRoute} 
            disabled={!selectedCoord || isCalculatingRoute}
            className="btn-primary disabled:opacity-50"
          >
            {isCalculatingRoute ? 'Calculating...' : 'Find Optimal Route'}
          </button>
          
          <button 
            onClick={clearRoute}
            className="btn-secondary"
          >
            Clear Route
          </button>
        </div>

        <div className="bg-gray-900 p-3 rounded">
          <h3 className="font-semibold mb-2 ">Instructions:</h3>
          <ol className="text-sm space-y-1">
            <li>1. Click on the map to select your starting point (green marker)</li>
            <li>2. Click "Find Optimal Route" to calculate the best collection route</li>
            <li>3. Route prioritizes bins with fill levels {'>'}70% ({'>'}60% for smart bins)</li>
            <li>4. Red bins = urgent ( {'>'}80%), Yellow = medium ({'>'}60%), Green = low fill</li>
          </ol>
        </div>

        {devices.length > 0 && (
          <div className="bg-blue-900 p-3 rounded">
            <p className="text-sm">
              <strong>{devices.length} bins loaded</strong> - 
              {devices.filter(d => Math.max(d.lastValue1, d.lastValue2 || 0) > 70).length} high priority, 
              {devices.filter(d => Math.max(d.lastValue1, d.lastValue2 || 0) > 60 && Math.max(d.lastValue1, d.lastValue2 || 0) <= 70).length} medium priority
            </p>
          </div>
        )}

        <div className="w-full rounded overflow-hidden">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center}
            onClick={handleClick}
            onLoad={onLoad}
          >
            {/* Device markers */}
            {devices.map((device) => (
              <Marker
                key={device.id}
                position={{ lat: device.lat, lng: device.lng }}
                icon={getMarkerIcon(device)}
                onClick={() => setSelectedDevice(device)}
              />
            ))}

            {/* Route point markers with order numbers */}
            {route.map((point, idx) => (
              !point.isStart && (
                <Marker
                  key={`route-${idx}`}
                  position={{ lat: point.lat, lng: point.lng }}
                  label={{
                    text: `${idx}`,
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(24, 24)
                  }}
                />
              )
            ))}

            {/* Starting point marker */}
            {selectedCoord && (
              <Marker
                position={selectedCoord}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
                title="Starting Point"
              />
            )}

            {/* Info window for selected device */}
            {selectedDevice && (
              <InfoWindow
                position={{ lat: selectedDevice.lat, lng: selectedDevice.lng }}
                onCloseClick={() => setSelectedDevice(null)}
              >
                <div className="p-2">
                  <strong>{selectedDevice.name}</strong><br />
                  <span className="text-sm">Type: {selectedDevice.type}</span><br />
                  <span className={`font-semibold ${selectedDevice.lastValue1 > 80 ? 'text-red-600' : selectedDevice.lastValue1 > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    Fill Level: {selectedDevice.lastValue1}%
                  </span><br />
                  {selectedDevice.lastValue2 && (
                    <span className={`text-sm ${selectedDevice.lastValue2 > 80 ? 'text-red-600' : selectedDevice.lastValue2 > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                      Secondary: {selectedDevice.lastValue2}%
                    </span>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </PageLayout>
  );
}