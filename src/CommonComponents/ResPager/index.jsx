import { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Pager } from '@progress/kendo-react-data-tools';
import { DropDownListPropsContext } from '@progress/kendo-react-dropdowns';

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
    noBoxShadow = true,
    ...props
}) => {
    const pagerRef = useRef(null);
    const [pageState, setPageState] = useState(() => resolvePageState(isGallery, config));

    const { skip, take } = pageState;
    const hasExplicitTotal = total != null || totalRow != null;
    const usesRemotePaging = isServerSide || (hasExplicitTotal && !isGallery);

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

    useEffect(() => {
        if (!config) return;

        setPageState((prev) => {
            const next = resolvePageState(isGallery, config);
            if (prev.skip === next.skip && prev.take === next.take) {
                return prev;
            }
            return next;
        });
    }, [config, isGallery]);

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
                popupContainer = [...document.querySelectorAll('.k-animation-container')]
                    .find((container) => {
                        const listUl = container.querySelector('.k-popup.k-dropdownlist-popup .k-list-ul');
                        return listUl && (!listId || listUl.id === listId);
                    });
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
        const timeoutId = setTimeout(decoratePager, 100);

        const pagerObserver = new MutationObserver(decoratePager);
        pagerObserver.observe(rootEl, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-controls', 'aria-expanded', 'aria-owns'],
        });

        // Page-size popup is portaled to <body> — root observer alone never sees it open.
        const bodyObserver = new MutationObserver(tagSizePopup);
        bodyObserver.observe(document.body, { childList: true, subtree: true });

        rootEl.addEventListener('click', handlePagerInteraction);
        rootEl.addEventListener('keydown', handlePagerInteraction);
        window.addEventListener('scroll', syncOpenSizePopup, { capture: true, passive: true });
        window.addEventListener('resize', syncOpenSizePopup, { passive: true });

        return () => {
            clearTimeout(timeoutId);
            pagerObserver.disconnect();
            bodyObserver.disconnect();
            rootEl.removeEventListener('click', handlePagerInteraction);
            rootEl.removeEventListener('keydown', handlePagerInteraction);
            window.removeEventListener('scroll', syncOpenSizePopup, { capture: true });
            window.removeEventListener('resize', syncOpenSizePopup);
        };
    }, [data, pageState, isServerSide]);

    const resolvedTotal = isServerSide
        ? (total ?? totalRow ?? 0)
        : isGallery
            ? totalRow
            : hasExplicitTotal
                ? (total ?? totalRow)
                : data?.length;

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
                ].filter(Boolean).join(' '),
            },
        }),
        [],
    );

    return (
        <div ref={pagerRef} className={`respager ${className} ${!noBoxShadow ? '':'no-box-shadow'}`.trim()}>
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
        </div>
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
