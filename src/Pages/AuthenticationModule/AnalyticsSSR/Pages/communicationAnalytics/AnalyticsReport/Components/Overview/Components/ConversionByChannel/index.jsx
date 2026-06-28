import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { user_identified_mini, user_mini, user_question_mark_edge_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import _get from 'lodash/get';
import { getConversionByChannel } from 'Reducers/analyticsSSR/analyticsSummary/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { getSummaryList } from 'Reducers/analyticsSSR/analyticsSummary/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { getConversionChannelConfig } from './constants';

const ConversionByChannel = ({ date, downloadUI }) => {
    const dispatch = useDispatch();
    const state = useQueryParams('/AnalyticsSSE/analytics-report');
    const { departmentId,clientId,userId } = useSelector((state) => getSessionId(state));
    const summary = useSelector((state) => getSummaryList(state));
    const [conversionData, setConversionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchedForCampaignRef = useRef(null);
    const fetchInProgressRef = useRef(false);

    const transformResponseToChartData = (response) => {
        if (!response) return [];

        const categories = ['identified', 'known', 'unknown'];
        const result = [];

        const allChannelKeys = new Set();
        categories.forEach((category) => {
            const categoryData = response[category];
            if (categoryData && typeof categoryData === 'object') {
                Object.keys(categoryData).forEach((key) => allChannelKeys.add(key));
            }
        });
        const orderedChannelKeys = Array.from(allChannelKeys);

        let hasAnyNonZero = false;
        categories.forEach((category) => {
            const categoryData = response[category] || {};
            const percentage = response.percentage?.[category] ?? 0;

            let totalValue = 0;
            const channelValues = {};
            orderedChannelKeys.forEach((channel) => {
                const value = Number(categoryData[channel]) || 0;
                channelValues[channel] = value;
                totalValue += value;
            });

            const allChannels = orderedChannelKeys.map((channel) => {
                const value = channelValues[channel] || 0;
                const pct = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
                return { title: channel, value: pct, rawValue: value };
            });

            const hasData = percentage > 0 || totalValue > 0;
            if (hasData) hasAnyNonZero = true;

            if (!hasData) return;

            const channelsWithData = allChannels.filter((ch) => ch.rawValue > 0);
            const dataToShow = channelsWithData.length > 0 ? channelsWithData : allChannels;

            result.push({
                title: category.charAt(0).toUpperCase() + category.slice(1),
                value: percentage,
                icon:
                    category === 'identified'
                        ? user_identified_mini
                        : category === 'known'
                        ? user_mini
                        : user_question_mark_edge_mini,
                data: dataToShow,
            });
        });

        if (!hasAnyNonZero) return [];
        return result;
    };

    useEffect(() => {
        const campaignId = state?.from;
        if (!campaignId) {
            setLoading(false);
            setConversionData([]);
            fetchedForCampaignRef.current = null;
            return;
        }

        if (fetchedForCampaignRef.current === campaignId) {
            return;
        }
        if (fetchInProgressRef.current) {
            return;
        }

        setLoading(true);

        const campaignGUID = _get(summary, 'campaignGuid', '');
        const payload = {
            departmentId,
            campaignId,
            campaignGUID: campaignGUID,
            campaignType: summary?.campaignType || '',
            userId,
            clientId
        };

        const fetchConversionData = async () => {
            try {
                const response = await dispatch(getConversionByChannel({ payload }));
                const data = response?.data ?? response;
                if (data) {
                    const transformedData = transformResponseToChartData(data);
                    setConversionData(transformedData);
                    fetchInProgressRef.current = true;
                } else {
                    setConversionData([]);
                }
            } catch (error) {
                setConversionData([]);
                fetchedForCampaignRef.current = null;
            } finally {
                setLoading(false);
                fetchInProgressRef.current = false;
            }
        };
        if (Object?.keys(summary)?.length) {
            fetchConversionData();
        }
    }, [state?.from, departmentId, summary]);

    return (
        <Col md={6}>
            <div className="portlet-container portlet-sm">
                <div className="portlet-header">
                    <h4 className="mb0">Conversion by Channel</h4>
                </div>
                <div
                    className="portlet-body css-scrollbar pr15"
                    style={{
                        maxHeight: 320,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingBottom: 8,
                    }}
                >
                    <div className="progressbar-list d-flex flex-column pt-1">
                        {loading ? (
                            <HorizontalSkeleton size={160} className="mt-15" />
                        ) : conversionData && conversionData.length > 0 ? (
                            <>
                                {conversionData?.map((item, index) => {
                                    return (
                                        <Fragment key={item?.title + index}>
                                            <h5 className="mb10">
                                                {item?.title} audience of{' '}
                                                {item?.value != null ? (
                                                    <span className="font-bold">
                                                        {item?.value}
                                                        <sub>%</sub>
                                                    </span>
                                                ) : (
                                                    '0'
                                                )}
                                            </h5>
                                            <div className="progressbar mb2">
                                                <div className="progressbar-legend">
                                                    <div className="progressbar-dum">
                                                        {item?.data
                                                            ?.filter((items) => items.rawValue > 0)
                                                            ?.map((items, i) => {
                                                                const config = getConversionChannelConfig(items?.title);
                                                                const widthPct = Math.max(items?.value ?? 0, 0);
                                                                const barWidth = widthPct === 0 ? 0 : `${widthPct}%`;
                                                                return (
                                                                    <Fragment
                                                                        key={'conversionbychannel-' + items?.title + i}
                                                                    >
                                                                        <div
                                                                            className="progressbar-percent"
                                                                            style={{
                                                                                width: barWidth,
                                                                                backgroundColor: config.color,
                                                                            }}
                                                                        >
                                                                            {i === 0 ? (
                                                                                <i className={item?.icon}></i>
                                                                            ) : null}
                                                                            <label>
                                                                                {items?.value}
                                                                                <sub className="font-xs">%</sub>
                                                                            </label>
                                                                        </div>
                                                                    </Fragment>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pro-legend-title mb20 d-flex">
                                                {item?.data
                                                    ?.filter((items) => items.rawValue > 0)
                                                    ?.map((items) => {
                                                        const widthPct = Math.max(items?.value ?? 0, 0);
                                                        const segmentWidth = widthPct === 0 ? '0%' : `${widthPct}%`;
                                                        return (
                                                            <div style={{ width: segmentWidth }} key={items?.title}>
                                                                <small className="color-secondary-black">
                                                                    {getConversionChannelConfig(items?.title).label}
                                                                </small>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </Fragment>
                                    );
                                })}
                            </>
                        ) : (
                            <HorizontalSkeleton size={160} className="mt-15" isError={true} />
                        )}
                    </div>
                    {conversionData && conversionData.length > 0 && date && !Number.isNaN(new Date(date).getTime()) ? (
                        <small className="portlet-info-text">{`(As on: ${date})`}</small>
                    ) : null}
                </div>
            </div>
        </Col>
    );
};

export default ConversionByChannel;
