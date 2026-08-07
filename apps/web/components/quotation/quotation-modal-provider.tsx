'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const QuotationModal = dynamic(
  () => import('./quotation-modal').then((m) => ({ default: m.QuotationModal })),
  { ssr: false },
);

export type QuotationOptions = {
  /** Category of interest (matches the admin product categories). */
  productInterest?: string;
  /** Product context — prefilled when the request starts from a product page. */
  productId?: string;
  productName?: string;
  productSlug?: string;
  productImage?: string;
  message?: string;
};

type Ctx = { open: (options?: QuotationOptions) => void; close: () => void };
const QuotationModalContext = React.createContext<Ctx | null>(null);

export function useQuotationModal() {
  const ctx = React.useContext(QuotationModalContext);
  if (!ctx) throw new Error('useQuotationModal must be used within QuotationModalProvider');
  return ctx;
}

export function QuotationModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<QuotationOptions>({});
  const value = React.useMemo(
    () => ({
      open: (opts?: QuotationOptions) => {
        setOptions(opts ?? {});
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
    }),
    [],
  );

  return (
    <QuotationModalContext.Provider value={value}>
      {children}
      {isOpen ? <QuotationModal open options={options} onClose={() => setIsOpen(false)} /> : null}
    </QuotationModalContext.Provider>
  );
}
