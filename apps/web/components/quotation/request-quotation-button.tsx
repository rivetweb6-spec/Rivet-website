'use client';

import { Button } from '@/components/ui/button';
import {
  useQuotationModal,
  type QuotationOptions,
} from '@/components/quotation/quotation-modal-provider';

export function RequestQuotationButton({
  label = 'Request a Quotation',
  variant = 'primary',
  size = 'lg',
  ...options
}: {
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
} & QuotationOptions) {
  const { open } = useQuotationModal();
  return (
    <Button variant={variant} size={size} onClick={() => open(options)}>
      {label}
    </Button>
  );
}
