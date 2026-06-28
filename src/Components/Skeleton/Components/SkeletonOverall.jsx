import { scolor1, scolor2, sspace, themeSizeSm, widthFill } from './constants';
import { alert_medium, arrow_left_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import GridLoadingSkeleton from 'Components/RSCustomKendoGrid/GridLoadingSkeleton';
import ResKendoGridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import Icon from 'Components/Icon/Icon';
import { useSelector } from 'react-redux';
import { NO_APPROVER, NO_COMMUNICATION_APPROVER } from 'Constants/GlobalConstant/Placeholders';
import ListAqusitionSekelton from './ListAqusitionSekelton';

// No data
export const NoData = ({ text, className, isShowIcon = true }) => {
    return <NoDataAvailableRender className={className ? className : ''} message={text} isShowIcon={isShowIcon} />;
};

export const SkeletonNoData = (props) => {
    return (
        <div className={`no-data area full skeleton-center ${props.mainClass ? props.mainClass : ''}`}>
            <NoDataAvailableRender />
        </div>
    );
};

// Common Skeleton
export const CommonSkeleton = (props) => {
    const { space, height, circle, width, box, checkbox, icon, className, active, tabspace, mainClass, style } = props;
    return (
        <div
            className={`${space ? sspace : ''} ${tabspace ? 'mb5' : ''} ${mainClass ? mainClass : ''}`}
            style={style}
        >
            {circle && (
                <Skeleton
                    circle={true}
                    className={`${className ? className : ''} ${active ? 'active' : ''}`}
                    height={height ?? 31}
                    width={width ?? 31}
                    enableAnimation={!props?.stopAnimation}
                />
            )}

            {box && (
                <Skeleton
                    className={`${className ? className : ''} ${active ? 'active' : ''}`}
                    height={height ?? 31}
                    width={width ?? widthFill}
                    enableAnimation={!props?.stopAnimation}
                />
            )}

            {checkbox && (
                <div className="circle-line">
                    <Skeleton
                        circle={true}
                        className={`${active ? 'active' : ''}`}
                        height={height ?? 20}
                        width={width ?? 20}
                        enableAnimation={!props?.stopAnimation}
                    />
                    <Skeleton
                        className={`${active ? 'active' : ''}`}
                        height={height ?? 20}
                        width={width ?? widthFill}
                        enableAnimation={!props?.stopAnimation}
                    />
                </div>
            )}

            {icon && (
                <Skeleton
                    circle={true}
                    className={`${active ? 'active' : ''} ${className ? className : ''}`}
                    height={height ?? 31}
                    width={width ?? 31}
                    enableAnimation={!props?.stopAnimation}
                />
            )}
        </div>
    );
};
export const CustomSkeleton = ({ isError, count, text = 'No data available', height, isShowIcon = true }) => {
    return (
        <div className="skeleton-span-con p0">
            {isError && <NoData text={text} isShowIcon={isShowIcon} />}
            {Array(count)
                .fill(0)
                .map((_, index) => {
                    return (
                        <Fragment key={index}>
                            <CommonSkeleton box space height={height ? height : 35} />
                        </Fragment>
                    );
                })}
        </div>
    );
};

export const LiveUserStatusSkeleton = ({ isError }) => {
    return (
        <div className="skeleton-span-con mb20">
            {isError && <NoData />}
            <Row>
                <Col md={12}>
                    <Row>
                        {/* <Col md={12}>
                            <Row>
                                <Col md={5} className='pr0'><CommonSkeleton box height={25} space /></Col>
                                <Col md={3} className='pl5'><CommonSkeleton box height={25} space /></Col>
                            </Row>
                        </Col> */}
                        <Col md={12}>
                            <Row>
                                <Col md={9}>
                                    <Row>
                                        <Col md={5} className="pr0 mb5">
                                            <CommonSkeleton box height={37} />
                                        </Col>
                                        <Col md={7} className="pl5 mb5">
                                            <CommonSkeleton box height={37} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={5} className="pr0 mb5">
                                            <CommonSkeleton box height={37} />
                                        </Col>
                                        <Col md={6} className="pl5 mb5">
                                            <CommonSkeleton box height={37} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={5} className="pr0 mb5">
                                            <CommonSkeleton box height={37} />
                                        </Col>
                                        <Col md={5} className="pl5 mb5">
                                            <CommonSkeleton box height={37} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={5} className="mb20">
                                            <CommonSkeleton box height={37} space />
                                        </Col>
                                        <Col md={4} className="mb20">
                                            <CommonSkeleton box height={37} space />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="mb15" md={{ span: 5, offset: 2 }}>
                                            <CommonSkeleton box height={15} space />
                                        </Col>
                                        <Col className="mb15" md={5}>
                                            <CommonSkeleton box height={15} space />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col md={3}>
                                    <CommonSkeleton box height={71} />
                                </Col>
                            </Row>
                        </Col>
                        <Col md={12}>
                            <Row>
                                <Col md={6}>
                                    <CommonSkeleton box height={15} />
                                </Col>
                                <Col md={6}>
                                    <CommonSkeleton box height={15} />
                                </Col>
                            </Row>
                        </Col>
                        <Col md={12}>
                            <Row>
                                <Col md={6}>
                                    <CommonSkeleton box height={45} space />
                                </Col>
                                <Col md={6}>
                                    <CommonSkeleton box height={45} space />
                                </Col>
                            </Row>
                        </Col>
                        {/* <Col md={9}><CommonSkeleton box height={30} space /></Col>
                        <Col md={12}><CommonSkeleton box height={35} className='mb20' /></Col> */}
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export const ReachChannelSkeleton = (props) => {
    const { isError, children } = props;
    const [data, updateData] = useState('No data available');
    return (
        <div className={`skeleton-span-con ${props?.className ?? ''}`}>
            <div>
                {props.nodata ? <NoData /> : null}
                {isError ? (
                    children ? (
                        children
                    ) : (
                        <div className="nodata-bar">
                            <Icon icon={alert_medium} size="md" color="color-primary-orange" nocp />
                            <p> {data}</p>
                        </div>
                    )
                ) : null}
            </div>
            <Row>
                <Col md={12}>
                    <CommonSkeleton box height={54} stopAnimation={isError}/>
                    <CommonSkeleton box height={54} stopAnimation={isError}/>
                    <CommonSkeleton box height={54} stopAnimation={isError}/>
                    <CommonSkeleton box height={54} stopAnimation={isError}/>
                </Col>
            </Row>
        </div>
    );
};

export const DetailOverviewHeadSkeleton = (props) => {
    return (
        <div className="skeleton-span-con">
            <Row>
                <Col md={10} className="pr2">
                    <CommonSkeleton box height={33} />
                </Col>
                <Col md={1} className="px4">
                    <CommonSkeleton box height={33} />
                </Col>
                <Col md={1} className="pl2">
                    <CommonSkeleton box height={33} />
                </Col>
            </Row>
        </div>
    );
};

export const DetailKeyMetricSkeleton = (props) => {
    const { isError, nodata, children, hideInternalNoData } = props;
    const freezeAnimation = Boolean(isError || nodata);
    const showNoData = (isError || nodata) && !hideInternalNoData;

    return (
        <div className="skeleton-span-con position-relative">
            {showNoData && (
                <div
                    className="position-absolute d-flex align-items-center justify-content-center w-100 h-100"
                    style={{ top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}
                >
                    {children || <NoData />}
                </div>
            )}
            <Row>
                <Col md={6} className="text-center">
                    <CommonSkeleton box height={37} width={120} stopAnimation={freezeAnimation} />
                    <CommonSkeleton box height={15} width={80} stopAnimation={freezeAnimation} />
                </Col>
                <Col md={6} className='text-center'>
                <CommonSkeleton box height={37} width={120} stopAnimation={freezeAnimation} />
                <CommonSkeleton box height={15} width={80} stopAnimation={freezeAnimation} />
                </Col>
            </Row>
            <Row>
                <Col md={12} className='text-center'>
                    <CommonSkeleton box height={15} width={150} stopAnimation={freezeAnimation} />
                </Col>
            </Row>
            <Row>
                <Col md={4} className="pr0">
                    <CommonSkeleton box height={37} stopAnimation={freezeAnimation} />
                    <CommonSkeleton box height={15} stopAnimation={freezeAnimation} />
                </Col>
                <Col md={4} className="pr0">
                    <CommonSkeleton box height={37} stopAnimation={freezeAnimation} />
                    <CommonSkeleton box height={15} stopAnimation={freezeAnimation} />
                </Col>
                <Col md={4}>
                    <CommonSkeleton box height={37} stopAnimation={freezeAnimation} />
                    <CommonSkeleton box height={15} stopAnimation={freezeAnimation} />
                </Col>
            </Row>
            <Row>
                <Col md={6} className="text-center">
                    <CommonSkeleton box height={37} width={120} stopAnimation={freezeAnimation} />
                    <CommonSkeleton box height={15} width={80} stopAnimation={freezeAnimation} />
                </Col>
                <Col md={6} className='text-center'>
                <CommonSkeleton box height={37} width={120} stopAnimation={freezeAnimation} />
                <CommonSkeleton box height={15} width={80} stopAnimation={freezeAnimation} />
                </Col>
            </Row>
            <Row>
                <Col md={12} className='text-center'>
                    <CommonSkeleton box height={15} width={150} stopAnimation={freezeAnimation} />
                </Col>
            </Row>
            <Row>
                <Col md={4} className="pr0">
                    <CommonSkeleton box height={37} stopAnimation={freezeAnimation} />
                    <CommonSkeleton box height={15} stopAnimation={freezeAnimation} />
                </Col>
                <Col md={4} className="pr0">
                    <CommonSkeleton box height={37} stopAnimation={freezeAnimation} />
                    <CommonSkeleton box height={15} stopAnimation={freezeAnimation} />
                </Col>
                <Col md={4}>
                    <CommonSkeleton box height={37} stopAnimation={freezeAnimation} />
                    <CommonSkeleton box height={15} stopAnimation={freezeAnimation} />
                </Col>
            </Row>
        </div>
    );
};

export const Audience360Top5Skeleton = (props) => {
    const { isError, children, variant = 'default' } = props;
    const [data] = useState('No data available');

    if (variant === 'channelList') {
        return (
            <div className="skeleton-span-con">
                <div>
                    {props.nodata ? <NoData /> : null}
                    {isError ? (
                        children ? (
                            children
                        ) : (
                            <div className="nodata-bar">
                                <Icon icon={alert_medium} size="md" color="color-primary-orange" nocp />
                                <p>{data}</p>
                            </div>
                        )
                    ) : null}
                </div>
                <Row className="m0">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Col className="channelListView noDataAvailable" key={`a360-top5-${index}`}>
                            <CommonSkeleton box height={135} width="100%" stopAnimation={Boolean(isError)} />
                        </Col>
                    ))}
                </Row>
            </div>
        );
    }

    return (
        <div className="skeleton-span-con">
            <div>
                {props.nodata ? <NoData /> : null}
                {isError ? (
                    children ? (
                        children
                    ) : (
                        <div className="nodata-bar">
                            <Icon icon={alert_medium} size="md" color="color-primary-orange" nocp />
                            <p>{data}</p>
                        </div>
                    )
                ) : null}
            </div>
            <Row>
                <Col className="pr10">
                    <CommonSkeleton box height={135} stopAnimation={Boolean(isError)} />
                </Col>
                <Col className="pr10">
                    <CommonSkeleton box height={135} stopAnimation={Boolean(isError)} />
                </Col>
                <Col className="pr10">
                    <CommonSkeleton box height={135} stopAnimation={Boolean(isError)} />
                </Col>
                <Col className="pr10">
                    <CommonSkeleton box height={135} stopAnimation={Boolean(isError)} />
                </Col>
                <Col>
                    <CommonSkeleton box height={135} stopAnimation={Boolean(isError)} />
                </Col>
            </Row>
        </div>
    );
};

export { AudienceAnalytics360PageSkeleton } from '../pages/analytics/AnalyticsPageSkeleton';

export const CSRDeviceSkeleton = (props) => {
    const { isError, children } = props;
    const [data, updateData] = useState('No data available');
    return (
        <div className="skeleton-span-con">
            <div>
                {props.nodata ? <NoData className={'mt-16'} /> : null}
                {isError ? (
                    children ? (
                        children
                    ) : (
                        <div className="nodata-bar">
                            <Icon icon={alert_medium} size="md" color="color-primary-orange" nocp />
                            <p>{data}</p>
                        </div>
                    )
                ) : null}
            </div>
            <Row>
                <Col md={6} className="pr2">
                    <CommonSkeleton box height={130} stopAnimation={props?.nodata} />
                </Col>
                <Col md={6} className="pl4">
                    <CommonSkeleton box space height={80} stopAnimation={props?.nodata} />
                    <CommonSkeleton box height={45} stopAnimation={props?.nodata} />
                </Col>
            </Row>
        </div>
    );
};

export const DetailOverviewSkeleton = (props) => {
    const { isError, children } = props;
    const [data, updateData] = useState('No data available');
    return (
        <div className="skeleton-span-con">
            <div>
                {props.nodata ? <NoData /> : null}
                {isError ? (
                    children ? (
                        children
                    ) : (
                        <div className="nodata-bar">
                            <Icon icon={alert_medium} size="md" color="color-primary-orange" nocp />
                            <p>{data}</p>
                        </div>
                    )
                ) : null}
            </div>
            <Row>
                <Col md={4} className="pr2">
                    <CommonSkeleton box space height={187} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                </Col>
                <Col md={4} className="px4">
                    <CommonSkeleton box space height={187} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                </Col>
                <Col md={4} className="pl2">
                    <CommonSkeleton box space height={187} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                    <CommonSkeleton box space height={33} stopAnimation={isError} />
                </Col>
            </Row>
        </div>
    );
};

export const CampaignSummarySkeleton = () => {
    return (
        <div className="skeleton-span-con">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="dflex width100p">
                <div className="skeleton-span width50p" style={{ height: 200 }}>
                    <Skeleton />
                </div>
                <div className="skeleton-span fill">
                    <Skeleton />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton />
                </div>
            </div>
            <hr />
            <div className="width100p">
                <div className="skeleton-span fill width100p">
                    <Skeleton height={60} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={40} />
                </div>
            </div>
        </div>
    );
};

export const AudienceSummarySkeleton = () => {
    return (
        <div className="skeleton-span-con">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="width100p">
                <div className="skeleton-span fill width100p">
                    <Skeleton height={90} />
                    <hr className={`height${themeSizeSm}`} />
                </div>
            </div>
            <div className="dflex width100p">
                <div className="skeleton-span width50p" style={{ height: 200 }}>
                    <div className="mt25 ml40">
                        <Skeleton circle={true} width={170} height={170} />
                    </div>
                </div>
                <div className="skeleton-span fill">
                    <Skeleton height={30} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={179} />
                </div>
            </div>
        </div>
    );
};

export const CampaignStatusSkeleton = () => {
    return (
        <div className="skeleton-span-con">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="dflex width100p">
                <div className="skeleton-span fill width100p mr5">
                    <Skeleton height={96} />
                </div>
                <div className="skeleton-span fill width100p mr5">
                    <Skeleton height={96} />
                </div>
                <div className="skeleton-span fill width100p">
                    <Skeleton height={96} />
                </div>
            </div>
            <hr />
            <div className="dflex width100p">
                <div className="skeleton-span fill">
                    <div className="mr5">
                        <Skeleton height={105} />
                    </div>
                    <hr className={`height${themeSizeSm}`} />
                    <div className="mr5">
                        <Skeleton height={102} />
                    </div>
                </div>
                <div className="skeleton-span fill">
                    <Skeleton height={105} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={102} />
                </div>
            </div>
        </div>
    );
};

export const AttributeUtilisationSkeleton = () => {
    return (
        <div className="skeleton-span-con">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="dflex width100p">
                <div className="skeleton-span fill width100p mr5">
                    <Skeleton height={96} />
                </div>
                <div className="skeleton-span fill width100p mr5">
                    <Skeleton height={96} />
                </div>
                <div className="skeleton-span fill width100p">
                    <Skeleton height={96} />
                </div>
            </div>
            <hr />
            <div className="dflex width100p">
                <div className="skeleton-span fill">
                    <div className="mr5">
                        <Skeleton height={105} />
                    </div>
                    <hr className={`height${themeSizeSm}`} />
                    <div className="mr5">
                        <Skeleton height={102} />
                    </div>
                </div>
                <div className="skeleton-span fill">
                    <Skeleton height={105} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={102} />
                </div>
            </div>
        </div>
    );
};

export const TopProductTypesSkeleton = () => {
    return (
        <div className="skeleton-span-con p0">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="dflex width100p">
                <div className="skeleton-span width50p" style={{ height: 200 }}>
                    <div className="mt60 ml20">
                        <Skeleton circle={true} width={200} height={200} />
                    </div>
                </div>
                <div className="skeleton-span fill">
                    <Skeleton height={40} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={268} />
                </div>
            </div>
        </div>
    );
};

export const TopProductTypesSkeletonChartData = () => {
    return (
        <>
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="mt60 ml20">
                <Skeleton circle={true} width={200} height={200} />
            </div>
        </>
    );
};

export const TopProductTypesSkeletonTableData = () => {
    return (
        <div className="skeleton-span-con p0">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="dflex width100p">
                <div className="skeleton-span fill">
                    <Skeleton height={40} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={268} />
                </div>
            </div>
        </div>
    );
};

export const TopCampaignTypesSkeleton = () => {
    return (
        <div className="skeleton-span-con p0">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="dflex width100p">
                <div className="skeleton-span width50p">
                    <Skeleton />
                </div>
                <div className="skeleton-span fill">
                    <Skeleton height={40} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={268} />
                </div>
            </div>
        </div>
    );
};

export const CampaignDeliveryMethodSkeleton = () => {
    return (
        <div className="skeleton-span-con">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="dflex width100p">
                <div className="skeleton-span fill width100p mr5">
                    <Skeleton height={96} />
                </div>
                <div className="skeleton-span fill width100p mr5">
                    <Skeleton height={96} />
                </div>
                <div className="skeleton-span fill width100p">
                    <Skeleton height={96} />
                </div>
            </div>
            <hr />
            <div className="dflex width100p">
                <div className="skeleton-span fill">
                    <div className="mr5">
                        <Skeleton height={103} />
                    </div>
                    <hr className={`height${themeSizeSm}`} />
                    <div className="mr5">
                        <Skeleton height={104} />
                    </div>
                </div>
                <div className="skeleton-span fill">
                    <Skeleton height={103} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={104} />
                </div>
            </div>
        </div>
    );
};

export const PlatformUitlizationSkeleton = () => {
    return (
        <div className="skeleton-span-con">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="dflex width100p">
                <div className="skeleton-span fill">
                    <div className="mr5">
                        <Skeleton height={154} />
                    </div>
                    <hr className={`height${themeSizeSm}`} />
                    <div className="mr5">
                        <Skeleton height={154} />
                    </div>
                </div>
                <div className="skeleton-span fill">
                    <Skeleton height={154} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={154} />
                </div>
            </div>
        </div>
    );
};

export const CampaignPerformanceSkeleton = () => {
    return (
        <div className="skeleton-span-con">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="width100p">
                <div className="skeleton-span fill width100p">
                    <Skeleton height={60} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={35} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={60} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={35} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={60} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={38} />
                </div>
            </div>
        </div>
    );
};

// Mobile / Web live
// *********************
// User status
// Visitor status
export const UserStatusSkeleton = () => {
    return (
        <div className="skeleton-span-con">
            <div className="dflex flex-column width100p">
                <div className="skeleton-span fill center">
                    <Skeleton
                        circle={true}
                        width={105}
                        height={105}
                        style={{ maxWidth: 105, marginLeft: '50%', transform: 'translateX(-50%)' }}
                    />
                </div>
                <div className="skeleton-span flex-row fill theme-space-mt">
                    <div className="skeleton-span fill width40p">
                        <Skeleton height={30} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton height={55} />
                    </div>
                    <div className={`skeleton-span fill width40p ml${themeSizeSm}`}>
                        <Skeleton height={30} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton height={55} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Key metrics small
export const KeyMetricsSmallSkeleton = ({ isError }) => {
    return (
        <div className="skeleton-span-con p15">
            {isError && <NoData />}
            <Row>
                <Col md={12}>
                    <Row>
                        <Col md={6}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                        <Col md={6}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                        <Col md={6}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                    </Row>
                </Col>
                <Col md={12}>
                    <Row>
                        <Col md={6}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                        <Col md={6}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                        <Col md={6}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

// Key metrics small 8
export const ActiveUsersSmallSkeleton = ({ isError }) => {
    return (
        <div className="skeleton-span-con p15">
            {isError && <NoData />}
            <Row>
                <Col md={12}>
                    <Row>
                        <Col md={4}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                        <Col md={4}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                        <Col md={4}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                        <Col md={4}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                        <Col md={4}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                    </Row>
                </Col>
                <Col md={12}>
                    <Row>
                        <Col md={4}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                        <Col md={4}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                        <Col md={4}>
                            <CommonSkeleton box height={35} stopAnimation={isError} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                        <Col md={4}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                        <Col md={4}>
                            <CommonSkeleton box height={15} stopAnimation={isError} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

// Active users
export const ActiveUsersSkeleton = () => {
    return (
        <div className="skeleton-span-con posr top-7">
            <div className="dflex flex-column width100p">
                <div className="skeleton-span flex-row fill">
                    <div className="skeleton-span fill width40p">
                        <Skeleton height={47} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton height={47} />
                        <hr className={`height${themeSizeSm}`} />
                    </div>
                    <div className={`skeleton-span fill width40p ml${themeSizeSm}`}>
                        <Skeleton height={47} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton height={47} />
                        <hr className={`height${themeSizeSm}`} />
                    </div>
                    <div className={`skeleton-span fill width40p ml${themeSizeSm}`}>
                        <Skeleton height={47} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton height={47} />
                        <hr className={`height${themeSizeSm}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Overview=
export const OverviewSkeleton = () => {
    return (
        <div className="skeleton-span-con">
            <div className="d-flex flex-row fill width100p">
                <div className="skeleton-span width40p circle-left">
                    <Skeleton circle={true} width={77} height={77} />
                </div>
                <div className="skeleton-span fill width40p">
                    <Skeleton height={31} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={31} />
                </div>
            </div>
            <div className="d-flex flex-row fill width100p">
                <div className="skeleton-span fill width40p">
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={31} />
                </div>
            </div>
        </div>
    );
};
// Traffic breakdown by web visitors
// Audience types
// Known to conversion
// Retention
// Top screen views
// Top event summary
// Location

export const HorizontalSkeleton = ({ isError, count, height }) => {
    const { loading } = useSelector(({ globalstate }) => globalstate);

    return (
        <div className="skeleton-span-con p0">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="width100p">
                <div className="skeleton-span fill width100p">
                    {(isError && !loading) && <NoData />}

                    {Array(count ? count : 7)
                        .fill(0)
                        .map((_, index, arr) => {
                            return (
                                <Fragment key={index}>
                                    <CommonSkeleton
                                        box
                                        mainClass={index !== arr?.length - 1 ? 'mb15' : ''}
                                        height={height ? height : 33.5}
                                        stopAnimation={isError}
                                    />
                                </Fragment>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

/** Insights portlet body — horizontal list bars (matches live p-list-wrapper loading). */
export const InsightsBodySkeleton = () => (
    <HorizontalSkeleton count={7} height={33.5} isError={false} />
);

const RETENTION_COL_COUNT = 7;
const RETENTION_ROW_COUNT = 5;

const RetentionGridSkeleton = ({ isError = false }) => (
    <div className="db-sk-retention-grid">
        <div className="reskendogrid">
            <div className="reskendogrid-table rs-kendo-grid-table grid-loading-state">
                <div className="k-grid rs-kendo-scrollable-grid grid-loading-state">
                    <div className="k-grid-norecords">
                        <ResKendoGridLoadingSkeleton
                            rows={RETENTION_ROW_COUNT}
                            columns={RETENTION_COL_COUNT}
                            isLoading={!isError}
                            showNoData={isError}
                            wrapperClassName=""
                            injectCriticalCss={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const RetentionTableSkeleton = ({ isError = false, withPortletBox = true }) => {
    const gridSkeleton = <RetentionGridSkeleton isError={isError} />;

    if (!withPortletBox) {
        return gridSkeleton;
    }

    return (
        <div className="portlet-box-theme border">
            <div className="tabs-content rs-table-wrapper shadow-none border-0">
                {gridSkeleton}
            </div>
        </div>
    );
};

export const SankeyHorizontalSkeleton = ({ isError }) => {
    return (
        <div className="skeleton-span-con p0">
            {/*<Skeleton width={"40%"} height={30} />*/}
            {isError && <NoData />}
            <div className="width100p">
                <div className="skeleton-span fill width100p">
                    <Skeleton height={34} enableAnimation={!isError} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={34} enableAnimation={!isError} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={34} enableAnimation={!isError} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={34} enableAnimation={!isError} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={34} enableAnimation={!isError} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={33} enableAnimation={!isError} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={33} enableAnimation={!isError} />
                </div>
            </div>
        </div>
    );
};

export const CSROverviewPopupSkeleton = ({ isError }) => {
    return (
        <div className="skeleton-span-con p0">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="width100p">
                <div className="skeleton-span fill width100p">
                    {isError && <NoData />}
                    <Skeleton height={55} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={40} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={50} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={41} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={40} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={41} />
                </div>
            </div>
        </div>
    );
};

// Traffic breakdown
export const TrafficBreakdownSkeleton = () => {
    return (
        <div className="skeleton-span-con p0">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="width100p">
                <div className="skeleton-span fill width100p">
                    <Skeleton height={60} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={35} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={44} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={44} />
                </div>
            </div>
        </div>
    );
};

// Operating sytem
// Device
// App versions
// OS versions
// By hours
// App language

export const PieChartSkeleton = (props) => {
    const showAnimation = !props?.isError && !props?.nodata
    return (
        <div className={`skeleton-span-con ${props.className ? props.className : ''}`} style={{ height: '88%' }}>
            {/*<Skeleton width={"40%"} height={30} />*/}
            {(props?.isError || props?.nodata) && !props?.hideInternalNoData && <NoData className={`nodata-skeleton-con ${props?.customTop ? 'customTop' : ''}`} />}
            {/* {props.nodata ? <NoData /> : null} */}
            <div
                className={`dflex width100p pie-chart-position ${props?.count ? 'count-pie' : ''}  ${props.pieClass ? props.pieClass : ''
                    }`}
            >
                <div
                    className={`skeleton-span center mt20`}
                // style={{ height: props.size ? props.size : 220 }}
                >
                    {Array(props?.count)
                        .fill(0)
                        .map((_, index) => {
                            return (
                                <Fragment key={index}>
                                    <Skeleton
                                        circle={true}
                                        width={props.size ? props.size : 220}
                                        height={props.size ? props.size : 220}
                                        enableAnimation={showAnimation}
                                    />
                                </Fragment>
                            );
                        })}

                    {!props.noLegend ? (
                        <>
                            <hr className={`height${themeSizeSm}`} />
                            <div
                                className={`d-flex pie-legend-skeleton-wr justify-content-center mt15 mx-auto pie-legend-skeleton`}
                            // style={{ height: props.height ? props.height : 220 }}
                            >
                                <Skeleton className={`ml${themeSizeSm}`} height={15} width={15} enableAnimation={showAnimation} />
                                <Skeleton height={15} width={40} enableAnimation={showAnimation} />
                                <Skeleton className={`ml${themeSizeSm}`} height={15} width={15} enableAnimation={showAnimation} />
                                <Skeleton height={15} width={40} enableAnimation={showAnimation} />
                                <Skeleton className={`ml${themeSizeSm}`} height={15} width={15} enableAnimation={showAnimation} />
                                <Skeleton height={15} width={40} enableAnimation={showAnimation} />
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

// Recent campaign

//old
// export const SemiPieChartSkeleton = (props) => {
//     return (
//         <div className="skeleton-span-con">
//             {/*<Skeleton width={"40%"} height={30} />*/}
//             {props.nodata ? <NoData /> : null}
//             <div className="dflex width100p">
//                 <div className="skeleton-span center" style={{ height: 180 }}>
//                     <Skeleton circle={true} width={180} height={180} />
//                     <hr className="height2" />
//                     <div
//                         className="d-flex semipie-legend-skeleton-wr flex-column justify-content-center mt20 mx-auto pie-legend-skeleton"
//                         style={{ height: 180 }}
//                     >
//                         <Skeleton height={20} width={100} />
//                         {/* <hr className="height2" /> */}
//                         {/* <Skeleton height={20} width={140} /> */}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// New — layout mirrors loaded gauge card (title / status + semi-pie / date footer)
export const SemiPieChartSkeleton = (props) => {
    return (
        <div className="skeleton-span-con semi-pie-gauge-skeleton">
            <Skeleton
                width="72%"
                height={16}
                className="semi-pie-gauge-skeleton__title"
                enableAnimation={!props?.isError}
            />
            {props.nodata ? <NoData /> : null}
            <div className="semi-pie-gauge-skeleton__body gaugeslider_skeleton">
                {props.isError ? <NoData /> : null}
                <div className="semi-pie-gauge-skeleton__left">
                    <Skeleton height={14} width="78%" enableAnimation={!props?.isError} />
                    <Skeleton height={18} width="52%" enableAnimation={!props?.isError} />
                </div>
                <div className="semi-pie-gauge-skeleton__gauge">
                    <div className="skeleton-gaugecircle" aria-hidden="true" />
                </div>
            </div>
            <div className="semi-pie-gauge-skeleton__footer">
                <Skeleton height={13} width={120} enableAnimation={!props?.isError} />
            </div>
        </div>
    );
};

// Bubble chart — connected layout mirrors live `.bubble-chart-custom` (Audience behavior)
const A360_CONNECTED_BUBBLE_SIZES = [115, 150, 150, 135, 160, 125, 100];
const A360_CONNECTED_BUBBLE_CLASSES = ['b-mon', 'b-tue', 'b-wed', 'b-thu', 'b-fri', 'b-sat', 'b-sun'];

export const BubbleChartSkeleton = (props) => {
    const showAnimation = !props?.isError && !props?.nodata;
    const connected = props?.connected;

    if (connected) {
        return (
            <div className={`skeleton-span-con position-relative ${props?.className || ''}`}>
                {(props?.isError || props?.nodata) && !props?.hideInternalNoData && (
                    <div
                        className="position-absolute d-flex align-items-center justify-content-center w-100 h-100"
                        style={{ top: 0, left: 0, zIndex: 20, pointerEvents: 'none' }}
                    >
                        <NoData text={props?.text} className="nodata-skeleton-con" />
                    </div>
                )}
                <div className="bubble-chart-custom bubble-chart-skeleton--connected">
                    <ul>
                        {A360_CONNECTED_BUBBLE_SIZES.map((size, index) => (
                            <li
                                key={A360_CONNECTED_BUBBLE_CLASSES[index]}
                                className={`bubble-chart-list bubble-chart-skeleton__bubble ${A360_CONNECTED_BUBBLE_CLASSES[index]}`}
                                style={{ width: size, height: size }}
                            >
                                <Skeleton circle width={size} height={size} enableAnimation={showAnimation} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className={`skeleton-span-con position-relative ${props?.className || ''}`}>
            {(props?.isError || props?.nodata) && !props?.hideInternalNoData && (
                <div
                    className="position-absolute d-flex align-items-center justify-content-center w-100 h-100"
                    style={{ top: 0, left: 0, zIndex: 20, pointerEvents: 'none' }}
                >
                    <NoData text={props?.text} className="nodata-skeleton-con" />
                </div>
            )}
            <div className="width100p">
                <div className="bubble-chart-skeleton">
                    <Skeleton circle width={115} height={115} enableAnimation={showAnimation} />
                    <Skeleton circle width={80} height={80} enableAnimation={showAnimation} />
                    <Skeleton circle width={70} height={70} enableAnimation={showAnimation} />
                    <Skeleton circle width={120} height={120} enableAnimation={showAnimation} />
                    <Skeleton circle width={120} height={120} enableAnimation={showAnimation} />
                    <Skeleton circle width={95} height={95} enableAnimation={showAnimation} />
                    <Skeleton circle width={98} height={98} enableAnimation={showAnimation} />
                </div>
            </div>
        </div>
    );
};

/** Line chart skeleton: uses ListAqusitionSekelton (two wavy lines with dots, axes, legend) */
export const LineChartSkeleton = (props) => (
    <div className={`skeleton-span-con skeleton-line-chart-con position-relative ${props?.className || ''}`}>
        {props?.isError && (
            <NoData text={props?.text} className={`nodata-skeleton-con ${props?.className || ''}`.trim()} />
        )}
        <ListAqusitionSekelton
            isChartSkeleton
            isCustom
            height={props?.height}
            className={props?.className}
            stopAnimation={props?.stopAnimation || props?.isError}
        />
    </div>
);

export const TotalLinkPortletSkeleton = ({ stopAnimation }) => (
    <div className="portlet-container rs-table-with-heading mb30 communication-status-portlet-skeleton">
        <div className="portlet-header flex-row mb6">
            <div className="fr d-flex align-items-center">
                <CommonSkeleton box height={25} width={180} mainClass="mb0" stopAnimation={stopAnimation} />
                <CommonSkeleton circle height={24} width={24} mainClass="ml10" stopAnimation={stopAnimation} />
                <CommonSkeleton box height={25} width={160} mainClass="mx15" stopAnimation={stopAnimation} />
            </div>
            <div className="float-end d-flex align-items-center">
                <CommonSkeleton circle height={24} width={24} stopAnimation={stopAnimation} />
            </div>
        </div>
        <div className="portlet-body communication-status-portlet-body mt15">
            <div className="communication-status-portlet-grid-wrap">
                <GridLoadingSkeleton rows={5} columns={6} wrapperClassName="p5" hideLeftBorder isLoading={!stopAnimation} />
            </div>
        </div>
    </div>
);


/** Communication status portlet: header + grid in bordered box (one circle only). Loading starts from grid area. */
export const CommunicationStatusPortletSkeleton = ({ stopAnimation }) => (
    <div className="portlet-container rs-table-with-heading mb30 communication-status-portlet-skeleton">
        <div className="portlet-header flex-row mb6">
        <div className="fr d-flex align-items-center">
                <CommonSkeleton box height={25} width={180} mainClass="mb0" stopAnimation={stopAnimation} />
                <CommonSkeleton circle height={24} width={24} mainClass="ml10" stopAnimation={stopAnimation} />
                <CommonSkeleton box height={25} width={160} mainClass="mx15" stopAnimation={stopAnimation} />
            </div>
            <div className="float-end d-flex align-items-center">
                <CommonSkeleton box height={25} width={140} mainClass="mr15" stopAnimation={stopAnimation} />
                <CommonSkeleton circle height={24} width={24} stopAnimation={stopAnimation} />
            </div>
        </div>
        <div className="portlet-body communication-status-portlet-body mt15">
            <div className="communication-status-portlet-grid-wrap">
                <GridLoadingSkeleton rows={5} columns={6} wrapperClassName="p5" hideLeftBorder isLoading={!stopAnimation} />
            </div>
        </div>
    </div>
);

// By days
export const ColumnChartSkeleton = (props) => {
    const axisColor = '#e9e9e9';
    return (
        <div className="skeleton-span-con marginX20">
            {props?.isError && !props?.hideInternalNoData && <NoData text={props?.text} className={`mt10 ${props.className}`} />}
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="width100p">
                {/* Chart area with x-axis and y-axis lines */}
                <div
                    className="skeleton-span flex-row fill width100p align-items-end mb5 transformY-3 position-relative pb20"
                    style={{
                        height: 328,
                        borderLeft: `1px solid ${axisColor}`,
                        borderBottom: `1px solid ${axisColor}`,
                        boxSizing: 'border-box',
                    }}
                >
                    <div className="skeleton-bottom-align">
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton className="" height={170} width={33} enableAnimation={!props?.isError} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton className="" height={110} width={33} enableAnimation={!props?.isError} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton className="" height={290} width={33} enableAnimation={!props?.isError} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton className="" height={160} width={33} enableAnimation={!props?.isError} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton className="" height={230} width={33} enableAnimation={!props?.isError} />
                        <hr className={`height${themeSizeSm}`} />
                        <Skeleton className="" height={140} width={33} enableAnimation={!props?.isError} />
                        <hr />
                        <Skeleton className="mr50" height={210} width={33} enableAnimation={!props?.isError} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sankey skeleton
export const SankeyChartSkeleton = () => {
    return (
        <div className="skeleton-span-con">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="width100p d-inline-block">
                <div className="skeleton-span fill width100p mt50">
                    <Skeleton className="width50p ml10p" height={30} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton className="width80p" height={30} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton className="width90p ml5p" height={30} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={30} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton className="width50p ml30p" height={30} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton className="width80p ml10p" height={30} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton className="width90p ml5p" height={30} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton className="width30p ml40p" height={30} />
                </div>
            </div>
        </div>
    );
};

// Planning no data
export const SkeletonPlanning = () => {
    return (
        <div className="skeleton-span-con p0">
            {/*<Skeleton width={"40%"} height={30} />*/}
            <div className="width100p">
                <div className="skeleton-span fill width100p">
                    <Skeleton height={60} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={35} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={60} />
                    <hr className={`height${themeSizeSm}`} />
                    <Skeleton height={53} />
                </div>
            </div>
        </div>
    );
};

export const PerformanceSnapshotSkeleton = (props) => {
    const { isError } = props;
    return (
        <div>
            {isError && <NoData />}
            <Row>
                <Col md={7}>
                    <div className="portlet-header">
                        <Skeleton
                            height={24}
                            width={180}
                            enableAnimation={!isError}
                        />
                    </div>
                    <div className="portlet-chart">
                        <div className="position-relative">
                            <div className="performance-snap-chart">
                                <div className="skeleton-gaugecircle right-21 top41"></div>
                            </div>
                            <label className="meter-ch-label">
                                <Skeleton
                                    height={20}
                                    width={80}
                                    enableAnimation={!isError}
                                    className="mb5"
                                />
                                <div className="color-secondary-black">
                                    <Skeleton
                                        height={16}
                                        width={200}
                                        enableAnimation={!isError}
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                </Col>
                <Col md={5}>
                    <div className="p-snap">
                        <ul>
                            <li style={{ backgroundColor: '#f4f4f4', opacity: '0.8' }}>
                                <div className="custom-slide position-relative top21">
                                    <div className="p-snap-list">
                                        <Skeleton
                                            height={20}
                                            width={120}
                                            enableAnimation={!isError}
                                            className='mt10'
                                        />
                                        <div className="p-count gap-1">
                                            <Skeleton
                                                height={30}
                                                width={50}
                                                enableAnimation={!isError}
                                                className='mt10'
                                            />
                                            <Skeleton
                                                circle={true}
                                                width={25}
                                                height={25}
                                                enableAnimation={!isError}
                                                className='mt10'

                                            />
                                        </div>
                                        <Skeleton
                                            height={16}
                                            width={140}
                                            enableAnimation={!isError}
                                            className='mt10'
                                        />
                                        <Skeleton
                                            height={16}
                                            width={160}
                                            enableAnimation={!isError}
                                            className='mt10'
                                        />
                                    </div>
                                </div>
                            </li>
                            <li style={{ backgroundColor: '#f4f4f4', opacity: '0.8' }}>
                                <div className="custom-slide position-relative top21">
                                    <div className="p-snap-list">
                                        <Skeleton
                                            height={20}
                                            width={120}
                                            enableAnimation={!isError}
                                            className='mt10'
                                        />
                                        <div className="p-count gap-1">
                                            <Skeleton
                                                height={30}
                                                width={50}
                                                enableAnimation={!isError}
                                                className='mt10'
                                            />
                                            <Skeleton
                                                circle={true}
                                                width={25}
                                                height={25}
                                                enableAnimation={!isError}
                                                className='mt10'

                                            />
                                        </div>
                                        <Skeleton
                                            height={16}
                                            width={140}
                                            enableAnimation={!isError}
                                            className='mt10'
                                        />
                                        <Skeleton
                                            height={16}
                                            width={160}
                                            enableAnimation={!isError}
                                            className='mt10'
                                        />
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export const ColumnChartSkeletonNew = (props) => {
    const {
        isError,
        nodata,
        // Chart dimensions
        chartHeight = 325,
        chartWidth = '100%',
        // Bar properties
        barWidth = 25,
        barGap = 4,
        // Data configuration
        dataGroups = 9,
        barsPerGroup = 3,
        // Colors
        barColors = ['#e2e7ee', '#e2e7ee', '#e2e7ee'],
        // Heights (as percentages of max height)
        barHeights = [
            // Group 1
            [34, 240, 89],
            // Group 2
            [0, 132, 0],
            // Group 3
            [72, 240, 174],
            // Group 4
            [66, 246, 168],
            // Group 5
            [126, 264, 252],
            // Group 6
            [30, 192, 72],
            // Group 7
            [48, 150, 258],
            // Group 8
            [22, 66, 126],
            // Group 9
            [72, 72, 150],
        ],
        // Legend configuration
        legendItems = 3,
        legendItemWidth = 60,
        // Axis labels
        showYAxisLabels = true,
        showXAxisLabels = true,
        showLegend = true,
        // Spacing
        containerPadding = '50px',
        chartTopOffset = '0px'
    } = props;

    // Calculate dynamic values
    const chartContentHeight = chartHeight - 40;
    const chartContentWidth = `calc(${chartWidth} - 100px)`;

    // Stable bar heights — never use Math.random so bars don't shift on re-render
    const dynamicBarHeights = useMemo(
        () => (barHeights && barHeights.length > 0 ? barHeights.slice(0, dataGroups) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <div className="skeleton-span-con position-relative">
            {(nodata || isError) && (
                <div
                    className="position-absolute d-flex align-items-center justify-content-center w-100 h-100"
                    style={{ top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
                >
                    <NoDataAvailableRender />
                </div>
            )}

            {/* Chart Container */}
            <div className="position-relative" style={{ height: `${chartHeight}px`, width: chartWidth }}>

                {/* Chart Bars Area */}
                <div className="position-absolute" style={{ left: containerPadding, top: chartTopOffset, width: chartContentWidth, height: '90%', borderLeft: '1px solid rgb(233, 233, 233)', borderBottom: '1px solid rgb(233, 233, 233)' }}>

                    <div className="d-flex justify-content-between align-items-end h-100 ml15">
                        {dynamicBarHeights.map((group, groupIndex) => (
                            <div key={groupIndex} className="d-flex align-items-end" style={{ gap: `${barGap}px` }}>
                                {group.slice(0, barsPerGroup).map((height, barIndex) => (
                                    <Skeleton
                                        key={barIndex}
                                        height={height}
                                        width={barWidth}
                                        enableAnimation={!isError}
                                        style={{ backgroundColor: barColors[barIndex] || '#e2e7ee' }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* X-Axis Labels */}
                {/* {showXAxisLabels && (
                    <div className="position-absolute" style={{ left: '50px', bottom: '0', width: chartContentWidth }}>
                        <div className="d-flex justify-content-between mb21 ml24">
                            {Array.from({ length: dataGroups }, (_, index) => (
                                <Skeleton key={index} height={14} width={50} enableAnimation={!isError} />
                            ))}
                        </div>
                    </div>
                )} */}
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="d-flex justify-content-center mt-3" style={{ gap: '20px' }}>
                    {Array.from({ length: legendItems }, (_, index) => (
                        <div key={index} className="d-flex align-items-center" style={{ gap: '8px' }}>
                            <Skeleton height={20} width={20} enableAnimation={!isError} />
                            <Skeleton height={20} width={legendItemWidth} enableAnimation={!isError} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const PerformanceBenchmarkSkeleton = (props) => {
    const {
        isError,
        nodata,
        // Chart dimensions
        chartHeight = 325,
        chartWidth = '100%',
        // Bar properties
        barWidth = 30,
        barGap = 5,
        // Data configuration
        dataGroups = 21,
        barsPerGroup = 3,
        // Colors
        barColors = ['#d0d0d0', '#c0c0c0', '#b0b0b0'],
        // Heights (as percentages of max height)
        barHeights = [
            [27],
            [54],
            [81],
            [108],
            [135],
            [162],
            [189],
            [216],
            [243],
            [270],
            [291],
            [270],
            [243],
            [216],
            [189],
            [162],
            [135],
            [108],
            [81],
            [54],
            [27],
            [240],
            [240],
        ],
        // Legend configuration
        legendItems = 1,
        legendItemWidth = 200,
        // Axis labels
        showYAxisLabels = true,
        showXAxisLabels = true,
        showLegend = true,
        // Spacing
        containerPadding = '41px',
        chartTopOffset = '53px'
    } = props;

    // Calculate dynamic values
    const chartContentHeight = chartHeight - 40;
    const chartContentWidth = `calc(${chartWidth} - 100px)`;

    // Stable bar heights — never use Math.random so bars don't shift on re-render
    const dynamicBarHeights = useMemo(
        () => (barHeights && barHeights.length > 0 ? barHeights.slice(0, dataGroups) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <div className="skeleton-span-con position-relative">
            {isError && (
                <div
                    className="position-absolute d-flex align-items-center justify-content-center w-100 h-100"
                    style={{ top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
                >
                    <NoDataAvailableRender />
                </div>
            )}

            {/* Chart Container */}
            <div className="position-relative" style={{ height: `${chartHeight}px`, width: chartWidth }}>

                {/* Y-Axis Labels */}
                {/* {showYAxisLabels && (
                    <div className="position-absolute" style={{ left: '0', top: '18px', height: `${chartContentHeight}px`, width: '40px' }}>
                        <div className="d-flex flex-column justify-content-between h-100">
                            <Skeleton height={16} width={30} enableAnimation={!isError} />
                            <Skeleton height={16} width={30} enableAnimation={!isError} />
                            <Skeleton height={16} width={30} enableAnimation={!isError} />
                            <Skeleton height={16} width={30} enableAnimation={!isError} />
                        </div>
                    </div>
                )} */}

                {/* Chart Bars Area */}
                <div className="position-absolute" style={{ left: containerPadding, width: chartContentWidth, height: '90%', borderLeft: '1px solid rgb(233, 233, 233)', borderBottom: '1px solid rgb(233, 233, 233)' }}>

                    {/* Horizontal grid lines */}
                    <div style={{ position: 'absolute', top: '20%', left: '-10px', right: '0', height: '1px', width: "10px", background: '#e9e9e9' }}></div>
                    <div style={{ position: 'absolute', top: '40%', left: '-10px', right: '0', height: '1px', width: "10px", background: '#e9e9e9' }}></div>
                    <div style={{ position: 'absolute', top: '60%', left: '-10px', right: '0', height: '1px', width: "10px", background: '#e9e9e9' }}></div>
                    <div style={{ position: 'absolute', top: '80%', left: '-10px', right: '0', height: '1px', width: "10px", background: '#e9e9e9' }}></div>

                    <div className="d-flex gap-4 align-items-end h-100 ml17">
                        {dynamicBarHeights.map((group, groupIndex) => (
                            <div key={groupIndex} className="d-flex align-items-end" style={{ gap: `${barGap}px` }}>
                                {group.slice(0, barsPerGroup).map((height, barIndex) => (
                                    <Skeleton
                                        key={barIndex}
                                        height={height}
                                        width={barWidth}
                                        enableAnimation={!isError}
                                        style={{ backgroundColor: barColors[barIndex] || '#d0d0d0' }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Legend */}
            {showLegend && (
                <div className="d-flex justify-content-center mt-3" style={{ gap: '20px' }}>
                    {Array.from({ length: legendItems }, (_, index) => (
                        <div key={index} className="d-flex align-items-center" style={{ gap: '8px' }}>
                            <Skeleton height={20} width={legendItemWidth} enableAnimation={!isError} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};



export const AudienceReportSkeleton = ({ message = 'No data available', isError = false, isDataReady = false, isCardOnlySkeleton = false }) => {
    const SingleCard = ({ isError }) => (
        <Col sm={4}>
            <div style={{
                position: 'relative',
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #e0e5eb',
                height: 75,
                padding: '10px 15px 5px 23px',
                fontSize: 13,
                color: '#222',
                overflow: 'hidden',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
            }}>
                {/* Left vertical gray line */}
                <div style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    width: 3,
                    height: 149,
                    background: '#e0e5eb',
                    borderTopLeftRadius: 3,
                    borderBottomLeftRadius: 3,
                    zIndex: 1,
                }} />
                {/* Info row: table layout */}
                <div style={{
                    display: 'table',
                    width: '100%',
                    height: 90,
                }} className='mt-6'>
                    <div style={{
                        display: 'table-row',
                    }}>
                        {/* Logo left */}
                        <div style={{
                            display: 'table-cell',
                            verticalAlign: 'middle',
                            width: '12%',
                            paddingRight: 10,
                            textAlign: 'center',
                        }}>
                            <Skeleton enableAnimation={!isError} width={50} height={50} style={{ background: '#e0e5eb' }} circle />
                        </div>
                        {/* Text right */}
                        <div style={{
                            display: 'table-cell',
                            verticalAlign: 'middle',
                            width: '70%',
                            paddingLeft: 10,
                        }}>
                            <Skeleton enableAnimation={!isError} width={120} height={16} style={{ marginBottom: 7, background: '#e0e5eb' }} />
                            <Skeleton enableAnimation={!isError} width={200} height={16} style={{ background: '#e0e5eb' }} />
                        </div>
                    </div>
                </div>
            </div>
        </Col>
    );

    return (
        <div className="skeleton-span-con p0">
            {isError ? <NoData /> : null}
            <div className={`portlet-container audienceCardBlock${isCardOnlySkeleton ? ' no-border no-box-shadow' : ''}`}>
                {!isCardOnlySkeleton && (
                    <>
                        <div className='d-flex justify-content-between mb15'>
                            <CommonSkeleton width={180} height={20} box stopAnimation={isError} />
                            <CommonSkeleton width={200} height={20} box stopAnimation={isError} />
                        </div>
                        <div className='mb10'>
                            <CommonSkeleton width={120} height={20} box stopAnimation={isError} />
                        </div></>
                )}
                <Row>
                    {[...Array(6)]?.map((_, idx) => (
                        <SingleCard key={idx} isError={isError} />
                    ))}
                </Row>
            </div>
        </div>
    );
};

export const AudienceProfileSkeleton = ({ showNoData = false, noDataMessage }) => {
    return (
        <div className={`skeleton-span-con audience-profile-skeleton${showNoData ? ' no-animation' : ''}`}>
            {showNoData && <NoData text={noDataMessage} />}
            <div className="aps-profile-card">
                <div className="aps-user-row mt-7">
                    <CommonSkeleton circle height={54} width={54} stopAnimation={showNoData} />
                    <div className="aps-user-meta">
                        <Skeleton height={16} width="55%" enableAnimation={!showNoData} />
                        <Skeleton height={12} width="48%" enableAnimation={!showNoData} />
                    </div>
                </div>
                <div className="d-flex gap-2 mb10">
                    <Skeleton height={26} width={26} borderRadius={6} enableAnimation={!showNoData} />
                    <Skeleton height={26} width={26} borderRadius={6} enableAnimation={!showNoData} />
                    <Skeleton height={26} width={26} borderRadius={6} enableAnimation={!showNoData} />
                    <Skeleton height={26} width={26} borderRadius={6} enableAnimation={!showNoData} />
                    <Skeleton height={26} width={26} borderRadius={6} enableAnimation={!showNoData} />
                </div>
                <div className="d-flex align-items-center gap-2 mb10">
                    <Skeleton height={20} width={24} enableAnimation={!showNoData} />
                    <Skeleton height={12} width={100} enableAnimation={!showNoData} />
                </div>
                <div className="aps-highlight-bar skeleton-shimmer mt0" />
            </div>
            <div className="aps-indicators">
                <div className="aps-dot" />
                <div className="aps-dot" />
            </div>
            <Row className="m0 mb10">
                <Col sm={6} className="pl0 pr5">
                    <div className="aps-stat-card">
                        <div className="aps-card-header" />
                        <div className="aps-card-body">
                            <div className="aps-stat-row">
                                <CommonSkeleton box height={18} width={50} mainClass="ml25" stopAnimation={showNoData} />
                                <CommonSkeleton box height={15} width={80} mainClass="ml10" stopAnimation={showNoData} />
                            </div>
                            <div className="aps-stat-row">
                                <CommonSkeleton box height={18} width={50} mainClass="ml25" stopAnimation={showNoData} />
                                <CommonSkeleton box height={15} width={80} mainClass="ml10" stopAnimation={showNoData} />
                            </div>
                        </div>
                    </div>
                </Col>
                <Col sm={6} className="pl0 pr5">
                    <div className="aps-stat-card">
                        <div className="aps-card-header" />
                        <div className="aps-card-body">
                            <div className="aps-stat-row">
                                <CommonSkeleton box height={18} width={50} mainClass="ml25" stopAnimation={showNoData} />
                                <CommonSkeleton box height={15} width={80} mainClass="ml10" stopAnimation={showNoData} />
                            </div>
                            <div className="aps-stat-row">
                                <CommonSkeleton box height={18} width={50} mainClass="ml25" stopAnimation={showNoData} />
                                <CommonSkeleton box height={15} width={80} mainClass="ml10" stopAnimation={showNoData} />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row className="m0 mb10">
                <Col sm={6} className="pl0 pr5">
                    <div className="aps-stat-card">
                        <div className="aps-card-header" />
                        <div className="align-content-between aps-card-body d-flex justify-content-center row">
                            <div>
                                <CommonSkeleton circle height={32} width={32} mainClass="mb5 ml35" stopAnimation={showNoData} />
                            </div>
                            <div>
                                <CommonSkeleton box height={18} width={40} mainClass="ml30" stopAnimation={showNoData} />
                                <CommonSkeleton box height={15} width={80} mainClass='mt5 ml10' stopAnimation={showNoData} />
                            </div>
                        </div>
                    </div>
                </Col>
                <Col sm={6} className="pl0 pr5">
                    <div className="aps-stat-card">
                        <div className="aps-card-header" />
                        <div className="align-content-between aps-card-body d-flex justify-content-center row">
                            <div>
                                <CommonSkeleton circle height={32} width={32} mainClass="mb5 ml35" stopAnimation={showNoData} />
                            </div>
                            <div>
                                <CommonSkeleton box height={18} width={40} mainClass="ml30" stopAnimation={showNoData} />
                                <CommonSkeleton box height={15} width={80} mainClass='mt5 ml10' stopAnimation={showNoData} />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            <div className="aps-behaviour-card mt10">
                <div className="aps-card-header" />
                <div className="aps-behaviour-body">
                    <Skeleton height={8} width={8} enableAnimation={!showNoData} />
                    <Skeleton height={12} width={200} enableAnimation={!showNoData} />
                </div>
            </div>
        </div>
    );
};

export const AudienceDetailSkeleton = ({ showNoData = false, hideTitle = false }) => {
    return (
        <div className="portlet-container audience-detail-skeleton">
            <div className="d-flex justify-content-between mb20">
                <div className="align-items-center d-flex">
                    {hideTitle ? (
                        <Skeleton height={20} width={140} borderRadius={4} enableAnimation={!showNoData} />
                    ) : (
                        <h4 className="mb0">Audience details</h4>
                    )}
                </div>
                <ul className="rs-list-group-horizontal advanceSearchContainer align-items-center pe-none click-off">
               
                    <li className="ml15">
                    <Skeleton
                    height={30}
                    width={30}
                />                    </li>
                    <li className="ml15">
                    <Skeleton
                    height={30}
                    width={30}             
                />                   </li>
                </ul>
            </div>
            <Row className="audienceDetailBlock m0 flex-nowrap">
                <Col xs={12} sm={3} className="leftProfileBlock pr30 pl0 flex-shrink-0">
                    <AudienceProfileSkeleton showNoData={showNoData} />
                </Col>
                <Col xs={12} sm={9} className="rightTimelineBlock bg-quaternary-grey p0 position-relative flex-grow-1 min-width-0">
                    <Row className="m0">
                        <Col className="text-left" />
                        <Col className="text-right btnTab">
                            <div className="d-flex gap-1 pe-none click-off justify-content-end mt10">
                                <Skeleton height={32} width={32} borderRadius={4} enableAnimation={!showNoData} />
                                <Skeleton height={32} width={32} borderRadius={4} enableAnimation={!showNoData} />
                                <Skeleton height={32} width={32} borderRadius={4} enableAnimation={!showNoData} />
                            </div>
                        </Col>
                    </Row>
                    <div className="expandIcon pe-none click-off audience-detail-skeleton-expand">
                        <i className={`${arrow_left_medium} icon-xs white`} />
                    </div>
                    <TimelineSkeleton isError={showNoData} />
                </Col>
            </Row>
        </div>
    );
};

export { default as SegmentCreateSkeleton } from './SegmentCreateSkeleton';
export { default as SegmentAttributesSkeleton } from './SegmentAttributesSkeleton';

export const PathtoConversionColumnSkeleton = ({ isError = false }) => {
    const skeletonColor = scolor1;

    return (
        <div
            className={`skeleton-span-con p0 path-conversion-column-skeleton${isError ? ' skeleton-static' : ''}`}
            style={{
                position: 'relative',
                height: '100%',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}
        >
            {isError && <NoData />}

            {/* Chart Container */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    flex: '1 1 auto',
                    minHeight: 0,
                    marginTop: '10px',
                }}
            >

                {/* Chart Area */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        minHeight: '360px',
                        backgroundColor: 'white',
                    }}
                >
                    {/* Y-axis grid lines */}
                    <div style={{
                        position: 'absolute',
                        left: '30px',
                        top: '0',
                        width: 'calc(100% - 100px)',
                        height: '100%',
                        borderLeft: '1px solid #e9e9e9',
                        borderBottom: '1px solid #e9e9e9'
                    }}>
                        {/* Horizontal grid lines */}
                        {/* <div style={{ position: 'absolute', top: '0', left: '-10px', right: '0', height: '1px', width : "10px", background: '#e9e9e9' }}></div> */}
                        <div style={{ position: 'absolute', top: '20%', left: '-10px', right: '0', height: '1px', width: "10px", background: '#e9e9e9' }}></div>
                        <div style={{ position: 'absolute', top: '40%', left: '-10px', right: '0', height: '1px', width: "10px", background: '#e9e9e9' }}></div>
                        <div style={{ position: 'absolute', top: '60%', left: '-10px', right: '0', height: '1px', width: "10px", background: '#e9e9e9' }}></div>
                        <div style={{ position: 'absolute', top: '80%', left: '-10px', right: '0', height: '1px', width: "10px", background: '#e9e9e9' }}></div>

                    </div>

                    {/* Stacked Bars */}
                    <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '140px',
                        height: 'calc(100% - 24px)',
                        width: 'calc(100% - 100px)',
                        display: 'flex',
                        alignItems: 'end',
                        padding: '0 20px',
                        gap: '140px'
                    }}>
                        {/* Bar 1: Registers mobile number (100% success) */}
                        <div style={{
                            width: '3%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'end'
                        }}>
                            <div style={{
                                height: '10%',
                                background: '#f4f4f4',
                            }}></div>
                            <div style={{
                                height: '90%',
                                background: skeletonColor,
                            }}></div>
                        </div>

                        {/* Bar 2: Sign-up (95% success, 5% failure) */}
                        <div style={{
                            width: '3%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'end'
                        }}>
                            <div style={{
                                height: '20%',
                                background: '#f4f4f4',
                            }}></div>
                            <div style={{
                                height: '80%',
                                background: skeletonColor,
                            }}></div>
                        </div>

                        {/* Bar 3: Profile details fill (85.5% success, 9.5% failure) */}
                        <div style={{
                            width: '3%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'end'
                        }}>
                            <div style={{
                                height: '30%',
                                background: '#f4f4f4',
                            }}></div>
                            <div style={{
                                height: '70%',
                                background: skeletonColor,
                            }}></div>
                        </div>

                        {/* Bar 4: Documents upload (85.5% success) */}
                        <div style={{
                            width: '3%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'end'
                        }}>
                            <div style={{
                                height: '40%',
                                background: '#f4f4f4',
                            }}></div>
                            <div style={{
                                height: '60%',
                                background: skeletonColor,
                            }}></div>
                        </div>

                        {/* Bar 5: OTP verification (81.2% success, 4.3% failure) */}
                        <div style={{
                            width: '3%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'end'
                        }}>
                            <div style={{
                                height: '4.3%',
                                background: '#f4f4f4',
                            }}></div>
                            <div style={{
                                height: '81.2%',
                                background: skeletonColor,
                            }}></div>
                        </div>

                        {/* Bar 6: Account activated (61.2% success, 20% failure) */}
                        <div style={{
                            width: '3%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'end'
                        }}>
                            <div style={{
                                height: '20%',
                                background: '#f4f4f4',
                            }}></div>
                            <div style={{
                                height: '61.2%',
                                background: skeletonColor,
                            }}></div>
                        </div>
                    </div>

                </div>

                {/* X-Axis Labels */}
                {/* <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '50px',
                    width: 'calc(100% - 100px)',
                    height: '60px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '10px 20px 0 20px'
                }}>
                    <div style={{ width: '5%', textAlign: 'center' }} className='ml-6'>

                        <Skeleton enableAnimation={!isError} width={65} height={12} style={{ background: '#e9e9e9', margin: '0 auto' }} />
                    </div>
                    <div style={{ width: '5%', textAlign: 'center' }} className='ml-6'>

                        <Skeleton enableAnimation={!isError} width={65} height={12} style={{ background: '#d0d0d0', margin: '0 auto' }} />
                    </div>
                    <div style={{ width: '5%', textAlign: 'center' }} className='ml-6'>

                        <Skeleton enableAnimation={!isError} width={65} height={12} style={{ background: '#e9e9e9', margin: '0 auto' }} />
                    </div>
                    <div style={{ width: '5%', textAlign: 'center' }} className='ml-6'>
                        <Skeleton enableAnimation={!isError} width={65} height={12} style={{ background: '#e9e9e9', margin: '0 auto' }} />
                    </div>
                    <div style={{ width: '5%', textAlign: 'center' }} className='ml-6'>

                        <Skeleton enableAnimation={!isError} width={65} height={12} style={{ background: '#e9e9e9', margin: '0 auto' }} />
                    </div>
                    <div style={{ width: '5%', textAlign: 'center' }} className='ml-6'>

                        <Skeleton enableAnimation={!isError} width={65} height={12} style={{ background: '#e9e9e9', margin: '0 auto' }} />
                    </div>
                </div> */}
            </div>

            {/* Legend */}
            <div
                style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    alignItems: 'center',
                    paddingBottom: '8px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Skeleton enableAnimation={!isError} width={16} height={16} baseColor={skeletonColor} borderRadius={2} />
                    <Skeleton enableAnimation={!isError} width={70} height={16} baseColor={skeletonColor} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Skeleton enableAnimation={!isError} width={16} height={16} baseColor={skeletonColor} borderRadius={2} />
                    <Skeleton enableAnimation={!isError} width={70} height={16} baseColor={skeletonColor} />
                </div>
            </div>
        </div>
    );
};


// MeterSkeleton Variation 2 - Colored Segments Gauge (Matching Exact Image)
export const MeterSkeletonColored = ({ width = 350, height = 350, className = '', isError = false, isCustom = false }) => {
    return (
        <div className='skeleton-span-con p0'>
            {isError && <NoData />}
            <div className='position-relative'>
                <svg
                    version="1.1"
                    className={`highcharts-root ${className} ${isCustom ? 'position-relative left13 top-10' : 'position-relative top27 left91'}`}
                    style={{ fontFamily: 'MuktaRegular', fontSize: 15, fontWeight: 'normal', color: '#666', fill: '#666' }}
                    xmlns="http://www.w3.org/2000/svg"
                    width={width}
                    height={height}
                    viewBox="0 0 400 400"
                    role="img"
                    aria-label="meter skeleton"
                >
                    <desc>Skeleton: Meter (all fills set to #e9e9e9)</desc>
                    <defs>
                        <clipPath id="highcharts-0wf5qsk-4084-">
                            <rect x="0" y="0" width="380" height="375" fill="none" />
                        </clipPath>
                        <clipPath id="highcharts-0wf5qsk-4085-">
                            <rect x="0" y="0" width="380" height="500.6913291658733" fill="none" />
                        </clipPath>
                        <clipPath id="highcharts-0wf5qsk-4086-">
                            <rect x="10" y="10" width="380" height="375" fill="none" />
                        </clipPath>
                    </defs>


                    <rect fill="none" className="highcharts-background" x="0" y="0" width="400" height="400" rx="0" ry="0" />
                    <rect fill="none" className="highcharts-plot-background" x="10" y="10" width="380" height="375" />


                    {/* Plot bands - all set to #e9e9e9 for skeleton */}
                    <g className="highcharts-plot-bands-0" data-z-index="0">
                        <path
                            fill="#e9e9e9"
                            opacity="1"
                            className="highcharts-plot-band"
                            d="M 32.65625 197.49999999999997 A 167.34375 167.34375 0 0 1 64.51776786761098 99.27324478285993 L 94.19482823946763 120.78958163994776 A 130.6875 130.6875 0 0 0 69.3125 197.49999999999997 Z"
                        />
                        <path
                            fill="#e9e9e9"
                            opacity="0.85"
                            className="highcharts-plot-band"
                            d="M 64.61606234756741 99.13781168668143 A 167.34375 167.34375 0 0 1 148.12880986622338 38.39842773194198 L 159.4910705621935 73.24924832399277 A 130.6875 130.6875 0 0 0 94.27159154762407 120.6838148410274 Z"
                        />
                        <path
                            fill="#e9e9e9"
                            opacity="0.7"
                            className="highcharts-plot-band"
                            d="M 148.2879373475674 38.34663610123289 A 167.34375 167.34375 0 0 1 251.55288345903028 38.295003623874464 L 240.2603470822903 73.16847902054958 A 130.6875 130.6875 0 0 0 159.61534154762407 73.2088015266771 Z"
                        />
                        <path
                            fill="#e9e9e9"
                            opacity="0.55"
                            className="highcharts-plot-band"
                            d="M 251.71206265243265 38.34663610123289 A 167.34375 167.34375 0 0 1 335.2855077885498 99.00247695268307 L 305.65153941581985 120.57812485828582 A 130.6875 130.6875 0 0 0 240.38465845237596 73.20880152667712 Z"
                        />
                        <path
                            fill="#e9e9e9"
                            opacity="0.4"
                            className="highcharts-plot-band"
                            d="M 335.3839376524326 99.13781168668145 A 167.34375 167.34375 0 0 1 367.343666328132 197.3326562778907 L 330.68743465625545 197.3693125217813 A 130.6875 130.6875 0 0 0 305.72840845237596 120.68381484102741 Z"
                        />
                        <path
                            fill="#e9e9e9"
                            opacity="0.25"
                            className="highcharts-plot-band"
                            d="M 19.90625 197.49999999999997 A 180.09375 180.09375 0 0 1 380.0936599531325 197.31990628001572 L 367.343666328132 197.3326562778907 A 167.34375 167.34375 0 0 0 32.65625 197.49999999999997 Z"
                        />

                    </g>


                    <rect fill="none" className="highcharts-plot-border" data-z-index="1" stroke="#cccccc" strokeWidth="0" x="10" y="10" width="380" height="375" />


                    {/* Grid lines - keep present but subtle strokes; strokeWidth set to 0 to match original appearance */}
                    <g className="highcharts-grid highcharts-yaxis-grid highcharts-radial-axis-grid" data-z-index="1">
                        {/* Many minor grid lines omitted for brevity in JSX reproduction since they are invisible (strokeWidth=0). Keeping the visible structure minimal. */}
                    </g>


                    {/* Dial and pivot - skeleton shapes */}
                    <g className="highcharts-series-group" data-z-index="3">
                        <g className="highcharts-series highcharts-series-0 highcharts-gauge-series highcharts-color-0 highcharts-tracker" data-z-index="0.1" opacity="1" transform="translate(10,10) scale(1 1)" clipPath="url(#highcharts-0wf5qsk-4085-)">
                            <path fill="#e9e9e9" d="M 0 -2.5 L 38.25 -2.5 L 95.625 -0.5 L 95.625 0.5 L 38.25 2.5 L 0 2.5 Z" transform="translate(190,187.5) rotate(-108 0 0)" data-z-index="1" className="highcharts-dial" stroke="#e9e9e9" strokeWidth="0" />
                            <circle cx="0" cy="0" r="6" data-z-index="2" className="highcharts-pivot" transform="translate(190,187.5)" fill="#e9e9e9" stroke="#e9e9e9" strokeWidth="0" />
                        </g>
                    </g>


                    <text x="200" textAnchor="middle" className="highcharts-title" data-z-index="4" style={{ color: '#333', fontSize: 18, fill: '#333' }} y="24" />
                    <text x="10" textAnchor="start" className="highcharts-caption" data-z-index="4" style={{ color: '#666', fill: '#666' }} y="399" />
                    <text x="200" textAnchor="middle" className="highcharts-subtitle" data-z-index="4" style={{ color: '#666', fill: '#666' }} y="26" />


                </svg>
            </div>
        </div>
    );
}

export const DataStorageSkeleton = ({ isError = false, isCustom = false }) => {
    return (
        <div className="skeleton-span-con p0" style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {isError && <NoData />}

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '40px',
                marginTop: isCustom ? '-25px' : '-45px',
                marginLeft: isCustom ? '68px' : "145px"
            }}>
                <div style={{
                    width: isCustom ? '80px' : '120px',
                }}>
                    <div className='position-relative top13'
                        style={{
                            width: isCustom ? '120px' : '150px',
                            height: "30px",
                            borderRadius: "75px / 15px",
                            background: '#e9e9e9',
                        }}
                    ></div>
                    <div style={{
                        width: isCustom ? '120px' : '150px',
                        height: isCustom ? '80px' : '100px',
                        background: '#e9e9e9',
                        position: 'relative',
                    }}>

                    </div>

                    <div style={{
                        width: isCustom ? '120px' : '150px',
                        height: isCustom ? '65px' : '95px',
                        background: '#eeeeee',
                        position: 'relative',
                    }}>

                    </div>

                    <div style={{
                        width: isCustom ? '120px' : '150px',
                        height: '35px',
                        background: '#f4f4f4',
                        position: 'relative',
                    }}>
                    </div>
                    <div className='mt-13'
                        style={{
                            width: isCustom ? '120px' : '150px',
                            height: "30px",
                            borderRadius: "75px / 15px",
                            background: '#f4f4f4',
                        }}
                    ></div>
                </div>


                <div className={`d-flex flex-column gap-5 position-relative  ${isCustom ? 'top10 pl15' : 'top31'}`}>
                    <Skeleton
                        enableAnimation={!isError}
                        width={140}
                        height={16}
                    />
                    <Skeleton
                        enableAnimation={!isError}
                        width={140}
                        height={16}
                    />
                    <Skeleton
                        enableAnimation={!isError}
                        width={140}
                        height={16}
                    />
                </div>

            </div>
        </div>
    );
};

export const PathToConversionFlowChartSkeleton = ({ isError = false }) => {
    const skeletonColor = scolor1;

    return (
        <div
            className={`skeleton-span-con p0 path-conversion-flow-skeleton${isError ? ' skeleton-static' : ''}`}
        >
            {isError && <NoData />}
            <div className='d-flex justify-content-end gap-2'>
                <Skeleton width={30} height={30} enableAnimation={!isError} baseColor={skeletonColor} />
                <Skeleton width={30} height={30} enableAnimation={!isError} baseColor={skeletonColor} />
                <Skeleton width={30} height={30} enableAnimation={!isError} baseColor={skeletonColor} />
            </div>

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 1200 500"
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                {/* === Main conversion flow boxes (larger with increased gaps) === */}
                {/* Installed - bottom left */}
                <rect x="80" y="408" width="140" height="50" rx="8" fill={skeletonColor} />

                {/* Opened - second step */}
                <rect x="320" y="320" width="140" height="50" rx="8" fill={skeletonColor} />

                {/* Signup - third step */}
                <rect x="560" y="240" width="140" height="50" rx="8" fill={skeletonColor} />

                {/* Subscribe - fourth step */}
                <rect x="800" y="160" width="140" height="50" rx="8" fill={skeletonColor} />

                {/* Watched - top right */}
                <rect x="1040" y="80" width="140" height="50" rx="8" fill={skeletonColor} />

                {/* Failed - bottom right */}
                <rect x="1040" y="408" width="140" height="50" rx="8" fill={skeletonColor} />

                {/* === Smaller percentage boxes below main flow === */}
                <rect x="590" y="380" width="80" height="30" rx="4" fill={skeletonColor} />
                <rect x="830" y="380" width="80" height="30" rx="4" fill={skeletonColor} />

                {/* === Solid success path connections (thinner lines, larger arrows) === */}
                {/* Installed → Opened */}
                <path
                    d="M 220 425 L 280 425 L 280 345 L 320 345"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <polygon points="320,345 312,338 312,352" fill={skeletonColor} />

                {/* Opened → Signup */}
                <path
                    d="M 460 345 L 520 345 L 520 265 L 560 265"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <polygon points="560,265 552,258 552,272" fill={skeletonColor} />

                {/* Signup → Subscribe */}
                <path
                    d="M 700 265 L 760 265 L 760 185 L 800 185"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <polygon points="800,185 792,178 792,192" fill={skeletonColor} />

                {/* Subscribe → Watched */}
                <path
                    d="M 940 185 L 1000 185 L 1000 105 L 1040 105"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <polygon points="1040,105 1032,98 1032,112" fill={skeletonColor} />

                {/* === Dashed failure paths (corrected connections) === */}
                {/* Installed → Failed (bottom horizontal line) */}
                <path
                    d="M 220 450 L 1040 450"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                    strokeLinecap="round"
                />
                <polygon points="1040,450 1032,443 1032,457" fill={skeletonColor} />

                {/* Opened → Intermediate box (vertical dashed line) */}
                <path
                    d="M 390 370 L 390 395"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                />

                {/* Signup → Intermediate box (vertical dashed line) */}
                <path
                    d="M 630 290 L 630 380"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                />

                {/* Subscribe → Intermediate box (vertical dashed line) */}
                <path
                    d="M 870 210 L 870 380"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                />

                {/* Horizontal dashed lines from intermediate boxes */}
                <path
                    d="M 390 395 L 590 395"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                />
                <path
                    d="M 630 395 L 830 395"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                />

                {/* Vertical dashed line connecting all horizontal lines */}
                <path
                    d="M 830 395 L 830 420"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                />

                {/* Final horizontal dashed line to Failed box */}
                <path
                    d="M 830 420 L 1040 420"
                    stroke={skeletonColor}
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                />
                <polygon points="1040,420 1032,413 1032,427" fill={skeletonColor} />
            </svg>

            {/* === Loading Animation Overlay (only show when not error) === */}
            {!isError && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 10
                }}>
                    {/* Animated shimmer effect for main boxes */}
                    <div style={{
                        position: 'absolute',
                        top: '80px',
                        left: '1040px',
                        width: '140px',
                        height: '50px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shimmer 2s infinite',
                        borderRadius: '8px'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '160px',
                        left: '800px',
                        width: '140px',
                        height: '50px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shimmer 2s infinite 0.2s',
                        borderRadius: '8px'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '240px',
                        left: '560px',
                        width: '140px',
                        height: '50px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shimmer 2s infinite 0.4s',
                        borderRadius: '8px'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '320px',
                        left: '320px',
                        width: '140px',
                        height: '50px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shimmer 2s infinite 0.6s',
                        borderRadius: '8px'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '400px',
                        left: '80px',
                        width: '140px',
                        height: '50px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shimmer 2s infinite 0.8s',
                        borderRadius: '8px'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '400px',
                        left: '1040px',
                        width: '140px',
                        height: '50px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shimmer 2s infinite 1s',
                        borderRadius: '8px'
                    }} />

                    {/* Animated shimmer for percentage boxes */}
                    <div style={{
                        position: 'absolute',
                        top: '380px',
                        left: '350px',
                        width: '80px',
                        height: '30px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite 1.2s',
                        borderRadius: '4px'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '380px',
                        left: '590px',
                        width: '80px',
                        height: '30px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite 1.4s',
                        borderRadius: '4px'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '380px',
                        left: '830px',
                        width: '80px',
                        height: '30px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite 1.6s',
                        borderRadius: '4px'
                    }} />
                </div>
            )}

            {!isError && (
                <style>
                    {`
                        @keyframes shimmer {
                            0% {
                                transform: translateX(-100%);
                            }
                            100% {
                                transform: translateX(100%);
                            }
                        }
                    `}
                </style>
            )}
        </div>
    );
};




export const FlowChartSkeleton = () => {
    const boxStyle = {
        backgroundColor: "#e9e9e9",
        color: "transparent",
        width: "100px",
        height: "40px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const lineStyle = {
        stroke: "#e9e9e9",
        strokeWidth: 2,
        fill: "none",
    };

    const dashedLineStyle = {
        ...lineStyle,
        strokeDasharray: "5,5",
    };

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "500px",
                backgroundColor: "white",
            }}
        >
            <svg width="100%" height="100%">
                {/* arrows (straight and dashed lines) */}
                <defs>
                    <marker
                        id="arrow"
                        markerWidth="10"
                        markerHeight="10"
                        refX="6"
                        refY="3"
                        orient="auto"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="#e9e9e9" />
                    </marker>
                </defs>

                {/* main flow (Installed → Opened → Signup → Subscribe → Watched) */}
                <path
                    d="M120 60 L220 140"
                    style={lineStyle}
                    markerEnd="url(#arrow)"
                />
                <path
                    d="M320 220 L420 300"
                    style={lineStyle}
                    markerEnd="url(#arrow)"
                />
                <path
                    d="M520 380 L620 460"
                    style={lineStyle}
                    markerEnd="url(#arrow)"
                />

                {/* dashed lines to Failed */}
                <path
                    d="M220 140 L750 60"
                    style={dashedLineStyle}
                    markerEnd="url(#arrow)"
                />
                <path
                    d="M420 300 L750 60"
                    style={dashedLineStyle}
                    markerEnd="url(#arrow)"
                />
                <path
                    d="M620 460 L750 60"
                    style={dashedLineStyle}
                    markerEnd="url(#arrow)"
                />

                {/* nodes */}
                <foreignObject x="40" y="40" width="100" height="40">
                    <div style={boxStyle}>Installed</div>
                </foreignObject>
                <foreignObject x="180" y="120" width="100" height="40">
                    <div style={boxStyle}>Opened</div>
                </foreignObject>
                <foreignObject x="340" y="200" width="100" height="40">
                    <div style={boxStyle}>Signup</div>
                </foreignObject>
                <foreignObject x="500" y="360" width="100" height="40">
                    <div style={boxStyle}>Subscribe</div>
                </foreignObject>
                <foreignObject x="660" y="520" width="100" height="40">
                    <div style={boxStyle}>Watched</div>
                </foreignObject>
                <foreignObject x="740" y="40" width="100" height="40">
                    <div style={boxStyle}>Failed</div>
                </foreignObject>
            </svg>
        </div>
    );
};



export const ConsumptionsChannelSkeleton = ({ isError = false, count = 12 }) => {
    return (
        <div
            className="skeleton-span-con p0"
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                justifyItems: "center",
            }}
        >
            {isError && (<NoData />)}
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="position-relative portlet-container skeleton-channel-portlet"
                    style={{
                        height: "120px",
                        width: "295px",
                        borderRadius: "8px",
                    }}
                >
                    <div className="d-flex align-items-center mb15">
                        <div className="skeleton-icon me-2"></div>
                        <div className="skeleton-text skeleton-title"></div>
                    </div>
                    <div className="align-content-center justify-content-center mx-auto skeleton-count"></div>
                    <div className="skeleton-info-icon"></div>
                </div>
            ))}
        </div>
    );
};

export const ApprovalStatusSkeleton = ({ isError = false, selectedTab = 'Communication' }) => {
    return (
        <div className="skeleton-span-con p0">
            {isError && <NoData className={'top150'} text={selectedTab === 'Communication' ? NO_COMMUNICATION_APPROVER : NO_APPROVER} />}
            <div className="portlet-body px2">
                {selectedTab === 'Communication' && (
                    <div>
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <ul
                                className="align-items-center d-flex justify-content-between approval_list"
                                key={idx}
                            >
                                <li>
                                    <small>
                                        <Skeleton
                                            enableAnimation={!isError}
                                            height={12}
                                            width={140}
                                            style={{ background: '#e9e9e9' }}
                                        />
                                    </small>
                                    <h5>
                                        <Skeleton
                                            enableAnimation={!isError}
                                            height={18}
                                            width={180}
                                            style={{ background: '#e9e9e9' }}
                                        />
                                    </h5>
                                    <span>
                                        <Skeleton
                                            enableAnimation={!isError}
                                            height={14}
                                            width={220}
                                            style={{ background: '#e9e9e9' }}
                                        />
                                    </span>
                                </li>
                                <li className="text-right">
                                    <h4>
                                        <Skeleton
                                            enableAnimation={!isError}
                                            height={20}
                                            width={120}
                                            style={{ background: '#e9e9e9' }}
                                        />
                                    </h4>
                                </li>
                            </ul>
                        ))}
                    </div>
                )}
                {selectedTab === 'List' && (
                    <div>
                        {/* Header section with "Approved by" and list name */}
                        <div className="align-items-center d-flex justify-content-between approval_list mb0 p19 border-0">
                            <h4>
                                <Skeleton
                                    enableAnimation={!isError}
                                    height={18}
                                    width={100}
                                    style={{ background: '#e9e9e9' }}
                                />
                            </h4>
                            <h5>
                                <strong>
                                    <Skeleton
                                        enableAnimation={!isError}
                                        height={18}
                                        width={200}
                                        style={{ background: '#e9e9e9' }}
                                    />
                                </strong>
                            </h5>
                        </div>
                        {/* List items */}
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <ul
                                className="align-items-center d-flex justify-content-between approval_list"
                                key={idx}
                            >
                                <li>
                                    <h5>
                                        <Skeleton
                                            enableAnimation={!isError}
                                            height={18}
                                            width={180}
                                            style={{ background: '#e9e9e9', marginBottom: '5px' }}
                                        />
                                    </h5>
                                    <span>
                                        <Skeleton
                                            enableAnimation={!isError}
                                            height={14}
                                            width={220}
                                            style={{ background: '#e9e9e9' }}
                                        />
                                    </span>
                                </li>
                                <li>
                                    <small>
                                        <Skeleton
                                            enableAnimation={!isError}
                                            height={20}
                                            width={120}
                                            style={{ background: '#e9e9e9' }}
                                        />
                                    </small>
                                </li>
                            </ul>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/** Tabber skeleton: mimics the SplitHeader bar (date range, audience dropdown, filter icons) in neutral skeleton color. Use hideWhenSplitHeader on the loader when SplitHeader is visible. */
export const BlueTabberSkeleton = ({ stopAnimation }) => (
    <div className="d-flex justify-content-end align-items-center mt10 tabber-skeleton-bar">
        <div className="d-flex align-items-center tabber-skeleton-bar__inner">
            <CommonSkeleton box height={24} width={180} mainClass="mr15" stopAnimation={stopAnimation} />
            <CommonSkeleton circle height={20} width={20} mainClass="mr10" stopAnimation={stopAnimation} />
            <CommonSkeleton circle height={20} width={20} stopAnimation={stopAnimation} />
        </div>
    </div>
);

/** Detail analytics channel tab — neutral gray bar only (no active blue / shimmer). */
export const DetailAnalyticsTabSkeleton = ({ className = '' }) => (
    <div className={`detail-analytics-tab-skeleton-wrap ${className}`.trim()} aria-hidden="true">
        <ul className="detail-analytics-tab-skeleton rs-tabs row detail-tabs mb0 w-100 m-0">
            <li className="tabDefault">
                <span
                    className="skeleton-shimmer d-inline-block"
                    style={{
                        width: 120,
                        height: 28,
                        borderRadius: 4,
                        verticalAlign: 'middle',
                    }}
                />
            </li>
        </ul>
    </div>
);

/** Tab + portlet loaders (no page header). */
export const DetailAnalyticsBodySkeleton = ({ hideTabbarSkeleton = true }) => (
    <>
        <DetailAnalyticsTabSkeleton />
        <DetailAnalyticsChannelPortletLoader hideTabbarSkeleton={hideTabbarSkeleton} />
    </>
);


/** Overview section header: "Overview (As on: ...)" text skeleton + eye icon circle + info icon circle */
export const OverviewHeaderSkeleton = ({ stopAnimation }) => (
    <div className="d-flex justify-content-between mb10 mt10 clear-both position-relative z-1">
        <div className="d-flex align-items-center">
            <CommonSkeleton box height={25} width={87} mainClass="pr10 mb-0" stopAnimation={stopAnimation} />
            <CommonSkeleton box height={25} width={183} mainClass="pr10" stopAnimation={stopAnimation} />
            <CommonSkeleton circle height={24} width={24} mainClass="ml5" stopAnimation={stopAnimation} />
        </div>
        <div className="d-flex align-items-center">
            <CommonSkeleton circle height={24} width={24} mainClass="ml15" stopAnimation={stopAnimation} />
        </div>
    </div>
);

const REPORT_OVERVIEW_COLUMN_LABEL_WIDTHS = [55, 95, 85];
const REPORT_OVERVIEW_COLUMN_BAR_WIDTHS = ['43%', '16%', '16%'];
const REPORT_OVERVIEW_COLUMN_COUNT_WIDTHS = [90, 70, 85];

/** Column chart skeleton for OverviewCard (Reach / Engagement / Conversion segmented bars). */
export const ReportOverviewColumnChartSkeleton = ({ stopAnimation, isError, rowCount = 3 }) => {
    const rows = Array.from({ length: rowCount });
    const shouldStopAnimation = stopAnimation ?? isError;

    return (
        <div className="skeleton-span-con">
            {isError ? (
                <div className="nodata-bar">
                    <Icon icon={alert_medium} size="md" color="color-primary-orange" nocp />
                    <p>No data available</p>
                </div>
            ) : null}
            <div className="attri-roi-contianer report-overview-port skeleton-report-overview-column" aria-hidden="true">
                <ul>
                    {rows.map((_, index) => (
                        <li key={index}>
                            <div className="attri-icon-set">
                                <div className="attri-icon">
                                    <CommonSkeleton
                                        box
                                        height={24}
                                        width={REPORT_OVERVIEW_COLUMN_LABEL_WIDTHS[index] ?? 70}
                                        stopAnimation={shouldStopAnimation}
                                    />
                                </div>
                            </div>
                            <ul className="attri-progress-set">
                                <li
                                    className="skeleton-report-overview-bar"
                                    style={{ width: REPORT_OVERVIEW_COLUMN_BAR_WIDTHS[index] ?? '30%' }}
                                >
                                    <div className="attri-pro-set-block">
                                        <CommonSkeleton box height={32} stopAnimation={shouldStopAnimation} />
                                        {/* <CommonSkeleton
                                            box
                                            height={12}
                                            width={REPORT_OVERVIEW_COLUMN_COUNT_WIDTHS[index] ?? 70}
                                            stopAnimation={shouldStopAnimation}
                                            mainClass="skeleton-report-overview-count"
                                        /> */}
                                    </div>
                                </li>
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

/** Single overview card skeleton (Reach/Engagement/Conversion): circle icon, title, value, sub-metrics, comparison bar */
export const OverviewCardSkeleton = ({ stopAnimation }) => (
    <div className="csr-reach-portlet skeleton-overview-card">
        <div className="portlet-count-top">
            <div className="campaignimage d-flex align-items-center">
                <CommonSkeleton circle height={45} width={45} mainClass="mr10" stopAnimation={stopAnimation} />
                <CommonSkeleton box height={25} width={55} stopAnimation={stopAnimation} />
            </div>
            <div className="campaign-portlet-data">
                <CommonSkeleton box height={25} width={25} stopAnimation={stopAnimation} />
            </div>
        </div>
        <div className="portlet-count-middle">
            <ul className="pl0 mb0">
                <li className="pl0">
                    <CommonSkeleton box height={25} width={47} className='mr7' stopAnimation={stopAnimation} />
                    <CommonSkeleton box height={25} width={30} stopAnimation={stopAnimation} />
                </li>
                <li className="pl0">
                    <CommonSkeleton box height={25} width={80} className='mr7' stopAnimation={stopAnimation} />
                    <CommonSkeleton box height={25} width={30} stopAnimation={stopAnimation} />
                </li>
            </ul>
        </div>
        <div className="skeleton-comparison-bar" />
    </div>
);

/** Inline loader under live RSPageHeader while channel tabs load. */
export const DetailAnalyticsListingLoader = () => (
    <Container fluid>
        <Container className="px0">
            <div className="page-content pc-analytics">
                <DetailAnalyticsBodySkeleton hideTabbarSkeleton />
            </div>
        </Container>
    </Container>
);

/** Wraps skeleton content and overlays "No data available" centered on top so skeletons remain visible. noDataClassName optional (e.g. mt45 for grid). */
const SkeletonWithNoDataCenter = ({ children, noDataClassName }) => (
    <div className="position-relative">
        {children}
        <div className={`position-absolute d-flex align-items-center justify-content-center ${noDataClassName || ''}`.trim()} style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <NoData text="No data available" />
        </div>
    </div>
);

/** Per-portlet loader for channel content: Overview header + cards, chart-specific (line, bar, pie) + Communication status grid. When isError, keeps loading skeletons and shows "No data available" centered in each portlet. Set hideTabbarSkeleton when SplitHeader is visible (e.g. fromSplitHeader) so the tabbar skeleton is not shown. */
export const DetailAnalyticsChannelPortletLoader = ({ isError = false, hideTabbarSkeleton = false }) => (
    <>
        {!hideTabbarSkeleton && <BlueTabberSkeleton stopAnimation={isError} />}
        <OverviewHeaderSkeleton stopAnimation={isError} />
        <Row>
            <Col>
                {isError ? <SkeletonWithNoDataCenter><OverviewCardSkeleton stopAnimation={isError} /></SkeletonWithNoDataCenter> : <OverviewCardSkeleton />}
            </Col>
            <Col>
                {isError ? <SkeletonWithNoDataCenter><OverviewCardSkeleton stopAnimation={isError} /></SkeletonWithNoDataCenter> : <OverviewCardSkeleton />}
            </Col>
            <Col className='pr0'>
                {isError ? <SkeletonWithNoDataCenter><OverviewCardSkeleton stopAnimation={isError} /></SkeletonWithNoDataCenter> : <OverviewCardSkeleton />}
            </Col>
        </Row>
        <Row>
            <div className="portlet-heading mb15 mt-7">
                <CommonSkeleton box height={20} width={220} stopAnimation={isError} />
            </div>
            <Col md={8} className="position-relative">
                <div className="portlet-container portlet-md">
                    <div className="portlet-header d-flex justify-content-between align-items-center">
                        <CommonSkeleton box height={23} width={50} stopAnimation={isError} />
                        <div className="d-flex align-items-center skeleton-portlet-header-tabs">
                            <CommonSkeleton box height={23} width={70} stopAnimation={isError} />
                            <span className="skeleton-portlet-header-pipe mt2">|</span>
                            <CommonSkeleton box height={23} width={70} stopAnimation={isError} />
                        </div>
                    </div>
                    <div className="portlet-chart position-relative">
                        <LineChartSkeleton stopAnimation={isError} />
                        {isError && (
                            <div className="position-absolute d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                                <NoData text="No data available" />
                            </div>
                        )}
                    </div>
                </div>
            </Col>
            <Col md={4}>
                <div className="portlet-container portlet-md">
                    <div className="portlet-header">
                        <CommonSkeleton box height={20} width={120} stopAnimation={isError} />
                    </div>
                    <div className="portlet-body position-relative">
                        <DetailKeyMetricSkeleton isError={isError} hideInternalNoData />
                        {isError && (
                            <div className="position-absolute d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                                <NoData text="No data available" />
                            </div>
                        )}
                    </div>
                </div>
            </Col>
        </Row>
        <Row>
            <Col md={6} className="x-axis-labels-performance">
                <div className="portlet-container portlet-md">
                    <div className="portlet-header">
                        <CommonSkeleton box height={20} width={100} stopAnimation={isError} />
                    </div>
                    <div className="portlet-chart position-relative">
                        <LineChartSkeleton stopAnimation={isError} />
                        {isError && (
                            <div className="position-absolute d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                                <NoData text="No data available" />
                            </div>
                        )}
                    </div>
                </div>
            </Col>
            <Col md={6}>
                <div className="portlet-container portlet-md">
                    <div className="portlet-header">
                        <CommonSkeleton box height={20} width={100} stopAnimation={isError} />
                    </div>
                    <div className="portlet-chart position-relative">
                        <ColumnChartSkeleton isError={isError} hideInternalNoData />
                        {isError && (
                            <div className="position-absolute d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                                <NoData text="No data available" />
                            </div>
                        )}
                    </div>
                </div>
            </Col>
        </Row>
        <Row>
            <div className="portlet-heading my15">
                <CommonSkeleton box height={24} width={180} stopAnimation={isError} />
            </div>
            <Col md={6}>
                <div className="portlet-container portlet-md">
                    <div className="portlet-header">
                        <CommonSkeleton box height={20} width={140} stopAnimation={isError} />
                    </div>
                    <div className="portlet-chart position-relative">
                        <PieChartSkeleton isError={isError} hideInternalNoData />
                        {isError && (
                            <div className="position-absolute d-flex align-items-center justify-content-center mt-25" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                                <NoData text="No data available" />
                            </div>
                        )}
                    </div>
                </div>
            </Col>
            <Col md={6}>
                <div className="portlet-container portlet-md">
                    <div className="portlet-header">
                        <CommonSkeleton box height={20} width={140} stopAnimation={isError} />
                    </div>
                    <div className="portlet-chart position-relative">
                        <PieChartSkeleton isError={isError} hideInternalNoData />
                        {isError && (
                            <div className="position-absolute d-flex align-items-center justify-content-center mt-25" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                                <NoData text="No data available" />
                            </div>
                        )}
                    </div>
                </div>
            </Col>
        </Row>
        <Row>
            <Col>
                {isError ? (
                    <>
                        <SkeletonWithNoDataCenter noDataClassName="mt90"><TotalLinkPortletSkeleton stopAnimation={isError} /></SkeletonWithNoDataCenter>
                        <SkeletonWithNoDataCenter noDataClassName="mt90"><CommunicationStatusPortletSkeleton stopAnimation={isError} /></SkeletonWithNoDataCenter>
                    </>
                ) : (
                    <>
                        <TotalLinkPortletSkeleton/>
                        <CommunicationStatusPortletSkeleton />
                    </>
                )}
            </Col>
        </Row>
    </>
);

export const PredictiveAnalysisSkeleton = ({ isError = true }) => {
    return (
        <div className="skeleton-span-con p0">
            {isError && <NoData className={'top140'} />}
            <div className="portlet-body d-flex flex-column justify-content-around mt30">
                {/* Progress bars section */}
                {Array.from({ length: 3 }).map((_, idx) => (
                    <div className="d-flex align-items-center progress-reach" key={idx} style={{ marginBottom: '20px' }}>
                        <Col sm={3}>
                            <div className="text-right mr15">
                                <Skeleton
                                    enableAnimation={!isError}
                                    height={18}
                                    width={80}
                                    style={{ background: '#e0e5eb', marginLeft: 'auto' }}
                                />
                            </div>
                        </Col>
                        <Col sm={9}>
                            <div style={{ position: 'relative', width: '100%' }}>
                                {/* Progress bar background */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: '30px',
                                        backgroundColor: '#e0e5eb',
                                        borderRadius: '4px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >


                                </div>
                            </div>
                        </Col>
                    </div>
                ))}

                {/* Insights section */}
                <>
                    <div className="mt40 mb0 ml6">
                        <Skeleton
                            enableAnimation={!isError}
                            height={24}
                            width={100}
                            style={{ background: '#e0e5eb' }}
                        />
                    </div>
                    <div className="predictive_analysis_list mt10 border-0">
                        {Array.from({ length: 2 }).map((_, idx) => (
                            <div key={idx} style={{ marginBottom: '15px' }}>
                                <Skeleton
                                    enableAnimation={!isError}
                                    height={16}
                                    width={idx === 0 ? '90%' : '90%'}
                                    style={{
                                        background: idx === 1 ? '#e9e9e9' : '#e0e5eb',
                                        borderRadius: '4px',
                                        padding: '10px'
                                    }}
                                />
                                <Skeleton
                                    enableAnimation={!isError}
                                    height={16}
                                    width={idx === 0 ? '30%' : '30%'}
                                    style={{
                                        background: idx === 1 ? '#e9e9e9' : '#e0e5eb',
                                        borderRadius: '4px',
                                        padding: '10px'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </>
            </div>
        </div>
    );
};

export const ThemeSkeleton = ({
    isError = false,
    message = 'No data available',
}) => {
    const OUTER_COLORS = ['#e0e5eb', '#e0e5eb', '#e9e9e9', '#e0e5eb', '#e0e5eb', '#e9e9e9'];
    const BORDER_COLORS = ['#e0e5eb', '#e9e9e9', '#e9e9e9', '#e0e5eb', '#e9e9e9', '#e9e9e9'];
    const INNER_COLORS = ['#e0e5eb', '#e0e5eb', '#e0e5eb', '#e0e5eb', '#e0e5eb', '#e0e5eb'];

    return (
        <div className="skeleton-span-con p0">
            {isError && <NoData text={message} />}

            <div className="theme-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="theme-card"
                        style={{
                            borderRadius: 8,
                            border: `1px solid ${BORDER_COLORS[index] || '#e0e5eb'}`,
                            padding: 5,
                            cursor: 'default',
                        }}
                    >
                        <div
                            className="theme-card-preview d-flex align-items-center"
                            style={{ gap: 8 }}
                        >
                            {/* Inner field */}
                            <div
                                style={{
                                    backgroundColor: INNER_COLORS[index] || '#e0e5eb',
                                    borderRadius: 4,
                                    border: '1px solid #e0e5eb',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 20,
                                    padding: '0 8px',
                                }}
                            >
                                <CommonSkeleton
                                    box
                                    height={12}
                                    width="65%"
                                    stopAnimation={isError}
                                    className="mb0"
                                />
                            </div>

                            {/* Icon */}
                            <CommonSkeleton
                                icon
                                height={16}
                                width={16}
                                stopAnimation={isError}
                                className="mb0"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Snippet Template Skeleton - Grid layout for offer snippets
export const SnippetTemplateSkeleton = ({ isError = false, message = 'No data available' }) => {
    return (
        <div className="skeleton-span-con p0">
            {isError && <NoData text={message} />}

            <Row>
                {Array.from({ length: 6 }).map((_, index) => (
                    <Col key={index} md={4} className="mb20">
                        <div
                            className="snippet-template-skeleton-card position-relative"
                            style={{
                                border: '1px solid #e0e5eb',
                                borderRadius: '8px',
                                padding: '12px',
                                backgroundColor: '#fff',
                                height:'287px'
                            }}
                        >
                            {/* Header with date and title */}
                            <div className=''>
                                 <CommonSkeleton
                                    box
                                    height={14}
                                    width={152}
                                    stopAnimation={isError}
                                    className = 'position-absolute'

                                />
                                <CommonSkeleton
                                    box
                                    height={16}
                                    width={130}
                                    stopAnimation={isError}
                                    className = 'position-absolute top31'

                                />
                            </div>

                            {/* Image/Template preview area */}
                              <CommonSkeleton
                                    box
                                    height={223}
                                    width={195}
                                    stopAnimation={isError}
                                    className = 'position-relative bottom21'

                                />
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export const SyncHistoryPipeLineGraphSkeleton = ({ isError = false }) =>{
    const FlowNode = ({ top, left }) => (
        <div style={{ position: 'absolute', top, left, transform: 'translateY(-50%)', width: '220px', height: '100px', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', backgroundColor: '#fff', zIndex: 2 }}>
            <div className='position-relative top-11' style={{ display: 'flex', flexDirection: 'column' }}>
                <Skeleton width="80%" height={12} borderRadius={4} enableAnimation={!isError} />
                <Skeleton width="50%" height={12} borderRadius={4} enableAnimation={!isError} />
                <Skeleton width="40%" height={20} borderRadius={4} enableAnimation={!isError} />
            </div>
        </div>
    );

    return ( 
         <div className='skeleton-span-con p0'>
                        {isError && <NoData />}
            <div className="box-design no-box-shadow " style={{ position: 'relative', height: '600px', overflowX: 'auto', overflowY: 'hidden', backgroundColor: '#fff', borderRadius: '12px' }}>
                <div style={{ position: 'relative', minWidth: '1050px', height: '100%' }}>
                    {/* Dots background (simulating react-flow background) */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3, zIndex: 0 }}></div>

                    {/* Edges */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                        {/* Straight linear connectors */}
                        <path d="M 270 300 L 320 300" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                        <path d="M 540 300 L 590 300" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                        <path d="M 810 300 L 860 300" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                    </svg>

                    {/* Nodes */}
                    <FlowNode top="300px" left="50px" />
                    <FlowNode top="300px" left="320px" />
                    <FlowNode top="300px" left="590px" />
                    <FlowNode top="300px" left="860px" />
                </div>
            </div>
         </div>)
}

export const SyncHistoryPipelineSkeleton = ({ isError = false }) => {
    const items = [1,2,3,4,5,6];

    return (
        <div className="skeleton-span-con p0">
            {isError && <NoData />}
			  <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }} className='mt40'>
                  {items.map((_, i) => (
                        <div
                            key={`skel-top-${i}`}
                            style={{
                            flex: 1,
                            borderRight: i !== items.length - 1 ? "1px solid #e0e5eb" : "none"
                            }}
                        >
                            <div>
                            <Skeleton width="60%" height={14} borderRadius={4} enableAnimation={!isError} />
                            </div>
                            <div>
                            <Skeleton width="90%" height={24} borderRadius={6} enableAnimation={!isError} />
                            </div>
                        </div>
                        ))}
                </div>
          <SyncHistoryPipeLineGraphSkeleton isError={isError}/>
        </div>
    );
};

export const TimelineSkeleton = ({ isError = false }) => {
    const eventCount = 5;
    const skeletonCardStyle = {
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        position: 'relative',
        width: '296px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        border: `1px solid ${scolor1}`,
        height:'135px',
    };
    const skeletonCardStyleLeft = {
        ...skeletonCardStyle,
        alignItems: 'flex-start',
        textAlign: 'left',
    };
    const centralLineStyle = {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '1px',
        marginLeft: '-1px',
        backgroundColor: scolor1,
    };
    const circleStyle = {
        borderRadius: '50%',
        position: 'absolute',
        top: 'calc(50% - 15px)',
        right: '-45px',
        width: '30px',
        height: '30px',
        zIndex: 100,
        backgroundColor: scolor1,
    };
    const circleStyleLeft = {
        ...circleStyle,
        right: 'auto',
        left: '-45px',
    };
    const triangleRight = {
        position: 'absolute',
        right: '-7.5px',
        top: 'calc(50% - 7.5px)',
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderLeft: `8px solid ${scolor1}`,
    };
    const triangleLeft = {
        position: 'absolute',
        left: '-7.5px',
        top: 'calc(50% - 7.5px)',
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderRight: `8px solid ${scolor1}`,
    };

    return (
        <div className={`skeleton-span-con p0 audience-timeline-skeleton position-relative${isError ? ' no-animation' : ''}`}>
            {isError ? (
                <div
                    className="audience-timeline-skeleton__nodata-overlay d-flex align-items-center justify-content-center w-100 h-100"
                    aria-hidden="true"
                >
                    <NoData className="nodata-skeleton-con" />
                </div>
            ) : null}
            <div className="p15">
                {/* Top date dropdown */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '' }}>
              
                        <Skeleton
                            width={150}
                            height={40}
                            borderRadius={4}
                            enableAnimation={!isError}
                            baseColor={scolor1}
                            highlightColor={scolor2}
                        />
                     
                </div>

                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Central vertical line */}
                    <div style={centralLineStyle} />

                    {Array(eventCount)
                        .fill(0)
                        .map((_, idx) => {
                            const isLeft = idx % 2 === 0;
                            return (
                                <div
                                    key={`timeline-skel-${idx}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isLeft ? 'flex-end' : 'flex-start',
                                        paddingLeft: isLeft ? 0 : '30px',
                                        paddingRight: isLeft ? '30px' : 0,
                                        position: 'relative',
                                        margin: '10px 0',
                                        width: '50%',
                                        alignSelf: isLeft ? 'flex-start' : 'flex-end',
                                    }}
                                >
                                    <div
                                        style={isLeft ? skeletonCardStyleLeft : skeletonCardStyle}
                                        className= {idx ===0 ? 'top21': ''}
                                    >
                                        {/* Triangle pointer: left card = pointer on right; right card = pointer on left */}
                                        <div style={isLeft ? triangleRight : triangleLeft} />
                                        {/* Card content */}
                                        <div style={{ width: '100%' }}>
                                                   <div className='d-flex gap-2 align-items-center border-bottom p10'>
                                                     <Skeleton
                                                        circle
                                                        width={24}
                                                        height={24}
                                                        enableAnimation={!isError}
                                                        baseColor={scolor1}
                                                        highlightColor={scolor2}
                                                    />
                                                     <Skeleton
                                                    width={150}
                                                    height={20}
                                                        enableAnimation={!isError}
                                                        baseColor={scolor1}
                                                        highlightColor={scolor2}
                                                    />
                                                    </div>
                                                  <div className='p10'>
                                                      
                                                <Skeleton
                                                    width={150}
                                                    height={20}
                                                    enableAnimation={!isError}
                                                    baseColor={scolor1}
                                                    highlightColor={scolor2}
                                                />
                                                <Skeleton
                                                    width={150}
                                                    height={20}
                                                    enableAnimation={!isError}
                                                    baseColor={scolor1}
                                                    highlightColor={scolor2}
                                                    style={{ marginTop: 5 }}
                                                />
                                              
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                    marginTop: '-21px',
                                                }}
                                            >
                                                <Skeleton
                                                    circle
                                                    width={18}
                                                    height={18}
                                                    enableAnimation={!isError}
                                                    baseColor={scolor1}
                                                    highlightColor={scolor2}
                                                />
                                                                                              </div>

                                                    </div>
                                        </div>
                                        {/* Connector line with percentage */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                [isLeft ? 'right' : 'left']: '-45px',
                                                width: '30px',
                                                height: '1px',
                                                backgroundColor: scolor1,
                                                transform: 'translateY(-50%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Skeleton
                                                width={28}
                                                height={12}
                                                borderRadius={2}
                                                enableAnimation={!isError}
                                                baseColor={scolor1}
                                                highlightColor={scolor2}
                                                style={{ marginTop: 0 }}
                                            />
                                        </div>
                                        {/* Circle marker on timeline: left card = circle on right; right card = circle on left */}
                                        <div style={isLeft ? circleStyle : circleStyleLeft}>
                                           
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    {/* Bottom: year + LOAD OLDER EVENTS */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <Skeleton
                            width={40}
                            height={16}
                            borderRadius={4}
                            enableAnimation={!isError}
                            baseColor={scolor1}
                            highlightColor={scolor2}
                        />
                           <Skeleton
                            width={150}
                            height={40}
                            borderRadius={4}
                            enableAnimation={!isError}
                            baseColor={scolor1}
                            highlightColor={scolor2}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

