import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium rounded',
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-md',
    md: 'text-xs px-3 py-1 font-semibold rounded-md',
  };

  const getVariantStyles = (v) => {
    switch (v?.toLowerCase()) {
      case 'available':
      case 'completed':
      case 'paid':
      case 'high intent':
      case 'active':
        return 'bg-zinc-950 text-white border border-zinc-950';
      case 'reserved':
      case 'under negotiation':
      case 'partially paid':
      case 'urgent':
      case 'hot':
        return 'bg-zinc-800 text-zinc-100 border border-zinc-700';
      case 'sold':
      case 'closed':
      case 'lost':
      case 'cancelled':
      case 'cold':
      case 'deactivated':
        return 'bg-zinc-100 text-zinc-500 border border-zinc-200 line-through';
      case 'new':
      case 'new enquiry':
      case 'site visit scheduled':
      case 'scheduled':
      case 'qualified':
      case 'warm':
      case 'high':
      case 'medium':
        return 'bg-zinc-100 text-zinc-800 border border-zinc-200';
      default:
        return 'bg-white text-zinc-700 border border-zinc-200';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 tracking-tight ${sizeStyles[size]} ${getVariantStyles(variant)} ${className}`}>
      {children}
    </span>
  );
};
