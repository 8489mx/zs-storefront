import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DialogShellProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
  minHeight?: string;
  height?: string;
  maxHeight?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  zIndex?: number;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  ariaLabel?: string;
  overlayClassName?: string;
  shellClassName?: string;
  autoFocus?: boolean;
}

function getFocusableElements(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
}

// Module-level state to track nested dialogs and safely restore original overflow
let activeDialogCount = 0;
let savedBodyOverflow = '';
let savedHtmlOverflow = '';

export function DialogShell({
  open,
  isOpen,
  onClose,
  children,
  width,
  minHeight,
  height,
  maxHeight,
  size,
  zIndex = 10000,
  closeOnBackdrop = true,
  showCloseButton: _showCloseButton = false,
  ariaLabel,
  overlayClassName = '',
  shellClassName = '',
  autoFocus = true,
}: DialogShellProps) {
  const isVisible = open !== undefined ? open : Boolean(isOpen);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isVisible || typeof document === 'undefined') return;

    if (activeDialogCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      savedHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('dialog-shell-open');
      document.documentElement.classList.add('dialog-shell-open');
    }
    activeDialogCount++;

    previousActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusDialog = () => {
      const shell = shellRef.current;
      if (!shell) return;
      // Do not steal focus if an element inside the dialog shell is already focused
      if (shell.contains(document.activeElement) && document.activeElement !== shell) return;
      const target =
        shell.querySelector<HTMLElement>('[data-autofocus]') ||
        shell.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]):not(.dialog-shell-close-btn)');
      if (target) {
        target.focus({ preventScroll: true });
      } else {
        shell.focus({ preventScroll: true });
      }
    };

    let frameId: number | null = null;
    if (autoFocus) {
      frameId = window.requestAnimationFrame(focusDialog);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;
      const shell = shellRef.current;
      if (!shell) return;
      const focusable = getFocusableElements(shell);
      if (!focusable.length) {
        event.preventDefault();
        shell.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      previousActiveElementRef.current?.focus({ preventScroll: true });

      activeDialogCount = Math.max(0, activeDialogCount - 1);
      if (activeDialogCount === 0) {
        if (savedBodyOverflow) {
          document.body.style.overflow = savedBodyOverflow;
        } else {
          document.body.style.removeProperty('overflow');
        }
        if (savedHtmlOverflow) {
          document.documentElement.style.overflow = savedHtmlOverflow;
        } else {
          document.documentElement.style.removeProperty('overflow');
        }
        document.body.classList.remove('dialog-shell-open');
        document.documentElement.classList.remove('dialog-shell-open');
        const rootEl = document.getElementById('root');
        if (rootEl) {
          rootEl.style.removeProperty('overflow');
          rootEl.style.removeProperty('overflow-y');
          rootEl.style.removeProperty('touch-action');
        }
      }
    };
  }, [isVisible, autoFocus]);

  if (!isVisible || typeof document === 'undefined') return null;

  const effectiveZIndex = zIndex && zIndex >= 1000 ? zIndex : 10000 + (zIndex || 0);

  const sizeWidthMap: Record<string, string> = {
    sm: 'min(480px, 95vw)',
    md: 'min(600px, 95vw)',
    lg: 'min(820px, 95vw)',
    xl: 'min(1040px, 95vw)',
    full: 'min(1240px, 98vw)',
  };
  const effectiveWidth = width || (size ? sizeWidthMap[size] : 'min(720px, 100%)');

  return createPortal(
    <div
      ref={overlayRef}
      className={`dialog-overlay ${overlayClassName}`.trim()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: effectiveZIndex,
        background: 'rgba(15, 23, 42, 0.52)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}
      onClick={(event) => {
        if (!closeOnBackdrop) return;
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={shellRef}
        className={`dialog-shell ${shellClassName}`.trim()}
        style={{
          position: 'relative',
          width: effectiveWidth,
          maxWidth: '100%',
          maxHeight: maxHeight || 'min(90vh, 820px)',
          ...(height ? { height } : {}),
          ...(minHeight ? { minHeight } : {}),
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25), 0 4px 16px -2px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          outline: 'none',
          margin: 'auto',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
