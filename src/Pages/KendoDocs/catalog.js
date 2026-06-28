/** @typedef {'default' | 'large'} DocPreviewSize */

/**
 * @typedef {object} KendoDocEntry
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} importPath
 * @property {string} importCode
 * @property {string} usageCode
 * @property {string} [exportCode]
 * @property {DocPreviewSize} [previewSize]
 * @property {string} [note]
 * @property {{ name: string, type?: string, required?: boolean, description: string, example?: string }[]} [propsDocs]
 */

/** @type {KendoDocEntry[]} */
export const KENDO_COMPONENT_CATALOG = [
    {
        id: 'dropdown',
        title: 'Dropdown',
        description:
            'Kendo DropDownList with react-hook-form — filter, sub-label rows, footer action, required state, border tip, sort, disabled items, and virtualization (5k+).',
        importPath: 'Pages/KendoDocs/CommonComponents/ResKendoDropdown',
        importCode: `import ResKendoDropdown from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';`,
        usageCode: `<ResKendoDropdown
    control={control}
    name="channel"
    label="Channel"
    data={channelOptions}
    textField="name"
    dataItemKey="id"
    required
    rules={{ required: 'Select a channel' }}
    filterName="name"
    order="asc"
    itemDisabled="isDisabled"
    isShowBordertip
    isTagRender
    isLoading={isApiLoading}
    smallText="Web notification is disabled for this account"
    rightTooltip="Select the event that triggers this step"
    footer={AddChannelFooter}
/>`,
        exportCode: `export { default as ResKendoDropdown } from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';`,
        propsDocs: [
            {
                name: 'control',
                type: 'object',
                required: true,
                description: 'react-hook-form control object. Wrap the form in FormProvider or pass control from useForm.',
                example: 'control={control}',
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Field name registered with react-hook-form.',
                example: 'name="channel"',
            },
            {
                name: 'data',
                type: 'array',
                description: 'List of options. Each item can include subLabel and isDisabled flags.',
                example: 'data={[{ id: 1, name: "Email", subLabel: "Batch", isDisabled: false }]}',
            },
            {
                name: 'textField / dataItemKey',
                type: 'string',
                description: 'Keys used to display and identify each option.',
                example: 'textField="name" dataItemKey="id"',
            },
            {
                name: 'itemDisabled',
                type: 'string',
                description: 'Property name on each data item. When true, that row is greyed out and not selectable.',
                example: 'itemDisabled="isDisabled"',
            },
            {
                name: 'isLoading',
                type: 'boolean',
                description: 'Shows a spinner to the left of the caret and disables the field while data is loading.',
                example: 'isLoading={isApiLoading}',
            },
            {
                name: 'smallText',
                type: 'string | JSX',
                description: 'Hint text rendered below the field. Accepts a plain string or React node.',
                example: 'smallText="Optional hint"  // or smallText={<span>Hint</span>}',
            },
            {
                name: 'rightTooltip',
                type: 'string | JSX',
                description: 'Tooltip on the right. String shows default question-mark icon; pass a JSX element for a custom trigger.',
                example: 'rightTooltip="Help text here"',
            },
            {
                name: 'rightTooltipIcon',
                type: 'string',
                description: 'Glyphicon class for the tooltip icon when rightTooltip is a string. Default: circle_question_mark_mini.',
                example: 'rightTooltipIcon="icon-rs-circle-question-mark-mini"',
            },
            {
                name: 'footer',
                type: 'node | function',
                description: 'Custom row at the bottom of the popup (e.g. Add channel action).',
                example: 'footer={AddChannelFooter}',
            },
            {
                name: 'filterName / order',
                type: 'string',
                description: 'Enables search filter on the given field and sorts options asc or desc.',
                example: 'filterName="name" order="asc"',
            },
            {
                name: 'isShowBordertip',
                type: 'boolean',
                description:
                    'When true, renders a triangular border tip on the popup pointing at the trigger. Works with any list size; pair with popupClass for narrow icon menus (e.g. listing-play-pause-dropdown).',
                example: 'isShowBordertip popupSettings={{ popupClass: "listing-play-pause-dropdown" }}',
            },
            {
                name: 'isTagRender',
                type: 'boolean',
                description: 'Sets a title attribute on the selected value text when truncated.',
                example: 'isTagRender',
            },
        ],
    },
    {
        id: 'multiselect',
        title: 'Multiselect',
        description:
            'Kendo MultiSelect with react-hook-form — chips, filter, clear-all, required underline, virtualization (5k+), and optional tag render.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResMultiSelect',
        importCode: `import ResMultiSelect from 'Pages/KendoDocs/CommonComponents/ResMultiSelect';`,
        usageCode: `<ResMultiSelect
    control={control}
    name="lists"
    label="Lists"
    data={listOptions}
    textField="name"
    dataItemKey="id"
    defaultValue={[]}
    rules={{ required: 'Select at least one list' }}
    required
    isTagRender
    variant="checkbox"
    selectAllLabel="All lists"
    showTitleOnTruncate
    isCustomOnchange
    limitLength={5}
    setError={setError}
    clearErrors={clearErrors}
    footer={AddListFooter}
    filterable
    itemDisabled="isDisabled"
    isLoading={isApiLoading}
    smallText="Select up to 5 lists"
    rightTooltip="More than 5 lists are not allowed"
/>`,
        exportCode: `export { default as ResMultiSelect } from 'Pages/KendoDocs/CommonComponents/ResMultiSelect';`,
        propsDocs: [
            {
                name: 'control',
                type: 'object',
                required: true,
                description: 'react-hook-form control object. Wrap the form in FormProvider or pass control from useForm.',
                example: 'control={control}',
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Field name registered with react-hook-form.',
                example: 'name="lists"',
            },
            {
                name: 'data',
                type: 'array',
                description: 'List of options. Supports virtualization for large datasets (5k+).',
                example: 'data={[{ id: 1, name: "Email", count: 1205 }]}',
            },
            {
                name: 'textField / dataItemKey',
                type: 'string',
                description: 'Keys used to display and identify each option.',
                example: 'textField="name" dataItemKey="id"',
            },
            {
                name: 'label / rules / required',
                type: 'string | object | boolean',
                description: 'Floating label, validation rules, and required underline state.',
                example: 'label="Lists" rules={{ required: "Select at least one" }} required',
            },
            {
                name: 'defaultValue',
                type: 'array',
                description: 'Initial selected values passed to react-hook-form.',
                example: 'defaultValue={[]}',
            },
            {
                name: 'isLoading / loading',
                type: 'boolean',
                description: 'Shows segment_loader spinner and disables the field while data is loading. Either prop enables the loader.',
                example: 'isLoading={isApiLoading}',
            },
            {
                name: 'disabled',
                type: 'boolean',
                description: 'Disables the multiselect and applies disabled styling.',
                example: 'disabled={isReadOnly}',
            },
            {
                name: 'filterable',
                type: 'boolean',
                description:
                    'Enables filtering via the main input as you type. Automatically on when data has more than 5 items (same threshold as ResKendoDropdown). Pass filterable to force on/off.',
                example: 'filterable',
            },
            {
                name: 'itemDisabled',
                type: 'string',
                description:
                    'Field name on each data item (e.g. "isDisabled"). Matching rows are greyed out and cannot be selected.',
                example: 'itemDisabled="isDisabled"',
            },
            {
                name: 'smallText',
                type: 'string | JSX',
                description: 'Hint text rendered below the field. Accepts a plain string or React node.',
                example: 'smallText="Optional hint"  // or smallText={<span>Hint</span>}',
            },
            {
                name: 'rightTooltip',
                type: 'string | JSX',
                description: 'Tooltip on the right of the meta row. String shows default question-mark icon; pass a JSX element for a custom trigger.',
                example: 'rightTooltip="Help text here"',
            },
            {
                name: 'rightTooltipIcon',
                type: 'string',
                description: 'Glyphicon class for the tooltip icon when rightTooltip is a string. Default: circle_question_mark_mini.',
                example: 'rightTooltipIcon="icon-rs-circle-question-mark-mini"',
            },
            {
                name: 'footer',
                type: 'node | function',
                description: 'Custom row at the bottom of the popup (e.g. Add list action).',
                example: 'footer={AddListFooter}',
            },
            {
                name: 'variant',
                type: '"default" | "checkbox"',
                description:
                    'Popup list style. Use "checkbox" for RSCheckbox rows with blue selected state and optional select-all header (RSMultiSelect_Advance_Search pattern).',
                example: 'variant="checkbox"',
            },
            {
                name: 'selectAllLabel / hideSelectAllRow',
                type: 'string | boolean',
                description: 'Checkbox variant only. Label for the select-all row; set hideSelectAllRow to omit it.',
                example: 'selectAllLabel="Select all" hideSelectAllRow',
            },
            {
                name: 'showCheckboxFooter',
                type: 'boolean',
                description:
                    'Checkbox variant only. Shows Save/Cancel footer (RSPrimaryButton / RSSecondaryButton). Selection applies on Save; Cancel reverts.',
                example: 'showCheckboxFooter checkboxSaveLabel="Save" checkboxCancelLabel="Cancel"',
            },
            {
                name: 'onCheckboxSave / onCheckboxCancel',
                type: 'function',
                description: 'Callbacks after Save or Cancel with the current selection array.',
                example: 'onCheckboxSave={(values) => {}}',
            },
            {
                name: 'isTagRender',
                type: 'boolean',
                description: 'Enables custom chip/tag rendering for selected values.',
                example: 'isTagRender',
            },
            {
                name: 'showTitleOnTruncate',
                type: 'boolean',
                description: 'Sets a title attribute on truncated chip or input text so the full value is visible on hover.',
                example: 'showTitleOnTruncate',
            },
            {
                name: 'showChipTitle',
                type: 'boolean',
                description: 'When tags include a data-count attribute, formats that count as a comma-separated title on the chip.',
                example: 'showChipTitle',
            },
            {
                name: 'isCustomRender / itemRender',
                type: 'boolean | function',
                description: 'Use a custom Kendo itemRender for popup list rows (e.g. tooltips on truncated labels).',
                example: 'isCustomRender itemRender={customItemRender}',
            },
            {
                name: 'isCustomOnchange / limitLength',
                type: 'boolean | number',
                description: 'When true, blocks selection beyond limitLength and surfaces customErrorMessage via setError.',
                example: 'isCustomOnchange limitLength={5} setError={setError} clearErrors={clearErrors}',
            },
            {
                name: 'className / popupClass',
                type: 'string',
                description: 'Wrapper and popup class names for page-level style overrides.',
                example: 'className="my-ms" popupClass="my-ms-popup"',
            },
            {
                name: 'allowCustom',
                type: 'boolean',
                description: 'Allows users to type and add values not present in data.',
                example: 'allowCustom={false}',
            },
            {
                name: 'handleChange / handleOnBlur / handleFilterChange',
                type: 'function',
                description: 'Callbacks fired on selection change, blur, and filter input.',
                example: 'handleChange={(e) => {}} handleFilterChange={(e) => {}}',
            },
        ],
    },
    {
        id: 'scheduler',
        title: 'Scheduler',
        description:
            'Domain scheduler (send time, timezone, STO) used in communication create flows. Built on RSDatetimePicker and related form fields.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResScheduler',
        importCode: `import ResScheduler from 'Pages/KendoDocs/CommonComponents/ResScheduler';`,
        usageCode: `<ResScheduler
    fieldName="schedule"
    isRequired
    minDate={minScheduleDate}
    maxDate={maxScheduleDate}
/>`,
        note: 'Requires react-hook-form context from the parent create-communication form.',
        propsDocs: [
            {
                name: 'fieldName',
                type: 'string',
                required: true,
                description: 'Prefix or name of the schedule field in the form. If isSplitTabs is true, registers values under fieldName.schedule, fieldName.timezone, etc.',
                example: 'fieldName="schedule"',
            },
            {
                name: 'isRequired',
                type: 'boolean',
                description: 'Whether the schedule field is a required field.',
                example: 'isRequired',
            },
            {
                name: 'isSplitTabs',
                type: 'boolean',
                description: 'Flag to determine if we are rendering inside a Split A/B layout tab.',
                example: 'isSplitTabs',
            },
            {
                name: 'isSendTimeRecommendation',
                type: 'boolean',
                description: 'Shows or hides the Send Time Recommendation/Optimization checkbox. Default: true.',
                example: 'isSendTimeRecommendation={false}',
            },
            {
                name: 'minDate',
                type: 'Date',
                description: 'Minimum scheduling date selectable by the picker.',
                example: 'minDate={new Date()}',
            },
            {
                name: 'maxDate',
                type: 'Date',
                description: 'Maximum scheduling date selectable by the picker.',
                example: 'maxDate={futureDate}',
            },
            {
                name: 'splitABminDate',
                type: 'Date',
                description: 'Date boundary used strictly in Split A/B schedules.',
                example: 'splitABminDate={abMinDate}',
            },
            {
                name: 'disableAutoScroll',
                type: 'boolean',
                description: 'Prevents automatic browser viewport scrolling adjustments when opening the picker.',
                example: 'disableAutoScroll',
            },
            {
                name: 'isRfaEnabled',
                type: 'boolean',
                description: 'Enables logic/validations for the Request for Approval (RFA) flow when set.',
                example: 'isRfaEnabled',
            },
            {
                name: 'isSplitABScheduler',
                type: 'boolean',
                description: 'Changes CSS layout widths specifically optimized for the Split A/B view scheduler.',
                example: 'isSplitABScheduler',
            },
            {
                name: 'compactToolbarLayout',
                type: 'boolean',
                description: 'Enables a compact, single-row layout without blue background sections. Perfect for listing filters and toolbars.',
                example: 'compactToolbarLayout',
            },
        ],
    },
    {
        id: 'daterangepicker',
        title: 'Date range picker',
        description: 'Analytics and listing date-range control with presets and UTC handling.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResDateRangePicker',
        importCode: `import ResDateRangePicker from 'Pages/KendoDocs/CommonComponents/ResDateRangePicker';`,
        usageCode: `<ResDateRangePicker
    onDatePickerClosed={({ startDate, endDate }) => setRange({ startDate, endDate })}
    isAnalytics
/>`,
        propsDocs: [
            {
                name: 'selectedDateText',
                type: 'string',
                description: 'Pre-selected filter preset key matching list option texts (e.g. "Last 30 days").',
                example: 'selectedDateText="Last 30 days"',
            },
            {
                name: 'isAnalytics',
                type: 'boolean',
                description: 'Changes preset options, start/end bounds, and layout behaviors for dashboard analytics views.',
                example: 'isAnalytics',
            },
            {
                name: 'onDatePickerClosed',
                type: 'function',
                description: 'Callback fired when the range is selected or presets are clicked. Passes { startDate, endDate, selectedType }.',
                example: 'onDatePickerClosed={({ startDate, endDate, selectedType }) => {}}',
            },
            {
                name: 'startDate / endDate',
                type: 'Date',
                description: 'Initial start and end Date objects defining the selection.',
                example: 'startDate={startVal} endDate={endVal}',
            },
            {
                name: 'mainClass',
                type: 'string',
                description: 'Custom wrapper class name for the outer datepicker element.',
                example: 'mainClass="custom-datepicker-class"',
            },
            {
                name: 'allowFutureDates',
                type: 'boolean',
                description: 'Enables selection of future dates in custom ranges for campaign scheduling/templating.',
                example: 'allowFutureDates',
            },
            {
                name: 'isConsumption',
                type: 'boolean',
                description: 'Custom selection state handler for account consumption/billing usage grids.',
                example: 'isConsumption',
            },
        ],
    },
    {
        id: 'datepicker',
        title: 'Datepicker',
        description: 'Kendo DatePicker with user date-format from master data.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResDatePicker',
        importCode: `import ResDatePicker from 'Pages/KendoDocs/CommonComponents/ResDatePicker';`,
        usageCode: `<ResDatePicker
    control={control}
    name="startDate"
    label="Start date"
    required
    rules={{ required: true }}
/>`,
        propsDocs: [
            {
                name: 'control',
                type: 'object',
                required: true,
                description: 'react-hook-form control object to bind validation state and register field.',
                example: 'control={control}',
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Registered field name in react-hook-form.',
                example: 'name="startDate"',
            },
            {
                name: 'label',
                type: 'string',
                description: 'Floating label shown inside the field; rests on the input line when empty and floats above once focused or filled.',
                example: 'label="Select start date"',
            },
            {
                name: 'defaultValue',
                type: 'Date | string',
                description: 'Initial value for the date field.',
                example: 'defaultValue={new Date()}',
            },
            {
                name: 'format',
                type: 'string',
                description: 'Display date format conforming to Kendo configurations. Default is user preference or "MMM dd, yyyy".',
                example: 'format="yyyy-MM-dd"',
            },
            {
                name: 'required',
                type: 'boolean',
                description: 'Shows the red required indicator segment at the bottom-left of the field.',
                example: 'required',
            },
            {
                name: 'placeholder',
                type: 'string',
                description: 'Placeholder text shown inside input when blank.',
                example: 'placeholder="Select a date"',
            },
            {
                name: 'disabled',
                type: 'boolean',
                description: 'Disables user interactions and applies a greyed-out visual effect.',
                example: 'disabled',
            },
            {
                name: 'handleChange / handleOnFocus / handleOnBlur',
                type: 'function',
                description: 'Callback functions triggered on field change, focus, and blur events.',
                example: 'handleChange={(e) => console.log(e.value)}',
            },
        ],
    },
    {
        id: 'timepicker',
        title: 'Timepicker',
        description: 'Kendo TimePicker integrated with react-hook-form.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResTimePicker',
        importCode: `import ResTimePicker from 'Pages/KendoDocs/CommonComponents/ResTimePicker';`,
        usageCode: `<ResTimePicker
    control={control}
    name="sendTime"
    label="Send time"
    required
/>`,
        propsDocs: [
            {
                name: 'control',
                type: 'object',
                required: true,
                description: 'react-hook-form control object.',
                example: 'control={control}',
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Registered field name in react-hook-form.',
                example: 'name="sendTime"',
            },
            {
                name: 'label',
                type: 'string',
                description: 'Floating label shown inside the field; rests on the input line when empty and floats above once focused or filled.',
                example: 'label="Schedule time"',
            },
            {
                name: 'required',
                type: 'boolean',
                description: 'Shows the red required indicator segment at the bottom-left of the field.',
                example: 'required',
            },
            {
                name: 'defaultValue',
                type: 'Date | string',
                description: 'Initial value for the time field.',
                example: 'defaultValue={new Date()}',
            },
            {
                name: 'timeFormat',
                type: 'string',
                description:
                    'Controls popup columns and input format. Default: "24 hours" (Hour, Minute, Seconds). Use "12 hours" for Hour, Minute, AM/PM.',
                example: 'timeFormat="12 hours"',
            },
            {
                name: 'format',
                type: 'string',
                description: 'Optional Kendo format override. When omitted, derived from timeFormat (HH:mm:ss or hh:mm a).',
                example: 'format="HH:mm:ss"',
            },
            {
                name: 'steps',
                type: 'object',
                description: 'Defines individual step intervals for time parts (hour, minute, second). Default: { hour: 1, minute: 30 }.',
                example: 'steps={{ hour: 1, minute: 5 }}',
            },
            {
                name: 'disabled',
                type: 'boolean',
                description: 'Disables the input field.',
                example: 'disabled',
            },
            {
                name: 'handleChange / handleOnFocus / handleOnBlur',
                type: 'function',
                description: 'Callbacks fired on time change, focus, and blur.',
                example: 'handleChange={(e) => console.log(e.value)}',
            },
        ],
    },
    {
        id: 'kendo-listbox',
        title: 'Listbox',
        description:
            'Dual-column Kendo ListBox with toolbar transfer, drag-and-drop, search, and optional attribute mode for RDS table mapping.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResKendoListbox',
        importCode: `import ResKendoListbox from 'Pages/KendoDocs/CommonComponents/ResKendoListbox';`,
        usageCode: `<ResKendoListbox
    leftColumnValues={availableItems}
    rightColumnValues={selectedItems}
    getSelectedData={(data) => {
        setAvailableItems(data.leftColumnValues);
        setSelectedItems(data.rightColumnValues);
    }}
    textField="name"
    customText="Select attributes from the left column"
/>`,
        exportCode: `export { default as ResKendoListbox } from 'Pages/KendoDocs/CommonComponents/ResKendoListbox';`,
        propsDocs: [
            {
                name: 'leftColumnValues / rightColumnValues',
                type: 'array',
                required: true,
                description: 'Controlled source and target lists.',
                example: 'leftColumnValues={left} rightColumnValues={right}',
            },
            {
                name: 'getSelectedData',
                type: 'function',
                required: true,
                description: 'Called after transfer, drag-drop, or selection updates. Receives { leftColumnValues, rightColumnValues } (or custom leftColumnName/rightColumnName keys).',
                example: 'getSelectedData={(data) => setLists(data)}',
            },
            {
                name: 'textField',
                type: 'string',
                description: 'Display and match field on each item. Default: name.',
                example: 'textField="uiPrintableName"',
            },
            {
                name: 'loading / loadingMode',
                type: 'boolean | string',
                description: 'Full skeleton (loadingMode="full") or left-column skeleton only (loadingMode="left").',
                example: 'loading={isLoading} loadingMode="left"',
            },
            {
                name: 'attributeMode',
                type: 'boolean',
                description: 'Enables shift-range select, uniqueKey drag-drop, and RDS-specific empty states.',
                example: 'attributeMode',
            },
            {
                name: 'validateTransfer',
                type: 'function',
                description: 'Optional guard before right-to-left moves. Return false to block transfer.',
                example: 'validateTransfer={({ action, items, draggedItem }) => true}',
            },
        ],
    },
    {
        id: 'pager',
        title: 'Pager',
        description: 'Kendo Pager wrapper with RESUL pagination icons.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResPager',
        importCode: `import ResPager from 'Pages/KendoDocs/CommonComponents/ResPager';`,
        usageCode: `<ResPager
    data={allRows}
    totalRow={totalCount}
    change={(pageRows, skip, take) => setVisibleRows(pageRows)}
/>`,
        propsDocs: [
            {
                name: 'data',
                type: 'array',
                description: 'Full un-paged dataset. Pager slices this array based on current page states.',
                example: 'data={tableData}',
            },
            {
                name: 'change',
                type: 'function',
                description: 'Callback fired when page, skip, or page size changes. Receives the page-sliced rows array, skip index, and take count.',
                example: 'change={(visibleRows, skip, take) => setRows(visibleRows)}',
            },
            {
                name: 'totalRow',
                type: 'number',
                description: 'Total number of items. Required when isGallery is set to true.',
                example: 'totalRow={100}',
            },
            {
                name: 'isGallery',
                type: 'boolean',
                description: 'Toggles gallery mode paginations featuring custom styling and configuration resets.',
                example: 'isGallery',
            },
            {
                name: 'config',
                type: 'object',
                description: 'Initial Pager configurations including skip, take, pageSizes, and button visibility.',
                example: 'config={{ skip: 0, take: 10, pageSizes: [5, 10, 20] }}',
            },
            {
                name: 'className',
                type: 'string',
                description: 'Custom CSS class name for styling overrides.',
                example: 'className="custom-pager"',
            },
        ],
    },
    {
        id: 'rs-input',
        title: 'RSInput',
        description:
            'Floating-label text input with react-hook-form — required indicator, validation, loading spinner, password visibility, icons, and password strength meter.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResInput',
        importCode: `import ResInput from 'Pages/KendoDocs/CommonComponents/ResInput';`,
        usageCode: `<ResInput
    control={control}
    name="campaignName"
    label="Campaign name"
    required
    rules={{ required: 'Campaign name is required' }}
    maxLength={75}
    smallText="Visible in the communication list"
    rightTooltip="Shown in the communication list and reports"
    isLoading={isApiLoading}
    viewEye={type === 'password'}
    meter={showPasswordMeter}
/>`,
        exportCode: `export { default as ResInput } from 'Pages/KendoDocs/CommonComponents/ResInput';`,
        propsDocs: [
            {
                name: 'control',
                type: 'object',
                required: true,
                description: 'react-hook-form control object.',
                example: 'control={control}',
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Registered field name in react-hook-form.',
                example: 'name="email"',
            },
            {
                name: 'label',
                type: 'string',
                description: 'Floating label shown above the underline when focused or filled.',
                example: 'label="Email address"',
            },
            {
                name: 'required',
                type: 'boolean',
                description: 'Shows the red required underline segment and registers visual required state.',
                example: 'required',
            },
            {
                name: 'rules',
                type: 'object',
                description: 'react-hook-form validation rules. Error message replaces the label when invalid.',
                example: `rules={{ required: 'Required field' }}`,
            },
            {
                name: 'isLoading',
                type: 'boolean',
                description: 'Shows an inline spinner on the right and disables interaction while loading.',
                example: 'isLoading={isSaving}',
            },
            {
                name: 'viewEye',
                type: 'boolean',
                description: 'Shows eye icon to toggle password visibility (or maskValue reveal when maskValue is set).',
                example: 'viewEye',
            },
            {
                name: 'meter',
                type: 'boolean',
                description: 'Renders password strength meter below the field (use with password type).',
                example: 'meter',
            },
            {
                name: 'smallText',
                type: 'string | JSX',
                description: 'Hint text below the field (left side). Plain strings render in a <small> tag; HTML strings or JSX render in a div.',
                example: 'smallText="Optional hint"  // or smallText={<span>Hint</span>}',
            },
            {
                name: 'rightTooltip',
                type: 'string | JSX',
                description: 'Tooltip on the right below the field. String shows default question-mark icon; pass a JSX element for a custom trigger.',
                example: 'rightTooltip="Help text here"',
            },
            {
                name: 'rightTooltipIcon',
                type: 'string',
                description: 'Glyphicon class for the tooltip icon when rightTooltip is a string. Default: circle_question_mark_mini.',
                example: 'rightTooltipIcon="icon-rs-circle-question-mark-mini"',
            },
            {
                name: 'maxLength / showTypeCount',
                type: 'number / boolean',
                description: 'Character limit with optional live counter on the right.',
                example: 'maxLength={75} showTypeCount',
            },
        ],
    },
    {
        id: 'rs-switch',
        title: 'RSSwitch',
        description: 'Kendo Switch with ON/OFF labels and validation message.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResSwitch',
        importCode: `import ResSwitch from 'Pages/KendoDocs/CommonComponents/ResSwitch';`,
        usageCode: `<ResSwitch
    control={control}
    name="isActive"
    onLabel="ON"
    offLabel="OFF"
/>`,
        propsDocs: [
            {
                name: 'control',
                type: 'object',
                required: true,
                description: 'react-hook-form control object.',
                example: 'control={control}',
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Registered field name in react-hook-form.',
                example: 'name="status"',
            },
            {
                name: 'defaultValue',
                type: 'boolean',
                description: 'Initial active state of the switch. Default: false.',
                example: 'defaultValue={true}',
            },
            {
                name: 'onLabel / offLabel',
                type: 'string',
                description: 'Custom labels displayed inside the switch track. Defaults: "ON" and "OFF".',
                example: 'onLabel="YES" offLabel="NO"',
            },
            {
                name: 'mainClass',
                type: 'string',
                description: 'Class name appended to the wrapper element.',
                example: 'mainClass="switch-container"',
            },
            {
                name: 'className',
                type: 'string',
                description: 'Class name appended directly to the Kendo Switch component.',
                example: 'className="my-switch"',
            },
            {
                name: 'handleChange',
                type: 'function',
                description: 'Callback fired on checked state change.',
                example: 'handleChange={(checkedValue) => {}}',
            },
        ],
    },
    {
        id: 'rs-dd-custom-upload',
        title: 'ResDDCustomUpload',
        description:
            'Reusable drag-and-drop file upload — image, video, GIF, CSV, ZIP, or custom accept/MIME rules via props. Styles in resDDCustomUpload.scss.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResDDCustomUpload',
        importCode: `import ResDDCustomUpload from 'Pages/KendoDocs/CommonComponents/ResDDCustomUpload';`,
        usageCode: `<ResDDCustomUpload
    inputId="campaignAssetUpload"
    fileType="image"
    maxSize={5 * 1024 * 1024}
    selectedFiles={selectedFiles}
    maxFiles={10}
    onFilesSelect={(results, { validFiles }) => {
        if (validFiles.length) setSelectedFiles((prev) => [...prev, ...validFiles]);
    }}
    onRemoveFile={(_file, index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }}
/>

{/* With URL field */}
<ResDDCustomUpload
    isMultiFileUpload={false}
    isShowUrl
    control={control}
    urlName="imageUrl.inputUrl"
    onUrlChange={handleUrlChange}
    onUrlBlur={handleUrlBlur}
    urlRules={{ validate: validateImageUrl }}
/>

{/* Single-file, no URL */}
<ResDDCustomUpload
    isMultiFileUpload={false}
    selectedFile={selectedFile}
    onFileSelect={(file, { isValid }) => isValid && setSelectedFile(file)}
    onClear={() => setSelectedFile(null)}
/>`,
        exportCode: `export { default as ResDDCustomUpload, FILE_TYPE_PRESETS } from 'Pages/KendoDocs/CommonComponents/ResDDCustomUpload';`,
        propsDocs: [
            {
                name: 'fileType',
                type: "'image' | 'video' | 'gif' | 'csv' | 'zip' | 'file'",
                description: 'Preset accept/MIME/label bundle. Overridden by explicit accept props when provided.',
                example: 'fileType="video"',
            },
            {
                name: 'accept',
                type: 'string',
                description: 'HTML file input accept attribute (e.g. ".png,.jpg" or "*").',
                example: 'accept=".csv,.xlsx"',
            },
            {
                name: 'acceptedFormats',
                type: 'string[]',
                description: 'MIME types used for drag-drop validation.',
                example: "acceptedFormats={['image/png', 'image/jpeg']}",
            },
            {
                name: 'supportedFormatsLabel',
                type: 'string',
                description: 'Hint text shown below the browse button.',
                example: 'supportedFormatsLabel=".jpg, .png"',
            },
            {
                name: 'maxSize',
                type: 'number',
                description: 'Maximum file size in bytes. Default: 5 MB.',
                example: 'maxSize={10 * 1024 * 1024}',
            },
            {
                name: 'isShowUrl',
                type: 'boolean',
                description:
                    'When true, shows the "or" divider and URL input below the drop zone. Default: false. Requires control + urlName.',
                example: 'isShowUrl control={control} urlName="field.inputUrl"',
            },
            {
                name: 'urlName / urlPlaceholder / urlRules',
                type: 'string / object',
                description:
                    'react-hook-form field for URL input, placeholder (defaults from fileType preset), and validation rules.',
                example: 'urlName="imageUrl.inputUrl" urlPlaceholder="Image URL"',
            },
            {
                name: 'showMaxSizeHint',
                type: 'boolean',
                description: 'Shows "Maximum file size: NMB" hint in the drop zone. Default: true.',
                example: 'showMaxSizeHint',
            },
            {
                name: 'isMultiFileUpload',
                type: 'boolean',
                description: 'When true (default), allows multiple files via drag-drop and browse. When false, single-file mode.',
                example: 'isMultiFileUpload={false}',
            },
            {
                name: 'maxFiles',
                type: 'number',
                description: 'Optional cap on how many files can be added in multi mode.',
                example: 'maxFiles={10}',
            },
            {
                name: 'selectedFiles',
                type: 'File[]',
                description: 'Selected files in multi mode (parent-controlled).',
                example: 'selectedFiles={files}',
            },
            {
                name: 'selectedFile',
                type: 'File | { name: string }',
                description: 'Selected file in single-file mode (use with isMultiFileUpload={false}).',
                example: 'selectedFile={file}',
            },
            {
                name: 'onFilesSelect',
                type: 'function',
                description: 'Multi mode: (results, { validFiles, invalidFiles }) after each drop or browse.',
                example: 'onFilesSelect={(results, { validFiles }) => {}}',
            },
            {
                name: 'onFileSelect',
                type: 'function',
                description: 'Called per file with (file, { isValid }) in both modes.',
                example: 'onFileSelect={(file, { isValid }) => {}}',
            },
            {
                name: 'onRemoveFile',
                type: 'function',
                description: 'Called when a file row delete icon is clicked: (file, index).',
                example: 'onRemoveFile={(file, index) => {}}',
            },
            {
                name: 'onClear',
                type: 'function',
                description: 'Called when all files are cleared (single mode delete).',
                example: 'onClear={() => setSelectedFiles([])}',
            },
            {
                name: 'disabled / isProcessing',
                type: 'boolean',
                description: 'Disables the drop zone and browse action.',
                example: 'isProcessing={isUploading}',
            },
        ],
    },
    {
        id: 'reskendogrid',
        title: 'ResKendoGrid',
        description:
            'Consolidated Kendo Grid — sorting, filtering, paging, column menus, and TruncatedCell for ellipsis + tooltip.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResKendoGrid',
        importCode: `import ResKendoGrid from 'Pages/KendoDocs/CommonComponents/ResKendoGrid';
import TruncatedCell from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/TruncateCell';`,
        usageCode: `<ResKendoGrid
    variant="advanced"
    data={rows}
    columns={columns}
    pageable
    sortable
    filterable
    style={{ height: '400px' }}
/>`,
        previewSize: 'large',
        propsDocs: [
            {
                name: 'data',
                type: 'array',
                required: true,
                description: 'Row data array.',
                example: 'data={rows}',
            },
            {
                name: 'columns',
                type: 'array',
                required: true,
                description: 'Column definitions (field, title, filter, cell, width).',
                example: 'columns={[{ field: "name", title: "Name", filter: "text" }]}',
            },
            {
                name: 'variant',
                type: 'string',
                description: 'Preset: "default", "custom", "advanced", or "grouped".',
                example: 'variant="advanced"',
            },
            {
                name: 'pageable / sortable / filterable',
                type: 'boolean',
                description: 'Enable paging, column sort, and column filter menus.',
                example: 'pageable sortable filterable',
            },
            {
                name: 'features',
                type: 'object',
                description: 'Override variant feature flags.',
                example: 'features={{ filterable: true }}',
            },
            {
                name: 'isLoading',
                type: 'boolean',
                description: 'Shows grid skeleton while data loads.',
                example: 'isLoading={isFetching}',
            },
            {
                name: 'settings / isDataStateRequired',
                type: 'object | boolean',
                description: 'Server-side mode: pass total in settings and handle onDataStateChange.',
                example: 'settings={{ total: 100 }} isDataStateRequired',
            },
        ],
    },
    {
        id: 'restexteditor',
        title: 'ResTextEditor',
        description:
            'Consolidated rich text editor — variant toolbars, character count, max length, image upload, and custom toolbar tools.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResTextEditor',
        importCode: `import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';`,
        usageCode: `<ResTextEditor
    variant="standard"
    defaultContent="<p>Hello <strong>world</strong></p>"
    placeholder="Message content"
    onChange={(html) => setContent(html)}
    characterCount
    maxLength={350}
    height={200}
/>`,
        previewSize: 'large',
        propsDocs: [
            {
                name: 'defaultContent / value',
                type: 'string',
                description: 'Initial HTML (uncontrolled) or controlled HTML via value.',
                example: 'defaultContent="<p>Hi</p>"',
            },
            {
                name: 'onChange',
                type: 'function',
                required: true,
                description: 'Fires with HTML string when content changes.',
                example: 'onChange={(html) => setContent(html)}',
            },
            {
                name: 'variant',
                type: 'string',
                description: 'Toolbar preset: "basic", "standard", or "full".',
                example: 'variant="standard"',
            },
            {
                name: 'characterCount / maxLength',
                type: 'boolean | number',
                description: 'Shows "n / max" below the editor when maxLength is set.',
                example: 'characterCount maxLength={350}',
            },
            {
                name: 'placeholder',
                type: 'string',
                description: 'Label shown above the editor; also used for required/error display.',
                example: 'placeholder="Message content"',
            },
            {
                name: 'imageUploadComponent / onImageUpload',
                type: 'component | function',
                description: 'Custom image tool or callback when user picks a file.',
                example: 'onImageUpload={({ view, file }) => insertImage(view, file)}',
            },
            {
                name: 'customToolbarActions',
                type: 'array',
                description: 'Extra Kendo toolbar tool components (Personalize, SmartLink, etc.).',
                example: 'customToolbarActions={[PersonalizeTool]}',
            },
        ],
    },
    {
        id: 'resgrid',
        title: 'ResGrid',
        description:
            'Listing grid for communications, analytics, and apps — list layout, expand rows, channel tokens, and status styling.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResGrid',
        importCode: `import ResGrid from 'Pages/KendoDocs/CommonComponents/ResGrid';
import ListRowCell from 'Pages/KendoDocs/CommonComponents/ResGrid/ListRowCell';
import ListDetailCell from 'Pages/KendoDocs/CommonComponents/ResGrid/ListDetailCell';`,
        usageCode: `<ResGrid
    layout="list"
    data={rows}
    columns={[{ cell: (props) => <ListRowCell {...props} /> }]}
    pageable
    expandField="expanded"
    onExpandChange={handleExpandChange}
    detail={(props) => <ListDetailCell {...props} onCollapse={handleCollapse} />}
    emptyMessage="No Records Found"
/>`,
        previewSize: 'large',
        propsDocs: [
            {
                name: 'layout',
                type: 'string',
                description: 'Grid layout mode; use "list" for communication-style listings.',
                example: 'layout="list"',
            },
            {
                name: 'data',
                type: 'array',
                required: true,
                description: 'Listing row data.',
                example: 'data={communicationRows}',
            },
            {
                name: 'columns',
                type: 'array',
                required: true,
                description: 'Column/cell renderers (typically ListRowCell).',
                example: 'columns={[{ cell: (props) => <ListRowCell {...props} /> }]}',
            },
            {
                name: 'detail / expandField / onExpandChange',
                type: 'node | string | function',
                description: 'Master-detail expand row with ListDetailCell.',
                example: 'expandField="expanded" detail={(p) => <ListDetailCell {...p} />}',
            },
            {
                name: 'loading / skeletonRows',
                type: 'boolean | number',
                description: 'Skeleton state while loading.',
                example: 'loading={isLoading} skeletonRows={5}',
            },
            {
                name: 'pageable / pageSize',
                type: 'boolean | number',
                description: 'Pagination for long listings.',
                example: 'pageable pageSize={10}',
            },
            {
                name: 'emptyMessage',
                type: 'string',
                description: 'Copy when there are no rows.',
                example: 'emptyMessage="No Records Found"',
            },
        ],
    },
    {
        id: 'restabber',
        title: 'ResTabber',
        description:
            'Consolidated tab component — replaces RSTabber, RSPTab, RSTabberFluid, RSTabberSlide, and RSTabSlide. Use variant to switch layouts; shared tabData API with add/remove, scroll, overflow dropdown, and label edit.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResTabber',
        importCode: `import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';`,
        usageCode: `const tabData = [
    { id: 1, text: 'Overview', component: () => <div>Overview content</div> },
    { id: 2, text: 'Details', component: () => <div>Details content</div> },
];

// Default — RSTabber
<ResTabber variant="default" tabData={tabData} className="rs-tabs row" activeClass="active" />

// Portlet icon tabs — RSPTab
<ResTabber variant="portlet" tabData={iconTabs} className="icons-tab" activeClass="active" />

// Fluid full-width + overflow dropdown — RSTabberFluid
<ResTabber variant="fluid" tabData={tabData} count={7} className="rs-tabs row" activeClass="active" />

// Horizontal scroll — RSTabberSlide
<ResTabber variant="slide" tabData={tabData} tabMaxLength={5} activeClass="active" />

// Smart slide — RSTabSlide (add/remove, refresh, label edit)
<ResTabber variant="smartSlide" tabData={tabData} refresh enableTabLabelEdit activeClass="active" />`,
        previewSize: 'large',
        propsDocs: [
            {
                name: 'variant',
                type: 'string',
                required: true,
                description:
                    'Layout preset: "default" (RSTabber), "portlet" (RSPTab), "fluid" (RSTabberFluid), "slide" (RSTabberSlide), "smartSlide" (RSTabSlide).',
                example: 'variant="default"',
            },
            {
                name: 'tabData',
                type: 'array | function',
                required: true,
                description:
                    'Tab definitions. Each item: { id, text, component, icon?, disable?, add?, remove?, text2?, image?, href? }. component is a render function.',
                example: 'tabData={[{ id: 1, text: "Tab 1", component: () => <Panel /> }]}',
            },
            {
                name: 'defaultTab',
                type: 'number',
                description: 'Initially selected tab index.',
                example: 'defaultTab={0}',
            },
            {
                name: 'callBack / onTabChange',
                type: 'function',
                description: 'Fires when user selects a tab: (tab, index, isForceUpdate?) => void.',
                example: 'callBack={(tab, index) => setActive(index)}',
            },
            {
                name: 'className / defaultClass / activeClass',
                type: 'string',
                description: 'CSS classes on tab list <ul>, each <li>, and the active tab.',
                example: 'className="rs-tabs row" defaultClass="col-md-2" activeClass="active"',
            },
            {
                name: 'componentClassName',
                type: 'string',
                description: 'Class on the tab content wrapper below the bar.',
                example: 'componentClassName="mt20"',
            },
            {
                name: 'heading',
                type: 'string',
                description: 'Side heading beside tabs (default variant only).',
                example: 'heading="Delivery method"',
            },
            {
                name: 'animate / arrow / subText / or',
                type: 'boolean',
                description: 'Animated indicator, arrow bar, secondary label (text2), OR divider between tabs.',
                example: 'animate arrow subText or',
            },
            {
                name: 'disableOtherTabs / singleTab',
                type: 'boolean',
                description: 'Lock inactive tabs; hide active styling for single-tab mode.',
                example: 'disableOtherTabs singleTab',
            },
            {
                name: 'refresh / clear / onRefresh / onClear',
                type: 'boolean | function',
                description: 'Reset controls on default and smartSlide variants. Pair with isRefreshConfirmation / isClearConfirmation.',
                example: 'refresh onRefresh={(idx) => reset(idx)} isRefreshConfirmation',
            },
            {
                name: 'onAddMenu / onRemoveMenu',
                type: 'function',
                description: 'Add/remove tab actions when tab items include add / remove icon classes.',
                example: 'onAddMenu={(pos) => addTab(pos)} onRemoveMenu={(idx) => removeTab(idx)}',
            },
            {
                name: 'isTabChangeConfirmation / isRemoveConfirmation',
                type: 'boolean',
                description: 'Show confirmation modal before tab switch or remove.',
                example: 'isTabChangeConfirmation isRemoveConfirmation',
            },
            {
                name: 'count / remTabs',
                type: 'number',
                description: 'Max visible tabs before overflow dropdown (fluid variant).',
                example: 'count={7}',
            },
            {
                name: 'tabMaxLength',
                type: 'number',
                description: 'Show horizontal scroll arrows when tab count exceeds this (slide / smartSlide).',
                example: 'tabMaxLength={5}',
            },
            {
                name: 'customRender / renderItem',
                type: 'boolean | node',
                description: 'Optional slot beside scroll tabs (slide variant).',
                example: 'customRender renderItem={<FilterButton />}',
            },
            {
                name: 'isBorderWhite / isDetailAnalytics / onTabClick',
                type: 'boolean | function',
                description: 'Slide variant: border style and analytics link tabs with custom click handler.',
                example: 'isDetailAnalytics onTabClick={(item, e) => track(item)}',
            },
            {
                name: 'enableTabLabelEdit / onTabLabelSave',
                type: 'boolean | function',
                description: 'Inline rename on active tab (smartSlide variant).',
                example: 'enableTabLabelEdit onTabLabelSave={(idx, text) => saveLabel(idx, text)}',
            },
            {
                name: 'children',
                type: 'node',
                description: 'Extra content beside the tab bar (portlet variant).',
                example: 'children={<ExportButton />}',
            },
            {
                name: 'features',
                type: 'object',
                description: 'Override variant preset flags (scrollable, overflowDropdown, editableLabels, etc.).',
                example: 'features={{ horizontalScroll: true }}',
            },
            {
                name: 'flatTabs / ccTabs / cTabsBig',
                type: 'boolean',
                description: 'Campaign / communication layout modifiers (default variant).',
                example: 'flatTabs ccTabs',
            },
            {
                name: 'isLoginScreen / isCreateCommunication',
                type: 'boolean',
                description: 'Login wrapper and communication-plan navigation integration (default variant).',
                example: 'isCreateCommunication',
            },
        ],
    },
    {
        id: 'restooltip',
        title: 'ResTooltip',
        description:
            'Consolidated tooltip — replaces RSTooltip (default) and RSMdcTooltip (mdc). Legacy rs-tooltip-* className props map to res-tooltip-* at runtime.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResTooltip',
        importCode: `import ResTooltip from 'Pages/KendoDocs/CommonComponents/ResTooltip';`,
        usageCode: `// Default — RSTooltip
<ResTooltip text="Help text" position="top" className="lh0">
  <i className="icon-rs-circle-question-mark-mini icon-md color-primary-blue" />
</ResTooltip>

// MDC workflow edge label — RSMdcTooltip
<ResTooltip
  variant="mdc"
  position="top"
  isDefaultShow={visible}
  container={containerRef}
  text={
    <div className="RS-MDC-Tooltip-UI">
      <div className="RSpopupHeading">Send email</div>
      <div className="RSpopupSubHeading">Wait for 2 day(s)</div>
      <div className="RSpopupDate">Jun 18, 2026</div>
    </div>
  }
>
  <i className="icon-rs-timer-medium icon-md color-primary-blue" />
</ResTooltip>`,
        previewSize: 'medium',
        propsDocs: [
            {
                name: 'variant',
                type: 'string',
                description: '"default" (RSTooltip) or "mdc" (RSMdcTooltip / MDC workflow).',
                example: 'variant="mdc"',
            },
            {
                name: 'text',
                type: 'string | number | ReactNode',
                required: true,
                description: 'Tooltip content. JSX supported for MDC schedule popups.',
                example: 'text="Help text"',
            },
            {
                name: 'position',
                type: 'string',
                description: 'Bootstrap placement.',
                example: 'position="top"',
            },
            {
                name: 'className',
                type: 'string',
                description: 'Wrapper classes. rs-tooltip-* tokens auto-map to res-tooltip-*.',
                example: 'className="lh0"',
            },
            {
                name: 'trigger / innerContent / show / customText',
                type: 'mixed',
                description: 'Default variant — OverlayTrigger options (RSTooltip parity).',
                example: "trigger={['hover','focus']} innerContent show customText",
            },
            {
                name: 'isDefaultShow / container',
                type: 'boolean | RefObject',
                description: 'MDC variant — controlled visibility and portal container (RSMdcTooltip parity).',
                example: 'isDefaultShow={visible} container={containerRef}',
            },
        ],
    },
    {
        id: 'restemplatecard',
        title: 'ResTemplateCard',
        description:
            'Card shell only — header, built-in body div, status accent, info popup. Pass raw markup via bodyContent. Preview parsing (ResTemplateCardBody, API mappers) is for KendoDocs demos only.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResTemplateCard',
        importCode: `import ResTemplateCard from 'Pages/KendoDocs/CommonComponents/ResTemplateCard';
import {
    ResTemplateCardBody,
    mapCommunicationGalleryItemToTemplateCardProps,
} from 'Pages/KendoDocs/CommonComponents/ResTemplateCard';`,
        usageCode: `<ResTemplateCard
    col={3}
    variant="gallery"
    statusClass="used"
    createdDate="May 19, 2026"
    moreIcon={
        <div className="res-template-card__header-actions">
            <BootstrapDropdown data={menuItems} flatIcon alignRight />
        </div>
    }
    title={templateName}
    bodyContent={
        <ResTemplateCardBody
            contentVariant="iframe"
            html={templateHtml}
            thumbnailPath={thumbnailPath}
            previewMode="email"
            templateName={templateName}
        />
    }
/>

<ResTemplateCard
    variant="communication"
    from="communication"
    title={templateName}
    moreIcon={
        <div className="res-template-card__header-actions">
            <BootstrapDropdown data={menuItems} flatIcon alignRight />
        </div>
    }
    showOverlay
    actionButtons={<div className="button">Select</div>}
    bodyContent={
        <ResTemplateCardBody
            contentVariant="iframe"
            html={html}
            previewMode="communication"
            communicationScale
            templateName={templateName}
        />
    }
/>

<SkeletonGalleryCard isLoading col={3} hideBottomAccent />

const cardProps = mapCommunicationGalleryItemToTemplateCardProps(listItem, { showInfo: true });
<ResTemplateCard
    {...cardProps}
    moreIcon={
        <div className="res-template-card__header-actions">
            <BootstrapDropdown data={menuItems} flatIcon alignRight />
        </div>
    }
    bodyContent={<ResTemplateCardBody {...cardProps.bodyConfig} />}
/>`,
        previewSize: 'large',
        propsDocs: [
            {
                name: 'variant',
                type: 'string',
                description: 'Card layout mode: gallery | communication.',
                example: 'variant="gallery"',
            },
            {
                name: 'statusClass',
                type: 'string',
                description: 'Bottom accent colour class for gallery cards (used, notused, drafted, etc.).',
                example: 'statusClass="used"',
            },
            {
                name: 'createdDate / headerMeta / moreIcon / title',
                type: 'node | string',
                description:
                    'Header — created date row (createdDate or custom headerMeta), three-dot menu as custom div (moreIcon), truncated title below.',
                example: 'moreIcon={<div className="res-template-card__header-actions"><BootstrapDropdown ... /></div>}',
            },
            {
                name: 'bodyContent',
                type: 'node',
                description:
                    'Markup rendered inside the built-in gl-body div. ResTemplateCard does not parse html/slides — pass ready JSX (img, iframe, div, etc.).',
                example: 'bodyContent={<img src={thumbnailPath} alt={templateName} />}',
            },
            {
                name: 'showOverlay / actionButtons / overlay',
                type: 'boolean | node',
                description:
                    'Communication hover overlay — showOverlay enables the interaction layer; actionButtons for Select etc.',
                example: 'showOverlay actionButtons={<div className="button">Select</div>}',
            },
            {
                name: 'bodyClassName',
                type: 'string',
                description: 'Extra class names on the built-in body div.',
                example: 'bodyClassName="full-overlay"',
            },
            {
                name: 'statusClass / showStatusAccent',
                type: 'string | boolean',
                description: 'Bottom status accent colour and visibility.',
                example: 'statusClass="scheduled" showStatusAccent',
            },
            {
                name: 'ResTemplateCardBody',
                type: 'component (KendoDocs demo only)',
                description:
                    'Optional preview helper for KendoDocs — contentVariant: carousel | iframe | image | text. Not part of ResTemplateCard; use inside bodyContent in demos.',
                example: 'bodyContent={<ResTemplateCardBody contentVariant="text" text={campaigncontent} />}',
            },
            {
                name: 'mapCommunicationGalleryItemToTemplateCardProps',
                type: 'function (KendoDocs demo only)',
                description:
                    'Maps Communication listing API row to shell props + bodyConfig for ResTemplateCardBody. Demo utility — not used by ResTemplateCard itself.',
                example: 'const { bodyConfig, ...shell } = mapCommunicationGalleryItemToTemplateCardProps(listItem)',
            },
            {
                name: 'carouselSlides',
                type: 'array',
                description: 'Deprecated — use bodyContent with ResTemplateCardBody contentVariant="carousel".',
                example: 'bodyContent={<ResTemplateCardBody contentVariant="carousel" slides={slides} />}',
            },
            {
                name: 'info / infoPanel / infoTrigger',
                type: 'object | node',
                description:
                    'Gallery info popup — structured `info` (topItems + metrics), custom `infoPanel`, or `infoTrigger`. Pair with isInfoOpen / onInfoOpen / onInfoClose for controlled state.',
                example: 'info={{ topItems, metrics }} isInfoOpen onInfoClose',
            },
            {
                name: 'renderBody / body',
                type: 'deprecated',
                description: 'Removed — use bodyContent instead.',
                example: 'bodyContent={<div dangerouslySetInnerHTML={{ __html: processedHtml }} />}',
            },
            {
                name: 'buildCommunicationGalleryBodyProps',
                type: 'function (KendoDocs demo only)',
                description: 'Returns ResTemplateCardBody props from a gallery API listItem — demo utility only.',
                example: 'bodyContent={<ResTemplateCardBody {...buildCommunicationGalleryBodyProps(listItem)} />}',
            },
        ],
    },
];

