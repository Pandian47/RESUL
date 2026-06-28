import { arrow_up_bold_medium, dollar_bold_medium, menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import useQueryParams from 'Hooks/useQueryParams';
import RetargetList from 'Pages/AuthenticationModule/Analytics/Pages/communicationAnalytics/AnalyticsReport/Components/CommunicationAnalysis/Components/RetargetList';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatNumber } from 'Utils/modules/campaignUtils';
import { isAllValuesZero } from 'Utils/modules/charts';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { handleCustomNavigationDetails } from 'Utils/modules/navigation';
import RSPLogger from 'Utils/RSPLogger/RSPLogger';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import { DashboardContext } from '../../Dashboard';

const TOP_PERFORMING_COMMUNICATIONS = 'Top performing communications';
const TOP_EVENT_SUMMARY = 'Top event summary';

const getSplitValue = (item) => {
    if (!item || typeof item !== 'string') return 'home';

    const splitData = item.split('/').filter(Boolean);
    const splitValue = splitData?.slice(2);
    if (splitValue?.length > 0) {
        return splitValue.join('/');
    }

    if (splitData.length >= 2) {
        let domain = splitData[1];
        if (domain?.startsWith?.('www.')) {
            domain = domain?.substring(4);
        }
        return domain ?? 'home';
    }

    return 'home';
};

const getDisplayValue = (data) => {
    const combinedValue =
        data?.screenName ||
        data?.eventName ||
        data?.title ||
        data?.name ||
        (data?.pageUrl ? getSplitValue(data?.pageUrl) : 'Home');
    return combinedValue ?? 'Home';
};

