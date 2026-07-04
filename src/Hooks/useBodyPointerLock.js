import { useLayoutEffect } from 'react';
let bodyPointerLockCount = 0;
const BODY_LOCK_DATA_ATTR = 'data-rs-body-pointer-lock';

const BODY_SCROLL_LOCK_CLASS = 'rs-body-scroll-lock';
let bodyScrollLockCount = 0;

const getScrollbarWidth = () => {
    if (typeof window === 'undefined') return 0;
    return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
};

/** Lock body scroll without layout shift when the scrollbar disappears. */
export const lockBodyScroll = () => {
    if (typeof document === 'undefined') return;

    if (bodyScrollLockCount === 0) {
        const scrollbarWidth = getScrollbarWidth();
        document.body.dataset.rsScrollbarWidth = String(scrollbarWidth);

        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        document.body.classList.add(BODY_SCROLL_LOCK_CLASS);
    }

    bodyScrollLockCount += 1;
};

/** Restore body scroll after overlays close (supports nested modals). */
export const unlockBodyScroll = () => {
    if (typeof document === 'undefined' || bodyScrollLockCount <= 0) return;

    bodyScrollLockCount -= 1;

    if (bodyScrollLockCount === 0) {
        document.body.classList.remove(BODY_SCROLL_LOCK_CLASS);
        document.body.style.paddingRight = '';
        delete document.body.dataset.rsScrollbarWidth;
    }
};

const SESSION_MODEL_OPEN_CLASS = 'Session-model-open';

/** Remove orphaned Bootstrap modal backdrops when no dialog is open. */
export const syncModalBodyState = () => {
    if (typeof document === 'undefined') return;

    const hasOpenSessionModal = document.querySelector('.session-timeout-popup.modal.show');
    if (!hasOpenSessionModal) {
        document.body.classList.remove(SESSION_MODEL_OPEN_CLASS);
    }

    const hasOpenModal = document.querySelector('.modal.show');
    if (hasOpenModal) return;

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');

    if (!document.body.classList.contains(BODY_SCROLL_LOCK_CLASS)) {
        document.body.style.removeProperty('padding-right');
    }
};

/** Reset body/modal shell after session-timeout re-login (unmount can skip RSModal exit animation). */
export const resetModalShellAfterSessionRecovery = () => {
    if (typeof document === 'undefined') return;

    document.body.classList.remove(SESSION_MODEL_OPEN_CLASS);
    bodyScrollLockCount = 0;
    bodyPointerLockCount = 0;
    document.body.classList.remove(BODY_SCROLL_LOCK_CLASS);
    document.body.removeAttribute(BODY_LOCK_DATA_ATTR);
    document.body.style.paddingRight = '';
    document.body.style.pointerEvents = '';
    delete document.body.dataset.rsScrollbarWidth;
    syncModalBodyState();
};

export const lockBodyPointerEvents = () => {
    if (typeof document === 'undefined') return;

    bodyPointerLockCount += 1;
    if (bodyPointerLockCount === 1) {
        document.body.setAttribute(BODY_LOCK_DATA_ATTR, 'true');
    }
};

export const unlockBodyPointerEvents = () => {
    if (typeof document === 'undefined') return;

    bodyPointerLockCount = Math.max(0, bodyPointerLockCount - 1);
    if (bodyPointerLockCount === 0) {
        document.body.removeAttribute(BODY_LOCK_DATA_ATTR);
        document.body.style.pointerEvents = '';
    }
};

const useBodyPointerLock = (enabled = false) => {
    useLayoutEffect(() => {
        if (!enabled) return undefined;

        lockBodyPointerEvents();
        return () => unlockBodyPointerEvents();
    }, [enabled]);
};

export default useBodyPointerLock;
