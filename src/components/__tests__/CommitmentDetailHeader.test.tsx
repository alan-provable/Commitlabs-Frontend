// @vitest-environment happy-dom

import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import CommitmentDetailHeader from '@/components/Commitmentdetailheader';
import { useShareLink } from '@/hooks/useShareLink';

vi.mock('@/hooks/useShareLink', () => ({
  useShareLink: vi.fn(),
}));

const useShareLinkMock = vi.mocked(useShareLink);

function renderHeader(overrides: Partial<ComponentProps<typeof CommitmentDetailHeader>> = {}) {
  const props = {
    commitmentId: 'abc123',
    statusLabel: 'Active',
    statusVariant: 'active',
    onBack: vi.fn(),
    ...overrides,
  };

  render(<CommitmentDetailHeader {...props} />);
  return props;
}

describe('CommitmentDetailHeader', () => {
  it('wires the share button to the share hook', () => {
    const share = vi.fn();
    useShareLinkMock.mockReturnValue(share);

    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'Share commitment' }));

    expect(useShareLinkMock).toHaveBeenCalledWith({
      commitmentId: 'abc123',
      title: 'CommitLabs commitment abc123',
      text: 'View this CommitLabs commitment.',
    });
    expect(share).toHaveBeenCalledTimes(1);
  });

  it('keeps the share button keyboard-focusable with visible focus classes', () => {
    useShareLinkMock.mockReturnValue(vi.fn());

    renderHeader();

    const shareButton = screen.getByRole('button', { name: 'Share commitment' });
    expect(shareButton.className).toContain('focus-visible:ring-2');
    expect(shareButton.className).toContain('focus-visible:ring-[#0ff0fc]');
  });

  it('preserves an explicit onShare override for legacy callers', () => {
    const share = vi.fn();
    const explicitShare = vi.fn();
    useShareLinkMock.mockReturnValue(share);

    renderHeader({ onShare: explicitShare });

    fireEvent.click(screen.getByRole('button', { name: 'Share commitment' }));

    expect(explicitShare).toHaveBeenCalledTimes(1);
    expect(share).not.toHaveBeenCalled();
  });
});
