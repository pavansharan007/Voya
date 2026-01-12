import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useFetcher } from "react-router-dom";
import DualSpinner from "../components/Loading";
import { Flag } from "lucide-react";
const VoyageLog = ({ }) => {
  const [rides, setRides] = useState([])
  const [loading,setLoading] = useState(true)
  useEffect(() => {
    const init  = async () => {
      const res= await axios.get(`${import.meta.env.VITE_DEPLOY}/ride/getRide`,{withCredentials:true});
      setRides(res.data.rides);
      setLoading(false)
    }
    init()
  })
  if(loading){
    return (
      <DualSpinner />
    )
  }
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Voyage Log
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              History of your activations and missions.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Sessions
            </span>
            <p className="text-2xl font-black text-indigo-600">
              {rides?.length || 0}
            </p>
          </div>
        </div>

        {/* List of Voyage Cards */}
        <div className="space-y-6">
          {rides?.map((ride) => (
            <div
              key={ride._id}
              className="group relative bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
            >
              {/* Status Badge */}
              <div className="absolute top-8 right-8">
                {ride.rideStatus === "ongoing" ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 border border-indigo-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    In Transit
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 border border-emerald-100">
                    Completed
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-8">
                {/* Left Section: IDs and Status */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Voyage ID
                  </span>
                  <p className="font-mono text-sm font-bold text-slate-700">
                    #{ride.rideId}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    {new Date(ride.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Center Section: Participants */}
                <div className="flex-1 grid grid-cols-2 gap-4 border-l border-slate-50 pl-0 md:pl-8">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      Host
                    </span>
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {ride.hostName || "Pending Sync"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      Voyager
                    </span>
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {ride.voyagerName || "Pending Sync"}
                    </p>
                  </div>
                </div>

                {/* Right Section: Financials */}
                <div className="flex items-center gap-6 bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter block leading-none">
                      Rate
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      ₹{ride.perHrFee}/hr
                    </span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter block leading-none">
                      Total Fare
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {ride.rideStatus === "ongoing"
                        ? "---"
                        : `₹${ride.rideFee.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Info for OTP/Time */}
              <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="text-slate-300">Auth Key:</span>
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-indigo-600 font-bold">
                      {ride.rideOtp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="text-slate-300">Activation:</span>
                    <span>{ride.ridePickupTime}</span>
                  </div>
                  {ride.rideCompletedTime && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="text-slate-300">Closure:</span>
                      <span>{ride.rideCompletedTime}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoyageLog;
