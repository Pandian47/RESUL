import { getChannelId, getChannelSocialId, getChannelPaidMediaId } from 'Utils/modules/communicationChannels';
import { getIconByStatus, getPausePlayTrigger } from 'Utils/modules/communicationStatus';
import { encodeUrl } from 'Utils/modules/crypto';
import { getCreatedDate, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { GetpopoverContent, getListingPreviewNoDataPopover, isListingPreviewEligible, hasListingPreviewApiContent } from 'Utils/modules/preview';
import { REPORT } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, eye_medium, winner_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import _get from 'lodash/get';
import { useForm } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import RSConfirmationModal from 'Components/ConfirmationModal';
import SplitABScheduler from '../../../../../Components/SplitABScheduler';
import { parseSplitABPopupResponse } from '../../../../../Components/SplitABScheduler/constant';

import { useNavigate } from 'react-router-dom';
import { splitABIcon } from 'Assets/Images';


import { useDispatch, useSelector } from 'react-redux';
import { updateAnalyticsDetail } from 'Reducers/analyticsTwins/communicationAnalytics/reducer';
import { update_consumptionChannel } from 'Reducers/globalState/reducer';
import { get_splitAB_popup, Get_Preview_By_Channel } from 'Reducers/communication/listing/request';
import { updatePopupContent, updatePopupModal } from 'Reducers/communication/listing/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import { Progressbar } from 'Constants/Charts/pieChartPercentage';
import { PREVIEW_SOURCE } from 'Utils/modules/preview';
import { splitA, splitB, splitC, splitD } from 'Constants/GlobalConstant/Colors/colorsVariable';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';

const DetailedStatus = ({ content, dataItem, idx, splitIndex = null, hasGrouping = false }) => {
    // console.log('content: dataItem', content);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { control, setValue } = useForm();
    const statusId = content?.channelStatusId;
    const { icon, title } = getIconByStatus(statusId);

    const { departmentId, userId, clientId } = useSelector((state) => getSessionId(state));

    const {
        icon: channelIcon,
        label,
        bgColor,
    } = content?.channelId === 7
        ? getChannelSocialId(content?.subChannelId) ?? {}
        : content?.channelId === 10
        ? getChannelPaidMediaId(content?.subChannelId) ?? {}
        : getChannelId(content?.channelId) ?? {};

    const finalChannelDetail = dataItem?.channels?.filter((channel) => channel?.channelId > 0);
    const isSubsegment = finalChannelDetail?.some((item) => item?.subSegmentFriendlyName) || false;
    const carousels = finalChannelDetail
    ?.filter(item => {
        // Include items that are carousels with carouseljson OR have header/footer
        return (item?.isCarousel && item?.carouseljson) || 
               item?.header || 
               item?.footer;
    })
    ?.map((item, index) => ({
        index,
        isCarousel: item?.isCarousel,
        header: item?.header,
        footer: item?.footer,
        carouselJSON: item?.carouseljson,
    })) || [];

    const initialProps = {
        content: content.previewImage,
        name: content.channelName,
        date: content?.scheduleDate || content?.scheduleDateTime,
        scheduleDate: content?.scheduleDateTime || content?.scheduleDate,
        // date: getUserCurrentFormat(content.scheduleDate + ' UTC')?.dateTimeFormat,
        previewImage: content?.previewImagePath,
        senderId:content?.senderName,
        carouselJSON : carousels?.[idx]?.carouselJSON ? carousels?.[idx]?.carouselJSON : undefined,
        isCarousel : carousels?.[idx]?.isCarousel || false,
        header: carousels?.[idx]?.header || '',
        footer: carousels?.[idx]?.footer || '',
    };
    
    const isSplit = content.isSplitAB;
    const isGrouping = content?.isGrouping || false;
    const groupDetails = content?.SplitDetails || [];
    const campaignType = _get(dataItem, 'campaignTypeValue', '').slice(0, 1);
    const isLimitList = content?.isLimitList || false;
    const limitliststatusId = content?.limitListStatusId;
    const triggerPlayPauseStatus = content?.triggerPlayPauseStatus;

    const [{ defaultItem, options }, setPlayPauseTrigger] = useState({
        defaultItem: {},
        options: [],
    });
    const [popupStatus, setPopupStatus] = useState(false);
    const [{ isPausePlayTrigger, payload, type }, setPausePlayPopupConfig] = useState({
        isPausePlayTrigger: false,
        payload: {},
        type: '',
    });

    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
    const [preview, setPreview] = useState({});
    const popoverTriggerRef = useRef(null);

    const isPreviewEligible = isListingPreviewEligible(content?.channelId);

    const isPreviewDisabled =
        content.channelId === 6 ||
        content.channelId === 16 ||
        content.channelId === 10 ||
        content.channelId === 33;

    const previewPopoverOverlayClass = `${content.channelId === 8 || content.channelId === 14 ? 'commlistpreview' : 'analyticslistpreview'} ${
        content.channelId === 7 ? 'p0 border-0 border-r10' : content.channelId === 1 ? 'p0 border-0' : ''
    }`;

    useEffect(() => {
        setPreview({});
        setIsPreviewLoaded(false);
        setIsPreviewLoading(false);
    }, [content?.channelId, content?.channelDetailID, content?.channeldetailId, content?.levelNumber]);

    const handleClickEyeIcon = async (e) => {
        if (!isPreviewEligible || isPreviewLoaded || isPreviewLoading || isPreviewDisabled) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        setIsPreviewLoading(true);

        const payload = {
            userId,
            departmentId,
            clientId,
            campaignId: dataItem?.campaignID || 0,
            channelId: content?.channelId || 0,
            levelNumber: content.levelNumber || 1,
            ChannelDetailID: content.channelDetailID || 0,
        };

        try {
            const previewResponse = await dispatch(Get_Preview_By_Channel(payload, false));

            if (!hasListingPreviewApiContent(content?.channelId, previewResponse, content)) {
                setPreview(getListingPreviewNoDataPopover());
                setIsPreviewLoaded(true);
                setTimeout(() => {
                    if (popoverTriggerRef.current) {
                        popoverTriggerRef.current.click();
                    }
                }, 100);
                return;
            }

            const previewData = previewResponse?.data?.[0] || {};
            const props = {
                content: previewData?.content,
                name: dataItem?.createdBy,
                date: content.scheduleDateTime || content?.scheduleDate,
                senderId: content?.senderName,
                previewImage: previewData?.imagePath,
                scheduleDate: content?.scheduleDateTime || content?.scheduleDate,
                webContent: content.content,
                notification: previewData || undefined,
                notifications: previewResponse?.data || undefined,
                slides: previewResponse?.data || undefined,
                carouselJSON: previewData?.carouselJSON ? previewData?.carouselJSON : undefined,
                isCarousel: previewData?.isCarousel ? previewData?.isCarousel : false,
                header: content?.header ? content?.header : undefined,
                footer: content?.footer ? content?.footer : previewData?.footer ?  previewData?.footer :  undefined,
                showAsHtml: true,
                ...(
                    content?.channelId === 7 && {
                        imageUrl: previewData?.imagePath || '',
                        socialPostChannelId: content?.socialPostChannelId || 0,
                        postUrl: previewData?.postLink || '',
                        scheduleTime: content?.scheduleDateTime || null,
                    }
                ),
                ...(
                    content?.channelId === 21 && {
                        imagePath: previewData?.imagePath || previewData?.mediaurl || '',
                    }
                ),
                contentJson: previewData?.contentjson || '',
                previewSource: PREVIEW_SOURCE?.COMM_LISTING
            };
            const previewContent = GetpopoverContent(content?.channelId, props);
            setPreview(previewContent);
            setIsPreviewLoaded(true);

            setTimeout(() => {
                if (popoverTriggerRef.current) {
                    popoverTriggerRef.current.click();
                }
            }, 100);
        } catch (error) {
            setPreview(getListingPreviewNoDataPopover());
            setIsPreviewLoaded(true);
            setTimeout(() => {
                if (popoverTriggerRef.current) {
                    popoverTriggerRef.current.click();
                }
            }, 100);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    useEffect(() => {
        if (campaignType === 'E' || isLimitList) {
            const pausePlayStatusId = triggerPlayPauseStatus;
            const { defaultItem, options } = getPausePlayTrigger(limitliststatusId || pausePlayStatusId, {
                isScheduled: statusId === 7,
            });
            setPlayPauseTrigger({
                defaultItem,
                options,
            });
            setValue('playPauseDropdown', defaultItem);
        }
    }, []);
    useEffect(() => {
        if (defaultItem && Object.keys(defaultItem).length > 0) {
            setValue('playPauseDropdown', defaultItem);
        }
    }, [defaultItem, setValue]);

    const handleIconSelect = (selectedIcon) => {
        setPlayPauseTrigger((pre) => ({ ...pre, defaultItem: selectedIcon }));
    };

    const splitInfo = useMemo(() => {
        const splitNames = content?.splitTypes || [];
        const splitColors = [splitA, splitB, splitC, splitD];

        const winnerSplit = `Split ${content?.iswinnerSplitType}`;
        const currentSplitName =
            typeof splitIndex === 'number' && splitNames[splitIndex]
                ? splitNames[splitIndex]
                : content?.splitType
                  ? `Split ${content?.splitType}`
                  : '';
        const isWinner =
            content?.iswinnerSplit && winnerSplit?.toUpperCase() === currentSplitName?.toUpperCase();
        if (isWinner) {
            return {
                name: `${winnerSplit} (Winner)`,
                color: '#FFB300',
                isWinner: true,
                icon: winner_mini,
            };
        }

        if (currentSplitName) {
            const index = splitNames.findIndex((name) => name?.toUpperCase() === currentSplitName.toUpperCase());

            if (index !== -1) {
                return {
                    name: splitNames[index],
                    color: splitColors[index] || '#666666',
                    isWinner: false,
                };
            }
        }

        if (typeof splitIndex === 'number' && splitNames[splitIndex]) {
            return {
                name: splitNames[splitIndex],
                color: splitColors[splitIndex] || '#666666',
                isWinner: false,
            };
        }

        return null;
    }, [
        content?.splitTypes,
        content?.splitType,
        content?.iswinnerSplit,
        content?.iswinnerSplitType,
        splitIndex,
        splitA,
        splitB,
        splitC,
        splitD,
    ]);

    const eventPausePlay = async (choice, channelDetails) => {
        setValue('playPauseDropdown', defaultItem);
        const { id, type } = choice;
        const payload = {
            statusId: id,
            channelId: _get(channelDetails, 'channelId', 0),
            campaignId: dataItem?.campaignID || 0,
            departmentId,
            userId,
        };
        setPausePlayPopupConfig({
            isPausePlayTrigger: true,
            payload,
            type,
        });
    };

    // console.log('content: ', content);

    const showNaForReach = content?.channelId === 10;
    const showNaForReachDeliveredUndelivered =
        content?.channelId === 7 || content?.channelId === 10 ;

    return (
        <Fragment>
            <tr key={content.blastGuid} className={`${isGrouping ? 'split-info-wrapper' : ''}`}>
                    {campaignType === 'M' && isSubsegment && (
                  <>
                  <td>
                      {content?.subSegmentFriendlyName?.trim() && (
                          content?.subSegmentFriendlyName?.length > 12 ? (
                              <RSTooltip text={content.subSegmentFriendlyName}>
                                  <p>{truncateTitle(content.subSegmentFriendlyName, 12)}</p>
                              </RSTooltip>
                          ) : (
                              <p>{content.subSegmentFriendlyName}</p>
                          )
                      )}
                  </td>
              </>
                    )}
                <td
                    className={
                        isGrouping
                            ? groupDetails?.length - 1 === splitIndex
                                ? 'campaign-custom-right-bottom '
                                : 'campaign-custom-border'
                            : ''
                    }
                >
                    {(!isGrouping || splitIndex === 0) && (
                        <div className="d-flex align-items-center">
                            <RSTooltip text={label}>
                                <div className={`social-icon ${bgColor}`}>
                                    <i className={`${channelIcon} icon-md white`}></i>
                                </div>
                            </RSTooltip>
                            {campaignType !== 'M' && (
                                <>
                                    {content?.channelFriendlyName?.length > 25 ? (
                                        <RSTooltip text={content?.channelFriendlyName}>
                                            <p className="pl15">{truncateTitle(content?.channelFriendlyName, 25)}</p>
                                        </RSTooltip>
                                    ) : (
                                        <p className="pl15">{content?.channelFriendlyName}</p>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </td>
                {hasGrouping && (
                    <td>
                        {isGrouping && (
                            <div className="split-indicator-wrapper">
                                {splitInfo?.isWinner ? (
                                    <i
                                        className={`${splitInfo.icon} icon-xs mr13 split-winner-icon pe-none`}
                                        style={{ color: splitInfo.color }}
                                    />
                                ) : (
                                    <span className="split-dot mr15" style={{ backgroundColor: splitInfo?.color }} />
                                )}
                                <span className="split-label">{`${splitInfo?.name || ''}`}</span>
                            </div>
                        )}
                    </td>
                )}
                {campaignType === 'M' && (
                    <td>
                        {content?.channelFriendlyName && (
                            <>
                                {/* {content?.channelFriendlyName?.length > 25 ? (
                                    <RSTooltip position="top" text={content?.channelFriendlyName} className="lh-sm d-inline-flex">
                                        <p>{truncateTitle(content?.channelFriendlyName, 25)}</p>
                                    </RSTooltip>
                                ) : (
                                    <p>{content?.channelFriendlyName}</p>
                                )} */}
                                 <TruncateCell value={content?.channelFriendlyName} noTable={true} />
                            </>
                        )}
                    </td>
                )}
                <td>
                    <div className="cl-status-icons d-flex align-items-center">
                        <Fragment>
                            {!(isLimitList && statusId === 5 && triggerPlayPauseStatus === 26) && (
                            <RSTooltip position="top" text={title} className="mr15">
                                <i className={icon} />
                            </RSTooltip>
                            )}
                            {isSplit && <img src={splitABIcon} alt="splitABIcon" className="mr5" />}
                            {statusId === 7 && !isSplit && (
                                <Fragment>
                                    <small className="fs17 color-primary-black">
                                        {getCreatedDate(content?.scheduleDateTime ?? content?.scheduleDate)}
                                    </small>
                                </Fragment>
                            )}
                            {isSplit && (
                                <span
                                    onClick={async () => {
                                        const payload = {
                                            campaignId: dataItem?.campaignID || 0,
                                            channelId: content?.channelId || 0,
                                            departmentId,
                                            userId,
                                            clientId,
                                        };
                                        const response = await dispatch(get_splitAB_popup({ payload }));
                                        dispatch(updatePopupContent(parseSplitABPopupResponse(response)));
                                        dispatch(
                                            updatePopupModal({
                                                channelId: content?.channelId || 0,
                                                endDate: new Date(dataItem?.endDate) || new Date(),
                                                campaignId: dataItem?.campaignID || 0,
                                            }),
                                        );
                                        setPopupStatus(true);
                                        try {
                                            const response = await dispatch(get_splitAB_popup({ payload }));
                                            const splitTestResult =
                                                response?.data?.splitTestResult ?? response?.data ?? [];
                                            dispatch(
                                                updatePopupContent(
                                                    Array.isArray(splitTestResult) ? splitTestResult : [],
                                                ),
                                            );
                                        } finally {
                                            dispatch(updatePopupModal({ ...modalMeta, splitABPopupLoading: false }));
                                        }
                                    }}
                                    className="cp splitab-underline"
                                >
                                    Split A/B {title}
                                </span>
                            )}
                            {((isLimitList && statusId !== 9) ||
                                (campaignType === 'E' &&
                                    content?.channelId !== 6 &&
                                    content?.channelId !== 16 &&
                                    (statusId === 5 ||
                                        statusId === 7 ||
                                        statusId === 26 ||
                                        statusId === 27 ||
                                        statusId === 28))) && (
                                <>
                                    <Progressbar
                                        bgcolor={'#26ade0'}
                                        progress={50}
                                        height={5}
                                        width={100}
                                        borderRadius={20}
                                        icon={<i className={`icon-lg color-primary-blue d-block`}></i>}
                                        isDetailStatus={true}
                                    />
                                    {defaultItem?.id === 26 ? (
                                        <RSTooltip text="Stop" position="top">
                                            <div
                                                className={`pe-none click-off`}
                                            >
                                                <RSKendoDropDown
                                                    control={control}
                                                    name="playPauseDropdown"
                                                    data={options}
                                                    defaultValue={defaultItem}
                                                    textField="type"
                                                    dataItemKey="id"
                                                    className={`mr15 no_caret playdropdown ${
                                                        content?.triggerPlayPauseStatus === 26 ? ' pe-none' : ''
                                                    }`}
                                                    popupSettings={{
                                                        popupClass: `listing-play-pause-dropdown`,
                                                    }}
                                                    handleChange={(e) => eventPausePlay(e.value, content)}
                                                    isCustomRender={true}
                                                    itemRender={(li, itemProps) => {
                                                        return cloneElement(li, li.props, itemProps.dataItem?.icon);
                                                    }}
                                                    valueRender={(element, value) => {
                                                        return value?.icon || element;
                                                    }}
                                                    isShowBordertip
                                                />
                                            </div>
                                        </RSTooltip>
                                    ) : (
                                        <div
                                            className={`pe-none click-off`}
                                        >
                                            <RSKendoDropDown
                                                control={control}
                                                name="playPauseDropdown"
                                                data={options}
                                                defaultValue={defaultItem}
                                                textField="type"
                                                dataItemKey="id"
                                                className={`mr15 no_caret playdropdown`}
                                                popupSettings={{
                                                    popupClass: `listing-play-pause-dropdown`,
                                                }}
                                                handleChange={(e) => eventPausePlay(e.value, content)}
                                                isCustomRender={true}
                                                itemRender={(li, itemProps) => {
                                                    return cloneElement(li, li.props, itemProps.dataItem?.icon);
                                                }}
                                                valueRender={(element, value) => {
                                                    return value?.icon || element;
                                                }}
                                                isShowBordertip
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            {statusId === 7 && (
                                <Fragment>
                                    <small className="fs17 color-primary-black">
                                        {getUserCurrentFormat(content?.scheduleDateTime)?.dateTimeFormat}
                                    </small>
                                </Fragment>
                            )}
                        </Fragment>
                    </div>
                </td>
                {content?.channelId !== 7 && (
                    <td className={`text-right `}>
                        <span
                            className={`${content?.totalSentCount > 0 ? '' : 'pe-none click-off'} ${
                                content?.channelId === 6 ? 'd-none' : ''
                            }`}
                            onClick={() => {
                                dispatch(
                                    update_consumptionChannel({
                                        id: content?.channelId,
                                        lable: content.channelName,
                                    }),
                                );
                                let url = '/preferences/consumptions/consumption-channel';
                                const state = {
                                    channelId: content?.channelId,
                                    channelName: content.channelName,
                                };
                                const encryptState = encodeUrl(state);
                                // navigate(`${url}?q=${encryptState}`, {
                                //     state,
                                // });
                                // navigate(`/preferences/consumptions/consumption-channel`, {
                                //     state: {
                                //         channelId: content?.channelId,
                                //         channelName: content.channelName,
                                //     },
                                // })
                            }}
                        >
                            { content?.channelId === 7 ? 'NA' : numberWithCommas(content?.totalSentCount)}{' '}
                        </span>
                    </td>
                )}

                {/* {/ <td className={`cp splitab-underline text-right `}> /} */}
                {content?.channelId !== 10 && (
                    <td className="text-right">
                        <span className={`  ${content?.channelId === 6 ? 'd-none' : ''}`}>
                            {showNaForReach ? 'NA' : numberWithCommas(content?.reachCount)}
                        </span>
                    </td>
                )}
                <td className="text-right">
                    <span className={`  ${content?.channelId === 6 ? 'd-none' : ''}`}>
                        {numberWithCommas(content?.engagementCount)}
                    </span>
                </td>
                <td className="text-right">
                    <span className={`  ${content?.channelId === 6 ? 'd-none' : ''}`}>
                        {numberWithCommas(content?.conversionCount)}
                    </span>
                </td>
                {content?.channelId !== 10 && content?.channelId !== 7 && (
                    <>
                        <td className="text-right">
                            <span className={`  ${content?.channelId === 6 || content?.channelId === 3 ? 'd-none' : ''}`}>
                                {showNaForReachDeliveredUndelivered ? 'NA' : numberWithCommas(content?.deliveredCount)}
                            </span>
                        </td>
                        <td className="text-right">
                            <span className={`  ${content?.channelId === 6 || content?.channelId === 3 ? 'd-none' : ''}`}>
                                {showNaForReachDeliveredUndelivered ? 'NA' : numberWithCommas(content?.undeliveredCount)}
                            </span>
                        </td>
                    </>
                )}
                <td>
                    <ul className="rs-communication-icon">
                        {isPreviewEligible && (
                            <li>
                                {isPreviewLoaded && !isPreviewDisabled ? (
                                    <RSPPophover
                                        position="left"
                                        {...preview}
                                        popover_overlay_class={previewPopoverOverlayClass}
                                        trigger="click"
                                    >
                                        <span className="eye-icon-wrapper d-flex" ref={popoverTriggerRef}>
                                            <RSTooltip text="Preview" position="top">
                                                <i
                                                    id="rs_data_eye"
                                                    className={`${eye_medium} icon-md color-primary-blue cp`}
                                                ></i>
                                            </RSTooltip>
                                        </span>
                                    </RSPPophover>
                                ) : (
                                    <RSTooltip text={isPreviewLoading ? 'Loading...' : 'Preview'} position="top">
                                        <span
                                            className={`eye-icon-wrapper d-flex align-items-center justify-content-center ${
                                                isPreviewDisabled ? 'pe-none click-off' : ''
                                            } ${isPreviewLoading ? 'eye-icon-wrapper--loading' : ''}`}
                                            ref={popoverTriggerRef}
                                            onClick={
                                                isPreviewDisabled || isPreviewLoading ? undefined : handleClickEyeIcon
                                            }
                                        >
                                            {isPreviewLoading ? (
                                                <span
                                                    className="segment_loader listing-preview-eye-loader"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <i
                                                    id="rs_data_eye"
                                                    className={`${eye_medium} icon-md color-primary-blue cp`}
                                                />
                                            )}
                                        </span>
                                    </RSTooltip>
                                )}
                            </li>
                        )}
                        <li>
                            <RSTooltip text={REPORT}>
                                <div className={`${
                                      content?.channelId === 33 ? 'pe-none click-off' :
                                      content?.channelId === 6 ? '' :  (content?.channelId === 10 || content?.channelId === 7
                                            ? content?.engagementCount > 0
                                            : content?.totalSentCount > 0)
                                            ? ''
                                            : 'pe-none click-off'
                                    } `}>
                                <i
                                    id="rs_DetailedStatus_analyticsreport"
                                    className={`${analytics_medium} icon-md color-primary-blue`}
                                    onClick={() => {
                                        dispatch(
                                            updateAnalyticsDetail({
                                                channelName: content.channelName,
                                                campaignId: dataItem?.campaignID,
                                                from: 'analytics',
                                                blastId: content?.iswinnerB2 &&  content?.iswinnerSplit ? content?.iswinnerB2  :  content?.blastId,
                                                channelId: content?.channelId,
                                                subChannelId: content?.subChannelId,
                                                currIndex: idx,
                                            }),
                                        );
                                        const state = {
                                            channelName: content.channelName,
                                            campaignId: dataItem?.campaignID,
                                            channelId: content?.channelId,
                                            subChannelId: content?.subChannelId,
                                            blastId: content?.iswinnerB2 &&  content?.iswinnerSplit ? content?.iswinnerB2  :  content?.blastId,
                                            startDate: dataItem?.startDate,
                                            endDate: dataItem?.endDate,
                                            iswinnerSplit: content?.iswinnerSplit,
                                            iswinnerSplitType: content.iswinnerSplitType,
                                            isSplitAB: content?.isSplitAB,
                                            isFromListingPage : true,
                                            subSegmentLevel: content?.subSegmentLevel,
                                            subSegmentFriendlyName: content?.subSegmentFriendlyName,
                                            iswinnerBlastId:  content?.iswinnerSplit && content?.iswinnerB2 ? content?.iswinnerB2 : '',
                                        };
                                        const encryptState = encodeUrl(state);
                                        navigate(`/analyticsTwins/detail-analytics?q=${encryptState}`, {
                                            state,
                                        });
                                    }}
                                ></i>
                                </div>
                            </RSTooltip>
                        </li>
                    </ul>
                </td>
            </tr>
            {campaignType === 'E' && (
                <RSConfirmationModal
                    show={isPausePlayTrigger}
                    text={`Are you sure you want to ${type} this communication`}
                    handleClose={() =>
                        setPausePlayPopupConfig({
                            isPausePlayTrigger: false,
                            payload: {},
                            type: '',
                        })
                    }
                    handleConfirm={async () => {}}
                />
            )}
            {popupStatus && (
                <SplitABScheduler
                    show={popupStatus}
                    handleClose={() => {
                        setPopupStatus(false);
                        dispatch(updatePopupContent([]));
                        dispatch(
                            updatePopupModal({
                                splitABPopupLoading: false,
                                channelId: 0,
                                campaignId: 0,
                            }),
                        );
                    }}
                    tertiaryText="Analytics"
                    isCommunication={false}
                />
            )}
        </Fragment>
    );
};

export default DetailedStatus;
