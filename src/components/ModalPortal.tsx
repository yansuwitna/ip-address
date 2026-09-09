import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * ModalPortal — renders children directly into document.body via React Portal.
 * This ensures `fixed inset-0` backdrop always covers the FULL viewport,
 * regardless of any overflow-y-auto / transform on parent containers.
 */
export function ModalPortal({ children }: ModalPortalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return ReactDOM.createPortal(children, document.body);
}
