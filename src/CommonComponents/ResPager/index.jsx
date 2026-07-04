import { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Pager } from '@progress/kendo-react-data-tools';
import { DropDownListPropsContext } from '@progress/kendo-react-dropdowns';
import { motion } from 'framer-motion';

import {
    INITIAL_PAGE_CONFIG,
    INITIAL_GALLERY_CONFIG,
    RESPAGER_SIZE_DROPDOWN_POPUP_SETTINGS,
    RESPAGER_SIZES_POPUP_CLASS,
} from './constant';
import './resPager.scss';

const PAGER_ICON_MAPPINGS = [
    { selector: '.k-i-caret-alt-to-left, .k-svg-i-caret-alt-to-left', classes: ['icon-rs-pagination-first-medium', 'icon-xs'] },
    { selector: '.k-i-arrow-60-left, .k-svg-i-arrow-60-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'] },
    { selector: '.k-i-caret-alt-left, .k-svg-i-caret-alt-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'] },
    { selector: '.k-i-arrow-60-right, .k-svg-i-arrow-60-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'] },
    { selector: '.k-i-caret-alt-right, .k-svg-i-caret-alt-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'] },
    { selector: '.k-i-caret-alt-to-right, .k-svg-i-caret-alt-to-right', classes: ['icon-rs-pagination-last-medium', 'icon-xs'] },
    { selector: '.k-i-arrow-double-left, .k-svg-i-arrow-double-left', classes: ['icon-rs-pagination-first-medium', 'icon-xs'] },
    { selector: '.k-i-arrow-double-right, .k-svg-i-arrow-double-right', classes: ['icon-rs-pagination-last-medium', 'icon-xs'] },
    { selector: '.k-i-chevron-left, .k-svg-i-chevron-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'] },
    { selector: '.k-i-chevron-right, .k-svg-i-chevron-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'] },
];

const resolvePageState = (isGalleryMode, pagerConfig) => ({
    ...(isGalleryMode ? INITIAL_GALLERY_CONFIG : INITIAL_PAGE_CONFIG),
    ...pagerConfig,
});

/**
 * Returns the active page button's position relative to rootEl.
 * Returns null if no active page button is visible in the numbers list.
 */
const getActiveBubbleRect = (rootEl) => {
    if (!rootEl) return null;
    
    // Find all active elements inside .k-pager-numbers container
    const activeElements = rootEl.querySelectorAll('.k-pager-numbers .k-selected');
    
    // Filter to find the active element that represents a numeric page number,
    // and is NOT a dropdown trigger/popup.
    let activeBtn = null;
    for (const el of activeElements) {
        // Discard any dropdown component wrappers
        if (el.closest('.k-dropdownlist, .k-picker, .k-dropdown, .k-list-container, .respager-sizes-popup')) {
            continue;
        }
        
        // Dropdown triggers always have aria-haspopup or role="combobox"/"listbox"
        if (
            el.hasAttribute('aria-haspopup') ||
            el.getAttribute('role') === 'combobox' ||
            el.getAttribute('role') === 'listbox'
        ) {
            continue;
        }

        const text = (el.textContent || el.innerText || '').trim();
        const isNumeric = text !== '' && !isNaN(Number(text));
        
        if (isNumeric) {
            activeBtn = el;
            break;
        }
    }
    
    if (!activeBtn) return null;
    const parentRect = rootEl.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    return {
        left: btnRect.left - parentRect.left,
        top: btnRect.top - parentRect.top,
        width: btnRect.width,
        height: btnRect.height,
    };
};

