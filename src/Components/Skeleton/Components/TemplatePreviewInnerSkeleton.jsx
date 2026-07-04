import { Col, Row } from 'react-bootstrap';

import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

import { templatePreviewInnerSkeletonCriticalCss } from './templatePreviewInnerSkeletonCriticalCss';

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer ${className}`.trim()} style={style} aria-hidden="true" />
);

const LOADING_LINE_COUNT = 16;
const NO_DATA_TOP_LINE_COUNT = 3;
const NO_DATA_BOTTOM_LINE_COUNT = 5;

const TemplatePreviewLines = ({ count, keyPrefix }) =>
    Array.from({ length: count }, (_, index) => (
        <Shimmer
            key={`${keyPrefix}-${index}`}
            className="template-preview-inner-skeleton__canvas-line"
        />
    ));

const TemplatePreviewLoadingCanvas = () => (
    <>
        <Shimmer className="template-preview-inner-skeleton__canvas-header" />
        <TemplatePreviewLines count={LOADING_LINE_COUNT} keyPrefix="template-preview-canvas-line" />
    </>
);

const TemplatePreviewNoDataCanvas = () => (
    <>
        <Shimmer className="template-preview-inner-skeleton__canvas-header" />
        <TemplatePreviewLines count={NO_DATA_TOP_LINE_COUNT} keyPrefix="template-preview-canvas-top-line" />
        <div className="template-preview-inner-skeleton__no-data-panel" role="status" aria-live="polite">
            <NoDataAvailableRender className="nodata-skeleton-con template-preview-inner-skeleton__no-data" />
        </div>
        <TemplatePreviewLines count={NO_DATA_BOTTOM_LINE_COUNT} keyPrefix="template-preview-canvas-bottom-line" />
    </>
);

/** Matches Email → Template preview: inbox row, toolbar, and inner EDM canvas while FetchTemplateById loads. */
const TemplatePreviewInnerSkeleton = ({ showBrowserToolbar = true, showNoData = false }) => (
    <>
        <style>{templatePreviewInnerSkeletonCriticalCss}</style>
        <div
            className={`template-preview-inner-skeleton-scope${
                showNoData ? ' template-preview-inner-skeleton-scope--no-data' : ''
            }`}
            aria-busy={!showNoData}
            aria-label={showNoData ? 'Template preview unavailable' : 'Loading template preview'}
        >
            {showBrowserToolbar && !showNoData && (
                <>
                    <div className="form-group mt30 template-preview-inner-skeleton__inbox-row">
                        <Row>
                            <Col sm={3} className="ml15" style={{ width: '20%' }}>
                                <Shimmer className="template-preview-inner-skeleton__inbox-label" />
                            </Col>
                            <Col sm={6} style={{ width: '540px', maxWidth: '100%' }}>
                                <Shimmer className="template-preview-inner-skeleton__inbox-field" />
                                <Shimmer className="template-preview-inner-skeleton__inbox-hint" />
                            </Col>
                        </Row>
                    </div>

                    <div className="template-preview-inner-skeleton__toolbar">
                        <Shimmer className="template-preview-inner-skeleton__vib-text" />
                        <Shimmer className="template-preview-inner-skeleton__checkbox" />
                        <Shimmer className="template-preview-inner-skeleton__icon" />
                        <Shimmer className="template-preview-inner-skeleton__icon" />
                    </div>
                </>
            )}

            <div className="edm-import-wrapper EDM-template-preview template-preview-inner-skeleton__edm">
                <div className="template-preview-inner-skeleton__canvas">
                    {showNoData ? <TemplatePreviewNoDataCanvas /> : <TemplatePreviewLoadingCanvas />}
                </div>
            </div>
        </div>
    </>
);

export default TemplatePreviewInnerSkeleton;
