import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Droplets, 
  Gauge,
  Cog,
  Trash 
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import DeviceStatus from '../components/device/DeviceStatus';
import DeviceMetrics from '../components/device/DeviceMetrics';
import SmartBinDashboard from '../components/device/SmartBinDashboard';
import { deviceService, type Device } from '../services/deviceService';
import { getDeviceIconName } from '../utils/helpers';

export default function DeviceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
useEffect(() => {
  fetchDevice();

  const source = new EventSource(`http://localhost:8000/api/device/${id}/stream`);

  source.onopen = () => {
    console.log("✅ SSE connection opened");
    setDevice(prev =>
      prev ? { ...prev, status: "online" } : prev
    );
  };

  source.onerror = () => {
    console.warn("⚠️ SSE connection lost");
    setDevice(prev =>
      prev ? { ...prev, status: "offline" } : prev
    );
  };

  source.addEventListener("device-live", (event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);
      console.log("Live data:", parsed);

      setDevice(prev =>
        prev
          ? {
              ...prev,
              liveValue: parsed.data.value,
              lastUpdated: parsed.data.timestamp,
              status: "online", // just to make sure it's marked online when new data arrives
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to parse SSE data:", err);
    }
  });

  return () => {
    source.close();
    setDevice(prev =>
      prev ? { ...prev, status: "offline" } : prev
    );
  };
}, [id]);


  
  const fetchDevice = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await deviceService.getDevice(id);
      setDevice(data);
    } catch (error) {
      console.error('Failed to fetch device:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    if (!id) return;
    
    setIsRefreshing(true);
    try {
      const data = await deviceService.refreshDeviceData(id);
      setDevice(data);
    } catch (error) {
      console.error('Failed to refresh device:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deviceService.deleteDevice(id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete device:', error);
    }
  };
  
  const getDeviceIcon = () => {
    if (!device) return <Gauge className="w-6 h-6" />;
    
    switch (device.type) {
      case 'WATER_TANK':
        return <Droplets className="w-6 h-6 text-primary-500" />;
      case 'DUSTBIN':
        return <Trash2 className="w-6 h-6 text-secondary-500" />;
      default:
        return <Gauge className="w-6 h-6 text-accent-500" />;
    }
  };
  
const getCapacityColorClass = () => {
  if (!device) return '';

  const percent = device.liveValue ?? device.capacityPercentage ?? 0;

  if (percent > 70) {
    return device.type === 'WATER_TANK' 
      ? 'text-primary-600 dark:text-primary-400' 
      : 'text-error-600 dark:text-error-400';
  } else if (percent > 30) {
    return 'text-warning-600 dark:text-warning-400';
  } else {
    return device.type === 'WATER_TANK' 
      ? 'text-error-600 dark:text-error-400' 
      : 'text-success-600 dark:text-success-400';
  }
};


  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (!device) {
    return (
      <PageLayout>
        <div className="text-center">
          <h2 className="text-xl font-semibold">Device not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The device you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </PageLayout>
    );
  }

  // 👉 Custom UI for SMART_BIN
if (device.data.type === 'SMART_BIN') {
  return (
    <PageLayout>
      <SmartBinDashboard device={device} />
    </PageLayout>
  );
}

  return (
    <PageLayout padding={false}>
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-800 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold">{device.name}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="btn-outline flex items-center text-sm"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button className="btn-outline flex items-center text-sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-outline flex items-center text-sm text-error-500 hover:text-error-600"
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        {/* Overview */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-navy-800 mr-4">
                {getDeviceIcon()}
              </div>
              
              <div>
                <h2 className="text-xl font-bold">{device.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{device.location}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {device.type === 'WATER_TANK' ? 'Water Level' : 'Fill Level'}
                </h3>
                <div className="relative h-64 w-full bg-gray-100 dark:bg-navy-800 rounded-lg overflow-hidden">
               <div 
  className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${
    (() => {
      const percent = device.liveValue ?? device.capacityPercentage ?? 0;

      if (percent > 70) {
        return device.type === 'WATER_TANK'
          ? 'bg-primary-500 bg-opacity-70'
          : 'bg-error-500 bg-opacity-70';
      } else if (percent > 30) {
        return 'bg-warning-500 bg-opacity-70';
      } else {
        return device.type === 'WATER_TANK'
          ? 'bg-error-500 bg-opacity-70'
          : 'bg-success-500 bg-opacity-70';
      }
    })()
  }`}
  style={{ height: `${device.liveValue ?? device.capacityPercentage}%` }}
/>


                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className={`text-3xl font-bold ${getCapacityColorClass()}`}>
  {Math.round((device.liveValue ?? device.capacityPercentage ?? 0))}%
</span>

{device.lastUpdated && (
  <p className="text-sm text-gray-400 mt-2">
     Last updated: {new Date(device.lastUpdated * 1000).toLocaleTimeString()}
  </p>
)}

                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <DeviceStatus device={device} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Data/Metrics */}
        <div className="mb-8">
          <DeviceMetrics device={device} />
        </div>
        
        {/* Settings */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <Cog className="w-5 h-5 mr-2 text-gray-500" />
              <h2 className="text-xl font-semibold">Device Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-2">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Low level alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Maintenance reminders</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Status change alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Data Collection</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Collection frequency</span>
                    <select className="input max-w-[120px]">
                      <option>5 minutes</option>
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Detailed logging</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="btn-primary">Save Settings</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Delete Device</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete <strong>{device.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="btn bg-error-500 hover:bg-error-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}