import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">{label}</label>
      <input
        className={`
          px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all duration-200 text-slate-900 placeholder-slate-400 font-medium
          ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 focus:border-primary-500'}
        `}
        {...props}
      />
      {error && <span className="text-[10px] font-bold text-red-500 px-1">{error}</span>}
    </div>
  );
};

export default Input;