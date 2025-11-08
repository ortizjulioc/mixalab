'use client';

import React from 'react';

/**
 * Reusable Card component with consistent "liquid-glass" style.
 *
 * Exports:
 *  - default Card: wrapper container
 *  - CardHeader: optional header with title/subtitle
 *  - CardContent: content area (padding)
 *  - CardFooter: footer area (actions)
 *
 * Props:
 *  - className: additional classes for the outer container
 *  - children: React nodes
 *  - title, subtitle (CardHeader)
 */

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`liquid-glass border border-white/10 rounded-2xl shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, className = '', right }) {
  return (
    <div className={`px-6 py-4 border-b border-white/6 flex items-start justify-between ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
      </div>
      {right && <div className="ml-4">{right}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-6 py-4 border-t border-white/6 ${className}`}>{children}</div>;
}