/** @type {KendoDocEntry[]} */
export const KENDO_LOOKUP_CATALOG = [
    {
        id: 'communication-listing-grid',
        title: 'Communication listing grid (full UI)',
        description: 'List tab skeleton: toolbar + grid rows — matches communication listing loading state.',
        importPath: 'Components/Skeleton/pages/communication/list',
        importCode: `import { ListTabSkeleton } from 'Components/Skeleton/pages/communication/list';`,
        usageCode: `<ListTabSkeleton count={5} isLoading showToolbar />`,
        previewSize: 'large',
    },
    {
        id: 'kendo-dd-checkbox',
        title: 'Kendo dropdown — label & checkbox',
        description: 'Dropdown with floating label beside RSCheckbox patterns used in forms and advance search.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResKendoDropdown',
        importCode: `import ResKendoDropdown from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';
import RSCheckbox from 'Components/FormFields/RSCheckbox';`,
        usageCode: `<ResKendoDropdown control={control} name="status" label="Status" data={statusList} textField="name" dataItemKey="id" />
<RSCheckbox control={control} name="includeAll" label="Include all" />`,
    },
    {
        id: 'lookup-text-editor',
        title: 'Text editor',
        description: 'Large editor preview for email / notification content builders.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResTextEditor',
        importCode: `import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';`,
        usageCode: `<ResTextEditor
    variant="standard"
    placeholder="HTML body"
    characterCount
    maxLength={350}
    onChange={(html) => setContent(html)}
/>`,
        previewSize: 'large',
    },
    {
        id: 'lookup-multiselect-label',
        title: 'Multiselect label',
        description: 'Multiselect with floating label, required state, and chip display.',
        importPath: 'Pages/KendoDocs/CommonComponents/ResMultiSelect',
        importCode: `import ResMultiSelect from 'Pages/KendoDocs/CommonComponents/ResMultiSelect';`,
        usageCode: `<ResMultiSelect
    control={control}
    name="tags"
    label="Tags"
    required
    data={tagList}
    textField="name"
    dataItemKey="id"
/>`,
    },
    {
        id: 'skeleton',
        title: 'Skeleton',
        description: 'Kendo listbox and communication skeleton building blocks.',
        importPath: 'Components/Skeleton/Components/KendoListboxSkeleton',
        importCode: `import KendoListboxSkeleton from 'Components/Skeleton/Components/KendoListboxSkeleton';
import { CommunicationPageContentSkeleton } from 'Components/Skeleton/pages/communication';`,
        usageCode: `<KendoListboxSkeleton />
<CommunicationPageContentSkeleton tabIndex={0} />`,
        previewSize: 'large',
    },
];

export const ALL_KENDO_DOC_SECTIONS = [
    { group: 'Components', items: KENDO_COMPONENT_CATALOG },
];
