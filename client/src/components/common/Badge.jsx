import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium rounded',
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-full',
    md: 'text-sm px-3 py-1 font-medium rounded-full',
  };

  const getVariantStyles = (v) => {
    switch (v?.toLowerCase()) {
      // Property Statuses
      case 'available':
      case 'converted':
      case 'paid':
      case 'completed':
      case 'high intent':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'reserved':
      case 'under negotiation':
      case 'partially paid':
      case 'hot':
      case 'urgent':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'sold':
      case 'closed':
      case 'lost':
      case 'overdue':
      case 'cold':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'new':
      case 'new enquiry':
      case 'site visit scheduled':
      case 'scheduled':
      case 'warm':
      case 'high':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'qualified':
      case 'contacted':
      case 'property recommended':
      case 'medium':
        return 'bg-teal-50 text-teal-700 border border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 ${sizeStyles[size]} ${getVariantStyles(variant)} ${className}`}>
      {children}
    </span>
  );
};
