import React from 'react';
import clsx from 'clsx';

type Props<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export default function Card<T extends React.ElementType = 'div'>({ as, className, children, ...rest }: Props<T>) {
  const Component = (as || 'div') as React.ElementType;
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - spreading generic props onto dynamic element
    <Component className={clsx('card', className)} {...rest}>
      {children}
    </Component>
  );
}
