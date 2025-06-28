import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Droplets, Trash2, RefreshCw, Search, Filter } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import DeviceCard from '../components/device/DeviceCard';
import { deviceService, type Device } from '../services/deviceService';
import { userService } from '../services/userService';  

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [refreshingIds, setRefreshingIds] = useState<string[]>([]);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDevices();

  }, []);
  
  useEffect(() => {
    filterDevices();
  }, [devices, searchQuery, activeFilter]);
  
  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const data = await deviceService.getDevices();
      setDevices(data);
      console.log("all devices : ");
      console.log(data);

      
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterDevices = () => {
    let filtered = [...devices];
    
    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        device => 
          device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (activeFilter) {
      filtered = filtered.filter(device => device.type === activeFilter);
    }
    
    setFilteredDevices(filtered);
  };
  
  const handleRefreshDevice = async (id: string) => {
    setRefreshingIds(prev => [...prev, id]);
    try {
      const updatedDevice = await deviceService.refreshDeviceData(id);
      setDevices(prev => 
        prev.map(device => device.id === id ? updatedDevice : device)
      );
    } catch (error) {
      console.error('Failed to refresh device:', error);
    } finally {
      setRefreshingIds(prev => prev.filter(deviceId => deviceId !== id));
    }
  };
  
  const handleAddDevice = () => {
    navigate('/device/setup');
  };
  
  const handleRefreshAll = async () => {
    setIsLoading(true);
    try {
      await fetchDevices();
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStats = () => {
    const totalDevices = devices.length;
    const waterTanks = devices.filter(d => d.type === 'WATER_TANK').length;
    const dustbins = devices.filter(d => d.type === 'DUSTBIN').length;
    const alertsCount = devices.reduce((acc, device) => {
      return acc + (device.alerts?.length || 0);
    }, 0);
    
    return { totalDevices, waterTanks, dustbins, alertsCount };
  };
  
  const stats = getStats();

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage your connected devices</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Devices</h3>
          <p className="text-2xl font-bold mt-1">{stats.totalDevices}</p>
          <div className="mt-2 text-primary-500">
            <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/20 rounded-full px-2 py-1">
              All Devices
            </span>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Water Tanks</h3>
          <p className="text-2xl font-bold mt-1">{stats.waterTanks}</p>
          <div className="mt-2 text-primary-500">
            <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/20 rounded-full px-2 py-1 flex items-center w-fit">
              <Droplets className="w-3 h-3 mr-1" />
              Monitoring
            </span>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Waste Bins</h3>
          <p className="text-2xl font-bold mt-1">{stats.dustbins}</p>
          <div className="mt-2 text-secondary-500">
            <span className="text-xs font-medium bg-secondary-100 dark:bg-secondary-900/20 rounded-full px-2 py-1 flex items-center w-fit">
              <Trash2 className="w-3 h-3 mr-1" />
              Collection
            </span>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Alerts</h3>
          <p className="text-2xl font-bold mt-1">{stats.alertsCount}</p>
          <div className="mt-2 text-warning-500">
            <span className={`text-xs font-medium rounded-full px-2 py-1 ${
              stats.alertsCount > 0 
                ? 'bg-warning-100 dark:bg-warning-900/20' 
                : 'bg-success-100 dark:bg-success-900/20 text-success-500'
            }`}>
              {stats.alertsCount > 0 ? 'Attention Needed' : 'All Clear'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveFilter(activeFilter === 'waterTank' ? null : 'waterTank')}
            className={`btn ${
              activeFilter === 'waterTank'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-navy-900 border border-gray-300 dark:border-navy-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Droplets className="w-5 h-5 mr-2" />
            Water Tanks
          </button>
          
          <button
            onClick={() => setActiveFilter(activeFilter === 'dustbin' ? null : 'dustbin')}
            className={`btn ${
              activeFilter === 'dustbin'
                ? 'bg-secondary-500 text-white'
                : 'bg-white dark:bg-navy-900 border border-gray-300 dark:border-navy-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Waste Bins
          </button>
          
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="btn bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mb-6">
        <button
          onClick={handleAddDevice}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Device
        </button>
        
        <button
          onClick={handleRefreshAll}
          className="btn-outline flex items-center"
          disabled={isLoading}
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh All
        </button>
      </div>
      
      {/* Devices grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onRefresh={handleRefreshDevice}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-navy-800 rounded-full flex items-center justify-center mb-4">
            {activeFilter === 'waterTank' ? (
              <Droplets className="w-8 h-8 text-gray-400" />
            ) : activeFilter === 'dustbin' ? (
              <Trash2 className="w-8 h-8 text-gray-400" />
            ) : (
              <Filter className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No devices found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first device to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleAddDevice}
              className="btn-primary mt-4"
            >
              Add Device
            </button>
          )}
        </div>
      )}
    </PageLayout>
  );
}