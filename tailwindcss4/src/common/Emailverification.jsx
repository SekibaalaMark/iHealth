import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import emailIcon from '../assets/mailbulk.png'; // You'll need to add this icon
import helpIcon from '../assets/help-icon.png'; // You'll need to add this icon

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const email = 'user@example.com'; // Replace with the actual email
  const [error, setError] = useState('');
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Check if all digits are entered to enable the Next button
  const isCodeComplete = verificationCode.every((digit) => digit !== '');

  // Handle input change for each digit
  const handleDigitChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    // Update the verification code array
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Clear any previous errors
    if (error) setError('');

    // Auto-focus next input if current input is filled
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle key press for backspace to go to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Combine the digits into a single code
    const code = verificationCode.join('');

    // Simulate verification check
    if (code === '1234') {
      console.log('Verification successful');
      // Redirect to next page or perform necessary action
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };

  // Focus the first input field on component mount
  useEffect(() => {
    inputRefs[0].current.focus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="flex justify-between items-center w-full max-w-2xl p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">AITS</h1>
        <button className="flex items-center text-blue-500 hover:text-blue-600">
          <img src={helpIcon} alt="Help" className="w-5 h-5 mr-2" />
          Help?
        </button>
      </header>

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mt-8">
        <div className="flex justify-center mb-4">
          <img src={emailIcon} alt="Email Verification" className="w-16 h-16" />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Email Verification</h2>
        <p className="text-gray-600 text-center mb-1">
          Enter the verification code we sent to you on
        </p>
        <p className="text-gray-800 font-medium text-center mb-6">{email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center space-x-2">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <button
            type="submit"
            className={`w-full py-2 text-white rounded-md ${
              isCodeComplete
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!isCodeComplete}
          >
            Next
          </button>
        </form>

        <Link
          to="/signin"
          className="block text-center text-blue-500 hover:text-blue-600 mt-4"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default EmailVerification;