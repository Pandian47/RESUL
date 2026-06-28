import { useEffect, useMemo } from 'react';
/**
 * ResKendoGrid - Constants & Column Menu Components
 *
 * Consolidated from:
 * - RSKendoGrid/constants.jsx
 * - RSCustomKendoGrid/constants.jsx
 */
import {
    GridColumnMenuFilter,
    GridColumnMenuCheckboxFilter,
    GridColumnMenuSort,
} from '@progress/kendo-react-grid';
import { isCompositeFilterDescriptor, process } from '@progress/kendo-data-query';
import { GRID_CONFIG } from './config';
import { syncFilterCheckboxLabels, syncFilterSubmitButtonClickOff } from './hooks';

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

const rootFilterOrDefault = (filter) => filter || { filters: [], logic: 'and' };

const filterGroupByField = (field, filter) =>
    rootFilterOrDefault(filter).filters.filter((f) =>
        isCompositeFilterDescriptor(f)
            ? f.filters?.length && !f.filters.find((g) => isCompositeFilterDescriptor(g) || g.field !== field)
            : false,
    )[0] || null;

export const isColumnMenuFilterActive = (field, filter) => !!filterGroupByField(field, filter);

export const isColumnMenuSortActive = (field, sort) => {
    if (!sort?.length) return false;
    const index = sort.findIndex((s) => s.field === field);
    return index > -1 && (sort[index].dir === 'asc' || sort[index].dir === 'desc');
};

/**
 * Check if a column has an active filter or sort in the current data state.
 */
export const isColumnActive = (field, dataState) => {
    return (
        isColumnMenuFilterActive(field, dataState?.filter) ||
        isColumnMenuSortActive(field, dataState?.sort)
    );
};

// ---------------------------------------------------------------------------
// ColumnMenu — Sort + Filter menu
// ---------------------------------------------------------------------------

export const ColumnMenu = (props) => {
    return (
        <div className={`rs-kendo-grid-filter-menu rsKendoFilterPopupCSS`}>
            <GridColumnMenuSort {...props} />
            <GridColumnMenuFilter {...props} expanded={true} />
        </div>
    );
};

// ---------------------------------------------------------------------------
// ColumnMenuCheckboxFilter — Checkbox-based filter with search
// ---------------------------------------------------------------------------

