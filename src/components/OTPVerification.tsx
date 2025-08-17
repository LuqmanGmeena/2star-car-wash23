import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerified: (verified: boolean) => void;
  onClose: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ phoneNumber, onVerified, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Generate random OTP for demo (in real app, this would be sent via SMS)
  const [generatedOTP] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
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

  const handleVerify = async () => {
    const enteredOTP = otp.join('');
    
    if (enteredOTP.length !== 6) {
      setError('Please enter complete OTP code');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (enteredOTP === generatedOTP) {
        setSuccess(true);
        setTimeout(() => {
          onVerified(true);
        }, 1500);
      } else {
        setError('Invalid OTP code. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    setTimeLeft(300);
    setCanResend(false);
    setError('');
    setOtp(['', '', '', '', '', '']);
    // In real app, trigger new OTP send
    console.log('New OTP sent to:', phoneNumber);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified Successfully!</h2>
          <p className="text-gray-600">Your phone number has been verified.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to <br />
            <span className="font-semibold">{phoneNumber}</span>
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Demo Code: {generatedOTP}
          </p>
        </div>

        <div className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Timer */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-gray-600">
                Code expires in <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-red-600">Code has expired</p>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Code</span>
              )}
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleResend}
                disabled={!canResend}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
              >
                Resend Code
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;