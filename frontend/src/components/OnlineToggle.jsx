import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/userContext';
import DualSpinner from './Loading';

const StatusToggle = ({ onStatusChange }) => {

  const {isOnline,refreshAuth}=useContext(UserContext)

  const handleToggle = async() => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_DEPLOY}/user/toggleOnline`,{},{withCredentials:true})
      await refreshAuth()
      setloading(false)

    } catch (error) {
      setloading(false);
    }finally {
      setloading(false);
    }
    if (onStatusChange) onStatusChange(newStatus);
  };
        
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit">
      {/* Label Logic */}
      <span className={`text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
        isOnline ? 'text-green-500' : 'text-gray-400'
      }`}>
        {isOnline ? 'Online' : 'Offline'}
      </span>

      {/* Switch Container */}
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          isOnline ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        {/* Toggle Circle */}
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
            isOnline ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default StatusToggle;