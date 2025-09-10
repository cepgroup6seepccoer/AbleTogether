import React from "react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-6 lg:py-8 px-4 lg:px-8 mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-4">
          <div className="text-center lg:text-left">
            <div className="font-bold text-base lg:text-lg mb-1">Contact: support@accessmap.in</div>
            <div className="text-xs lg:text-sm text-gray-300">© {new Date().getFullYear()} AccessMap. All rights reserved.</div>
          </div>
          <div className="flex gap-4 text-xl lg:text-2xl">
            <a href="#" aria-label="Facebook" className="hover:text-blue-400 transition-colors"><FaFacebook /></a>
            <a href="#" aria-label="Twitter" className="hover:text-blue-400 transition-colors"><FaTwitter /></a>
            <a href="#" aria-label="Instagram" className="hover:text-blue-400 transition-colors"><FaInstagram /></a>
          </div>
          <div className="text-xs lg:text-sm flex flex-col items-center lg:items-end gap-2">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Use</a>
            <a href="#" className="hover:underline">Accessibility Statement</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 