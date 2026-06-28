import { useEffect, useMemo } from 'react';
import {
    GridColumnMenuFilter,
    GridColumnMenuCheckboxFilter,
    GridColumnMenuSort,
} from '@progress/kendo-react-grid';
import { isCompositeFilterDescriptor, process } from '@progress/kendo-data-query';

const rootFilterOrDefault = (filter) => filter || { filters: [], logic: 'and' };

const filterGroupByField = (field, filter) =>
    rootFilterOrDefault(filter).filters.filter((f) =>
        isCompositeFilterDescriptor(f)
            ? f.filters?.length && !f.filters.find((g) => isCompositeFilterDescriptor(g) || g.field !== field)
            : false,
    )[0] || null;

const isColumnMenuFilterActive = (field, filter) => !!filterGroupByField(field, filter);

const isColumnMenuSortActive = (field, sort) => {
    if (!sort?.length) return false;
    const index = sort.findIndex((s) => s.field === field);
    return index > -1 && (sort[index].dir === 'asc' || sort[index].dir === 'desc');
};

// export const ColumnMenu = (props) => {
//     return (
//         <div className="rs-kendo-grid-filter-menu rskgfm">
//             <GridColumnMenuFilter {...props} expanded={true} className="aaaa" />
//         </div>
//     );
// };
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

    useEffect(() => {
        const popup = document.querySelector('.k-popup');
        if (popup) {
            popup.classList.add('rsKendoFilterTable');
        }
    }, []);

    useEffect(() => {
        const hideEmptyLabelItems = () => {
            const activePopup = document.querySelector('.k-animation-container-shown .rsKendoFilterPopupCSS') ||
                document.querySelector('.rs-filter-popup .rsKendoFilterPopupCSS');
            if (!activePopup) return;
            const items = activePopup.querySelectorAll('.k-multicheck-wrap .k-item');
            items.forEach((item) => {
                if (item.classList.contains('k-check-all-wrap')) return;
                const label = item.querySelector('.k-checkbox-label');
                const text = label?.textContent?.trim() || '';
                item.style.display = text ? '' : 'none';
            });
        };

        const handleFilterButtonState = () => {
            const activePopup = document.querySelector('.k-animation-container-shown .rsKendoFilterPopupCSS') || 
                               document.querySelector('.rs-filter-popup .rsKendoFilterPopupCSS');
            
            if (!activePopup) return null;
            hideEmptyLabelItems();
            const searchInput = activePopup.querySelector('.k-textbox input') || 
                               activePopup.querySelector('input[placeholder="Search"]');
            
            if (!searchInput) return null;
            searchInput.setAttribute('placeholder', 'Search..');

            const updateButtonState = () => {
                setTimeout(() => {
                    const searchValue = searchInput.value.trim();
                    const popup = searchInput.closest('.k-popup') || searchInput.closest('.k-animation-container');
                    if (!popup) return;
                    
                    const filterButton = Array.from(popup.querySelectorAll('.k-columnmenu-actions button, button'))
                        .find(btn => btn.textContent.trim() === 'Filter');
                    
                    if (!filterButton) return;

                    // Check if filtered data length is 0
                    const isFilteredDataEmpty = filteredDataLength !== null && filteredDataLength === 0;
                    
                    // Check for "0 selected items" text or count of checked items
                    const selectedItemsText = popup.textContent.match(/(\d+)\s+selected\s+items?/i);
                    const selectedCount = selectedItemsText ? parseInt(selectedItemsText[1], 10) : null;
                    const hasZeroSelected = selectedCount === 0;
                    
                    // Also check actual checked checkboxes (excluding "Check All")
                    const allCheckboxes = popup.querySelectorAll('input[type="checkbox"]');
                    let checkedCount = 0;
                    allCheckboxes.forEach(checkbox => {
                        const label = checkbox.closest('label') || checkbox.parentElement?.querySelector('label');
                        const labelText = label?.textContent?.trim() || '';
                        // Exclude "Check All" checkbox
                        if (checkbox.checked && !labelText.toLowerCase().includes('check all')) {
                            checkedCount++;
                        }
                    });
                    const hasNoCheckedItems = checkedCount === 0;

                    if (searchValue) {
                        const itemsList = popup.querySelector('.k-columnmenu-item-content') || 
                                        popup.querySelector('.k-multicheck-wrap') ||
                                        popup.querySelector('.k-list');
                        
                        if (itemsList) {
                            const items = itemsList.querySelectorAll('.k-columnmenu-item, .k-list-item, li');
                            let hasVisibleDataItems = false;

                            items.forEach(item => {
                                const isVisible = item.style.display !== 'none' && 
                                                !item.classList.contains('k-hidden');
                                const label = item.querySelector('label');
                                const text = label ? label.textContent.trim() : item.textContent.trim();
                                if (isVisible && text && text !== 'Check All' && !text.includes('selected items')) {
                                    hasVisibleDataItems = true;
                                }
                            });

                            if (!hasVisibleDataItems || isFilteredDataEmpty || hasZeroSelected || hasNoCheckedItems) {
                                filterButton.disabled = true;
                                filterButton.classList.add('k-disabled');
                                filterButton.style.opacity = '0.5';
                                filterButton.style.cursor = 'not-allowed';
                                filterButton.style.pointerEvents = 'none';
                            } else {
                                filterButton.disabled = false;
                                filterButton.classList.remove('k-disabled');
                                filterButton.style.opacity = '';
                                filterButton.style.cursor = '';
                                filterButton.style.pointerEvents = '';
                            }
                        } else if (isFilteredDataEmpty || hasZeroSelected || hasNoCheckedItems) {
                            filterButton.disabled = true;
                            filterButton.classList.add('k-disabled');
                            filterButton.style.opacity = '0.5';
                            filterButton.style.cursor = 'not-allowed';
                            filterButton.style.pointerEvents = 'none';
                        }
                    } else {
                        // No search value, but check if filtered data is empty or no items selected
                        if (isFilteredDataEmpty || hasZeroSelected || hasNoCheckedItems) {
                            filterButton.disabled = true;
                            filterButton.classList.add('k-disabled');
                            filterButton.style.opacity = '0.5';
                            filterButton.style.cursor = 'not-allowed';
                            filterButton.style.pointerEvents = 'none';
                        } else {
                            filterButton.disabled = false;
                            filterButton.classList.remove('k-disabled');
                            filterButton.style.opacity = '';
                            filterButton.style.cursor = '';
                            filterButton.style.pointerEvents = '';
                        }
                    }
                }, 10);
            };
            searchInput.addEventListener('input', updateButtonState);
            searchInput.addEventListener('keyup', updateButtonState);
            updateButtonState();

            return () => {
                searchInput.removeEventListener('input', updateButtonState);
                searchInput.removeEventListener('keyup', updateButtonState);
            };
        };

        const timeoutId = setTimeout(() => {
            const cleanup = handleFilterButtonState();
            if (cleanup) {
                return cleanup;
            }
        }, 150);

        const observer = new MutationObserver(() => {
            hideEmptyLabelItems();
            handleFilterButtonState();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [filteredDataLength]);

    return (
        <div className="rs-kendo-grid-filter-menu rsKendoFilterPopupCSS">
            <GridColumnMenuCheckboxFilter {...props} data={sanitizedData} expanded={true} className="bbbb" />
        </div>
    );
};

export const PAGER_CONFIG = {
    info: false,
    pageSizes: [5, 10, 20],
    previousNext: true,
    buttonCount: 4,
    className: 'rs-kendo-pager',
};
export const Notification_PAGER_CONFIG = {
    info: false,
    pageSizes: (initialSize) => [initialSize, initialSize * 2, initialSize * 3],
    previousNext: true,
    buttonCount: 4,
    className: 'rs-kendo-pager',
};

export const INITIAL_CONFIG = (pageSize) => {
    return {
        take: pageSize,
        skip: 0,
    };
};

export const userDataState = (dataState, data) => {
    return {
        result: process(data?.slice(0), dataState),
        dataState: dataState,
    };
};

export const ColumnMenu = (props) => {
    return (
        <div className="rs-kendo-grid-filter-menu rsKendoFilterPopupCSS">
            <GridColumnMenuSort {...props} />
            <GridColumnMenuFilter {...props} expanded={true} />
        </div>
    );
};

export const isColumnActive = (field, dataState) => {
    return (
        isColumnMenuFilterActive(field, dataState?.filter) ||
        isColumnMenuSortActive(field, dataState?.sort)
    );
};
