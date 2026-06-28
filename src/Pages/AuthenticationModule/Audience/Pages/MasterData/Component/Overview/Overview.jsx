
import { DATA_CAPTURED, IDENTIFIED, PROFILE_COMPLETENESS } from 'Constants/GlobalConstant/Placeholders';
import { bubbleChartOptions, pieChartOptions } from 'Constants/Charts';
import { AUDIENCE_OVERVIEW_CHART_COLORS } from 'Pages/AuthenticationModule/Audience/audienceChartColors';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { formatName, numberWithCommas, showPercentage } from 'Utils/modules/formatters';
import { email_xlarge, menu_dot_medium, mobile_sms_xlarge, notification_xlarge, user_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import _key from 'lodash/keys';
import _get from 'lodash/get';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSHighchartsContainer from 'Components/Highcharts';

import {
    sanitizeMdmChartValue,
    sanitizeMdmMetric,
    compareMdmStrings,
} from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { update_MDM_field } from 'Reducers/audience/masterdata/reducer';
import { PieChartSkeleton } from 'Components/Skeleton/Skeleton';
import MdmSkeletonScope from 'Components/Skeleton/pages/audience/mdm/MdmSkeletonScope';
import MdmOverviewBubbleSkeleton from 'Components/Skeleton/pages/audience/mdm/MdmOverviewChartSkeleton';
import { getSessionId } from 'Reducers/globalState/selector';

import ProfileCompleteness from './Components/ProfileCompleteness';
import EmailInfo from './Components/EmailInfo';
import MobileInfo from './Components/MobileInfo';
import NotificationInfo from './Components/NotificationInfo';
import OverviewInfo from './Components/OverviewInfo';
import SocialMedia from './Components/SocialMedia';

const getChannelDisplayLabel = (channelName) => {
    if (!channelName) return channelName ?? '';
    try {
        const lookupKey = channelName === 'Mobile' ? 'sms' : channelName;
        const { label } = getChannelId(lookupKey) ?? {};
        return label || channelName;
    } catch {
        return channelName;
    }
};

const getBindAudienceChartType = (bindAudienceList) => {
    if (!Array.isArray(bindAudienceList)) return '';
    let chartType = '';
    bindAudienceList.forEach((rec) => {
        if (typeof rec !== 'string') return;
        const parts = rec.split(':');
        if (parts.length === 2) {
            chartType = parts[1];
        }
    });
    return chartType;
};

const CHART_SWITCH_SKELETON_MS = 350;
const DEFAULT_CHART_PIE = { series: [] };

const buildSortedChartFields = (chartFieldsSource) => {
    if (!chartFieldsSource || typeof chartFieldsSource !== 'object' || Array.isArray(chartFieldsSource)) {
        return { chartItems: [], chartDisabledItems: [] };
    }

    const originalKeys = Object.keys(chartFieldsSource);
    const firstKey = originalKeys[0];

    const sortedEntries = Object.entries(chartFieldsSource).sort((a, b) => {
        if (a[0] === firstKey) return -1;
        if (b[0] === firstKey) return 1;
        return (Number(b[1]) || 0) - (Number(a[1]) || 0);
    });

    const chartItems = _key(Object.fromEntries(sortedEntries)) ?? [];
    const chartDisabledItems = chartItems.filter((field) => chartFieldsSource?.[field] === 0);
    return { chartItems, chartDisabledItems };
};

const getPieChartOptionsSafe = (pieChartData) => {
    try {
        return pieChartOptions(pieChartData ?? DEFAULT_CHART_PIE);
    } catch {
        return pieChartOptions(DEFAULT_CHART_PIE);
    }
};

const getBubbleChartOptionsSafe = (pieChartData) => {
    try {
        return bubbleChartOptions(pieChartData ?? DEFAULT_CHART_PIE);
    } catch {
        return bubbleChartOptions(DEFAULT_CHART_PIE);
    }
};

const Overview = ({ show = {}, handleInfo = () => {} }) => {
    const { t: translation } = useTranslation();

    const {
        audienceOverview = {},
        bindAudienceLoading = false,
        chartAttr,
        recommendationJson = {},
    } = useSelector(({ masterDataReducer = {} }) => masterDataReducer);
    const bindAudienceRaw = _get(audienceOverview, `recipientListModel.bindAudience.${chartAttr ?? ''}`, []);
    const bindAudience = Array.isArray(bindAudienceRaw) ? bindAudienceRaw : [];
    const tempMDMValue = audienceOverview?.recipientListModel ?? {};
    const isMountedRef = useRef(true);

    const chartData = useMemo(() => {
        let series = [];
        let chart = '';
        bindAudience.forEach((rec) => {
            if (typeof rec !== 'string') return;
            const tmp = rec.split(':');
            const channelLabel = getChannelDisplayLabel(tmp[0]);

            if (tmp?.length === 2) {
                chart = tmp[1];
            } else if (tmp?.length > 2) {
                series.push({
                    name: channelLabel,
                    y: sanitizeMdmChartValue(tmp[1]),
                    value: sanitizeMdmChartValue(tmp[1]),
                });
            }
        });

        return {
            type: chart,
            colors: [...AUDIENCE_OVERVIEW_CHART_COLORS],
            pieChart: { series },
        };
    }, [bindAudience, chartAttr]);

    const chartDataBubble = useMemo(() => {
        let series = [];
        let chart = '';
        bindAudience.forEach((rec) => {
            if (typeof rec !== 'string') return;
            const tmp = rec.split(':');
            const channelLabel = getChannelDisplayLabel(tmp[0]);

            if (tmp?.length === 2) {
                chart = tmp[1];
            } else if (tmp?.length > 2) {
                series.push({
                    name: channelLabel,
                    y: sanitizeMdmChartValue(tmp[2]),
                    value: sanitizeMdmChartValue(tmp[2]),
                });
            }
        });

        return {
            type: chart,
            colors: [...AUDIENCE_OVERVIEW_CHART_COLORS],
            pieChart: { series },
        };
    }, [bindAudience, chartAttr]);

    const dispatch = useDispatch();
    const sessionIds = useSelector((state) => getSessionId(state) ?? {});
    const { departmentId, clientId, userId } = sessionIds;

    const getAudienceBindData = (attr) => {
        if (!attr) return;
        dispatch(update_MDM_field({ field: 'chartAttr', data: attr }));
    };

    const handleFindValue = (data, field) => {
        if (!field || !Array.isArray(data) || !data.length) return undefined;
        return data.find((item) => formatName(item?.name) === field);
    };

    const handleWebMobileNotificationCount = () => {
        const tempWebNotification = Array.isArray(tempMDMValue?.pushNotificationsInfo?.webNotifcation)
            ? tempMDMValue.pushNotificationsInfo.webNotifcation
            : [];
        const tempMobileNotification = Array.isArray(tempMDMValue?.pushNotificationsInfo?.mobileNotifcation)
            ? tempMDMValue.pushNotificationsInfo.mobileNotifcation
            : [];
        const types = ['identified', 'known', 'unknown'];

        if (tempWebNotification?.length) {
            const [findWebIdentified, findWebKnown, findWebUnknown] = types?.map((type) =>
                handleFindValue(tempWebNotification, type),
            );
            if (findWebIdentified?.value) {
                const finalValue = {
                    type: 'web',
                    captured: 'Identified',
                    value: findWebIdentified?.value,
                };
                return finalValue;
            } else if (findWebKnown?.value) {
                const finalValue = {
                    type: 'web',
                    captured: 'Known',
                    value: findWebKnown?.value,
                };
                return finalValue;
            } else if (findWebUnknown) {
                const finalValue = {
                    type: 'web',
                    captured: 'Unknown',
                    value: findWebUnknown?.value,
                };
                return finalValue;
            }
        } else if (tempMobileNotification?.length) {
            const [findMobileIdentified, findMobileKnown, findMobileUnknown] = types?.map((type) =>
                handleFindValue(tempMobileNotification, type),
            );
            if (findMobileIdentified?.value) {
                const finalValue = {
                    type: 'mobile',
                    captured: 'Identified',
                    value: findMobileIdentified?.value,
                };
                return finalValue;
            } else if (findMobileKnown?.value) {
                const finalValue = {
                    type: 'mobile',
                    captured: 'Known',
                    value: findMobileKnown?.value,
                };
                return finalValue;
            } else if (findMobileUnknown) {
                const finalValue = {
                    type: 'mobile',
                    captured: 'Unknown',
                    value: findMobileUnknown?.value,
                };
                return finalValue;
            }
        }
        return null;
    };

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // state update issue fix --lakshmi
    useEffect(() => {
        const { chartItems = [] } = buildSortedChartFields(tempMDMValue?.chartFields);
        if (!chartAttr && chartItems[0]) getAudienceBindData(chartItems[0]);
    }, [chartAttr, tempMDMValue?.chartFields]);

    const chartFields = useMemo(
        () => buildSortedChartFields(tempMDMValue?.chartFields),
        [tempMDMValue?.chartFields, departmentId, clientId, userId],
    );

    const totalRecipients = sanitizeMdmMetric(tempMDMValue?.totalRecipients);
    const emailRecipients = sanitizeMdmMetric(tempMDMValue?.emailRecipients);
    const mobileRecipients = sanitizeMdmMetric(tempMDMValue?.mobileRecipients);
    const totalIdentifiedAudience = sanitizeMdmMetric(tempMDMValue?.pushNotificationsInfo?.totalIdentifiedAudience);
    const socialMediaRecipients = sanitizeMdmMetric(tempMDMValue?.socialMediaRecipients);
    const totalNotifications = sanitizeMdmMetric(tempMDMValue?.pushNotificationsInfo?.totalNotifications);

    const isNotification = totalNotifications > 0;
    const isSocialNotification = socialMediaRecipients > 0;
    const [overviewOptions, setOverviewOptions] = useState(chartFields?.chartItems?.[0] ?? '');
    const [isChartSwitching, setIsChartSwitching] = useState(false);

    useEffect(() => {
        const nextLabel = chartAttr || chartFields?.chartItems?.[0];
        if (nextLabel) setOverviewOptions(nextLabel);
    }, [chartAttr, chartFields?.chartItems]);

    useEffect(() => {
        if (!isChartSwitching) return undefined;

        const timeoutId = setTimeout(() => {
            if (isMountedRef.current) setIsChartSwitching(false);
        }, CHART_SWITCH_SKELETON_MS);
        return () => clearTimeout(timeoutId);
    }, [chartAttr, isChartSwitching]);

    const handleChartDropdownSelect = (selectedItem) => {
        if (!selectedItem || selectedItem === chartAttr) return;
        setIsChartSwitching(true);
        getAudienceBindData(selectedItem);
        setOverviewOptions(selectedItem);
    };

    const sortChartItems = useMemo(() => {
        const items = Array.isArray(chartFields?.chartItems) ? chartFields.chartItems : [];
        const disabledItems = Array.isArray(chartFields?.chartDisabledItems) ? chartFields.chartDisabledItems : [];
        const disabledSet = new Set(disabledItems);
        const enabledItems = items
            .filter((item) => typeof item === 'string' && item.trim() !== '' && !disabledSet.has(item))
            .sort((a, b) => compareMdmStrings(a, b));
        const disabledSortedItems = items
            .filter((item) => typeof item === 'string' && item.trim() !== '' && disabledSet.has(item))
            .sort((a, b) => compareMdmStrings(a, b));
        return [...enabledItems, ...disabledSortedItems];
    }, [chartFields?.chartItems, chartFields?.chartDisabledItems]);

    const chartDropdownDisabledItems = useMemo(
        () =>
            (Array.isArray(chartFields?.chartDisabledItems) ? chartFields.chartDisabledItems : []).filter(
                (item) => typeof item === 'string' && item.trim() !== '',
            ),
        [chartFields?.chartDisabledItems],
    );

    const chartDropdownToggle = useMemo(
        () => <i className={`${menu_dot_medium} color-primary-blue icon-md`} />,
        [],
    );

    const selectedChartType = useMemo(() => {
        const attr = chartAttr || overviewOptions;
        if (!attr) return '';
        const raw = _get(audienceOverview, `recipientListModel.bindAudience.${attr}`, []);
        return getBindAudienceChartType(Array.isArray(raw) ? raw : []);
    }, [audienceOverview, chartAttr, overviewOptions]);

    const hasChartData = bindAudience.length > 0;
    const notificationSummary = handleWebMobileNotificationCount();
    const canRenderPortal = typeof document !== 'undefined' && Boolean(document?.body);

    const renderOverviewChartSkeleton = () => {
        if (selectedChartType === 'MultiChart') {
            return <MdmOverviewBubbleSkeleton />;
        }
        return <PieChartSkeleton hideInternalNoData />;
    };

    const renderOverviewChart = () => {
        if (!hasChartData) {
            return <PieChartSkeleton isError />;
        }
        if (selectedChartType === 'MultiChart') {
            return (
                <RSHighchartsContainer
                    type="bubble"
                    className="position-relative top-20"
                    key={`bubble-${chartAttr ?? 'default'}`}
                    options={getBubbleChartOptionsSafe(chartDataBubble?.pieChart)}
                />
            );
        }
        return (
            <RSHighchartsContainer
                type="pie"
                key={`pie-${chartAttr ?? 'default'}`}
                options={getPieChartOptionsSafe(chartData?.pieChart)}
            />
        );
    };

    return (
        <Row className="position-relative">
            <Col sm={6}>
                <div className="portlet-container portlet-md mdm-overview-chart-portlet">
                    <div className="portlet-header">
                        <h4>{overviewOptions || chartAttr || ''}</h4>
                        {(sortChartItems?.length ?? 0) > 0 && (
                            <div className="float-end mr-7">
                                <BootstrapDropdown
                                    data={sortChartItems}
                                    alignRight
                                    flatIcon
                                    showUpdate={false}
                                    disbleItems={chartDropdownDisabledItems}
                                    defaultItem={chartDropdownToggle}
                                    className="no_caret"
                                    onSelect={handleChartDropdownSelect}
                                />
                            </div>
                        )}
                    </div>
                    <div className="portlet-body">
                        <MdmSkeletonScope injectCriticalCss={true}>
                            <div className="mdm-overview-chart-content">
                                {hasChartData && !isChartSwitching && (
                                    <div className="mdm-overview-chart-live">{renderOverviewChart()}</div>
                                )}
                                {hasChartData && isChartSwitching && (
                                    <div className="mdm-overview-chart-skeleton-overlay">
                                        {renderOverviewChartSkeleton()}
                                    </div>
                                )}
                                {!hasChartData && !bindAudienceLoading && <PieChartSkeleton isError />}
                            </div>
                        </MdmSkeletonScope>
                    </div>
                </div>
            </Col>
            <Col sm={6}>
                <Row>
                    <Col sm={6}>
                        <OverviewInfo
                            label={'Total'}
                            count={numberWithCommas(totalRecipients)}
                            // title={
                            //     showPercentage((tempMDMValue?.totalRecipients / tempMDMValue?.totalRecipients) * 100) +
                            //         '%' +
                            //         ' ' +
                            //         translation('Profile completeness') || 0
                            // }
                            title={
                                sanitizeMdmMetric(tempMDMValue?.overAllprofilePercentage) ? (
                                    <>
                                        {sanitizeMdmMetric(tempMDMValue?.overAllprofilePercentage)}
                                        <span className="font-xxs">%</span> {PROFILE_COMPLETENESS}
                                    </>
                                ) : (
                                    <>
                                        0<span className="font-xxs">%</span> {PROFILE_COMPLETENESS}
                                    </>
                                )
                            }
                            popHoverText={translation('Channel')}
                            icon={user_xlarge}
                            iconColor={'color-primary-blue'}
                            bgImage={'master-total'}
                            infobtnClicked={(status) => {
                                if (status) handleInfo?.('profileComplete', true);
                            }}
                        />
                    </Col>
                    <Col sm={6}>
                        <OverviewInfo
                            label={'Email'}
                            count={numberWithCommas(emailRecipients)}
                            title={
                                emailRecipients && totalRecipients ? (
                                    <>
                                        {showPercentage((emailRecipients / totalRecipients) * 100)}
                                        <span className="font-xxs">%</span> {DATA_CAPTURED}
                                    </>
                                ) : (
                                    <>
                                        0<span className="font-xxs">%</span> {DATA_CAPTURED}
                                    </>
                                )
                            }
                            popHoverText={'Channel'}
                            icon={email_xlarge}
                            iconColor={'color-secondary-orange'}
                            bgImage={'master-email'}
                            infobtnClicked={(status) => {
                                if (status) handleInfo?.('emailInfo', true);
                            }}
                        />
                    </Col>

                    <Col sm={6}>
                        <OverviewInfo
                            label={'Mobile'}
                            count={numberWithCommas(mobileRecipients)}
                            title={
                                mobileRecipients && totalRecipients ? (
                                    <>
                                        {showPercentage((mobileRecipients / totalRecipients) * 100)}
                                        <span className="font-xxs">%</span> {DATA_CAPTURED}
                                    </>
                                ) : (
                                    <>
                                        0<span className="font-xxs">%</span> {DATA_CAPTURED}
                                    </>
                                )
                            }
                            popHoverText={'Channel'}
                            icon={mobile_sms_xlarge}
                            iconColor={'color-secondary-yellow'}
                            bgImage={'master-sms'}
                            infobtnClicked={(status) => {
                                if (status) handleInfo?.('mobileInfo', true);
                            }}
                        />
                    </Col>
                    <Col sm={6}>
                        <OverviewInfo
                            label={isSocialNotification && !isNotification ? 'Social' : 'Notifications'}
                            count={numberWithCommas(
                                isNotification
                                    ? totalIdentifiedAudience
                                    : isSocialNotification
                                      ? socialMediaRecipients
                                      : 0,
                            )}
                            title={
                                totalRecipients ? (
                                    <>
                                        {showPercentage(
                                            ((isNotification ? totalIdentifiedAudience : socialMediaRecipients) /
                                                totalRecipients) *
                                                100,
                                        )}
                                        <span className="font-xxs">%</span> {DATA_CAPTURED}
                                        {/*( {IDENTIFIED}) */}
                                    </>
                                ) : (
                                    <>
                                        0<span className="font-xxs">%</span> {DATA_CAPTURED}
                                        {/* ({IDENTIFIED}) */}
                                    </>
                                )
                            }
                            popHoverText={'Channel'}
                            icon={notification_xlarge}
                            iconColor={'color-secondary-green'}
                            bgImage={'master-social'}
                            infobtnClicked={(status) => {
                                if (!status) return;
                                if (isNotification) {
                                    handleInfo?.('notificationInfo', true);
                                } else {
                                    handleInfo?.('socialInfo', true);
                                }
                            }}
                            isNotificationInfo={sanitizeMdmMetric(notificationSummary?.value) > 0}
                        />
                    </Col>
                </Row>
            </Col>
            {show?.profileComplete && canRenderPortal && (
                <>
                    {ReactDOM.createPortal(
                        <div className="overlayCSS">
                            <div className="fade modal-backdrop"></div>
                            <ProfileCompleteness
                            show={Boolean(show?.profileComplete && canRenderPortal)}
                                chartData={tempMDMValue}
                                recommendationJson={recommendationJson ?? {}}
                                handleClose={(status) => {
                                    if (!status) handleInfo?.('profileComplete', false);
                                }}
                            />
                        </div>,
                        document.body,
                    )}
                </>
            )}
            {show?.emailInfo && canRenderPortal && (
                <>
                    {ReactDOM.createPortal(
                        <div className="overlayCSS">
                            <div className="fade modal-backdrop show"></div>
                            <EmailInfo
                            show={Boolean(show?.emailInfo && canRenderPortal)}
                                chartData={tempMDMValue}
                                handleClose={(status) => {
                                    if (!status) handleInfo?.('emailInfo', false);
                                }}
                                chartType={chartData?.type ?? ''}
                            />
                        </div>,
                        document.body,
                    )}
                </>
            )}
            {show?.mobileInfo && canRenderPortal && (
                <>
                    {ReactDOM.createPortal(
                        <div className="overlayCSS">
                            <div className="fade modal-backdrop show"></div>
                            <MobileInfo
                            show={Boolean(show?.mobileInfo && canRenderPortal)}
                                chartData={tempMDMValue}
                                handleClose={(status) => {
                                    if (!status) handleInfo?.('mobileInfo', false);
                                }}
                            />
                        </div>,
                        document.body,
                    )}
                </>
            )}
            {/* {show.notificationInfo && (
                <div className="overlayCSS">
                    <div className="fade modal-backdrop show"></div>
                <NotificationInfo
                    chartData={tempMDMValue}
                    firstChart={
                        isNotification
                            ? tempMDMValue?.pushNotificationsInfo?.webNotifcation
                            : isSocialNotification
                                ? this.state.responseData?.data?.recipientListModelsocialMediaInfo
                                : null
                    }
                    secondChart={
                        isNotification
                            ? tempMDMValue?.pushNotificationsInfo?.mobileNotifcation
                            : null
                    }
                    isNotification={isNotification}
                    isSocialNotification={isSocialNotification}
                    handleClose={(status) => {
                        if (!status) setIsShow((prev) => ({ ...prev, notificationInfo: false }));
                    }}
                />
                </div>
            )} */}
            {show?.notificationInfo && canRenderPortal && (
                <>
                    {ReactDOM.createPortal(
                        <div className="overlayCSS">
                            <div className="fade modal-backdrop show"></div>
                            <NotificationInfo
                            show={Boolean(show?.notificationInfo && canRenderPortal)}
                                chartData={tempMDMValue?.pushNotificationsInfo ?? {}}
                                handleClose={(status) => {
                                    if (!status) handleInfo?.('notificationInfo', false);
                                }}
                            />
                        </div>,
                        document.body,
                    )}
                </>
            )}
            {show?.socialInfo && canRenderPortal && (
                <>
                    {ReactDOM.createPortal(
                        <div className="overlayCSS">
                            <div className="fade modal-backdrop show"></div>
                            <SocialMedia
                            show={Boolean(show?.socialInfo && canRenderPortal)}
                                chartData={tempMDMValue?.socialMediaInfo ?? {}}
                                handleClose={(status) => {
                                    if (!status) handleInfo?.('socialInfo', false);
                                }}
                            />
                        </div>,
                        document.body,
                    )}
                </>
            )}
        </Row>
    );
};

export default memo(Overview);
