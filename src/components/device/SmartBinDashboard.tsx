import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import DeviceStatus from './DeviceStatus';
import DeviceMetrics from './DeviceMetrics';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deviceService } from '../../services/deviceService';
import { EventSourcePolyfill } from 'event-source-polyfill';

export default function SmartBinDashboard({ device }: any) {
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState<
    { time: string; value1: number; value2: number }[]
  >([]);

useEffect(() => {
  const token = localStorage.getItem('eco_monitor_user_jwt');
  // Use EventSourcePolyfill for SSE with Authorization header
  const sse = new EventSourcePolyfill(
    `http://localhost:8000/api/device/${device.data.id}/stream`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  sse.addEventListener('device-live', (event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);
      console.log('SSE data received:', parsed);
      if (!parsed || !parsed.deviceId || !parsed.timestamp) return;

      const timestamp = new Date(parsed.timestamp).toLocaleTimeString();

      setLiveData(prev => {
        const newPoint = {
          time: timestamp,
          value1: Number(parsed.value1) ?? 0,
          value2: Number(parsed.value2) ?? 0
        };
        return [...prev.slice(-9), newPoint];
      });
    } catch (err) {
      console.error('SSE parse error:', err);
    }
  });

  return () => {
    sse.close();
  };
}, [device.data.id]);

  const handleDelete = async () => {
    const confirm = window.confirm(`Are you sure you want to delete ${device.name}?`);
    if (!confirm) return;

    try {
      const success = await deviceService.deleteDevice(device.id);
      if (success) {
        alert('✅ Device deleted');
        navigate('/');
      } else {
        alert('❌ Failed to delete device');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('❌ An error occurred while deleting');
    }
  };

  return (
    <div className="p-4 rounded-lg bg-slate-900 text-white space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Smart AI Bin Dashboard</h2>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-600 flex items-center gap-1"
        >
          <Trash2 className="w-5 h-5" />
          Delete Device
        </button>
      </div>

      {/* Waste levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-800 rounded-md shadow-md">
          <p className="text-sm text-green-200">Biodegradable Waste</p>
          <p className="text-2xl font-bold">{liveData.length > 0 ? liveData[liveData.length - 1].value1 : '--'}%</p>
        </div>
        <div className="p-4 bg-blue-800 rounded-md shadow-md">
          <p className="text-sm text-blue-200">Non-Biodegradable Waste</p>
          <p className="text-2xl font-bold">{liveData.length > 0 ? liveData[liveData.length - 1].value2 : '--'}%</p>
        </div>
      </div>

      {/* Graph */}
      <div className="bg-slate-800 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Waste Levels Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={liveData}>
            <XAxis dataKey="time" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="value1" stroke="#4ade80" name="Biodegradable" />
            <Line type="monotone" dataKey="value2" stroke="#60a5fa" name="Non-Biodegradable" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status + Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeviceStatus device={device} />
        <DeviceMetrics device={device} />
      </div>
    </div>
  );
}
