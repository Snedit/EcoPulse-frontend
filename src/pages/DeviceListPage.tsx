import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { deviceService } from '../services/deviceService';
import {
  Droplets,
  Trash2,
  Dice1 as DeviceIcon,
  MapPin,
  CalendarDays,
  Barcode,
  Cpu,
  Copy
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'DUSTBIN' | 'WATER_TANK' | 'OTHER_SENSOR';
  location: string;
  lastValue: number | null;
  lastUpdated: string | null;
  interfaceId: string;
  interfaceName: string;
}

export default function DeviceListPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await deviceService.getAllDevices();
        setDevices(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load devices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Devices</h1>
          <button
            onClick={() => navigate('/device/new')}
            className="btn-primary"
          >
            Add Device
          </button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-error-600 dark:text-error-300">{error}</div>
        ) : devices.length === 0 ? (
          <div className="text-gray-500">No devices found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="card p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  {device.type === 'WATER_TANK' && (
                    <Droplets className="text-primary-500 w-5 h-5" />
                  )}
                  {device.type === 'DUSTBIN' && (
                    <Trash2 className="text-secondary-500 w-5 h-5" />
                  )}
                  {device.type === 'OTHER_SENSOR' && (
                    <DeviceIcon className="text-accent-500 w-5 h-5" />
                  )}
                  <h2 className="text-lg font-semibold">{device.name}</h2>
                </div>

                <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium rounded">
                  Type: {device.type}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {device.location}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <Cpu className="w-4 h-4" /> {device.interfaceName}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span className="font-medium">Interface ID:</span>
                  <span className="truncate">{device.interfaceId}</span>
                  <button
                    onClick={() => handleCopy(device.interfaceId)}
                    title="Copy Interface ID"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copiedId === device.interfaceId && (
                    <span className="text-green-500 text-xs ml-1">Copied!</span>
                  )}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Last Value: <strong>{device.lastValue ?? 'N/A'}</strong>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Last Updated:{' '}
                  {device.lastUpdated
                    ? new Date(device.lastUpdated).toLocaleString()
                    : 'N/A'}
                </div>

                <div>
                  <button
                    onClick={() => navigate(`/device/${device.id}`)}
                    className="btn-outline text-sm mt-2"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
