'use client'
import React from 'react'
import { X } from 'lucide-react'
import Button from './Button'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}) {
  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div
        className={`relative bg-transparent liquid-glass rounded-2xl border border-white/20 p-6 w-full ${sizeClasses[size]} shadow-2xl animate-fade-in`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-2xl font-bold mb-6 text-white text-center">
            {title}
          </h2>
        )}

        {/* Content */}
        <div>{children}</div>

        {/* Optional footer buttons slot */}
        {/* You can pass action buttons from the parent if needed */}
      </div>
    </div>
  )
}
