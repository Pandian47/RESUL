import { truncateTitle } from 'Utils/modules/displayCore';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { CANCEL, NO_DATA_AVAILABEL, SAVE, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { get as _get, map as _map, find as _find } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { MINLENGTH, SELECT_ONE_PERMISSION } from 'Constants/GlobalConstant/ValidationMessage';
import RSPageHeader from 'Components/RSPageHeader';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    getSecurityGroupById,
    getSecurityGroup,
    saveUserRoles,
    checkSecuritynameExists,
} from 'Reducers/preferences/rolesAndPermissions/request';
import { buildPayload, permissions as permissionConstant } from './constant';
import usePermission from 'Hooks/usePersmission';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { ENTER_ROLE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { getSessionId } from 'Reducers/globalState/selector';
import RSTooltip from 'Components/RSTooltip';


const isPreferencesApiSuccess = (status) =>
    status === true || status === 1 || status === 'true' || status === 'True';

const getSecurityInfoFromResponse = (response) => {
    const data = response?.data;
    if (!data || typeof data !== 'object') return null;
    return data.securityinfo ?? data.securityInfo ?? null;
};

const assertValidEditRoleResponse = (response) => {
    if (!isPreferencesApiSuccess(response?.status)) {
        throw new Error(response?.message || NO_DATA_AVAILABEL);
    }
    const securityinfo = getSecurityInfoFromResponse(response);
    if (!securityinfo || typeof securityinfo !== 'object' || !Object.keys(securityinfo).length) {
        throw new Error(response?.message || NO_DATA_AVAILABEL);
    }
    return response;
};

const AddPermission = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const roleNameRef = useRef();
    const permissionData = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissionData.permissions || {};
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const { securityList } = useSelector(({ rolesAndPermissionsReducer }) => rolesAndPermissionsReducer);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        clearErrors,
        trigger,
        setError: setFormError,
        formState: { errors },
    } = useForm({
        defaultValues: { roleName: '', statusAll: false },
    });
    const { fields, replace } = useFieldArray({
        control,
        name: 'permissions',
    });
    const permissions = useWatch({
        control,
        name: 'permissions',
    });
    const [error, setError] = useState(false);
    const [roleName, statusAll] = watch(['roleName', 'statusAll']);
    const [availablePermission, setAvaiablePermission] = useState([]);
    const [formConstant, setFormContant] = useState({
        initialState: {},
        updateState: {},
    });
    const mode = _get(state, 'mode', 'new');
    const roleNameError = Object.hasOwn(errors, 'roleName');
    const [roleState, setRoleState] = useState({
        loading: false,
        isValid: false,
    });
    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';
    const securityGroupId = _get(state, 'data.securityGroupId');

    const [isEditRoleDataReady, setIsEditRoleDataReady] = useState(false);
    const [isNewRoleDataReady, setIsNewRoleDataReady] = useState(false);
    const saveRoleApi = useApiLoader({ autoFetch: false });
    const isSaveRoleLoading = saveRoleApi.isFetching;

    const populateFromNewSecurityGroupApi = useCallback(
        (response) => {
            const securityinfo = getSecurityInfoFromResponse(response);
            if (!securityinfo) return false;

            const initialState = {};
            const updateState = {};
            let temp = _map(Object.entries(securityinfo), ([key, value]) => {
                const { addAccess, deleteAccess, updateAccess, viewAccess, featureID, featureName } = value || {};

                initialState[featureID] = {
                    create: false,
                    read: false,
                    update: false,
                    delete: false,
                };
                updateState[featureID] = {
                    create: addAccess,
                    read: viewAccess,
                    update: updateAccess,
                    delete: deleteAccess,
                };
                return {
                    title: featureName,
                    featureID: Number(featureID),
                    name: key,
                    values: [
                        {
                            label: 'Create',
                            status: false,
                            disabled: !addAccess,
                        },
                        {
                            label: 'Read',
                            status: false,
                            disabled: !viewAccess,
                        },
                        {
                            label: 'Update',
                            status: false,
                            disabled: !updateAccess,
                        },
                        {
                            label: 'Delete',
                            status: false,
                            disabled: !deleteAccess,
                        },
                    ],
                };
            });

            temp?.sort((a, b) => {
                const titleA = a.title?.toLowerCase() || '';
                const titleB = b.title?.toLowerCase() || '';
                return titleA.localeCompare(titleB);
            });

            setFormContant({
                initialState,
                updateState,
            });
            replace(temp);
            return temp.length > 0;
        },
        [replace],
    );

    const populateFromSecurityGroupApi = useCallback(
        (response) => {
            const { securityGroupName } = response || {};
            const securityinfo = getSecurityInfoFromResponse(response);
            if (!securityinfo) return false;

            const initialState = {};
            const updateState = {};
            let temp = _map(Object.entries(securityinfo), ([key, value]) => {
                const { addAccess, deleteAccess, updateAccess, viewAccess, featureID, featureName } = value || {};

                let per;
                if (isEditMode) {
                    per = _find(permissionConstant, { featureId: Number(featureID) });
                    initialState[featureID] = {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    };
                    updateState[featureID] = {
                        create: per?.addAccess ?? false,
                        read: per?.viewAccess ?? false,
                        update: per?.updateAccess ?? false,
                        delete: per?.deleteAccess ?? false,
                    };
                }
                return {
                    title: featureName,
                    featureID: Number(featureID),
                    name: key,
                    values: [
                        {
                            label: 'Create',
                            status: addAccess,
                            disabled: isViewMode ? true : !per?.addAccess,
                        },
                        {
                            label: 'Read',
                            status: viewAccess,
                            disabled: isViewMode ? true : !per?.viewAccess,
                        },
                        {
                            label: 'Update',
                            status: updateAccess,
                            disabled: isViewMode ? true : !per?.updateAccess,
                        },
                        {
                            label: 'Delete',
                            status: deleteAccess,
                            disabled: isViewMode ? true : !per?.deleteAccess,
                        },
                    ],
                };
            });
            temp?.sort((a, b) => {
                const titleA = a.title?.toLowerCase() || '';
                const titleB = b.title?.toLowerCase() || '';
                return titleA.localeCompare(titleB);
            });
            setFormContant({
                initialState,
                updateState,
            });
            replace(temp);
            setValue('roleName', securityGroupName ?? '');
            return temp.length > 0;
        },
        [isEditMode, isViewMode, replace, setValue],
    );

    const isEditRoleRoute = isEditMode || isViewMode;
    const canFetchEditRole = isEditRoleRoute && Boolean(securityGroupId);
    const canFetchNewRole = mode === 'new';

    useEffect(() => {
        setIsEditRoleDataReady(false);
    }, [securityGroupId, mode]);

    useEffect(() => {
        setIsNewRoleDataReady(false);
    }, [mode]);

    const newRoleApi = usePreferencesSubPageApi({
        enabled: canFetchNewRole,
        mode: 'create',
        deps: [clientId, userId, departmentId, mode],
        fetcher: async () => {
            const payload = {
                clientId,
                userId,
                departmentId,
                securityGroupId: 4,
            };
            const response = await dispatch(getSecurityGroup({ payload, loading: false }));
            return assertValidEditRoleResponse(response);
        },
        onSuccess: (response) => {
            const populated = populateFromNewSecurityGroupApi(response);
            setIsNewRoleDataReady(populated);
        },
        onError: () => {
            setIsNewRoleDataReady(false);
        },
    });

    const editRoleApi = usePreferencesSubPageApi({
        enabled: canFetchEditRole,
        mode: 'edit',
        deps: [securityGroupId, clientId, userId, departmentId],
        fetcher: async () => {
            const payload = {
                clientId,
                userId,
                departmentId,
                securityGroupId,
            };
            const response = await dispatch(
                getSecurityGroupById({ payload, loading: false, isFailureCheck: false }),
            );
            return assertValidEditRoleResponse(response);
        },
        onSuccess: (response) => {
            const populated = populateFromSecurityGroupApi(response);
            setIsEditRoleDataReady(populated);
        },
        onError: () => {
            setIsEditRoleDataReady(false);
        },
    });

    const showEditRoleNoData =
        isEditRoleRoute &&
        (!canFetchEditRole || editRoleApi.isError || (editRoleApi.isSuccess && !isEditRoleDataReady));
    const showNewRoleNoData =
        canFetchNewRole && (newRoleApi.isError || (newRoleApi.isSuccess && !isNewRoleDataReady));
    const showRoleSkeleton =
        (isEditRoleRoute && (editRoleApi.isPageLoading || showEditRoleNoData)) ||
        (canFetchNewRole && (newRoleApi.isPageLoading || showNewRoleNoData));
    const showRoleNoData = showEditRoleNoData || showNewRoleNoData;

    const handleStatusChange = (e) => {
        const { checked } = e.target;
        const formState = checked ? formConstant.updateState : formConstant.initialState;
        if (checked) setError(false);
        else setError(true);
        let tempPermissions = [...fields];
        tempPermissions.map((permission) => {
            const state = formState[permission.featureID];
            permission.values.map((access) => {
                access.status = state[access?.label?.toLowerCase()];
            });
        });

        replace(tempPermissions);
    };

    const handleFormSubmit = async (formState) => {
        if (isSaveRoleLoading) return;

        let roleValue = formState.permissions.some((perm) => {
            return perm.values.some((list) => list.status === true);
        });
        const { securityGroupId } = _get(state, 'data', {});
        const payloadData = {
            mode: mode,
            securityId: securityGroupId,
        };
        if (roleValue) {
            const payload = buildPayload({ formState, payloadData });
            await saveRoleApi.refetch({
                fetcher: () => dispatch(saveUserRoles({ payload, loading: false })),
                loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
            });
        } else {
            setError(true);
        }
    };

    const handleRoleNameBlur = async ({ target: { value } }) => {
        if (value?.length !== 0 && !roleNameError && value !== roleNameRef.current) {
            roleNameRef.current = value;
            const payload = {
                securityGroupName: value.trim(),
            };
            setRoleState({
                loading: true,
                isValid: false,
            });
            const { status } = await dispatch(checkSecuritynameExists({ payload, setFormError }));
            if (!status) {
                setRoleState({
                    loading: false,
                    isValid: true,
                });
            } else {
                setRoleState({
                    loading: false,
                    isValid: false,
                });
            }
        } else if (roleNameError) {
            existingEmail.current = null;
        }
    };

    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title="Roles & permissions"
                isBack
                backPath="/preferences/roles-and-permissions"
                rightCommonMenus
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content pc-roles-permissions-edit d-grid">
                    <Container className="px0">
                        <PreferencesSubPageSkeletonGate
                            variant={PREFERENCES_SUBPAGE_VARIANT.ROLES_PERMISSIONS_EDIT}
                            isLoading={showRoleSkeleton}
                            showNoData={showRoleNoData}
                            ariaLabel="Loading role permissions"
                        >
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
                            <div className="box-design">
                                <div className="form-group m0 pt10">
                                    <Row>
                                        <Col sm={5} className="text-right">
                                            <label className="control-label-left">Role name</label>
                                        </Col>
                                        <Col sm={4}>
                                            <RSInput
                                                name="roleName"
                                                id="rs_AddPermission_Rolename"
                                                control={control}
                                                placeholder="User role"
                                                type="text"
                                                required
                                                maxLength={MAX_LENGTH50}
                                                disabled={isViewMode || !updateAccess}
                                                isLoading={roleState.loading}
                                                isValidIcon={roleState.isValid}
                                                rules={{
                                                    required: ENTER_ROLE_NAME,
                                                    validate: {
                                                        serverError: () =>
                                                            roleNameError ? _get(errors, 'roleName.message') : true,
                                                    },
                                                }}
                                                handleOnchange={() => {
                                                    if (roleNameError) clearErrors('roleName');
                                                    if (roleState.isValid)
                                                        setRoleState({
                                                            loading: false,
                                                            isValid: false,
                                                        });
                                                }}
                                                handleOnBlur={(e) => {
                                                    if (e.target.value?.trim()?.length > 3) {
                                                        handleRoleNameBlur(e);
                                                    } else if (e.target.value?.trim()?.length) {
                                                        roleNameRef.current = e.target.value;
                                                        setFormError('roleName', {
                                                            type: 'custom',
                                                            message: MINLENGTH,
                                                        });
                                                    } else {
                                                        roleNameRef.current = e.target.value;
                                                        trigger('roleName');
                                                    }
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                            {error && (
                                <div className="alert mt20 alert-warning border-r7 align-items-stretch">
                                    <i className={`position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${alert_medium}  bg-orange-medium icon-md `}></i>
                                    <span className='align-items-center d-flex py5'>{SELECT_ONE_PERMISSION}</span>
                                </div>
                            )}
                            <div
                                className="rs-table-wrapper roles-permissions-access-table mt20"
                                name="roleCreation"
                            >
                                <table width="100%" cellPadding="0" cellSpacing="0">
                                    <thead>
                                        <tr>
                                            <th>Access privileges</th>
                                            <th colSpan="4" className="no-border-left text-right">
                                                <div className='d-inline-flex align-items-center'>
                                                {/* <RSTooltip text={'Check all'} position="top" className="lh0 d-inline-block"> */}
                                                    <RSCheckbox
                                                        control={control}
                                                        name="statusAll"
                                                        labelClass = 'roles_checkbox'
                                                        disabled={isViewMode}
                                                        handleChange={(e) => handleStatusChange(e)}
                                                    />
                                                {/* </RSTooltip> */}
                                                    <span className='ml5'>Check all</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {_map(
                                            fields?.sort((a, b) => {
                                                const titleA = a?.title || '';
                                                const titleB = b?.title || '';
                                                return titleA?.localeCompare(titleB);
                                            }),
                                            (label, index) => {
                                                return (
                                                    <tr key={label.id}>
                                                        <td>
                                                            {label.title?.length > 100 ? (
                                                                <RSTooltip text={label.title} position="top">
                                                                    <span>{truncateTitle(label.title, 100)}</span>
                                                                </RSTooltip>
                                                            ) : (
                                                                <span>{label.title}</span>
                                                            )}
                                                        </td>

                                                        {label.values?.map((access, accessIndex) => {
                                                            return (
                                                                <td key={access.label}>
                                                                    <RSCheckbox
                                                                        control={control}
                                                                        name={`permissions.${index}.values.${accessIndex}.status`}
                                                                        labelName={access.label}
                                                                        disabled={isViewMode || access.disabled}
                                                                        disabledchk={isViewMode || access.disabled}
                                                                        labelClass="roles-perm-crud-checkbox"
                                                                        handleChange={(e) => {
                                                                            if (error) {
                                                                                setError(false);
                                                                            }
                                                                            if (statusAll) setValue('statusAll', false);
                                                                        }}
                                                                        
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            },
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className={`buttons-holder ${isViewMode ? 'mr-7' : ''}`}>
                                <RSSecondaryButton
                                    onClick={() => {
                                        if (isSaveRoleLoading) return;
                                        navigate('/preferences/roles-and-permissions');
                                    }}
                                    blockInteraction={isSaveRoleLoading}
                                    id="rs_AddPermission_Cancel"
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                {!isViewMode && (
                                    <RSPrimaryButton
                                        type="submit"
                                        className={!isEditMode && !roleState.isValid && !updateAccess ? 'click-off' : ''}
                                        isLoading={isSaveRoleLoading}
                                        blockBodyPointerEvents
                                        id="rs_AddPermission_Save"
                                    >
                                        {isEditMode ? UPDATE : SAVE}
                                    </RSPrimaryButton>
                                )}
                            </div>
                        </form>
                        </PreferencesSubPageSkeletonGate>
                    </Container>
                </div>
            </Container>
            {!showRoleNoData && getWarningPopupMessage(failureApiErrors, dispatch)}
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default AddPermission;
