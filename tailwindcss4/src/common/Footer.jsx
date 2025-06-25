import React from "react";

const Footer = () => {
  return (
    <footer className="mt-16 w-full bg-gray-800 text-white text-center py-4">
      <p>&copy; COMPASION. All rights reserved.</p>
      <div className="mt-2">
        <a href="#" className="mx-2 hover:underline">
          Privacy Policy
        </a>
        <a href="#" className="mx-2 hover:underline">
          Terms of Service
        </a>
        <a href="#" className="mx-2 hover:underline">
          Contact Us
        </a>
      </div>
    </footer>
  );
};

export default Footer;
