import { memo } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { CommonSkeleton } from './SkeletonOverall';
import { BreadcrumbSkeleton, skeletonShellSharedCriticalCss } from './common';
import { MainNavBar, pageLayoutSkeletonCriticalCss } from './common/pageLoadingScene';

const LAUNCH_PAD_BOTTOM_TILE_COUNT = 4;

export const launchPadSkeletonCriticalCss = `
.launchpad-skeleton-scope .main-heading-wrapper .heading-title-text h1 .react-loading-skeleton {
    border-radius: 4px;
}
.launchpad-skeleton-scope .box-design {
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    padding: var(--boxDesignBodySpace, 30px);
}
.launchpad-skeleton-scope .rs-launchpad-block .col {
    border-left: 2px solid #fff;
}
.launchpad-skeleton-scope .rs-launchpad-block .launchpad-skeleton-tile {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    margin: auto;
    padding: 50px 10px;
    text-decoration: none;
    border-radius: 5px;
    pointer-events: none;
    cursor: default;
}
.launchpad-skeleton-scope .rs-launchpad-block.rlb-01 .launchpad-skeleton-tile {
    background: #f0f8ff;
}
.launchpad-skeleton-scope .rs-launchpad-block.rlb-01 .launchpad-skeleton-tile .icon-holder .react-loading-skeleton {
    border: 1px solid #e2e7ee;
    border-radius: 50%;
}
.launchpad-skeleton-scope .rs-launchpad-block.rlb-02 {
    margin-top: 40px;
}
.launchpad-skeleton-scope .rs-launchpad-block.rlb-02 .col {
    border-left: 1px solid #e9e9e9;
}
.launchpad-skeleton-scope .rs-launchpad-block.rlb-02 .launchpad-skeleton-tile {
    background: transparent;
}
.launchpad-skeleton-scope .rs-launchpad-block .text-holder {
    margin-top: 10px;
}
.launchpad-skeleton-scope .rs-launchpad-block.rlb-02 .launchpad-skeleton-tile .text-holder .react-loading-skeleton {
    margin: 0 auto;
}
`;

const LaunchPadTileSkeleton = ({ isTopRow = false, colClassName = '' }) => (
    <Col className={colClassName}>
        <a className="launchpad-skeleton-tile" tabIndex={-1} aria-hidden="true" onClick={(event) => event.preventDefault()}>
            <span className="icon-holder">
                <CommonSkeleton circle width={52} height={52} stopAnimation />
            </span>
            <span className="text-holder">
                <CommonSkeleton box width={128} height={24} stopAnimation />
            </span>
        </a>
    </Col>
);

LaunchPadTileSkeleton.propTypes = {
    isTopRow: PropTypes.bool,
    colClassName: PropTypes.string,
};

const LaunchPadPageHeaderSkeleton = () => (
    <Container fluid className="main-heading-wrapper pt78 px0">
        <Container className="mhw-container">
            <div className="mhwc-left">
                <div className="heading-title-text">
                    <h1>
                        <CommonSkeleton box width={420} height={36} stopAnimation />
                    </h1>
                </div>
            </div>
        </Container>
    </Container>
);

export const LaunchPadPageContentSkeleton = () => (
    <div className='page-content'>
        <Container className=" px0">
            <LaunchPadPageHeaderSkeleton />

            <div className="box-design mt20">
                <div className="rs-launchpad-block rlb-01">
                    <Row>
                        <LaunchPadTileSkeleton isTopRow colClassName="pr0 border-0" />
                        <LaunchPadTileSkeleton isTopRow colClassName="p0" />
                        <LaunchPadTileSkeleton isTopRow colClassName="pl0" />
                    </Row>
                </div>
                <div className="rs-launchpad-block rlb-02 mt40">
                    <Row>
                        {Array.from({ length: LAUNCH_PAD_BOTTOM_TILE_COUNT }, (_, index) => (
                            <LaunchPadTileSkeleton
                                key={`launchpad-bottom-tile-${index}`}
                                colClassName={index === 0 ? 'border-0' : ''}
                            />
                        ))}
                    </Row>
                </div>
            </div>
        </Container></div>
);

const LaunchPadRouteSkeleton = ({ withAppShell = false, activeNavIndex = -1 }) => {
    const body = (
        <Container fluid>
            <LaunchPadPageContentSkeleton />
        </Container>
    );

    if (withAppShell) {
        return (
            <>
                <style>{pageLayoutSkeletonCriticalCss}</style>
                <style>{skeletonShellSharedCriticalCss}</style>
                <style>{launchPadSkeletonCriticalCss}</style>
                <div
                    className="page-content-holder launchpad-skeleton-scope page-layout-skeleton--inline"
                    aria-busy="true"
                    aria-label="Loading launch pad"
                >
                    <MainNavBar activeNavIndex={activeNavIndex} inline />
                    {body}
                </div>
            </>
        );
    }

    return (
        <div className="page-content-holder launchpad-skeleton-scope" aria-busy="true" aria-label="Loading launch pad">
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{launchPadSkeletonCriticalCss}</style>
            <BreadcrumbSkeleton />
            {body}
        </div>
    );
};

LaunchPadRouteSkeleton.propTypes = {
    withAppShell: PropTypes.bool,
    activeNavIndex: PropTypes.number,
};

export const LaunchPadSuspenseFallback = memo(LaunchPadRouteSkeleton);

export default memo(LaunchPadRouteSkeleton);
