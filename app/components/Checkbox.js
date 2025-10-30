// components/Checkbox.js
import React from 'react';

const Checkbox = ({ 
  id, 
  checked, 
  onChange, 
  label, 
  required = false,
  className = '',
  containerClassName = '' 
}) => (
  <div className={`flex items-center ${containerClassName}`}>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      required={required}
      className="form-checkbox h-5 w-5 text-amber-500 rounded border-black focus:ring-amber-500"
    />
    <label htmlFor={id} className={`ml-3 text-sm font-medium text-gray-300 cursor-pointer select-none ${className}`}>
      {label} {required && <span className="text-red-400">*</span>}
    </label>
  </div>
);

export default Checkbox;