// Mock device service for demonstration purposes
// In a real app, this would connect to a backend API

import { delay } from '../utils/helpers';

export interface Device {
  data: any;
  liveValue?: number;
  id: string;
  name: string;
  type: 'WATER_TANK' | 'DUSTBIN' | 'OTHER_SENSOR_SENSOR';
  location: string;
  onlineStatus: 'online' | 'offline' | 'warning' | 'error';
  lastUpdated?: string;
  capacityPercentage?: number;
  serialNumber?: string;
  installDate: string;
  metrics?: {
    dailyAverage?: number;
    weeklyConsumption?: number;
    monthlyAverage?: number;
  };
  alerts?: {
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
    read: boolean;
  }[];
}

// Generate mock devices for demo
const generateMockDevices = (): Device[] => {
  const types: Array<'WATER_TANK' | 'DUSTBIN' | 'OTHER_SENSOR_SENSOR'> = ['WATER_TANK', 'DUSTBIN', 'OTHER_SENSOR'];
  const locations = ['Home', 'Office', 'Warehouse', 'Factory', 'Garden'];
  const statuses: Array<'online' | 'offline' | 'warning' | 'error'> = ['online', 'offline', 'warning', 'error'];
  
  return Array.from({ length: 8 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const deviceNumber = i + 1;
    const typeName = type === 'WATER_TANK' ? 'Water Tank' : type === 'DUSTBIN' ? 'Smart Bin' : 'IoT Device';
    
    return {
      id: `device_${type}_${deviceNumber}`,
      name: `${typeName} ${deviceNumber}`,
      type,
      location: locations[Math.floor(Math.random() * locations.length)],
      onlineStatus: statuses[Math.floor(Math.random() * statuses.length)],
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
      capacityPercentage: Math.floor(Math.random() * 101),
      serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      installDate: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString().split('T')[0],
      metrics: {
        dailyAverage: Math.floor(Math.random() * 50) + 10,
        weeklyConsumption: Math.floor(Math.random() * 300) + 50,
        monthlyAverage: Math.floor(Math.random() * 1200) + 300,
      },
      alerts: Array.from({ length: Math.floor(Math.random() * 3) }, (_, j) => {
        const alertTypes: Array<'warning' | 'error' | 'info'> = ['warning', 'error', 'info'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const alertMessages = {
          WATER_TANK: {
            warning: 'Water level below 20%',
            error: 'Possible leak detected',
            info: 'Scheduled maintenance due',
          },
          DUSTBIN: {
            warning: 'Bin nearly full (80%)',
            error: 'Bin full - immediate collection needed',
            info: 'Collection scheduled for tomorrow',
          },
          OTHER_SENSOR: {
            warning: 'Battery low (15%)',
            error: 'Device unresponsive',
            info: 'Firmware update available',
          },
        };
        
        return {
          id: `alert_${j}_${Math.random().toString(36).substring(2, 9)}`,
          type: alertType,
          message: alertMessages[type][alertType],
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString(),
          read: Math.random() > 0.5,
        };
      }),
    };
  });
};

let mockDevices = generateMockDevices();

export const deviceService = {
async getDevices(): Promise<Device[]> {
  try {
    const token = localStorage.getItem('eco_monitor_user_jwt');
    const response = await fetch('http://localhost:8000/api/device', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      const realDevices: Device[] = data.data;
      return [...realDevices, ...mockDevices];
    } else {
      console.warn('Failed to fetch real devices. Returning only mock devices.');
      return [...mockDevices];
    }
  } catch (error) {
    console.error('Error fetching real devices:', error);
    return [...mockDevices]; // fallback
  }
},

async getDevice(id: string): Promise<Device> {
  try {
    const token = localStorage.getItem('eco_monitor_user_jwt');
    const response = await fetch(`http://localhost:8000/api/device/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const device = await response.json();
      return {
        ...device,
        lastUpdated: new Date().toISOString(),
        capacityPercentage: Math.floor(Math.random() * 101)
      };
    }

    throw new Error(`Real device not found`);
  } catch (error) {
    console.warn('Falling back to mock devices');
    const mockDevice = mockDevices.find(d => d.id === id);
    if (!mockDevice) {
      throw new Error(`Device with ID ${id} not found`);
    }

    return {
      ...mockDevice,
      lastUpdated: new Date().toISOString(),
      capacityPercentage: Math.floor(Math.random() * 101)
    };
  }
},

  
async createDevice(deviceData: {
  name: string;
  type: string;
  location: string;
  interfaceId: string;
}): Promise<Device> {
  const { name, type, location, interfaceId } = deviceData;

  if (!name || !type || !location || !interfaceId) {
    throw new Error('Name, type, location, and interfaceId are required');
  }
  if(interfaceId === '')
    {
    throw new Error('Interface is needed to continue');
  }
      const token = localStorage.getItem('eco_monitor_user_jwt');
  const response = await fetch(`http://localhost:8000/api/device/${interfaceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : `Bearer ${token}`
    },
    body: JSON.stringify({ name, type, location }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log(response);
    throw new Error(`Failed to create device: ${errorText}`);
    
  }

  const newDevice: Device = await response.json();
  return newDevice;
},


 async getAllDevices(): Promise<Device[]> {
  try {
    const token = localStorage.getItem('eco_monitor_user_jwt');

    const response = await fetch('http://localhost:8000/api/device', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json(); // Parse JSON

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch devices');
    }
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    throw new Error('Unable to fetch devices');
  }
},

  
  async updateDevice(id: string, updates: Partial<Device>): Promise<Device> {
    // Simulate API call delay
    await delay(800);
    
    const deviceIndex = mockDevices.findIndex(d => d.id === id);
    if (deviceIndex === -1) {
      throw new Error(`Device with ID ${id} not found`);
    }
    
    const updatedDevice = {
      ...mockDevices[deviceIndex],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    
    mockDevices[deviceIndex] = updatedDevice;
    return updatedDevice;
  },
  
  async deleteDevice(id: string): Promise<Boolean> {
    const token = localStorage.getItem('eco_monitor_user_jwt');
    const response = await fetch(`http://localhost:8000/api/device/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();

      
      // throw new Error(`Failed to delete device: ${errorText}`);
    return false;
    }
    return true;
  },
  
  // In a real app, you might have additional methods for specific operations
  async refreshDeviceData(id: string): Promise<Device> {
    // Simulate API call delay
    await delay(500);
    
    const deviceIndex = mockDevices.findIndex(d => d.id === id);
    if (deviceIndex === -1) {
      throw new Error(`Device with ID ${id} not found`);
    }
    
    // Update with fresh data
    const updatedDevice = {
      ...mockDevices[deviceIndex],
      lastUpdated: new Date().toISOString(),
      capacityPercentage: Math.floor(Math.random() * 101), // Simulate updated reading
      onlineStatus: Math.random() > 0.9 ? 'warning' : 'online', // Occasionally show a warning
    };
    
    mockDevices[deviceIndex] = updatedDevice;
    return updatedDevice;
  }
};