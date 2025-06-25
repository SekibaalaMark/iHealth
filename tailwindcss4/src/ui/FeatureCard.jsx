import React from 'react'

const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-xl font-bold mt-2">{title}</h3>
      <p className="text-gray-700 mt-1">{description}</p>
    </div>
  );
};

export default FeatureCard;