/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';


export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const email = localStorage.getItem('verifyEmail');
      if (!email) {
        setError('Email not found. Please try to login.');

        setIsLoading(false);
        return;
      }
      const response = await verifyOTP({ otp: otpString, email:email });
      alert(email);
      if (response.success) 
     {

       setIsVerified(true);
       setTimeout(() => {
         navigate('/login');
        }, 2000);
      }
      
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Implement resend OTP logic
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Droplets className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            EcoMonitor
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 p-8 card">
          {isVerified ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-success-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Verify Your Email
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  We've sent a verification code to your email address
                </p>
              </div>

              {error && (
                <div className="bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200 p-3 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Enter verification code
                  </label>
                  <div className="flex gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-2xl font-bold input"
                        required
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full flex justify-center items-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </form>

              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Didn't receive the code? </span>
                <button 
                  onClick={handleResendOTP}
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
                >
                  Resend
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© 2025 EcoMonitor. All rights reserved.</p>
      </footer>
    </div>
  );
}