export const ColumnMenuCheckboxFilter = (props, data, filteredDataLength = null) => {
    const fieldName = props?.field;

    const sanitizedData = useMemo(() => {
        if (!Array.isArray(data)) return data;
        return data.filter((item) => {
            if (item == null) return false;
            if (!fieldName) return true;
            const value = item?.[fieldName];
            if (value == null) return false;
            if (typeof value === 'string') return value.trim() !== '';
            return true;
        });
    }, [data, fieldName]);

    // Tag open column-menu popups so global filter SCSS selectors apply
    useEffect(() => {
        const tagFilterPopups = () => {
            document.querySelectorAll('.k-popup.k-grid-columnmenu-popup').forEach((popup) => {
                popup.classList.add(GRID_CONFIG.filterPopupClassName);
            });
        };

        tagFilterPopups();
        const observer = new MutationObserver(tagFilterPopups);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    // Hide empty-label items and manage filter button state
    useEffect(() => {
        let popupObserver = null;
        let searchInputCleanup = null;
        let boundPopup = null;

        const getActivePopup = () =>
            document.querySelector('.k-animation-container-shown .rsKendoFilterPopupCSS') ||
            document.querySelector('.rs-filter-popup .rsKendoFilterPopupCSS');

        const hideEmptyLabelItems = (activePopup) => {
            if (!activePopup) return;
            const items = activePopup.querySelectorAll('.k-multicheck-wrap .k-item');
            items.forEach((item) => {
                if (item.classList.contains('k-check-all-wrap')) return;
                const label = item.querySelector('.k-checkbox-label');
                const text = label?.textContent?.trim() || '';
                item.style.display = text ? '' : 'none';
            });
        };

        const updateFilterButtonState = (activePopup) => {
            if (!activePopup) return;

            const popup =
                activePopup.closest('.k-popup') ||
                activePopup.closest('.k-animation-container') ||
                activePopup;
            const searchInput =
                activePopup.querySelector('.k-textbox input') ||
                activePopup.querySelector('input[placeholder="Search"]');
            const searchInputValue = searchInput?.value?.trim() || '';

            const filterButton = Array.from(
                popup.querySelectorAll('.k-columnmenu-actions button, button'),
            ).find((btn) => btn.textContent.trim() === 'Filter');

            if (!filterButton) return;

            const isFilteredDataEmpty = filteredDataLength !== null && filteredDataLength === 0;
            const selectedItemsText = popup.textContent.match(/(\d+)\s+selected\s+items?/i);
            const selectedCount = selectedItemsText ? parseInt(selectedItemsText[1], 10) : null;
            const hasZeroSelected = selectedCount === 0;

            const allCheckboxes = popup.querySelectorAll('input[type="checkbox"]');
            let checkedCount = 0;
            allCheckboxes.forEach((checkbox) => {
                const label =
                    checkbox.closest('label') || checkbox.parentElement?.querySelector('label');
                const labelText = label?.textContent?.trim() || '';
                if (checkbox.checked && !labelText.toLowerCase().includes('check all')) {
                    checkedCount++;
                }
            });
            const hasNoCheckedItems = checkedCount === 0;

            const disableButton = () => {
                filterButton.disabled = true;
                filterButton.classList.add('k-disabled', 'rs-filter-submit-disabled');
                filterButton.style.pointerEvents = 'none';
                syncFilterSubmitButtonClickOff();
            };

            const enableButton = () => {
                filterButton.disabled = false;
                filterButton.classList.remove('k-disabled', 'rs-filter-submit-disabled');
                filterButton.style.pointerEvents = '';
                syncFilterSubmitButtonClickOff();
            };

            if (searchInputValue) {
                const itemsList =
                    popup.querySelector('.k-columnmenu-item-content') ||
                    popup.querySelector('.k-multicheck-wrap') ||
                    popup.querySelector('.k-list');

                if (itemsList) {
                    const items = itemsList.querySelectorAll('.k-columnmenu-item, .k-list-item, li');
                    let hasVisibleDataItems = false;

                    items.forEach((item) => {
                        const isVisible =
                            item.style.display !== 'none' && !item.classList.contains('k-hidden');
                        const label = item.querySelector('label');
                        const text = label ? label.textContent.trim() : item.textContent.trim();
                        if (
                            isVisible &&
                            text &&
                            text !== 'Check All' &&
                            !text.includes('selected items')
                        ) {
                            hasVisibleDataItems = true;
                        }
                    });

                    if (
                        !hasVisibleDataItems ||
                        isFilteredDataEmpty ||
                        hasZeroSelected ||
                        hasNoCheckedItems
                    ) {
                        disableButton();
                    } else {
                        enableButton();
                    }
                } else if (isFilteredDataEmpty || hasZeroSelected || hasNoCheckedItems) {
                    disableButton();
                }
            } else if (hasZeroSelected || hasNoCheckedItems) {
                disableButton();
            } else {
                enableButton();
            }
        };

        const refreshPopupState = (activePopup) => {
            if (!activePopup) return;
            hideEmptyLabelItems(activePopup);
            updateFilterButtonState(activePopup);
            syncFilterCheckboxLabels();
            syncFilterSubmitButtonClickOff();
        };

        const bindPopupHandlers = (activePopup) => {
            if (!activePopup || boundPopup === activePopup) return;
            boundPopup = activePopup;

            searchInputCleanup?.();
            popupObserver?.disconnect();

            const searchInput =
                activePopup.querySelector('.k-textbox input') ||
                activePopup.querySelector('input[placeholder="Search"]');

            if (searchInput) {
                searchInput.setAttribute('placeholder', 'Search..');
                const handleSearchInput = () => refreshPopupState(activePopup);
                searchInput.addEventListener('input', handleSearchInput);
                searchInput.addEventListener('keyup', handleSearchInput);
                searchInputCleanup = () => {
                    searchInput.removeEventListener('input', handleSearchInput);
                    searchInput.removeEventListener('keyup', handleSearchInput);
                };
            }

            // childList only — watching `class` on document.body loops with other filter hooks
            popupObserver = new MutationObserver(() => refreshPopupState(activePopup));
            popupObserver.observe(activePopup, { childList: true, subtree: true });

            refreshPopupState(activePopup);
        };

        const tryBindActivePopup = () => {
            bindPopupHandlers(getActivePopup());
        };

        const timeoutId = setTimeout(tryBindActivePopup, 150);

        const bodyObserver = new MutationObserver(tryBindActivePopup);
        bodyObserver.observe(document.body, { childList: true, subtree: true });

        const handleCheckboxInteraction = (event) => {
            const target = event.target;
            if (
                target?.type !== 'checkbox' &&
                !target?.closest?.('input[type="checkbox"]')
            ) {
                return;
            }

            const activePopup = getActivePopup();
            if (!activePopup) return;

            requestAnimationFrame(() => refreshPopupState(activePopup));
        };

        document.addEventListener('change', handleCheckboxInteraction, true);
        document.addEventListener('click', handleCheckboxInteraction, true);

        return () => {
            clearTimeout(timeoutId);
            bodyObserver.disconnect();
            popupObserver?.disconnect();
            searchInputCleanup?.();
            document.removeEventListener('change', handleCheckboxInteraction, true);
            document.removeEventListener('click', handleCheckboxInteraction, true);
        };
    }, [filteredDataLength]);

    return (
        <div className={`rs-kendo-grid-filter-menu rsKendoFilterPopupCSS`}>
            <GridColumnMenuCheckboxFilter
                {...props}
                data={sanitizedData}
                expanded={true}
            />
        </div>
    );
};

// ---------------------------------------------------------------------------
// userDataState — process helper
// ---------------------------------------------------------------------------

export const userDataState = (dataState, data) => {
    return {
        result: process(data?.slice(0), dataState),
        dataState: dataState,
    };
};
