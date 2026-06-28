import { useEffect } from 'react';
import { FILTER_ICON_REPLACEMENTS, GRID_CONFIG, ICON_REPLACEMENTS } from './config';
export const useIconReplacements = (ref, deps = []) => {
    useEffect(() => {
        const rootEl = ref?.current;
        if (!rootEl) return;

        const replaceIcons = () => {
            ICON_REPLACEMENTS.forEach(({ selector, classes, container }) => {
                const containerEl = container ? rootEl.querySelector(container) : rootEl;
                if (!containerEl) return;

                containerEl.querySelectorAll(selector).forEach((element) => {
                    if (element.hasAttribute('data-icon-replaced')) return;
                    element.classList.remove('k-icon');
                    classes.forEach((cls) => element.classList.add(cls));
                    element.setAttribute('data-icon-replaced', 'true');
                    const svg = element.querySelector('svg');
                    if (svg) svg.style.display = 'none';
                });
            });

            FILTER_ICON_REPLACEMENTS.forEach(({ selector, classes }) => {
                rootEl.querySelectorAll(selector).forEach((element) => {
                    if (element.hasAttribute('data-icon-replaced')) return;
                    element.classList.remove('k-icon');
                    classes.forEach((cls) => element.classList.add(cls));
                    element.setAttribute('data-icon-replaced', 'true');
                });
            });
        };

        replaceIcons();
        const timeoutId = setTimeout(replaceIcons, 100);
        const observer = new MutationObserver(replaceIcons);
        observer.observe(rootEl, { childList: true, subtree: true });

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [ref, ...deps]);
};

export const useHideFirstLastNav = (hideFirstLastNav, ref, deps = []) => {
    useEffect(() => {
        if (!hideFirstLastNav) return;
        const rootEl = ref?.current;
        if (!rootEl) return;

        const hideNav = () => {
            rootEl
                .querySelectorAll(
                    '.k-pager-first, .k-pager-last, .k-i-caret-alt-to-left, .k-i-caret-alt-to-right',
                )
                .forEach((el) => {
                    const btn = el.closest('.k-pager-nav, .k-link');
                    if (btn) btn.style.display = 'none';
                });
        };

        hideNav();
        const observer = new MutationObserver(hideNav);
        observer.observe(rootEl, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [hideFirstLastNav, ref, ...deps]);
};

export const useFilterPopupClasses = () => {
    useEffect(() => {
        const tagPopups = () => {
            document
                .querySelectorAll(`.k-popup.k-grid-columnmenu-popup, .k-popup .${GRID_CONFIG.filterPopupClassName}`)
                .forEach((popup) => {
                    const animationContainer = popup.closest('.k-animation-container');
                    if (animationContainer && !animationContainer.classList.contains('rs-filter-popup')) {
                        animationContainer.classList.add('rs-filter-popup');
                    }
                });
        };

        tagPopups();
        const observer = new MutationObserver(tagPopups);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);
};

export default { useIconReplacements, useHideFirstLastNav, useFilterPopupClasses };
