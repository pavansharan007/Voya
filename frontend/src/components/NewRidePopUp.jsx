import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { SocketContext } from "../contexts/SocketContext";
import { useForm } from "react-hook-form";
function NewRidePopup({ rideId, userId }) {

  const {socket} = useContext(SocketContext)
  const [flag,setflag] = useState(null)
  const [bikeownermsg,setbikeownermsg]=useState("")
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [consumer,setcosnumer] = useState("")
  const [declineFlag,setdeclineflag]=useState(null)
  const [noBikeUsers,setNobikeUsers] = useState([])
  useEffect(() => {
    if(!socket) return 

    const sendresToOwner = (data) => {
      setbikeownermsg(data.message);
      setcosnumer(data.user);
      setdeclineflag(false);
    };
    const handleNoBikeUsers = (data) => {
      setNobikeUsers(data)
    }

    socket.on("no-bike-users",handleNoBikeUsers)

    socket.on("send-res-to-owner", sendresToOwner);
    return () => {
      socket.off("send-res-to-owner", sendresToOwner);
      socket.off("no-bike-users",handleNoBikeUsers)
    }
  },[])
  useEffect(() => {
    // whenever rideId or userId changes, reset declineFlag
    setdeclineflag(false);
    setflag(null);
  }, [rideId, userId]);

  const onSubmitt = async (data) => {
    try {
      console.log(data)
      const otpUpper = data.otp.toUpperCase();
      const res = axios.post(
        `${import.meta.env.VITE_DEPLOY}/ride/confirmRide`,
        {
          userUniqueId: userId,
          rideId: rideId,
          otp: otpUpper,
        }
      );
    } catch (error) {
      console.log(error)
    }
  }
  const declineRide = async() => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_DEPLOY}/ride/declineRide`, {
        rideId:rideId,
        userUniqueId:userId,
      });
      console.log(res)
      setdeclineflag(res.data.flag)
      
      
    } catch (error) {
      console.log(error)
    }
  }
  const onAccept =async(rideId,userId) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_DEPLOY}/ride/acceptRide`, {
        userUniqueId: userId,
        rideId:rideId
      },{withCredentials:true});
      
      console.log(res)
      setflag(res.data.flag)
    } catch (error) {
      console.log(error)
      setflag(false)
    }
  }
  if(flag && consumer && bikeownermsg){
    return (
      <div className="fixed  flex flex-col items-center justify-center w-[50vh] h-[50vh] bg-white p-6 overflow-hidden">

        {/* Decorative subtle gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

        {/* Header Section */}
        <div className="mb-6 text-left mr-9">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Security Check
            </span>
          </div>
          <h3 className="text-sm font-normal text-slate-800 leading-tight">From User </h3>
          <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
            {consumer || "Verify Ride"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {bikeownermsg ||
              "Please enter the OTP provided by the customer to start the journey."}
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmitt)} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">
              Validation Code
            </label>
            <div className="relative">
              <input
                placeholder="ex: ABCD"
                className={`w-full bg-slate-50 border-2 rounded-xl px-4 py-3.5 text-lg font-mono tracking-[0.5em] uppercase transition-all outline-none placeholder:tracking-normal placeholder:text-slate-300
            ${
              errors.otp
                ? "border-red-200 focus:border-red-500"
                : "border-slate-100 focus:border-blue-500 focus:bg-white focus:shadow-md"
            }
          `}
                {...register("otp", { required: "OTP is required" })}
              />
              {/* Verification Icon inside input */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Messaging (Corrected to check for .otp as per your register) */}
            {errors.otp && (
              <div className="flex items-center gap-1.5 mt-1 ml-1 text-red-500">
                <span className="text-[10px] font-bold">
                  ⚠️ {errors.otp.message}
                </span>
              </div>
            )}
          </div>

          <button
            className="group relative w-full overflow-hidden rounded-xl bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] shadow-lg shadow-slate-200"
            type="submit"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Complete Handover
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </button>
        </form>

        {/* Background Branding Detail */}
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-slate-50 opacity-50 z-0" />
      </div>
    );
  }
  if(declineFlag){
    return (
      <div>

      </div>
    )
  }
  return (
    <div>
      <div className="fixed bottom-6 right-6 z-[2000] w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
          {/* Header Section */}
          <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                New Voyage Proposal
              </h2>
            </div>
            <span className="text-[10px] font-medium text-indigo-100 opacity-70">
              Just now
            </span>
          </div>

          {/* Content Section */}
          <div className="p-5">
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold">
                  {userId?.substring(0, 1).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
                    Customer ID
                  </p>
                  <p className="text-sm font-mono text-slate-200">
                    #{userId?.substring(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Ride Details Area */}
              <div className="rounded-lg bg-slate-800/50 p-3 border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Ride Reference</span>
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    ID: {rideId?.substring(0, 6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => declineRide()}
                className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400 border border-slate-700"
              >
                Decline
              </button>
              <button
                onClick={() => onAccept(rideId, userId)}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95"
              >
                Confirm Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewRidePopup;
