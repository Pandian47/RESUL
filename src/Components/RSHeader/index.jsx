import { baseURL } from 'Constants/EndPoints';
import { ARE_YOU_SURE_LOGOUT, LOGOUT, MY_PROFILE, OK } from 'Constants/GlobalConstant/Placeholders';
import {
    communication_settings_medium,
    logout_medium,
    pre_account_setting_large,
    pre_license_info_large,
    pre_my_profile_large,
    support_chat_medium,
} from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, NavLink, useNavigate, Outlet } from 'react-router-dom';

import userImg from 'Assets/Images/user.svg';
import ResulticksLogoWhite from 'Assets/Images/resulticks-logo-white.svg';
import RSTooltip from 'Components/RSTooltip';
import Dropdown from 'react-bootstrap/Dropdown';
import usePermission from 'Hooks/usePersmission';
import BreadCrumbs from './Component/BreadCrumbs';
import CustomToggle from './Component/CustomToggle';
import Notifications from './Component/Notifications';
import RSConfirmationModal from 'Components/ConfirmationModal';

import { HEADER_CONFIG, getHeaderCompanyImage, getHeaderLicenseWithVersion } from './constant';

import { encodeUrl, getUserDetails, handlePreviousVersionNavigation } from 'Utils/modules/crypto';
import { downloadZIPfilewithCSV } from 'Utils/modules/download';
import { prefetchRouteModule } from 'Utils/modules/postLoginShell';
import { getHeaderDataSelector } from 'Reducers/globalState/headerSelectors';
import { logOut } from 'Reducers/login/existingUser/request';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import { update_Dashboard, reset_global_loading, updateCAPortalModal } from 'Reducers/globalState/reducer';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const logoutFieldLoaderConfig = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };
const hideHeader = [
    'mdc-workflow',
    'template-builder',
    'create-mdc-communication',
    'email-builder',
    'footer-builder',
    'offer-builder',
    'push-builder',
    'ChannelAccessADToken',
    'setup-complete'
];
import useQueryParams from 'Hooks/useQueryParams';

