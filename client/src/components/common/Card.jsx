import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-zinc-200/80 ${
        hover ? 'hover:border-zinc-400 transition-all duration-150' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', title, subtitle, action }) => {
  if (title || subtitle || action) {
    return (
      <div className={`p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between ${className}`}>
        <div>
          {title && <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
  return <div className={`p-4 sm:p-5 border-b border-zinc-100 ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`p-3.5 bg-zinc-50/50 border-t border-zinc-100 rounded-b-xl ${className}`}>{children}</div>;
};
