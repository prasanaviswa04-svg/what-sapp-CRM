import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'There are no items matching your criteria yet.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-zinc-200 my-4">
      {Icon && (
        <div className="p-2.5 bg-zinc-100 rounded-lg text-zinc-900 mb-3 border border-zinc-200">
          <Icon className="w-5 h-5 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h3>
      <p className="text-xs text-zinc-500 mt-1 max-w-sm tracking-tight">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
