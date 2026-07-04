import { encryptWithAES, getPermissions, getUserDetails, updatedPermissionList } from 'Utils/modules/crypto';
import { useEffect, useRef, useState } from 'react';
import { find as _find, isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';

import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormProvider, useForm, useWatch } from 'react-hook-form';


import RenderComponent from 'Pages/AuthenticationModule/Preferences/Pages/Users/Pages/Component/RenderComponent/RenderComponent';

import { getSessionId } from 'Reducers/globalState/selector';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getUsersList } from 'Reducers/preferences/users/selectors';
import { assignRoleToUser } from 'Reducers/preferences/users/request';

import { buildPayloadAssignUser } from '../../../Users/constant';
import { departmentIdChangeData } from 'Reducers/globalState/request';
import { updateBUByClientCompany } from 'Reducers/globalState/reducer';
import usePermission from 'Hooks/usePersmission';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import CacheManager from 'Utils/cacheManager';
const UserCreation = ({
    nextScreen,
    back,
    companies,
    isEdit,
    setCurrentTitle,
    c_clientId,
    isAgencyValue,
    setCurrentUserPage,
    onAssignRoleInlineLoadingChange,
}) => {
    const { licenseTypeId, isAgency, isEnterprisePlus } = getUserDetails();
    const { userId, departmentId, clientId } = useSelector((state) => getSessionId(state));
    const navigate = useNavigate();
    const {
        company_departmentId,
        company_clientId,
        departmentId: currDepartment,
        updatedLicenseId,
        company_departmentList,
        clientId: currClient,
        departmentList,
        currentPageConfig,
    } = useSelector(({ globalstate }) => globalstate);
    const { clientDetails } = useSelector(({ companiesReducer }) => companiesReducer);
    const isAccountSettings = useLocation()?.pathname?.split('/')?.pop() === 'account-settings';
    const location = isAccountSettings
    ? !_isEmpty(currentPageConfig)
    ? currentPageConfig
            : {
                  state: {
                      clientId,
                      mode: 'edit',
                      clientName: '',
                      licenseTypeId: licenseTypeId,
                      page: 'ASSIGN_ROLE',
                    },
                }
                : !_isEmpty(currentPageConfig)
                ? currentPageConfig
                : useLocation();
    const fromUser = currentPageConfig?.state?.from === 'userGrid';
    const { permissions } = usePermission();
    const permissionList = getPermissions();
    const { deleteAccess, addAccess, updateAccess, viewAccess } = _find(permissionList, { featureId: 12 });
    const methods = useForm({
        defaultValues: {
            assignRole: [],
        },
    });
    const dispatch = useDispatch();
    const { control, watch } = methods;
    const assignRole = useWatch({
        control,
        name: 'assignRole',
    });
    const [assignRoleData, unifiedUserList ] = watch(['assignRole', 'unifiedUserList']);
    const [userCreate, setUserCreate] = useState(false);
    const [currentPage, setCurrentPage] = useState('ASSIGNROLE'); // const [currentPage, setCurrentPage] = useState(isEdit ? 'ASSIGNROLE' : 'ADDUSER'); // useState('ASSIGNROLE');
    const [isAssignRolePageLoading, setIsAssignRolePageLoading] = useState(true);
    const users = useSelector((state) => getUsersList(state));
    const assignRoleSaveApi = useApiLoader({ autoFetch: false });
    const isAssignRoleSaveLoading = assignRoleSaveApi.isFetching;

    useEffect(() => {
        if (location?.state?.page === 'ASSIGN_ROLE' || location?.state?.page === 'NEW_COMPANY' || users?.length) {
            setUserCreate(true);
            setCurrentPage('ASSIGNROLE');
        }
        // if (!viewAccess) {
        //     navigate('/dashboard');
        // }
    }, []);

    const handleSave = async () => {
        if (companies && updateAccess) {
            let client = isAgencyValue
                ? clientDetails?.clientId
                : companies || fromUser
                ? company_clientId?.clientId
                : clientId || company_clientId?.clientId;
            let department = isAgencyValue
                ? 0
                : companies
                ? company_departmentId?.departmentId
                : company_departmentId?.departmentId; //departmentId;
            const payload = buildPayloadAssignUser(assignRole, client, department, userId, unifiedUserList);
            const res = await assignRoleSaveApi.refetch({
                fetcher: () => dispatch(assignRoleToUser(payload, 'callback', false)),
                loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
            });
            if (res?.status) setCurrentPage('USERGRID');
        } else setCurrentPage('USERGRID');
    };

    const saveStatus = () => {
        // const roles = assignRole?.filter((res) => !res?.role && !res?.selectedRole)?.length || 0;
        // if (roles > 0) return true;
        // return false;
        const roles  = assignRoleData?.flatMap((u) => u?.selectedBUs || [])
                                ?.some((bu) => !bu?.selectedRole?.groupId)
        if (roles) return true;
        return false;
    };
    const latestCompanyDepartmentId = useRef(company_departmentId);
    const latestCompanyClientId = useRef(company_clientId);
    useEffect(() => {
        latestCompanyDepartmentId.current = company_departmentId;
        latestCompanyClientId.current = company_clientId;
    }, [company_departmentId, company_clientId]);
    const handleDepChange = async () => {
        const res = await dispatch(departmentIdChangeData({ departmentId: departmentId, clientId: clientId, userId }, false));
        dispatch(updateBUByClientCompany({ company_departmentId: currDepartment }));

        const isPermissionList = res?.permissionList?.length > 0;
        if (res?.status) {
            const userDetails = getUserDetails();
            const userInfo = { ...userDetails, isCampaign: res?.isCampaign, isAudience: res?.isAudience };
            isPermissionList && updatedPermissionList(res?.permissionList);
            localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
            CacheManager.set('userDetails', userInfo);
        }
    };
    // useEffect(() => {
    //     return () => {
    //         if (
    //             !isAgency &&
    //             latestCompanyDepartmentId?.current?.departmentId !== departmentId &&
    //             isAccountSettings &&
    //             updatedLicenseId === 3
    //         ) {
    //             handleDepChange();
    //         }
    //     };
    // }, []);
    useEffect(() => {
        setCurrentUserPage(currentPage)
    },[currentPage])

    useEffect(() => {
        if (currentPage === 'ASSIGNROLE') {
            setIsAssignRolePageLoading(true);
        }
    }, [currentPage]);

    const showFooterButtons = currentPage !== 'ASSIGNROLE' || !isAssignRolePageLoading;

    const handleAssignRolePageLoadingChange = (isLoading) => {
        setIsAssignRolePageLoading(isLoading);
        onAssignRoleInlineLoadingChange?.(isLoading);
    };

    return (
        <FormProvider {...methods}>
            <>
                <RenderComponent
                    campanyEdit={isEdit}
                    currentPage={currentPage}
                    nextScreen={(screenName) => {
                        if (screenName === 'ADDUSER') {
                            setCurrentTitle((prev) => ({
                                ...prev,
                                ASSIGN_ROLE: {
                                    main: 'Add a new user',
                                },
                            }));
                        } else if (screenName === 'ASSIGNROLE') {
                            setCurrentTitle((prev) => ({
                                ...prev,
                                ASSIGN_ROLE: {
                                    main: 'Assign role to users',
                                },
                            }));
                        }
                        setCurrentPage(screenName);
                    }}
                    c_clientId={c_clientId}
                    setCurrentTitle={setCurrentTitle}
                    back={(screenName) => {
                                                if (companies && !isAccountSettings) {
                            if (screenName === 'ADDUSER') {
                                setCurrentTitle((prev) => ({
                                    ...prev,
                                    ASSIGN_ROLE: {
                                        main: 'Add a new user',
                                    },
                                }));
                            } else if (screenName === 'ASSIGNROLE') {
                                setCurrentTitle((prev) => ({
                                    ...prev,
                                    ASSIGN_ROLE: {
                                        main: 'Assign role to users',
                                    },
                                }));
                            }

                            setCurrentPage(screenName);
                        } else if (screenName === 'CREATE') setUserCreate(false);
                        else if (isAccountSettings && screenName === 'ADDUSER') {
                            // setCurrentPage(screenName);
                            back('ADD_USERS');
                        } else setCurrentPage(screenName);
                    }}
                    companyBack={back}
                    companies
                    isAgencyValue={isAgencyValue}
                    currentLicenseTypeId={parseInt(location?.state?.licenseTypeId, 10)}
                    setCurrentPage={setCurrentPage}
                    onAssignRolePageLoadingChange={handleAssignRolePageLoadingChange}
                />
            </>

            {showFooterButtons && (
            <div className="buttons-holder">
                {companies && currentPage !== 'ADDUSER' && (
                    <RSSecondaryButton
                        onClick={() => {
                            if (isAssignRoleSaveLoading) return;
                            if (currentPage === 'USERGRID') {
                                setCurrentPage('ASSIGNROLE');
                            } else {
                                // back('NEW_COMPANY', '');
                                if (location?.state?.screen === 'userrole') {
                                    navigate('/preferences/company-list');
                                } else {
                                    back('NEW_COMPANY', '');
                                }
                            }
                        }}
                        blockInteraction={isAssignRoleSaveLoading}
                    >
                        {/* {userCreate && !isAccountSettings ? 'Back' : 'Cancel'} */}
                        {location?.state?.screen === 'userrole'
                            ? 'Cancel'
                            : (userCreate && !isAccountSettings ? 'Back' : 'Cancel')}
                    </RSSecondaryButton>
                )}
                {userCreate && currentPage !== 'ADDUSER' && (
                    <RSPrimaryButton
                        type="submit"
                        className={`ml15 ${saveStatus() ? 'click-off' : ''}`}
                        isLoading={currentPage === 'ASSIGNROLE' && isAssignRoleSaveLoading}
                        blockBodyPointerEvents={currentPage === 'ASSIGNROLE' && isAssignRoleSaveLoading}
                        onClick={() => {
                            if (isAssignRoleSaveLoading) return;
                            {
                                currentPage === 'ADDUSER'
                                    ? setCurrentPage('ASSIGNROLE')
                                    : currentPage === 'ASSIGNROLE'
                                    ? handleSave()
                                    : currentPage === 'USERGRID'
                                    // ? nextScreen('LOCALIZATION_SETTINGS', '')
                                    ? (location?.state?.screen === 'userrole'
                                        ? navigate('/preferences/company-list')
                                        : nextScreen('LOCALIZATION_SETTINGS', ''))
                                    : '';
                            } // nextScreen('LOCALIZATION_SETTINGS', '');
                        }}

                        // onClick={handleSubmit(console.log)}
                    >
                        {currentPage === 'ASSIGNROLE' && !isAccountSettings ? 'Assign' : 'Proceed'}
                    </RSPrimaryButton>
                )}
            </div>
            )}
        </FormProvider>
    );
};
export default UserCreation;
