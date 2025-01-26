// src/context/VolumeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const VolumeContext = createContext();

export const VolumeProvider = ({ children }) => {
  const [volume, setVolume] = useState(() => {
    return parseFloat(localStorage.getItem('volume')) || 1;
  });

  useEffect(() => {
    localStorage.setItem('volume', volume);
  }, [volume]);

  return (
    <VolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </VolumeContext.Provider>
  );
};

export const useVolume = () => {
  const context = useContext(VolumeContext);
  if (!context) {
    throw new Error('useVolume must be used within a VolumeProvider');
  }
  return context;
};