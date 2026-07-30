import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Request Demo</Button>);
    expect(screen.getByRole('button', { name: 'Request Demo' })).toBeInTheDocument();
  });

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies the secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button', { name: 'Secondary' })).toHaveClass('bg-navy');
  });

  it('merges custom className', () => {
    render(<Button className="custom-x">X</Button>);
    expect(screen.getByRole('button', { name: 'X' })).toHaveClass('custom-x');
  });
});
