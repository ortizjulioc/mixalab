"use client";
import React, { useState } from 'react';

const Tooltip = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 px-2 py-1 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
