import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { truncateTitle } from 'Utils/modules/displayCore';
import { ADVANCED_DETAILS, AUDIENCE_BY_CHANNEL, CREATED_BY, DOWNLOAD, DOWNLOAD_ADVANCED_DETAILS, DOWNLOAD_LINK_DATA_SHORTLY, EMAIL_NAME, FACEBOOK, LIST_INFO, LIST_VIEW, MAX_5_ATTRIBUTES, MOBILE, MORE_THAN_5_ATTRIBUTES, NO_COMMUNICATION_LINKED, OPTIMIZED_CHANNELS, SELECT_COLUMNS, TARGET, TARGETINFO_ADVANCED_DETAILS, THANK_YOU_YOUR_REQUEST, VIEW_THE_GRID } from 'Constants/GlobalConstant/Placeholders';
import { circle_analytics_fill_large, circle_arrow_right_medium, circle_list_large, circle_question_mark_mini, csv_download_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map as _map } from 'Utils/modules/lodashReplacements';
import { Carousel, Col, Row } from 'react-bootstrap';

import { useDispatch, useSelector } from 'react-redux';
import RSPPophover from 'Components/RSPPophover';
import { PieChartSkeleton } from 'Components/Skeleton/Skeleton';
import {
    getTargetInfo,
    getAdvanceAnalyticsList,
    getAdvanceAnalyticsGrid,
    getAdvAnlayticsDownloadFile,
} from 'Reducers/audience/targetList/request';
import { target_list_view } from 'Reducers/audience/targetList/reducer.js';
import { getSessionId } from 'Reducers/globalState/selector';
import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import RSHighchartsContainer from 'Components/Highcharts';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { useForm } from 'react-hook-form';
import { SampleInsightSummary, getAttributeSummaryColumns, getTargetInfoList, recipientConfig, targetGroupConfig } from './constant';
import { pieChartOptions } from 'Constants/Charts';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall.jsx';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import InsightChartPortlet from 'Pages/AuthenticationModule/Audience/Component/AudienceInsight/InsightChartPortlet';
import RSTabber from 'Components/RSTabber';
import { getUserInfoDetailsForOTP } from 'Reducers/globalState/request';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSModal from 'Components/RSModal';
import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';

const TARGET_INFO_SKELETON = {
    titleHeight: 24,
    rowHeight: 22,
    audienceTitleWidth: '240px',
    targetTitleWidth: '100px',
    labelWidths: ['120px', '100px'],
    valueWidth: '70px',
    communicationPrimaryWidth: '200px',
    communicationSecondaryWidth: '300px',
    communicationPrimaryHeight: 25,
    communicationSecondaryHeight: 28,
};

const renderSectionTitle = (isLoading, skeletonWidth, content) =>
    isLoading ? (
        <CommonSkeleton width={skeletonWidth} height={TARGET_INFO_SKELETON.titleHeight} box stopAnimation />
    ) : (
        content
    );

const renderTwoColumnSkeletonRows = (rowCount) => (
    <>
        <Col sm={6} className="mb15">
            <ul className="px15">
                {Array.from({ length: rowCount }).map((_, idx) => (
                    <li key={`label-${idx}`} className="mb10">
                        <CommonSkeleton
                            width={TARGET_INFO_SKELETON.labelWidths[idx % TARGET_INFO_SKELETON.labelWidths.length]}
                            height={TARGET_INFO_SKELETON.rowHeight}
                            box
                            stopAnimation
                        />
                    </li>
                ))}
            </ul>
        </Col>
        <Col sm={6} className="mb15">
            <ul className="px15 text-right">
                {Array.from({ length: rowCount }).map((_, idx) => (
                    <li key={`value-${idx}`} className="mb10 d-flex justify-content-end">
                        <CommonSkeleton
                            width={TARGET_INFO_SKELETON.valueWidth}
                            height={TARGET_INFO_SKELETON.rowHeight}
                            box
                            stopAnimation
                        />
                    </li>
                ))}
            </ul>
        </Col>
    </>
);

