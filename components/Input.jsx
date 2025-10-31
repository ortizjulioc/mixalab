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
  onBlur,
  error,
  rows = 3, // For textarea
  className = '',
  min,
  ...props 
}) => {
  const Component = as === 'textarea' ? 'textarea' : 'input';
  const hasError = error && error.length > 0;
  const labelClassName = `text-sm font-medium ${required ? 'font-bold text-amber-400' : 'text-gray-300'}`;
  const inputClassName = `w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-500 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out ${
    hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700'
  } ${className}`;

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className={labelClassName}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <Component
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        rows={as === 'textarea' ? rows : undefined}
        min={min}
        className={inputClassName}
        {...props}
      />
      {hasError && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;