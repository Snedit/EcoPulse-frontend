import { useState } from 'react';
import { User, Mail, Lock, Bell, Shield, LogOut } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('account');
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <div className="card p-4">
              <div className="flex flex-col items-center p-4">
                <img
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=0075FF&color=fff`}
                  alt={user?.fullName}
                  className="w-20 h-20 rounded-full mb-3"
                />
                <h2 className="font-bold text-lg">{`${user?.fullName} ( @${user?.username} )`}</h2>
                
              </div>
              
              <nav className="mt-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('account')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${activeTab === 'account'
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>Account</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('security')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${activeTab === 'security'
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      <span>Security</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${activeTab === 'notifications'
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="card p-6">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Profile Picture
                      </label>
                      <div className="flex items-center space-x-4">
                        <img
                          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName|| 'User')}&background=0075FF&color=fff`}
                          alt={user?.fullName}
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <button className="btn-outline text-sm">Change Photo</button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="input"
                        defaultValue={user?.fullName}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <Mail className="w-5 h-5" />
                        </span>
                        <input
                          id="email"
                          type="email"
                          className="input pl-10"
                          defaultValue={user?.email}
                          readOnly
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Your email address is used for login and cannot be changed.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Timezone
                      </label>
                      <select id="timezone" className="input">
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="America/New_York">Eastern Time (US & Canada)</option>
                        <option value="America/Chicago">Central Time (US & Canada)</option>
                        <option value="America/Denver">Mountain Time (US & Canada)</option>
                        <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button className="btn-primary">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <Lock className="w-5 h-5" />
                            </span>
                            <input
                              id="current-password"
                              type="password"
                              className="input pl-10"
                              placeholder="Enter your current password"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password
                          </label>
                          <input
                            id="new-password"
                            type="password"
                            className="input"
                            placeholder="Enter new password"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            id="confirm-password"
                            type="password"
                            className="input"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <button className="btn-primary">Update Password</button>
                      </div>
                    </div>
                    
                    <hr className="border-gray-200 dark:border-navy-800" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                      
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Two-factor authentication adds an extra layer of security to your account.
                        </p>
                        <button className="mt-3 btn-outline text-sm">Enable Two-Factor Auth</button>
                      </div>
                    </div>
                    
                    <hr className="border-gray-200 dark:border-navy-800" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Recent Logins</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-800">
                          <div>
                            <p className="font-medium">Chrome on Windows</p>
                            <p className="text-sm text-gray-500">Today at 10:45 AM</p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200">
                            Current
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-800">
                          <div>
                            <p className="font-medium">Safari on iPhone</p>
                            <p className="text-sm text-gray-500">Yesterday at 8:30 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Device Alerts</p>
                            <p className="text-sm text-gray-500">Get notified when a device needs attention</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">System Updates</p>
                            <p className="text-sm text-gray-500">Get notified about platform updates</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Tips & Tutorials</p>
                            <p className="text-sm text-gray-500">Receive helpful tips to optimize your setup</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <hr className="border-gray-200 dark:border-navy-800" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Critical Alerts</p>
                            <p className="text-sm text-gray-500">Urgent notifications about your devices</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Status Changes</p>
                            <p className="text-sm text-gray-500">Get notified when device status changes</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button className="btn-primary">Save Preferences</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}