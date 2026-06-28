import { analytics_medium, channel_action_medium, circle_dropdown_medium, circle_plus_fill_medium, circle_plus_medium, circle_question_mark_mini, timer_medium, user_network_medium } from 'Constants/GlobalConstant/Glyphicons';
import { cloneElement, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { PDFExport } from '@progress/kendo-react-pdf';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';

import ResKendoDropdown from '../CommonComponents/ResKendoDropdown';
import ResMultiSelect from '../CommonComponents/ResMultiSelect';
import { RES_KENDO_DD_CLASS, RES_KENDO_MS_CLASS } from '../kendoDocsVariables';
import ResScheduler from '../CommonComponents/ResScheduler';
import ResDateRangePicker from '../CommonComponents/ResDateRangePicker';
import ResDatePicker from '../CommonComponents/ResDatePicker';
import ResTimePicker from '../CommonComponents/ResTimePicker';
import ResKendoGrid from 'Pages/KendoDocs/CommonComponents/ResKendoGrid';
import TruncatedCell from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/TruncateCell';
import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import ResGridDocsPreview from 'Pages/KendoDocs/CommonComponents/ResGrid/ResGridDocsPreview';
import { RESGRID_DEMO_DEFAULTS } from 'Pages/KendoDocs/CommonComponents/ResGrid/ResGridDocsPreview.constants';
import ResTemplateCardDocsPreview from 'Pages/KendoDocs/CommonComponents/ResTemplateCard/ResTemplateCardDocsPreview';
import ResTabber from '../CommonComponents/ResTabber';
import ResTooltip from '../CommonComponents/ResTooltip';
import ResPager from '../CommonComponents/ResPager';
import ResKendoIconDropdown from '../CommonComponents/ResKendoIconDropdown';
import ResKendoListbox from '../CommonComponents/ResKendoListbox';
import ResSwitch from '../CommonComponents/ResSwitch';
import ResInput from '../CommonComponents/ResInput';
import ResDDCustomUploadDocsPreview from '../CommonComponents/ResDDCustomUpload/ResDDCustomUploadDocsPreview';
import ResCheckbox from '../CommonComponents/ResCheckbox';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { ListTabSkeleton } from 'Components/Skeleton/pages/communication/list';
import KendoListboxSkeleton from 'Components/Skeleton/Components/KendoListboxSkeleton';
import { CommunicationPageContentSkeleton } from 'Components/Skeleton/pages/communication';
const DEMO_DD_DATA = [
    { id: 1, name: 'Email', subLabel: 'Batch & triggered', isDisabled: false },
    { id: 2, name: 'SMS', subLabel: 'Short / long code', isDisabled: false },
    { id: 3, name: 'VMS', subLabel: 'Voice message', isDisabled: false },
    { id: 4, name: 'WhatsApp', subLabel: 'Business API', isDisabled: false },
    { id: 5, name: 'Alexa', subLabel: 'Voice assistant', isDisabled: false },
    { id: 6, name: 'Voice', subLabel: 'Outbound calls', isDisabled: false },
    { id: 7, name: 'Web notification', subLabel: 'Browser push', isDisabled: true },
    { id: 8, name: 'Mobile notification', subLabel: 'App push', isDisabled: false },
];

const DEMO_DD_DATA_NO_SUBLABEL = DEMO_DD_DATA.map(({ subLabel, ...item }) => item);

const DEMO_DD_FOOTER = () => (
    <div
        className={`${RES_KENDO_DD_CLASS.footerAddNew} d-flex align-items-center justify-content-between`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        role="button"
        tabIndex={0}
    >
        <span className="text-primary-blue">Add channel</span>
        <i className={`${circle_plus_fill_medium} icon-md`} aria-hidden />
    </div>
);

const DEMO_MS_DATA = [
    { id: 1, name: 'North region', isDisabled: false },
    { id: 2, name: 'South region', isDisabled: false },
    { id: 3, name: 'East region', isDisabled: false },
    { id: 4, name: 'West region', isDisabled: false },
    { id: 5, name: 'Central region', isDisabled: false },
    { id: 6, name: 'Premium enterprise accounts', isDisabled: false },
    { id: 7, name: 'Dormant users', isDisabled: true },
    { id: 8, name: 'New joiners this quarter', isDisabled: false },
];

// Channel data with fixed random 4-digit subscriber counts for the count-in-tag demo
const DEMO_CHANNEL_DATA = [
    { id: 'ch1', name: 'Email',               count: 3782 },
    { id: 'ch2', name: 'SMS',                 count: 1205 },
    { id: 'ch3', name: 'Mobile notification', count: 8467 },
    { id: 'ch4', name: 'Voice',               count: 4931 },
    { id: 'ch5', name: 'WhatsApp',            count: 2654 },
];

const DEMO_MS_FOOTER = () => (
    <div
        className={`${RES_KENDO_MS_CLASS.footerAddNew} d-flex align-items-center justify-content-between`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        role="button"
        tabIndex={0}
    >
        <span className="text-primary-blue">Add region</span>
        <i className={`${circle_plus_fill_medium} icon-md`} aria-hidden />
    </div>
);

const GRID_PREVIEW_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const formatGridPreviewDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    return `${day} ${GRID_PREVIEW_MONTHS[d.getMonth()]},${d.getFullYear()}`;
};

const DEMO_GRID_ROWS = [
    { id: 1, name: 'Alice Smith', age: 28, status: 'Active', joinedDate: new Date('2026-06-03') },
    { id: 2, name: 'Bob Johnson', age: 34, status: 'Inactive', joinedDate: new Date('2026-01-15') },
    { id: 3, name: 'Charlie Brown', age: 41, status: 'Active', joinedDate: new Date('2026-11-22') },
];

const DEMO_GRID_COLUMNS = [
    { field: 'id', title: 'ID', width: '80px', filter: 'numeric' },
    { field: 'name', title: 'Name', filter: 'text' },
    { field: 'age', title: 'Age', width: '120px', filter: 'numeric' },
    { field: 'status', title: 'Status', filter: 'text' },
    {
        field: 'joinedDate',
        title: 'Joined Date',
        filter: 'date',
        cell: (props) => (
            <TruncatedCell
                value={formatGridPreviewDate(props.dataItem.joinedDate)}
                tooltipText={props.dataItem.joinedDate?.toLocaleString?.() ?? ''}
                tdProps={props.tdProps}
                className={props.className}
            />
        ),
    },
];

const DEMO_PAGER_DATA = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    label: `Row ${i + 1}`,
}));

