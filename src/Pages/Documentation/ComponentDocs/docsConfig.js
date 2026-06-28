import { createElement, lazy } from 'react';
// Eager import — ResKendoGrid does not bundle component SCSS in its entry
import ResKendoGrid from 'Pages/KendoDocs/CommonComponents/ResKendoGrid';
import TruncatedCell from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/TruncateCell';
import ResGridDocsPreview from 'Pages/KendoDocs/CommonComponents/ResGrid/ResGridDocsPreview';
import { RESGRID_DEMO_DEFAULTS } from 'Pages/KendoDocs/CommonComponents/ResGrid/ResGridDocsPreview.constants';
import ResListCardPreview from 'Pages/KendoDocs/CommonComponents/ResGrid/ResListCard/ResListCardPreview';

// Lazy import — avoids compiling restexteditor.scss on unrelated doc routes
const ResTextEditor = lazy(() => import('Pages/KendoDocs/CommonComponents/ResTextEditor'));

// Importing raw source code
import ResKendoGridCode from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/index.jsx?raw';
import ResKendoGridStyle from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/reskendogrid.scss?raw';
import ResTextEditorCode from 'Pages/KendoDocs/CommonComponents/ResTextEditor/index.jsx?raw';
import ResTextEditorStyle from 'Pages/KendoDocs/CommonComponents/ResTextEditor/restexteditor.scss?raw';

// Importing component configurations and props
import {
    PROPS_METADATA as ResKendoGridProps,
    GRID_CONFIG as ResKendoGridConfig,
    FEATURE_MATRIX as ResKendoGridFeatures,
} from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/config';

import {
    PROPS_METADATA as ResTextEditorProps,
    EDITOR_CONFIG as ResTextEditorConfig,
    FEATURE_MATRIX as ResTextEditorFeatures,
} from 'Pages/KendoDocs/CommonComponents/ResTextEditor/config';

import ResGridCode from 'Pages/KendoDocs/CommonComponents/ResGrid/index.jsx?raw';
import ResGridStyle from 'Pages/KendoDocs/CommonComponents/ResGrid/resgrid.scss?raw';
import {
    PROPS_METADATA as ResGridProps,
    GRID_CONFIG as ResGridConfig,
    FEATURE_MATRIX as ResGridFeatures,
} from 'Pages/KendoDocs/CommonComponents/ResGrid/config';

import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';
import ResTabberCode from 'Pages/KendoDocs/CommonComponents/ResTabber/index.jsx?raw';
import ResTabberStyle from 'Pages/KendoDocs/CommonComponents/ResTabber/restabber.scss?raw';
import {
    PROPS_METADATA as ResTabberProps,
    TABBER_CONFIG as ResTabberConfig,
    FEATURE_MATRIX as ResTabberFeatures,
} from 'Pages/KendoDocs/CommonComponents/ResTabber/config';

import ResTooltip from 'Pages/KendoDocs/CommonComponents/ResTooltip';
import ResTooltipCode from 'Pages/KendoDocs/CommonComponents/ResTooltip/index.jsx?raw';
import ResTooltipStyle from 'Pages/KendoDocs/CommonComponents/ResTooltip/restooltip.scss?raw';
import {
    PROPS_METADATA as ResTooltipProps,
    TOOLTIP_CONFIG as ResTooltipConfig,
} from 'Pages/KendoDocs/CommonComponents/ResTooltip/config';

// Mock data for ResKendoGrid preview
const GRID_PREVIEW_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** e.g. 03 Jun,2026 */
const formatGridPreviewDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    return `${day} ${GRID_PREVIEW_MONTHS[d.getMonth()]},${d.getFullYear()}`;
};

const gridPreviewData = [
    { id: 1, name: 'Alice Smith', age: 28, status: 'Active', joinedDate: new Date('2026-06-03') },
    { id: 2, name: 'Bob Johnson', age: 34, status: 'Inactive', joinedDate: new Date('2026-01-15') },
    { id: 3, name: 'Charlie Brown', age: 41, status: 'Active', joinedDate: new Date('2026-11-22') },
];

