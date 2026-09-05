import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
}

export function FormField({ label, error, required, children, id }: FormFieldProps) {
  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}
