import React from 'react';

export const AccessibleButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  ariaLabel,
  className = '',
  icon: Icon,
  ...props
}) => {
  // Base sizing ensures minimum 48px touch target for elderly and motor impaired users
  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-6 py-3.5 text-base font-semibold min-h-[48px]',
    lg: 'px-8 py-4 text-lg font-bold min-h-[56px]',
  };

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm border border-transparent',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-300',
    outline: 'bg-transparent text-indigo-700 hover:bg-indigo-50 border-2 border-indigo-600 active:bg-indigo-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent shadow-sm',
    ghost: 'bg-transparent text-slate-750 hover:bg-slate-100 border border-transparent',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2.5 rounded-xl
        focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50
        disabled:opacity-50 disabled:cursor-not-allowed select-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default AccessibleButton;

