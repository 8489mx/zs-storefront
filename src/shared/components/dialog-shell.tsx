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
let savedBodyOverscroll = '';
let savedHtmlOverscroll = '';
let lastTouchY = 0;
let lastTouchX = 0;

function handleLockedTouchStart(event: TouchEvent) {
  if (event.touches.length === 1) {
    lastTouchY = event.touches[0].clientY;
    lastTouchX = event.touches[0].clientX;
  }
}

function canElementScrollVertically(el: HTMLElement, deltaY: number): boolean {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  const isScrollableY =
    (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
    el.scrollHeight > el.clientHeight + 1;
  if (!isScrollableY) return false;
  if (deltaY < 0) {
    return el.scrollTop > 0;
  }
  if (deltaY > 0) {
    return Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight;
  }
  return true;
}

function canElementScrollHorizontally(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const overflowX = style.overflowX;
  return (
    (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') &&
    el.scrollWidth > el.clientWidth + 1
  );
}

function handleLockedWheel(event: WheelEvent) {
  if (activeDialogCount <= 0) return;
  if (event.ctrlKey) return; // Allow browser pinch-zoom if desired

  let el = event.target instanceof HTMLElement ? event.target : null;
  const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);

  while (el && el !== document.body && el !== document.documentElement) {
    if (el.hasAttribute('data-allow-wheel')) {
      return;
    }
    if (isHorizontal) {
      if (canElementScrollHorizontally(el)) {
        return;
      }
    } else {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const isScrollableContainer =
        (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
        el.scrollHeight > el.clientHeight + 1;
      if (isScrollableContainer) {
        if (canElementScrollVertically(el, event.deltaY)) {
          return;
        }
        // Reached top or bottom boundary of this scrollable modal container — block chaining to background
        event.preventDefault();
        return;
      }
    }
    el = el.parentElement;
  }

  // No scrollable container inside the modal/popup can consume this wheel event — block background scroll
  event.preventDefault();
}

function handleLockedTouchMove(event: TouchEvent) {
  if (activeDialogCount <= 0) return;
  if (event.touches.length > 1) return;

  const target = event.target instanceof HTMLElement ? event.target : null;
  if (target && (target.tagName === 'INPUT' || target.closest('[data-allow-touch-move]'))) {
    return;
  }

  const currentY = event.touches[0].clientY;
  const currentX = event.touches[0].clientX;
  const deltaY = lastTouchY - currentY; // > 0 means scrolling down
  const deltaX = lastTouchX - currentX;
  lastTouchY = currentY;
  lastTouchX = currentX;

  const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
  let el = target;

  while (el && el !== document.body && el !== document.documentElement) {
    if (isHorizontal) {
      if (canElementScrollHorizontally(el)) {
        return;
      }
    } else {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const isScrollableContainer =
        (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
        el.scrollHeight > el.clientHeight + 1;
      if (isScrollableContainer) {
        if (canElementScrollVertically(el, deltaY)) {
          return;
        }
        event.preventDefault();
        return;
      }
    }
    el = el.parentElement;
  }

  event.preventDefault();
}

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined' || typeof window === 'undefined') return;

    if (activeDialogCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      savedHtmlOverflow = document.documentElement.style.overflow;
      savedBodyOverscroll = document.body.style.overscrollBehavior;
      savedHtmlOverscroll = document.documentElement.style.overscrollBehavior;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehavior = 'none';
      document.body.classList.add('dialog-shell-open');
      document.documentElement.classList.add('dialog-shell-open');

      window.addEventListener('wheel', handleLockedWheel, { passive: false, capture: true });
      window.addEventListener('touchstart', handleLockedTouchStart, { passive: true, capture: true });
      window.addEventListener('touchmove', handleLockedTouchMove, { passive: false, capture: true });
    }
    activeDialogCount++;

    return () => {
      activeDialogCount = Math.max(0, activeDialogCount - 1);
      if (activeDialogCount === 0) {
        window.removeEventListener('wheel', handleLockedWheel, { capture: true });
        window.removeEventListener('touchstart', handleLockedTouchStart, { capture: true });
        window.removeEventListener('touchmove', handleLockedTouchMove, { capture: true });

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
        if (savedBodyOverscroll) {
          document.body.style.overscrollBehavior = savedBodyOverscroll;
        } else {
          document.body.style.removeProperty('overscroll-behavior');
        }
        if (savedHtmlOverscroll) {
          document.documentElement.style.overscrollBehavior = savedHtmlOverscroll;
        } else {
          document.documentElement.style.removeProperty('overscroll-behavior');
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
  }, [isLocked]);
}

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

  useBodyScrollLock(isVisible);

  useEffect(() => {
    if (!isVisible || typeof document === 'undefined') return;

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
      className={`dialog-overlay sf-apple-modal-overlay ${overlayClassName}`.trim()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: effectiveZIndex,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        animation: 'sfAppleBackdropIn 0.16s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      }}
      onClick={(event) => {
        if (!closeOnBackdrop) return;
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={shellRef}
        className={`dialog-shell sf-apple-modal-shell ${shellClassName}`.trim()}
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
          willChange: 'transform, opacity',
          animation: 'sfAppleSpringOpen 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards',
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