const ProfileMenuToggle = forwardRef(({ children, onClick, disabled, ...props }, ref) => (
    <div
        {...props}
        ref={ref}
        className={`rs-profile-menu-toggle ${disabled ? 'click-off' : ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Open profile menu"
        onClick={(e) => {
            if (!disabled) onClick?.(e);
        }}
        onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick?.(e);
            }
        }}
    >
        {children}
    </div>
));

ProfileMenuToggle.displayName = 'ProfileMenuToggle';

const RSHeader = ({ isNoAuth }) => {
    // OPTIMIZED: Composite selector combining auth, session, and license data
    const headerState = useSelector(getHeaderDataSelector);
    const {
        isAuth,
        profilePicture,
        userId,
        clientId: {clientId},
        departmentId:{departmentId},
        updatedLicenseId,
        currentTabConfig,
        renewalData,
        showSessionModal,
        validUserEmailId,
    } = headerState;
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    let { pathname } = useLocation();
    const { permissionList } = usePermission();
    const queryData = useQueryParams('/dashboard');
    const userDetails = getUserDetails();
    const {
        isCampaign,
        licenseTypeId,
        profileImage,
        departmentList,
        isEnterprisePlus,
        isHybrid,
        firstName,
        lastName,
        email,
        emailId,
        emailID,
        userName,
    } = userDetails;
    const [show, setShow] = useState(false);
    const disableNavIcons = queryData?.needBUs && queryData?.fromLogin ||  renewalData?.isRenewal || false;
    const [showupdatedLicenseId, setShowupdatedLicenseId] = useState(0);
    const locationOriginValue = pathname === '/' ? false : true;
    const splitPathName = pathname.split('/');
    const pathArrayLength = splitPathName?.length > 2 ? splitPathName : [];
    const getParentPageName = splitPathName[1];
    const getCurrentPageName = splitPathName?.[splitPathName?.length - 1] || splitPathName?.[1] || '';
    
    // Check if we're on add-form-generator with a tab selected
    const isFormGeneratorWithTab = getCurrentPageName === 'add-form-generator' && 
                                   new URLSearchParams(window.location.search).get('tabSelected') === 'true';
    const shouldHideHeader =
        hideHeader.includes(getCurrentPageName) ||
        isFormGeneratorWithTab ||
        pathname === '/genie' ||
        pathname.startsWith('/genie/');
    const [isCommStatusDownload, setCommStatusDownload] = useState({
        show: false,
        content: '',
    });
    const logoutLoader = useApiLoader({
        autoFetch: false,
        loaderConfig: logoutFieldLoaderConfig,
        mode: 'create',
    });

    const getViewPermission = (getFeatureId) => {
        const getPermission = permissionList[getFeatureId];
        return getPermission === undefined || getPermission.viewAccess;
    };
    const defaultItemLan = useMemo(
        () => ({
            id: 'en',
            value: 'English',
        }),
        [],
    );
    const comm_statusDownload = async () => {
        const payload = {
            JobId: new URLSearchParams(window.location.search).get('JobId'),
            File: new URLSearchParams(window.location.search).get('File'),
            clientId: new URLSearchParams(window.location.search).get('clientId'),
            userId: new URLSearchParams(window.location.search).get('userId'),
            // JobId: 'NDQzMw==',
            // File: 'V2hhdHNBcHBfRGVsaXZlcmVkXzI0OTA4MzRfMjAyNTAxMTAwNjE2MDM1MDk2NzJfRmVhdGhlci5jc3Y=',
            // clientId: 'MzQwNA==',
            // userId: 'MjY5Ng==',
            departmentId,
            isAnalytics: new URLSearchParams(window.location.search).get('isAnalytics'),
        };
        const { get_CommStatus_activityDownload } = await import('Reducers/analytics/details/request');
        const response = await dispatch(get_CommStatus_activityDownload(payload));
        if (response !== '') {
            downloadZIPfilewithCSV(response, atob(new URLSearchParams(window.location.search).get('File')));
        }
    };
    const getProfileImage = () => {
        if (profilePicture) {
            return `data:image/png;base64,${profilePicture}`;
            // return baseURL + profilePicture;
        }
        if (profileImage) {
            return `data:image/png;base64,${profileImage}`;
            //return baseURL + profileImage;
        } else return userImg;
    };
    useEffect(() => {
        setShowupdatedLicenseId(updatedLicenseId);
    }, [updatedLicenseId]);
    useEffect(() => {
        if (show) {
            setShow(false)
        }
    }, [])
    useEffect(() => {
        //reset global loading
        dispatch(reset_global_loading());

        if (isAuth && new URLSearchParams(window.location.search).get('isAnalytics') === 'True') {
            // comm_statusDownload();
            if (
                clientId === parseInt(atob(new URLSearchParams(window.location.search).get('clientId')), 10) &&
                userId === parseInt(atob(new URLSearchParams(window.location.search).get('userId')), 10)
            ) {
                comm_statusDownload();
            } else {
                setCommStatusDownload({ show: true, content: 'You are not a client/user' });
                            }
        }
    }, []);

    // Listen for logout and login events across tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            // Check if the change is related to logout or login
            if (e.key === 'logoutEvent' || e.key === 'loginEvent') {
                // Refresh the page to handle logout or login from other tabs
                window.location.reload();
            }
        };

        // Listen for storage changes from other tabs
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleClickOffDropItem = (menu) => {
        let disableFeatureId = [29];
        const IntLicenseTypeId = parseInt(licenseTypeId, 10);
        const IntFeatureId = parseInt(menu?.featureId, 10);
        if (IntLicenseTypeId !== 3 && disableFeatureId?.includes(IntFeatureId)) {
            return true;
        } else {
            return false;
        }
    };

    const handleRoutePrefetch = useCallback((path) => {
        if (path) void prefetchRouteModule(path);
    }, []);

    const profileName = useMemo(() => {
        const resolvedName = [firstName, lastName].filter(Boolean).join(' ').trim();
        return resolvedName || userName || MY_PROFILE;
    }, [firstName, lastName, userName]);

    const profileEmail = validUserEmailId || email || emailId || emailID || '';

    const profileMenuItems = useMemo(
        () => [
            {
                label: MY_PROFILE,
                icon: pre_my_profile_large,
                path: '/preferences/my-profile',
            },
            {
                label: 'Subscription',
                icon: pre_license_info_large,
                path: '/preferences/license-info',
            },
            {
                label: 'Account settings',
                icon: pre_account_setting_large,
                path: '/preferences/account-settings',
            },
            {
                label: 'Communication settings',
                icon: communication_settings_medium,
                path: '/preferences/communication-settings',
            },
            {
                label: 'Support',
                icon: support_chat_medium,
                onClick: () =>
                    dispatch(
                        updateCAPortalModal({
                            show: true,
                            callbackFunc: () => {},
                        }),
                    ),
            },
            {
                label: LOGOUT,
                icon: logout_medium,
                onClick: () => setShow(true),
                className: 'rs-profile-menu__logout',
            },
        ],
        [dispatch],
    );

    return (
        <Fragment>
            {getCurrentPageName && !shouldHideHeader && locationOriginValue && (
                <header className="rs-page-header-wrapper">
                    <div className="header-wrapper">
                        <div className="logo-holder">
                            <img src={ResulticksLogoWhite} alt="RESUL" className="brand-logo" />
                        </div>
                        {(isAuth || showSessionModal) && (
                            <Fragment>
                                <div className="rs-navbar-header">
                                    <ul>
                                        {HEADER_CONFIG?.map((options) => {
                                            let departmentListValue = false;
                                            const iscampaign =
                                                getParentPageName === 'launch-pad' &&
                                                !isCampaign &&
                                                options.path !== '/preferences';
                                            if (departmentList?.length > 0 || licenseTypeId < 3) {
                                                departmentListValue = false;
                                            } else {
                                                departmentListValue = true;
                                            }

                                            return (
                                                <li
                                                    key={options.name}
                                                    className={`${departmentListValue ? 'hasDepartment' : ''} ${iscampaign || disableNavIcons ? 'menu-click-off' : ''
                                                        }`}
                                                    onMouseEnter={() => handleRoutePrefetch(options.path)}
                                                    onFocus={() => handleRoutePrefetch(options.path)}
                                                >
                                                    {options.subMenu ? (
                                                        <Dropdown
                                                            onSelect={(e) => {
                                                                if (!handleClickOffDropItem()) {
                                                                    if (isNaN(Number(e))) {
                                                                        const opt = JSON.parse(e);
                                                                        let state;
                                                                        if (opt.state) {
                                                                            state = encodeUrl(opt.state);
                                                                        }
                                                                        navigate(
                                                                            `${options.path + opt.page}${state ? `?q=${state}` : ''
                                                                            }`,
                                                                        );
                                                                    } else {
                                                                        const url = options.path;
                                                                        if (url === '/dashboard') {
                                                                            dispatch(
                                                                                update_Dashboard(
                                                                                    options.subMenuValue[Number(e)]
                                                                                        ?.name,
                                                                                ),
                                                                            );
                                                                        }
                                                                        const state1 = { index: Number(e) };
                                                                        const encryptState = encodeUrl(state1);
                                                                        navigate(
                                                                            `${url}?q=${encryptState}&reload=true`,
                                                                            {
                                                                                state: { index: Number(e) },
                                                                            },
                                                                        );
                                                                        //  window.location.reload();
                                                                        // navigate(options.path, {
                                                                        //     state: { index: Number(e) },
                                                                        // });
                                                                    }
                                                                }
                                                            }}
                                                            className={`${getParentPageName === options.type
                                                                    ? 'headerDDLActive'
                                                                    : ''
                                                                }`}
                                                        >
                                                            <Dropdown.Toggle
                                                                as={CustomToggle}
                                                                onMouseEnter={() => handleRoutePrefetch(options.path)}
                                                                onFocus={() => handleRoutePrefetch(options.path)}
                                                            >
                                                                <RSTooltip className="w-100 text-center" variant="default" position="bottom" text={`${options.name}`}>
                                                                    <span
                                                                        className="hicon"
                                                                        id="rs_RSHeader_hicon"
                                                                    ></span>
                                                                </RSTooltip>
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu
                                                                renderOnMount
                                                                style={{
                                                                    '--rs-dropdown-item-count':
                                                                        options.subMenuValue?.length || 0,
                                                                }}
                                                            >
                                                                {options.subMenuValue?.map((menu, index) => (
                                                                    <Dropdown.Item
                                                                        key={_get(menu, 'name', index)}
                                                                        style={{ '--rs-dropdown-item-index': index }}
                                                                        eventKey={
                                                                            menu.index !== undefined &&
                                                                                menu.index !== null
                                                                                ? menu.index + ''
                                                                                : JSON.stringify({
                                                                                    page: menu.page,
                                                                                    ...(menu.state && {
                                                                                        state: menu.state,
                                                                                    }),
                                                                                    index: menu.index,
                                                                                })
                                                                        }
                                                                        className={`${getViewPermission(menu.featureId)
                                                                                ? 'view'
                                                                                : 'click-off'
                                                                            } ${handleClickOffDropItem(menu)
                                                                                ? 'click-off'
                                                                                : ''
                                                                            }`}
                                                                        disabled={handleClickOffDropItem(menu)}
                                                                        onMouseEnter={() =>
                                                                            handleRoutePrefetch(
                                                                                `${menu.path || options.path}${menu.page || ''}`,
                                                                            )
                                                                        }
                                                                        onFocus={() =>
                                                                            handleRoutePrefetch(
                                                                                `${menu.path || options.path}${menu.page || ''}`,
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className={`${menu.icon} icon-lg`}></i>
                                                                        {menu.name}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    ) : (
                                                        <NavLink
                                                            to={options.path}
                                                            className={({ isActive }) => {
                                                                const isPreferenceActive =
                                                                    getParentPageName === 'launch-pad' &&
                                                                    options?.path === '/preferences';

                                                                return `menu-items ${isActive || isPreferenceActive ? 'active' : ''}`;
                                                            }}
                                                            onMouseEnter={() => handleRoutePrefetch(options.path)}
                                                            onFocus={() => handleRoutePrefetch(options.path)}
                                                        >
                                                            <RSTooltip
                                                                position="bottom"
                                                                text={options.name}
                                                                key={options.name}
                                                            >
                                                                <span className="hicon"></span>
                                                            </RSTooltip>
                                                        </NavLink>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div className="rsphch-right-navbar">
                                    <span className="tag-account">
                                        {false ? (
                                            <RSTooltip text={'Switch back to 4.8'} position="bottom" className="lh24">
                                                <img
                                                    src={getHeaderLicenseWithVersion(
                                                        showupdatedLicenseId === 0
                                                            ? licenseTypeId
                                                            : showupdatedLicenseId,
                                                        isEnterprisePlus,
                                                        isHybrid,
                                                    )}
                                                    alt="acc type"
                                                    className="cp"
                                                    onClick={handlePreviousVersionNavigation}
                                                />
                                            </RSTooltip>
                                        ) : (
                                            <div className='pe-none'>
                                            <img
                                                src={getHeaderCompanyImage(
                                                    showupdatedLicenseId === 0 ? licenseTypeId : showupdatedLicenseId,
                                                    isEnterprisePlus,
                                                    isHybrid,
                                                )}
                                                alt="acc type"
                                                className="cp"
                                                onClick={() => navigate('/launch-pad')}
                                            />
                                            </div>
                                        )}
                                    </span>
                                    <ul className="header-nav-right-list">
                                        {/* <li>
                                            <RSBootstrapdown
                                                className="rsLanguageCSS"
                                                data={language}
                                                isObject
                                                fieldKey="value"
                                                alignRight
                                                onSelect={(lng) => i18next.changeLanguage(lng.id)}
                                                defaultItem={defaultItemLan}
                                            />
                                        </li> */}
                                        <li className='lh0'>{!isNoAuth && <Notifications />}</li>
                                        <li className='rs-profile-menu-holder-del ml4-del'>
                                            <RSTooltip text={MY_PROFILE} position="bottom" className="lh24">
                                                <div 
                                                    className={`ico-head cp ${disableNavIcons ? 'click-off' : ''}`} 
                                                    onClick={() => navigate('/preferences/my-profile')}
                                                    onMouseEnter={() => handleRoutePrefetch('/preferences/my-profile')}
                                                    onFocus={() => handleRoutePrefetch('/preferences/my-profile')}>
                                                    <div className={`user-picture`}>
                                                        <img
                                                            src={getProfileImage()}
                                                            alt={'profileImg'}
                                                            id="rs_RSHeader_ProfileImage"
                                                        />
                                                    </div>
                                                </div>
                                            </RSTooltip>
                                        </li>
                                        <li onClick={() => setShow(true)}>
                                            <RSTooltip text="Logout" position="bottom" className="lh0">
                                                <i
                                                    id="rs_RSHeader_LogOut"
                                                    className={`ico-head ${logout_medium} icon-md white cursor-pointer`}
                                                    style={{ height: '24px' }}
                                                ></i>
                                            </RSTooltip>
                                        </li>
                                        {/* <li className="rs-profile-menu-holder">
                                            <Dropdown align="end" className="rs-profile-menu">
                                                <Dropdown.Toggle
                                                    as={ProfileMenuToggle}
                                                    disabled={disableNavIcons}
                                                    onMouseEnter={() => handleRoutePrefetch('/preferences/my-profile')}
                                                    onFocus={() => handleRoutePrefetch('/preferences/my-profile')}
                                                >
                                                    <RSTooltip text={MY_PROFILE} position="bottom" className="lh24">
                                                        <div className="user-picture cp">
                                                            <img
                                                                src={getProfileImage()}
                                                                alt={'profileImg'}
                                                                id="rs_RSHeader_ProfileImage"
                                                            />
                                                        </div>
                                                    </RSTooltip>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu renderOnMount className="rs-profile-menu__dropdown">
                                                    <div className="rs-profile-menu__identity">
                                                        <div className="rs-profile-menu__avatar">
                                                            <img src={getProfileImage()} alt="" />
                                                        </div>
                                                        <div className="rs-profile-menu__details">
                                                            <span className="rs-profile-menu__name">{profileName}</span>
                                                            {profileEmail && (
                                                                <span className="rs-profile-menu__email">
                                                                    {profileEmail}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="rs-profile-menu__items">
                                                        {profileMenuItems.map((item) => (
                                                            <Dropdown.Item
                                                                key={item.label}
                                                                className={`rs-profile-menu__item ${item.className || ''}`}
                                                                onClick={() => {
                                                                    if (item.path) {
                                                                        navigate(item.path);
                                                                    } else {
                                                                        item.onClick?.();
                                                                    }
                                                                }}
                                                                onMouseEnter={() => handleRoutePrefetch(item.path)}
                                                                onFocus={() => handleRoutePrefetch(item.path)}
                                                            >
                                                                <i className={`${item.icon} icon-md`}></i>
                                                                <span>{item.label}</span>
                                                            </Dropdown.Item>
                                                        ))}
                                                    </div>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </li> */}
                                    </ul>
                                </div>
                            </Fragment>
                        )}
                    </div>
                    <BreadCrumbs isAuth={isAuth || showSessionModal} />
                    <RSConfirmationModal
                        show={show}
                        header={LOGOUT}
                        text={ARE_YOU_SURE_LOGOUT}
                        primaryButtonText={OK}
                        handleClose={() => setShow(false)}
                        isCloseButton={true}
                        isBorder
                        isLoading={logoutLoader.isLoading}
                        blockBodyPointerEvents
                        handleConfirm={async () => {
                            const payload = {
                                userId,
                                clientId,
                            };
                            await logoutLoader.refetch({
                                fetcher: () =>
                                    dispatch(logOut({ payload, navigate, setShow, loading: false })),
                                loaderConfig: logoutFieldLoaderConfig,
                                mode: 'create',
                            });
                        }}
                    />

                    <WarningPopup
                        show={isCommStatusDownload.show}
                        handleClose={(type) => {
                            setCommStatusDownload((prev) => ({
                                ...prev,
                                content: '',
                                show: false,
                            }));
                        }}
                        text={isCommStatusDownload.content}
                        isheader={false}
                        isPrimary={false}
                        showCancel={true}
                    />
                </header>
            )}
            <Outlet />
        </Fragment>
    );
};
export default RSHeader;
