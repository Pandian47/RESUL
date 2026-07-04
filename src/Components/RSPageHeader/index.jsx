import { Fragment, useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getPersistorInstance } from 'Store/storeRef';
import { DDL_AUDIENCE_DATA, DDL_DASHBOARD_DATA, LAST_DAYS } from './constant';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { YEAR_LIST, YEAR_BELOW_LIST, MM_LIST, MM_MONTHS_NEW, MM_MONTHS, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { getUserDetails, updatedPermissionList, encryptWithAES } from 'Utils/modules/crypto';
import { CHANNELS_LIST } from 'Utils/modules/communicationChannels';
import { formatName } from 'Utils/modules/formatters';
import { validateIsCustomNavigate } from 'Utils/modules/navigation';
import CacheManager from 'Utils/cacheManager';
import { updateBuAndDepId, update_consumptionChannel, update_Dashboard, update_isWebAppId, update_isMobileAppId, update_isWebAppData, update_isMobileAppData, latest_consumptionMonth, latest_consumptionYear, updatedisLicenseId, resetGlobalState, updateBUByClientCompany, updateBUByClient, updateIndustryId, decrement_global_loading, getGlobalStateValue, reset_updateRenewalData } from 'Reducers/globalState/reducer';
import Icon from 'Components/Icon/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getGlobalAccountAdmin,
    getGlobalBUList,
    getGlobalClientList,
    getGlobalCompanyBUList,
    getSessionId,
} from 'Reducers/globalState/selector';
import { getSummaryList } from 'Reducers/analytics/analyticsSummary/selector';
import { clientIdChangeData, departmentIdChangeData, getBUList } from 'Reducers/globalState/request';
import { getMobileApps } from 'Reducers/communication/createCommunication/smartlink/request';
import { getTriggerBaseDDLData } from 'Reducers/audience/dynamicList/request';
import { COMMUNICATION_AVAILABLE_TABS as availableTabs } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
import { setTabforEdit, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import { getUserLimit } from 'Reducers/preferences/users/request';
import { resetdashboardState } from 'Reducers/Dashboard/dashboardReducer';
import { resetTargetListData } from 'Reducers/audience/targetList/reducer';
import RSTooltip from 'Components/RSTooltip';
import useQueryParams from 'Hooks/useQueryParams';
import RSAlertWarning from 'Components/RSAlertWarning';
import {
    BACK,
    BUSINESS_UNIT,
    CLIENT_CHANGE_FAILED,
    DEPARTMENT_CHANGE_FAILED
} from 'Constants/GlobalConstant/Placeholders';
import {
    arrow_left_mini,
    menu_dot_medium,
    star_fill_mini,
} from 'Constants/GlobalConstant/Glyphicons';

const RSPageHeader = ({
    issubHeading = false,
    subHeading = '',
    subHeadingDropdownData,
    title = '',
    issubHeadingDropDown = false,
    rightCommonMenus = false,
    isBack = false,
    state = {},
    backPath = '',
    backAction = () => { },
    isHeaderLine = false,
    isTabber = false,
    isDashboard = false,
    isConsumption = false,
    isChannel = false,
    onSubheadingChange = () => {},
    isBuDisabled = false,
    isAgencyDisabled = false,
    showAgency = true,
    hideBU = false,
    isLicense = false,
    isLiveDashboard = false,
    isCompany = false,
    hideCompany = false,
    star = false,
    date = null,
    pageClass = '',
    titleCls = '',
    starClass = '',
    onDurationChange = () => {},
    dashboardDateFilterResetSeq,
    detailAnalytics = false,
    BUtooltip = false,
    fromUserGrid = false,
    formAssignRole = false,
    isAccountSettings = false,
    downloadUI = false,
    isLoading = false,
    isBackAsLink = false,
    onBack,
}) => {
    const navigate = useNavigate();
    const defaultlocationState = useLocation();
    const location = useQueryParams('/dashboard') || { index: 0 };
    const disableNavIcons = location?.needBUs && location?.fromLogin || false;
    const { pathname, state: paramState, ...rest } = useLocation();
    // console.log("restatest", paramState)
    const dispatch = useDispatch();
    const persistor = getPersistorInstance();
    const { licenseTypeId, isAgency, createdDate, isEnterprisePlus } = getUserDetails();
    const clientList = useSelector((state) => getGlobalClientList(state));
    const accountAdmin = useSelector((state) => getGlobalAccountAdmin(state));
    const departmentList = useSelector((state) => getGlobalBUList(state));
    const departmentCompanyList = useSelector((state) => getGlobalCompanyBUList(state));
    const { updatedLicenseId, loading , renewalData } = useSelector(({ globalstate }) => globalstate);
    const effectiveLicenseTypeIdForBuUi = useMemo(() => {
        const fromRedux = parseInt(updatedLicenseId, 10);
        if (Number.isFinite(fromRedux) && fromRedux > 0) return fromRedux;
        const fromProfile = parseInt(licenseTypeId, 10);
        return Number.isFinite(fromProfile) ? fromProfile : 0;
    }, [updatedLicenseId, licenseTypeId]);
    const showLicense3BuChrome = effectiveLicenseTypeIdForBuUi === 3;
    const {
        clientId,
        departmentId,
        consumptionChannel,
        consumptionYY,
        consumptionMM,
        isDashboardData,
        u_consumptionMM,
        company_clientId,
        u_consumptionYY,
        company_departmentId,
        isMobileAppId,
        isWebAppId,
        company_departmentList,
        filteredChannels,
        isMobileAppData = [],
        isWebAppData = []
    } = useSelector(({ globalstate }) => globalstate);
    const effectiveClientList = useMemo(() => {
        if (Array.isArray(clientList) && clientList.length > 0) return clientList;
        const fallback = company_clientId?.clientId != null ? company_clientId : clientId;
        if (fallback && typeof fallback === 'object' && fallback.clientId != null) {
            return [fallback];
        }
        return [];
    }, [clientList, company_clientId, clientId]);
    const { userId } = useSelector((state) => getSessionId(state));
    const summary = useSelector((state) => getSummaryList(state));
    const [selectedlastDays, setSelectedlastDays] = useState(LAST_DAYS[0]);
    const lastDashboardDateFilterResetSeqRef = useRef(null);
    const [selectedYears, setSelectedYears] = useState(YEAR_LIST[0]);
    const [selectedChannel, setSelectedChannel] = useState();
    const [selectedMM, setSelectedMM] = useState(MM_LIST[new Date().getMonth()]);

    const defaultValue = useMemo(() => {
        if (!createdDate || !isConsumption) return MM_LIST;
        const created = new Date(createdDate);
        const createdYear = created.getFullYear();
        const createdMonth = created.getMonth();
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        if (createdYear === currentYear) {
            return MM_MONTHS_NEW()?.slice(createdMonth, currentMonth + 1);
        } else if (currentYear === u_consumptionYY) {
            return MM_MONTHS_NEW();
        } else if (createdYear === u_consumptionYY) {
            return MM_MONTHS(createdMonth);
        } else if (createdYear < u_consumptionYY) {
            return MM_LIST;
        } else {
            return MM_LIST;
        }
    }, [u_consumptionYY, createdDate, MM_LIST]);

    useEffect(() => {
        if (!_isEmpty(paramState) && paramState?.from === 'login' && loading) {
            dispatch(decrement_global_loading());
        }
    }, [paramState?.from]);

    useEffect(() => {
        if (!isDashboard || location?.index !== 0 || typeof dashboardDateFilterResetSeq !== 'number') return;
        if (lastDashboardDateFilterResetSeqRef.current === null) {
            lastDashboardDateFilterResetSeqRef.current = dashboardDateFilterResetSeq;
            return;
        }
        if (lastDashboardDateFilterResetSeqRef.current === dashboardDateFilterResetSeq) return;
        lastDashboardDateFilterResetSeqRef.current = dashboardDateFilterResetSeq;
        setSelectedlastDays(LAST_DAYS[0]);
    }, [dashboardDateFilterResetSeq, isDashboard, location?.index]);

    useEffect(() => {
        return () => {
            if (!isConsumption) {
                dispatch(latest_consumptionYear(consumptionYY));
                dispatch(latest_consumptionMonth(consumptionMM));
            }
        };
    }, []);

    // Listen for explicit cross-tab events.
    // Do not reload on every userInfo write: session/account sync can update it passively.
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'departmentChange' || e.key === 'logoutEvent' || e.key === 'loginEvent') {
                // Refresh the page to sync with the new department/client, handle logout, or handle login
                window.location.reload();
            }
        };

        // Listen for storage changes from other tabs
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    const [clientListData, setClientListData] = useState([]);
    const [clientIdEdit, setClientIdEdit] = useState(clientId);
    const [updateDefaultMMM, setUpdateDefaultMMM] = useState(consumptionMM);
    const [isFailure, setIsFailure] = useState(false);
    const [warningMessage, setWarningMessage] = useState([]);
    const [isDepartmentFail, setIsDepartmentFail] = useState({
        status: false,
        message: '',
    });
    // const [departmentChange, setDepartmentChange] = useState(departmentId);
    const isAudiencePath = pathname.split('/')[1].toLocaleLowerCase() === 'audience';
    var SUB_HEADING_DROPDOWN_DATA =
        pathname.split('/')[1].toLocaleLowerCase() === 'dashboard'
            ? DDL_DASHBOARD_DATA
            : subHeadingDropdownData ?? DDL_AUDIENCE_DATA;

    const resetMobileWebApps = () => {
        dispatch(update_isMobileAppData([]));
        dispatch(update_isWebAppData([]));
        dispatch(update_isMobileAppId({}));
        dispatch(update_isWebAppId({}));
    }

    const handleClientChange = async (agency, company) => {
        const res = await dispatch(clientIdChangeData({ clientId: agency.clientId, userId }));
        if (res?.status) {
            const isAgencyAdmin = accountAdmin?.clientId === agency?.clientId;
            if (true) {
                const userDetails = getUserDetails();
                const userInfo = {
                    ...userDetails,
                    licenseTypeId: res?.licensetypeId.toString(),
                    timeFormatId: res?.data?.timeFormatId,
                    timeZoneId: res?.data?.timeZoneId,
                    timezoneName: res?.data?.timezoneName,
                    dateFormatId: res?.data?.dateFormatId,
                    countryId: res?.data?.countryId,
                    industryId: res?.data?.industryId || userDetails?.industryId,
                    currencyId: res?.data?.currencyId || userDetails?.currencyId,
                    clientCountryId: res?.data?.clientCountryId || userDetails?.clientCountryId,
                };
                localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                CacheManager.set('userDetails', userInfo);
                dispatch(updateIndustryId(res?.data.industryId));
                dispatch(updatedisLicenseId(res?.licensetypeId));
                
                // Trigger storage event to notify other tabs
                localStorage.setItem('departmentChange', Date.now().toString());
               if ((isAgency && parseInt(res?.licensetypeId, 10) === 3) || parseInt(res?.licensetypeId, 10) === 3) {
                    const suppressBuGlobalLoader = pathname.toLowerCase().startsWith('/preferences');
                    const depList = await dispatch(
                        getBUList(
                            { userId, clientId: agency?.clientId },
                            agency,
                            company,
                            undefined,
                            false,
                            !suppressBuGlobalLoader,
                        ),
                    );
                    if (depList?.status && !company && !fromUserGrid) {
                        const getDepExcludingAll = depList?.data?.filter(
                            (list) => formatName(list.departmentName) !== 'all',
                        );
                        handleDepartmentIdChange(getDepExcludingAll?.[0], false, agency?.clientId, true);
                    }
                }  else {
                    dispatch(
                        updateBUByClient({
                            clientId: isAgencyAdmin ? effectiveClientList?.[0] : agency,
                            departmentId: {},
                            departmentList: [],
                        }),
                    );
                    dispatch(
                        updateBUByClientCompany({
                            company_clientId: agency,
                            company_departmentId: { departmentId: 0, departmentName: 'All' },
                            company_departmentList: [],
                        }),
                    );
                }
            }
            if (fromUserGrid || formAssignRole) {
                const payload = {
                    licenseTypeId: res?.licensetypeId,
                    licenseFeatureId: isAgency ? 39 : 40,
                };
                dispatch(getUserLimit({ payload }));
            }
            let isPermissionList = res?.data?.permissionList?.length > 0;
            if (isPermissionList) {
                updatedPermissionList(res?.data?.permissionList);
            } else {
                // setIsDepartmentFail({
                //     status: true,
                //     message: 'Permission list is missing in this client',
                // });
            }
        } else {
            setIsDepartmentFail({
                status: true,
                message: res?.message || CLIENT_CHANGE_FAILED,
            });
        }
        persistor?.flush();
    };
    const handleClientCompanyChange = async (agency, company) => {
        handleClientChange(agency, fromUserGrid ? false : true);
        //dispatch(getBUList({ userId, clientId: agency?.clientId }, agency, company));
    };
    const handleDepartmentIdChange = async (department, company, clientChangeId, fromClientChange = false) => {
        if (isCompany) {
            const res =
                isAccountSettings || fromUserGrid
                    ? await dispatch(
                          departmentIdChangeData({
                              departmentId: department.departmentId,
                              clientId: company_clientId?.clientId,
                              userId,
                          }),
                      )
                    : { status: true };
            if (res?.status) {
                dispatch(updateBUByClientCompany({ company_departmentId: department }));
                if (fromUserGrid) {
                    const allDepartment =
                        formatName(department?.departmentName) === 'all' ? departmentList?.[0] : department;
                    dispatch(updateBuAndDepId({ departmentId: allDepartment,rfaStatus:allDepartment?.isRFA }));
                }
                if (isAccountSettings || fromUserGrid) {
                    dispatch(updateIndustryId(res?.industryId));
                    const userDetails = getUserDetails();
                    const userInfo = { ...userDetails, isCampaign: res?.isCampaign, isAudience: res?.isAudience };
                    localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                    CacheManager.set('userDetails', userInfo);
                    
                    // Trigger storage event to notify other tabs
                    localStorage.setItem('departmentChange', Date.now().toString());
                }
                const isPermissionList = res?.permissionList?.length > 0;
                if (isPermissionList) {
                    updatedPermissionList(res?.permissionList);
                } else {
                    // setIsDepartmentFail({
                    //     status: true,
                    //     message: 'Permission list is missing in this department',
                    // });
                }
            } else {
                setIsDepartmentFail({
                    status: true,
                    message: res?.message || DEPARTMENT_CHANGE_FAILED,
                });
            }
        } else {
            const res = await dispatch(
                departmentIdChangeData({
                    departmentId: department.departmentId,
                    clientId: fromClientChange ? clientChangeId : clientId?.clientId,
                    userId,
                }),
            );
            if (res?.status) {
                await resetMobileWebApps();
                dispatch(updateBuAndDepId({ departmentId: department, rfaStatus: department?.isRFA }));
                dispatch(updateBUByClientCompany({ company_departmentId: department }));
                dispatch(updateIndustryId(res?.industryId));
                const userDetails = getUserDetails();
                const userInfo = { ...userDetails, isCampaign: res?.isCampaign, isAudience: res?.isAudience };
                localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                CacheManager.set('userDetails', userInfo);

                // Trigger storage event to notify other tabs
                localStorage.setItem('departmentChange', Date.now().toString());
                const isPermissionList = res?.permissionList?.length > 0;
                if (isPermissionList) {
                    updatedPermissionList(res?.permissionList);
                } else {
                    // setIsDepartmentFail({
                    //     status: true,
                    //     message: 'Permission list is missing in this department',
                    // });
                }
            } else {
                setIsDepartmentFail({
                    status: true,
                    message: res?.message || DEPARTMENT_CHANGE_FAILED,
                });
            }
        }
        persistor?.flush();
    };
    
    useEffect(() => {
        // if (pathname.split('/')?.[1] === 'preferences' && pathname?.split('/')?.[2] === 'users') {
        if (isAgency && fromUserGrid) {
            setClientListData([accountAdmin, ...effectiveClientList]);
        } else {
            setClientListData(effectiveClientList);
        }
        if (isCompany) {
            setClientIdEdit(company_clientId);
        } else {
            setClientIdEdit(clientId);
        }
    }, [pathname, company_clientId, effectiveClientList, accountAdmin, isAgency, fromUserGrid, clientId, isCompany]);

    useEffect(() => {
        setUpdateDefaultMMM(u_consumptionMM);
    }, [u_consumptionMM]);
    // useEffect(() => {
    //     setUpdateDefaultMMM(consumptionMM)
    // },[])
 
    const lastLiveListFetchKeyRef = useRef('');




    const [visible, setVisible] = useState(false);
    useEffect(() => {
        setVisible(true);
        setTimeout(() => {
            setVisible(false);
        }, 8000);
    }, [BUtooltip]);

    const alertConfig = useMemo(() => {
        if (renewalData?.content?.message != undefined) {
            return {
                show: true,
                message: renewalData?.content?.message ?? '',
                showClose: true,
                handleClose: () => {
                    dispatch(reset_updateRenewalData());
                    persistor?.flush();
                },
            };
        } else if (disableNavIcons) {
            return {
                show: true,
                message: 'Add Business unit(s) to proceed',
                showClose: false,
                handleClose: () => { },
            };
        }
        return {
            show: false,
            message: '',
            showClose: false,
            handleClose: () => { },
            containerClass: 'page-content',
        };
    }, [renewalData, disableNavIcons, dispatch, persistor]);

    useMemo(() => {
        if (!renewalData) return;

        const { autoClose } = renewalData;

        // ✅ Check autoClose is valid
        if (autoClose && typeof autoClose === 'number') {
            const timer = setTimeout(() => {
                dispatch(
                    getGlobalStateValue({
                        field: 'renewalData',
                        data: null,
                    })
                );
            }, autoClose);

            // cleanup
            return () => clearTimeout(timer);
        }
    }, [renewalData, dispatch]);


    return (
        <Fragment>
            <Container fluid className={`main-heading-wrapper ${isTabber ? 'mb0' : ''} ${pageClass ? pageClass : ''}`}>
                <RSAlertWarning containerClass="px0" {...alertConfig} />
                {summary?.isFromSnapshot && (
                    <div className="snapshot-header-center mt15`">
                        <div className='box-design d-flex align-items-baseline px15 py5'>
                            <strong className='mr5'>{summary?.snapshotName || 'Snapshot'} - </strong>
                            <span className='color-primary-grey fs13'>
                                {summary?.snapshotDate ? getUserCurrentFormat(summary?.snapshotDate, { isOffset: true })?.dateTimeFormat : ''}
                            </span>
                        </div>
                    </div>
                )}
                <Container className={`mhw-container ${subHeading ? '' : ' '}`}>
                    <div className="mhwc-left">
                        {issubHeading && (
                            <h1 className="repo-title 2444">
                                <div className="sh">{subHeading}</div>
                                <div className="mh-wrapper d-flex">
                                    <span className="mh-text" style={{ display: 'block', overflow: 'hidden' }}>
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={typeof title === 'string' ? title : undefined}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                transition={{ duration: 0.15 }}
                                                style={{ display: 'inline-block' }}
                                            >
                                                {title}
                                            </motion.span>
                                        </AnimatePresence>
                                    </span>
                                    {issubHeadingDropDown && (
                                        <RSBootstrapdown
                                            data={SUB_HEADING_DROPDOWN_DATA}
                                            flatIcon
                                            defaultItem={
                                                <i
                                                    className={`${menu_dot_medium} rs-heading-icon icon-md position-relative top3`}
                                                    id="rs_RSPageHeader_dot_menu"
                                                />
                                            }
                                            showUpdate={false}
                                            className="mr15 no_caret"
                                            onSelect={(e) => {
                                                if (isAudiencePath && onSubheadingChange) {
                                                    onSubheadingChange(e);
                                                } else {
                                                    dispatch(update_Dashboard(e));
                                                    onSubheadingChange(e);
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </h1>
                        )}
                        {!issubHeading && (
                            <>
                                <div className="heading-title-text">
                                    {isLoading ? (
                                        <CommonSkeleton box width={500} height={40} />
                                    ) : (
                                        <>
                                        <h1
                                        className={titleCls || ''}
                                        style={
                                            titleCls
                                            ? undefined
                                            : { display: 'block', overflow: 'hidden' }
                                        }
                                       > <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={typeof title === 'string' ? title : undefined}
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 5 }}
                                                        transition={{ duration: 0.15 }}
                                                        style={{ display: 'inline-block' }}
                                                    >
                                                        {title}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </h1>
                                            <div className={`report-head ${starClass ? starClass : ''}`}>
                                                <span className={`${downloadUI ? 'position-relative top-3' : ''}`}>
                                                    {star ? (
                                                        <Icon
                                                            icon={star_fill_mini}
                                                            color="color-yellow-medium position-relative top1"
                                                            nocp
                                                            size={'sm'}
                                                        />
                                                    ) : null}
                                                </span>
                                                {date ? <span className="head-time color-primary-grey">{date}</span> : null}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mhwc-right position-relative">
                        {(isDashboard && location?.index === 0) && (
                            <div className="mhwcr-dd mhwcr-item heading-dd-agency" id="rs_RSPageHeader_lastdays">
                                <RSBootstrapdown
                                    data={LAST_DAYS}
                                    alignRight
                                    defaultItem={selectedlastDays}
                                    customAlignRight
                                    className=""
                                    isActive
                                    onSelect={(day) => {
                                        setSelectedlastDays(day);
                                        onDurationChange(day);
                                    }}
                                />
                            </div>
                        )}
                        {(isAgency || (licenseTypeId === '3' && isEnterprisePlus)) &&
                            !!effectiveClientList?.length &&
                            rightCommonMenus &&
                            showAgency && (
                                <div className="mhwcr-dd mhwcr-item heading-dd-agency">
                                    <RSBootstrapdown
                                        data={clientListData}
                                        alignRight
                                        defaultItem={clientIdEdit}
                                        containerClass={isAgencyDisabled ? 'click-off pe-none' : ''}
                                        fieldKey="clientName"
                                        customAlignRight
                                        className=""
                                        isObject
                                        isActive
                                        showUpdate
                                        onSelect={(agency) => {
                                            handleClientChange(agency, false)
                                            dispatch(update_isWebAppData([]));
                                        }}
                                    />
                                </div>
                            )}
                        {isCompany && (
                            <>
                                <div
                                    className={`mhwcr-dd mhwcr-item heading-dd-agency ${hideCompany || ((licenseTypeId !== '3' || !isEnterprisePlus) && !isAgency)
                                        ? 'd-none'
                                        : ''
                                        }`}
                                >
                                    <RSBootstrapdown
                                        data={clientListData}
                                        alignRight
                                        defaultItem={clientIdEdit}
                                        containerClass={isAgencyDisabled ? 'click-off pe-none' : ''}
                                        fieldKey="clientName"
                                        customAlignRight
                                        className=""
                                        isObject
                                        isActive
                                        showUpdate
                                        onSelect={(agency) => handleClientCompanyChange(agency, true)}
                                    />
                                </div>
                                {!hideBU &&
                                    (isAgency ? accountAdmin?.clientId !== company_clientId?.clientId : true) &&
                                    !!departmentCompanyList?.length &&
                                    showLicense3BuChrome && (
                                        <div
                                            className="mhwcr-dd mhwcr-item heading-dd-bu"
                                            id="rs_RSPageHeader_departmentlist_company"
                                        >
                                            <RSBootstrapdown
                                                data={departmentCompanyList}
                                                alignRight
                                                isObject
                                                containerClass={isBuDisabled ? 'click-off pe-none' : ''}
                                                defaultItem={company_departmentId}
                                                fieldKey="departmentName"
                                                customAlignRight
                                                className=""
                                                isActive
                                                showUpdate
                                                onSelect={(department) => {
                                                    handleDepartmentIdChange(department, true);
                                                    // dispatch(updateBuAndDepId({ departmentId: department }));
                                                }}
                                            />
                                        </div>
                                    )}
                            </>
                        )}

                        {!hideBU &&
                            !!departmentList?.length &&
                            rightCommonMenus &&
                            showLicense3BuChrome && (
                                <>
                                    {/* {departmentList[0]?.departmentId > 0 && ( */}
                                    <div
                                        className="mhwcr-dd mhwcr-item heading-dd-bu"
                                        id="rs_RSPageHeader_departmentlist"
                                    >
                                        <RSBootstrapdown
                                            data={departmentList}
                                            alignRight
                                            isObject
                                            containerClass={isBuDisabled ? 'click-off pe-none' : ''}
                                            defaultItem={departmentId}
                                            fieldKey="departmentName"
                                            customAlignRight
                                            className=""
                                            isActive
                                            showUpdate
                                            onSelect={(department) => {                                                
                                                handleDepartmentIdChange(department, false);              
                                                // dispatch(updateBuAndDepId({ departmentId: department }));
                                            }}
                                        />
                                        <RSTooltip
                                            text={BUSINESS_UNIT}
                                            position={'top'}
                                            className="d-inline-block position-absolute top11 right5"
                                            show={BUtooltip && visible}
                                            innerContent={false}
                                        ></RSTooltip>
                                    </div>
                                    {/* )} */}
                                </>
                            )}
                        {isConsumption && (
                            <Fragment>
                                <div className="mhwcr-dd mhwcr-item heading-dd-bu">
                                    <RSBootstrapdown
                                        data={defaultValue}
                                        alignRight
                                        // defaultItem={ selectedMM}
                                        defaultItem={MM_LIST[u_consumptionMM]}
                                        customAlignRight
                                        className=""
                                        isActive
                                        onSelect={(item) => {
                                            dispatch(latest_consumptionMonth(MM_LIST.indexOf(item)));
                                            // dispatch(update_consumptionMonth(MM_LIST.indexOf(item)));
                                            //setSelectedMM(item);
                                        }}
                                    />
                                </div>
                                <div className="mhwcr-dd mhwcr-item heading-dd-bu">
                                    <RSBootstrapdown
                                        // data={YEAR_BELOW_LIST(10)}
                                        data={YEAR_BELOW_LIST(
                                            new Date().getFullYear() - new Date(createdDate).getFullYear(),
                                        )}
                                        alignRight
                                        // defaultItem={ new Date().getFullYear()}
                                        defaultItem={u_consumptionYY}
                                        customAlignRight
                                        className=""
                                        isActive
                                        onSelect={(item) => {
                                            dispatch(latest_consumptionYear(item));
                                            // dispatch(update_consumptionYear(item));
                                            setSelectedYears(item);
                                            if (new Date().getFullYear() === item) {
                                                const createdMonth = createdDate ? new Date(createdDate).getMonth() : 0;
                                                dispatch(
                                                    latest_consumptionMonth(
                                                        MM_LIST.indexOf(MM_MONTHS_NEW()[MM_MONTHS_NEW()?.length - 1]),
                                                    ),
                                                );
                                                return;
                                            } else if (new Date(createdDate).getFullYear() === item) {
                                                const createdMonth = createdDate ? new Date(createdDate).getMonth() : 0;
                                                dispatch(
                                                    latest_consumptionMonth(
                                                        MM_LIST.indexOf(
                                                            MM_MONTHS(createdMonth)[
                                                            MM_MONTHS(createdMonth)?.length - 1
                                                            ],
                                                        ),
                                                    ),
                                                );
                                                return;
                                            } else if (new Date(createdDate).getFullYear() < item) {
                                                dispatch(
                                                    latest_consumptionMonth(
                                                        MM_LIST.indexOf(MM_LIST[MM_LIST?.length - 1]),
                                                    ),
                                                );
                                                return;
                                            } else {
                                                dispatch(
                                                    latest_consumptionMonth(
                                                        MM_LIST.indexOf(MM_LIST[MM_LIST?.length - 1]),
                                                    ),
                                                );
                                                return;
                                            }
                                        }}
                                    />
                                </div>
                                {isChannel && (
                                    <div className="mhwcr-dd mhwcr-item heading-dd-bu">
                                        <RSBootstrapdown
                                            data={filteredChannels || CHANNELS_LIST}
                                            alignRight
                                            defaultItem={consumptionChannel}
                                            customAlignRight
                                            isObject
                                            fieldKey="lable"
                                            className=""
                                            isActive
                                            onSelect={(item) => {
                                                //console.log("item", item)
                                                dispatch(update_consumptionChannel(item));
                                                setSelectedChannel(item);
                                            }}
                                        />
                                    </div>
                                )}
                            </Fragment>
                        )}
                        {isLiveDashboard && (location?.index === 1
                            ? isMobileAppData?.length > 0
                            : location?.index === 2 && isWebAppData?.length > 0) && (
                                <Fragment>
                                    <div className="mhwcr-dd mhwcr-item heading-dd-bu">
                                        <RSBootstrapdown
                                            data={
                                                isLiveDashboard && location?.index === 1
                                                    ? isMobileAppData
                                                    : isWebAppData
                                            }
                                            alignRight
                                            isObject
                                            fieldKey={
                                                isLiveDashboard && location?.index === 1
                                                    ? 'appName'
                                                    : 'website'
                                            }
                                            idKey={
                                                isLiveDashboard && location?.index === 1
                                                    ? 'appGuid'
                                                    : 'id'
                                            }
                                            defaultItem={
                                                isLiveDashboard && location?.index === 1
                                                    ? (isMobileAppData.find(a => a.appGuid === isMobileAppId?.appGuid) ??  isMobileAppData[0])
                                                    : isWebAppData?.find(
                                                        (item) => item?.id === isWebAppId?.id,
                                                    ) ?? isWebAppData[0]
                                            }
                                            customAlignRight
                                            className=""
                                            isActive
                                            onSelect={(item) => {
                                                if (isLiveDashboard && location?.index === 1) {
                                                    dispatch(update_isMobileAppId(item));
                                                } else {
                                                    dispatch(update_isWebAppId(item));
                                                }
                                            }}
                                        />
                                    </div>
                                </Fragment>
                            )}
                        {isBack && (
                            isBackAsLink ? (
                                <a
                                    href={backPath}
                                    className={`mhwcr-item mhwcr-back text-decoration-none ${downloadUI ? 'd-none' : ''}`}
                                    onClick={(e) => {
                                        // If it's a special back action, prevent default and handle with navigate
                                        if (onBack) {
                                            e.preventDefault();
                                            onBack();
                                            return;
                                        }
                                        const withoutCustomBackButton = () => {
                                            if (paramState?.backAction !== undefined) {
                                                e.preventDefault();
                                                const tabValue = paramState?.tabValue;
                                                const tabValueName = paramState?.tabValueName;
                                                const verticalValues = Object.keys(availableTabs);
                                                const verticalIndex = verticalValues?.indexOf(tabValueName);
                                                const selectedArray = availableTabs[`${tabValueName}`];
                                                const tabIndex = selectedArray?.indexOf(tabValue);
                                                dispatch(
                                                    setTabforEdit({
                                                        type: tabValueName,
                                                        currentTab: verticalIndex,
                                                    }),
                                                );
                                                dispatch(
                                                    updateTab({
                                                        field: tabValueName,
                                                        data: {
                                                            tabName: availableTabs[tabValueName][tabIndex],
                                                            currentIndex: tabIndex,
                                                        },
                                                    }),
                                                );
                                                navigate(
                                                    '/communication/create-communication' + paramState?.backAction,
                                                );
                                            }
                                            backAction();
                                        };
                                        validateIsCustomNavigate(location, defaultlocationState?.state, navigate, withoutCustomBackButton);
                                    }}
                                >
                                    <div className="header-back">
                                        <i className={`${arrow_left_mini} icon-xs color-primary-blue`}></i>
                                        <div>{BACK}</div>
                                    </div>
                                </a>
                            ) : (
                                <div
                                    className={`mhwcr-item mhwcr-back ${downloadUI ? 'd-none' : ''}`}
                                    onClick={() => {
                                        //debugger
                                        if (onBack) {
                                            onBack();
                                            return;
                                        }

                                        const withoutCustomBackButton = () => {
                                            if (paramState?.backAction !== undefined) {
                                                const tabValue = paramState?.tabValue;
                                                const tabValueName = paramState?.tabValueName;
                                                const verticalValues = Object.keys(availableTabs);
                                                const verticalIndex = verticalValues?.indexOf(tabValueName);
                                                const selectedArray = availableTabs[`${tabValueName}`];
                                                const tabIndex = selectedArray?.indexOf(tabValue);
                                                dispatch(
                                                    setTabforEdit({
                                                        type: tabValueName,
                                                        currentTab: verticalIndex,
                                                    }),
                                                );
                                                dispatch(
                                                    updateTab({
                                                        field: tabValueName,
                                                        data: {
                                                            tabName: availableTabs[tabValueName][tabIndex],
                                                            currentIndex: tabIndex,
                                                        },
                                                    }),
                                                );
                                                navigate(
                                                    '/communication/create-communication' + paramState?.backAction,
                                                );
                                            } else {
                                                navigate(backPath, { state: !_isEmpty(state) ? state : {} });
                                            }
                                            backAction();
                                        };
                                        validateIsCustomNavigate(location, defaultlocationState?.state, navigate, withoutCustomBackButton);
                                    }}
                                >
                                    <div className="header-back">
                                        <i className={`${arrow_left_mini} icon-xs color-primary-blue`}></i>
                                        <div>{BACK}</div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                    {/* <WarningPopup
                        show={isFailure}
                        handleClose={() => {
                            setIsFailure(false);
                            setWarningMessage([]);
                        }}
                        //removeRule={() => removeRule(index)}
                        text={
                            <div>
                                {warningMessage?.length &&
                                    warningMessage?.map((message, index) => <div key={index}>{message}</div>)}
                            </div>
                        }
                        showCancel={true}
                        isPrimary={false}
                    /> */}
                    <WarningPopup
                        show={isDepartmentFail?.status}
                        handleClose={() => {
                            setIsDepartmentFail({
                                status: false,
                                message: '',
                            });
                            const tempMasterData = localStorage.getItem('masterData');
                            const tempipAddressData = localStorage.getItem('ipAddressData');
                            const tempdisable_plugin_last_shown = localStorage.getItem('disable_plugin_last_shown');
                            const tempNewVersionConfirm = localStorage.getItem('newVersionConfirm');

                            localStorage.clear();
                            //localStorage.setItem('masterData', tempMasterData);
                            localStorage.setItem('ipAddressData', tempipAddressData);
                            localStorage.setItem('disable_plugin_last_shown', tempdisable_plugin_last_shown);
                            localStorage.setItem('newVersionConfirm', tempNewVersionConfirm);
                            // localStorage.clear();
                            sessionStorage.removeItem('dashboard');
                            dispatch(resetGlobalState());
                            dispatch(resetdashboardState());
                            dispatch(resetTargetListData());

                            // Trigger storage event to notify other tabs about logout
                            localStorage.setItem('logoutEvent', Date.now().toString());

                            navigate('/');
                            window.location.reload();
                        }}
                        text={<div>{isDepartmentFail?.message}</div>}
                        showCancel={true}
                        isPrimary={false}
                    />
                </Container>
                {/* {isHeaderLine && <hr className="mhw-line" />} */}
            </Container>
        </Fragment>
    );
};
RSPageHeader.propTypes = {
    issubHeading: PropTypes.bool,
    subHeading: PropTypes.string,
    subHeadingDropdownData: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    issubHeadingDropDown: PropTypes.bool,
    isAgency: PropTypes.bool,
    rightCommonMenus: PropTypes.bool,
    isBack: PropTypes.bool,
    state: PropTypes.object,
    backPath: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    backAction: PropTypes.func,
    isHeaderLine: PropTypes.bool,
    isTabber: PropTypes.bool,
    isDashboard: PropTypes.bool,
    isConsumption: PropTypes.bool,
    isChannel: PropTypes.bool,
    onSubheadingChange: PropTypes.func,
    isBuDisabled: PropTypes.bool,
    isAgencyDisabled: PropTypes.bool,
    showAgency: PropTypes.bool,
    hideBU: PropTypes.bool,
    isLicense: PropTypes.bool,
    isLiveDashboard: PropTypes.bool,
    isCompany: PropTypes.bool,
    hideCompany: PropTypes.bool,
    isBackAsLink: PropTypes.bool,
    onBack: PropTypes.func,
    dashboardDateFilterResetSeq: PropTypes.number,
};

export default RSPageHeader;
