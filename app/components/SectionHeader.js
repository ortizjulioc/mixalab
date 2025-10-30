// components/SectionHeader.js
import React from 'react';

const SectionHeader = ({ title, icon: Icon, id }) => (
  <h2 id={id} className="flex items-center space-x-3 text-2xl font-bold text-amber-400 mt-10 mb-6 border-b border-gray-700 pb-2">
    <Icon className="w-6 h-6" />
    <span>{title}</span>
  </h2>
);

export default SectionHeader;