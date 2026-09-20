import React from 'react';
import { cn } from '@/lib/utils';

export interface StaggerChildrenProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Seconds between each child. */
  staggerDelay?: number;
  className?: string;
}

/**
 * Reveals its children in sequence as the group scrolls into view.
 *
 * A server component: the cascade is CSS (`.rise-stagger`), with each child's
 * offset supplied through the `--i` custom property. Nothing here needs a
 * motion runtime, and keeping it out means the library is absent from every
 * route that renders a staggered grid.
 */
export function StaggerChildren({
  children,
  staggerDelay = 0.08,
  className,
  style,
  ...props
}: StaggerChildrenProps) {
  return (
    <div
      className={cn('rise-stagger', className)}
      style={{ ...style, '--stagger': `${staggerDelay}s` } as React.CSSProperties}
      {...props}
    >
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
              style: {
                ...(child.props as { style?: React.CSSProperties }).style,
                '--i': i,
              } as React.CSSProperties,
            })
          : child
      )}
    </div>
  );
}

export default StaggerChildren;
