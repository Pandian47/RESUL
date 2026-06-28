import { downloadCSV, csvlinkDownloadWithoutBaseUrl } from 'Utils/modules/download';
import { detailAnalyticsConversion, detailAnalyticsEngagement, detailAnalyticsReach } from 'Assets/Images';
import { getFullDateAndTime } from 'Constants/Utils/dates';
import { APPROVED, CAMPAIGN_DOCKET_TEXT, DOWNLOAD_CSV, FORWARDS, FWD_MAIL_CLICKS, INCREASE_THE_IMPORT_DATE, LINK_CLICKS, OPENS, PERSONALIZATION_HAS_BEEN, PLEASE_REMOVE, REGISTRATION } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, communication_large, conversion_large, csv_download_medium, popup_close_circle_fill_medium, popup_close_circle_medium, user_call_center_large } from 'Constants/GlobalConstant/Glyphicons';
import RSIcon from 'Components/RSIcon';
import KendoGrid from 'Components/RSKendoGrid';
import GridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';

import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';

import RSModal from 'Components/RSModal';

export const OVERVIEW = 'Overview';
export const ADDITIONAL_INFO = 'Additional Info';
export const CAMPAIGN_REFERENCE = `Communication reference`;
export const TARGET_LIST_APPROVAL = 'Target list approval history';
export const CAMPAIGN_LIST_APPROVAL = `Communication approval history`;

export const getOverviewList = (data) => {
    return [
        {
            campaignType: 'Reach',
            campaignCount: data?.reach?.count || 0,
            deliverables: [
                {
                    text: OPENS,
                    percent: data?.reach?.uniqueOpens || 0,
                    info: [
                        {
                            known: data?.reach?.uniqueOpens || 0,
                        },
                    ],
                },
                {
                    text: FORWARDS,
                    count: data?.reach?.forwards || 0,
                    info: [
                        {
                            unKnown: data?.reach?.forwards || 0,
                        },
                    ],
                },
            ],
            icon: `${communication_large} icon-lg color-primary-blue`,
            image: detailAnalyticsReach,
            bgColor: 'bg-secondary-blue',
            percentage: data?.reach?.previousComparisonValue || '0',
        },
        {
            campaignType: 'Engagement',
            campaignCount: data?.engagement?.count || 0,
            deliverables: [
                {
                    text: LINK_CLICKS,
                    percent: data?.engagement?.clicks || 0,
                    info: [
                        {
                            known: data?.engagement?.uniqueClicks || 0,
                        },
                    ],
                },
                {
                    text: FWD_MAIL_CLICKS,
                    count: data?.engagement?.fwdMailClicks || 0,
                    info: [
                        {
                            unKnown: data?.engagement?.fwdMailClicks || 0,
                        },
                    ],
                },
            ],
            icon: `${user_call_center_large} icon-lg color-primary-blue`,
            image: detailAnalyticsEngagement,
            bgColor: 'bg-secondard-orange',
            percentage: data?.engagement?.previousComparisonValue || '0',
        },
        {
            campaignType: 'Conversion',
            campaignCount: data?.conversion?.count || 0,
            deliverables: [
                {
                    text: REGISTRATION,
                    percent: data?.conversion?.registration || 0,
                    info: [{ known: '389', unKnown: '1,577' }],
                },
            ],
            icon: `${conversion_large} icon-lg color-primary-blue cp`,
            image: detailAnalyticsConversion,
            bgColor: 'bg-secondary-green',
            percentage: data?.conversion?.previousComparisonValue || '0',
        },
    ];
};

