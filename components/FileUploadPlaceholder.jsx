// components/FileUploadPlaceholder.js
import React from 'react';

const FileUploadPlaceholder = ({ label, id, required = false, helperText, icon: Icon, className = '' }) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <label htmlFor={id} className="text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="flex items-center justify-between p-4 border border-dashed border-gray-600 bg-gray-700/30 rounded-lg">
        <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-gray-400">{helperText}</span>
        </div>
        {/* Actual file input is hidden for styling, click triggers input */}
        <button
            type="button"
            onClick={() => document.getElementById(id).click()}
            className="px-3 py-1 text-sm font-semibold text-gray-900 bg-amber-500 rounded-md hover:bg-amber-400 transition"
        >
            Choose File
        </button>
        <input type="file" id={id} required={required} className="hidden" />
    </div>
  </div>
);

export default FileUploadPlaceholder;