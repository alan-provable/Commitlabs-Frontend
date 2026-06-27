// @vitest-environment happy-dom

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildCommitmentShareUrl, useShareLink } from '@/hooks/useShareLink';
import { useToast } from '@/components/toast/ToastProvider';

vi.mock('@/components/toast/ToastProvider', () => ({
  useToast: vi.fn(),
}));

const useToastMock = vi.mocked(useToast);

function setNavigatorProperty<T>(key: keyof Navigator, value: T) {
  Object.defineProperty(navigator, key, {
    configurable: true,
    value,
  });
}

function createToastMock() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
  };
}

describe('buildCommitmentShareUrl', () => {
  it('builds a canonical commitment deep link', () => {
    expect(buildCommitmentShareUrl('commitment 123', 'https://app.example')).toBe(
      'https://app.example/commitments/commitment%20123',
    );
  });
});

describe('useShareLink', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the Web Share API when available', async () => {
    const toast = createToastMock();
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    useToastMock.mockReturnValue(toast);
    setNavigatorProperty('share', share);
    setNavigatorProperty('clipboard', { writeText } as unknown as Clipboard);

    const { result } = renderHook(() =>
      useShareLink({
        commitmentId: 'abc123',
        title: 'Custom title',
        text: 'Custom body',
      }),
    );

    await act(async () => {
      await result.current();
    });

    expect(share).toHaveBeenCalledWith({
      title: 'Custom title',
      text: 'Custom body',
      url: 'http://localhost:3000/commitments/abc123',
    });
    expect(writeText).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Share sheet opened' }),
    );
  });

  it('falls back to copying the deep link when Web Share is unavailable', async () => {
    const toast = createToastMock();
    const writeText = vi.fn().mockResolvedValue(undefined);
    useToastMock.mockReturnValue(toast);
    setNavigatorProperty('share', undefined);
    setNavigatorProperty('clipboard', { writeText } as unknown as Clipboard);

    const { result } = renderHook(() => useShareLink({ commitmentId: '42' }));

    await act(async () => {
      await result.current();
    });

    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/commitments/42');
    expect(toast.success).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Link copied' }),
    );
  });

  it('shows a non-throwing error toast when clipboard copy fails', async () => {
    const toast = createToastMock();
    useToastMock.mockReturnValue(toast);
    setNavigatorProperty('share', undefined);
    setNavigatorProperty('clipboard', {
      writeText: vi.fn().mockRejectedValue(new Error('blocked')),
    } as unknown as Clipboard);

    const { result } = renderHook(() => useShareLink({ commitmentId: '42' }));

    await act(async () => {
      await expect(result.current()).resolves.toBeUndefined();
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Could not copy link' }),
    );
  });

  it('silently ignores user-cancelled native share sheets', async () => {
    const toast = createToastMock();
    useToastMock.mockReturnValue(toast);
    setNavigatorProperty(
      'share',
      vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')),
    );
    setNavigatorProperty('clipboard', {
      writeText: vi.fn(),
    } as unknown as Clipboard);

    const { result } = renderHook(() => useShareLink({ commitmentId: '42' }));

    await act(async () => {
      await result.current();
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
