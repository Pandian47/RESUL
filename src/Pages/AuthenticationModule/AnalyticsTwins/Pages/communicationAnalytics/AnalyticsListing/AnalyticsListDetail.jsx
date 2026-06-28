import { getStatus } from 'Utils/modules/communicationStatus';
import { ACTION, CHANNEL, CONVERSION, DELIVERED, ENGAGEMENT, REACH, STATUS, TOTAL_SENT, UNDELIVERED } from './constants';
import { Fragment, useMemo } from 'react';
import _map from 'lodash/map';
import _get from 'lodash/get';
import CampaignDetailedStatus from './CampaignDetailedStatus';
import { SUBSEGMENT_NAME, FRIENDLY_NAME } from 'Pages/AuthenticationModule/Communication/CommunicationLists/constants';

import { getSortedChannels } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';
import {
    AnalyticsListDetailEmptyOverlay,
    AnalyticsListDetailSkeletonRows,
} from 'Pages/KendoDocs/CommonComponents/ResGrid/ListDetailSkeleton';
import { gridClass } from 'Pages/KendoDocs/CommonComponents/ResGrid/config';

const AnalyticsDetail = ({ dataIndex, dataItem, onCollapse }) => {
    const isFailure = dataItem?.isFailure === true;
    const isChannelsLoading = dataItem?.channelsLoading === true;

    const campaignType = _get(dataItem, 'campaignTypeValue', '').slice(0, 1);
    const finalChannelDetail = dataItem?.channels?.filter((channel) => channel?.channelId > 0);
    const isSubsegment = finalChannelDetail?.some((item) => item?.subSegmentFriendlyName) || false;
    const { className } = getStatus(dataItem?.statusID);

    const campaignChannelIds = useMemo(() => {
        const id = dataItem?.channelId;
        if (Array.isArray(id)) {
            return id.map((v) => Number(v)).filter((n) => !Number.isNaN(n) && n > 0);
        }
        if (id != null && id !== '') {
            const n = Number(id);
            return !Number.isNaN(n) && n > 0 ? [n] : [];
        }
        return [];
    }, [dataItem?.channelId]);

    const channelIdsForColumns = useMemo(() => {
        if (finalChannelDetail?.length) {
            return finalChannelDetail
                .map((ch) => Number(ch?.channelId))
                .filter((n) => !Number.isNaN(n) && n > 0);
        }
        return campaignChannelIds;
    }, [finalChannelDetail, campaignChannelIds]);

    const hideTotalSent = useMemo(
        () => channelIdsForColumns.length > 0 && channelIdsForColumns.every((id) => id === 7),
        [channelIdsForColumns],
    );

    const hideReachDelivered = useMemo(
        () =>
            channelIdsForColumns.length > 0 &&
            channelIdsForColumns.every((id) => id === 7 || id === 10),
        [channelIdsForColumns],
    );

    const hideReachColumn = useMemo(
        () => channelIdsForColumns.length > 0 && channelIdsForColumns.every((id) => id === 10),
        [channelIdsForColumns],
    );

    const sortedChannelDetail = useMemo(
        () => getSortedChannels(finalChannelDetail || []),
        [finalChannelDetail],
    );

    const groupedChannelDetail = useMemo(() => {
        if (!finalChannelDetail?.length) return [];
        const map = new Map();
        const order = [];
        finalChannelDetail.forEach((item) => {
            const detailId = item?.channelDetailID ?? item?.channeldetailId ?? 0;
            const socialId = item?.subChannelId ?? item?.socialPostChannelId ?? 0;
            const key =
                campaignType === 'M' && item?.isSplitAB
                    ? `${item.channelId}-${item.levelNumber}`
                    : campaignType === 'M'
                      ? `${item.channelId}-${detailId}-${item.levelNumber}`
                      : item.channelId == 7 || item.channelId == 10
                        ? `${item.channelId}-${socialId}-${item.levelNumber}`
                        : `${item.channelId}-${item.levelNumber}`;

            if (!map.has(key)) {
                map.set(key, []);
                order.push(key);
            }

            map.get(key).push(item);
        });

        const result = order.map((key) => {
            const group = map.get(key);

            if (group.length > 1) {
                return {
                    channelId: group[0].channelId,
                    levelNumber: group[0].levelNumber,
                    SplitDetails: group,
                    isSplitRow: true,
                    isGrouping: true,
                    splitTypes: [
                        ...new Set(group.map((i) => (i.splitType ? `Split ${i.splitType}` : null)).filter(Boolean)),
                    ],
                };
            }

            return group[0];
        });

        return getSortedChannels(result);
    }, [finalChannelDetail, campaignType]);

    const hasAnyGrouping = useMemo(
        () => groupedChannelDetail?.some((item) => item?.isGrouping),
        [groupedChannelDetail],
    );

    const showDetailSkeleton = isChannelsLoading;
    const showDetailEmpty =
        !isChannelsLoading && (isFailure || !groupedChannelDetail?.length);

    const skeletonProps = {
        campaignType,
        isSubsegment,
        hasAnyGrouping,
        hideTotalSent,
        hideReachColumn,
        hideReachDelivered,
    };

    return (
        <div className={`rs-grid-detail-view${isChannelsLoading ? ' is-detail-loading' : ''}`}>
            <div className={showDetailEmpty ? gridClass('detail-empty-wrap') : undefined}>
                <table
                    className={`grid-detail-content grid-listing-comm analytics-listing-detail${isSubsegment ? ' subsegment' : ''}${
                        hasAnyGrouping ? ' analytics-listing-detail--split-group' : ''
                    }`}
                >
                    <thead>
                    <tr>
                        {campaignType === 'M' && isSubsegment && <th className="rs-cl-col-subsegment">{SUBSEGMENT_NAME}</th>}
                        <th className="rs-cl-col-channel">{CHANNEL}</th>
                        {hasAnyGrouping && (
                            <th className="analytics-listing-detail-th-split-group" aria-hidden="true" />
                        )}
                        {campaignType === 'M' && (
                            <th
                                className={
                                    hasAnyGrouping ? 'analytics-listing-detail-th-friendly-group' : undefined
                                }
                            >
                                {FRIENDLY_NAME}
                            </th>
                        )}
                        <th>{STATUS}</th>
                        {!hideTotalSent && <th className="text-end">{TOTAL_SENT}</th>}
                        {!hideReachColumn && <th className="text-end">{REACH}</th>}
                        <th className="text-end">{ENGAGEMENT}</th>
                        <th className="text-end">{CONVERSION}</th>
                        {!hideReachDelivered && <th className="text-end">{DELIVERED}</th>}
                        {!hideReachDelivered && <th className="text-end">{UNDELIVERED}</th>}
                        <th className="text-end">{ACTION}</th>
                    </tr>
                </thead>
                    <tbody>
                        {(showDetailSkeleton || showDetailEmpty) && (
                            <AnalyticsListDetailSkeletonRows
                                {...skeletonProps}
                                animated={showDetailSkeleton}
                            />
                        )}
                        {!showDetailSkeleton && !showDetailEmpty && (
                        <Fragment>
                            {_map(groupedChannelDetail, (item, index) => {
                                const hasGrouping = item?.isGrouping;
                                const resolveIdx = (row) =>
                                    sortedChannelDetail.findIndex(
                                        (ch) =>
                                            (ch.channelDetailID ?? ch.channeldetailId) ===
                                                (row.channelDetailID ?? row.channeldetailId) &&
                                            ch.levelNumber === row.levelNumber &&
                                            (ch.splitType ?? null) === (row.splitType ?? null),
                                    );
                                if (hasGrouping) {
                                    const splitDetails = item?.SplitDetails || [];
                                    return splitDetails?.map((splitItem, splitIndex) => {
                                        const idx = resolveIdx(splitItem);
                                        return (
                                            <CampaignDetailedStatus
                                                content={{ splitIndex, ...splitItem, ...item }}
                                                dataItem={dataItem}
                                                key={`${dataItem?.campaignID ?? dataItem?.campaignId}-${index}-split-${splitIndex}`}
                                                idx={idx >= 0 ? idx : index}
                                                splitIndex={splitIndex}
                                                hasGrouping={hasAnyGrouping}
                                            />
                                        );
                                    });
                                }
                                const idx = resolveIdx(item);
                                return (
                                    <CampaignDetailedStatus
                                        content={item}
                                        dataItem={dataItem}
                                        key={`${dataItem?.campaignID ?? dataItem?.campaignId}-${index}`}
                                        idx={idx >= 0 ? idx : index}
                                        hasGrouping={hasAnyGrouping}
                                    />
                                );
                            })}
                        </Fragment>
                    )}
                    </tbody>
                </table>
                {showDetailEmpty && <AnalyticsListDetailEmptyOverlay />}
            </div>
            <div className={`${className} expand-plus`}>
                <ul className="camp-icon-pannel">
                    <li>
                        <i className="k-icon k-i-minus cursor-pointer" onClick={() => onCollapse(dataItem)}></i>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AnalyticsDetail;
