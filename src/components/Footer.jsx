import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 mt-10 py-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        <p className="text-sm">
          © {new Date().getFullYear()} MatBook Client Portal. All rights reserved.
        </p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-gray-800 text-sm">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-800 text-sm">
            Terms of Service
          </a>
          <a href="#" className="hover:text-gray-800 text-sm">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
