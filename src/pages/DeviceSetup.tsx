import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Trash2, Dice1 as Device, MapPin, Barcode, CalendarDays, Bot } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { deviceService } from '../services/deviceService';
import { interfaceService, type Interface } from '../services/interfaceService';
import MapPicker from '../components/device/MapPicker';

type DeviceType = 'WATER_TANK' | "DUSTBIN" | "SMART_BIN" | "OTHER_SENSOR"

export default function DeviceSetup() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInterface, setSelectedInterface]  = useState<string | null>(null);
  const [interfaces, setInterfaces] = useState<Interface[]>([]);

  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    // serialNumber: '',
    installDate: new Date().toISOString().split('T')[0],
  });
  
useEffect(() => {
  const fetchInterfaces = async () => {
    try {
      const data = await interfaceService.getInterfaces();
      setInterfaces(data);
    } catch (err) {
      console.error('Failed to load interfaces', err);
    }
  };

  fetchInterfaces();
}, []);

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const validateStep = () => {
    if (step === 1 && !deviceType) {
      setError('Please select a device type');
      return false;
    }
    
    if (step === 2) {
      if (!formData.name.trim()) {
        setError('Device name is required');
        return false;
      }
      
      if (!formData.location.trim()) {
        setError('Location is required');
        return false;
      }
    }
    
    setError('');
    return true;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsLoading(true);
    try {
      const newDevice = await deviceService.createDevice({
        name: formData.name,
        type: deviceType!,
        location: formData.location,
        interfaceId: selectedInterface ?? ''
      });
      console.log(newDevice);
      
      navigate(`/device/${newDevice.data.id}`);
    } catch (error) {
      console.error('Failed to create device:', error);
      setError('Failed to create device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deviceTypeOptions = [
    {
      type: 'WATER_TANK',
      title: 'Water Tank',
      description: 'Monitor water levels in tanks and cisterns',
      icon: <Droplets className="w-10 h-10 text-primary-500" />,
    },
    {
      type: 'DUSTBIN',
      title: 'Smart Bin',
      description: 'Track waste levels and schedule collections',
      icon: <Trash2 className="w-10 h-10 text-secondary-500" />,
    },
    {
      type: 'OTHER_SENSOR',
      title: 'Other Device',
      description: 'Generic IoT device for custom monitoring',
      icon: <Device className="w-10 h-10 text-accent-500" />,
    },
    {
  type: 'SMART_BIN',
  title: 'Smart AI Bin',
  description: 'AI-powered waste sorting and smart disposal monitoring',
  icon: <Bot className="w-10 h-10 text-yellow-500" />,
}
  ];

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Add New Device</h1>
        </div>
        
        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-navy-800 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${
                step >= 2 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-navy-800'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-navy-800 text-gray-500'
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${
                step >= 3 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-navy-800'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-navy-800 text-gray-500'
              }`}>
                3
              </div>
            </div>
            
            <div className="text-sm font-medium">
              Step {step} of 3
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="card p-6">
          {/* Step 1: Select device type */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Device Type</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose the type of device you want to add to your system.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {deviceTypeOptions.map((option) => (
                  <div
                    key={option.type}
                    onClick={() => setDeviceType(option.type as DeviceType)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      deviceType === option.type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                        : 'border-gray-200 dark:border-navy-800 hover:border-gray-300 dark:hover:border-navy-700'
                    }`}
                  >
                    <div className="mb-3">{option.icon}</div>
                    <h3 className="font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
              
             
            
           <div className="mb-6">
  <h2 className="text-lg font-medium mb-2">Select Interface</h2>
<select
  className="input w-full"
  value={selectedInterface ?? ''}
  onChange={(e) => setSelectedInterface(e.target.value)}
>
  <option value="" disabled>Select an interface</option>
  {interfaces.length > 0 ? (
    interfaces.map((intf) => (
      <option key={intf.id} value={intf.id}>
        {intf.name} — {intf.description}
      </option>
    ))
  ) : (
    <option disabled key="no-interface">
      No Interface available
    </option>
  )}
</select>

</div>
 <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Continue
                </button>
              </div>
              </div>
            
          )}
          
          {/* Step 2: Basic information */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Device Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter the basic details for your new device.
              </p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Device Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    placeholder="e.g., Rooftop Water Tank"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                
                <div>
  <label className="block text-sm font-medium mb-2">Location *</label>

  {/* GPS button */}
  <button
    onClick={() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const latlng = `${pos.coords.latitude}, ${pos.coords.longitude}`;
        updateFormData('location', latlng);
      });
    }}
    className="btn-outline mb-2"
  >
    📍 Use my location
  </button>

  <MapPicker
    onSelect={(latlng) => updateFormData('location', latlng)}
  />

  <input
    type="text"
    className="input mt-2"
    placeholder="Lat, Lng"
    value={formData.location}
    readOnly
  />
</div>

              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Additional details */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Provide some additional information to complete the setup.
              </p>
              
              <div className="space-y-4 mb-8">
                {/* <div>
                  <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Serial Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Barcode className="w-5 h-5" />
                    </span>
                    <input
                      id="serialNumber"
                      type="text"
                      className="input pl-10"
                      placeholder="e.g., SN-12345678"
                      value={formData.serialNumber}
                      onChange={(e) => updateFormData('serialNumber', e.target.value)}
                    />
                  </div>
                </div> */}
                
                <div>
                  <label htmlFor="installDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Installation Date
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <CalendarDays className="w-5 h-5" />
                    </span>
                    <input
                      id="installDate"
                      type="date"
                      className="input pl-10"
                      value={formData.installDate}
                      onChange={(e) => updateFormData('installDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      Adding...
                    </span>
                  ) : (
                    'Add Device'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}