/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';


export default function LoginForm() {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
    const response =   await login(email, password);
      if(!response)
        setError("error ooccurred!");
      else if(response.token){  
        alert('going to /')
        navigate('/' );
      }

    } catch (err) {
      setError('Invalid credentials. Use admin/admin to login');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async (clientId:string) => {
    setError('');
    setIsLoading(true);
    
    try {
      await loginWithGoogle(clientId);
      navigate('/');
    } catch (err) {
      setError('Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md space-y-6 p-8 card">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sign In</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Access your EcoMonitor dashboard
        </p>
      </div>
      
      {error && (
        <div className="bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200 p-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Mail className="w-5 h-5" />
            </span>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="admin"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Lock className="w-5 h-5" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 pr-10"
              placeholder="admin"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>
          
          <button
            type="button"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Forgot password?
          </button>
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full flex justify-center items-center space-x-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      
      <div className="relative flex items-center justify-center">
        <hr className="w-full border-gray-300 dark:border-gray-700" />
        <span className="absolute px-3 text-xs text-gray-500 bg-white dark:bg-navy-900">
          or continue with
        </span>
      </div>
      <GoogleLogin onSuccess={(credentialResponse)=>{
        console.log(credentialResponse);
        handleGoogleLogin(credentialResponse?.credential);
      }}
      onError={()=>{
        setError("An Error occurred! ")
        
      }}  
      >
        <button
        type="button"
        onClick={handleGoogleLogin}
        className="btn-outline w-full flex justify-center items-center space-x-2"
        disabled={isLoading}
      >
        <span>Sign in with Google</span>
      </button>
            </GoogleLogin>
      
      <div className="text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
        <button className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
         <Link to="/signup"> Signup</Link>
        </button>
      </div>
    </div>
  );
}