// components/Select.jsx
import React, { useMemo, useCallback } from 'react';
import ReactSelect from 'react-select'; // Requires 'react-select' installation

// Custom styles for React Select to match the theme
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'black',
    borderColor: state.isFocused ? '#f59e0b' : '#374151', // amber-500 and gray-700
    borderRadius: '0.5rem', // rounded-lg
    boxShadow: state.isFocused ? '0 0 0 1px #f59e0b' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#f59e0b' : '#374151',
    },
    color: 'white',
    minHeight: '2.5rem', // py-2 equivalent
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
    '&::placeholder': {
      color: '#6b7280', // gray-500
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6b7280', // gray-500
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'black',
    borderColor: '#374151',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#374151' : 'black',
    color: state.isSelected ? '#111827' : 'white', // gray-900 for selected text
    '&:hover': {
      backgroundColor: '#374151',
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: '#374151',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'white',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#374151',
    color: 'white',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'white',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'white',
    '&:hover': {
      backgroundColor: '#f59e0b',
      color: '#111827',
    },
  }),
};

const Select = ({ 
  label, 
  id, 
  options = [], 
  value, 
  onChange, 
  required = false, 
  placeholder, 
  isMulti = false,
  isCreatable = false,
  isAsync = false, // If true, expects loadOptions function instead of static options
  loadOptions, // For async: function that returns Promise of options
  className = '',
  ...props 
}) => {
  const selectedValue = useMemo(() => {
    if (isMulti) {
      return (value || []).map(v => {
        const opt = options.find(o => o.value === v);
        return opt || { value: v, label: v };
      });
    } else {
      if (!value) return null;
      const opt = options.find(o => o.value === value);
      return opt || (isCreatable ? { value, label: value } : null);
    }
  }, [value, options, isMulti, isCreatable]);

  const handleChange = useCallback((selected) => {
    if (isMulti) {
      onChange(selected ? selected.map(opt => opt.value) : []);
    } else {
      onChange(selected ? selected.value : '');
    }
  }, [onChange, isMulti]);

  const selectOptions = isAsync ? [] : options;

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <ReactSelect
        inputId={id}
        value={selectedValue}
        onChange={handleChange}
        options={selectOptions}
        isMulti={isMulti}
        isCreatable={isCreatable}
        isSearchable={!isAsync}
        placeholder={placeholder || `Select ${label?.toLowerCase()}`}
        styles={customSelectStyles}
        isLoading={isAsync}
        loadOptions={loadOptions} // For async loading
        {...props}
        required={required}
      />
      {/* Hidden input for form validation if required and no value */}
      {required && !value && <input type="hidden" required aria-hidden="true" value="" />}
    </div>
  );
};

export default Select;