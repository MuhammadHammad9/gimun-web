'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface SpringTransitionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export function SpringTransition({ children, className = '', ...props }: SpringTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
