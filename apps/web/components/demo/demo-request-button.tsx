'use client';

import { Button } from '@/components/ui/button';
import { useDemoModal } from '@/components/demo/demo-modal-provider';

export function DemoRequestButton({
  label = 'Request a Demo',
  variant = 'primary',
  size = 'lg',
}: {
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}) {
  const { open } = useDemoModal();
  return (
    <Button variant={variant} size={size} onClick={open}>
      {label}
    </Button>
  );
}