const DEMO_LISTBOX_LEFT = [
    { id: 1, name: 'First name' },
    { id: 2, name: 'Email' },
    { id: 3, name: 'City' },
];

const DEMO_LISTBOX_RIGHT = [{ id: 2, name: 'Email' }];

const DEMO_ICON_ITEMS = [
    { text: 'Edit', id: 'edit' },
    { text: 'Duplicate', id: 'dup' },
    { text: 'Delete', id: 'del' },
];

const useDemoForm = () => useFormContext();

/** Isolated react-hook-form scope per multiselect preview variation. */
const MultiselectDemoForm = ({ fieldName, defaultValue = [], children }) => {
    const methods = useForm({
        mode: 'onChange',
        defaultValues: { [fieldName]: defaultValue },
    });

    return (
        <FormProvider {...methods}>
            {children({
                control: methods.control,
                setError: methods.setError,
                clearErrors: methods.clearErrors,
                name: fieldName,
            })}
        </FormProvider>
    );
};

MultiselectDemoForm.propTypes = {
    fieldName: PropTypes.string.isRequired,
    defaultValue: PropTypes.array,
    children: PropTypes.func.isRequired,
};

const MultiselectChannelCountDemo = ({ name }) => {
    const { control } = useFormContext();
    const countSelected = useWatch({ control, name }) || [];
    const countTags = countSelected.map((item) => ({
        text: `${item.name} ${item.count?.toLocaleString() ?? ''}`.trim(),
        data: [item],
    }));

    return (
        <ResMultiSelect
            className="kendo-docs-ms"
            popupClass="kendo-docs-ms-popup"
            control={control}
            name={name}
            rules={{ required: 'Select at least one channel' }}
            allowCustom={false}
            label="Channels"
            required
            data={DEMO_CHANNEL_DATA}
            textField="name"
            dataItemKey="id"
            handleChange={() => {}}
            handleOnBlur={() => {}}
            isTagRender
            showTitleOnTruncate
            showChipTitle
            tags={countTags}
            smallText={
                <span className="color-secondary-grey">
                    Subscriber counts appear on chip hover
                </span>
            }
            rightTooltip="Channel totals are read-only in this preview"
        />
    );
};

MultiselectChannelCountDemo.propTypes = {
    name: PropTypes.string.isRequired,
};

// Lightweight layout used to show several states of a single component in one
// preview (label + rendered variation) with consistent vertical spacing.
const DemoVariations = ({ children }) => <div className="kendo-docs-variations">{children}</div>;

const DemoVariation = ({ label, children }) => (
    <div className="kendo-docs-variation">
        <span className="kendo-docs-variation__label">{label}</span>
        <div className="kendo-docs-variation__body">{children}</div>
    </div>
);

DemoVariations.propTypes = {
    children: PropTypes.node,
};

DemoVariation.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node,
};

