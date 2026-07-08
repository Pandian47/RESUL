import { encryptWithAES, getUserDetails, updatedPermissionList } from 'Utils/modules/crypto';
import { formatName } from 'Utils/modules/formatters';
import { ADD_NEW_USER, DOWNLOAD_CSV, DOWNLOAD_LINK_DATA_SHORTLY, REQUEST_RECEIVED } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, csv_download_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import RSSearchField from 'Components/RSSearchField';
import UserListing from './Pages/Component/UserGrid/UserGrid';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSPTooltip from 'Components/RSTooltip';
import { useDispatch, useSelector } from 'react-redux';

import CacheManager from 'Utils/cacheManager';
import { getUserLimit, getUserList, sendSelectedUserInfoMail } from 'Reducers/preferences/users/request';
import { updateUserLoadingState } from 'Reducers/preferences/users/reducer';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import { getActiveUsersCount, getUsersCount, getUsersList } from 'Reducers/preferences/users/selectors';
import {
    updateBUByClientCompany,
    updateCurrentPageConfig,
    updatedisLicenseId,
    updateIndustryId,
} from 'Reducers/globalState/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import { clientIdChangeData, departmentIdChangeData, getBUList } from 'Reducers/globalState/request';

const Users = ({ permissions }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userDetails = getUserDetails();
    const { isAgency } = userDetails;
    const { addAccess } = permissions || {};
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [searchQuery, setsearchQuery] = useState();
    const [statusFilter, setStatusFilter] = useState(1); // 1 = Active | 2 = Inactive | 3 = All
    const [isDownloading, setIsDownloading] = useState(false);
    const [otpModal, setOtpModal] = useState(false);
    const [otpSuccessModal, setOtpSuccessModal] = useState(false);

    const handleDownloadCSV = async (keyData) => {
        setIsDownloading(true);
        const payload = {
            otp: keyData?.otpValue ?? '',
            to: keyData?.keyData ?? '',
            userId,
            clientId,
            status: statusFilter,
        };
        const { status } = await dispatch(sendSelectedUserInfoMail({ payload }));
        setIsDownloading(false);
        if (status) {
            setOtpModal(false);
            setOtpSuccessModal(true);
        }
    };

    const handleFilterChange = useCallback((filter) => {
        const statusGroup = filter?.filters?.find((group) => group?.filters?.some((f) => f.field === 'statusLabel'));
        const statusValues = statusGroup?.filters?.filter((f) => f.field === 'statusLabel').map((f) => f.value) ?? [];
        const hasActive = statusValues.includes('Active');
        const hasInactive = statusValues.includes('Inactive');
        if (hasActive && hasInactive) setStatusFilter(3);
        else if (hasActive) setStatusFilter(1);
        else if (hasInactive) setStatusFilter(2);
        else setStatusFilter(3);
    }, []);
    const users = useSelector((state) => getUsersList(state));
    const usersCount = useSelector((state) => getUsersCount(state));
    const activeUsersCount = useSelector((state) => getActiveUsersCount(state));
    const { licenseValue } = usersCount;
    const {
        updatedLicenseId,
        company_departmentId,
        company_clientId,
        clientId: currClient,
        departmentId: currDepartment,
        departmentList,
        accountAdmin,
    } = useSelector(({ globalstate }) => globalstate);
    const { isFailure, userLimitFailure, totalUsers, isLoading } = useSelector(({ userReducer }) => userReducer);

    const usersApi = usePreferencesSubPageApi({
        mode: 'edit',
        deps: [
            clientId,
            userId,
            departmentId,
            company_clientId?.clientId,
            company_departmentId?.departmentId,
            updatedLicenseId,
            isAgency,
        ],
        fetcher: async () => {
            dispatch(updateUserLoadingState(true));
            try {
                const listPayload = {
                    clientId: company_clientId?.clientId,
                    userId,
                    departmentId: company_departmentId?.departmentId,
                };
                const limitPayload = {
                    licenseTypeId: parseInt(updatedLicenseId, 10),
                    licenseFeatureId: isAgency ? 39 : 40,
                };
                const [listRes, limitRes] = await Promise.all([
                    dispatch(getUserList({ payload: listPayload, loading: false })),
                    dispatch(getUserLimit({ payload: limitPayload, loading: false })),
                ]);
                return { listRes, limitRes };
            } finally {
                dispatch(updateUserLoadingState(false));
            }
        },
    });
    const latestCompanyDepartmentId = useRef(company_departmentId);
    const latestCompanyClientId = useRef(company_clientId);
    const latestDepartment = useRef(currDepartment);
    const latestClient = useRef(currClient);
    useEffect(() => {
        latestCompanyDepartmentId.current = company_departmentId;
        latestCompanyClientId.current = company_clientId;
        latestDepartment.current = currDepartment;
        latestClient.current = currClient;
    }, [company_departmentId, company_clientId, currDepartment, currClient]);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === latestCompanyClientId.current?.clientId;
    const handleClientChange = async (agencyAdmin) => {
        const res = await dispatch(clientIdChangeData({ clientId: latestClient?.current?.clientId, userId }));
        //dispatch(updateBUByClientCompany({ company_clientId: currClient ,company_departmentId: currDepartment, company_departmentList: departmentList }));
        if (res?.status) {
            const userDetails = getUserDetails();
            const userInfo = {
                ...userDetails,
                licenseTypeId: res?.licensetypeId.toString(),
                timeFormatId: res?.data?.timeFormatId,
                timeZoneId: res?.data?.timeZoneId,
                timezoneName: res?.data?.timezoneName,
                dateFormatId: res?.data?.dateFormatId,
                    countryId: res?.data?.countryId
            };
            localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
            CacheManager.set('userDetails', userInfo);
            dispatch(updatedisLicenseId(res?.licensetypeId));
            dispatch(updateIndustryId(res?.data?.industryId));
            const isPermissionList = res?.data.permissionList?.length > 0;
            if (isPermissionList) {
                updatedPermissionList(res?.data.permissionList);
            }
            if (parseInt(res?.licensetypeId, 10) === 3) {
                const depList = await dispatch(
                    getBUList({ userId, clientId: latestClient?.current?.clientId }, latestClient?.current, false),
                );
                if (depList?.status && agencyAdmin) {
                    const getDepExcludingAll = depList?.data?.filter(
                        (list) => formatName(list.departmentName) !== 'all',
                    );
                    await dispatch(
                        departmentIdChangeData({
                            departmentId: getDepExcludingAll[0]?.departmentId,
                            clientId: latestClient?.current?.clientId,
                            userId,
                        }),
                    );
                }
            }
        }
    };
    const handleDepChange = async () => {
        const res = await dispatch(
            departmentIdChangeData({
                departmentId: latestDepartment?.current?.departmentId,
                clientId: latestClient?.current?.clientId,
                userId,
            }, false),
        );
        dispatch(updateBUByClientCompany({ company_departmentId: latestDepartment?.current }));
        const isPermissionList = res?.permissionList?.length > 0;
        if (res?.status) {
            const userDetails = getUserDetails();
            const userInfo = { ...userDetails, isCampaign: res?.isCampaign, isAudience: res?.isAudience };
            localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
            CacheManager.set('userDetails', userInfo);
            isPermissionList && updatedPermissionList(res?.permissionList);
            dispatch(updateIndustryId(res?.industryId));
        }
    };

    useEffect(() => {
        return () => {
            const isUserGridNow = window.location.pathname?.includes('users');
            let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === latestCompanyClientId.current?.clientId;
            if (
                isAgency &&
                latestCompanyClientId?.current?.clientId !== latestClient?.current?.clientId &&
                !isUserGridNow
            ) {
                handleClientChange(isAgencyAccountAdmin);
            }
            if (
                !isAgencyAccountAdmin &&
                latestCompanyDepartmentId?.current?.departmentId !== latestDepartment?.current.departmentId &&
                updatedLicenseId === 3 &&
                !isUserGridNow
            ) {
                handleDepChange();
            }
        };
    }, []);
    useEffect(() => {
        return () => {
            const isUserGridNow = window.location.pathname?.includes('users');
            if (!isUserGridNow) {
                dispatch(updateCurrentPageConfig({}));
            }
        };
    }, []);

    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title="User details"
                isBack
                backPath="/preferences"
                isHeaderLine
                isAgency
                showAgency
                rightCommonMenus={false}
                fromUserGrid
                isCompany
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <PreferencesSubPageSkeletonGate
                            variant={PREFERENCES_SUBPAGE_VARIANT.USERS}
                        >
                        <div className="flex-row mt0 top-sub-heading">
                            <div className="fr flex-left">{/* <h4>User details</h4> */}</div>
                            <ul className="rs-list-group-horizontal jc-right">
                                <li className="d-none">
                                    <RSSearchField searchedText={(text) => setsearchQuery(text.toLowerCase())} />
                                </li>

                                <li>
                                    <RSPTooltip position="top" text="Download CSV" className="lh0">
                                        <div
                                            className={isDownloading || !users?.length ? 'pe-none click-off' : ''}
                                        >
                                            <i
                                                id="rs_data_csv_download"
                                                className={`${csv_download_large} icon-lg color-primary-blue`}
                                                onClick={() => setOtpModal(true)}
                                            />
                                        </div>
                                    </RSPTooltip>
                                </li>

                                <li>
                                    <RSPTooltip position="top" text={ADD_NEW_USER} className="lh0">
                                        <div
                                            className={
                                                !addAccess ||
                                                isLoading ||
                                                usersApi.isPageLoading ||
                                                activeUsersCount >= licenseValue ||
                                                userLimitFailure
                                                    ? 'pe-none click-off'
                                                    : ''
                                            }
                                        >
                                            <div
                                                onClick={() => {
                                                    if (addAccess && !isLoading && !usersApi.isPageLoading) {
                                                        let LocationState = {
                                                            mode: 'create',
                                                            clientId: company_clientId?.clientId,
                                                            from: 'userGrid',
                                                        };
                                                        navigate('/preferences/users/add-user', {
                                                            state: LocationState,
                                                        });
                                                        dispatch(updateCurrentPageConfig({ state: LocationState }));
                                                    }
                                                }}
                                            >
                                                <i
                                                    id="rs_data_circle_plus_fill_edge"
                                                    className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                                ></i>
                                            </div>
                                        </div>
                                    </RSPTooltip>
                                </li>
                            </ul>
                        </div>

                        <div>
                            {/* filter value ["text","numeric","boolean","date"]. */}
                            <UserListing
                                fromUserManagement
                                deferInitialFetch
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                        </PreferencesSubPageSkeletonGate>
                    </Container>
                </div>
            </Container>
            {/* Main page content block ends */}

            {otpModal && (
                <DownloadCSV
                    show={otpModal}
                    handleClose={() => setOtpModal(false)}
                    isForm
                    fromUser
                    onSuccess={(keyData) => {
                        
                        handleDownloadCSV(keyData);
                    }}
                />
            )}
            {otpSuccessModal && (
                <RSConfirmationModal
                    show={otpSuccessModal}
                    htmlContent={
                        <p className="text-center">
                            {REQUEST_RECEIVED}
                            <br />
                            {DOWNLOAD_LINK_DATA_SHORTLY}
                        </p>
                    }
                    header={DOWNLOAD_CSV}
                    secondaryButton={false}
                    primaryButton = {false}
                    handleClose={() => {
                        setOtpSuccessModal(false);
                        setIsDownloading(false);
                    }}
                    handleConfirm={() => {
                        setOtpSuccessModal(false);
                        setIsDownloading(false);
                    }}
                />
            )}
        </div>
        // Content holder ends
    );
};

export default Users;
