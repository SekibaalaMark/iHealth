import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import libraryImage from '../assets/student.png';
import uploadIcon from '../assets/upload.png';

const ProfilePictureSetup = () => {
  const navigate = useNavigate();
  const Back = () => {
    navigate(-1);
  };
  const handleGoToCongragulation = () => {
    navigate('/congragulation');
  };

  const [currentPicture, setCurrentPicture] = useState(null);
  const [newPicture, setNewPicture] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file) => {
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Please upload a JPG or PNG file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setNewPicture(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (newPicture) {
      setCurrentPicture(newPicture);
      setNewPicture(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl">
        {/* Left section */}
        <div className="w-full md:w-1/2 bg-gray-200 flex items-center justify-center">
          <img src={libraryImage} alt="Library" className="w-3/4 h-auto" />
        </div>

        {/* Right section */}
        <div className="w-full md:w-1/2 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Academic Issue Tracking System</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Profile Picture Setup</h2>
          <p className="text-gray-600 mb-6">Let's also set your profile picture</p>

          <form onSubmit={handleSubmit}>
            {/* Current Picture */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Current Picture</h3>
              <div className="w-32 h-32 border border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {currentPicture ? (
                  <img src={currentPicture} alt="Current Profile" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-gray-500">None</p>
                )}
              </div>
            </div>

            {/* New Picture */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">New Picture</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-blue-300'
                }`}
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png"
                  className="hidden"
                />
                {newPicture ? (
                  <img src={newPicture} alt="New Profile" className="w-32 h-32 object-cover rounded-full" />
                ) : (
                  <div className="text-center">
                    <img src={uploadIcon} alt="Upload" className="w-12 h-12 mx-auto mb-2" />
                    <h4 className="text-gray-700 font-medium">Upload Image</h4>
                    <p className="text-gray-500 text-sm">PNG, JPG (Max: 10MB)</p>
                  </div>
                )}
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={Back}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleGoToCongragulation}
              >
                Next
              </button>
            </div>
            <div className="text-gray-500 text-sm mt-4 text-center">2 of 2</div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureSetup;
