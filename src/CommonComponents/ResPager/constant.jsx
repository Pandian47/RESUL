export const RESPAGER_SIZES_POPUP_CLASS = 'respager-sizes-popup';
export const RESPAGER_NO_BOX_SHADOW_CLASS = 'respager--no-box-shadow';
/** Above `.modal.show` (10002) so page-size list is visible inside modals */
export const RESPAGER_SIZES_POPUP_Z_INDEX = 10010;

/** Page-size list opens below by default; ResPager repositions above + fixed when viewport space is tight */
export const RESPAGER_SIZE_DROPDOWN_POPUP_SETTINGS = {
    anchorAlign: { vertical: 'bottom', horizontal: 'left' },
    popupAlign: { vertical: 'top', horizontal: 'left' },
    collision: { vertical: 'none', horizontal: 'fit' },
};

export const INITIAL_PAGE_CONFIG = {
    skip: 0,
    take: 6,
    responsive: true,
    info: true,
    pageSizes: [6, 9, 12, 18, 36],
    previousNext: true,
    buttonCount: 3,
};

export const INITIAL_GALLERY_CONFIG = {
    skip: 0,
    take: 4,
    responsive: true,
    info: true,
    pageSizes: [4, 8, 12, 16, 20],
    previousNext: true,
    buttonCount: 4,
};

/** Listing grids (communication / analytics) — aligned with ResGrid PAGER_CONFIG defaults */
export const INITIAL_LISTING_CONFIG = {
    skip: 0,
    take: 5,
    responsive: true,
    info: true,
    pageSizes: [5, 10, 20],
    previousNext: true,
    buttonCount: 4,
};
