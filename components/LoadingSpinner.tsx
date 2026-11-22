'use client';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin`}
      />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-violet-400/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-violet-300 text-sm animate-pulse">Chargement...</p>
      </div>
    </div>
  );
}
