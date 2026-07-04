import { memo } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import { get as _get } from 'Utils/modules/lodashReplacements';

import useQueryParams from 'Hooks/useQueryParams';
import AuthoringChannelEditSkeletonHost from '../authoring/authoringChannelInnerSkeletonLayouts';
import { mdcAuthoringSkeletonCriticalCss } from './mdcAuthoringSkeletonCriticalCss';

const MDC_CHANNEL_STRING_TO_NUMERIC_ID = {
    ch001: 1,
    ch002: 2,
    ch0021: 21,
    ch008: 8,
    ch0014: 14,
    ch0025: 25,
    ch0034: 34,
    ch0026: 26,
    ch003: 3,
    ch0041: 41,
};

export const resolveMdcAuthoringChannelNumericId = (location) => {
    const channelKey = _get(location, 'mdcContentSetupDetails.channelId', 'ch001');
    return MDC_CHANNEL_STRING_TO_NUMERIC_ID[channelKey] ?? 1;
};

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer d-block ${className}`.trim()} style={style} aria-hidden="true" />
);

const MdcAuthoringCampaignInfoSkeleton = () => (
    <div className="mdc-authoring-campaign-info rs-columns-block mdc-header d-flex mt21">
        <div className="mdc-authoring-campaign-info__row">
            <div className="mdc-authoring-campaign-info__cols">
                {['Name', 'Period', 'Type', 'Primary goal', 'Potential audience'].map((key) => (
                    <div key={key} className="mdc-authoring-campaign-info__col">
                        <Shimmer style={{ width: 48, height: 11, marginBottom: 6 }} />
                        <Shimmer style={{ width: '85%', height: 16 }} />
                    </div>
                ))}
            </div>
            <div className="mdc-authoring-campaign-info__actions">
                <Shimmer style={{ width: 36, height: 36, borderRadius: 4 }} />
                <Shimmer style={{ width: 36, height: 36, borderRadius: 4 }} />
            </div>
        </div>
    </div>
);

const MdcAuthoringContentHeaderSkeleton = () => (
    <div className="mdc-authoring-content-header">
        <Shimmer style={{ width: 200, height: 32 }} />
        <Shimmer style={{ width: 120, height: 14 }} />
    </div>
);

/**
 * MDC route / bootstrap load skeleton (no vertical tabs).
 * showPageShell: col-10 + campaign band + channel title (matches CreateMdcCommunication).
 */
export const MdcAuthoringLoadSkeleton = ({ channelId: channelIdProp, showPageShell = true }) => {
    const location = useQueryParams('/communication');
    const channelId = channelIdProp ?? resolveMdcAuthoringChannelNumericId(location);

    const innerForm = <AuthoringChannelEditSkeletonHost channelId={channelId} />;

    const pageContent = showPageShell ? (
        <div className="page-content mdc-authoring-page-content">
            <MdcAuthoringCampaignInfoSkeleton />
            <MdcAuthoringContentHeaderSkeleton />
            {innerForm}
        </div>
    ) : (
        <div className="mdc-authoring-page-content page-content">{innerForm}</div>
    );

    return (
        <>
            <style>{mdcAuthoringSkeletonCriticalCss}</style>
            {showPageShell ? <Container className="col-10">{pageContent}</Container> : pageContent}
        </>
    );
};

MdcAuthoringLoadSkeleton.propTypes = {
    channelId: PropTypes.number,
    showPageShell: PropTypes.bool,
};

/** Route Suspense while JS chunk loads (no top nav — matches hidden RSHeader on create-mdc-communication). */
export const MdcAuthoringSuspenseFallback = () => (
    <div
        className="mdc-authoring-skeleton-scope mdc-authoring-skeleton-scope--no-header"
        aria-busy="true"
        aria-label="Loading MDC channel content"
    >
        <MdcAuthoringLoadSkeleton showPageShell />
    </div>
);

export const MdcAuthoringPageContentSkeleton = ({ wrapScope = true }) => {
    const shell = <MdcAuthoringLoadSkeleton showPageShell />;

    if (!wrapScope) {
        return (
            <div className="mdc-authoring-skeleton-scope" aria-busy="true">
                {shell}
            </div>
        );
    }

    return (
        <div
            className="mdc-authoring-skeleton-scope mdc-authoring-skeleton-scope--no-header"
            aria-busy="true"
            aria-label="Loading MDC channel content"
        >
            {shell}
        </div>
    );
};

/** Initial app shell skeleton for MDC authoring — content only, no MainNavBar. */
export const MdcAuthoringRouteSkeleton = () => (
    <div
        className="mdc-authoring-skeleton-scope mdc-authoring-skeleton-scope--no-header"
        aria-busy="true"
        aria-label="Loading MDC channel content"
    >
        <MdcAuthoringLoadSkeleton showPageShell />
    </div>
);

export default memo(MdcAuthoringPageContentSkeleton);
