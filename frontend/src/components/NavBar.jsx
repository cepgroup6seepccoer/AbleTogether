import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle, FaBars, FaTimes, FaMapMarkerAlt } from "react-icons/fa";

export default function NavBar({ locationInfo }) {
  const { user, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getLocationDisplay = () => {
    if (!locationInfo) return null;
    
    const { name, type } = locationInfo;
    let icon = "📍";
    let text = name;
    
    if (type === 'precise') {
      icon = "📍";
      text = name;
    } else if (type === 'estimated') {
      icon = "🌍";
      text = `${name} (estimated)`;
    } else {
      icon = "🌍";
      text = name;
    }
    
    return { icon, text };
  };

  const locationDisplay = getLocationDisplay();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl lg:text-3xl" aria-label="AbleTogether logo">
              <img src="https://res.cloudinary.com/dudvtmjbh/image/upload/v1753856557/Your_paragraph_text-removebg-preview_otqpqe.png" alt="AbleTogether logo" className="w-10 h-10" />
            </span>
            <span className="text-xl lg:text-2xl font-bold text-blue-700">AbleTogether</span>
          </div>

          {/* Location Display - Center */}
          {locationDisplay && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-lg">{locationDisplay.icon}</span>
              <span className="text-sm font-medium text-blue-800">{locationDisplay.text}</span>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <ul className="flex gap-6 text-lg">
              <li><a href="#" className="hover:underline">Home</a></li>
              {/*<li><a href="#" className="hover:underline">About</a></li>
              <li><a href="#" className="hover:underline">Accessibility Tips</a></li>
              <li><a href="#" className="hover:underline">Contribute</a></li>*/}
              {user.isAdmin && <li><a href="#" className="hover:underline">Admin</a></li>}
            </ul>
            
            {/* Desktop Auth Button */}
            <div>
              {user.isLoggedIn ? (
                <button onClick={logout} className="flex items-center gap-2">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <FaUserCircle className="w-8 h-8 text-gray-600" aria-label="User profile" />
                  )}
                  <span className="sr-only">Logout</span>
                </button>
              ) : (
                <button onClick={login} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-lg font-semibold hover:bg-blue-800" aria-label="Login or Sign Up">
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-800"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            {/* Mobile Location Display */}
            {locationDisplay && (
              <div className="flex items-center gap-2 mb-4 px-2 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-lg">{locationDisplay.icon}</span>
                <span className="text-sm font-medium text-blue-800">{locationDisplay.text}</span>
              </div>
            )}
            
            <ul className="flex flex-col gap-4 text-lg">
              <li><a href="#" className="block hover:underline">Home</a></li>
              <li><a href="#" className="block hover:underline">About</a></li>
              <li><a href="#" className="block hover:underline">Accessibility Tips</a></li>
              <li><a href="#" className="block hover:underline">Contribute</a></li>
              {user.isAdmin && <li><a href="#" className="block hover:underline">Admin</a></li>}
            </ul>
            
            {/* Mobile Auth Button */}
            <div className="mt-4">
              {user.isLoggedIn ? (
                <button onClick={logout} className="flex items-center gap-2 w-full">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <FaUserCircle className="w-8 h-8 text-gray-600" aria-label="User profile" />
                  )}
                  <span>Logout</span>
                </button>
              ) : (
                <button onClick={login} className="w-full bg-blue-700 text-white px-4 py-2 rounded-lg text-lg font-semibold hover:bg-blue-800" aria-label="Login or Sign Up">
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 