export const DropdownDemo = () => {
    const { control } = useDemoForm();
    const [isLoadingDemo, setIsLoadingDemo] = useState(false);

    return (
        <div className="kendo-docs-dropdown-demo">
            <p className="font-sm color-primary-grey mb15">
                Full <strong>ResKendoDropdown</strong> preview — sublabels, disabled items, footer, loading, hint text and tooltip.
            </p>
            <DemoVariations>
                {/* Variation 1: sublabels + disabled item + loading toggle */}
                <DemoVariation label="With sublabel, disabled item & loading">
                    <Row>
                        <Col md={12}>
                        <ResKendoDropdown
                        control={control}
                        name="docs_dropdown"
                        label="Channel"
                        data={DEMO_DD_DATA}
                        textField="name"
                        dataItemKey="id"
                        required
                        rules={{ required: 'Select a channel' }}
                        filterName="name"
                        order="asc"
                        itemDisabled="isDisabled"
                        isShowBordertip
                        isTagRender
                        isLoading={isLoadingDemo}
                        popupClass="kendo-docs-dd-popup"
                        handleChange={() => {}}
                        smallText="Web notification is disabled — not available for this account"
                    />
                    </Col>
                    </Row>
                    <div className="mt10">
                        <button
                            type="button"
                            className="btn btn-link p0 font-xs"
                            onClick={() => setIsLoadingDemo((prev) => !prev)}
                        >
                            {isLoadingDemo ? 'Stop loading' : 'Toggle loading'}
                        </button>
                    </div>
                </DemoVariation>

                {/* Variation 2: no sublabel + footer + rightTooltip */}
                <DemoVariation label="No sublabel, footer & rightTooltip">
                    <ResKendoDropdown
                        control={control}
                        name="docs_dropdown_no_sublabel"
                        label="Trigger source"
                        data={DEMO_DD_DATA_NO_SUBLABEL}
                        textField="name"
                        dataItemKey="id"
                        itemDisabled="isDisabled"
                        isTagRender
                        footer={DEMO_DD_FOOTER}
                        popupClass="kendo-docs-dd-popup"
                        handleChange={() => {}}
                        smallText={<span>Required for <strong>event-based</strong> journeys</span>}
                        rightTooltip="Select the event that triggers this journey step"
                    />
                </DemoVariation>
            </DemoVariations>
            <ul className="kendo-docs-dropdown-demo__props font-xs color-secondary-grey mt15 mb0">
                <li><code>itemDisabled="isDisabled"</code> — greys out items where <code>isDisabled: true</code> (e.g. Web notification)</li>
                <li><code>isLoading</code> — shows inline spinner and disables interaction while data loads</li>
                <li><code>smallText</code> — hint below the field, accepts string or JSX</li>
                <li><code>rightTooltip</code> — question-mark icon with hover tooltip, accepts string or JSX element</li>
                <li><code>footer</code> — custom action row at the bottom of the popup</li>
            </ul>
        </div>
    );
};