const TargetInfo = ({ handleClose, audienceId, createdBy, bunchName, modifiedDate, list, segmentInfoModal }) => {
    const { control, resetField, watch, setError, clearErrors } = useForm();
    const dispatch = useDispatch();
    const isActiveRef = useRef(true);
    const downloadCloseTimeoutRef = useRef(null);
    const targetInfoAPI = useApiLoader({ actionCreator: getTargetInfo });
    const advanceAnalyticsListAPI = useApiLoader({ actionCreator: getAdvanceAnalyticsList });
    const advanceAnalyticsGridAPI = useApiLoader({ actionCreator: getAdvanceAnalyticsGrid });
    const apiRefs = useRef({ targetInfoAPI, advanceAnalyticsListAPI, advanceAnalyticsGridAPI });
    apiRefs.current = { targetInfoAPI, advanceAnalyticsListAPI, advanceAnalyticsGridAPI };
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { targetInfo, GetAdvanceAnalyticsList, getAdvAnalyticsGrid } = useSelector(
        ({ targetListViewReducer }) => targetListViewReducer,
    );
    const isDataAugment = list?.isDataAugment || false;
    const attributeSummary = targetInfo?.Attribute_Symmary || [];
    const dataSummary = targetInfo?.Data_Summary || [];
    const channelCountSummary = targetInfo?.Channel_Count_Summary;
    const communicationSummary = targetInfo?.Communication_Summary || null;

    const targetlistInfo = communicationSummary ? communicationSummary : [];
    const countInfo = channelCountSummary ? channelCountSummary : [];
    const [advGridData, setAdvGridData] = useState([]);
    const [option, setOption] = useState('City');
    const [newData, setnewData] = useState([]);
    const [optionAttr, setOptionAttr] = useState('');
    const [otpModal, setOtpModal] = useState(false);
    const [otpModalhide, setOtpModalhide] = useState(false);
    const [updatedInfoList, setUpdatedInfoList] = useState([]);
    const [detailChange, setDetailChange] = useState(false);
    const [showbottomline, setShowbottomline] = useState(true);
    const [otpSuccessModal, setOtpSuccessModal] = useState(false);
    const [records, setRecords] = useState(false);

    const dataSummaryChart = {
        series:
            targetInfo?.Data_Summary?.map((res) => ({
                name: res.Category || '',
                y: parseFloat(res.count || 0),
            })) || [],
    };

    const stopAdvanceAnalyticsRequests = () => {
        advanceAnalyticsListAPI.abort();
        advanceAnalyticsGridAPI.abort();
    };

    const stopTargetInfoRequests = () => {
        targetInfoAPI.abort();
        stopAdvanceAnalyticsRequests();
    };

    useEffect(() => {
        const payload = {
            ListId: audienceId,
            departmentId,
            clientId,
            userId,
            IsDataAugment: isDataAugment,
        };
        targetInfoAPI.refetch({ payload });
    }, [departmentId, clientId, userId]);

    useEffect(() => {
        if (!isActiveRef.current) return;
        const updateList = GetAdvanceAnalyticsList?.map((item) => ({
            ...item,
            attributeName: item?.attributeName?.replaceAll('_', ' '),
        }));
        setUpdatedInfoList(updateList);
    }, [GetAdvanceAnalyticsList]);

    useEffect(() => {
        return () => {
            isActiveRef.current = false;
            if (downloadCloseTimeoutRef.current) {
                clearTimeout(downloadCloseTimeoutRef.current);
                downloadCloseTimeoutRef.current = null;
            }
            const { targetInfoAPI: targetInfo, advanceAnalyticsListAPI: analyticsList, advanceAnalyticsGridAPI: analyticsGrid } =
                apiRefs.current;
            resetAbortableRequests(targetInfo, analyticsList, analyticsGrid);
            dispatch(target_list_view({ field: 'GetAdvanceAnalyticsList', data: [] }));
            dispatch(target_list_view({ field: 'getAdvAnalyticsGrid', data: [] }));
            dispatch(target_list_view({ field: 'targetInfo', data: [] }));
        };
    }, [dispatch]);

    const isTargetInfoLoading = targetInfoAPI?.isLoading;

    const channelSummary = countInfo?.[0];

    const communicationCount = targetlistInfo?.length ?? 0;

    const singleInfo = (
        <Row className={isDataAugment ? '' : 'mt16'}>
            <Col sm={6} className="position-relative">
                <h5 className="font-medium mb10">
                    {`Communication${communicationCount > 1 ? 's' : ''} linked`}
                    {!isTargetInfoLoading && ` (${communicationCount})`}
                </h5>
                {communicationCount === 0 && (
                    <div className="position-relative">
                        {[0, 1, 2].map((blockIdx) => (
                            <div className="p10" key={blockIdx}>
                                <CommonSkeleton
                                    width={TARGET_INFO_SKELETON.communicationPrimaryWidth}
                                    height={TARGET_INFO_SKELETON.communicationPrimaryHeight}
                                    box
                                    stopAnimation
                                />
                                <CommonSkeleton
                                    width={TARGET_INFO_SKELETON.communicationSecondaryWidth}
                                    height={TARGET_INFO_SKELETON.communicationSecondaryHeight}
                                    box
                                    stopAnimation
                                />
                            </div>
                        ))}
                        {!isTargetInfoLoading && (
                            <NoDataAvailableRender
                                message={NO_COMMUNICATION_LINKED}
                                showMessage={!isTargetInfoLoading}
                            />
                        )}
                    </div>
                )}
                {communicationCount > 0 && (
                    <ul className="infoTwoColumnDivCSS css-scrollbar" style={{ height: '377px' }}>
                        {targetlistInfo.map((infoItem, index) => (
                            <li key={index}>
                                <small>{getUserCurrentFormat(infoItem?.CreatedDate)?.dateFormat}</small>
                                <div>{infoItem?.CampaignName}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </Col>
            <Col sm={6}>
                <div className="css-scrollbar" style={{ height: '406px' }}>
                    <Row className="border-bottom mb15 pb10">
                        <Col sm={12} className="mb10">
                            <h5 className="font-medium">
                                {AUDIENCE_BY_CHANNEL}
                                {!isTargetInfoLoading && ` (${numberWithCommas(channelSummary?.RecipientCount)})`}
                            </h5>
                        </Col>
                        {isTargetInfoLoading ? (
                            renderTwoColumnSkeletonRows(recipientConfig.length)
                        ) : (
                            <>
                                <Col sm={6} className="mb15">
                                    <ul className="px15">
                                        {recipientConfig.map((item, idx) => (
                                            <li key={idx}>{item.label}</li>
                                        ))}
                                    </ul>
                                </Col>
                                <Col sm={6} className="mb15">
                                    <ul className="px15 text-right">
                                        {recipientConfig.map((item, idx) => (
                                            <li key={idx}>{numberWithCommas(channelSummary?.[item.valueKey] || 0)}</li>
                                        ))}
                                    </ul>
                                </Col>
                            </>
                        )}
                    </Row>
                    <Row className="border-bottom mb15 d-none">
                        <Col sm={12} className="mb15">
                            <h5 className="font-medium">{OPTIMIZED_CHANNELS}</h5>
                        </Col>
                        <Col sm={6} className="mb15">
                            <ul className="px15">
                                <li>{MOBILE}</li>
                                <li>{EMAIL_NAME}</li>
                                <li>{FACEBOOK}</li>
                            </ul>
                        </Col>
                        <Col sm={6} className="mb15">
                            <ul className="px15 text-right">
                                <li>{numberWithCommas(channelSummary?.RecipientCountMobile)}</li>
                                <li>{numberWithCommas(channelSummary?.RecipientCountMobile)}</li>
                            </ul>
                        </Col>
                    </Row>
                    <Row className="mb15">
                        <Col sm={12} className="mb15">
                            {renderSectionTitle(
                                isTargetInfoLoading,
                                TARGET_INFO_SKELETON.targetTitleWidth,
                                <h5 className="font-medium">{TARGET}</h5>,
                            )}
                        </Col>
                        {isTargetInfoLoading ? (
                            renderTwoColumnSkeletonRows(targetGroupConfig.length)
                        ) : (
                            <>
                                <Col sm={6} className="mb15">
                                    <ul className="px15">
                                        {targetGroupConfig.map((item, idx) => (
                                            <li key={idx}>{item.label}</li>
                                        ))}
                                    </ul>
                                </Col>
                                <Col sm={6} className="mb15">
                                    <ul className="px15 text-right">
                                        {targetGroupConfig.map((item, idx) => (
                                            <li key={idx}>
                                                {numberWithCommas(channelSummary?.[item.valueKey])}
                                                <span className={item.suffixClass}>%</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Col>
                            </>
                        )}
                    </Row>
                </div>
            </Col>
        </Row>
    );
    const insightData = targetInfo?.Insight_Summary || null;
    // const insightData = SampleInsightSummary;
    const insightTabKeys = useMemo(() => {
        if (!insightData || typeof insightData !== 'object' || insightData?.error) return [];
        const keys = Object.keys(insightData).filter((key) => Array.isArray(insightData[key]));
        return keys.sort((a, b) => {
            const aIsOthers = (a || '').toLowerCase() === 'others';
            const bIsOthers = (b || '').toLowerCase() === 'others';
            if (aIsOthers) return 1;
            if (bIsOthers) return -1;
            return 0;
        });
    }, [insightData]);

    const formatInsightTabLabel = (key) =>
        `${key?.slice(0, 1)?.toUpperCase() || ''}${key?.slice(1)?.toLowerCase() || ''}`;

    const insightTabData = useMemo(() => {
        if (!insightTabKeys.length || !insightData) return [];
        return insightTabKeys.map((tabKey) => {
            const items = Array.isArray(insightData[tabKey]) ? insightData[tabKey] : [];
            return {
                id: tabKey,
                text: formatInsightTabLabel(tabKey),
                component: () => (
                    <div className="pt20">
                        {items.length > 0 ? (
                            <div className="sampleListDemographicsCharts d-flex flex-wrap">
                                {items.map((item, index) => (
                                    <InsightChartPortlet
                                        key={`${tabKey}-chart-${index}`}
                                        insightData={item}
                                        chartKey={`${tabKey}-chart-${index}`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">No data available</div>
                        )}
                    </div>
                ),
            };
        });
    }, [insightTabKeys, insightData]);

    const renderInsights = () => {
        if (
            !insightData ||
            typeof insightData !== 'object' ||
            !Object.keys(insightData)?.length ||
            insightData?.error ||
            !insightTabData.length
        ) {
            return null;
        }
        return (
            <div className="box-design no-box-shadow my25">
                <div className="tabs-right-align pageSub_tab">
                    <h4 className="m0 position-relative left0">Insights</h4>
                    <RSTabber
                        tabData={insightTabData}
                        defaultTab={0}
                        componentClassName="mt15"
                        className="rs-tabs row justify-content-end float-right"
                        defaultClass={`col-md-2 tabTransparent`}
                        dynamicTab={`sp-mb-space-sm mini`}
                    />
                </div>
            </div>
        );
    };

    const [analytics, setAnalytics] = useState(false);
    const [analyticsClick, setAnalyticsClick] = useState(false);

    const advanceAnalyticsList = watch('advanceAnalyticsList');

    const advanceAnalyticsColumns = useMemo(() => {
        if (advanceAnalyticsGridAPI?.isLoading && advanceAnalyticsList?.length) {
            return getTargetInfoList([], advanceAnalyticsList);
        }
        return getTargetInfoList(getAdvAnalyticsGrid, advanceAnalyticsList);
    }, [getAdvAnalyticsGrid, advanceAnalyticsList, advanceAnalyticsGridAPI?.isLoading]);
    const handleadvanceAnalyticsList = ({ value }) => {
        setDetailChange(false);
        if (value?.length > 0 && value?.length <= 5) {
            clearErrors('advanceAnalyticsList');
            setAnalyticsClick(true);
            setOptionAttr(_map(value, 'sOLRFieldName').join(','));
        } else if (value?.length > 4) {
            setAnalyticsClick(false);
            setError('advanceAnalyticsList', {
                type: 'custom',
                message: MAX_5_ATTRIBUTES,
            });
        } else {
            setAnalyticsClick(false);
        }
    };
    const fetchAdvanceAnalyticsList = useCallback(() => {
        const payload = {
            listId: audienceId,
            departmentId,
            clientId,
            userId,
        };
        return advanceAnalyticsListAPI.refetch({ payload });
    }, [advanceAnalyticsListAPI, audienceId, clientId, departmentId, userId]);

    const handleClickGridJson = async () => {
        const payload = {
            attributes: optionAttr,
            segmentationListId: audienceId,
            departmentId,
            clientId,
            userId,
        };
        if (!isActiveRef.current) return;
        setRecords(true);
        setDetailChange(false);
        const response = await advanceAnalyticsGridAPI.refetch({ payload });
        if (!isActiveRef.current) return;
        if (response?.status) {
            setDetailChange(true);
        }
    };
    const handleDownloadCSV = async (keyData) => {
        const payload = {
            segmentationListId: audienceId,
            departmentId,
            clientId,
            userId,
            downloadType: 'AdvanceAnalytics',
            attributesListID: optionAttr,
            segmentationListName: list.recipientsBunchName,
            sentMailList: keyData,
            createdBy: userId,
        };

        const res = await dispatch(getAdvAnlayticsDownloadFile(payload));
        if (!isActiveRef.current) return;
        if (res?.status) {
            setOtpSuccessModal(true);
            downloadCloseTimeoutRef.current = setTimeout(() => {
                downloadCloseTimeoutRef.current = null;
                handleClose(false);
            }, 3000);
        }
    };
    return (
        <>
            <RSModal
                show={segmentInfoModal}
                className={otpModal ? 'visually-hidden' : 'modal-w-carousel target-list-info-modal'}
                handleClose={() => {
                    stopTargetInfoRequests();
                    setAnalyticsClick(false);
                    handleClose(false);
                }}
                header={LIST_INFO}
                size="xxlg"
                bodyClassName = {'pt0'}
                body={
                        <div className={`${otpModalhide ? 'pe-none click-off' : ''} master-recip-data-popup-del `}>
                            <Row
                                className={`${showbottomline ? 'listinfo-header-line' : ''} ${
                                    !analytics ? 'py10' : 'pt15'
                                }`}
                            >
                                <Col md={6} className={'d-flex align-items-center gap-2'}>
                                    <h4 className={'mb0'}>
                                        {!analytics ? (
                                            bunchName?.length > 50 ? (
                                                <RSTooltip
                                                    text={bunchName}
                                                    position="top"
                                                    className="modalOverlayZindexCSS"
                                                >
                                                    <span>{truncateTitle(bunchName, 50)}</span>
                                                </RSTooltip>
                                            ) : (
                                                bunchName
                                            )
                                        ) : (
                                            ADVANCED_DETAILS
                                        )}
                                    </h4>

                                    {analytics && (
                                        <RSPPophover
                                            className="modalOverlayZindexCSS"
                                            position="bottom"
                                            pophover={
                                                <ul className="rs-tooltip-text-multi">
                                                    <li>
                                                        <span className="ml0">
                                                            {MORE_THAN_5_ATTRIBUTES}
                                                        </span>
                                                    </li>
                                                    <li>
                                                        <span className="ml0">
                                                            {DOWNLOAD_ADVANCED_DETAILS}
                                                        </span>
                                                    </li>
                                                </ul>
                                            }
                                        >
                                            <i
                                                className={`${circle_question_mark_mini} icon-xs   color-primary-blue position-relative`}
                                                id="circle_question_mark"
                                            ></i>
                                        </RSPPophover>
                                    )}
                                </Col>
                                <Col
                                    md={6}
                                    className={`${
                                        !analytics
                                            ? 'd-flex justify-content-between align-items-center'
                                            : 'd-flex flex-right'
                                    }`}
                                >
                                    {!analytics ? (
                                        <h6
                                            className={`${
                                                !(list?.listType === 5 || list?.listType === 0) ? 'mb8' : ''
                                            }`}
                                        >
                                            <span>
                                                {CREATED_BY}:{' '}
                                                <span className="RSfirstLetterCaps">{createdBy}</span>
                                                {', '}
                                            </span>
                                            <span>
                                                on:{' '}
                                                {
                                                    getUserCurrentFormat(list?.createdDate, { isOffset: true })
                                                        ?.dateTimeFormat
                                                }
                                            </span>
                                        </h6>
                                    ) : (
                                        <RSTooltip
                                            className={`mr15 ${
                                                getAdvAnalyticsGrid?.length > 0 && detailChange ? '' : 'pe-none click-off'
                                            }`}
                                            position="top"
                                            text={DOWNLOAD}
                                        >
                                            <i
                                                id="rs_data_download"
                                                className={`${csv_download_large} icon-lg color-primary-blue`}
                                                onClick={() => {
                                                    const payload = {
                                                        departmentId,
                                                        clientId,
                                                        userId,
                                                        requestfrom: 'Advancedetails',
                                                    };
                                                    dispatch(getUserInfoDetailsForOTP(payload, false));
                                                    setOtpModal(true);
                                                    setOtpModalhide(true);
                                                }}
                                            />
                                        </RSTooltip>
                                    )}
                                    {(list?.listType === 5 || list?.listType === 0) && (
                                        <RSTooltip
                                            className={` ${countInfo[0]?.RecipientCount === 0 ? 'pe-none click-off' : ''}`}
                                            position={!analytics ? 'left' : "top" }
                                            text={
                                                !analytics
                                                    ? TARGETINFO_ADVANCED_DETAILS
                                                    : LIST_VIEW
                                            }
                                        >
                                            <i
                                                className={`${
                                                    !analytics
                                                        ? circle_analytics_fill_large
                                                        : circle_list_large
                                                } icon-lg color-primary-blue`}
                                                onClick={() => {
                                                    if (analytics) {
                                                        stopAdvanceAnalyticsRequests();
                                                    }
                                                    if (!analytics && !GetAdvanceAnalyticsList?.length) {
                                                        fetchAdvanceAnalyticsList();
                                                    }
                                                    dispatch(
                                                        target_list_view({
                                                            field: 'getAdvAnalyticsGrid',
                                                            data: [],
                                                        }),
                                                    );
                                                    resetField('advanceAnalyticsList');
                                                    setAnalyticsClick(false);
                                                    setDetailChange(false);
                                                    setAnalytics(!analytics);
                                                    if (!analytics) {
                                                        setShowbottomline(false);
                                                    } else {
                                                        setShowbottomline(true);
                                                    }
                                                }}
                                            />
                                        </RSTooltip>
                                    )}
                                </Col>
                            </Row>

                            <div className="target-info-crossfade-wrapper">
                                <div className={`target-info-pane list-panel ${!analytics ? 'is-active' : ''}`}>
                                    {isDataAugment ? (
                                        <Carousel className="gaugeslider-wrapper mt16" interval={null}>
                                            <Carousel.Item className="css-scrollbar">{singleInfo}</Carousel.Item>
                                            <Carousel.Item className="css-scrollbar">
                                                <Row>
                                                    <Col sm={6}>
                                                        <h5 className="font-medium">Profile completeness</h5>
                                                        {isTargetInfoLoading ? (
                                                            <PieChartSkeleton size={160} className="mt-15" />
                                                        ) : dataSummary && dataSummary.length > 0 ? (
                                                            <RSHighchartsContainer
                                                                options={pieChartOptions(dataSummaryChart)}
                                                            />
                                                        ) : (
                                                            <PieChartSkeleton
                                                                size={160}
                                                                className="mt-15"
                                                                nodata={true}
                                                            />
                                                        )}
                                                    </Col>
                                                    <Col sm={6} className="d-flex align-items-center">
                                                        <div className="target-info-modal-grid w-100">
                                                            <KendoGrid
                                                                data={attributeSummary}
                                                                noBoxShadow
                                                                isFailure={
                                                                    !isTargetInfoLoading &&
                                                                    (!attributeSummary || attributeSummary.length === 0)
                                                                }
                                                                settings={{ total: attributeSummary?.length || 0 }}
                                                                column={getAttributeSummaryColumns()}
                                                                isCustomBox
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Carousel.Item>
                                        </Carousel>
                                    ) : (
                                        singleInfo
                                    )}
                                    {renderInsights()}
                                </div>
                                <div className={`target-info-pane grid-panel ${analytics ? 'is-active' : ''} ${otpModalhide ? 'pe-none click-off' : ''}`}>
                                    <Row>
                                        <Col className="my15">
                                            <div className="d-flex align-items-end target-info-advanced-filter">
                                                <div className="flex-grow-1 mr15">
                                                    <RSMultiSelect
                                                        className="target-info-advanced-ms"
                                                        name="advanceAnalyticsList"
                                                        data={updatedInfoList}
                                                        control={control}
                                                        placeholder={SELECT_COLUMNS}
                                                        textField={'attributeName'}
                                                        dataItemKey={'dataAttributeId'}
                                                        isLoading={advanceAnalyticsListAPI?.isLoading}
                                                        handleChange={handleadvanceAnalyticsList}
                                                    />
                                                </div>
                                                <div className="target-info-advanced-action lh0">
                                                    {advanceAnalyticsGridAPI?.isLoading ? (
                                                        <div className="segment_loader"></div>
                                                    ) : (
                                                        <RSTooltip
                                                            text={VIEW_THE_GRID}
                                                            position="top"
                                                            className={`${
                                                                advanceAnalyticsList?.length === 0 ||
                                                                advanceAnalyticsList?.length > 5 ||
                                                                advanceAnalyticsList === undefined
                                                                    ? 'pe-none click-off'
                                                                    : ''
                                                            } lh0`}
                                                        >
                                                            <i
                                                                onClick={() => {
                                                                    handleClickGridJson();
                                                                }}
                                                                className={`${circle_arrow_right_medium} color-primary-blue icon-md`}
                                                            />
                                                        </RSTooltip>
                                                    )}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div className="form-group target-info-modal-grid">
                                        <KendoGrid
                                            data={getAdvAnalyticsGrid?.length > 0 ? getAdvAnalyticsGrid : []}
                                            noBoxShadow
                                            isLoading={advanceAnalyticsGridAPI?.isLoading}
                                            isFailure={
                                                !advanceAnalyticsGridAPI?.isLoading && !getAdvAnalyticsGrid?.length
                                            }
                                            settings={{ total: getAdvAnalyticsGrid?.length }}
                                            column={advanceAnalyticsColumns}
                                            skeletonColumns={advanceAnalyticsColumns.length || undefined}
                                            isCustomBox
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            />
            <DownloadCSV
                show={otpModal}
                handleClose={() => {
                    setOtpModal(false);
                    setOtpModalhide(false);
                }}
                onSuccess={(keyData) => {
                    handleDownloadCSV(keyData);
                }}
                isTargetAdvanceDownload
            />
            {otpSuccessModal && (
                <RSConfirmationModal
                    show={otpSuccessModal}
                    htmlContent={
                        <p className="text-center">
                            {THANK_YOU_YOUR_REQUEST}
                            <br />
                            {DOWNLOAD_LINK_DATA_SHORTLY}
                        </p>
                    }
                    secondaryButton={false}
                    primaryButton={false}
                    handleClose={() => {
                        setOtpSuccessModal(false);
                    }}
                />
            )}
        </>
    );
};

export default TargetInfo;
