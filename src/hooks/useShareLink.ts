'use client';

import { useCallback } from 'react';

import { useToast } from '@/components/toast/ToastProvider';

export interface ShareLinkOptions {
  commitmentId: string;
  title?: string;
  text?: string;
}

export function buildCommitmentShareUrl(commitmentId: string, origin?: string): string {
  const baseOrigin =
    origin ??
    (typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : '');

  return `${baseOrigin}/commitments/${encodeURIComponent(commitmentId)}`;
}

function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

function isClipboardSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.clipboard) &&
    typeof navigator.clipboard.writeText === 'function'
  );
}

export function useShareLink({
  commitmentId,
  title = 'CommitLabs commitment',
  text = 'View this CommitLabs commitment.',
}: ShareLinkOptions) {
  const toast = useToast();

  return useCallback(async () => {
    const url = buildCommitmentShareUrl(commitmentId);

    if (isShareSupported()) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success({
          title: 'Share sheet opened',
          description: 'Choose an app to share this commitment link.',
        });
        return;
      } catch (error) {
        const name = error instanceof DOMException ? error.name : '';
        if (name === 'AbortError') {
          return;
        }
      }
    }

    if (isClipboardSupported()) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success({
          title: 'Link copied',
          description: 'Commitment link copied to clipboard.',
        });
        return;
      } catch {
        toast.error({
          title: 'Could not copy link',
          description: 'Copy the URL from the address bar and try again.',
        });
        return;
      }
    }

    toast.error({
      title: 'Sharing is not available',
      description: 'Copy the URL from the address bar and try again.',
    });
  }, [commitmentId, text, title, toast]);
}
