import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Input = ({
  label,
  error,
  success,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm transition-colors duration-200 focus:border-primary-500 focus:ring-primary-500 sm:text-sm';
  
  const stateClasses = error 
    ? 'border-error-300 text-error-900 placeholder-error-300 focus:border-error-500 focus:ring-error-500'
    : success 
    ? 'border-success-300 text-success-900 placeholder-success-300 focus:border-success-500 focus:ring-success-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500';

  const widthClass = fullWidth ? 'w-full' : '';
  const paddingClasses = LeftIcon ? 'pl-10' : RightIcon ? 'pr-10' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          className={`${baseClasses} ${stateClasses} ${widthClass} ${paddingClasses}`}
          {...props}
        />
        
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        {(error || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {error ? (
              <AlertCircle className="h-5 w-5 text-error-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success-500" />
            )}
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <p className={`mt-1 text-sm ${
          error ? 'text-error-600' : 
          success ? 'text-success-600' : 
          'text-gray-500'
        }`}>
          {error || success || helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 