export const MultiselectDemo = () => {
    const [isLoadingChipsDemo, setIsLoadingChipsDemo] = useState(false);
    const [isLoadingSpinnerDemo, setIsLoadingSpinnerDemo] = useState(false);
    const [isDisabledChipsDemo, setIsDisabledChipsDemo] = useState(false);

    const customItemRender = useCallback((li, itemProps) => {
        const title = itemProps?.dataItem?.name || li.props.children;
        return cloneElement(li, { ...li.props, title }, <span>{li.props.children}</span>);
    }, []);

    return (
        <div className="kendo-docs-dropdown-demo">
            <p className="font-sm color-primary-grey mb15">
                Full <strong>ResMultiSelect</strong> preview — filter, chips, custom item render, footer action,
                loading/disabled states, validation and selection-limit handling. Each variation uses its own form
                field so previews do not affect one another.
            </p>
            <DemoVariations>
                <DemoVariation label="No data">
                    <MultiselectDemoForm fieldName="ms_chips_footer" defaultValue={[]}>
                        {({ control, setError, clearErrors, name }) => (
                            <>
                                <ResMultiSelect
                                    className="kendo-docs-ms"
                                    popupClass="kendo-docs-ms-popup"
                                    control={control}
                                    name={name}
                                    rules={{ required: 'Select at least one region' }}
                                    allowCustom={false}
                                    label="Campaign regions"
                                    data={[]}
                                    textField="name"
                                    dataItemKey="id"
                                    handleChange={() => {}}
                                    handleOnBlur={() => {}}
                                    required
                                    disabled={isDisabledChipsDemo}
                                    itemRender={customItemRender}
                                    isCustomRender
                                    isCustomOnchange
                                    limitLength={5}
                                    setError={setError}
                                    clearErrors={clearErrors}
                                    customErrorMessage="More than 5 lists are not allowed"
                                    handleFilterChange={() => {}}
                                    itemDisabled="isDisabled"
                                    isTagRender
                                    showTitleOnTruncate
                                    footer={DEMO_MS_FOOTER}
                                    isLoading={isLoadingChipsDemo}
                                    smallText="Select up to 5 regions — Dormant users cannot be selected"
                                    rightTooltip="More than 5 lists are not allowed"
                                />
                            </>
                        )}
                    </MultiselectDemoForm>
                </DemoVariation>

                <DemoVariation label="Chips, filter, footer, loading & validation">
                    <MultiselectDemoForm fieldName="ms_chips_footer" defaultValue={[]}>
                        {({ control, setError, clearErrors, name }) => (
                            <>
                                <ResMultiSelect
                                    className="kendo-docs-ms"
                                    popupClass="kendo-docs-ms-popup"
                                    control={control}
                                    name={name}
                                    rules={{ required: 'Select at least one region' }}
                                    allowCustom={false}
                                    label="Campaign regions"
                                    data={DEMO_MS_DATA}
                                    textField="name"
                                    dataItemKey="id"
                                    handleChange={() => {}}
                                    handleOnBlur={() => {}}
                                    required
                                    disabled={isDisabledChipsDemo}
                                    itemRender={customItemRender}
                                    isCustomRender
                                    isCustomOnchange
                                    limitLength={5}
                                    setError={setError}
                                    clearErrors={clearErrors}
                                    customErrorMessage="More than 5 lists are not allowed"
                                    handleFilterChange={() => {}}
                                    itemDisabled="isDisabled"
                                    isTagRender
                                    showTitleOnTruncate
                                    footer={DEMO_MS_FOOTER}
                                    isLoading={isLoadingChipsDemo}
                                    smallText="Select up to 5 regions — Dormant users cannot be selected"
                                    rightTooltip="More than 5 lists are not allowed"
                                />
                                <div className="mt10 d-flex align-items-center gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-link p0 font-xs"
                                        onClick={() => setIsLoadingChipsDemo((prev) => !prev)}
                                    >
                                        {isLoadingChipsDemo ? 'Stop loading' : 'Toggle loading'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-link p0 font-xs"
                                        onClick={() => setIsDisabledChipsDemo((prev) => !prev)}
                                    >
                                        Toggle disabled
                                    </button>
                                </div>
                            </>
                        )}
                    </MultiselectDemoForm>
                </DemoVariation>
                <DemoVariation label="Loading state (segment_loader)">
                    <MultiselectDemoForm fieldName="ms_segment_loader" defaultValue={[]}>
                        {({ control, name }) => (
                            <>
                                <ResMultiSelect
                                    className="kendo-docs-ms"
                                    popupClass="kendo-docs-ms-popup"
                                    control={control}
                                    name={name}
                                    allowCustom={false}
                                    label="Audience segments"
                                    data={DEMO_MS_DATA}
                                    textField="name"
                                    dataItemKey="id"
                                    handleChange={() => {}}
                                    handleOnBlur={() => {}}
                                    isLoading={isLoadingSpinnerDemo}
                                    smallText="Spinner appears to the left of the caret while data loads"
                                />
                                <div className="mt10">
                                    <button
                                        type="button"
                                        className="btn btn-link p0 font-xs"
                                        onClick={() => setIsLoadingSpinnerDemo((prev) => !prev)}
                                    >
                                        {isLoadingSpinnerDemo ? 'Stop loading' : 'Toggle loading'}
                                    </button>
                                </div>
                            </>
                        )}
                    </MultiselectDemoForm>
                </DemoVariation>
                <DemoVariation label="Selection count in tag (name + count)">
                    <MultiselectDemoForm
                        fieldName="ms_channel_count"
                        defaultValue={DEMO_CHANNEL_DATA}
                    >
                        {({ name }) => <MultiselectChannelCountDemo name={name} />}
                    </MultiselectDemoForm>
                </DemoVariation>
                <DemoVariation label="Disabled items & filter">
                    <MultiselectDemoForm fieldName="ms_disabled_items" defaultValue={[]}>
                        {({ control, name }) => (
                            <ResMultiSelect
                                className="kendo-docs-ms"
                                popupClass="kendo-docs-ms-popup"
                                control={control}
                                name={name}
                                allowCustom={false}
                                label="Target regions"
                                data={DEMO_MS_DATA}
                                textField="name"
                                dataItemKey="id"
                                handleChange={() => {}}
                                handleOnBlur={() => {}}
                                itemDisabled="isDisabled"
                                smallText={
                                    <span className="color-secondary-grey">
                                        Type in the field to filter when there are more than 5 options;{' '}
                                        <code>itemDisabled=&quot;isDisabled&quot;</code> greys out blocked rows
                                    </span>
                                }
                            />
                        )}
                    </MultiselectDemoForm>
                </DemoVariation>
                <Row>
                    <Col md={4}>
                        <DemoVariation label="Checkbox variant — Save & Cancel footer">
                            <MultiselectDemoForm
                                fieldName="ms_checkbox_footer"
                                defaultValue={[DEMO_MS_DATA[0], DEMO_MS_DATA[2]]}
                            >
                                {({ control, name }) => (
                                    <>
                                        <ResMultiSelect
                                            className="kendo-docs-ms"
                                            popupClass="kendo-docs-ms-popup"
                                            control={control}
                                            name={name}
                                            rules={{ required: 'Select at least one region' }}
                                            allowCustom={false}
                                            label="Notify regions"
                                            required
                                            data={DEMO_MS_DATA}
                                            textField="name"
                                            dataItemKey="id"
                                            handleChange={() => {}}
                                            handleOnBlur={() => {}}
                                            variant="checkbox"
                                            selectAllLabel="Select all"
                                            showCheckboxFooter
                                            checkboxSaveLabel="Save"
                                            checkboxCancelLabel="Cancel"
                                            itemDisabled="isDisabled"
                                        />
                                        <p className="font-xs color-secondary-grey mt8 mb0">
                                            Popup stays open while toggling checkboxes. <code>showCheckboxFooter</code> adds
                                            Save / Cancel (<code>RSPrimaryButton</code> / <code>RSSecondaryButton</code>);
                                            chips update on Save.
                                        </p>
                                    </>
                                )}
                            </MultiselectDemoForm>
                        </DemoVariation>
                    </Col>
                </Row>
            </DemoVariations>
            <ul className="kendo-docs-dropdown-demo__props font-xs color-secondary-grey mt15 mb0">
                <li>
                    <code>itemDisabled=&quot;isDisabled&quot;</code> — greys out options where{' '}
                    <code>isDisabled: true</code> (e.g. Dormant users)
                </li>
                <li>
                    <code>filterable</code> — filters via the main input; auto-enabled when data has more than 5 items
                </li>
                <li>
                    <code>isLoading</code> / <code>loading</code> — shows inline{' '}
                    <code>segment_loader</code> beside the caret and disables interaction while data loads
                </li>
                <li>
                    <code>isTagRender</code> — truncated chip/value title on hover
                </li>
                <li>
                    <code>variant="checkbox"</code> — checkbox list with optional Save / Cancel footer
                </li>
                <li>
                    <code>footer</code> — custom action row at the bottom of the popup
                </li>
            </ul>
        </div>
    );
};

export const SchedulerDemo = () => {
    return (
        <div className="kendo-docs-scheduler-demo">
            <ResScheduler fieldName="docsSchedule" />
        </div>
    );
};

export const DateRangePickerDemo = () => {
    // Analytics mode bounds the calendar by start/end (not the user's createdDate),
    // so the demo always exposes a real, selectable range.
    const today = new Date();
    const rangeStart = new Date(today.getFullYear(), 0, 1);
    const last30Start = new Date(today);
    last30Start.setDate(last30Start.getDate() - 29);

    return (
        <ResDateRangePicker
            isAnalytics
            startDate={rangeStart}
            endDate={today}
            selectedFullDate={{ start: last30Start, end: today }}
            onDatePickerClosed={() => {}}
        />
    );
};

export const DatepickerDemo = () => {
    const { control } = useDemoForm();
    return (
        <DemoVariations>
            <DemoVariation label="Default (empty)">
                <ResDatePicker control={control} name="docs_date" label="Start date" />
            </DemoVariation>
            <DemoVariation label="Required">
                <ResDatePicker control={control} name="docs_date_required" label="Start date" required />
            </DemoVariation>
            <DemoVariation label="Pre-filled value">
                <ResDatePicker control={control} name="docs_date_filled" label="Start date" defaultValue={new Date()} />
            </DemoVariation>
            <DemoVariation label="Disabled">
                <ResDatePicker control={control} name="docs_date_disabled" label="Start date" defaultValue={new Date()} disabled />
            </DemoVariation>
        </DemoVariations>
    );
};

export const TimepickerDemo = () => {
    const { control } = useDemoForm();
    return (
        <DemoVariations>
            <DemoVariation label="Default (empty)">
                <ResTimePicker control={control} name="docs_time" label="Send time" />
            </DemoVariation>
            <DemoVariation label="Required">
                <ResTimePicker control={control} name="docs_time_required" label="Send time" required />
            </DemoVariation>
            <DemoVariation label="Pre-filled value">
                <ResTimePicker control={control} name="docs_time_filled" label="Send time" defaultValue={new Date()} />
            </DemoVariation>
            <DemoVariation label="Disabled">
                <ResTimePicker control={control} name="docs_time_disabled" label="Send time" defaultValue={new Date()} disabled />
            </DemoVariation>
            <DemoVariation label="12-hour (AM/PM)">
                <ResTimePicker
                    control={control}
                    name="docs_time_12h"
                    label="Send time"
                    timeFormat="12 hours"
                    defaultValue={new Date()}
                />
            </DemoVariation>
        </DemoVariations>
    );
};

export const ResTextEditorDemo = () => (
    <div className="kendo-docs-text-editor-demo">
        <p className="font-sm color-primary-grey mb15">
            <strong>ResTextEditor</strong> — standard toolbar, character count, and max length.
        </p>
        <ResTextEditor
            variant="standard"
            defaultContent="<p>Welcome to <strong>ResTextEditor</strong>. Try formatting, lists, alignment, and hyperlinks.</p>"
            placeholder="Message content"
            characterCount
            maxLength={350}
            height={200}
            responsiveToolbar
            onChange={() => {}}
        />
    </div>
);

export const ResKendoGridDemo = () => (
    <div className="kendo-docs-grid-demo" style={{ height: 300 }}>
        <p className="font-sm color-primary-grey mb15">
            <strong>ResKendoGrid</strong> — sort, filter columns, and paginate sample data.
        </p>
        <ResKendoGrid
            variant="advanced"
            data={DEMO_GRID_ROWS}
            columns={DEMO_GRID_COLUMNS}
            pageable
            sortable
            filterable
            scrollable="scrollable"
            style={{ height: 260 }}
        />
    </div>
);

export const ResGridDemo = () => (
    <div className="kendo-docs-resgrid-demo resgrid-docs-preview">
        <p className="font-sm color-primary-grey mb15">
            <strong>ResGrid</strong> — communication listing with expand rows, channels, and status styles.
        </p>
        <ResGridDocsPreview {...RESGRID_DEMO_DEFAULTS} />
    </div>
);

export const ResTemplateCardDemo = () => (
    <div className="kendo-docs-restemplatecard-demo">
        <ResTemplateCardDocsPreview />
    </div>
);

const makeTabPanel = (label) => () => (
    <div className="box-design font-sm color-primary-grey p3">{label} panel content</div>
);

const AUDIENCE_FLUID_TABS = [
    { id: 1, text: 'Master data management', component: makeTabPanel('Master data management') },
    { id: 2, text: 'Segments & lists', component: makeTabPanel('Segments & lists') },
    { id: 3, text: 'Dynamic lists', component: makeTabPanel('Dynamic lists') },
];

const LIST_ACTIVITY_TABS = [
    { id: 1, text: 'List activity', component: () => null },
    { id: 2, text: 'List acquisition', component: () => null },
    { id: 3, text: 'List attrition', component: () => null },
];

const SCHEDULE_TABS = ['Immediate', 'Shortly', 'Daily', 'Weekly', 'Monthly'].map((text, index) => ({
    id: index + 1,
    text,
    component: makeTabPanel(text),
}));

const DEMO_FLUID_OVERFLOW_TABS = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    text: `Segment ${index + 1}`,
    component: makeTabPanel(`Segment ${index + 1}`),
}));

