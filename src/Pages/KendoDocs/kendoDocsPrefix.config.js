/**
 * KendoDocs class prefix — change RES_PREFIX here only.
 * SCSS mirror: kendoDocsPrefix.scss → $res-prefix (must stay equal).
 */
export const RES_PREFIX = 'res';

/** @param {string} suffix e.g. 'checkbox', 'tooltip-wrapper' */
export const buildResClass = (suffix) => `${RES_PREFIX}-${suffix}`;

/**
 * @param {string} block e.g. 'dd' | 'ms'
 * @param {string} [suffix] e.g. 'meta', '--checkbox', 'menu-wrapper'
 */
export const buildResKendoClass = (block, suffix) => {
    if (!suffix) return `${RES_PREFIX}-kendo-${block}`;
    if (suffix.startsWith('--')) return `${RES_PREFIX}-kendo-${block}${suffix}`;
    return `${RES_PREFIX}-kendo-${block}-${suffix}`;
};

/** DropDown — shared between index.jsx and resKendoDropdown.scss */
export const RES_KENDO_DD_CLASS = {
    base: buildResKendoClass('dd'),
    required: buildResKendoClass('dd', 'required'),
    wrapper: buildResKendoClass('dd', 'menu-wrapper'),
    rightAlign: buildResKendoClass('dd', 'right-align'),
    noBottomBorder: buildResKendoClass('dd', 'no-bottom-border'),
    listPopup: buildResKendoClass('dd', 'list-popup'),
    popupReady: buildResKendoClass('dd', 'popup-ready'),
    staticPopup: buildResKendoClass('dd', 'static-popup'),
    subLabel: buildResKendoClass('dd', 'sub-label'),
    subFloatingLabel: buildResKendoClass('dd', 'sub-floating-label'),
    floatingLabelText: buildResKendoClass('dd', 'floating-label-text'),
    valueRows: buildResKendoClass('dd', 'value-rows'),
    sublabelState: buildResKendoClass('dd', 'sublabel'),
    meta: buildResKendoClass('dd', 'meta'),
    footerAddNew: buildResKendoClass('dd', 'footer-add-new'),
    bordertip: buildResKendoClass('dd', 'bordertip'),
};

/** Icon DropDownButton — shared between ResKendoIconDropdown JSX and resKendoIconDropdown.scss */
export const RES_KENDO_ICON_DD_CLASS = {
    base: buildResKendoClass('icon-dd'),
    wrapper: buildResKendoClass('icon-dd', 'wrapper'),
    popup: buildResKendoClass('icon-dd', 'popup'),
};

/** Icon DropDownButton popup variants — maps variant prop to popupClass token */
export const RES_KENDO_ICON_DD_VARIANT = {
    aa360Communication: 'aa360LeftCommunicationDropdownListContainer',
};

/** MultiSelect — shared between index.jsx and resMultiSelect.scss */
export const RES_KENDO_MS_CLASS = {
    base: buildResKendoClass('ms'),
    wrapper: buildResKendoClass('ms', 'menu-wrapper'),
    field: buildResKendoClass('ms', 'field'),
    required: buildResKendoClass('ms', 'required'),
    disabledNoData: buildResKendoClass('ms', 'disabled-nodata'),
    loading: buildResKendoClass('ms', 'loading'),
    arrow: buildResKendoClass('ms', 'arrow'),
    listPopup: buildResKendoClass('ms', 'list-popup'),
    popup: buildResKendoClass('ms', 'popup'),
    customTag: buildResKendoClass('ms', 'custom-tag'),
    tagCount: buildResKendoClass('ms', 'tag-count'),
    tagNoCount: buildResKendoClass('ms', 'tag-nocount'),
    checkboxVariant: buildResKendoClass('ms', '--checkbox'),
    checkboxItem: buildResKendoClass('ms', 'checkbox-item'),
    checkboxItemInner: buildResKendoClass('ms', 'checkbox-item-inner'),
    selectAll: buildResKendoClass('ms', 'select-all'),
    checkboxFooter: buildResKendoClass('ms', 'checkbox-footer'),
    hideSelectedChips: buildResKendoClass('ms', 'hide-chips'),
    listFilter: buildResKendoClass('ms', 'list-filter'),
    listFilterField: buildResKendoClass('ms', 'list-filter-field'),
    meta: buildResKendoClass('ms', 'meta'),
    footerAddNew: buildResKendoClass('ms', 'footer-add-new'),
};

export const RES_KENDO_SWITCH_CLASS = buildResKendoClass('switch');

