'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface StaggerChildrenProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerChildren({
  children,
  staggerDelay = 0.08,
  className = '',
  ...props
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