const DEMO_CHANNEL_TABS = [
    'Email',
    'SMS',
    'Two-Way SMS',
    'Notifications',
    'QR',
    'WhatsApp',
    'RCS',
    'ORM',
    'Line',
    'Voice assistant',
    'VMS',
    'Paid media',
].map((text, index) => ({
    id: index + 1,
    text,
    component: makeTabPanel(text),
}));

const DEMO_PORTLET_TABS = [
    {
        id: 'line',
        icon: channel_action_medium,
        tooltip: 'Line chart',
        component: makeTabPanel('Line chart'),
    },
    {
        id: 'column',
        icon: analytics_medium,
        tooltip: 'Bar chart',
        component: makeTabPanel('Bar chart'),
    },
    {
        id: 'radar',
        icon: user_network_medium,
        tooltip: 'Radar chart',
        component: makeTabPanel('Radar chart'),
    },
];

const SmartLinkTabberDemo = () => {
    const [activeTab, setActiveTab] = useState(0);

    const smartLinkTabs = useMemo(
        () => [
            {
                id: 'smartLink1',
                text: 'Smart Link 1',
                component: makeTabPanel('Smart Link 1'),
            },
            {
                id: 'smartLink2',
                text: 'Smart Link 2',
                component: makeTabPanel('Smart Link 2'),
                add: circle_plus_medium,
            },
        ],
        [],
    );

    return (
        <div className="kendo-docs-smartlink-tabber-preview">
            <ResTabber
                variant="smartSlide"
                tabData={smartLinkTabs}
                defaultTab={activeTab}
                callBack={(_, index) => setActiveTab(index)}
                onAddMenu={() => {}}
                customTooltipName="Add smart link"
                dynamicTab="res-content-tabs-split model_smartlink"
                activeClass="active"
                componentClassName="p-3 box-design no-box-shadow"
            />
        </div>
    );
};