export const showAdditionalInfo = (state) => {
    const { docketDetails, docketCsvPath } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const [parsedDocketDetails, setparsedDocketDetails] = useState([]);
    const [showWarningModal, setShowWarningModal] = useState(false);

    useEffect(() => {
        setparsedDocketDetails(docketDetails);
        const numberCheck = document.querySelectorAll('.campaign-reference-popup .k-master-row td');
        numberCheck.forEach((cell) => {
            const cellText = cell.innerText.trim();
            if (!isNaN(cellText) && cellText !== '') {
                cell.classList.add('text-end');
            }
        });
    }, [docketDetails]);

    // console.log('data: ', parsedDocketDetails);
    const { isShowAdditionalInfo, setIsShowAdditionalInfo, isDocketLoading = false } = state;
    return (
        <>
        <div
            className={`additional-info-wrapper mb30 add-information ${isShowAdditionalInfo ? 'enabled' : 'disabled'}`}
        >
            <div className="info-header">
                <h2>{ADDITIONAL_INFO}</h2>
                <div onClick={() => setIsShowAdditionalInfo(false)}>
                    <RSIcon className="icon-md color-primary-blue"
                    defaultItem={popup_close_circle_medium}
                    hoverItem = {popup_close_circle_fill_medium}
                    customCloseClass="right7 top7"
                    />
                </div>
            </div>
            <div className="mx15 mt15">
                <div className="campaign-reference-popup">
                    <div className="border-0 shadow-none p0">
                           {!isDocketLoading && parsedDocketDetails?.length > 0 && 
                        <div className="portlet-header flex-row mb10">
                            <div className="fr flex-left d-flex align-items-center">
                                <h4 className="mb0">{CAMPAIGN_REFERENCE}</h4>
                            </div>
                            <div className="float-end">
                                <div className="d-flex align-items-center">
                                 <RSTooltip text={DOWNLOAD_CSV}>
                                 <i
                                        className={`${csv_download_medium} icon-md color-primary-blue cursor-pointer`}
                                        id="rs_data_download"
                                        onClick={() => {
                                            if (docketCsvPath === 'No data available' || !docketCsvPath) {
                                                setShowWarningModal(true);
                                            } else if (docketCsvPath) {
                                                const fileName = docketCsvPath.split('/').pop() || 'campaign_docket.csv';                                                
                                                // const fileName = docketCsvPath.split('/').pop() || 'campaign_docket.csv';
                                                // const urlParts = docketCsvPath.split('/Uploads/');
                                                // const relativePath = urlParts.length > 1 ? 'Uploads/' + urlParts[1] : docketCsvPath;
                                                // csvlinkDownload(relativePath, fileName);
                                                csvlinkDownloadWithoutBaseUrl(docketCsvPath, fileName)
                                            } else if (parsedDocketDetails && parsedDocketDetails.length > 0) {
                                                const filename = `campaign_reference_${new Date().toISOString().split('T')[0]}.csv`;
                                                downloadCSV(parsedDocketDetails, filename);
                                            } else {
                                                setShowWarningModal(true);
                                            }
                                        }}
                                    ></i>
                                 </RSTooltip>
                                </div>
                            </div>
                        </div>
                            }

                        {isDocketLoading ? (
                            <GridLoadingSkeleton
                                rows={4}
                                columns={6}
                                hideLeftBorder
                                isLoading
                                wrapperClassName="p0"
                            />
                        ) : (
                            <KendoGrid
                                data={parsedDocketDetails}
                                // column={[
                                //     { field: 'CampaignGroupingID', title: 'Campaign grouping ID', width: 190 },
                                //     { field: 'Campaignmanager', title: 'Campaign manager', width: 180 },
                                //     { field: 'ProductManagerName', title: 'Product manager name', width: 190 },
                                //     { field: 'CAFno', title: 'CAFno', width: 120 },
                                //     { field: 'CostCode', title: 'CostCode', width: 120 },
                                //     { field: 'Marketing', title: 'Marketing', width: 120 },
                                //     { field: 'MarcomManager', title: 'MarcomManager', width: 120 },
                                //     { field: 'Priority', title: 'Priority', width: 120 },
                                //     { field: 'Product', title: 'Product', width: 120 },
                                //     {
                                //         field: 'CampaignDocketAttachmentpath',
                                //         title: 'CampaignDocketAttachmentpath',
                                //         width: 120,
                                //     },
                                // ]}
                                scrollable="scrollable"
                                isCustomBox
                            />
                        )}
                    </div>
                </div>

                <div className="addition-list-view d-none">
                    <h4 className="mb10">{TARGET_LIST_APPROVAL}</h4>
                    <div className="css-scrollbar scrollbar-height">
                        <div className="row spacing-bottom">
                            <div className="col-sm-3">
                                <small>{getFullDateAndTime(4)}</small>
                                <p>{`username12`}</p>
                            </div>
                            <div className="col-sm-6">
                                <p>{APPROVED}</p>
                            </div>
                        </div>
                        <div className="row spacing-bottom">
                            <div className="col-sm-3">
                                <small>{getFullDateAndTime(4)}</small>
                                <p>{`username12`}</p>
                            </div>
                            <div className="col-sm-6">
                                <p>{INCREASE_THE_IMPORT_DATE}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="addition-list-view mb0 d-none">
                    <h4 className="mb10">{CAMPAIGN_LIST_APPROVAL}</h4>
                    <div className="css-scrollbar scrollbar-height">
                        <div className="row spacing-bottom">
                            <div className="col-sm-3">
                                <small>{getFullDateAndTime(4)}</small>
                                <p>{`username13`}</p>
                            </div>
                            <div className="col-sm-6">
                                <p>{APPROVED}</p>
                            </div>
                        </div>
                        <div className="row spacing-bottom">
                            <div className="col-sm-3">
                                <small>{getFullDateAndTime(4)}</small>
                                <p>{`username14`}</p>
                            </div>
                            <div className="col-sm-6">
                                <p>{PERSONALIZATION_HAS_BEEN}</p>
                            </div>
                        </div>
                        <div className="row spacing-bottom">
                            <div className="col-sm-3">
                                <small>{getFullDateAndTime(4)}</small>
                                <p>{`username13`}</p>
                            </div>
                            <div className="col-sm-6">
                                <p>{PLEASE_REMOVE}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <RSModal
            show={showWarningModal}
            size="md"
            handleClose={() => setShowWarningModal(false)}
            header="Warning"
            isCloseButton={true}
            body={
                <div className="text-center">
                         <i className={`${alert_medium}  color-primary-red fs75 cursor-normal`} />
                            <div className="mt10">{CAMPAIGN_DOCKET_TEXT}</div>
                </div>
            }
        />
        </>
    );
};

export const stateReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE':
        case 'MULTIPLE':
            return {
                ...state,
                [action.field]: action.payload,
            };
        default:
            return state;
    }
};
