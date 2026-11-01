'use client';

import { useEffect, useRef } from 'react';

interface UseModalHistoryOptions {
  isOpen: boolean;
  onClose: () => void;
  modalId: string;
}

/**
 * Custom hook to safely integrate modals with browser Back button history.
 * - When a modal opens, an ephemeral history state is pushed.
 * - If the visitor presses the browser Back button, the modal closes without leaving the page.
 * - If the visitor closes the modal via the UI (close button, backdrop, Escape),
 *   the ephemeral history entry is safely reverted to keep the browser stack clean.
 * - Never traps the visitor or prevents exiting when the modal is closed.
 */
// Global timestamp to ignore synthetic popstate events caused by previous modal unmounts
let lastProgrammaticBackTime = 0;

export function useModalHistory({ isOpen, onClose, modalId }: UseModalHistoryOptions) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      isPushedRef.current = false;
      return;
    }

    // Push an ephemeral history state for this modal
    try {
      window.history.pushState({ modalOpen: modalId }, '', window.location.href);
      isPushedRef.current = true;
    } catch {}

    const handlePopState = (_event: PopStateEvent) => {
      // If a programmatic back occurred within 300ms (e.g. from another modal closing), ignore it
      if (Date.now() - lastProgrammaticBackTime < 300) {
        return;
      }

      // Browser Back was pressed while modal was open
      if (isPushedRef.current) {
        isPushedRef.current = false;
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If closed via UI while our state is still on top of the stack, pop it
      if (isPushedRef.current) {
        isPushedRef.current = false;
        try {
          if (window.history.state?.modalOpen === modalId) {
            lastProgrammaticBackTime = Date.now();
            window.history.back();
          }
        } catch {}
      }
    };
  }, [isOpen, modalId]);
}
