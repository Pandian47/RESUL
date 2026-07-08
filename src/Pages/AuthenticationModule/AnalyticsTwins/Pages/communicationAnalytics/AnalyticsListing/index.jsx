import { getStatus } from 'Utils/modules/communicationStatus';
import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { renderCommunicationListingTags } from 'Utils/modules/display';
import { DOWNLOAD, GOLDEN_CAMPAIGN, SENT_ON, SHARE, TREND_REPORT, VIEW_ANALYTICS } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, download_medium, share_tick_medium, star_fill_mini, trend_report_large } from 'Constants/GlobalConstant/Glyphicons';
import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RSTooltip from 'Components/RSTooltip';

import { LAYOUT_CLASSES } from 'Pages/KendoDocs/CommonComponents/ResGrid/config';

const AnalyticsList = ({ dataItem, listLayout }) => {
    const navigate = useNavigate();
    const startDate = dataItem?.modifiedDate !== null ? dataItem?.modifiedDate : dataItem?.createdDate;
    const { className, status } = getStatus(dataItem?.statusID);

    useEffect(() => {
        const hierarchyCells = document.querySelectorAll('.k-hierarchy-cell a.k-icon.k-i-plus');
        hierarchyCells.forEach((anchor) => {
            anchor.classList.remove('k-i-plus');
        });
    }, [dataItem?.expanded]);

    const analyticsUrl = useMemo(() => {
        const state = {
            from: dataItem?.campaignID,
            campaignName: dataItem?.campaignName,
            isGolden: dataItem?.isGoldCampaign,
            startDate: dataItem?.startDate,
            endDate: dataItem?.endDate,
            campaignTypeValue: dataItem?.campaignTypeValue,
            channelId: dataItem?.channelId,
            subSegmentFriendlyName: dataItem?.subSegmentLevelFriendlyName,
            subSegmentLevel: dataItem?.subSegmentLevel,
        };
        if (dataItem?.channelId?.length === 1 && dataItem?.channelId?.[0] === 7 || (dataItem?.channelId?.length === 1 && dataItem?.channelId?.[0] === 10 && dataItem?.subChannelId === 9)) {
            let state = {
                campaignName: dataItem?.campaignName,
                campaignId: dataItem?.campaignID,
                channelId: dataItem?.channelId?.[0],
                startDate: dataItem?.startDate,
                endDate: dataItem?.endDate,
                subChannelId: dataItem?.subChannelId,
            };
            const encryptState = encodeUrl(state);
            return `/analyticsTwins/detail-analytics?q=${encryptState}`;
        } else {
            let url = '/analyticsTwins/analytics-report';
            const encryptState = encodeUrl(state);
            return `${url}?q=${encryptState}`;
        }
    }, [
        dataItem?.campaignID,
        dataItem?.campaignName,
        dataItem?.isGoldCampaign,
        dataItem?.startDate,
        dataItem?.endDate,
        dataItem?.campaignTypeValue,
        dataItem?.channelId,
        dataItem?.subChannelId,
        dataItem?.subSegmentLevelFriendlyName,
        dataItem?.subSegmentLevel,
    ]);

    const handleLinkClick = (e) => {
        e.preventDefault();
        const state = {
            from: dataItem?.campaignID,
            campaignName: dataItem?.campaignName,
            isGolden: dataItem?.isGoldCampaign,
            startDate: dataItem?.startDate,
            endDate: dataItem?.endDate,
            campaignTypeValue: dataItem?.campaignTypeValue,
            channelId: dataItem?.channelId,
            subSegmentFriendlyName: dataItem?.subSegmentLevelFriendlyName,
            subSegmentLevel: dataItem?.subSegmentLevel,
        };
        if (dataItem?.channelId?.length === 1 && dataItem?.channelId?.[0] === 7 || (dataItem?.channelId?.length === 1 && dataItem?.channelId?.[0] === 10 && dataItem?.subChannelId === 9)) {
            let state = {
                campaignName: dataItem?.campaignName,
                campaignId: dataItem?.campaignID,
                channelId: dataItem?.channelId?.[0],
                startDate: dataItem?.startDate,
                endDate: dataItem?.endDate,
                subChannelId: dataItem?.subChannelId,
            };
            const encryptState = encodeUrl(state);
            navigate(`/analyticsTwins/detail-analytics?q=${encryptState}`, {
                state,
            });
        } else {
            let url = '/analyticsTwins/analytics-report';
            const encryptState = encodeUrl(state);
            navigate(`${url}?q=${encryptState}`, {
                state,
            });
        }
    };
    const handleExpandClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tr = e.currentTarget.closest('tr');
        if (!tr) return;
        const expandTarget = tr.querySelector(
            '.k-hierarchy-cell .k-icon-button, .k-hierarchy-cell a, .k-hierarchy-cell button, .k-hierarchy-cell .k-icon',
        );
        if (expandTarget && typeof expandTarget.click === 'function') {
            expandTarget.click();
        }
    };
    return (
        <td>
            <div
                className={[
                    'rs-communication-list',
                    className,
                    listLayout?.cardClassNames,
                    dataItem?.expanded ? 'sp-grid-expanded' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div className="communication-content">
                    <span className="badge">{dataItem?.campaignIDEncoded}</span>
                    <small>
                        {dataItem?.modifiedDate !== null && dataItem?.modifiedDate !== '' ? 'Modified by' : 'Created by'}:{' '}
                        {dataItem?.modifiedDate !== null && dataItem?.modifiedDate !== '' && !!dataItem?.modifiedName
                            ? dataItem?.modifiedName || ''
                            : dataItem?.createdName || ''}
                        <span></span>
                        {
                            getUserCurrentFormat(
                                dataItem?.modifiedDate !== null && dataItem?.modifiedDate !== '' ? dataItem?.modifiedDate : dataItem?.createdDate,
                            )?.dateFormat
                        }
                    </small>
                    <div className={`${LAYOUT_CLASSES.listCardTitle} d-flex gap-1`}>
                        {dataItem?.isGoldCampaign && <RSTooltip text={GOLDEN_CAMPAIGN} position="top">  <i
                            id="rs_data_Golden_campaign"
                            className={`icon-rs-star-fill-large color-alert icon-xs `}

                        ></i>   </RSTooltip>}   <TruncatedCell value={dataItem?.campaignName} noTable />
                    </div>
                    {renderCommunicationListingTags({
                        tags: dataItem?.tags,
                        campaignId: dataItem?.campaignID,
                        campaignName: dataItem?.campaignName,
                    })}
                </div>
                <div className="communication-content">
                    <small>{dataItem?.campaignTypeValue}</small>
                  <div className="d-flex">
                            <TruncatedCell value={dataItem?.communicationType} noTable />
                        </div>
                </div>
                <div className="communication-content">
                    <small>{SENT_ON}</small>
                    {/* <p>{getUserDateTimeFormat(dataItem?.startDate, 'formatDate')}</p> */}
                    <p>
                        {/* {getUserDateTimeFormat(dataItem?.startDate, 'formatDate')} */}
                        {getUserCurrentFormat(dataItem?.startDate)?.dateFormat}

                        {/* {getUserDateTimeFormat(dataItem?.startDate, 'formatDate').toString()?.length > 15 ? (
                            <RSTooltip
                                text={getUserDateTimeFormat(dataItem?.startDate, 'formatDate')}
                                position="bottom"
                                className="d-inline-block"
                            >
                                {truncateTitle(getUserDateTimeFormat(dataItem?.startDate, 'formatDate'), 15)}
                            </RSTooltip>
                        ) : (
                            <RSTooltip
                                text={getUserDateTimeFormat(dataItem?.startDate, 'formatDate')}
                                position="bottom"
                                className="d-inline-block"
                            >
                                {getUserDateTimeFormat(dataItem?.startDate, 'formatDate')}
                            </RSTooltip>
                        )} */}
                    </p>

                    {/* <p>{getDateWithDay(dataItem?.startDate)}</p> */}
                </div>
                <div className="communication-content">
                    <div className={`${className} communication-status`}>
                        <small>{status}</small>
                    </div>
                    <ul className="rs-communication-icon">
                        <li>
                            <RSTooltip text={VIEW_ANALYTICS} position="top">
                                <div className={`${(Array.isArray(dataItem?.channelId) && dataItem?.channelId.includes(33)) ||
                                        dataItem?.channelId === 33
                                        ? 'pe-none click-off'
                                        : ''
                                    }`}>
                                    <a
                                        href={analyticsUrl}
                                        id="rs_AnalyticsList_Viewanalytics"
                                        onClick={handleLinkClick}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <i className={`${analytics_medium} icon-md color-primary-blue`}></i>
                                    </a>
                                </div>
                            </RSTooltip>
                        </li>
                        <li>
                            <RSTooltip text={TREND_REPORT} position="top">
                                <div className="pe-none click-off">
                                    <i
                                        className={`${trend_report_large} icon-md color-primary-blue`}
                                        id="rs_AnalyticsList_TrendReport"
                                        onClick={() => navigate(`/analyticsTwins/trend-report`)}
                                    ></i>
                                </div>
                            </RSTooltip>
                        </li>
                        <li>
                            <RSTooltip text={SHARE} position="top">
                                <div className="pe-none click-off">
                                    <i
                                        className={`${share_tick_medium} icon-md color-primary-blue`}
                                        id="rs_AnalyticsList_Sharetick"
                                    ></i>
                                </div>
                            </RSTooltip>
                        </li>
                        <li>
                            <RSTooltip text={DOWNLOAD} position="top">
                                <div className={` ${dataItem?.isPDFDownloaded ? '' : 'pe-none click-off'}`}>
                                    <i
                                        id="rs_data_download"
                                        className={`${download_medium} icon-md color-primary-blue`}
                                    ></i>
                                </div>
                            </RSTooltip>
                        </li>
                    </ul>
                </div>

                <div
                    className={`${className} expand-plus ${dataItem?.expanded ? 'd-none' : ''}`}
                    onClick={handleExpandClick}
                    role="button"
                    aria-label="Expand row"
                    style={{ pointerEvents: 'auto' }}
                >
                    <ul className="camp-icon-pannel">
                        <li>
                            <i className={`k-icon k-i-plus`} style={{ pointerEvents: 'auto' }}></i>
                        </li>
                    </ul>
                </div>
            </div>
        </td>
    );
};

export default AnalyticsList;