const gridPreviewColumns = [
    { field: 'id', title: 'ID', width: '80px', filter: 'numeric' },
    { field: 'name', title: 'Name', filter: 'text' },
    { field: 'age', title: 'Age', width: '120px', filter: 'numeric' },
    { field: 'status', title: 'Status', filter: 'text' },
    {
        field: 'joinedDate',
        title: 'Joined Date',
        filter: 'date',
        cell: (props) =>
            createElement(TruncatedCell, {
                value: formatGridPreviewDate(props.dataItem.joinedDate),
                tooltipText: props.dataItem.joinedDate?.toLocaleString?.() ?? '',
                tdProps: props.tdProps,
                className: props.className,
            }),
    },
];

const ResKendoGridUsage = `import ResKendoGrid from 'Pages/KendoDocs/CommonComponents/ResKendoGrid';
import TruncatedCell from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/TruncateCell';

const data = [
  { id: 1, name: 'Alice Smith', age: 28, status: 'Active', joinedDate: new Date('2026-06-03') },
  { id: 2, name: 'Bob Johnson', age: 34, status: 'Inactive', joinedDate: new Date('2026-01-15') },
];

const columns = [
  { field: 'id', title: 'ID', width: '80px', filter: 'numeric' },
  { field: 'name', title: 'Name', filter: 'text' },
  { field: 'age', title: 'Age', width: '120px', filter: 'numeric' },
  { field: 'status', title: 'Status', filter: 'text' },
  // Default columns use TruncatedCell (ellipsis + tooltip on overflow). Override per column:
  // { field: 'notes', truncate: false }
  // Or custom cell with TruncatedCell:
  // { field: 'joinedDate', cell: (props) => (
  //     <TruncatedCell value={String(props.dataItem.joinedDate)} tdProps={props.tdProps} className={props.className} />
  // ) },
];

const MyPage = () => (
  <ResKendoGrid
    variant="advanced"
    data={data}
    columns={columns}
    pageable
    sortable
    filterable
    style={{ height: '400px' }}
  />
);

export default MyPage;`;

const ResTextEditorUsage = `import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';

// Basic usage
const MyPage = () => (
  <ResTextEditor
    variant="standard"
    defaultContent="<p>Hello <strong>world</strong></p>"
    placeholder="Message content"
    onChange={(html) => console.log(html)}
    characterCount
    maxLength={350}
    height={200}
  />
);

// Inject a custom image upload tool from your application
import CustomImageUpload from 'your-app/CustomImageUpload';

const WithCustomUpload = () => (
  <ResTextEditor
    variant="standard"
    imageUploadComponent={CustomImageUpload}
    onChange={(html) => setContent(html)}
  />
);

// Or handle image selection via callback
const WithUploadCallback = () => (
  <ResTextEditor
    onImageUpload={({ view, file }) => {
      // upload file and insert image into the editor
    }}
  />
);

export default MyPage;`;

const ResGridUsage = `import ResGrid from 'Pages/KendoDocs/CommonComponents/ResGrid';
import ListRowCell from 'Pages/KendoDocs/CommonComponents/ResGrid/ListRowCell';
import ListDetailCell from 'Pages/KendoDocs/CommonComponents/ResGrid/ListDetailCell';

const columns = [
  { cell: (props) => <ListRowCell {...props} /> },
];

const ListingPage = () => (
  <ResGrid
    layout="list"
    data={rows}
    columns={columns}
    loading={isLoading}
    pageable
    expandField="expanded"
    onExpandChange={handleExpandChange}
    detail={(props) => <ListDetailCell {...props} onCollapse={handleCollapse} />}
    emptyMessage="No Records Found"
    skeletonRows={5}
  />
);

export default ListingPage;`;

const tabPreviewData = [
    {
        id: 1,
        text: 'Overview',
        component: () => createElement('div', { className: 'p-3' }, 'Overview tab content'),
    },
    {
        id: 2,
        text: 'Details',
        component: () => createElement('div', { className: 'p-3' }, 'Details tab content'),
    },
    {
        id: 3,
        text: 'Settings',
        component: () => createElement('div', { className: 'p-3' }, 'Settings tab content'),
    },
];

