
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', hideText = false }) => {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSizes[size]} bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20 flex-shrink-0`}>
        <svg className="w-2/3 h-2/3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 3V21M17 3V21M7 12H17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 3L12 6M12 18L12 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
      {!hideText && (
        <span className={`${textSizes[size]} font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none`}>
          HR<span className="text-indigo-600 ml-1">PLATFORME</span>
        </span>
      )}
    </div>
  );
};
