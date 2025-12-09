// components/FileUploadPlaceholder.js
import React, { useState, useRef } from 'react';
import { X, FileIcon, CheckCircle2 } from 'lucide-react';

const FileUploadPlaceholder = ({
  label,
  id,
  required = false,
  helperText,
  icon: Icon,
  className = '',
  onChange,
  accept,
  error
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Notify parent component (for Formik integration)
      if (onChange) {
        onChange(file);
      }
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Notify parent component
    if (onChange) {
      onChange(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      <div className={`flex items-center justify-between p-4 border border-dashed rounded-lg transition-all ${selectedFile
          ? 'border-green-500 bg-green-500/10'
          : error
            ? 'border-red-500 bg-red-500/10'
            : 'border-gray-600 bg-gray-700/30'
        }`}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {selectedFile ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-gray-200 font-medium truncate">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
            </>
          ) : (
            <>
              <Icon className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span className="text-sm text-gray-400">{helperText}</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-3">
          {selectedFile && (
            <button
              type="button"
              onClick={handleClearFile}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleButtonClick}
            className="px-3 py-1 text-sm font-semibold text-gray-900 bg-amber-500 rounded-md hover:bg-amber-400 transition whitespace-nowrap"
          >
            {selectedFile ? 'Change' : 'Choose File'}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          required={required}
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUploadPlaceholder;