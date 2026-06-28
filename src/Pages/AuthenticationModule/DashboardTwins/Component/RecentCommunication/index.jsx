import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';

import { showPercentage, numberWithCommas } from 'Utils/modules/formatters';
import { toTitleCase } from 'Utils/modules/stringUtils';
import { DDL_RECENT_DATA } from './constant';
import { circle_info_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import { useDispatch, useSelector } from 'react-redux';

import RSPPophover from 'Components/RSPPophover';
import RSTooltip from 'Components/RSTooltip';
import RSHighchartsContainer from 'Components/Highcharts';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import DashboardSkeletonScope from 'Components/Skeleton/pages/dashboard/DashboardSkeletonScope';
import RecentCommunicationGaugesSkeleton from 'Components/Skeleton/pages/dashboard/comm/RecentCommunicationGaugesSkeleton';
import RecentGaugeCardSkeleton from 'Components/Skeleton/pages/dashboard/comm/RecentGaugeCardSkeleton';

import recentCampaignsChart from 'Constants/Charts/gaugeOptions';
import { DashboardContext } from '../../Dashboard';
import { getSessionId } from 'Reducers/globalState/selector';

import { useNavigate } from 'react-router-dom';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';

const VISIBLE_CARD_COUNT = 3;

const RecentCommunication = () => {
    const [selectedddlRecenteData, setSelectedddlRecenteData] = useState(DDL_RECENT_DATA[0]);
    const navigate = useNavigate();
    const { duration, handleRecentChange, dashboardSessionResetSeq } = useContext(DashboardContext);
    const dispatch = useDispatch();
    const { recentCampaigns } = useSelector(({ dashboardTwinsReducer }) => dashboardTwinsReducer);
    const recentCampaignsLoading = recentCampaigns?.isLoading;
    const hasRecentCampaigns = (recentCampaigns?.groupedCampaigns?.length ?? 0) > 0;
    // console.log('DASh ::: ', recentCampaignsLoading);
    const { departmentId } = useSelector((state) => getSessionId(state));
    const [activeIndex, setActiveIndex] = useState(0);
    const { licenseTypeId } = getUserDetails();
    useEffect(() => {
        setSelectedddlRecenteData(DDL_RECENT_DATA[0]);
    }, [duration, dashboardSessionResetSeq]);

    const groupedCampaigns = recentCampaigns?.groupedCampaigns;
    const showCarouselNavigation = (groupedCampaigns?.length ?? 0) > 1;

    useEffect(() => {
        setActiveIndex(0);
    }, [selectedddlRecenteData, groupedCampaigns]);

    const getCampaignUrl = (dataItem) => {
        const state = {
            from: +dataItem?.campaignId,
            campaignName: dataItem?.campaignName,
            isGolden: dataItem?.isGoldCampaign,
            startDate: new Date(dataItem?.startDate),
            endDate: new Date(dataItem?.endDate),
            campaignTypeValue: dataItem?.campaignTypeValue,
            channelId: +dataItem?.channelId,
            campaignType: dataItem?.campaignType,
        };
        if (Number(dataItem?.channelId) === 7) {
            const queryState = { campaignId: +dataItem?.campaignId, channelId: +dataItem?.channelId };
            return `/analyticstwins/detail-analytics?q=${encodeUrl(queryState)}`;
        }
        return `/analyticstwins/analytics-report?q=${encodeUrl(state)}`;
    };

    const handleNavigateCSR = (e, dataItem) => {
        e?.preventDefault();
        const state = {
            from: +dataItem?.campaignId,
            campaignName: dataItem?.campaignName,
            isGolden: dataItem?.isGoldCampaign,
            startDate: new Date(dataItem?.startDate),
            endDate: new Date(dataItem?.endDate),
            campaignTypeValue: dataItem?.campaignTypeValue,
            channelId: +dataItem?.channelId,
            campaignType: dataItem?.campaignType,
        };
        if (Number(dataItem?.channelId) === 7) {
            let state = {
                campaignId: +dataItem?.campaignId,
                channelId: +dataItem?.channelId,
            };
            const encryptState = encodeUrl(state);
            navigate(`/analyticstwins/detail-analytics?q=${encryptState}`, {
                state,
            });
        } else {
            let url = '/analyticstwins/analytics-report';
            const encryptState = encodeUrl(state);
            navigate(`${url}?q=${encryptState}`, {
                state,
            });
        }
    };

    const getRecentCampaignChannelName = (item) => {
        const channelMeta = getChannelId(item?.channelId);
        if (channelMeta?.label) return channelMeta.label;

        const fallbackChannel = String(item?.channelInfo ?? '').trim();
        return fallbackChannel || '-';
    };
    return (
        <div className="recentCommunication">
            {!recentCampaignsLoading ? (
                <div className="float-end" id="rs_RecentCommunication_ddldata">
                    <BootstrapDropdown
                        data={DDL_RECENT_DATA}
                        defaultItem={selectedddlRecenteData}
                        alignRight
                        className="recent-dropdown"
                        onSelect={(item) => {
                            setSelectedddlRecenteData(item);
                            setActiveIndex(0);
                            handleRecentChange(duration, item);
                        }}
                        showUpdate={true}
                        isActive
                    />
                </div>
            ) : null}
            <div className="clearfix"></div>
            {recentCampaignsLoading ? (
                <DashboardSkeletonScope className="db-sk-recent-comm" injectCriticalCss>
                    <RecentCommunicationGaugesSkeleton />
                </DashboardSkeletonScope>
            ) : !hasRecentCampaigns ? (
                <div className="sp-mt-space-sm sp-mb-space-md gaugeslider-wrapper noprevnext">
                    <Row>
                        {[0, 1, 2].map((index) => (
                            <Col
                                md={4}
                                key={index}
                                className="box-design gauge-slider-box d-flex flex-column justify-content-between"
                            >
                                <DashboardSkeletonScope className="db-sk-gauge-inline" injectCriticalCss>
                                    <RecentGaugeCardSkeleton isError />
                                </DashboardSkeletonScope>
                            </Col>
                        ))}
                    </Row>
                </div>
            ) : (
                <Carousel
                    key={selectedddlRecenteData}
                    className={`sp-mt-space-sm sp-mb-space-md gaugeslider-wrapper ${!showCarouselNavigation ? 'noprevnext' : ''}`}
                    indicators={showCarouselNavigation}
                    indicatorLabels={showCarouselNavigation}
                    interval={null}
                    controls={showCarouselNavigation}
                    activeIndex={activeIndex}
                    onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                >
                    {(groupedCampaigns ?? []).map((items, index) => {
                        const checkCampaignArray = (data) => {
                            if (data?.length > VISIBLE_CARD_COUNT) {
                                return data;
                            }
                            return data?.concat(new Array(VISIBLE_CARD_COUNT - data?.length).fill({}));
                        };

                        const updateCampaignArray = checkCampaignArray(items);

                        return (
                            <Carousel.Item key={index}>
                                <Row>
                                    {updateCampaignArray.map((item, index) => {
                                        return (
                                            <Col
                                                md={4}
                                                key={index}
                                                className="box-design gauge-slider-box d-flex flex-column justify-content-between"
                                            >
                                                {Object.keys(item)?.length ? (
                                                    <>
                                                        <a
                                                            href={getCampaignUrl(item)}
                                                            className="col-sm-12 cp text-decoration-none text-dark"
                                                            onClick={(e) => handleNavigateCSR(e, item)}
                                                        >
                                                            {item.campaignName ? (
                                                                item.campaignName?.length > 30 ? (
                                                                    <RSTooltip
                                                                        placement="top"
                                                                        text={item.campaignName}
                                                                        innerContent={false}
                                                                    >
                                                                        <h4 className="mb20 gauge-slider-title">
                                                                            <TruncateCell value={item.campaignName} noTable ={true}/>
                                                                        </h4>
                                                                    </RSTooltip>
                                                                ) : (
                                                                    <h4 className="mb20 gauge-slider-title">
                                                                        {item.campaignName}
                                                                    </h4>
                                                                )
                                                            ) : null}
                                                        </a>
                                                        <Row className="align-items-center">
                                                            <Col md={5} className="left-msg position-relative top12">
                                                                <span className="float-start position-relative top4">
                                                                    {toTitleCase(item.status)}
                                                                </span>
                                                                <h2 className="font-bold float-start pt5 mb0">{numberWithCommas(Math.floor(item.count))}</h2>
                                                            </Col>
                                                            <Col md={7} className="gauge-chart float-end p-0">
                                                                <div className="position-relative custom-gauge mt-15">
                                                                    <RSHighchartsContainer
                                                                        options={recentCampaignsChart(item, items)}
                                                                    />
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                        <div className="d-flex align-items-center justify-content-end">
                                                            <span className="lh17 font-xs mr5">
                                                                {/* {` ${item.startDate || ''} - ${item.endDate || ''}  `} */}
                                                                {` ${getUserCurrentFormat(item.startDate || '')?.dateFormat} - ${getUserCurrentFormat(item.endDate || '')?.dateFormat}  `}
                                                            </span>
                                                            <RSPPophover
                                                                pophover={
                                                                    <>
                                                                        <small>
                                                                            Channel: {getRecentCampaignChannelName(item)}
                                                                        </small>
                                                                        <small className='align-items-baseline d-flex'>
                                                                            Target:{' '}
                                                                            {item?.targetInfo
                                                                                .toLowerCase()
                                                                                .startsWith('r')
                                                                                ? 'Reach'
                                                                                : item?.targetInfo
                                                                                    .toLowerCase()
                                                                                    .startsWith('e')
                                                                                    ? 'Engagement'
                                                                                    : 'Conversion'}{' '}
                                                                            ({showPercentage(item.primaryTarget, 2)}<span className='fs9'>%</span>)
                                                                        </small>
                                                                        <small className='align-items-baseline d-flex'>
                                                                            Current:{' '}
                                                                            {item?.targetInfo
                                                                                .toLowerCase()
                                                                                .startsWith('r')
                                                                                ? 'Reach'
                                                                                : item?.targetInfo
                                                                                    .toLowerCase()
                                                                                    .startsWith('e')
                                                                                    ? 'Engagement'
                                                                                    : 'Conversion'}{' '}
                                                                            ({showPercentage(item.completion, 2)}<span className='fs9'>%</span>)
                                                                        </small>
                                                                    </>
                                                                }
                                                                position="top-end"
                                                                className="gaugechart-pophover"
                                                            >
                                                                <i
                                                                    className={`${circle_info_medium} icon-md color-primary-blue cursor-pointer`}
                                                                    id="rs_data_circle_info"
                                                                ></i>
                                                            </RSPPophover>
                                                        </div>{' '}
                                                    </>
                                                ) : (
                                                    <DashboardSkeletonScope className="db-sk-gauge-inline" injectCriticalCss>
                                                        <RecentGaugeCardSkeleton isError />
                                                    </DashboardSkeletonScope>
                                                )}
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Carousel.Item>
                        );
                    })}
                </Carousel>
            )}
        </div>
    );
};

export default RecentCommunication;
