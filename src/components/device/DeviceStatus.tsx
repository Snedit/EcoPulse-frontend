import { ClipboardCheck, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { type Device } from '../../services/deviceService';
import { formatDate, getStatusColorClass } from '../../utils/helpers';

interface DeviceStatusProps {
  device: Device;
}

export default function DeviceStatus({ device }: DeviceStatusProps) {
  const getStatusIcon = () => {
    console.log(device);
    switch (device.data.onlineStatus) {
      case 'online':
        return <Sparkles className="w-5 h-5 text-success-500" />;
      case 'offline':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-error-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Device Status</h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Status</span>
          <span className={`px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColorClass(device.onlineStatus)}`}>
            {getStatusIcon()}
            <span className="ml-1 font-medium">
              {device.data.onlineStatus.charAt(0).toUpperCase() + device.data.onlineStatus.slice(1)}
              {/* {device.onlineStatus} */}
              {/* {console.log(device.onlineStatus)} */}
            </span>
          </span>
        </div>
        
        {/* <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Serial Number</span>
          <span className="font-medium">{device.serialNumber}</span>
        </div> */}
        
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Location</span>
          <span className="font-medium">{device.data.location}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
          <span className="font-medium">{formatDate(device.lastUpdated)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Installation Date</span>
          {/* <span className="font-medium">{device.installDate}</span> */}
        </div>
        
        {(device.onlineStatus=== 'warning' || device.onlineStatus=== 'error') && device.alerts && device.alerts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Active Alerts</h3>
            <div className="space-y-2">
              {device.alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg ${
                    alert.type === 'error' 
                      ? 'bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200' 
                      : alert.type === 'warning'
                      ? 'bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200'
                      : 'bg-gray-100 dark:bg-navy-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-start">
                    <AlertTriangle className={`w-5 h-5 mr-2 ${
                      alert.type === 'error' 
                        ? 'text-error-500' 
                        : alert.type === 'warning'
                        ? 'text-warning-500'
                        : 'text-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs mt-1">{formatDate(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}