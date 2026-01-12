import React, { useContext, useState } from "react";
import { Home, MapPin, Clock, User } from "lucide-react";
import { UserContext } from "../contexts/userContext";
import { Path } from "leaflet";
import { useLocation, Link } from "react-router-dom";

// Added default values to props to prevent "not a function" errors
const BottomNavBar = ({ activeTab = "home", onTabChange = () => {} }) => {
  const { hasBike } = useContext(UserContext);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const location = useLocation();
  const navItems = [
    { id: "home", label: "Home", icon: Home, path:'/' },
    { id: "history", label: "History", icon: Clock,path :'/History' },
    { id: "profile", label: "Profile", icon: User, path:'/Account' },
  ];

  const handleTabClick = (itemId) => {
    // 1. Feature Logic: If user clicks profile but has no bike
    if (itemId === "profile" && !hasBike) {
      setShowRegisterPopup(true);
      setTimeout(() => setShowRegisterPopup(false), 2000);
      // We still change the tab, or you can return early to block it
    }

    // 2. Defensive check: Ensure onTabChange is actually a function
    if (typeof onTabChange === "function") {
      onTabChange(itemId);
    }
  };

  return (
    <>
      {/* Register Bike Popup - Using Tailwind for animations */}
      {showRegisterPopup && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-bounce sm:left-auto sm:right-8 sm:w-80">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-4 shadow-2xl border border-white/20 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🚴</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">
                  Register Your Bike
                </h3>
                <p className="text-white/90 text-xs mt-1">
                  Start earning by sharing your bike with others!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-t border-white/20 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-screen-lg mx-auto px-6">
          <div className="flex items-center justify-around h-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <Link
                  to={item.path}
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className="flex flex-col items-center justify-center flex-1 h-full relative group"
                >
                  {/* Active Indicator Bar (Top) */}
                  <div
                    className={`absolute top-0 w-12 h-1 rounded-b-full transition-all duration-300 ${
                      isActive ? "bg-blue-600" : "bg-transparent"
                    }`}
                  />

                  <div className="relative flex flex-col items-center gap-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span
                      className={`text-[10px] font-semibold transition-colors duration-300 ${
                        isActive ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNavBar;