import { numberWithCommas } from 'Utils/modules/formatters';
/**
 * ResKendoGrid - Hooks
 *
 * Consolidated MutationObserver-based hooks from all three grid implementations.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    GRID_CONFIG,
    ICON_REPLACEMENTS,
    FILTER_ICON_REPLACEMENTS,
    SEARCH_ICON_REPLACEMENT,
} from './config';
import { sumMeasuredPixelWidths } from './utils';
// ---------------------------------------------------------------------------
// useIconReplacements
// Replace Kendo SVG icons with custom icon font classes.
// Scoped to a container ref to avoid affecting unrelated elements.
// ---------------------------------------------------------------------------

export const useIconReplacements = (ref, deps = []) => {
    useEffect(() => {
        const rootEl = ref?.current;
        if (!rootEl) return;

        // Helper: skip hierarchy expand/collapse and grouping row icons
        const isGroupElement = (element) => {
            let parent = element.parentElement;
            let depth = 0;
            while (parent && depth < 10) {
                if (parent.classList) {
                    if (
                        parent.classList.contains('k-hierarchy-cell') ||
                        parent.classList.contains('k-grouping-row') ||
                        parent.classList.contains('k-group-cell') ||
                        parent.classList.contains('k-group-start') ||
                        parent.classList.contains('k-group-header') ||
                        parent.classList.contains('k-grouping-header') ||
                        parent.classList.contains('k-grouping-dropclue')
                    ) {
                        return true;
                    }
                }
                parent = parent.parentElement;
                depth++;
            }
            return false;
        };

        const replaceIcons = () => {
            ICON_REPLACEMENTS.forEach(({ selector, classes, container }) => {
                const containerEl = container ? rootEl.querySelector(container) : rootEl;
                if (!containerEl) return;

                containerEl.querySelectorAll(selector).forEach((element) => {
                    if (element.hasAttribute('data-icon-replaced')) return;
                    if (isGroupElement(element)) return;

                    element.classList.remove('k-icon');
                    classes.forEach((cls) => element.classList.add(cls));
                    element.setAttribute('data-icon-replaced', 'true');

                    const svg = element.querySelector('svg');
                    if (svg) svg.style.display = 'none';
                });
            });

            // Search icon replacement (in non-grouped variants)
            const searchElements = rootEl.querySelectorAll(SEARCH_ICON_REPLACEMENT.selector);
            searchElements.forEach((element) => {
                if (element.hasAttribute('data-icon-replaced')) return;
                if (isGroupElement(element)) return;
                element.classList.remove('k-icon');
                SEARCH_ICON_REPLACEMENT.classes.forEach((cls) => element.classList.add(cls));
                element.setAttribute('data-icon-replaced', 'true');
            });

            // Filter menu icons — re-apply on every mutation (header re-renders on filter/sort).
            // Do not hide SVG inline; CSS hides it once .icon-rs-filter-mini is applied.
            FILTER_ICON_REPLACEMENTS.forEach(({ selector, classes, container }) => {
                const containerEl = container ? rootEl.querySelector(container) : rootEl;
                if (!containerEl) return;

                containerEl.querySelectorAll(selector).forEach((element) => {
                    if (isGroupElement(element)) return;

                    element.classList.remove('k-icon');
                    classes.forEach((cls) => element.classList.add(cls));
                });
            });
        };

        const tagPagerSizePopup = () => {
            rootEl.querySelectorAll('.k-pager-sizes .k-dropdownlist').forEach((sizeDropdown) => {
                const listId = sizeDropdown.getAttribute('aria-controls');
                if (!listId) return;
                const popupContainer = document.getElementById(listId)?.closest('.k-animation-container');
                if (popupContainer && !popupContainer.classList.contains('res-pager-sizes-popup')) {
                    popupContainer.classList.add('res-pager-sizes-popup');
                }
            });
        };

        const decoratePager = () => {
            replaceIcons();
            tagPagerSizePopup();
        };

        decoratePager();
        const timeoutId = setTimeout(decoratePager, 100);
        const timeoutId2 = setTimeout(decoratePager, 300);

        const observer = new MutationObserver(decoratePager);
        observer.observe(rootEl, { childList: true, subtree: true });

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(timeoutId2);
            observer.disconnect();
        };
    }, [ref, ...deps]);
};

// ---------------------------------------------------------------------------
// useFilterIconReplacements
// Deprecated — filter icons are handled inside useIconReplacements (MutationObserver).
// Kept as a no-op for any external callers.
// ---------------------------------------------------------------------------

export const useFilterIconReplacements = () => {};

// ---------------------------------------------------------------------------
// applyFilterOperatorListTitles
// Set native `title` tooltip when operator list / field text is truncated.
// ---------------------------------------------------------------------------

const FILTER_SEARCH_ICON_CLASS =
    'rs-filter-search-icon k-input-icon icon-md color-secondary-grey icon-rs-circle-zoom-fill-edge-medium';

export const applyFilterSearchIconReplacements = () => {
    const searchRoot =
        '.k-popup.k-grid-columnmenu-popup .k-searchbox, ' +
        '.k-grid-columnmenu-popup .k-searchbox, ' +
        '.rsKendoFilterPopupCSS .k-searchbox, ' +
        '.rs-kendo-grid-filter-menu .k-searchbox';

    document.querySelectorAll(searchRoot).forEach((searchbox) => {
        const innerWrapper = searchbox.querySelector('.k-input-inner');
        const input =
            searchbox.querySelector('input:not([type="hidden"])') ||
            (innerWrapper?.tagName === 'INPUT' ? innerWrapper : null);

        if (!input) return;

        // Kendo often uses <input class="k-input-inner"> — never append children to <input>
        const iconMount =
            innerWrapper && innerWrapper.tagName !== 'INPUT' ? innerWrapper : searchbox;

        input.removeAttribute('readonly');
        input.disabled = false;
        input.style.pointerEvents = 'auto';

        if (!input.getAttribute('placeholder')) {
            input.setAttribute('placeholder', 'Search..');
        }

        searchbox.querySelectorAll('.k-clear-value, .k-input-separator').forEach((el) => {
            el.style.display = 'none';
        });

        searchbox
            .querySelectorAll(
                '.k-input-icon:not(.rs-filter-search-icon), .k-i-search:not(.rs-filter-search-icon), .k-svg-i-search, [class*="k-svg-i-search"]',
            )
            .forEach((el) => {
                el.style.display = 'none';
            });

        let icon = searchbox.querySelector('.rs-filter-search-icon');

        if (!icon) {
            icon = document.createElement('i');
            icon.className = FILTER_SEARCH_ICON_CLASS;
            icon.setAttribute('data-icon-replaced', 'true');
            icon.setAttribute('aria-hidden', 'true');
        }

        if (icon.parentNode !== iconMount) {
            iconMount.appendChild(icon);
        }
    });
};

export const applyFilterOperatorListTitles = () => {
    const setTitleIfTruncated = (el, label) => {
        if (!el || !label) return;
        const truncated = el.scrollWidth > el.clientWidth;
        if (truncated) {
            el.setAttribute('title', label);
        } else {
            el.removeAttribute('title');
        }
    };

    const processListItem = (item) => {
        const textEl = item.querySelector('.k-list-item-text') || item;
        const label = textEl.textContent?.trim();
        if (!label) {
            item.removeAttribute('title');
            return;
        }
        setTitleIfTruncated(textEl, label);
        // Tooltip on the row as well for hover anywhere on the item
        if (textEl !== item) {
            setTitleIfTruncated(item, label);
        }
    };

    document
        .querySelectorAll(
            '.rs-filter-dropdown-popup .k-list-item, .rs-filter-dropdown-popup .k-list-ul > li, ' +
                '.k-popup.k-grid-columnmenu-popup .k-filter-menu-container .k-list-item, ' +
                '.k-popup.k-grid-columnmenu-popup .k-filter-menu-container .k-list-ul > li',
        )
        .forEach(processListItem);

    document
        .querySelectorAll(
            '.k-filter-menu-container .k-dropdownlist .k-input-value-text, ' +
                '.k-filter-menu-container .k-picker .k-input-value-text',
        )
        .forEach((textEl) => {
            const label = textEl.textContent?.trim();
            if (!label) {
                textEl.removeAttribute('title');
                return;
            }
            setTitleIfTruncated(textEl, label);
            const host = textEl.closest('.k-dropdownlist, .k-picker');
            if (host) setTitleIfTruncated(host, label);
        });
};

// ---------------------------------------------------------------------------
// useFilterPopupClasses
// Add `rs-filter-popup` class to filter animation containers.
// ---------------------------------------------------------------------------

const tagFilterPopupContainer = (container) => {
    if (!container || container.classList.contains('rs-filter-popup')) return;

    container.classList.add('rs-filter-popup');
    // Kendo sets overflow:hidden inline — override without CSS !important
    container.style.overflow = 'visible';
};

const GRID_DROPDOWN_OVERFLOW_KEY = 'rsGridDropdownOverflow';
const GRID_DROPDOWN_MENU_STYLE_KEY = 'rsGridDropdownMenuStyle';
const GRID_DROPDOWN_PINNED_CLASS = 'rs-grid-dropdown-fixed';

const GRID_DROPDOWN_OVERFLOW_TARGETS = ['.k-grid-container', '.k-grid-content'];

const tagGridActionDropdownOverflow = (gridRoot) => {
    if (!gridRoot) return;

    const nodes = [
        gridRoot,
        ...GRID_DROPDOWN_OVERFLOW_TARGETS.flatMap((selector) => [...gridRoot.querySelectorAll(selector)]),
    ];

    nodes.forEach((node) => {
        if (!node || node.dataset[GRID_DROPDOWN_OVERFLOW_KEY]) return;

        node.dataset[GRID_DROPDOWN_OVERFLOW_KEY] = node.style.getPropertyValue('overflow') || '';
        node.style.setProperty('overflow', 'visible', 'important');
    });
};

const restoreGridActionDropdownOverflow = (gridRoot) => {
    if (!gridRoot) return;

    const nodes = [
        gridRoot,
        ...GRID_DROPDOWN_OVERFLOW_TARGETS.flatMap((selector) => [...gridRoot.querySelectorAll(selector)]),
    ];

    nodes.forEach((node) => {
        if (!node?.dataset?.[GRID_DROPDOWN_OVERFLOW_KEY]) return;

        const previousOverflow = node.dataset[GRID_DROPDOWN_OVERFLOW_KEY];
        if (previousOverflow) {
            node.style.setProperty('overflow', previousOverflow);
        } else {
            node.style.removeProperty('overflow');
        }

        delete node.dataset[GRID_DROPDOWN_OVERFLOW_KEY];
    });
};

const storeGridDropdownMenuStyle = (menu) => {
    if (menu.dataset[GRID_DROPDOWN_MENU_STYLE_KEY]) return;

    menu.dataset[GRID_DROPDOWN_MENU_STYLE_KEY] = JSON.stringify({
        position: menu.style.position,
        top: menu.style.top,
        left: menu.style.left,
        right: menu.style.right,
        bottom: menu.style.bottom,
        transform: menu.style.transform,
        inset: menu.style.inset,
        zIndex: menu.style.zIndex,
    });
};

const restoreGridDropdownMenu = (dropdownRoot) => {
    const menu = dropdownRoot?.querySelector('.dropdown-menu');
    if (!menu) return;

    menu.classList.remove(GRID_DROPDOWN_PINNED_CLASS);

    if (!menu.dataset[GRID_DROPDOWN_MENU_STYLE_KEY]) return;

    try {
        const previousStyle = JSON.parse(menu.dataset[GRID_DROPDOWN_MENU_STYLE_KEY]);
        ['position', 'top', 'left', 'right', 'bottom', 'transform', 'inset', 'zIndex'].forEach((prop) => {
            const value = previousStyle[prop];
            if (value) {
                menu.style.setProperty(prop, value);
            } else {
                menu.style.removeProperty(prop);
            }
        });
    } catch {
        menu.style.removeProperty('position');
        menu.style.removeProperty('top');
        menu.style.removeProperty('left');
        menu.style.removeProperty('right');
        menu.style.removeProperty('bottom');
        menu.style.removeProperty('transform');
        menu.style.removeProperty('inset');
        menu.style.removeProperty('z-index');
    }

    delete menu.dataset[GRID_DROPDOWN_MENU_STYLE_KEY];
};

const pinGridDropdownMenu = (dropdownRoot) => {
    const menu = dropdownRoot.querySelector('.dropdown-menu');
    const toggle = dropdownRoot.querySelector('.dropdown-toggle');
    if (!menu || !toggle || !menu.classList.contains('show')) {
        restoreGridDropdownMenu(dropdownRoot);
        return;
    }

    storeGridDropdownMenuStyle(menu);

    const toggleRect = toggle.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const menuWidth = menuRect.width || menu.offsetWidth;
    const menuHeight = menuRect.height || menu.offsetHeight;
    const viewportPadding = 8;
    const gap = 2;

    let top = toggleRect.bottom + gap;
    if (top + menuHeight > window.innerHeight - viewportPadding && toggleRect.top > menuHeight + gap) {
        top = toggleRect.top - menuHeight - gap;
    }

    const isEndAligned = menu.classList.contains('dropdown-menu-end');
    let left = isEndAligned ? toggleRect.right - menuWidth : toggleRect.left;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - menuWidth - viewportPadding));

    menu.classList.add(GRID_DROPDOWN_PINNED_CLASS);
    menu.style.setProperty('position', 'fixed', 'important');
    menu.style.setProperty('transform', 'none', 'important');
    menu.style.setProperty('inset', 'auto', 'important');
    menu.style.setProperty('top', `${top}px`, 'important');
    menu.style.setProperty('left', `${left}px`, 'important');
    menu.style.setProperty('right', 'auto', 'important');
    menu.style.setProperty('bottom', 'auto', 'important');
    menu.style.setProperty('z-index', '1102', 'important');
};

const isGridDropdownMutationTarget = (target) => {
    if (!(target instanceof Element)) return false;
    if (!target.closest('.grid-dropdown')) return false;

    return (
        target.classList.contains('dropdown') ||
        target.classList.contains('dropdown-menu') ||
        target.classList.contains('dropdown-toggle') ||
        target.classList.contains('show')
    );
};

const syncAllGridActionDropdowns = () => {
    document.querySelectorAll('.grid-dropdown .dropdown').forEach((dropdownRoot) => {
        const menu = dropdownRoot.querySelector('.dropdown-menu');
        const isOpen = dropdownRoot.classList.contains('show') && menu?.classList.contains('show');
        const gridRoot = dropdownRoot.closest('.k-grid');

        if (isOpen) {
            tagGridActionDropdownOverflow(gridRoot);
            pinGridDropdownMenu(dropdownRoot);
            return;
        }

        restoreGridDropdownMenu(dropdownRoot);
        restoreGridActionDropdownOverflow(gridRoot);
    });
};

// ---------------------------------------------------------------------------
// useFilterCheckboxSync
// Kendo 15 keeps checkbox state on input/wrap; label ::before tick needs a
// synced class because :has() alone misses some portaled popup DOM updates.
// ---------------------------------------------------------------------------

const isFilterCheckboxChecked = (input) => {
    if (!input) return false;
    return (
        input.checked ||
        input.classList.contains('k-checked') ||
        input.getAttribute('aria-checked') === 'true'
    );
};

const FILTER_HEADER_TRIGGER_SELECTOR =
    '.k-grid-header-menu, .k-grid-column-menu, .k-grid-filter';

const bindHeaderFilterFocusRingFix = (trigger) => {
    if (trigger?.dataset?.rsHeaderFocusFix === '1') return;

    trigger.dataset.rsHeaderFocusFix = '1';

    const stripOutline = () => {
        trigger.style.setProperty('outline', 'none', 'important');
        trigger.style.setProperty('outline-offset', '0', 'important');
        trigger.style.setProperty('box-shadow', 'none', 'important');
    };

    trigger.addEventListener('focus', stripOutline, true);
    trigger.addEventListener('focusin', stripOutline, true);
};

export const useFilterMenuLoadingLock = (ref, isLoading) => {
    useEffect(() => {
        const rootEl = ref?.current;
        if (!rootEl) return;

        const syncFilterHeaderLoadingState = () => {
            rootEl.querySelectorAll(FILTER_HEADER_TRIGGER_SELECTOR).forEach((trigger) => {
                bindHeaderFilterFocusRingFix(trigger);
                trigger.classList.toggle('rs-filter-header-disabled', isLoading);
                if (isLoading) {
                    trigger.setAttribute('aria-disabled', 'true');
                    trigger.style.pointerEvents = 'none';
                } else {
                    trigger.removeAttribute('aria-disabled');
                    trigger.style.pointerEvents = '';
                }
            });
        };

        const blockFilterHeaderInteraction = (event) => {
            if (!isLoading) return;

            const trigger = event.target?.closest?.(FILTER_HEADER_TRIGGER_SELECTOR);
            if (!trigger || !rootEl.contains(trigger)) return;

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation?.();
        };

        syncFilterHeaderLoadingState();
        rootEl.addEventListener('click', blockFilterHeaderInteraction, true);
        rootEl.addEventListener('mousedown', blockFilterHeaderInteraction, true);

        const observer = new MutationObserver(syncFilterHeaderLoadingState);
        observer.observe(rootEl, { childList: true, subtree: true });

        return () => {
            rootEl.removeEventListener('click', blockFilterHeaderInteraction, true);
            rootEl.removeEventListener('mousedown', blockFilterHeaderInteraction, true);
            observer.disconnect();
        };
    }, [ref, isLoading]);
};

export const syncFilterSubmitButtonClickOff = () => {
    document
        .querySelectorAll(
            '.k-popup.k-grid-columnmenu-popup .k-actions .k-button-primary, ' +
                '.k-popup.k-grid-columnmenu-popup .k-columnmenu-actions .k-button-primary, ' +
                '.rsKendoFilterPopupCSS .k-actions .k-button-primary',
        )
        .forEach((button) => {
            const label = button.textContent?.trim() || '';
            if (label !== 'Filter') return;

            const isDisabled =
                button.disabled ||
                button.classList.contains('k-disabled') ||
                button.classList.contains('rs-filter-submit-disabled');
            button.classList.toggle('rs-filter-submit-disabled', isDisabled);
            button.classList.remove('click-off');
            button.style.pointerEvents = isDisabled ? 'none' : '';
        });
};

export const syncFilterCheckboxLabels = () => {
    document
        .querySelectorAll(
            '.k-popup.k-grid-columnmenu-popup .k-multicheck-wrap .k-item, ' +
                '.rsKendoFilterPopupCSS .k-multicheck-wrap .k-item, ' +
                '.rsKendoFilterPopupCSS ul li',
        )
        .forEach((item) => {
            const input =
                item.querySelector('input.k-checkbox') ||
                item.querySelector('input[type="checkbox"]');
            const label = item.querySelector('.k-checkbox-label');
            if (!label) return;

            label.classList.toggle('rs-filter-checked', isFilterCheckboxChecked(input));
        });
};

export const useFilterCheckboxSync = () => {
    useEffect(() => {
        syncFilterCheckboxLabels();

        // childList only — watching `class` on document.body loops with filter menu DOM hooks
        const observer = new MutationObserver(syncFilterCheckboxLabels);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        const handleInteraction = (event) => {
            const target = event.target;
            if (
                target?.matches?.('input.k-checkbox, input[type="checkbox"]') ||
                target?.closest?.('.k-checkbox-label, .k-checkbox-wrap, .k-item')
            ) {
                requestAnimationFrame(syncFilterCheckboxLabels);
            }
        };

        document.addEventListener('change', handleInteraction, true);
        document.addEventListener('click', handleInteraction, true);

        return () => {
            observer.disconnect();
            document.removeEventListener('change', handleInteraction, true);
            document.removeEventListener('click', handleInteraction, true);
        };
    }, []);
};

export const useFilterPopupClasses = () => {
    useEffect(() => {
        const addClassToFilterPopupContainer = () => {
            const popups = document.querySelectorAll(
                '.k-popup.k-grid-columnmenu-popup, .k-popup .rsKendoFilterPopupCSS, .k-popup .rs-kendo-grid-filter-menu',
            );

            popups.forEach((popup) => {
                tagFilterPopupContainer(popup.closest('.k-animation-container'));
                tagFilterPopupContainer(popup.closest('.k-child-animation-container'));
            });

            // Tag portaled operator dropdown lists (e.g. "Is equal to") while filter menu is open
            const filterMenuOpen = document.querySelector(
                '.k-popup.k-grid-columnmenu-popup, .k-grid-columnmenu-popup',
            );
            if (!filterMenuOpen) return;

            document.querySelectorAll('.k-animation-container').forEach((container) => {
                if (container.querySelector('.k-grid-columnmenu-popup')) return;

                if (container.querySelector('.k-list-ul, .k-list-item')) {
                    tagFilterPopupContainer(container);
                    container.classList.add('rs-filter-dropdown-popup');
                    return;
                }

                if (container.querySelector('.k-calendar, .k-calendar-view')) {
                    tagFilterPopupContainer(container);
                    container.classList.add('rs-filter-date-popup');
                }
            });

            requestAnimationFrame(() => {
                applyFilterSearchIconReplacements();
                applyFilterOperatorListTitles();
                syncFilterCheckboxLabels();
                syncFilterSubmitButtonClickOff();
            });
        };

        addClassToFilterPopupContainer();

        // childList only — popup containers appear/disappear via DOM insertion, not class changes.
        // Watching 'class' attribute changes would fire on every Kendo hover/focus/animation
        // class toggle across the entire document, causing hundreds of callbacks per second
        // whenever a dropdown list is open (page freeze).
        const observer = new MutationObserver(addClassToFilterPopupContainer);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);
};

// ---------------------------------------------------------------------------
// useGridActionDropdownOverflow
// React-Bootstrap does not emit shown.bs.dropdown — pin grid action menus with
// position:fixed so they escape Kendo overflow clipping. DropdownButton unchanged.
// ---------------------------------------------------------------------------

export const useGridActionDropdownOverflow = () => {
    useEffect(() => {
        let rafId = 0;

        const scheduleSync = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                syncAllGridActionDropdowns();
                requestAnimationFrame(syncAllGridActionDropdowns);
            });
        };

        const handlePointer = (event) => {
            if (event.target.closest('.grid-dropdown')) {
                scheduleSync();
            }
        };

        document.addEventListener('click', handlePointer, true);
        document.addEventListener('scroll', scheduleSync, true);
        window.addEventListener('resize', scheduleSync);

        const observer = new MutationObserver((mutations) => {
            if (mutations.some((mutation) => isGridDropdownMutationTarget(mutation.target))) {
                scheduleSync();
            }
        });

        observer.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            cancelAnimationFrame(rafId);
            document.removeEventListener('click', handlePointer, true);
            document.removeEventListener('scroll', scheduleSync, true);
            window.removeEventListener('resize', scheduleSync);
            observer.disconnect();
            document.querySelectorAll('.grid-dropdown .dropdown').forEach((dropdownRoot) => {
                restoreGridDropdownMenu(dropdownRoot);
                restoreGridActionDropdownOverflow(dropdownRoot.closest('.k-grid'));
            });
        };
    }, []);
};

// ---------------------------------------------------------------------------
// useFilterLogicButtonGroup
// AND/OR filter logic: sync selection on click and collapse immediately.
// Kendo often applies k-selected only on blur; without this, "And" stays visible
// until the user clicks outside the filter popup.
// ---------------------------------------------------------------------------

export const useFilterLogicButtonGroup = () => {
    useEffect(() => {
        // Broad search for button-groups anywhere in a filter popup container.
        const candidateSelector =
            '.k-filter-menu-container .k-button-group, .k-filter-menu-container .k-buttongroup';

        // We stamp confirmed And/Or groups with this class so that:
        //  1. CSS only applies to real logic groups, not operator-dropdown button-groups.
        //  2. The click handler never calls stopPropagation for operator-dropdown clicks.
        const LOGIC_CLASS = 'rs-logic-group';
        const groupSelector = `.${LOGIC_CLASS}`;

        // A button-group is the And/Or logic group if it is NOT contained inside
        // a picker/dropdown/spinner widget (those render their own internal button-groups).
        const isLogicGroup = (el) =>
            !el.closest(
                '.k-dropdownlist, .k-picker, .k-numerictextbox, .k-combobox, .k-multiselect, .k-datepicker, .k-timepicker',
            );

        const markLogicGroups = () => {
            document.querySelectorAll(candidateSelector).forEach((group) => {
                if (!group.classList.contains(LOGIC_CLASS) && isLogicGroup(group)) {
                    group.classList.add(LOGIC_CLASS);
                }
            });
        };

        const syncInitialSelection = (group) => {
            if (group.classList.contains('rs-logic-open')) return;
            const buttons = [...group.querySelectorAll('.k-button')];
            if (!buttons.length) return;

            const customSelected = buttons.find((btn) =>
                btn.classList.contains('rs-logic-selected'),
            );

            if (customSelected) {
                // Sync Kendo classes only when they differ (prevents needless mutations).
                buttons.forEach((btn) => {
                    const want = btn === customSelected;
                    if (btn.classList.contains('k-selected') !== want)
                        btn.classList.toggle('k-selected', want);
                    if (btn.classList.contains('k-active') !== want)
                        btn.classList.toggle('k-active', want);
                    btn.setAttribute('aria-pressed', want ? 'true' : 'false');
                });
                return;
            }

            // First time: derive selection from Kendo's own classes
            const kendoSelected = buttons.find(
                (btn) => btn.classList.contains('k-selected') || btn.classList.contains('k-active'),
            );
            const selected = kendoSelected || buttons[0];
            buttons.forEach((btn) => {
                const want = btn === selected;
                if (btn.classList.contains('rs-logic-selected') !== want)
                    btn.classList.toggle('rs-logic-selected', want);
            });
        };

        const applySelection = (group, button) => {
            group.querySelectorAll('.k-button').forEach((btn) => {
                const isSelected = btn === button;
                btn.classList.toggle('rs-logic-selected', isSelected);
                btn.classList.toggle('k-selected', isSelected);
                btn.classList.toggle('k-active', isSelected);
                btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
            });
        };

        const closeAll = (except = null) => {
            document.querySelectorAll(groupSelector).forEach((group) => {
                if (group !== except && group.classList.contains('rs-logic-open')) {
                    group.classList.remove('rs-logic-open');
                }
            });
        };

        const initGroups = () => {
            markLogicGroups();
            document.querySelectorAll(groupSelector).forEach(syncInitialSelection);
        };

        initGroups();

        // Watch childList only — NOT class attribute changes.
        // Watching attributes (class) causes an infinite loop because
        // syncInitialSelection modifies k-selected / rs-logic-selected,
        // which would re-fire the observer endlessly.
        const observer = new MutationObserver(initGroups);
        observer.observe(document.body, { childList: true, subtree: true });

        const handleClick = (event) => {
            const group = event.target.closest(groupSelector);

            if (!group) {
                closeAll();
                return;
            }

            const button = event.target.closest('.k-button');
            const isOpen = group.classList.contains('rs-logic-open');

            if (isOpen && button) {
                applySelection(group, button);
                group.classList.remove('rs-logic-open');
                closeAll();
                event.stopPropagation();
                return;
            }

            if (!isOpen && button) {
                const isCurrent =
                    button.classList.contains('rs-logic-selected') ||
                    button.classList.contains('k-selected') ||
                    button.classList.contains('k-active');

                if (isCurrent) {
                    const selectedBtn =
                        group.querySelector('.k-button.rs-logic-selected') || button;
                    applySelection(group, selectedBtn);
                    group.classList.add('rs-logic-open');
                    closeAll(group);
                    event.stopPropagation();
                }
                return;
            }

            if (!isOpen) {
                const selectedBtn =
                    group.querySelector('.k-button.rs-logic-selected') ||
                    group.querySelector('.k-button.k-selected') ||
                    group.querySelector('.k-button.k-active');
                if (selectedBtn) applySelection(group, selectedBtn);
                group.classList.add('rs-logic-open');
                closeAll(group);
                event.stopPropagation();
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            observer.disconnect();
            document.removeEventListener('click', handleClick);
        };
    }, []);
};

// ---------------------------------------------------------------------------
// useSinglePageSizeDisable
// Disable page-size selector when only one size option is available.
// ---------------------------------------------------------------------------

export const useSinglePageSizeDisable = (pageConfig) => {
    useEffect(() => {
        const hasSinglePageSize =
            pageConfig && pageConfig.pageSizes && pageConfig.pageSizes.length === 1;

        if (hasSinglePageSize) {
            const removeSinglePageStyles = () => {
                const animationContainers = document.querySelectorAll(
                    '.k-animation-container-shown',
                );
                animationContainers.forEach((container) => {
                    container.classList.remove('k-animation-container-shown');
                });

                const pickers = document.querySelectorAll('.k-picker');
                pickers.forEach((picker) => {
                    if (!picker.classList.contains('single-page-picker')) {
                        picker.classList.add('single-page-picker');
                        picker.style.pointerEvents = 'none';
                    }
                });
            };

            const timeout = setTimeout(removeSinglePageStyles, 100);

            const observer = new MutationObserver(removeSinglePageStyles);
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class'],
            });

            return () => {
                clearTimeout(timeout);
                observer.disconnect();
            };
        } else {
            const pickers = document.querySelectorAll('.k-picker.single-page-picker');
            pickers.forEach((picker) => {
                picker.classList.remove('single-page-picker');
                picker.style.pointerEvents = '';
            });
        }
    }, [pageConfig]);
};

// ---------------------------------------------------------------------------
// usePaginationInfoFormat
// Format pagination "X of Y items" text with comma separators.
// ---------------------------------------------------------------------------

export const usePaginationInfoFormat = (
    wrapperSelector,
    { pageable, isLoading, hidePaginationInfo, total, skip, take },
) => {
    useEffect(() => {
        if (!pageable || isLoading || hidePaginationInfo) return;

        const gridWrapper = document.querySelector(wrapperSelector);
        if (!gridWrapper) return;

        let timeoutId = null;
        const cachedTexts = new WeakMap();

        const formatPaginationInfo = () => {
            const gridWrappers = document.querySelectorAll(
                `.${GRID_CONFIG.className}-table, .${GRID_CONFIG.className}-list-table, .${GRID_CONFIG.className}-new-wrapper`,
            );
            if (gridWrappers.length === 0) return;

            gridWrappers.forEach((wrapper) => {
                const pagerInfoElements = wrapper.querySelectorAll('.k-pager-info');
                if (pagerInfoElements.length === 0) return;

                pagerInfoElements.forEach((pagerInfo) => {
                    const text = pagerInfo.textContent?.trim() || '';
                    if (!text) return;

                    const cachedText = cachedTexts.get(pagerInfo);
                    if (cachedText === text) return;

                    // Match: "1 - 5 of 883284 items" or with commas "1 - 5 of 883,284 items"
                    const match = text.match(
                        /^(\d+)\s*-\s*(\d+)\s+of\s+([\d,]+)(\s+items)?$/i,
                    );

                    if (match) {
                        const totalStr = match[3].replace(/,/g, '');
                        const totalNum = parseInt(totalStr, 10);
                        const isAlreadyFormatted = match[3].includes(',');

                        if (!isNaN(totalNum) && totalNum > 0 && !isAlreadyFormatted) {
                            const formattedTotal = numberWithCommas(totalNum);
                            const formattedText = `${match[1]} - ${match[2]} of ${formattedTotal}${match[4] || ' items'}`;
                            pagerInfo.textContent = formattedText;
                            cachedTexts.set(pagerInfo, formattedText);
                        } else if (isAlreadyFormatted) {
                            cachedTexts.set(pagerInfo, text);
                        }
                    } else {
                        cachedTexts.set(pagerInfo, text);
                    }
                });
            });
        };

        const debouncedFormat = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(formatPaginationInfo, 50);
        };

        formatPaginationInfo();
        const timeout1 = setTimeout(formatPaginationInfo, 100);
        const timeout2 = setTimeout(formatPaginationInfo, 300);

        const pagers = gridWrapper.querySelectorAll('.k-pager');
        const observers = [];

        pagers.forEach((pager) => {
            const observer = new MutationObserver(debouncedFormat);
            observer.observe(pager, {
                childList: true,
                subtree: true,
                characterData: true,
            });
            observers.push(observer);
        });

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            observers.forEach((obs) => obs.disconnect());
        };
    }, [pageable, isLoading, hidePaginationInfo, total, skip, take]);
};

// ---------------------------------------------------------------------------
// useCalendarIconReplace
// Replace Kendo calendar SVG icons with custom calendar icon.
// ---------------------------------------------------------------------------

export const useCalendarIconReplace = () => {
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const calendarSvgIcons = node.querySelectorAll
                                ? node.querySelectorAll('.k-svg-i-calendar')
                                : [];
                            [...calendarSvgIcons].forEach((svgIcon) => {
                                if (!svgIcon.classList.contains('replaced-icon')) {
                                    const customIcon = document.createElement('i');
                                    customIcon.className =
                                        'icon-rs-calendar-medium icon-md color-primary-blue';
                                    svgIcon.parentNode.replaceChild(customIcon, svgIcon);
                                }
                            });
                            if (node.matches && node.matches('.k-svg-i-calendar')) {
                                if (!node.classList.contains('replaced-icon')) {
                                    const customIcon = document.createElement('i');
                                    customIcon.className =
                                        'icon-rs-calendar-medium icon-md color-primary-blue';
                                    node.parentNode.replaceChild(customIcon, node);
                                }
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);
};

const GROUPING_CHIP_REMOVE_ACTION_SELECTOR =
    '.k-grouping-header .k-chip-remove-action, ' +
    '.k-grouping-header .k-group-indicator .k-button-flat, ' +
    '.k-grouping-header .k-icon.k-font-icon.k-i-close.k-button-icon';

const GROUPING_CHIP_REMOVE_ICON_SELECTOR =
    '.k-grouping-header .k-chip-remove-action .k-svg-icon, ' +
    '.k-grouping-header .k-chip-remove-action .k-icon, ' +
    '.k-grouping-header .k-chip-remove-action .k-svg-i-x-circle, ' +
    '.k-grouping-header .k-chip-remove-action .icon-rs-circle-minus-fill-mini, ' +
    '.k-grouping-header .k-group-indicator .k-button-flat .k-icon, ' +
    '.k-grouping-header .k-icon.k-font-icon.k-i-close.k-button-icon';

const applyGroupingChipRemoveIcon = (iconEl) => {
    if (!iconEl || iconEl.classList.contains('icon-rs-circle-minus-fill-mini')) return;

    iconEl.classList.remove('k-icon');
    iconEl.classList.add('icon-rs-circle-minus-fill-mini', 'color-primary-red', 'icon-xs');
    iconEl.removeAttribute('title');
    iconEl.removeAttribute('rel');

    iconEl.querySelectorAll('svg').forEach((svg) => {
        svg.style.display = 'none';
    });
};

const GROUPING_REMOVE_TOOLTIP_SELECTOR = '.tooltip.rs-grouping-remove-tooltip';

let groupingRemoveTooltipEl = null;
let groupingRemoveTooltipTrigger = null;

const positionRemoveTooltip = (tooltip, triggerEl) => {
    const rect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.zIndex = '10003';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltipRect.height - 4}px`;
};

const hideGroupingRemoveTooltip = () => {
    groupingRemoveTooltipEl?.classList.remove('show');
    groupingRemoveTooltipEl?.remove();
    groupingRemoveTooltipTrigger = null;
};

const cleanupStaleGroupingRemoveTooltips = () => {
    if (groupingRemoveTooltipTrigger && !document.body.contains(groupingRemoveTooltipTrigger)) {
        hideGroupingRemoveTooltip();
    }

    document.querySelectorAll(GROUPING_REMOVE_TOOLTIP_SELECTOR).forEach((tooltipEl) => {
        if (tooltipEl !== groupingRemoveTooltipEl || !groupingRemoveTooltipTrigger) {
            tooltipEl.remove();
        }
    });

    if (!groupingRemoveTooltipTrigger) {
        groupingRemoveTooltipEl = null;
    }
};

const showGroupingRemoveTooltip = (triggerEl) => {
    if (!triggerEl) return;

    if (!groupingRemoveTooltipEl) {
        groupingRemoveTooltipEl = document.createElement('div');
        groupingRemoveTooltipEl.setAttribute('role', 'tooltip');
        groupingRemoveTooltipEl.className =
            'tooltip bs-tooltip-top fade toolTipOverlayZindexCSS rs-grouping-remove-tooltip';
        groupingRemoveTooltipEl.innerHTML =
            '<div class="tooltip-inner">Remove</div>' +
            '<div class="tooltip-arrow"></div>';
    }

    groupingRemoveTooltipTrigger = triggerEl;
    document.body.appendChild(groupingRemoveTooltipEl);
    groupingRemoveTooltipEl.classList.add('show');
    positionRemoveTooltip(groupingRemoveTooltipEl, triggerEl);
};

const attachRemoveTooltip = (triggerEl) => {
    if (!triggerEl || triggerEl.hasAttribute('data-tooltip-added')) return;

    const showTooltip = () => showGroupingRemoveTooltip(triggerEl);
    const hideTooltip = () => {
        if (groupingRemoveTooltipTrigger === triggerEl) {
            hideGroupingRemoveTooltip();
        }
    };

    triggerEl.addEventListener('mouseenter', showTooltip);
    triggerEl.addEventListener('mouseleave', hideTooltip);
    triggerEl.addEventListener('focus', showTooltip);
    triggerEl.addEventListener('blur', hideTooltip);
    triggerEl.addEventListener('mousedown', hideTooltip);
    triggerEl.addEventListener('click', hideTooltip);
    triggerEl.setAttribute('data-tooltip-added', 'true');
    triggerEl.setAttribute('aria-label', 'Remove');
};

const replaceGroupingChipRemoveIcons = () => {
    cleanupStaleGroupingRemoveTooltips();

    document.querySelectorAll(GROUPING_CHIP_REMOVE_ICON_SELECTOR).forEach((iconEl) => {
        applyGroupingChipRemoveIcon(iconEl);
    });

    document.querySelectorAll(GROUPING_CHIP_REMOVE_ACTION_SELECTOR).forEach((actionEl) => {
        attachRemoveTooltip(actionEl);
    });
};

const DRAG_CLUE_PLUS_ICON_SELECTOR =
    '.k-header.k-drag-clue .k-drag-status.k-i-plus, ' +
    '.k-header.k-drag-clue .k-drag-status.k-svg-i-plus, ' +
    '.k-header.k-drag-clue .k-drag-status.k-add';

const DRAG_CLUE_DENIED_ICON_SELECTOR =
    '.k-header.k-drag-clue .k-drag-status.k-denied, ' +
    '.k-header.k-drag-clue .k-drag-status.k-i-cancel, ' +
    '.k-header.k-drag-clue .k-drag-status.k-svg-i-cancel';

const applyDragCluePlusIcon = (iconEl) => {
    if (!iconEl || iconEl.classList.contains('icon-rs-circle-plus-fill-mini')) return;

    iconEl.classList.remove('k-icon');
    iconEl.classList.add('icon-rs-circle-plus-fill-mini', 'color-primary-blue', 'icon-xs');
    iconEl.querySelectorAll('svg').forEach((svg) => {
        svg.style.display = 'none';
    });
};

const isDragClueDenied = (clueEl) =>
    Boolean(clueEl?.querySelector(DRAG_CLUE_DENIED_ICON_SELECTOR));

const GROUPING_CHIP_SORT_ICON_SELECTOR =
    '.k-grouping-header .k-chip > .k-chip-icon, ' +
    '.k-grouping-header .k-chip .k-chip-icon .k-svg-icon, ' +
    '.k-grouping-header .k-chip .k-chip-icon .k-icon, ' +
    '.k-grouping-header .k-group-indicator > .k-icon:not(.k-i-close), ' +
    '.k-grouping-header .k-group-indicator .k-button-flat .k-icon:not(.k-i-close)';

const GROUPING_ROW_EXPAND_ICON_SELECTOR =
    '.k-grouping-row p > .k-icon, ' +
    '.k-grouping-row p > .k-svg-icon, ' +
    '.k-grouping-row p > a > .k-icon, ' +
    '.k-grouping-row p > a > .k-svg-icon, ' +
    '.k-grouping-row .k-reset > .k-icon, ' +
    '.k-grouping-row .k-reset > .k-svg-icon, ' +
    '.k-grouping-row .k-reset > a > .k-icon, ' +
    '.k-grouping-row .k-reset > a > .k-svg-icon';

const GROUPING_SORT_RESUL_CLASSES = [
    'icon-rs-arrow-up-bold-mini',
    'icon-rs-arrow-down-bold-mini',
];

const GROUPING_EXPAND_RESUL_CLASSES = [
    'icon-rs-arrow-down-bold-mini',
    'icon-rs-caret-mini',
    'rs-grouping-caret-collapsed',
];

const isGroupingSortAsc = (iconEl) =>
    iconEl.classList.contains('k-i-sort-asc-small') ||
    iconEl.classList.contains('k-svg-i-sort-asc-small') ||
    iconEl.classList.contains('k-i-sort-asc');

const isGroupingSortDesc = (iconEl) =>
    iconEl.classList.contains('k-i-sort-desc-small') ||
    iconEl.classList.contains('k-svg-i-sort-desc-small') ||
    iconEl.classList.contains('k-i-sort-desc');

const isGroupingRowExpanded = (iconEl) =>
    iconEl.classList.contains('k-i-caret-alt-down') ||
    iconEl.classList.contains('k-svg-i-caret-alt-down') ||
    iconEl.classList.contains('k-i-minus');

const isGroupingRowCollapsed = (iconEl) =>
    iconEl.classList.contains('k-i-caret-alt-right') ||
    iconEl.classList.contains('k-svg-i-caret-alt-right') ||
    iconEl.classList.contains('k-i-plus');

const hideSvgIcon = (iconEl) => {
    iconEl.querySelectorAll('svg').forEach((svg) => {
        svg.style.display = 'none';
    });
};

const applyGroupingChipSortIcon = (iconEl) => {
    if (!iconEl) return;

    const isAsc = isGroupingSortAsc(iconEl);
    const isDesc = isGroupingSortDesc(iconEl);
    if (!isAsc && !isDesc) return;

    GROUPING_SORT_RESUL_CLASSES.forEach((cls) => iconEl.classList.remove(cls));
    iconEl.classList.remove('k-icon');
    iconEl.classList.add('icon-xs', 'color-primary-black');
    iconEl.classList.add(isAsc ? 'icon-rs-arrow-up-bold-mini' : 'icon-rs-arrow-down-bold-mini');
    hideSvgIcon(iconEl);
};

const applyGroupingRowExpandIcon = (iconEl) => {
    if (!iconEl) return;

    const isExpanded = isGroupingRowExpanded(iconEl);
    const isCollapsed = isGroupingRowCollapsed(iconEl);
    if (!isExpanded && !isCollapsed) return;

    GROUPING_EXPAND_RESUL_CLASSES.forEach((cls) => iconEl.classList.remove(cls));
    iconEl.classList.remove('k-icon');
    iconEl.classList.add('icon-xs', 'color-primary-black');

    if (isExpanded) {
        iconEl.classList.add('icon-rs-arrow-down-bold-mini');
    } else {
        iconEl.classList.add('icon-rs-caret-mini', 'rs-grouping-caret-collapsed');
    }

    hideSvgIcon(iconEl);
};

const replaceGroupingDirectionIcons = () => {
    document.querySelectorAll(GROUPING_CHIP_SORT_ICON_SELECTOR).forEach((iconEl) => {
        if (iconEl.closest('.k-chip-remove-action')) return;
        applyGroupingChipSortIcon(iconEl);
    });

    document.querySelectorAll(GROUPING_ROW_EXPAND_ICON_SELECTOR).forEach((iconEl) => {
        applyGroupingRowExpandIcon(iconEl);
    });
};

// ---------------------------------------------------------------------------
// useGroupingIconReplace
// Bolder up/down arrows on grouping chips + expand/collapse on group rows.
// ---------------------------------------------------------------------------

export const useGroupingIconReplace = (enabled, deps = []) => {
    useEffect(() => {
        if (!enabled) return;

        replaceGroupingDirectionIcons();
        const timeout = setTimeout(replaceGroupingDirectionIcons, 100);
        const observer = new MutationObserver(replaceGroupingDirectionIcons);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [enabled, ...deps]);
};

// ---------------------------------------------------------------------------
// useCloseIconReplace
// Replace grouping chip remove icons (Kendo 15 .k-chip + legacy .k-i-close).
// ---------------------------------------------------------------------------

export const useCloseIconReplace = (deps = []) => {
    useEffect(() => {
        replaceGroupingChipRemoveIcons();
        const timeout = setTimeout(replaceGroupingChipRemoveIcons, 100);
        const observer = new MutationObserver(replaceGroupingChipRemoveIcons);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
            hideGroupingRemoveTooltip();
        };
    }, deps);
};

// ---------------------------------------------------------------------------
// useDragClueStyle
// Style column drag clue during grouping — chip chrome, blue + icon, not-allowed cursor.
// ---------------------------------------------------------------------------

export const useDragClueStyle = (enabled, deps = []) => {
    useEffect(() => {
        if (!enabled) return;

        const syncDragClue = () => {
            const clue = document.querySelector('.k-header.k-drag-clue');

            if (!clue) {
                document.body.style.cursor = '';
                return;
            }

            clue.querySelectorAll(DRAG_CLUE_PLUS_ICON_SELECTOR).forEach(applyDragCluePlusIcon);
            document.body.style.cursor = isDragClueDenied(clue) ? 'not-allowed' : '';
        };

        syncDragClue();
        const observer = new MutationObserver(syncDragClue);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
            document.body.style.cursor = '';
        };
    }, [enabled, ...deps]);
};

// ---------------------------------------------------------------------------
// useSearchIconToolbar
// Add search icon inside the grouped grid toolbar.
// ---------------------------------------------------------------------------

export const useSearchIconToolbar = (wrapperSelector, { searchable, isLoading }) => {
    useEffect(() => {
        if (!searchable || isLoading) return;

        const updateSearchIcon = () => {
            const toolbars = document.querySelectorAll(
                `${wrapperSelector} .k-toolbar.k-grid-toolbar`,
            );
            toolbars.forEach((toolbar) => {
                if (!toolbar) return;

                let searchIcon = toolbar.querySelector('.rs-search-icon-toolbar');
                if (!searchIcon) {
                    searchIcon = document.createElement('i');
                    searchIcon.className =
                        'rs-search-icon-toolbar icon-rs-circle-zoom-fill-edge-medium icon-md color-secondary-grey border-0 position-relative right33 top-1';
                    toolbar.appendChild(searchIcon);
                }
            });
        };

        updateSearchIcon();
        const timeout = setTimeout(updateSearchIcon, 100);
        const timeout2 = setTimeout(updateSearchIcon, 300);
        const observer = new MutationObserver(updateSearchIcon);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            observer.disconnect();
        };
    }, [searchable, isLoading]);
};

// ---------------------------------------------------------------------------
// useHideFirstLastNav
// Hide first/last page navigation buttons.
// ---------------------------------------------------------------------------

export const useHideFirstLastNav = (hideFirstLastNav, deps = []) => {
    useEffect(() => {
        if (!hideFirstLastNav) return;

        const hideButtons = () => {
            const firstLastButtons = document.querySelectorAll(
                '.icon-rs-pagination-first-medium, .icon-rs-pagination-last-medium',
            );
            firstLastButtons.forEach((button) => {
                const parentLink = button.closest('.k-link');
                if (parentLink) {
                    parentLink.style.display = 'none';
                }
            });
        };

        hideButtons();
        const timeout = setTimeout(hideButtons, 200);

        return () => clearTimeout(timeout);
    }, [hideFirstLastNav, ...deps]);
};

// ---------------------------------------------------------------------------
// useGridHeaderColumnWidths
// Measure rendered Kendo header column widths so body skeleton cols align.
// ---------------------------------------------------------------------------

export const useGridHeaderColumnWidths = (enabled = false, deps = []) => {
    const containerRef = useRef(null);
    const [headerSync, setHeaderSync] = useState(null);

    const measureHeaderWidths = useCallback(() => {
        if (!enabled) return;

        const grid = containerRef.current?.closest('.k-grid');
        if (!grid) return;

        const headerTable =
            grid.querySelector('.k-grid-header-wrap table') ||
            grid.querySelector('.k-grid-header table');
        if (!headerTable) return;

        const headerCells = headerTable.querySelectorAll('th.k-table-th, th');
        if (headerCells.length > 0) {
            const measured = Array.from(headerCells).map((cell) => {
                const rectWidth = cell.getBoundingClientRect().width;
                if (rectWidth > 0) return `${rectWidth}px`;
                const offsetWidth = cell.offsetWidth;
                return offsetWidth > 0 ? `${offsetWidth}px` : null;
            });

            if (measured.length === headerCells.length && measured.every(Boolean)) {
                const layoutWidth = headerTable.getBoundingClientRect().width;
                const scrollWidth = headerTable.scrollWidth || 0;
                const measuredTotal = sumMeasuredPixelWidths(measured);
                setHeaderSync({
                    widths: measured,
                    tableWidth: Math.max(measuredTotal, layoutWidth, scrollWidth),
                });
                return;
            }
        }

        const cols = headerTable.querySelectorAll('col');
        if (cols.length > 0) {
            const measured = Array.from(cols).map((col) => {
                const attrWidth = col.getAttribute('width');
                if (attrWidth) {
                    return attrWidth.includes('px') || attrWidth.includes('%')
                        ? attrWidth
                        : `${attrWidth}px`;
                }
                if (col.style.width) return col.style.width;
                const rectWidth = col.getBoundingClientRect().width;
                if (rectWidth > 0) return `${rectWidth}px`;
                return null;
            });

            if (measured.some(Boolean)) {
                const layoutWidth = headerTable.getBoundingClientRect().width;
                const scrollWidth = headerTable.scrollWidth || 0;
                const measuredTotal = sumMeasuredPixelWidths(measured);
                setHeaderSync({
                    widths: measured,
                    tableWidth: Math.max(measuredTotal, layoutWidth, scrollWidth),
                });
            }
        }
    }, [enabled]);

    useLayoutEffect(() => {
        if (!enabled) return undefined;

        measureHeaderWidths();
        const raf1 = requestAnimationFrame(() => {
            measureHeaderWidths();
            requestAnimationFrame(measureHeaderWidths);
        });

        const grid = containerRef.current?.closest('.k-grid');
        if (!grid) {
            return () => cancelAnimationFrame(raf1);
        }

        const resizeObserver = new ResizeObserver(measureHeaderWidths);
        resizeObserver.observe(grid);

        const headerWrap = grid.querySelector('.k-grid-header-wrap');
        if (headerWrap) resizeObserver.observe(headerWrap);

        const headerTable =
            headerWrap?.querySelector('table') || grid.querySelector('.k-grid-header table');
        if (headerTable) resizeObserver.observe(headerTable);

        return () => {
            cancelAnimationFrame(raf1);
            resizeObserver.disconnect();
        };
    }, [measureHeaderWidths, enabled, ...deps]);

    return {
        containerRef,
        headerWidths: headerSync?.widths ?? null,
        headerTableWidth: headerSync?.tableWidth ?? 0,
    };
};

// ---------------------------------------------------------------------------
// useGridHeaderBodyScrollSync
// Keep header and body horizontal scroll aligned (filter-empty / loading skeleton).
// ---------------------------------------------------------------------------

export const useGridHeaderBodyScrollSync = (enabled, containerRef, deps = []) => {
    useEffect(() => {
        if (!enabled || !containerRef?.current) return undefined;

        const grid = containerRef.current.closest('.k-grid');
        const headerWrap = grid?.querySelector('.k-grid-header-wrap');
        const content = grid?.querySelector('.k-grid-content');
        if (!headerWrap || !content) return undefined;

        const syncContentToHeader = () => {
            content.scrollLeft = headerWrap.scrollLeft;
        };
        const syncHeaderToContent = () => {
            headerWrap.scrollLeft = content.scrollLeft;
        };

        syncContentToHeader();
        headerWrap.addEventListener('scroll', syncContentToHeader, { passive: true });
        content.addEventListener('scroll', syncHeaderToContent, { passive: true });

        return () => {
            headerWrap.removeEventListener('scroll', syncContentToHeader);
            content.removeEventListener('scroll', syncHeaderToContent);
        };
    }, [enabled, containerRef, ...deps]);
};

// ---------------------------------------------------------------------------
// useGridInitialLoadState
// Tracks first successful load so skeleton stays visible until isLoading clears.
// Optional loadResetKey resets state when grid context changes (tab, department, etc.).
// ---------------------------------------------------------------------------

export const useGridInitialLoadState = (isLoading, loadResetKey, hasColumnSchema = true) => {
    const requiresLoadResolutionRef = useRef(Boolean(loadResetKey) || isLoading);
    const [hasResolvedInitialLoad, setHasResolvedInitialLoad] = useState(false);

    useEffect(() => {
        if (isLoading) {
            requiresLoadResolutionRef.current = true;
        }
    }, [isLoading]);

    useLayoutEffect(() => {
        if (!isLoading && hasColumnSchema) {
            setHasResolvedInitialLoad(true);
        }
    }, [isLoading, hasColumnSchema]);

    useEffect(() => {
        if (loadResetKey === undefined) return;
        setHasResolvedInitialLoad(false);
        requiresLoadResolutionRef.current = true;
    }, [loadResetKey]);

    if (!requiresLoadResolutionRef.current) {
        return true;
    }

    return hasResolvedInitialLoad;
};