const ResTabberUsage = `import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';

const tabData = [
  { id: 1, text: 'Overview', component: () => <div>Overview content</div> },
  { id: 2, text: 'Details', component: () => <div>Details content</div> },
  { id: 3, text: 'Settings', component: () => <div>Settings content</div> },
];

// Default tabs (replaces RSTabber)
const StandardTabs = () => (
  <ResTabber variant="default" tabData={tabData} heading="Section" />
);

// Fluid full-width tabs with overflow dropdown (replaces RSTabberFluid)
const FluidTabs = () => (
  <ResTabber variant="fluid" tabData={tabData} count={7} />
);

// Horizontal scroll tabs (replaces RSTabberSlide)
const SlideTabs = () => (
  <ResTabber variant="slide" tabData={tabData} tabMaxLength={5} />
);

// Smart slide with add/remove (replaces RSTabSlide)
const SmartTabs = () => (
  <ResTabber variant="smartSlide" tabData={tabData} refresh enableTabLabelEdit />
);

export default StandardTabs;`;

/**
 * Registry of all documented components.
 * Adding a new component here automatically registers its route and documentation page.
 */
export const COMPONENT_REGISTRY = [
    {
        componentName: 'reskendogrid',
        title: 'ResKendoGrid',
        component: ResKendoGrid,
        previewProps: {
            data: gridPreviewData,
            columns: gridPreviewColumns,
            variant: 'advanced',
            style: { height: '300px' }
        },
        propsData: ResKendoGridProps,
        configData: ResKendoGridConfig,
        sourceCode: ResKendoGridCode,
        styleCode: ResKendoGridStyle,
        usageCode: ResKendoGridUsage,
        featuresData: ResKendoGridFeatures,
    },
    {
        componentName: 'restexteditor',
        title: 'ResTextEditor',
        component: ResTextEditor,
        previewProps: {
            defaultContent:
                '<p>Welcome to <strong>ResTextEditor</strong>. Try formatting, lists, alignment, and hyperlinks.</p>',
            variant: 'standard',
            height: 200,
            placeholder: 'Message content',
            characterCount: true,
            maxLength: 350,
            responsiveToolbar: true,
        },
        propsData: ResTextEditorProps,
        configData: ResTextEditorConfig.name,
        sourceCode: ResTextEditorCode,
        styleCode: ResTextEditorStyle,
        usageCode: ResTextEditorUsage,
        featuresData: ResTextEditorFeatures,
    },
    {
        componentName: 'resgrid',
        title: 'ResGrid',
        previewComponent: () =>
            createElement(ResGridDocsPreview, RESGRID_DEMO_DEFAULTS),
        propsData: ResGridProps,
        configData: ResGridConfig,
        sourceCode: ResGridCode,
        styleCode: ResGridStyle,
        usageCode: ResGridUsage,
        featuresData: ResGridFeatures,
    },
    {
        componentName: 'restabber',
        title: 'ResTabber',
        component: ResTabber,
        previewProps: {
            variant: 'default',
            tabData: tabPreviewData,
            className: 'rs-tabs',
            activeClass: 'active',
        },
        propsData: ResTabberProps,
        configData: ResTabberConfig,
        sourceCode: ResTabberCode,
        styleCode: ResTabberStyle,
        usageCode: ResTabberUsage,
        featuresData: ResTabberFeatures,
    },
    {
        componentName: 'restooltip',
        title: 'ResTooltip',
        component: ResTooltip,
        previewProps: {
            variant: 'default',
            text: 'Help text on hover',
            position: 'top',
            className: 'lh0',
            children: createElement('i', {
                className: 'icon-rs-circle-question-mark-mini icon-md color-primary-blue',
            }),
        },
        propsData: ResTooltipProps,
        configData: ResTooltipConfig,
        sourceCode: ResTooltipCode,
        styleCode: ResTooltipStyle,
        usageCode: `<ResTooltip text="Help text" position="top">
  <i className="icon-rs-circle-question-mark-mini icon-md color-primary-blue" />
</ResTooltip>`,
    },
    {
        componentName: 'reslistcard',
        title: 'ResListCard',
        previewComponent: ResListCardPreview,
    },
];
