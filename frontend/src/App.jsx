import { useState, useRef, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import { UserContext } from "./contexts/userContext";
import { Outlet } from "react-router-dom";
import BottomNavBar from "./components/BottomNav";
import Home from "./pages/Home";
import LiveTrack from "./pages/LiveTrack";
import History from "./pages/History";
import Account from "./pages/Account";
import DualSpinner from "./components/Loading";

// Onboarding Slides Component
const OnboardingSlides = ({ onComplete }) => {
  
  const [currentSlide, setCurrentSlide] = useState(0);
      const [showOnboarding, setShowOnboarding] = useState(true);
  const slides = [
    {
      title: "Welcome to Voya",
      description: "Your trusted platform for bike sharing. Rent bikes from others or share your own to earn money.",
      icon: "🚴",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      title: "Find Bikes Nearby",
      description: "Discover available bikes in real-time on our interactive map. See exactly where bikes are located.",
      icon: "📍",
      gradient: "from-purple-500 to-pink-400"
    },
    {
      title: "Share Your Bike",
      description: "Own a bike? List it on our platform and earn money by renting it out to others in your area.",
      icon: "💰",
      gradient: "from-green-500 to-emerald-400"
    },
    {
      title: "Real-Time Tracking",
      description: "Track your rented bike in real-time. Know exactly where your bike is with live GPS tracking.",
      icon: "🗺️",
      gradient: "from-orange-500 to-red-400"
    },
    {
      title: "Flexible Pricing",
      description: "Set your own hourly rates as an owner, or find affordable bikes to rent. Fair pricing for everyone.",
      icon: "⚡",
      gradient: "from-indigo-500 to-blue-400"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Skip Button */}
      <button
        onClick={skipOnboarding}
        className="absolute top-6 right-6 text-gray-400 hover:text-white font-medium text-sm transition-colors z-10"
      >
        Skip
      </button>

      {/* Slide Content */}
      <div className="h-full flex flex-col items-center justify-center px-6 sm:px-8 md:px-12">
        {/* Icon with gradient background */}
        <div className={`mb-8 w-32 h-32 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center text-6xl shadow-2xl transform transition-all duration-500 ease-out`}>
          {slides[currentSlide].icon}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4 max-w-2xl">
          {slides[currentSlide].title}
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-center text-base sm:text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
          {slides[currentSlide].description}
        </p>

        {/* Progress Indicators */}
        <div className="flex gap-2 mb-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? `w-8 bg-gradient-to-r ${slides[currentSlide].gradient}`
                  : "w-2 bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 w-full max-w-md">
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="flex-1 py-4 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg"
            >
              Previous
            </button>
          )}
          <button
            onClick={nextSlide}
            className={`flex-1 py-4 px-6 bg-gradient-to-r ${slides[currentSlide].gradient} hover:opacity-90 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
              currentSlide === 0 ? "w-full" : ""
            }`}
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className={`absolute top-20 -left-20 w-80 h-80 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-20 -right-20 w-80 h-80 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-full blur-3xl`}></div>
      </div>
    </div>
  );
};

function App() {
  const {loggedIn ,loading} = useContext(UserContext)
  const [currentTab, setCurrentTab] = useState("home");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const {hasBike}=useContext(UserContext)
  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (hasSeenOnboarding) {
      setShowOnboarding(false);
    }
  }, []);

  

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  // Step 1: Show onboarding if user hasn't seen it and not logged in
  if (!loggedIn && showOnboarding) {
    return <OnboardingSlides onComplete={handleOnboardingComplete} />;
  }
  
  // Step 2: Show SignUp/SignIn if user is not logged in (after onboarding)
  

  // Step 3: Show Map only when user is logged in
  return (
    <div>
      {loggedIn ? (
        <div className="min-h-screen pb-28">
          <Outlet />

          {/* The Component Call */}
          <BottomNavBar activeTab={currentTab} onTabChange={setCurrentTab} />
        </div>
      ) : (
        <div>
          <SignIn />
        </div>
      )}
    </div>
  );
}

export default App;