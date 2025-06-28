import { useNavigate } from 'react-router-dom';
import { Droplets, Trash2, Dice1 as D, AlertTriangle, RefreshCw, Dice1 as Device } from 'lucide-react';
import { type Device as DeviceType } from '../../services/deviceService';
import { timeAgo, getStatusColorClass, getDeviceIconName } from '../../utils/helpers';

interface DeviceCardProps {
  device: DeviceType;
  onRefresh?: (id: string) => void;
}

export default function DeviceCard({ device, onRefresh }: DeviceCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/device/${device.id}`);
  };
  
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRefresh) {
      onRefresh(device.id);
    }
  };
  
  const getDeviceIcon = () => {
    switch (device.type) {
      case 'WATER_TANK':
        return <Droplets className="w-6 h-6 text-primary-500" />;
      case 'DUSTBIN':
        return <Trash2 className="w-6 h-6 text-secondary-500" />;
      default:
        return <Device className="w-6 h-6 text-accent-500" />;
    }
  };
  
  const getCapacityColorClass = () => {
    if (device.capacityPercentage > 70) {
      return device.type === 'WATER_TANK' 
        ? 'text-primary-600 dark:text-primary-400' 
        : 'text-error-600 dark:text-error-400';
    } else if (device.capacityPercentage > 30) {
      return 'text-warning-600 dark:text-warning-400';
    } else {
      return device.type === 'WATER_TANK' 
        ? 'text-error-600 dark:text-error-400' 
        : 'text-success-600 dark:text-success-400';
    }
  };
  
  const getCapacityDescription = () => {
    return device.type === 'WATER_TANK' ? 'Water Level' : 'Fill Level';
  };
  
  return (
    <div
      onClick={handleClick}
      className="card p-4 cursor-pointer transition-all duration-200 hover:translate-y-[-4px]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getDeviceIcon()}
          <div>
            <h3 className="font-semibold">{device.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{device.location}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {device.onlineStatus === 'warning' || device.onlineStatus === 'error' ? (
            <span className="flex items-center">
              <AlertTriangle className={`w-5 h-5 ${device.onlineStatus === 'warning' ? 'text-warning-500' : 'text-error-500'}`} />
            </span>
          ) : null}
          
          <button
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800"
            aria-label="Refresh device data"
          >
            <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {getCapacityDescription()}
        </span>
        <span className={`text-lg font-bold ${getCapacityColorClass()}`}>
          {device.capacityPercentage}%
        </span>
      </div>
      
      <div className="w-full h-3 bg-gray-200 dark:bg-navy-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full ${
            device.type === 'WATER_TANK'
              ? 'bg-primary-500'
              : device.capacityPercentage > 80
              ? 'bg-error-500'
              : device.capacityPercentage > 60
              ? 'bg-warning-500'
              : 'bg-success-500'
          }`}
          style={{ width: `${device.capacityPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className={`px-2 py-1 rounded-full ${getStatusColorClass(device.onlineStatus)}`}>
          {device.onlineStatus.charAt(0).toUpperCase() + device.onlineStatus.slice(1)}
        </span>
        <span>Updated {timeAgo(device.lastUpdated)}</span>
      </div>
    </div>
  );
}