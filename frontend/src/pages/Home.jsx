import React, { use, useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../contexts/SocketContext";
import { UserContext } from "../contexts/userContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMap } from "react-leaflet";
import StatusToggle from "../components/OnlineToggle";
import ShowRiderDetails from "../components/ShowRiderDetails";
import DualSpinner from "../components/Loading";
import NewRidePopup from "../components/NewRidePopUp";
import { data, useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut } from "lucide-react";

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

function Home() {
  const navigate = useNavigate()
  const mapRef = useRef(null);
  const { socket } = useContext(SocketContext);
  const { user, hasBike, isOnline, loading, refreshAuth } =useContext(UserContext);
  const [rideId, setRideId] = useState(null);
  const [userUniqueId, setuserUniqueId] = useState(null);
  const [latitude, setlatitude] = useState(null);
  const [longitude, setlongitude] = useState(null);
  const [users, setUsers] = useState([]);
  const [otp, setotp] = useState(null);
  const [consumermsg, setconsumermsg] = useState("");
  const [bikeowner, setbikeowner] = useState("");
  const [flag, setflag] = useState(null);
  const [confirmmsg, setconfirmmsg] = useState("");
  const [ownerflag, setownerflag] = useState(false);
  const [RequestedUser,setrequestedUser]=useState({})
  const [BikeGivenUser,setbikegivenuser] = useState({})
  const [completeRideUser,setCompleteRide]=useState(null)
  const [rideTime,setRideTime] = useState(null)
  const [rideFare,setRidefare]=useState(null)
  const [noBikeUsers,setNobikeUsers]=useState([[]])


  if(loading) {
    return (
      <DualSpinner />
    )
  }
  const customIcon = L.icon({
    iconUrl: "/rider.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
  const saveRideState = (data) => {
    localStorage.setItem("active_ride_data", JSON.stringify(data));
    
  };
  useEffect(() => {
    

    const savedData = localStorage.getItem("active_ride_data");
    if (savedData) {
      const init = async () => {
        const res = await axios.post(
          `${import.meta.env.VITE_DEPLOY}/user/implicitToggleOnline`,
          {},
          { withCredentials: true }
        );
        console.log(res);
      };

      init();
      const parsed = JSON.parse(savedData);
      console.log(parsed)
      // Restore states based on what was saved
      if (parsed.otp) setotp(parsed.otp);
      if (parsed.bikeowner) setbikeowner(parsed.bikeowner);
      if (parsed.consumermsg) setconsumermsg(parsed.consumermsg);
      if (parsed.ownerflag) setownerflag(parsed.ownerflag);
      if (parsed.flag) setflag(parsed.flag);
      if (parsed.confirmmsg) setconfirmmsg(parsed.confirmmsg);
      if (parsed.rideId) setRideId(parsed.rideId);
      if(parsed.BikeGivenUser) setbikegivenuser(parsed.BikeGivenUser)
      if(parsed.RequestedUser) setrequestedUser(parsed.RequestedUser)
      
      if (socket) {
        if(navigator.geolocation){
          navigator.geolocation.watchPosition((postion) => {
            const{latitude,longitude} = postion.coords
            if(!hasBike){
              socket.emit("join", {
                id: RequestedUser._id,
                lat: latitude,
                long: longitude,
              });
              setlatitude(latitude);
              setlongitude(longitude);
            }
            if(hasBike){
              socket.emit("join", {
                id: BikeGivenUser._id,
                lat: latitude,
                long: longitude,
              });
            }
          },(error) => {console.log(error)},{
            enableHighAccuracy:true,
            maximumAge:0,
            timeout:1000
          })
        }
      }
    }
  }, [socket, user]);
  useEffect(() => {
    if (!socket) return;

    // Handler for when the OWNER confirms handover (The code you are testing)
    const handleOwnerRideConfirmed = (data) => {
      console.log("Socket Data Received:", data);
      saveRideState({ ownerflag: data.ownerflag, confirmmsg: data.message,RequestedUser:data.user,
        BikeGivenUser:data.bikeOwner
       });
      setownerflag(data.ownerflag);
      setconfirmmsg(data.message);
      setbikegivenuser(data.bikeOwner)
      setrequestedUser(data.user)
    };

    // Handler for general ride acceptance
    const handleAcceptRide = (data) => {
      setbikeowner(data.owner);
      setconsumermsg(data.message);
      setotp(data.otp);
      saveRideState({
        bikeowner: data.owner,
        consumermsg: data.message,
        otp: data.otp,
        rideId: data.rideId,
      });
    };

    // Handler for USER side confirmation
    const handleConfirmRide = (data) => {
      setflag(data.flag);
      setconfirmmsg(data.message);
      setrequestedUser(data.user)
      setbikegivenuser(data.bikeOwner);
      saveRideState({ flag: data.flag, confirmmsg: data.message, RequestedUser:data.user, BikeGivenUser:data.bikeOwner });
    };
    //handler for USER ride completion
    const handleRideCompletedToUser = (data) => {
      setCompleteRide(data.flag)
      setRideTime(data.hrDiff)
      setRidefare(data.Fare)
    }
    socket.on("ride-accepted", handleAcceptRide);
    socket.on("send-to-user-rideconfirmed", handleConfirmRide);
    socket.on("send-to-owner-rideconfirmed", handleOwnerRideConfirmed);
    socket.on("ride-complete-to-user",handleRideCompletedToUser);
    return () => {
      socket.off("ride-accepted", handleAcceptRide);
      socket.off("send-to-user-rideconfirmed", handleConfirmRide);
      socket.off("send-to-owner-rideconfirmed", handleOwnerRideConfirmed);
      socket.off("ride-complete-to-user",handleRideCompletedToUser);
    };
  }, [socket]); // Simplified dependencies to prevent unnecessary re-binds

  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleLocations = (data) => {
      setUsers(data);
    };

    const handleRequestBike = (data) => {
      setRideId(data.rideId);
      setuserUniqueId(data.userId);
      saveRideState({rideId:data.rideId})
    };

    socket.on("recive-locations", handleLocations);
    socket.on("request-bike", handleRequestBike);
    socket.on("no-bike-users", (data) => {
      setNobikeUsers(data);
    });
    return () => {
      socket.off("recive-locations", handleLocations);
      socket.off("request-bike", handleRequestBike);
      socket.off("no-bike-users",(data) => {
        setNobikeUsers(data);
      })
    };
  }, [socket, user?._id]);
  ;
  useEffect(() => {
    if (loading || !socket || !user?._id) return;

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit("join", {
            id: user._id,
            latitude,
            longitude,
          });
          setlatitude(latitude);
          setlongitude(longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { maximumAge: 0, timeout: 1000, enableHighAccuracy: true }
      );

      socket.on("recive-locations", (data) => {
        setUsers(data);
      });
      socket.on("no-bike-users", (data) => {
        setNobikeUsers(data)
      })
      socket.on("request-bike", (data) => {
        console.log(data);
        setRideId(data.rideId);
        saveRideState({rideId:data.rideId})
        setuserUniqueId(data.userId);
      });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [socket, user, loading]);

  if (loading || latitude === null || longitude === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <DualSpinner />
      </div>
    );
  }
  const logout = async() => {
    await axios.post(`${import.meta.env.VITE_DEPLOY}/user/logout`,{}
      ,{withCredentials:true}
    );

    refreshAuth ()
    navigate('/')
  }
  const completeRide = async () => {
    const res = await axios.post(`${import.meta.env.VITE_DEPLOY}/ride/completeRide`, {
      userUniqueId:RequestedUser.uniqueId,
      rideId:rideId,
    });
    console.log(res)
    localStorage.removeItem("active_ride_data");
    setRideId(null)
    setownerflag(false)
    setbikegivenuser(null)
    setconfirmmsg(null)
    setrequestedUser(null)
    setflag(null)
    setconsumermsg(null)
    setCompleteRide(null)
    setRideTime(null)
    setRidefare(null)
  }

  const completePayment = async() => {
    localStorage.removeItem("active_ride_data");
    setRideId(null)
    setownerflag(false)
    setbikegivenuser(null)
    setconfirmmsg(null)
    setrequestedUser(null)
    setflag(null)
    setconsumermsg(null)
    setCompleteRide(null);
    setRideTime(null);
    setRidefare(null);
    navigate('/')
  }
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation Bar Style Header */}
      <header className="sticky top-0 z-[1000] flex items-center justify-between bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-indigo-600">
            Voya{" "}
          </h1>
          <p className="text-xs text-slate-500">
            Welcome back, {user?.fullname || "User"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {hasBike && !ownerflag && (
            <div className="scale-90 transform transition-transform hover:scale-100">
              <StatusToggle />
            </div>
          )}
          <button 
          onClick={() => logout()}
          className="w-8 py-5 bg-red-500 h-6 text-white font-black rounded-lg shadow-xl shadow-red-500/20 flex items-center justify-center gap-3">
            <LogOut />
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {ownerflag ? (
            <div className="">
              <div className="lg:col-span-2  overflow-hidden rounded-2xl bg-white p-2 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden rounded-xl">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={16}
                    className="h-[40vh] md:h-[60vh] w-full"
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Modern cleaner tiles
                    />
                    <Marker position={[latitude, longitude]}>
                      <Popup className="custom-popup">
                        <div className="p-1 font-semibold">
                          {RequestedUser.fullname}
                        </div>
                      </Popup>
                    </Marker>
                    {BikeGivenUser &&
                      users.some((u) => u._id === BikeGivenUser._id) &&
                      users
                        .filter((u) => u._id === BikeGivenUser._id)
                        .map((u) => (
                          <Marker
                            key={u._id}
                            position={[u.lat, u.long]}
                            icon={customIcon}
                          >
                            <Popup className="custom-popup">
                              <div className="p-1 font-semibold">
                                Your Location
                              </div>
                            </Popup>
                          </Marker>
                        ))}

                    <RecenterMap lat={latitude} lng={longitude} />
                  </MapContainer>
                </div>
              </div>
              <div className="flex h-[90vh] md:h-[60vh]   flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 md:py-12">
                {/* Live Tracking Header Badge */}
                <div className="mb-6 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Live Tracking Active
                  </span>
                </div>

                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 text-center px-4">
                  Track the voyager in the interactive map above
                </h2>

                {/* Main Success Card */}
                <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 text-center overflow-hidden">
                  {/* Abstract Background Decoration */}
                  <div className="absolute -top-24 -right-24 h-48 w-48 bg-emerald-50 rounded-full blur-3xl opacity-60" />

                  {/* Success Icon Section */}
                  <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-100/50 scale-150"></div>
                    <div className="relative rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 text-white shadow-lg shadow-emerald-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                      Handover Complete!
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2">
                      Your bike has been successfully handed over to{" "}
                      <span className="text-md font-extrabold">
                        {RequestedUser.fullname}
                      </span>
                      . You can now relax while we track the journey
                    </p>

                    {/* Mini Stats Info (Purely Visual for SaaS Look) */}

                    {/* Action Section */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => completeRide()}
                        className="group w-full relative overflow-hidden px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Complete Ride
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
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </span>
                      </button>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Click only after bike is returned to you
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isOnline ? (
            /* Active Status View */
            <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 transition-all">
              <div className="relative mb-4">
                <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
                <div className="relative rounded-full bg-indigo-600 p-6 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800">
                Your bike is now hosted
              </h2>

              {rideId && userUniqueId ? (
                <NewRidePopup rideId={rideId} userId={userUniqueId} />
              ) : (
                <p className="mt-2 text-slate-500">
                  Connecting with nearby Voyagers...
                </p>
              )}
            </div>
          ) : (
            /* Map/Booking View */
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Map Section */}
              <div className="lg:col-span-2 overflow-hidden rounded-2xl md:h-[60vh] h-[40vh] bg-white p-2 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="relative md:h-[60vh] h-[40vh]  w-full overflow-hidden rounded-xl">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={16}
                    className="h-[43vh] md:h-[60vh] lg:h-[83vh] w-full"
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Modern cleaner tiles
                    />
                    <Marker position={[latitude, longitude]}>
                      <Popup className="custom-popup">
                        <div className="p-1 font-semibold">Your Loaction</div>
                      </Popup>
                    </Marker>

                    {BikeGivenUser &&
                    users.some((u) => u._id === BikeGivenUser._id)
                      ? users
                          .filter((u) => u._id === BikeGivenUser._id)
                          .map((u) => (
                            <Marker
                              key={u._id}
                              position={[u.lat, u.long]}
                              icon={customIcon}
                            >
                              <Popup className="custom-popup">
                                <div className="p-1 font-semibold">
                                  {u.fullname}
                                </div>
                              </Popup>
                            </Marker>
                          ))
                      : users.map((u) => (
                          <Marker
                            key={u._id}
                            position={[u.lat, u.long]}
                            icon={customIcon}
                          >
                            <Popup className="custom-popup">
                              <div className="p-1 font-semibold">
                                {u.fullname}
                              </div>
                            </Popup>
                          </Marker>
                        ))}

                    <RecenterMap lat={latitude} lng={longitude} />
                  </MapContainer>
                </div>
              </div>

              {/* Sidebar/Details Section */}

              {completeRideUser ? (
                <div className="animate-in fade-in h-[80vh] slide-in-from-bottom-8 duration-700 max-w-sm mx-auto">
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_22px_70px_4px_rgba(0,0,0,0.1)] border border-slate-100">
                    {/* Decorative Header */}
                    <div className="flex flex-col items-center mb-8">
                      <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                        <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Trip Summary
                      </h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Voyage successfully completed
                      </p>
                    </div>

                    {/* Transaction Details Card */}
                    <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">
                          Duration
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {rideTime} Hrs
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-dashed border-slate-200 w-full" />

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-medium text-slate-500">
                          Final Fare
                        </span>
                        <span className="text-2xl font-black text-slate-900">
                          ₹{rideFare}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => completePayment()}
                        className="group w-full relative overflow-hidden px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl transition-all hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-[0.98]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          Complete Payment
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </span>
                      </button>

                      <p className="text-[10px] text-center text-slate-400 font-medium px-4 leading-relaxed">
                        By clicking complete, you authorize the transaction for
                        the amount listed above.
                      </p>
                    </div>

                    {/* Bottom Notch Decoration */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-slate-100 rounded-t-full" />
                  </div>
                </div>
              ) : flag ? (
                <div className="animate-in fade-in zoom-in-95 h-[60vh] duration-500">
                  <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
                    {/* Decorative background element */}
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-50/50" />

                    <div className="relative flex flex-col items-center text-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 mb-7 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Journey
                      </div>
                      {/* Icon with soft pulse effect */}
                      <div className="relative mb-6">
                        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-20" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Modern Typography Stack */}
                      <h3 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
                        Voyage Commenced
                      </h3>

                      <div className="space-y-4">
                        <p className="max-w-[240px] text-sm font-medium leading-relaxed text-slate-500">
                          The bike handover is complete. Your rental period has
                          officially started.
                        </p>

                        {/* Status Badge */}
                      </div>

                      {/* Helpful Hint */}
                      <p className="mt-8 text-[11px] font-medium text-slate-400">
                        Please ride safely and follow local traffic laws.
                      </p>
                    </div>
                  </div>
                </div>
              ) : otp && consumermsg && bikeowner ? (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="rounded-2xl bg-white p-5 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4 text-center">
                      Security Verification
                    </p>
                    <div className="bg-slate-900 rounded-xl p-6 text-center mb-4">
                      <span className="text-4xl font-black tracking-[1em] text-white ml-[1em]">
                        {otp}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex  text-sm">
                        <span className="text-slate-400 mr-1">Host Name :</span>
                        <span className="font-bold text-slate-800">
                          {bikeowner}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 text-xs italic text-slate-600 border-l-4 border-indigo-400">
                        Your Voyage Authorization Code
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Nearby Hosts ({users.length})
                  </h3>

                  <div className="h-[55vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {users.length > 0 ? (
                      users.map((u) => (
                        <div
                          key={u._id}
                          className="mb-4 transform transition-all hover:translate-x-1"
                        >
                          <ShowRiderDetails
                            phno={u.phno}
                            fromUserId={user.uniqueId}
                            riderId={u.uniqueId}
                            bikeName={u.bikeName}
                            bikeNo={u.bikeNo}
                            fullname={u.fullname}
                            perHrFee={u.perHrFee}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl bg-slate-100 p-8 text-center text-slate-400">
                        No riders active in your area.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
