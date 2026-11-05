'use client';

import { motion, type Variants } from 'framer-motion';
import * as React from 'react';

/*
 * Subtle scroll reveals. Content is always fully opaque (nothing waits on
 * JavaScript to become visible) and only shifts a few pixels into place.
 *
 * The same element is rendered on the server and the client for everyone;
 * reduced-motion users are handled by <MotionConfig reducedMotion="user">
 * (components/providers/motion-provider), which skips the movement.
 * Branching on useReducedMotion() here caused hydration mismatches.
 */

const ease = [0.2, 0.7, 0.2, 1] as const;
const OFFSET = 12;

export function FadeUp({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'span' | 'li';
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 1, y: OFFSET }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease, delay }}
    >
      {children}
    </MotionTag>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 1, y: OFFSET },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}