export const ResTabberDemo = () => (
    <div className="kendo-docs-restabber-demo">
        <p className="font-sm color-primary-grey mb15">
            <strong>ResTabber</strong> — production tab layouts using the same className / defaultClass props as live screens.
        </p>
        <DemoVariations>
            <DemoVariation label='variant="fluid" — Audience main tabs (RSTabberFluid)'>
                <ResTabber
                    variant="fluid"
                    tabData={AUDIENCE_FLUID_TABS}
                    defaultClass="col-md-4"
                    className="rs-tabs row rst-left-space"
                    dynamicTab="mb0 mini"
                    activeClass="active"
                    componentClassName="px-3 mt15"
                />
            </DemoVariation>

            <DemoVariation label='variant="default" — Transparent sub-tabs (RSTabber)'>
                <div className="box-design position-relative pageSub_tab x-axis-labels-performance kendo-docs-transparent-subtabs-preview">
                    <ResTabber
                        variant="default"
                        tabData={LIST_ACTIVITY_TABS}
                        defaultClass="col-md-2 tabTransparent"
                        className="rs-tabs row"
                        dynamicTab="mb0 mini"
                        activeClass="active"
                        componentClassName="mt30"
                    />
                </div>
            </DemoVariation>

            <DemoVariation label='variant="default" — Scheduler / delivery tabs'>
                <ResTabber
                    variant="default"
                    tabData={SCHEDULE_TABS}
                    dynamicTab="rs-content-tabs-2 rct-ra"
                    activeClass="active"
                    componentClassName="mt15"
                />
            </DemoVariation>

            <DemoVariation label='variant="portlet" — Icon tabs (RSPTab)'>
                <ResTabber
                    variant="portlet"
                    tabData={DEMO_PORTLET_TABS}
                    className="icons-tab"
                    activeClass="active"
                />
            </DemoVariation>

            <DemoVariation label='variant="fluid" — Overflow dropdown (count={7})'>
                <ResTabber
                    variant="fluid"
                    tabData={DEMO_FLUID_OVERFLOW_TABS}
                    count={7}
                    defaultClass="col-md-2"
                    className="rs-tabs row rs-tabs-auto-width rst-left-space"
                    dynamicTab="mb0 mini rst-left-space"
                    activeClass="active"
                    componentClassName="px-3 mt15"
                />
            </DemoVariation>

            <DemoVariation label='variant="slide" — Channel scroll tabs (RSTabberSlide)'>
                <ResTabber
                    variant="slide"
                    tabData={DEMO_CHANNEL_TABS}
                    className="rs-tabs row detail-tabs"
                    dynamicTab="mb0 mini detail-analytics-tab"
                    activeClass="active"
                    tabMaxLength={5}
                    componentClassName="mt15"
                />
            </DemoVariation>

            <DemoVariation label='variant="smartSlide" — Smart link tabs (RSTabSlide)'>
                <SmartLinkTabberDemo />
            </DemoVariation>
        </DemoVariations>
    </div>
);

export const PdfDemo = () => {
    const pdfRef = useRef(null);
    return (
        <div className="kendo-docs-pdf-demo">
            <button
                type="button"
                className="btn btn-primary btn-sm mb15"
                onClick={() => pdfRef.current?.save()}
            >
                Download sample PDF
            </button>
            <PDFExport ref={pdfRef} paperSize="A4" margin="1cm" fileName="kendo-docs-sample.pdf">
                <div className="kendo-docs-pdf-sheet p19">
                    <h3>RESUL Kendo PDF sample</h3>
                    <p>Export any React subtree wrapped in PDFExport.</p>
                </div>
            </PDFExport>
        </div>
    );
};

