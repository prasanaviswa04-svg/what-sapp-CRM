import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse bg-zinc-200/80 rounded ${className}`} />;
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200/70 shadow-sm space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
};
