import React from "react";

const CarouselSlide = ({ imgSrc, primaryText, secondaryText, alt }) => {
  return (
    <div className="bg-gradient-to-r from-blue via-blue-500 to-blue-700 rounded-lg shadow-md p-4">
      {/* Image Container  */}
      <div className="bg-gradient-to-b from-white-100 to-white-300 p-4 rounded-lg">
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-60 object-contain rounded-lg"
        />
      </div>
      {/* Text Content */}
      <h2 className="text-xl font-semibold mt-4 text-white">{primaryText}</h2>
      <p className="text-gray-200">{secondaryText}</p>
    </div>
  );
};

export default CarouselSlide;