export const PagerDemo = () => (
    <ResPager data={DEMO_PAGER_DATA} totalRow={DEMO_PAGER_DATA.length} change={() => { }} />
);

export const IconDropdownDemo = () => {
    const { control } = useDemoForm();
    return (
        <ResKendoIconDropdown
            control={control}
            name="docs_icon_dd"
            data={DEMO_ICON_ITEMS}
            icon={`${circle_dropdown_medium} icon-md`}
        />
    );
};

export const ListboxDemo = () => {
    const [left, setLeft] = useState(DEMO_LISTBOX_LEFT);
    const [right, setRight] = useState(DEMO_LISTBOX_RIGHT);
    return (
        <ResKendoListbox
            leftColumnValues={left}
            rightColumnValues={right}
            getSelectedData={(data) => {
                setLeft(data.leftColumnValues);
                setRight(data.rightColumnValues);
            }}
            textField="name"
        />
    );
};

export const InputDemo = () => {
    const { control } = useDemoForm();
    const [isLoadingDemo, setIsLoadingDemo] = useState(false);

    return (
        <div className="kendo-docs-input-demo">
            <p className="font-sm color-primary-grey mb15">
                Full <strong>ResInput</strong> preview — floating label, required state, loading, password visibility,
                plain-text hint, checkbox + text hint, and <code>rightTooltip</code>.
            </p>
            <DemoVariations>
                <DemoVariation label="Default">
                    <ResInput control={control} name="docs_input_default" label="Campaign name" />
                </DemoVariation>
                <DemoVariation label="Plain text hint & rightTooltip">
                    <ResInput
                        control={control}
                        name="docs_input_text_hint"
                        label="Subject line"
                        smallText="Shown in the inbox preview"
                        rightTooltip="This appears as the email subject for recipients"
                    />
                </DemoVariation>
                <DemoVariation label="Checkbox + text hint & rightTooltip">
                    <ResInput
                        control={control}
                        name="docs_input_checkbox_hint"
                        label="Audience list"
                        smallText={(
                            <span className="d-flex align-items-center flex-wrap gap-2">
                                <ResCheckbox
                                    control={control}
                                    name="docs_input_sync_audience"
                                    labelName="Sync to audience"
                                    inlineFlex
                                    defaultValue={false}
                                />
                                <span>Refreshes every 24 hours when enabled</span>
                            </span>
                        )}
                        rightTooltip="Enable sync to keep this list updated from your data source"
                    />
                </DemoVariation>
                <DemoVariation label="Right tooltip only">
                    <ResInput
                        control={control}
                        name="docs_input_tooltip_only"
                        label="API key"
                        rightTooltip="Generate this key from Preferences → Integrations"
                    />
                </DemoVariation>
                <DemoVariation label="Required with hint & rightTooltip">
                    <ResInput
                        control={control}
                        name="docs_input_required"
                        label="Campaign name"
                        required
                        rules={{ required: 'Campaign name is required' }}
                        smallText="Must be unique per account"
                        rightTooltip="Used in reports and the communication listing"
                    />
                </DemoVariation>
                <DemoVariation label="Loading">
                    <ResInput
                        control={control}
                        name="docs_input_loading"
                        label="Account ID"
                        isLoading={isLoadingDemo}
                    />
                    <div className="mt10">
                        <button
                            type="button"
                            className="btn btn-link p0 font-xs"
                            onClick={() => setIsLoadingDemo((prev) => !prev)}
                        >
                            {isLoadingDemo ? 'Stop loading' : 'Toggle loading'}
                        </button>
                    </div>
                </DemoVariation>
                <DemoVariation label="Password with visibility">
                    <ResInput
                        control={control}
                        name="docs_input_password"
                        label="Password"
                        type="password"
                        viewEye
                        meter
                        defaultValue="Sample1!"
                    />
                </DemoVariation>
                <DemoVariation label="Disabled">
                    <ResInput
                        control={control}
                        name="docs_input_disabled"
                        label="Read-only field"
                        defaultValue="Cannot edit"
                        disabled
                    />
                </DemoVariation>
            </DemoVariations>
            <ul className="kendo-docs-input-demo__props font-xs color-secondary-grey mt15 mb0">
                <li><code>required</code> + <code>rules</code> — red underline segment and validation message in the label</li>
                <li><code>isLoading</code> — inline spinner on the right</li>
                <li><code>viewEye</code> — toggle password visibility</li>
                <li><code>meter</code> — password strength bar below the field</li>
                <li><code>smallText</code> — hint below the field (left): plain string in <code>&lt;small&gt;</code>, HTML/JSX in a div, or a checkbox + label row</li>
                <li><code>rightTooltip</code> — question-mark icon on the right; alone it aligns to the far end of the meta row</li>
            </ul>
        </div>
    );
};

