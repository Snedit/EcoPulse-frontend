/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock auth service for demonstration purposes
// In a real app, this would connect to a backend API

import axios from 'axios';
import { delay } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: User;
}
 
interface User{
  email: string,
  fullName: string,
    role: string,
  token: string,
    
}
interface SignUpData {
  username: string;
  fullName: string;
  email: string;
  password: string;
}
interface SignUpResponse {
success: boolean,
message: string,
data: {
  otpExpiresInSeconds: number,
  email: string
}
}
interface otpResponse {
success: boolean,
message: string,
data: {
  email: string
}
}

interface otpFormat{
  email: string,
  otp: string
}
// Simulate persistent storage
const STORAGE_KEY = 'eco_monitor_user_jwt';

const saveUserToStorage = (user: User) => {
  localStorage.setItem(STORAGE_KEY, `${user}`);
};

const getUserFromStorage = (): string | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

const clearUserFromStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("EcoUser");
};

export const authService = {
   
  
  async  login(email: string, password: string): Promise<User> {
  try {
    const response = await axios.post('http://localhost:8000/api/auth/login', {
      email,
      password,
    });

    if (response.data.success && response.data.data) {

       saveUserToStorage(response.data.data.token); // Save only user token
      return response.data.data;
    }

    return response.data; // If somehow success is false but response is OK

  } catch (error: any) {
 
      throw new Error("login failed");
   
  }},

    
    // throw new Error('Invalid credentials');
  
  
  async loginWithGoogle( credential: string ): Promise<LoginResponse> {
 
    const response  = await fetch("http://localhost:8000/api/auth/google-login", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credential}`
      }
    });
    
    // For testing, Google login also uses admin account
    const data = await response.json();
    const user: LoginResponse = {
      success: data.success,
      message: data.message,
      data: data.data
    };
    console.log(user);
saveUserToStorage(data.data.token);
    
    // saveUserToStorage(user);
    return user;
  },

  async signUp(data: SignUpData): Promise<SignUpResponse> {
    // Simulate API call delay
    const {username, fullName, email, password} = data;
    const response  = await axios.post("http://localhost:8000/api/auth/register", {
username, fullName, email, password
    })
    
   const {success} = response.data;

    // For demo, always succeed
    if(!success)
      return Promise.reject(response.data.message||"could not register");
else
    return Promise.resolve(response.data);
  },

  async verifyOTP(data: otpFormat): Promise<otpResponse> {
    // Simulate API call delay
    const {email, otp} = data;
    alert(`otp is ${otp}`   )
    if (otp.length !== 6) {
      throw new Error('Invalid OTP');
      
    }
    const response  = await axios.post("http://localhost:8000/api/auth/register/verify-otp", {
      email, otp
    })
    if(!response.data.success)
      return Promise.reject(response.data.message||'no msg');
    
    return Promise.resolve(response.data);
  },
  
  async logout(): Promise<void> {
    // Simulate API call delay
    await delay(500);
    clearUserFromStorage();
  },
  
  async getCurrentUser(): Promise<User> {
    // Simulate API call delay
    const userStr = localStorage.getItem("EcoUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      return Promise.resolve(user);
    } else {
      return Promise.reject("user not logged in");
    }
  }
}