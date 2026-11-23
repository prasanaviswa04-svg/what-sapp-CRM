import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed select-none tracking-tight';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm px-4.5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-2xs active:bg-black',
    gold: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-xs font-semibold border border-amber-400/50 active:scale-[0.99]',
    goldOutline: 'border border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-950 shadow-2xs font-semibold',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-2xs',
    outline: 'border border-zinc-200 hover:border-amber-300 bg-white hover:bg-amber-50/30 text-zinc-900 shadow-2xs',
    ghost: 'text-zinc-600 hover:text-amber-950 hover:bg-amber-50/40',
    danger: 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800',
    white: 'bg-white hover:bg-zinc-100 text-zinc-950 border border-zinc-200 shadow-2xs',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-4 h-4'} />
      ) : null}
      {children}
    </button>
  );
};
