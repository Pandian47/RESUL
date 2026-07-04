import { getStatus } from 'Utils/modules/communicationStatus';
import { SENT_BY_CHANNEL } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useMemo } from 'react';
import { get as _get,map as _map } from 'Utils/modules/lodashReplacements';

import DetailedStatus from './DetailedStatus';
import {
    CommunicationListDetailEmptyOverlay,
    CommunicationListDetailSkeletonRows,
} from 'Pages/KendoDocs/CommonComponents/ResGrid/ListDetailSkeleton';
import { gridClass } from 'Pages/KendoDocs/CommonComponents/ResGrid/config';

import { CHANNEL, STATUS, POST_TYPE, ACTION, FRIENDLY_NAME, SUBSEGMENT_NAME } from '../../../constants';
import SplitABScheduleModal from 'Pages/AuthenticationModule/Components/SplitABScheduler';
import { useDispatch, useSelector } from 'react-redux';
import { updatePopupContent, updatePopupModal } from 'Reducers/communication/listing/reducer';

import { getSortedChannels } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';

const CommunicationListDetail = ({ dataItem, disabled, onCollapse }) => {
    // remove offline coversion in channelDetail flow
    const channelDetails = Array.isArray(dataItem?.channelsDetails) ? dataItem.channelsDetails : [];
    const finalChannelDetail = channelDetails.filter((channel) => (channel?.channelId ?? 0) > 0);
    const isExistOfflineConversionChannel = dataItem?.channelsDetails?.some((channel) => channel?.channelId === 0);
    const campaignType = _get(dataItem, 'campaignTypeValue', '').slice(0, 1);
    const isChannelDetailsLoading = dataItem?.channelDetailsLoading === true;
    const isFailure = dataItem?.isFailure === true;
    const isOfflineOnly =
        isExistOfflineConversionChannel &&
        Array.isArray(dataItem?.channelsDetails) &&
        dataItem.channelsDetails.length === 1;
    const dispatch = useDispatch();
    const { campaignDetail = {} } = useSelector((state) => state.communicationListingReducer ?? {});
    const isSubsegment = finalChannelDetail?.some((item) => item?.subSegmentFriendlyName) || false;
    const { className, status } = getStatus(dataItem?.statusId);

    const sortedChannelDetail = useMemo(
        () => getSortedChannels(finalChannelDetail || []),
        [finalChannelDetail],
    );

       const groupedChannelDetail = useMemo(() => {
        if (!finalChannelDetail?.length) return [];
        const map = new Map();
        const order = [];
        finalChannelDetail.forEach((item) => {
            const key = campaignType === 'M' && item?.isSplitAB ? `${item?.channelId}-${item?.levelNumber}`  
            : campaignType === 'M' ? `${item?.channelId}-${item?.channeldetailId}-${item?.levelNumber}`  : item?.channelId == 7 || item?.channelId == 10 ? 
                `${item?.channelId}-${item?.socialPostChannelId ?? item?.subChannelId}-${item?.levelNumber}` 
                :`${item?.channelId}-${item?.levelNumber}`;

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
    }, [finalChannelDetail]);

    const hasAnyGrouping = useMemo(() => {
        return groupedChannelDetail?.some((item) => item?.isGrouping);
    }, [groupedChannelDetail]);

    const hasSocialChannel = useMemo(
        () => finalChannelDetail?.some((ch) => ch?.channelId === 7),
        [finalChannelDetail],
    );
    const showSentByChannel = campaignType === 'S' || campaignType === 'M';
    const showDetailSkeleton = isChannelDetailsLoading;
    const showDetailEmpty =
        !isChannelDetailsLoading && (isFailure || isOfflineOnly || !groupedChannelDetail?.length);

    return (
        <div className={`rs-grid-detail-view${isChannelDetailsLoading ? ' is-detail-loading' : ''}`}>
            <div className={showDetailEmpty ? gridClass('detail-empty-wrap') : undefined}>
                <table className="grid-detail-content grid-listing-comm">
                    <thead>
                        <tr>
                            {campaignType === 'M' && isSubsegment && <th>{SUBSEGMENT_NAME}</th>}
                            <th>{CHANNEL}</th>
                            {hasAnyGrouping && <th></th>}
                            {campaignType === 'M' && <th>{FRIENDLY_NAME}</th>}
                            <th>{STATUS}</th>
                            {hasSocialChannel && <th>{POST_TYPE}</th>}
                            {showSentByChannel && <th className="text-end">{SENT_BY_CHANNEL}</th>}
                            <th className="text-end">{ACTION}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(showDetailSkeleton || showDetailEmpty) && (
                            <CommunicationListDetailSkeletonRows
                                campaignType={campaignType}
                                isSubsegment={isSubsegment}
                                hasAnyGrouping={hasAnyGrouping}
                                hasSocialChannel={hasSocialChannel}
                                showSentByChannel={showSentByChannel}
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
                                            (ch.channeldetailId ?? ch.channelDetailID) ===
                                                (row.channeldetailId ?? row.channelDetailID) &&
                                            ch.levelNumber === row.levelNumber &&
                                            (ch.splitType ?? null) === (row.splitType ?? null),
                                    );
                                if (hasGrouping) {
                                    const splitDetails = item?.SplitDetails || [];
                                    return splitDetails?.map((splitItem, splitIndex) => {
                                        const idx = resolveIdx(splitItem);
                                        return (
                                        <DetailedStatus
                                            content={{ splitIndex, ...splitItem, ...item }}
                                            dataItem={dataItem}
                                            idx={idx >= 0 ? idx : index}
                                            splitIndex={splitIndex}
                                            key={`${dataItem?.campaignGuid}-${index}-split-${splitIndex}`}
                                            hasGrouping={hasAnyGrouping}
                                            isExistOfflineConversionChannel={isExistOfflineConversionChannel}
                                            isSubsegment={isSubsegment}
                                            showPostTypeColumn={hasSocialChannel}
                                            showSentByChannel={showSentByChannel}
                                        />
                                        );
                                    });
                                }
                                const idx = resolveIdx(item);
                                return (
                                    <DetailedStatus
                                        content={item}
                                        dataItem={dataItem}
                                        idx={idx >= 0 ? idx : index}
                                        key={`${dataItem?.campaignGuid}-${index}`}
                                        hasGrouping={hasAnyGrouping}
                                        isExistOfflineConversionChannel={isExistOfflineConversionChannel}
                                        isSubsegment={isSubsegment}
                                        showPostTypeColumn={hasSocialChannel}
                                        showSentByChannel={showSentByChannel}
                                    />
                                );
                            })}
                            {/* {_map(finalChannelDetail, (item, index) => (
                                <DetailedStatus
                                    content={item}
                                    dataItem={dataItem}
                                    idx={index}
                                    key={index}
                                    isExistOfflineConversionChannel={isExistOfflineConversionChannel}
                                    isSubsegment={isSubsegment}
                                />
                            ))} */}
                        </Fragment>
                    )}
                   
                    </tbody>
                </table>
                {showDetailEmpty && <CommunicationListDetailEmptyOverlay />}
            </div>
                 <div className={`${className} expand-plus`}>
                        <ul className="camp-icon-pannel">
                            <li>
                                <i className="k-icon k-i-minus cursor-pointer" onClick={() => onCollapse(dataItem)}></i>
                            </li>
                        </ul>
                    </div>

            {campaignDetail?.popupModal && campaignDetail?.campaignId === dataItem?.campaignId ? (
            <SplitABScheduleModal
                show
                isCommunication
                handleClose={() => {
                    dispatch(updatePopupContent([]));
                    dispatch(
                        updatePopupModal({
                            popupModal: false,
                            splitABPopupLoading: false,
                            channelId: 0,
                            campaignId: 0,
                        }),
                    );
                }}
            />
            ) : null}
        </div>
    );
};

export default CommunicationListDetail;
