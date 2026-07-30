'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const DemoModal = dynamic(
  () => import('./demo-modal').then((m) => ({ default: m.DemoModal })),
  { ssr: false },
);

type Ctx = { open: () => void; close: () => void };
const DemoModalContext = React.createContext<Ctx | null>(null);

export function useDemoModal() {
  const ctx = React.useContext(DemoModalContext);
  if (!ctx) throw new Error('useDemoModal must be used within DemoModalProvider');
  return ctx;
}

export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const value = React.useMemo(
    () => ({ open: () => setIsOpen(true), close: () => setIsOpen(false) }),
    [],
  );

  return (
    <DemoModalContext.Provider value={value}>
      {children}
      {isOpen ? <DemoModal open onClose={() => setIsOpen(false)} /> : null}
    </DemoModalContext.Provider>
  );
}
