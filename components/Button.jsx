// components/Button.js
import React from 'react';

const Button = ({
  children,
  color = 'blue', // 'blue', 'red', 'gray', 'green', etc.
  variant = 'primary', // 'primary' (filled), 'secondary' (outline-ish)
  size = 'md', // 'sm', 'md', 'lg'
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];

  const colorClasses = {
    blue: {
      primary: 'bg-blue-600/50 hover:bg-blue-700/50 border border-blue-500/30 text-white focus:ring-blue-500',
      secondary: 'bg-transparent hover:bg-blue-600/20 border border-blue-500/50 text-blue-300 focus:ring-blue-500',
    },
    red: {
      primary: 'bg-red-600/50 hover:bg-red-700/50 border border-red-500/30 text-white focus:ring-red-500',
      secondary: 'bg-transparent hover:bg-red-600/20 border border-red-500/50 text-red-300 focus:ring-red-500',
    },
    gray: {
      primary: 'bg-gray-600/50 hover:bg-gray-700/50 border border-gray-500/30 text-white focus:ring-gray-500',
      secondary: 'bg-transparent hover:bg-gray-600/20 border border-gray-500/50 text-gray-300 focus:ring-gray-500',
    },
    green: {
      primary: 'bg-green-600/50 hover:bg-green-700/50 border border-green-500/30 text-white focus:ring-green-500',
      secondary: 'bg-transparent hover:bg-green-600/20 border border-green-500/50 text-green-300 focus:ring-green-500',
    },
    purple: {
      primary: 'bg-purple-600/50 hover:bg-purple-700/50 border border-purple-500/30 text-white focus:ring-purple-500',
      secondary: 'bg-transparent hover:bg-purple-600/20 border border-purple-500/50 text-purple-300 focus:ring-purple-500',
    },
  }[color]?.[variant] || 'bg-gray-600/50 hover:bg-gray-700/50 border border-gray-500/30 text-white focus:ring-gray-500';

  const loadingIndicator = (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`}
      {...props}
    >
      {loading ? loadingIndicator : children}
    </button>
  );
};

export default Button;