const DashBoardCard = ({
    name,
    details,
    isImage = false,
    dropdownData,
    smallText,
    handleChange,
    isWebAppId,
    type,
    isMobileAppId,
    isTopPage = false,
    isError,
    dropOffData,
    onDropOffChange,
    pageViewsDropdownData,
    isTopEarning,
    communicationChartsRemountSeq = 0,
}) => {
    // Selectors
    const navigate = useNavigate();
    const locationState = useQueryParams() ?? {};
    const { duration, dropData = {}, setDropData } = useContext(DashboardContext) ?? {};
    const { currencyMasterList = [] } = getmasterData() ?? {};
    const { currencyId } = getUserDetails() ?? {};

    // Refs
    const { isMounted } = useComponentWillUnmount();

    // State
    const [currentView, setCurrentView] = useState(name);

    // Memo
    const currsymbol = useMemo(() => {
        const defaultSymbol = '₹';
        const matchingCurrency = currencyMasterList?.find((currency) => currency?.currencyID === currencyId);
        return matchingCurrency?.currenySymbol ?? defaultSymbol;
    }, [currencyMasterList, currencyId]);

    const processedDetails = useMemo(() => {
        if (currentView?.includes?.('drop') && Array.isArray(dropOffData) && dropOffData.length > 0) {
            return dropOffData;
        }

        if (Array.isArray(details) && details.length) {
            if (isTopPage) {
                const aggregatedData = {};

                details.forEach((item) => {
                    if (item?.pageUrl) {
                        const key = getSplitValue(item?.pageUrl);
                        if (aggregatedData[key]) {
                            aggregatedData[key].avgSeconds = (
                                parseFloat(aggregatedData[key]?.avgSeconds || 0) +
                                parseFloat(item?.avgSeconds || 0)
                            ).toString();
                        } else {
                            aggregatedData[key] = { ...item };
                        }
                    } else {
                        const uniqueKey = `no_url_${Math.random()}`;
                        aggregatedData[uniqueKey] = { ...item };
                    }
                });

                return Object.values(aggregatedData);
            }

            return details;
        }

        return details;
    }, [details, isTopPage, currentView, dropOffData]);

    const hasRenderableDetails =
        Array.isArray(processedDetails) &&
        processedDetails.length > 0 &&
        !isAllValuesZero(processedDetails);

    const performancesTitle = dropData?.performancesTitle;
    const earningsTitle = dropData?.earningsTitle;
    const isTopPerformingCard = name === TOP_PERFORMING_COMMUNICATIONS;

    // Effects
    useEffect(() => {
        if (!isMounted.current) return;
        setCurrentView(name);
    }, [dropOffData]);

    // Handlers
    const handleDlNavigation = (data) => {
        try {
            const now = new Date();
            const state = {
                dynamicListName:
                    `${data?.eventName?.substring?.(0, 10) ?? ''}` +
                    '_' +
                    `${now.toDateString()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}`,
                dashboard: type === 'web' ? 'web' : 'mobile',
                isWeb: type === 'web' ? (isWebAppId ?? {}) : {},
                isMobile: type === 'mobile' ? (isMobileAppId ?? {}) : {},
                eventName: data?.eventName,
                MatchType: 'All',
                from: 'dashboard',
                screenName: type === 'mobile' ? (data?.screenName ?? '') : '',
                ...handleCustomNavigationDetails(locationState ?? {}),
            };

            const url = '/audience/create-dynamic-list';
            const encryptState = encodeUrl(state);
            navigate(`${url}?q=${encryptState}`, { state });
        } catch (err) {
            RSPLogger.debug('Dynamic list navigation failed', { error: err?.message });
        }
    };

    const handlePerformanceDropdownSelect = (selectedItem) => {
        handleChange?.(duration, selectedItem);
        if (!isMounted.current || typeof setDropData !== 'function') return;

        if (isTopPerformingCard) {
            setDropData((prev) => ({
                ...(prev ?? {}),
                performancesTitle: selectedItem,
            }));
        } else {
            setDropData((prev) => ({
                ...(prev ?? {}),
                earningsTitle: selectedItem,
            }));
        }
    };

    const handlePageViewsSelect = (selectedItem) => {
        const selection = String(selectedItem ?? '');
        RSPLogger.debug('Page views dropdown selected', { selection: selectedItem });
        const newView = selection.includes('drop') ? 'dropPages' : 'topPages';
        if (!isMounted.current) return;
        setCurrentView(selectedItem);
        onDropOffChange?.(newView);
    };

    // JSX
    return (
        <div className="portlet-container portlet-md">
            {dropdownData ? (
                <div className="portlet-header">
                    <h4>{isTopPerformingCard ? performancesTitle : earningsTitle}</h4>
                    {!!dropdownData ? (
                        <div className="float-end">
                            <BootstrapDropdown
                                key={`dashboard-card-dd-${communicationChartsRemountSeq}`}
                                data={dropdownData}
                                flatIcon
                                defaultItem={<i className={`${menu_dot_medium} icon-md`} />}
                                showUpdate={true}
                                className="no_caret"
                                alignRight
                                onSelect={handlePerformanceDropdownSelect}
                                isActive
                                isCustomDefaultIcon
                            />
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="portlet-header">
                    <h4>{currentView}</h4>
                    {Array.isArray(dropOffData) && dropOffData.length > 0 && (
                        <div className="float-end" id="rs_web_dashboard_page_views_dropdown">
                            <BootstrapDropdown
                                data={pageViewsDropdownData}
                                flatIcon
                                defaultItem={<i className={`${menu_dot_medium} icon-md`} />}
                                showUpdate={true}
                                className="no_caret"
                                alignRight
                                onSelect={handlePageViewsSelect}
                                isActive
                                isCustomDefaultIcon
                            />
                        </div>
                    )}
                </div>
            )}

            {hasRenderableDetails ? (
                <div className={`portlet-body css-scrollbar ${processedDetails?.length > 5 ? 'pr15' : ''}`}>
                    <ul className={`portlet-list top-event-summarydropdown pt0 ${isImage ? 'img-list' : ''}`}>
                        {processedDetails.map((data, index) => {
                            const displayValue = getDisplayValue(data);
                            const isTopEventSummary = name === TOP_EVENT_SUMMARY;
                            const labelWrapperClassName = isTopEventSummary
                                ? 'd-flex align-items-center tabsMouseHover min-w-0 flex-fill overflow-hidden'
                                : 'top-performing d-flex align-items-center min-w-0 flex-fill overflow-hidden';

                            return (
                                <li key={index}>
                                    {isImage ? (
                                        <>
                                            <div className="user-info-wrapper">
                                                <div className="user-img">
                                                    <img src={data?.img} alt="User" width="45" />
                                                </div>
                                                <div className="user-name">
                                                    <h5>{data?.name}</h5>
                                                    <p className="desc">{data?.text} </p>
                                                </div>
                                            </div>
                                            <div className="percentage">
                                                <span>{data?.count}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={labelWrapperClassName}>
                                                <div
                                                    className={`min-w-0 flex-fill overflow-hidden${isTopEventSummary ? ' text-underline cp' : ''}`}
                                                >
                                                    <TruncateCell
                                                        value={displayValue}
                                                        noTable={true}
                                                    />
                                                </div>
                                                {isTopEventSummary && (
                                                    <RetargetList
                                                        mainClass="ml5 retarget-icon flex-shrink-0"
                                                        isDashboard
                                                        handleDlNavigation={() => {
                                                            handleDlNavigation(data);
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <div className="percentage flex-shrink-0">
                                                <span className="d-flex align-items-center">
                                                    <div className="font-bold">
                                                        {formatNumber(
                                                            data?.avgSeconds ||
                                                                data?.maxEventCount ||
                                                                data?.count ||
                                                                data?.value ||
                                                                data?.sessionCount,
                                                        )}
                                                        {isTopEarning && <span className="ml5">{currsymbol}</span>}
                                                    </div>
                                                    {data?.range ? (
                                                        <>
                                                            <small className="fs16 font-bold top2">%</small>
                                                            <i
                                                                className={`icon-md ${
                                                                    data?.range === 'high'
                                                                        ? `${arrow_up_bold_medium} color-secondary-green`
                                                                        : `${arrow_up_bold_medium} flip-vertical color-primary-red`
                                                                } fw-bold position-relative bottom3`}
                                                            ></i>
                                                        </>
                                                    ) : null}
                                                    {data?.currency === 'us' ? (
                                                        <>
                                                            M{' '}
                                                            <i
                                                                className={`icon-md ${dollar_bold_medium} color-primary-btn`}
                                                            ></i>
                                                        </>
                                                    ) : null}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    {smallText && <small className="portlet-info-text">{smallText}</small>}
                </div>
            ) : (
                <HorizontalSkeleton isError={isError} />
            )}
        </div>
    );
};

export default DashBoardCard;
