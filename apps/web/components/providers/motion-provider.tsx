'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Honour the operating system's "reduce motion" setting for every Framer
 * Motion animation (navbar drawer, search, quotation modal, …). Transform and
 * layout animations are skipped for those users; opacity fades still run.
 * Components with bespoke handling (hero, Reveal) keep using useReducedMotion.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
