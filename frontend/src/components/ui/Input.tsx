import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    className = '',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = true,
    ...props
}, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorInputClass = error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
        : 'border-slate-200 focus:border-slate-800 focus:ring-slate-800/10';

    const paddingLeft = leftIcon ? 'pl-10' : 'pl-4';
    const paddingRight = rightIcon ? 'pr-10' : 'pr-4';

    return (
        <div className={`${widthClass} mb-4 last:mb-0`}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            w-full py-2.5 ${paddingLeft} ${paddingRight}
            bg-white rounded-xl border
            text-sm text-slate-900 placeholder-slate-400
            transition-all duration-200
            focus:outline-none focus:ring-4
            disabled:bg-slate-50 disabled:text-slate-500
            ${errorInputClass}
            ${className}
          `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 ml-1 text-xs text-red-500 animate-slide-up">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 ml-1 text-xs text-slate-500">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
