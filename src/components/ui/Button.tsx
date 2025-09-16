import React from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export default function Button({ variant = 'primary', className, children, ...rest }: Props) {
  const base = 'btn';
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-ghost';
  return (
    <button className={clsx(base, variantClass, className)} {...rest}>
      {children}
    </button>
  );
}