export const RES_KENDO_DATEPICKER_WRAPPER_CLASS = buildResKendoClass('datepicker-wrapper');
export const RES_KENDO_TIMEPICKER_WRAPPER_CLASS = buildResKendoClass('timepicker-wrapper');
export const RES_KENDO_DATETIMEPICKER_WRAPPER_CLASS = buildResKendoClass('datetimepicker-wrapper');
export const RES_KENDO_DATETIMEPICKER_POPUP_CLASS = buildResKendoClass('datetimepicker-popup');
export const RES_KENDO_DATETIMEPICKER_FOOTER_CLASS = buildResKendoClass('datetimepicker-footer');
export const RES_KENDO_LABEL_CLASS = buildResKendoClass('label');

/** DateRangePicker — shared between ResDateRangePicker JSX and resDateRangePicker.scss */
export const RES_DATE_RANGE_CLASS = {
    root: buildResClass('daterange-picker'),
    calendarText: buildResClass('dt-calendar-text'),
    calendarIcon: buildResClass('dt-calendar-icon'),
    arrowIcon: buildResClass('dt-arrow-icon'),
    listView: buildResClass('daterangepicker-list-view'),
    buttons: buildResClass('daterangepicker-buttons'),
    content: buildResClass('daterangepicker-content'),
    kendoWrapper: buildResKendoClass('daterange-picker', 'wrapper'),
    inputFrom: buildResKendoClass('input', 'from-date-wrapper'),
    inputTo: buildResKendoClass('input', 'to-date-wrapper'),
};

export const RES_COMPONENT_CLASS = {
    checkbox: buildResClass('checkbox'),
    tooltipWrapper: buildResClass('tooltip-wrapper'),
    tooltipChildWrapper: buildResClass('tooltip-child-wrapper'),
    nodataBar: buildResClass('nodata-bar'),
};

/** Drag-and-drop custom upload — shared between ResDDCustomUpload JSX and resDDCustomUpload.scss */
export const RES_DD_CUSTOM_UPLOAD_CLASS = {
    wrapper: buildResClass('dd-custom-upload-wrapper'),
    zone: buildResClass('dd-custom-upload-zone'),
    zoneDragging: buildResClass('dd-custom-upload-zone--dragging'),
    zoneDisabled: buildResClass('dd-custom-upload-zone--disabled'),
    content: buildResClass('dd-custom-upload-content'),
    text: buildResClass('dd-custom-upload-text'),
    browseBtn: buildResClass('dd-custom-upload-browse-btn'),
    formats: buildResClass('dd-custom-upload-formats'),
    selectedFile: buildResClass('dd-custom-upload-selected'),
    selectedFileInvalid: buildResClass('dd-custom-upload-selected--invalid'),
    selectedFileValid: buildResClass('dd-custom-upload-selected--valid'),
    fileName: buildResClass('dd-custom-upload-file-name'),
    selectedList: buildResClass('dd-custom-upload-selected-list'),
    urlSection: buildResClass('dd-custom-upload-url-section'),
    urlHint: buildResClass('dd-custom-upload-url-hint'),
    error: buildResClass('dd-custom-upload-error'),
};

/** Text input — shared between ResInput JSX and resInput.scss */
export const RES_INPUT_CLASS = {
    wrapper: buildResClass('input-wrapper'),
    field: buildResClass('input-field'),
    placeholder: buildResClass('input-placeholder-wrapper'),
    required: buildResClass('input-wrapper-required'),
    iconPlaceholder: buildResClass('input-icon-placeholder'),
    customIcon: buildResClass('input-custom-icon'),
    customDoubleIcon: buildResClass('input-custom-double-icon'),
    borderBottomRequired: buildResClass('input-border-bottom-required'),
    iconWrapper: buildResClass('input-icon-wrapper'),
    segmentLoader: buildResClass('input-segment-loader'),
    validateSuccess: buildResClass('input-validate-success'),
    formFieldIcon: buildResClass('input-form-field-icon'),
    fieldRequired: buildResClass('input-field-required'),
    labelRequired: buildResClass('input-label-required'),
    labelText: buildResClass('input-label-text'),
    bg: buildResClass('input-bg'),
    passwordMeter: buildResClass('input-password-meter'),
    meta: buildResClass('input-meta'),
    metaTooltipOnly: `${buildResClass('input-meta')}--tooltip-only`,
    metaText: buildResClass('input-meta-text'),
    metaContent: buildResClass('input-meta-content'),
};
