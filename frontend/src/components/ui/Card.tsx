import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
    className = '',
    hover = false,
    padded = true,
    children,
    ...props
}) => {
    const baseStyles = 'bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300';
    const hoverStyles = hover ? 'hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1' : '';
    const paddingStyles = padded ? 'p-6' : '';

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${paddingStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
