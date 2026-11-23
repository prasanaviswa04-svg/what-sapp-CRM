import React from 'react';

export const Card = ({ children, className = '', hover = false, gold = false, ...props }) => {
  return (
    <div
      className={`rounded-xl transition-all duration-150 ${
        gold
          ? 'bg-gradient-to-br from-amber-50/40 via-white to-amber-50/15 border border-amber-200/80 shadow-xs'
          : 'bg-white border border-zinc-200/80'
      } ${
        hover ? 'hover:border-amber-300 hover:shadow-[0_2px_12px_rgba(255,215,0,0.12)]' : ''
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
      <div className={`p-4 sm:p-5 border-b border-amber-100/70 flex items-center justify-between ${className}`}>
        <div>
          {title && <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
  return <div className={`p-4 sm:p-5 border-b border-amber-100/70 ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`p-3.5 bg-amber-50/20 border-t border-amber-100/70 rounded-b-xl ${className}`}>{children}</div>;
};
