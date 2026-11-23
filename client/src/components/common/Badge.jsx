import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium rounded',
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-md',
    md: 'text-xs px-3 py-1 font-semibold rounded-md',
  };

  const getVariantStyles = (v) => {
    switch (v?.toLowerCase()) {
      case 'gold':
      case 'luxury':
      case 'vip':
      case 'hot':
      case 'urgent':
      case 'high':
      case 'high intent':
      case 'premium':
      case 'won':
      case 'deal':
      case 'advance':
      case 'featured':
        return 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold';
      case 'available':
      case 'completed':
      case 'paid':
      case 'active':
        return 'bg-zinc-100 text-zinc-950 border border-zinc-300 font-semibold';
      case 'reserved':
      case 'under negotiation':
      case 'partially paid':
        return 'bg-zinc-100 text-zinc-900 border border-zinc-300 font-medium';
      case 'sold':
      case 'closed':
      case 'lost':
      case 'cancelled':
      case 'cold':
      case 'deactivated':
        return 'bg-zinc-50 text-zinc-400 border border-zinc-200 line-through';
      case 'new':
      case 'new enquiry':
      case 'site visit scheduled':
      case 'scheduled':
      case 'qualified':
      case 'warm':
      case 'medium':
      case 'low':
        return 'bg-zinc-50 text-zinc-700 border border-zinc-200';
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
