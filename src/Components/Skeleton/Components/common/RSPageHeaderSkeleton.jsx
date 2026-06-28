import { memo } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

/** Left title shimmer height — all RSPageHeaderSkeleton variants. */
export const PAGE_HEADER_TITLE_HEIGHT = 32;

/** Right menu / dropdown / back shimmer height — all RSPageHeaderSkeleton variants. */
export const PAGE_HEADER_RIGHT_MENU_HEIGHT = 24;

/**
 * Matches RSPageHeader (`main-heading-wrapper`) while route content is loading.
 * Uses `skeleton-shimmer` bars so the header is visible before app.scss / react-loading-skeleton theme load.
 * @param variant - `tabber`, `dashboard`, `audience`, `addAudience`, `addImportAudience`, `targetListCreation`, `dynamicListCreation`, `csr` (analytics report), `detail` (detail analytics)
 */
const SkelBar = ({ width, height, circle = false }) => (
    <span
        className={`skeleton-shimmer skeleton-page-header-bar${circle ? ' skeleton-page-header-bar--circle' : ''}`}
        style={{
            width,
            height,
            backgroundColor: '#e2e7ee',
            cursor: 'not-allowed',
            pointerEvents: 'auto',
        }}
        aria-hidden="true"
    />
);

const withRightMenuBlocks = (...widths) =>
    widths.map((width) => ({ width, height: PAGE_HEADER_RIGHT_MENU_HEIGHT }));

const RIGHT_BLOCKS_BY_VARIANT = {
    tabber: withRightMenuBlocks(120, 100),
    dashboard: withRightMenuBlocks(150, 120, 100, 90),
    audience: withRightMenuBlocks(120, 100),
    addAudience: withRightMenuBlocks(120, 100, 52),
    addImportAudience: withRightMenuBlocks(120, 100, 52),
    targetListCreation: withRightMenuBlocks(120, 100, 52),
    dynamicListCreation: withRightMenuBlocks(120, 100, 52),
    csr: withRightMenuBlocks(100, 100, 100),
    detail: withRightMenuBlocks(100, 90, 72),
    communicationCreation: withRightMenuBlocks(120, 100),
    consumption: withRightMenuBlocks(120, 100, 90, 70),
    consumptionChannel: withRightMenuBlocks(120, 100, 90, 90, 72),
    dataExchange: withRightMenuBlocks(120, 100, 72),
};

const RSPageHeaderSkeleton = ({
    variant = 'tabber',
    className = '',
    titleWidth: titleWidthProp,
    showBack = false,
    embedInPageShell = false,
}) => {
    const resolvedVariant =
        variant === 'add-audience'
            ? 'addAudience'
            : variant === 'add-import-audience'
              ? 'addImportAudience'
              : variant === 'create-target-list' || variant === 'target-list-creation'
                ? 'targetListCreation'
                : variant === 'create-dynamic-list' || variant === 'dynamic-list-creation'
                  ? 'dynamicListCreation'
                  : variant;

    const wrapperClass = [
        'main-heading-wrapper',
        'mb0',
        'rs-page-header-skeleton',
        resolvedVariant === 'csr' || resolvedVariant === 'detail' ? 'csr-page-header' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const rightBlocks =
        showBack &&
        resolvedVariant !== 'consumption' &&
        resolvedVariant !== 'consumptionChannel' &&
        resolvedVariant !== 'addAudience' &&
        resolvedVariant !== 'addImportAudience' &&
        resolvedVariant !== 'targetListCreation' &&
        resolvedVariant !== 'dynamicListCreation' &&
        resolvedVariant !== 'dataExchange'
            ? withRightMenuBlocks(72)
            : RIGHT_BLOCKS_BY_VARIANT[resolvedVariant] ?? RIGHT_BLOCKS_BY_VARIANT.tabber;

    const isCsrLayout = resolvedVariant === 'csr' || resolvedVariant === 'detail';
    const rightColumnAlignClass = isCsrLayout ? 'align-items-end' : 'align-items-center';

    const titleWidth =
        titleWidthProp ??
        (resolvedVariant === 'dashboard'
            ? 280
            : resolvedVariant === 'audience'
              ? 200
              : resolvedVariant === 'addAudience'
                ? 150
                : resolvedVariant === 'addImportAudience'
                  ? 200
                  : resolvedVariant === 'targetListCreation'
                    ? 165
                    : resolvedVariant === 'dynamicListCreation'
                      ? 175
                      : resolvedVariant === 'communicationCreation'
                        ? 300
                        : 220);

    const leftContent =
        resolvedVariant === 'csr' ? (
            <h1 className="repo-title">
                <SkelBar width={80} height={24} />
                <div className="mh-wrapper d-flex align-items-center gap-2 mt5">
                    <span className="mh-text">
                        <SkelBar width={320} height={24} />
                    </span>
                    <SkelBar width={150} height={24} />
                </div>
            </h1>
        ) : resolvedVariant === 'detail' ? (
            <h1 className="repo-title">
                <div className="mh-wrapper d-flex align-items-center gap-2">
                    <span className="mh-text">
                        <SkelBar width={140} height={24} />
                    </span>
                    <SkelBar width={200} height={24} />
                </div>
            </h1>
        ) : resolvedVariant === 'audience' ? (
            <h1 className="repo-title">
                <div className="mh-wrapper d-flex">
                    <span className="mh-text">
                        <SkelBar width={titleWidth} height={PAGE_HEADER_TITLE_HEIGHT} />
                    </span>
                </div>
            </h1>
        ) : (
            <div className="heading-title-text">
                <h1>
                    <SkelBar width={titleWidth} height={PAGE_HEADER_TITLE_HEIGHT} />
                </h1>
            </div>
        );

    const headerInner = embedInPageShell ? (
        <div className="mhw-container">
            <div className="mhwc-left">{leftContent}</div>
            <div
                className={`mhwc-right position-relative d-flex ${rightColumnAlignClass}`}
                style={{ gap: 12 }}
            >
                {rightBlocks.map((block, index) => (
                    <SkelBar key={index} width={block.width} height={block.height} />
                ))}
            </div>
        </div>
    ) : (
        <Container className="mhw-container">
            <div className="mhwc-left">{leftContent}</div>
            <div
                className={`mhwc-right position-relative d-flex ${rightColumnAlignClass}`}
                style={{ gap: 12 }}
            >
                {rightBlocks.map((block, index) => (
                    <SkelBar key={index} width={block.width} height={block.height} />
                ))}
            </div>
        </Container>
    );

    if (embedInPageShell) {
        return <div className={wrapperClass}>{headerInner}</div>;
    }

    return <Container fluid className={wrapperClass}>{headerInner}</Container>;
};

RSPageHeaderSkeleton.propTypes = {
    variant: PropTypes.oneOf([
        'tabber',
        'dashboard',
        'audience',
        'addAudience',
        'addImportAudience',
        'targetListCreation',
        'dynamicListCreation',
        'csr',
        'detail',
        'communicationCreation',
        'consumption',
        'consumptionChannel',
        'dataExchange',
    ]),
    className: PropTypes.string,
    titleWidth: PropTypes.number,
    showBack: PropTypes.bool,
    /** When true, render inside `.container.px0` (no outer `container-fluid`) for column alignment with page body. */
    embedInPageShell: PropTypes.bool,
};

export default memo(RSPageHeaderSkeleton);
