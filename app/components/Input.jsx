// components/Input.js
import React from 'react';

const Input = ({ 
  label, 
  id, 
  type = 'text', 
  as = 'input', // 'input' or 'textarea'
  required = false, 
  placeholder, 
  value, 
  onChange, 
  rows = 3, // For textarea
  className = '',
  min,
  ...props 
}) => {
  const Component = as === 'textarea' ? 'textarea' : 'input';
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <Component
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={as === 'textarea' ? rows : undefined}
        min={min}
        className="w-full px-4 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out placeholder-gray-500"
        {...props}
      />
    </div>
  );
};

export default Input;