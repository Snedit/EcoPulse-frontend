/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import axios from 'axios';
import { userService } from '../services/userService';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    fullName: string;
    username: string;
    email: string;
  };
}

interface User{
  email: string,
  fullName: string,
  username: string,
  token: string,
  id: string,
  createdAt: string
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

interface otpFormat{
  email: string,
  otp: string
}

interface otpResponse {
  success: boolean;
  message: string;
  // Add other fields as returned by your backend if needed
}

interface AuthContextType {
  user: User | null;

  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential:string) => Promise<User>;
  signUp: (data: SignUpData) => Promise<SignUpResponse>;
  verifyOTP: (otp: otpFormat) => Promise<otpResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const userData = await userService.getProfile();
        setUser(userData); //work needed here
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      if (userData) {
           const loginData = await userService.getProfile();
        setUser(loginData);
        
         localStorage.setItem("EcoUser", JSON.stringify(userData));
        return loginData;
      }
      throw new Error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential:string) => {
    setLoading(true);
    try {
      const userData = await authService.loginWithGoogle(credential);
      if(userData.success)
      {
const loginData = await userService.getProfile();
        setUser(loginData);
         localStorage.setItem("EcoUser", JSON.stringify(userData));
        return userData;
      }
    } finally {
      setLoading(false);
    }
  };

const signUp = async (data: SignUpData): Promise<SignUpResponse | void> => {
  setLoading(true);
  try {
    const response = await axios.post<SignUpResponse>(
      'http://localhost:8000/api/auth/register',
      data
    );

    return Promise.resolve(response.data);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with a non-2xx status code
        console.error("API error:", error.response.data);
        return error.response.data as SignUpResponse;
      } else if (error.request) {
        // No response received
        console.error("No response from server");
        return Promise.reject(
          {
            success: false,
            message: "No response from server",})
      }
    }

  } finally {
    setLoading(false);
  }
};


  const verifyOTP = async (otpData: otpFormat) : Promise<otpResponse> => {
    setLoading(true);
    try {
     const response  =  await authService.verifyOTP(otpData);
     return Promise.resolve(response);
    }
    catch(err){
      return Promise.resolve({
        success: false,
        message: "OTP NOT VERIFIED"
      });
    }
    finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        signUp,
        verifyOTP,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}