import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';

import SignUp from './pages/SignUp';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import DeviceSetup from './pages/DeviceSetup';
import DeviceDetails from './pages/DeviceDetails';
import Profile from './pages/Profile';
import DeviceListPage from './pages/DeviceListPage';
import InterfaceListPage from './pages/InterfaceListPage';
import NotFound from './pages/NotFound';
import InterfaceDetailsPage from './pages/InterfaceDetailsPage'; 
import InterfaceSetup from './pages/InterfaceSetup';
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/device/setup" 
              element={
                <ProtectedRoute>
                  <DeviceSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/devices" 
              element={
                <ProtectedRoute>
                  <DeviceListPage/>
                </ProtectedRoute>
              } 
            />
                  <Route path="/interface/:id" element={
                    <ProtectedRoute>
                    <InterfaceDetailsPage />
                    </ProtectedRoute>
                    } />

            <Route 
              path="/interfaces" 
              element={
                <ProtectedRoute>
                  <InterfaceListPage/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interface/setup" 
              element={
                <ProtectedRoute>
                  <InterfaceSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/device/:id" 
              element={
                <ProtectedRoute>
                  <DeviceDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;