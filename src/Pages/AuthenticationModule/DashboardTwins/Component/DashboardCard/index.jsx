import { formatNumber } from 'Utils/modules/campaignUtils';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { handleCustomNavigationDetails } from 'Utils/modules/navigation';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { arrow_up_bold_medium, dollar_bold_medium, menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import { DashboardContext } from '../../Dashboard';

import RetargetList from 'Pages/AuthenticationModule/Analytics/Pages/communicationAnalytics/AnalyticsReport/Components/CommunicationAnalysis/Components/RetargetList';
import RSPLogger from 'Utils/RSPLogger/RSPLogger';
import useQueryParams from 'Hooks/useQueryParams';

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
    const navigate = useNavigate();
      const locationState = useQueryParams()
    const [currentView, setCurrentView] = useState(name);
    const { duration, dropData, setDropData } = useContext(DashboardContext);

    useEffect(() => {
        setCurrentView(name);
    }, [dropOffData]);

    const { currencyMasterList } = getmasterData();
    const { currencyId } = getUserDetails();
    let currsymbol = '₹';
    const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
    currsymbol = matchingCurrency ? matchingCurrency.currenySymbol : currsymbol;
    const processedDetails = useMemo(() => {
        if (currentView.includes("drop") && dropOffData && dropOffData.length > 0) {
            return dropOffData;
        }
        else if (details && details.length) {
            if (isTopPage) {
                const aggregatedData = {};

                details.forEach(item => {
                    if (item?.pageUrl) {
                        const key = getSplitValue(item?.pageUrl);
                        if (aggregatedData[key]) {
                            aggregatedData[key].avgSeconds = (
                                parseFloat(aggregatedData[key].avgSeconds || 0) +
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
            } else {
                return details;
            }
        }
        return details;
    }, [details, isTopPage, currentView, dropOffData]);

    const handleDlNavigation = (data) => {
        const state = {
            dynamicListName:
                `${data?.eventName?.substring(0, 10)}` +
                '_' +
                `${new Date().toDateString() +
                '_' +
                new Date().getHours() +
                '_' +
                new Date().getMinutes() +
                '_' +
                new Date().getSeconds()
                }`,
            dashboard: type === 'web' ? 'web' : 'mobile',
            isWeb: type === 'web' ? isWebAppId : {},
            isMobile: type === 'mobile' ? isMobileAppId : {},
            eventName: data?.eventName,
            MatchType: 'All',
            from: 'dashboard',
            screenName: type === 'mobile' ? data?.screenName : '',
              ...handleCustomNavigationDetails(locationState)
        };

        const url = '/audience/create-dynamic-list';
        const encryptState = encodeUrl(state);
        navigate(`${url}?q=${encryptState}`, {
            state,
        });
    };
    return (
        <div className="portlet-container portlet-md">
            {dropdownData ? (
                <div className="portlet-header">
                    <h4>
                        {name === 'Top performing communications'
                            ? dropData?.performancesTitle
                            : dropData?.earningsTitle}
                    </h4>
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
                                onSelect={(e) => {
                                    handleChange(duration, e);
                                    name === 'Top performing communications'
                                        ? setDropData((prev) => ({
                                            ...prev,
                                            performancesTitle: e,
                                        }))
                                        : setDropData((prev) => ({
                                            ...prev,
                                            earningsTitle: e,
                                        }));
                                }}
                                isActive
                                isCustomDefaultIcon
                            />
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="portlet-header">
                    <h4>{currentView}</h4>
                    {dropOffData && dropOffData?.length > 0 && (
                        <div className="float-end" id="rs_web_dashboard_page_views_dropdown">
                            <BootstrapDropdown
                                data={pageViewsDropdownData}
                                flatIcon
                                defaultItem={<i className={`${menu_dot_medium} icon-md`} />}
                                showUpdate={true}
                                className="no_caret"
                                alignRight
                                onSelect={(e) => {
                                    RSPLogger.debug('Page views dropdown selected', { selection: e });
                                    const newView = e.includes("drop") ? 'dropPages' : 'topPages';
                                    setCurrentView(e);
                                    if (onDropOffChange) {
                                        onDropOffChange(newView);
                                    }
                                }}
                                isActive
                                isCustomDefaultIcon
                            />
                        </div>
                    )}
                </div>
            )}

            {!!processedDetails && processedDetails?.length ? (
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
                                                            <small className="fs20">%</small>
                                                            <i
                                                                className={`icon-md ${data?.range === 'high'
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
