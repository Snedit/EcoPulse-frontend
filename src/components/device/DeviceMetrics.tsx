import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Droplets, Calendar, TrendingUp } from 'lucide-react';
import { type Device } from '../../services/deviceService';

interface DeviceMetricsProps {
  device: Device;
}

export default function DeviceMetrics({ device }: DeviceMetricsProps) {
  const isWaterTank = device.type === 'waterTank';
  
  // Generate mock data for charts
  const generateConsumptionData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      value: Math.floor(Math.random() * 50) + 10,
    }));
  };
  
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      value: Math.floor(Math.random() * 100) + 20,
    }));
  };
  
  const weeklyData = generateConsumptionData();
  const monthlyData = generateMonthlyData();
  
  const metricCards = [
    {
      title: isWaterTank ? 'Daily Usage' : 'Daily Collection',
      value: `${device.metrics?.dailyAverage || 0} ${isWaterTank ? 'L' : 'kg'}`,
      icon: <Droplets className="w-5 h-5 text-primary-500" />,
      change: '+3.5%',
      isPositive: !isWaterTank, // Positive for dustbin means more collection (good), negative for water (usage down is good)
    },
    {
      title: isWaterTank ? 'Weekly Consumption' : 'Weekly Waste',
      value: `${device.metrics?.weeklyConsumption || 0} ${isWaterTank ? 'L' : 'kg'}`,
      icon: <Calendar className="w-5 h-5 text-secondary-500" />,
      change: '-2.1%',
      isPositive: isWaterTank, // For water tanks, reduced consumption is good
    },
    {
      title: 'Monthly Average',
      value: `${device.metrics?.monthlyAverage || 0} ${isWaterTank ? 'L' : 'kg'}`,
      icon: <TrendingUp className="w-5 h-5 text-accent-500" />,
      change: '+1.8%',
      isPositive: !isWaterTank, // Same as daily
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Device Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metricCards.map((card, index) => (
          <div key={index} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <span className="p-2 rounded-full bg-gray-100 dark:bg-navy-800">
                {card.icon}
              </span>
            </div>
            <div className="mt-2">
              <span className={`text-sm ${card.isPositive ? 'text-success-500' : 'text-error-500'}`}>
                {card.change} from last period
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Weekly {isWaterTank ? 'Consumption' : 'Collection'}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB' 
                  }} 
                />
                <Bar 
                  dataKey="value" 
                  fill={isWaterTank ? '#0075ff' : '#00c5ff'} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isWaterTank ? '#5029ff' : '#ffc100'} 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: isWaterTank ? '#5029ff' : '#ffc100' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}