'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

interface FadeUpProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className = '', ...props }: FadeUpProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
