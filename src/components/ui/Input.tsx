import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    const inputClasses = `
      px-4 py-2 border rounded-lg transition-all duration-200
      focus:ring-2 focus:outline-none
      ${error ? 'border-error-500 focus:ring-error-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'}
      ${fullWidth ? 'w-full' : 'w-auto'}
      ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : 'w-auto'} mb-4`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;