const ResPager = ({
    data = [],
    change = () => {},
    onPageChange,
    total,
    totalRow,
    isGallery = false,
    isServerSide = false,
    config = INITIAL_PAGE_CONFIG,
    className = '',
    noBoxShadow = false,
    ...props
}) => {
    const pagerRef = useRef(null);
    const hasExplicitTotal = total !== undefined;
    const [pagerWidth, setPagerWidth] = useState(0);
    const [bubbleRect, setBubbleRect] = useState(null);

    const [pageState, setPageState] = useState(() => resolvePageState(isGallery, config));

    useEffect(() => {
        if (!config) return;
        setPageState((prev) => {
            const next = resolvePageState(isGallery, config);
            if (prev.skip === next.skip && prev.take === next.take) return prev;
            return next;
        });
    }, [config, isGallery]);

    const handlePageChange = (event) => {
        const nextSkip = event.skip;
        const nextTake = event.take;

        if (isServerSide) {
            onPageChange?.({ skip: nextSkip, take: nextTake });
            return;
        }

        setPageState((prev) => ({
            ...prev,
            skip: nextSkip,
            take: nextTake,
        }));

        if (usesRemotePaging) {
            change(data, nextSkip, nextTake);
            return;
        }

        change([...data.slice(nextSkip, nextSkip + nextTake)], nextSkip, nextTake);
    };

    const usesRemotePaging = isServerSide || (hasExplicitTotal && !isGallery);

    const resolvedTotal = isServerSide
        ? (total ?? totalRow ?? 0)
        : isGallery
            ? totalRow
            : hasExplicitTotal
                ? (total ?? totalRow)
                : data?.length;

    const { skip, take } = pageState;

    /**
     * syncBubble — reads the current active button rect and updates state.
     */
    const syncBubble = useCallback(() => {
        // Wait one rAF so Kendo has fully committed the k-selected class change
        requestAnimationFrame(() => {
            const rect = getActiveBubbleRect(pagerRef.current);
            setBubbleRect(rect);
        });
    }, []);

    // Smooth width: watch .k-pager size via ResizeObserver (same pattern as Login page)
    useEffect(() => {
        const el = pagerRef.current?.querySelector('.k-pager');
        if (!el) return;

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = Math.ceil(entry.contentRect.width);
                if (w > 0) {
                    setPagerWidth(w);
                    // Re-measure bubble coordinates on layout size change/paint
                    syncBubble();
                }
            }
        });

        ro.observe(el);

        // Initial read
        const w = Math.ceil(el.getBoundingClientRect().width);
        if (w > 0) setPagerWidth(w);

        return () => ro.disconnect();
    }, [pageState]);

    useEffect(() => {
        const rootEl = pagerRef.current;
        if (!rootEl) return;

        const getSizesDropdown = () => rootEl.querySelector('.k-pager-sizes .k-dropdownlist');

        const resolveListId = (sizeDropdown) => {
            if (!sizeDropdown) return null;
            return (
                sizeDropdown.getAttribute('aria-controls')
                || sizeDropdown.getAttribute('aria-owns')
                || sizeDropdown.querySelector('[aria-controls]')?.getAttribute('aria-controls')
                || sizeDropdown.querySelector('[aria-owns]')?.getAttribute('aria-owns')
            );
        };

        const findListElement = (listId) => {
            if (!listId) return null;
            return (
                document.getElementById(listId)
                ?? document.querySelector(`[id="${CSS.escape(listId)}"]`)
            );
        };

        const replaceIcons = () => {
            PAGER_ICON_MAPPINGS.forEach(({ selector, classes }) => {
                rootEl.querySelectorAll(selector).forEach((element) => {
                    if (element.hasAttribute('data-icon-replaced')) return;
                    element.classList.remove('k-icon', 'k-svg-icon');
                    classes.forEach((cls) => element.classList.add(cls));
                    element.setAttribute('data-icon-replaced', 'true');
                    const svg = element.querySelector('svg');
                    if (svg) svg.style.display = 'none';
                });
            });
        };

        const repositionSizePopup = (sizeDropdown, popupContainer) => {
            if (!sizeDropdown || !popupContainer) return;
            if (sizeDropdown.getAttribute('aria-expanded') !== 'true') return;

            const dropdownRect = sizeDropdown.getBoundingClientRect();
            const popupRect = popupContainer.getBoundingClientRect();
            const popupHeight = popupRect.height || popupContainer.offsetHeight;
            const popupWidth = dropdownRect.width;
            const viewportPadding = 8;

            const spaceBelow = window.innerHeight - dropdownRect.bottom - viewportPadding;
            const spaceAbove = dropdownRect.top - viewportPadding;
            const openAbove = spaceBelow < popupHeight && spaceAbove >= spaceBelow;

            popupContainer.classList.toggle('showing-top', openAbove);
            popupContainer.classList.toggle('showing-below', !openAbove);

            const top = openAbove
                ? Math.max(viewportPadding, dropdownRect.top - popupHeight)
                : dropdownRect.bottom;

            popupContainer.style.position = 'fixed';
            popupContainer.style.top = `${top}px`;
            popupContainer.style.left = `${dropdownRect.left}px`;
            popupContainer.style.width = `${popupWidth}px`;
            popupContainer.style.bottom = 'auto';
            popupContainer.style.zIndex = '1103';

            const childContainer = popupContainer.querySelector('.k-child-animation-container');
            if (childContainer) {
                childContainer.style.transform = 'none';
                childContainer.style.top = '0';
                childContainer.style.left = '0';
            }
        };

        const tagSizePopup = () => {
            const sizeDropdown = getSizesDropdown();
            if (!sizeDropdown) return;

            const listId = resolveListId(sizeDropdown);
            let popupContainer = findListElement(listId)?.closest('.k-animation-container');

            if (!popupContainer && sizeDropdown.getAttribute('aria-expanded') === 'true') {
                popupContainer = [...document.querySelectorAll('.k-animation-container')].find(
                    (container) => {
                        const listUl = container.querySelector(
                            '.k-popup.k-dropdownlist-popup .k-list-ul',
                        );
                        return listUl && (!listId || listUl.id === listId);
                    },
                );
            }

            if (!popupContainer) return;

            if (!popupContainer.classList.contains(RESPAGER_SIZES_POPUP_CLASS)) {
                popupContainer.classList.add(RESPAGER_SIZES_POPUP_CLASS);
            }

            if (sizeDropdown.getAttribute('aria-expanded') === 'true') {
                repositionSizePopup(sizeDropdown, popupContainer);
            }
        };

        const syncOpenSizePopup = () => {
            const sizeDropdown = getSizesDropdown();
            if (sizeDropdown?.getAttribute('aria-expanded') !== 'true') return;
            tagSizePopup();
        };

        const decoratePager = () => {
            replaceIcons();
            tagSizePopup();
            syncBubble();
        };

        const scheduleTagSizePopup = () => {
            requestAnimationFrame(() => {
                tagSizePopup();
                requestAnimationFrame(tagSizePopup);
                setTimeout(tagSizePopup, 0);
            });
        };

        const handlePagerInteraction = (event) => {
            if (event.target.closest('.k-pager-sizes .k-dropdownlist')) {
                scheduleTagSizePopup();
            }
        };

        decoratePager();
        
        // Schedule staggered timeouts to ensure coordinates sync after layout reflows
        const t1 = setTimeout(decoratePager, 50);
        const t2 = setTimeout(decoratePager, 150);
        const t3 = setTimeout(decoratePager, 300);
        const t4 = setTimeout(decoratePager, 600);

        const pagerObserver = new MutationObserver(decoratePager);
        pagerObserver.observe(rootEl, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-controls', 'aria-expanded', 'aria-owns', 'class'],
        });

        const bodyObserver = new MutationObserver(tagSizePopup);
        bodyObserver.observe(document.body, { childList: true, subtree: true });

        rootEl.addEventListener('click', handlePagerInteraction);
        rootEl.addEventListener('keydown', handlePagerInteraction);
        window.addEventListener('scroll', syncOpenSizePopup, { capture: true, passive: true });
        window.addEventListener('resize', syncOpenSizePopup, { passive: true });

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            pagerObserver.disconnect();
            bodyObserver.disconnect();
            rootEl.removeEventListener('click', handlePagerInteraction);
            rootEl.removeEventListener('keydown', handlePagerInteraction);
            window.removeEventListener('scroll', syncOpenSizePopup, { capture: true });
            window.removeEventListener('resize', syncOpenSizePopup);
        };
    }, [data, pageState, isServerSide, syncBubble]);



    const mergePagerSizeDropdownProps = useCallback(
        (dropdownProps) => ({
            ...dropdownProps,
            popupSettings: {
                ...dropdownProps.popupSettings,
                ...RESPAGER_SIZE_DROPDOWN_POPUP_SETTINGS,
                appendTo: pagerRef.current || dropdownProps.popupSettings?.appendTo,
                popupClass: [
                    dropdownProps.popupSettings?.popupClass,
                    RESPAGER_SIZES_POPUP_CLASS,
                ]
                    .filter(Boolean)
                    .join(' '),
            },
        }),
        [],
    );

    return (
        <motion.div
            className={`respager ${className} ${!noBoxShadow ? '' : 'no-box-shadow'}`.trim()}
            animate={pagerWidth ? { width: pagerWidth } : {}}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: pagerWidth ? undefined : 'fit-content' }}
        >
            <div ref={pagerRef} style={{ position: 'relative' }}>
                <DropDownListPropsContext.Provider value={mergePagerSizeDropdownProps}>
                    <Pager
                        skip={skip}
                        take={take}
                        total={resolvedTotal}
                        buttonCount={pageState.buttonCount}
                        info={pageState?.info}
                        type={pageState.type}
                        pageSizes={pageState.pageSizes}
                        previousNext={pageState.previousNext}
                        onPageChange={handlePageChange}
                        {...props}
                    />
                </DropDownListPropsContext.Provider>

                {/* Framer Motion sliding bubble — smoothly moves between active page numbers */}
                {bubbleRect && (
                    <motion.span
                        className="respager-active-bubble"
                        initial={{
                            opacity: 0,
                            x: bubbleRect.left,
                            y: bubbleRect.top,
                            width: bubbleRect.width,
                            height: bubbleRect.height,
                        }}
                        animate={{
                            opacity: 1,
                            x: bubbleRect.left,
                            y: bubbleRect.top,
                            width: bubbleRect.width,
                            height: bubbleRect.height,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 32,
                            mass: 0.75,
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
};

ResPager.propTypes = {
    data: PropTypes.array,
    change: PropTypes.func,
    onPageChange: PropTypes.func,
    total: PropTypes.number,
    totalRow: PropTypes.number,
    isGallery: PropTypes.bool,
    isServerSide: PropTypes.bool,
    config: PropTypes.object,
    className: PropTypes.string,
    noBoxShadow: PropTypes.bool,
};

export default memo(ResPager);