export const SwitchDemo = () => {
    const { control } = useDemoForm();
    return (
        <DemoVariations>
            <DemoVariation label="On (default)">
                <ResSwitch control={control} name="docs_switch_on" defaultValue />
            </DemoVariation>
            <DemoVariation label="Off">
                <ResSwitch control={control} name="docs_switch_off" defaultValue={false} />
            </DemoVariation>
            <DemoVariation label="Custom labels (YES / NO)">
                <ResSwitch control={control} name="docs_switch_custom" defaultValue onLabel="YES" offLabel="NO" />
            </DemoVariation>
            <DemoVariation label="Disabled">
                <ResSwitch control={control} name="docs_switch_disabled" defaultValue disabled />
            </DemoVariation>
        </DemoVariations>
    );
};

export const CustomUploadDemo = () => <ResDDCustomUploadDocsPreview />;

export const CommunicationListingSkeletonDemo = () => <ListTabSkeleton count={4} isLoading showToolbar />;

export const DropdownCheckboxDemo = () => {
    const { control } = useDemoForm();
    return (
        <Row className="align-items-end g-3">
            <Col md={6}>
                <ResKendoDropdown
                    control={control}
                    name="docs_lookup_dd"
                    label="Status"
                    data={[
                        { id: 1, name: 'All' },
                        { id: 2, name: 'Active' },
                        { id: 3, name: 'Paused' },
                    ]}
                    textField="name"
                    dataItemKey="id"
                />
            </Col>
            <Col md={6}>
                <RSCheckbox control={control} name="docs_lookup_cb" labelName="Include archived" />
            </Col>
        </Row>
    );
};

export const ResTooltipDemo = () => {
    const [mdcVisible, setMdcVisible] = useState(true);
    const mdcContainerRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setMdcVisible(true), 150);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="kendo-docs-restooltip-demo">
            <div className="kendo-docs-variations">
                <DemoVariation label='variant="default" - Bootstrap behavior (hover / focus / click)'>
                    <ResTooltip text="Standard app tooltip on icon hover" position="top" className="lh0">
                        <i className={`${circle_question_mark_mini} icon-md color-primary-blue cp`} />
                    </ResTooltip>
                </DemoVariation>

                <DemoVariation label='variant="container" - render inside wrapper'>
                    <ResTooltip variant="container" text="Full communication name shown on overflow" position="top" wrapperTag="span">
                        <span
                            style={{
                                display: 'inline-block',
                                maxWidth: 180,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                            }}
                        >
                            Summer campaign awareness email blast
                        </span>
                    </ResTooltip>
                </DemoVariation>

                <DemoVariation label='variant="mdc" - RSMdcTooltip (MDC edge schedule)'>
                    <div
                        ref={mdcContainerRef}
                        className="position-relative d-inline-flex align-items-center justify-content-center p20 border rounded"
                        style={{ minHeight: 80, minWidth: 120 }}
                    >
                        <ResTooltip
                            variant="mdc"
                            position="top"
                            isDefaultShow={mdcVisible}
                            container={mdcContainerRef}
                            text={
                                <div className="RS-MDC-Tooltip-UI">
                                    <div className="RSpopupHeading">Send email</div>
                                    <div className="RSpopupSubHeading">Wait for 2 day(s)</div>
                                    <div className="RSpopupDate">Jun 18, 2026</div>
                                </div>
                            }
                        >
                            <i className={`${timer_medium} icon-md color-primary-blue cp`} />
                        </ResTooltip>
                    </div>
                </DemoVariation>
            </div>
        </div>
    );
};

export const SkeletonDemo = () => (
    <Row className="g-4">
        <Col md={6}>
            <p className="font-sm color-primary-grey mb10">Listbox skeleton</p>
            <KendoListboxSkeleton />
        </Col>
        <Col md={6}>
            <p className="font-sm color-primary-grey mb10">Communication page skeleton (list tab)</p>
            <div className="kendo-docs-skeleton-scale">
                <CommunicationPageContentSkeleton tabIndex={0} inline />
            </div>
        </Col>
    </Row>
);

const DEMO_MAP = {
    dropdown: DropdownDemo,
    multiselect: MultiselectDemo,
    scheduler: SchedulerDemo,
    daterangepicker: DateRangePickerDemo,
    datepicker: DatepickerDemo,
    timepicker: TimepickerDemo,
    reskendogrid: ResKendoGridDemo,
    restexteditor: ResTextEditorDemo,
    resgrid: ResGridDemo,
    restabber: ResTabberDemo,
    restooltip: ResTooltipDemo,
    restemplatecard: ResTemplateCardDemo,
    pdf: PdfDemo,
    pager: PagerDemo,
    'kendo-icon-dropdown': IconDropdownDemo,
    'kendo-listbox': ListboxDemo,
    'rs-input': InputDemo,
    'rs-switch': SwitchDemo,
    'rs-dd-custom-upload': CustomUploadDemo,
    'communication-listing-grid': CommunicationListingSkeletonDemo,
    'kendo-dd-checkbox': DropdownCheckboxDemo,
    'lookup-text-editor': ResTextEditorDemo,
    'lookup-multiselect-label': MultiselectDemo,
    skeleton: SkeletonDemo,
};

const KendoDocsDemos = ({ demoId }) => {
    const Demo = DEMO_MAP[demoId];
    if (!Demo) {
        return <p className="color-primary-grey">Preview not available for this entry.</p>;
    }
    return <Demo />;
};

KendoDocsDemos.propTypes = {
    demoId: PropTypes.string.isRequired,
};

export default memo(KendoDocsDemos);
