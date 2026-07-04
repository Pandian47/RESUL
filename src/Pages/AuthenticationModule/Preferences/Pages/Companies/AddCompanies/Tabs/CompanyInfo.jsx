import { encryptWithAES, getPermissions } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import {validateHttpsUrl, updateQueryParams} from 'Utils/modules/urlQuery';
import { MAX_LENGTH10, MAX_LENGTH25, MAX_LENGTH255, MAX_LENGTH50, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { BU_NAME_EXISTS, BUSINESS_UNIT as BUSINESS_UNIT_MSG, ENTER_ADDRESS, ENTER_CITY, ENTER_COMPANY as ENTER_COMPANY_MSG, ENTER_PARENT_COMPANY, MINLENGTH, SELECT_BUSINESS_POSITION, SELECT_BUSINESS_TYPE, SELECT_COMPANY_BRAND, SELECT_COMPANY_LIST, SELECT_COUNTRY, SELECT_INDUSTRY, SELECT_OPERATIONAL_REGION, SELECT_REGION, THIS_FIELD_IS_REQUIRED, UPLOAD_COMPANY_IMAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES, WEBSITE_RULES_SECURE, ZIP_RULES } from 'Constants/GlobalConstant/Rules';
import { ADD, ADDRESS, ALLOWED_FORMATS, ARE_YOU_SURE_WANT_TO_CHANGE, BUSINESS_UNIT, CANCEL, CITY, CLICK_ON, CONTACT_ADMIN, CROSS_BU, ENTER_COMPANY, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1, FILE_SIZE500KB, HEAD_QUATERS, HEADER_QUATER_CHANGED, HYBRID_SOLUTION, ICON_TO_ADD_BUSINESS_UNITS, NEXT, NO_DATA_AVAILABEL, NOT_A_CLIENT, OK, OPERATIONAL_REGIONS, PARENT_COMPANY, PARENT_COMPANY_POP_HOVER, PERMISSION_REQUIRED, REQUEST_SENT, SAVE, SHARE_BUSINESS_UNITS, SHARING_BUS, STATE, UPDATE, WEBSITE, YOU_HAVE_ALREADY_CREATED, ZIP } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_minus_fill_medium, circle_pencil_medium, circle_plus_fill_edge_medium, circle_plus_fill_medium, circle_question_mark_mini, circle_tick_medium, close_medium, lock_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { get as _get, map as _map, find as _find, isEqual as _isEqual, isEmpty as _isEmpty, sortBy as _sortBy, findIndex as _findIndex } from 'Utils/modules/lodashReplacements';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, useFieldArray, useWatch, FormProvider } from 'react-hook-form';

import { useImageUpload } from 'Hooks/useImageUpload';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSModal from 'Components/RSModal/index.jsx';
import ImageCropModal from 'Components/ImageCropModal';
import { Building } from 'Assets/Images';
import ListNameExists from 'Components/ListNameExists/index.jsx';
import RSConfirmationModal from 'Components/ConfirmationModal/index.jsx';

import { getUserDetails } from 'Utils/modules/crypto';
import { selectIcon } from 'Utils/modules/display';
import { charNum } from 'Utils/modules/inputValidators';
import { getmasterData } from 'Utils/modules/masterData';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { resetNewCompanyData, update_new_company_data, update_company_data } from 'Reducers/companySetup/reducer.js';
import { checkIsBUExists, getAddCompanyDatas, getCompanyClientDetails, updateShareBU } from 'Reducers/preferences/Companies/request.js';
import { getSessionId } from 'Reducers/globalState/selector.js';
import { changeHQData, getDepartmentLimit, saveAccountSettings } from 'Reducers/preferences/accountSettings/request';
import { resetCompaniesReducer } from 'Reducers/preferences/Companies/reducer';
import { checkClientNameExists, validateWebsite } from 'Reducers/login/newUser/request.js';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount.js';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect.js';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { brandCompanystatus } from 'Constants/GlobalConstant/index.js';
import { INITIAL_STATE, buildPayload } from './Constants';
import { getBUList } from 'Reducers/globalState/request';
import usePermission from 'Hooks/usePersmission';
import { globalStateSelector } from 'Utils/Selectors/app';
import { updateBUByClient, updateClientBranch, updateisClient, updateisClientID, updateBUByClientCompany, updateClientList } from 'Reducers/globalState/reducer';

import { showToast } from 'Components/CustomToast';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import { getCrossBUStatus } from 'Reducers/communication/createCommunication/Create/request';
import useQueryParams from 'Hooks/useQueryParams';
import CacheManager from 'Utils/cacheManager';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const CompanyInfo = ({
    nextScreen,
    currentPage = 'NEW_COMPANY',
    isAgencyValue,
    fromCompanies = false,
    fromAccountSettings = false,
    accountBootstrap = null,
}) => {
    const dispatch = useDispatch();
    const queryData = useQueryParams('/dashboard');
    const needBus = queryData?.needBUs && queryData?.fromLogin || false;
    const { clientBranch, isClient, isClientID } = useSelector((state) => globalStateSelector(state));
    const { licenseTypeId: parentLicenseType, isAgency, isEnterprisePlus } = getUserDetails();
    // console.log('isAgency: ', isAgency);
    const { userId, departmentId, clientId } = useSelector((state) => getSessionId(state));
    const { failureApiErrors, updatedLicenseId, company_clientId, currentPageConfig } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const { clientDetails, shareBus, companyAddSupportDatas } = useSelector(
        ({ companiesReducer }) => companiesReducer,
    );
    const navigate = useNavigate();
    const location = useLocation();
    const isAccountSettings = location?.pathname?.split('/')?.pop() === 'account-settings';
    // console.log('isAccountSettings: ', isAccountSettings);
    const { state } = isAccountSettings
        ? !_isEmpty(currentPageConfig)
            ? currentPageConfig
            : {
                  state: {
                      clientId,
                      mode: 'edit',
                      clientName: '',
                      licenseTypeId: parentLicenseType,
                      page: 'NEW_COMPANY',
                      isEnterprisePlus: isEnterprisePlus,
                  },
              }
        : !_isEmpty(currentPageConfig)
        ? currentPageConfig
        : useLocation();
    const mode = _get(state, 'mode', 'create');
    const fromUpgrade = state?.upgradeLicense || false
    const upgradedLicenseId = state?.upgradeLicenseId || null
    const isCreate = mode === 'create';
    const isNextAccountSettings = isAgency || (!isEnterprisePlus && parentLicenseType !== 3);
    // parentLicenseType == 1 || parentLicenseType == 2 || (parentLicenseType == 3 && !isEnterprisePlus);
    const isParentEnterprise = parentLicenseType === '3';
    const {
        countryMasterList,
        currencyMasterList,
        dateFormatList,
        jobFunctionList,
        timeFormatList,
        timeZoneList,
        languageMasterList,
        brandPositionList,
        businessTypeList,
        industryList,
        regionList: apiRegionList = [],
        stateList = [],
    } = getmasterData() || {};

    const DEFAULT_REGION_IDS = [2, 3, 1240, 4, 6];
    const regionList = DEFAULT_REGION_IDS.map((regionID) =>
        apiRegionList.find((region) => region?.regionID === regionID),
    ).filter(Boolean);
    // console.log('isAgency', isAgency);

    const { clientId: stateClientId, clientList } = useSelector(({ globalstate }) => globalstate);
    const companyDetails = useSelector(({ companyCreation }) => companyCreation) || {};
    const { licenseTypeId: createLicenseTypeId } = useSelector(({ newUserReducer }) => newUserReducer); // price plan id

    const [brandPosition, setBrandPosition] = useState({});
    const getBrandPositionsByClientType = useCallback(
        (clientTypeId) => {
            if (clientTypeId == null || !Array.isArray(brandPositionList)) return [];
            return brandPositionList.filter((item) => item?.clientType === clientTypeId);
        },
        [brandPositionList],
    );
    const [brandBus, setBrandBus] = useState(false);
    const [isShow, setIsShow] = useState({ show: false, buId: '' });
    const [show, setShow] = useState(false);
    const [HQModal, setHQModal] = useState({ show: false, id: 0 });
    const [buLock, setBuLock] = useState({ show: false, index: null });
    const [businessStatus, setBusinessStatus] = useState(false);
    const [websiteLoading, setWebsiteLoading] = useState({ loading: false, valid: false });
    const [isHeadQuaters, setIsHeadquaters] = useState(false);
    const { permissions } = usePermission();
    const [companyRegionList, setCompanyRegionList] = useState(null);
    const [parentcompanyList, setParentCompanyList] = useState(false);
    const [isHybridEdit, setisHybridEdit] = useState(false);
    const [allowedBULength, setAllowedBULength] = useState(0);

    // const deleteAccess = _get(permissions, 'deleteAccess', true);
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const permissionList = getPermissions();
    const { viewAccess: userViewAccess } = _find(permissionList, { featureId: 12 });
    const saveAccountSettingsApi = useApiLoader({ autoFetch: false });
    const [activeSaveAction, setActiveSaveAction] = useState(null);
    const isSaveClientLoading = saveAccountSettingsApi.isFetching;
    const isNextSaveLoading = isSaveClientLoading && activeSaveAction === 'next';
    const isUpdateSaveLoading = isSaveClientLoading && activeSaveAction === 'update';
    const methods = useForm(INITIAL_STATE);

    const {
        control,
        setError,
        setValue,
        clearErrors,
        handleSubmit,
        reset,
        trigger,
        watch,
        getValues,
        resetField,
        formState: { errors, isValid, isDirty },
    } = methods;

    const {
        fileInputRef,
        imageModalState,
        handleNativeFileChange,
        openCropWithExistingImage,
        handleCropComplete,
        handleModalClose,
        triggerUpload,
        setTempImageData,
    } = useImageUpload(setValue, setError, clearErrors, 'profile');

    const [shareBU, preferredRegions] = watch(['shareBU', 'preferredRegions']);
    const selectedBusinessType = watch('businessType');
    const companyName = watch('companyName');
    const selectedCountry = watch('companyCountry');
    const filteredStateList = useMemo(() => {
        if (!selectedCountry || !stateList.length) return [];
        const selectedCountryID = selectedCountry?.countryID || selectedCountry;
        return stateList
            .filter((state) => state?.countryID === selectedCountryID)
            .sort((a, b) =>
                String(a?.state ?? '').toLowerCase() > String(b?.state ?? '').toLowerCase() ? 1 : -1,
            );
    }, [selectedCountry, stateList]);
    const brandWebsiteHasError = Object.hasOwn(errors, 'companyWebsite');
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'bus',
    });

    const resetCompanyForm = useCallback(() => {
        setWebsiteLoading({ loading: false, valid: false });
        reset(INITIAL_STATE.defaultValues);
        replace([]);
        setBrandBus(false);
    }, [reset, replace]);

    const businessUnitWatch = useWatch({
        control,
        name: 'bus',
    });
    // console.log('businessUnitWatch: ', businessUnitWatch);
    // console.log('clientDetails: ', clientDetails?.businessUnit);

    const checkBus = (name, ind) => {
        if (clientDetails?.businessUnit !== undefined) {
            if (name === clientDetails?.businessUnit[ind]?.departmentName) {
                return true;
            } else {
                return false;
            }
        }
    };
    const selectedRegions = watch('preferredRegions');
    const businessType = watch('businessType');
    useComponentWillUnmount(() => {
        resetCompanyForm();
    });

    let businessList = watch(['companyIndustry', 'businessType', 'BrandPosition', 'companyStatus']); // don't add any inbetween
    const changeHQ = async (e) => {
        const payload = {
            // clientId: _get(state, 'clientId', 0),
            clientId: isAccountSettings ? clientId : _get(state, 'clientId', 0),
            userId,
            clientBranchTypeId: e, // businessList[3]?.titleId,
            applicationUrl: window.location.origin,
        };
                const res = await dispatch(changeHQData({ payload }));
        if (res?.status) {
            setHQModal({ show: false, id: 0 });
            resetCompanyForm();
            dispatch(resetNewCompanyData());
            dispatch(resetCompaniesReducer());
            if (isAccountSettings) navigate('/preferences');
            else navigate('/preferences/company-list');
        }
    };

    // agency flow new changes

    let isBrandPosition = isAgency
        ? true
        : businessList[1]?.businessTypeID !== 3 && businessList[2]?.brandPositionID === undefined
        ? false
        : true;
    // console.log('isBrandPosition: ', isBrandPosition);

    useEffect(() => {
        const filteredData = businessList.filter((item) => {
            if (typeof item === 'string') {
                return item !== '';
            } else if (typeof item === 'object') {
                return Object.keys(item)?.length > 0;
            }
            return true;
        });
        setBusinessStatus(filteredData?.length === 3);
    }, [businessList]);

    // useEffect(() => {
    //     if (!!selectedBusinessType) {
    //         debugger
    //         const data = brandPositionList?.filter((item) => item.clientType === selectedBusinessType?.businessTypeID);
    //         setBrandPosition((prev) => ({
    //             ...prev,
    //             [selectedBusinessType?.businessTypeID]: data,
    //         }));
    //     }
    // }, [selectedBusinessType]);

    const shouldBootstrapCompanyClient =
        currentPage === 'NEW_COMPANY' && !fromAccountSettings && !isAccountSettings;

    const applyCrossBUResponse = (crossBUStatus) => {
        if (crossBUStatus?.status && crossBUStatus?.data?.length) {
            setValue(
                'crossBU',
                parseInt(crossBUStatus?.data?.[0]?.IsCrossBuEnabled, 10) === 1 ? true : false || false,
            );
        } else {
            setValue('crossBU', false);
        }
    };

    const handleCrossBUAPI = async () => {
        const payload = { clientId, departmentId, userId };
        const crossBUStatus = await dispatch(
            getCrossBUStatus({ payload, loading: false }),
        );
        applyCrossBUResponse(crossBUStatus);
    };

    const companyClientApi = usePreferencesSubPageApi({
        enabled: shouldBootstrapCompanyClient,
        mode: isCreate ? 'create' : 'edit',
        deps: [currentPage, mode, _get(state, 'clientId', 0), state?.licenseTypeId],
        fetcher: async () => {
            if (!state) {
                navigate('/preferences/company-list');
                return null;
            }
            const crossBUPayload = { clientId, departmentId, userId };
            if (mode === 'edit') {
                const detailsPayload = {
                    clientId: _get(state, 'clientId', 0),
                    userId,
                    departmentId: 0,
                };
                const licenseId = Number(state?.licenseTypeId);
                const isEnterpriseEdit = licenseId === 3;
                const shouldFetchDepartmentLimit = isEnterpriseEdit && (!isAgency || !isAccountSettings);

                const requests = [
                    dispatch(
                        getCompanyClientDetails({
                            payload: detailsPayload,
                            isAgency,
                            loading: false,
                        }),
                    ),
                    dispatch(getCrossBUStatus({ payload: crossBUPayload, loading: false })),
                ];

                if (shouldFetchDepartmentLimit) {
                    requests.push(
                        dispatch(
                            getDepartmentLimit({
                                payload: {
                                    licenseTypeId: licenseId,
                                    licenseFeatureId: isAgency ? 39 : 40,
                                },
                                loading: false,
                            }),
                        ),
                    );
                }

                const results = await Promise.all(requests);
                const [clientRes, crossBURes, departmentLimitRes] = results;

                if (!clientRes?.status) {
                    throw new Error(clientRes?.message || NO_DATA_AVAILABEL);
                }

                applyCrossBUResponse(crossBURes);
                if (shouldFetchDepartmentLimit && departmentLimitRes?.status) {
                    setAllowedBULength(departmentLimitRes?.data?.departmentValue ?? 0);
                } else if (shouldFetchDepartmentLimit) {
                    setAllowedBULength(0);
                }

                return { clientRes, crossBURes, departmentLimitRes };
            }
            const { clientId: sessionClientId } = getUserDetails();
            const addPayload = {
                clientId: sessionClientId,
                departmentId: 0,
                userId,
            };
            const [addRes, crossBURes] = await Promise.all([
                dispatch(getAddCompanyDatas({ payload: addPayload, loading: false })),
                dispatch(getCrossBUStatus({ payload: crossBUPayload, loading: false })),
            ]);
            applyCrossBUResponse(crossBURes);
            return { addRes, crossBURes };
        },
    });

    const showCompanyClientNoData = companyClientApi.isError;
    const showCompanyClientSkeleton =
        shouldBootstrapCompanyClient && (companyClientApi.isPageLoading || showCompanyClientNoData);

    useEffect(() => {
        if (!fromAccountSettings || !accountBootstrap?.crossBURes) return;
        applyCrossBUResponse(accountBootstrap.crossBURes);
    }, [fromAccountSettings, accountBootstrap]);
    useEffect(() => {
        const isGHQPresent = _findIndex([companyAddSupportDatas?.ChildInfo], ['clientbranchTypeId', 1]);
        setIsHeadquaters(isGHQPresent === -1);
    }, [companyAddSupportDatas]);

    useEffect(() => {
        if (mode === 'edit' && Object.keys(clientDetails)?.length) {
            let {
                countryId,
                languageId,
                jobFunctionId,
                currencyId,
                timeZoneId,
                timeFormatId,
                dateFormatId,
                businessTypeId,
                brandPositionId,
                countryCodeMobile,
                phoneNo,
                industryId,
                regionName,
                city,
                zipCode,
                address,
                website,
                parentClientName,
                childClientName,
                businessUnit,
                regionalStructure,
                clientBranchTypeId,
                logoPath,
                parentClientId,
                isHybrid,
                clientName,
                state: stateValue,
            } = clientDetails;
            setisHybridEdit(isHybrid);
            countryCodeMobile = countryCodeMobile || '';
            phoneNo = phoneNo || '';
            const companyCountry = _find(countryMasterList, (country) => country.countryID === countryId);
            const jobFunction = _find(jobFunctionList, (job) => job.jobFunctionID === jobFunctionId);
            const currency = _find(currencyMasterList, (currency) => currency.currencyID === currencyId);
            const dateFormat = _find(dateFormatList, (date) => date.dateFormatID === dateFormatId) || _find(dateFormatList, ['dateFormatID', 4]);
            const langauge = _find(languageMasterList, (language) => language.languageID === languageId);
            const timeFormat = _find(timeFormatList, (timeFormat) => timeFormat.timeFormatID === timeFormatId);
            const timezone = _find(timeZoneList, (timezone) => timezone.timeZoneID === timeZoneId);
            const businessType = _find(businessTypeList, ['businessTypeID', businessTypeId]);
            const BrandPosition = _find(brandPositionList, ['brandPositionID', brandPositionId]);
            const companyIndustry = _find(industryList, ['industryID', industryId]);
            
            let companyState = null;
            // Only set state if stateValue exists and is not empty string
            if (stateValue && stateValue !== '' && countryId) {
                const normalizedStateValue = stateValue.toString().replace(/\s+/g, '').toLowerCase();
                companyState = _find(stateList, (state) => {
                    if (state?.countryID === countryId && state?.state != null) {
                        const normalizedStateName = state.state.toString().replace(/\s+/g, '').toLowerCase();
                        return normalizedStateName === normalizedStateValue ||
                               String(state.state).toLowerCase() === String(stateValue).toLowerCase() ||
                               state.state === stateValue;
                    }
                    return false;
                });
            }
            // Only set default state if stateValue is undefined/null (not explicitly empty string)
            if (!companyState && countryId && stateValue !== '') {
                companyState = _find(stateList, (state) => state.countryID === countryId);
            }

            // const title = _find(titleData, (title) => title.titleDataid === titleId);
            // const role = _find(roles, (role) => role.roleId === roleId)?.roleName;
            // const preferredRegions = regionalStructure?.split(',').filter(e=>e.regionName ===
            //     )
            let getRegion = regionalStructure ? regionalStructure?.split(',') : [];
            let getregionName = regionList?.filter((region) => getRegion?.includes(region?.regionName)) || [];

            let getRegionName = getregionName?.map((item) => item?.regionName) || [];

            let preferredRegion = getRegion
                .filter((item) => !getRegionName?.includes(item))
                .map((e) => {
                    return {
                        regionName: e,
                        regionID: new Date().getTime(),
                    };
                });
            const companyRegion = _find([...getregionName, ...preferredRegion], ['regionName', regionName]);
            let insertDefaultRegion = _isEqual(_sortBy(getregionName, 'regionName'), _sortBy(regionList, 'regionName'));
            reset((formState)=> ({
                ...formState,
                ...clientDetails,
                businessType,
                BrandPosition,
                companyIndustry,
                companyRegion,
                // title,
                jobFunction,
                companyCountry,
                currency,
                dateFormat,
                langauge,
                timeFormat,
                timezone,
                state: companyState,
                // role,
                // phoneNo: countrycodeMobile + phoneNo?.slice(1, 5) + '-*****',
                phoneNo: countryCodeMobile + phoneNo,
                companyCity: city,
                companyZipcode: zipCode,
                companyAddress: address,
                companyWebsite: website,
                parentCompany: parentClientName,
                companyName: isAgency && isAccountSettings ? clientName : childClientName,
                preferredRegions: [...getregionName, ...preferredRegion] || [],
                companyStatus: _find(brandCompanystatus, ['titleId', clientBranchTypeId]),
                profile: logoPath,
                companiesList: { clientName: parentClientName, clientId: parentClientId },
                defaultRegions: insertDefaultRegion,
            }));
            let businessUnits = _map(businessUnit, (unit) => {
                const data = getBrandPositionsByClientType(unit?.businessTypeId);
                setBrandPosition((prev) => ({
                    ...prev,
                    [unit?.businessTypeId]: data,
                }));
                return {
                    buName: unit.departmentName, // window.atob(unit.departmentName), // shown department name instructed by raghav
                    SelectIndustry: _find(industryList, ['industryID', unit.industryId]),
                    SelectBUType: _find(businessTypeList, ['businessTypeID', unit.businessTypeId]),
                    SelectBrandPosition: _find(brandPositionList, ['brandPositionID', unit.brandPositionId]) || '',
                    isLock: unit?.unit || false,
                    isDelete: deleteAccess,
                    isEdit: true,
                    hasChanged: false,
                    ...unit,
                };
            });
            replace(businessUnits);
            setValue('BrandPosition', BrandPosition || '');
            if (businessUnit?.length) setBrandBus(true);
        }
    }, [clientDetails]);

    // useComponentWillUnmount(() => {
    // reset(INITIAL_STATE);
    // });
    let businessTypeListBu = businessTypeList?.filter((item) => item?.businessTypeID !== 3);
    let businessTypeListBuDisable = clientDetails?.businessTypeId != 3 ? true : false;
    useOnlyDepChangeEffect(() => {
        const preferredRegions = companyAddSupportDatas?.ParentInfo?.regionalStructure?.split(',');
        reset((prev) => ({
        ...prev,
        parentCompany: companyAddSupportDatas?.ParentInfo?.parentclientName || '',
        ...(preferredRegions && {
            preferredRegions:
                regionList?.filter((region) =>
                    preferredRegions?.includes(region?.regionName)
                ) || [],
        }),
    }));

        if (companyAddSupportDatas?.ChildInfo?.length > 0) {
            setParentCompanyList(true);
        }
    }, [companyAddSupportDatas]);

    const handleUpdateBULock = async (field, index) => {
        // const res = await dispatch(
        //     updateBULock({
        //         departmentId: departmentId,
        //         isLock: !field?.isLock,
        //         clientId: _get(clientDetails, 'clientId', clientId),
        //         userId,
        //     }),
        // );
        // if (res?.status) updateBU(index, { ...field, isLock: !field?.isLock });
    };

    const handleShareBU = () => {
        if (!shareBU) trigger('shareBU');
        else {
            dispatch(
                updateShareBU({
                    userId: userId,
                    frombuId: isShow.buId,
                    tobuId: shareBU.departmentID,
                }),
            );
            setIsShow({ show: false, buId: '' });
        }
    };
    const handleClickBu = () => setBrandBus(!brandBus);

    // const isEnterprise = isParentEnterprise && (clientDetails?.licenseTypeId === 3 || licenseTypeId === 3);
    // const isEnterprise = clientDetails?.licenseTypeId === 3 || licenseTypeId === 3;
    let isEnterprise = false;
    //  console.log('createLicenseTypeId: ', createLicenseTypeId);
    //  console.log('state: ', state);
    if (mode === 'edit') {
        // if (isAgency) {
        if (state?.licenseTypeId === 3 || state?.licenseTypeId === '3') {
            isEnterprise = true;
        } else {
            isEnterprise = false;
        }
        //}
    } else if (fromUpgrade && upgradedLicenseId === 3) {
        isEnterprise = true;
    }else if (createLicenseTypeId === 3 || createLicenseTypeId === '3') {
        // } else if (createLicenseTypeId) {
        isEnterprise = true;
    } else if (!isAgency && (parentLicenseType === 3 || parentLicenseType === '3')) {
        // } else if (createLicenseTypeId) {
        isEnterprise = true;
    } else {
        isEnterprise = false;
    }
    //const allowedBULength = clientId === 3384 ? 8 : 19; // additional BU'S for versium account
    useEffect(() => {
        const applyDepartmentLimitResponse = (res) => {
            if (res?.status) {
                setAllowedBULength(res?.data?.departmentValue);
            } else {
                setAllowedBULength(0);
            }
        };

        if (fromAccountSettings && accountBootstrap?.departmentLimitRes !== undefined) {
            applyDepartmentLimitResponse(accountBootstrap.departmentLimitRes);
            return;
        }

        if (shouldBootstrapCompanyClient && mode === 'edit') {
            return;
        }

        const fetchDepartmentLimit = async () => {
            if (mode !== 'create' && isEnterprise && (!isAgency || !isAccountSettings)) {
                const payload = {
                    licenseTypeId: Number(state?.licenseTypeId),
                    licenseFeatureId: isAgency ? 39 : 40,
                };
                const res = await dispatch(getDepartmentLimit({ payload, loading: false }));
                applyDepartmentLimitResponse(res);
            }
        };
        fetchDepartmentLimit();
    }, [fromAccountSettings, accountBootstrap, shouldBootstrapCompanyClient, mode, isEnterprise]);

    const CompanyImageUploadButton = ({ value, onClick, onRemove, onEdit, error }) => {
        const [tooltip, setTooltip] = useState(false);
        const [removeTooltip, setRemoveTooltip] = useState(false);

        const isBase64Includes = value?.includes('base64') || false;
        let imageSrc;
        if (isBase64Includes) {
            imageSrc = value;
        } else if (value) {
            imageSrc = `data:image/png;base64,${value}`;
        } else {
            imageSrc = Building;
        }

        return (
            <>
                <div className={`picture rs-picture mt20 ${error ? 'errorContainer' : ''} required`}>
                    <figure>
                        <img src={imageSrc} alt="company logo" />
                    </figure>
                    <div className={`picture-choose-file ${value ? 'valid-image' : ''}`}>
                        <span className="info">
                            <RSTooltip
                                text={value ? 'Update company logo' : 'Upload company logo'}
                                position="top"
                                show={tooltip}
                            >
                                <span
                                    onMouseEnter={() => setTooltip(true)}
                                    onMouseLeave={() => setTooltip(false)}
                                    onClick={onClick}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {value ? (
                                        <>
                                            <span className="pcf-remove-icon">
                                                <RSTooltip text="Remove company logo" position="top" show={removeTooltip}>
                                                    <i
                                                        className={`${circle_minus_fill_medium} color-primary-red icon-md`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemove();
                                                        }}
                                                        onMouseEnter={() => {
                                                            setRemoveTooltip(true);
                                                            setTooltip(false);
                                                        }}
                                                        onMouseLeave={() => setRemoveTooltip(false)}
                                                    ></i>
                                                </RSTooltip>
                                            </span>
                                            <i
                                                className={`${circle_pencil_medium} color-primary-blue icon-md`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit && onEdit();
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </>
                                    ) : (
                                        <i className={`${circle_plus_fill_medium} color-primary-blue icon-md`} />
                                    )}
                                </span>
                            </RSTooltip>
                            <span className="pcf-label">Edit company logo</span>
                        </span>
                    </div>
                    {error && <div className="validation-message">{error}</div>}
                </div>
                {!value && (
                    <div className="alert alert-warning d-block mt30 py10 border-r5">
                        <small className="text-center d-flex flex-column">
                            <span>{ALLOWED_FORMATS}</span>
                            <span>{FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1}</span>
                            <span>{FILE_SIZE500KB}</span>
                        </small>
                    </div>
                )}
            </>
        );
    };

    // console.log('isEnterprise: create flow', isEnterprise);
    const handleBusUnits = () => {
        const [companyIndustry, businessType, brandPosition] = getValues([
            'companyIndustry',
            'businessType',
            'BrandPosition',
        ]);
        append({
            buName: '',
            isEdit: false,
            hasChanged: true,
            SelectIndustry: companyIndustry, // setValue(`bus[${0}].SelectIndustry`, companyIndustry),
            SelectBUType: businessType.businessTypeID === 3 ? '' : businessType, //setValue(`bus[${0}].SelectBUType`, businessType),
            SelectBrandPosition: brandPosition, //setValue(`bus[${0}].SelectBrandPosition`, brandPosition)
        });
        if (!brandBus) setBrandBus(true);
    };

    // useEffect(() => {
    //     if (brandBus) {
    //         const companyIndustry = getValues('companyIndustry');
    //         const businessType = getValues('businessType');
    //         const brandPosition = getValues('BrandPosition');
    //         fields?.map((_, index) => {
    //             setValue(`bus[${index}].SelectIndustry`, companyIndustry);
    //             setValue(`bus[${index}].SelectBUType`, businessType?.businessTypeID === 3 ? '' : businessType);
    //             setValue(`bus[${index}].SelectBrandPosition`, brandPosition);
    //         });
    //     }
    // }, [brandBus]);

    const handleFormSubmit = async (formprops, isUpdate = false) => {
        if (!formprops.profile) {
            setError('profile', {
                type: 'manual',
                message: UPLOAD_COMPANY_IMAGE,
            });
            return;
        }
        if (!brandBus && !formprops?.bus?.length && needBus){
            handleBusUnits();
            setTimeout(() => {
                trigger(`bus[${0}].buName`)
            },10)
            return;
        }
        if ((!isCreate && updateAccess) || (isAccountSettings && !isNextAccountSettings)) {
            const initialPayload = {
                clientId: clientDetails?.clientId,
                userId,
                licenseTypeId: clientDetails?.licenseTypeId || createLicenseTypeId,
            };
            const payload = buildPayload({
                ...formprops,
                ...initialPayload,
                regionList,
            });
            const shouldRefreshBUList =
                (isAccountSettings && isUpdate && isEnterprise && !isAgency) ||
                (isAccountSettings && isEnterprise && !isAgency) ||
                (fromCompanies && isEnterprise && company_clientId?.clientId === clientId);

            setActiveSaveAction(isUpdate ? 'update' : 'next');
            let res;
            try {
                res = await saveAccountSettingsApi.refetch({
                    fetcher: async () => {
                        const saveRes = await dispatch(
                            saveAccountSettings({
                                payload,
                                navigate,
                                nextScreen,
                                mode,
                                isAccountSettings,
                                isNextAccountSettings,
                                stateClientId,
                                isUpdate,
                                loading: false,
                            }),
                        );

                        if (saveRes?.status && shouldRefreshBUList) {
                            await dispatch(
                                getBUList(
                                    { userId: payload.userId, clientId: payload?.clientId },
                                    stateClientId,
                                    false,
                                    undefined,
                                    false,
                                    false,
                                ),
                            );
                        }

                        return saveRes;
                    },
                    loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
                });
            } finally {
                setActiveSaveAction(null);
            }
            if (res?.status) {
                const updatedClientList = clientList?.map(client =>
                        client.clientId === company_clientId.clientId
                            ? { ...client, logoPath: formprops.profile }
                            : client
                    );

                    dispatch(updateClientList(updatedClientList || []));

                    dispatch(
                        updateBUByClient({
                            clientId: {
                                ...company_clientId,
                                logoPath: formprops.profile,
                            },
                        })
                    );

                    dispatch(
                        updateBUByClientCompany({
                            clientId: {
                                ...company_clientId,
                                logoPath: formprops.profile,
                            },
                        })
                    );
                updateQueryParams({needBUs: false})
                let currentUserDetail = getUserDetails();
                currentUserDetail = {
                    ...currentUserDetail,
                    clientCountryId: payload?.countryId || currentUserDetail?.clientCountryId
                };
                const handleResetValue = () => {
                    localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(currentUserDetail)));
                    CacheManager.set('userDetails', currentUserDetail);
                }
                if(!isAgency && isAccountSettings && isUpdate && !isEnterprise){
                    handleResetValue()
                } else if (
                    fromCompanies &&
                    isEnterprise &&
                    company_clientId?.clientId === clientId
                ) {
                     handleResetValue()
                }
                // else if ((fromCompanies && isEnterprise) || (!isUpdate && isEnterprise && !isAgency)) {
                //     let res = await dispatch(
                //         getBUList(
                //             { userId: payload.userId, clientId: payload?.clientId },
                //             state?.currClient || company_clientId,
                //             true,
                //         ),
                //     );
                //     if (res?.status && state?.currClientId === payload?.clientId) {
                //         const getDepartmentsExcludingAll = res?.data?.filter(
                //             (list) => formatName(list.departmentName) !== 'all',
                //         );
                //         dispatch(updateBUByClient({ departmentList: getDepartmentsExcludingAll }));
                //         if (state?.fromLogin) {
                //             dispatch(updateBUByClient({ departmentId: getDepartmentsExcludingAll?.[0] }));
                //         }
                //     }
                // }

                if (!nextScreen) navigate('/preferences');
                else if (isUpdate) {
                    navigate('/preferences');
                } else if (nextScreen && !isAccountSettings) {
                    // nextScreen(mode === 'edit' ? 'ADD_USERS' : 'LOCALIZATION_SETTINGS');
                    nextScreen(mode === 'edit' && userViewAccess ? 'ASSIGN_ROLE' : 'LOCALIZATION_SETTINGS');
                } else if (isAccountSettings && isNextAccountSettings) {
                    nextScreen(mode === 'edit' && userViewAccess ? 'ASSIGN_ROLE' : 'LOCALIZATION_SETTINGS');
                } else if (isAccountSettings && !isNextAccountSettings) navigate('/preferences');
            }
            // await dispatch(
            //     getBUList({ userId: initialPayload.userId, clientId: initialPayload?.clientId }, stateClientId),
            // );
        } else {
            dispatch(update_new_company_data({ ...formprops, licenseTypeId: fromUpgrade ? upgradedLicenseId : createLicenseTypeId , isBack: false}));
            // dispatch(update_new_company_data({ ...formprops, licenseTypeId }));
            nextScreen(mode === 'edit' && userViewAccess ? 'ASSIGN_ROLE' : 'LOCALIZATION_SETTINGS');
        }
    };

    useEffect(() => {
        let val = [...preferredRegions];
        if (val?.length) {
            let duplicateEntries = val.filter((item, index, array) =>
                array
                    ?.slice(index + 1)
                    .some(
                        (otherItem) =>
                            String(otherItem?.regionName ?? '').toLowerCase() ===
                            String(item?.regionName ?? '').toLowerCase(),
                    ),
            );
            let maxVal = [...val].pop();
            // debugger;
            if (duplicateEntries?.length || maxVal?.regionName?.length > 25) {
                val.pop();
                setValue('preferredRegions', val);
            }
        }
    }, [preferredRegions]);

    useEffect(() => {
        return () => {
            dispatch(updateClientBranch(false));
            dispatch(updateisClient(true));
            dispatch(updateisClientID(false));
        };
    }, []);

    useEffect(() => {
        if (isCreate && companyDetails?.isBack) {
            const businessTypeId = companyDetails?.businessType?.businessTypeID;
            const companyLevelBrandPositionData = getBrandPositionsByClientType(businessTypeId);
            setBrandPosition((prev) => ({
                ...prev,
                [businessTypeId]: companyLevelBrandPositionData,
            }));
            setWebsiteLoading({ loading: false, valid: false });
            reset({
                ...INITIAL_STATE.defaultValues,
                ...companyDetails,
                companyWebsite: companyDetails?.companyWebsite || INITIAL_STATE.defaultValues.companyWebsite,
                preferredRegions: companyDetails?.preferredRegions || [],
            });
            dispatch(update_company_data({ field: 'isBack', data: false }));
        }
    }, [isCreate, companyDetails?.isBack, getBrandPositionsByClientType]);
    
    const companyBrandPositionOptions =
        getBrandPositionsByClientType(businessType?.businessTypeID);
    
    return (
        <FormProvider {...methods}>
            <PreferencesSubPageSkeletonGate
                variant={PREFERENCES_SUBPAGE_VARIANT.COMPANY_CLIENT_DETAILS}
                isLoading={showCompanyClientSkeleton}
                showNoData={showCompanyClientNoData}
            >
            <form
            // onSubmit={handleSubmit(handleFormSubmit)}
            >
                <div className="box-design rs-box py40">
                    {!isClient && isClientID && (
                        <div className={`alert alert-warning mb23 border-r7 align-items-stretch`}>
                                                   <i
                                                       className={`mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${alert_medium} icon-md bg-orange-medium `}
                                                   ></i>
                                                   <span className='align-items-center d-flex lh-sm py10'>{NOT_A_CLIENT}</span>
                                               </div>
                    )}
                    {clientBranch  ? (
                       <div className={`alert alert-success mb23 border-r7 align-items-stretch`}>
                                                  <i
                                                      className={`mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${circle_tick_medium} icon-md bg-primary-green `}
                                                  ></i>
                                                  <span className='align-items-center d-flex lh-sm py10'>{HEADER_QUATER_CHANGED}</span>
                                              </div>
                    ) : (
                        <>
                            {/* <div
                                className={`alert alert-danger align-items-center mb23`}
                                style={{ borderRadius: '5px' }}
                            >
                                <i
                                    className={`position-relative mr5 p5 ${close_medium} icon-md color-primary-red `}
                                ></i>
                                <span>Your head quarter has not changed</span>
                            </div> */}
                        </>
                    )}
                    <Row>
                        <Col md={3} sm={4} className="accountsetup-image-upload">
                            <Col>
                                <CompanyImageUploadButton
                                    value={watch('profile')}
                                    onClick={triggerUpload}
                                    onEdit={() => openCropWithExistingImage(watch('profile'))}
                                    onRemove={() => {
                                        setValue('profile', null);
                                        setError('profile', {
                                            type: 'manual',
                                            message: UPLOAD_COMPANY_IMAGE,
                                        });
                                    }}
                                    error={errors?.profile?.message}
                                />
                            </Col>
                        </Col>
                        <Col md={9} sm={8} className="box-left-border accountsetup-contact-info">
                            <Row className="pb10">
                                {/* {!isNextAccountSettings && ( */}
                                {isEnterprise && (!isAgency || !isAccountSettings) && (
                                    <>
                                        <Col sm={6} xs={12}>
                                            <div className="form-group">
                                                <RSInput
                                                    control={control}
                                                    name={'parentCompany'}
                                                    id="rs_CompanyInfo_parentCompany"
                                                    required
                                                    rules={{
                                                        required: ENTER_PARENT_COMPANY,
                                                    }}
                                                    disabled={
                                                        !isCreate ||
                                                        companyAddSupportDatas?.ParentInfo?.parentclientName?.length
                                                    }
                                                    placeholder={PARENT_COMPANY}
                                                    isCustomIcon={true}
                                                />
                                                <div className="form-field-icon">
                                                    <RSTooltip
                                                        position="bottom"
                                                        text={PARENT_COMPANY_POP_HOVER}
                                                    >
                                                        <i
                                                            className={`${circle_question_mark_mini} icon-xs`}
                                                            id="rs_CompanyInfo_questionmark"
                                                        ></i>
                                                    </RSTooltip>
                                                </div>
                                            </div>
                                        </Col>

                                        <Col sm={6} xs={12}>
                                            <div className="form-group" id="rs_CompanyInfo_preferredRegions">
                                                {isEnterprise && (
                                                    <>
                                                        <RSMultiSelect
                                                            control={control}
                                                            placeholder={OPERATIONAL_REGIONS}
                                                            allowCustom
                                                            name={'preferredRegions'}
                                                            dataItemKey={'regionID'}
                                                            data={(Array.isArray(regionList) ? [...regionList] : []).sort(
                                                                (a, b) =>
                                                                    String(a?.regionName ?? '').localeCompare(
                                                                        String(b?.regionName ?? ''),
                                                                    ),
                                                            )}
                                                            required
                                                            textField={'regionName'}
                                                            rules={{
                                                                required: SELECT_OPERATIONAL_REGION,
                                                            }}
                                                            handleChange={(e) => {
                                                                // console.log(e.target.value?.length, 'asdsdf');
                                                                const selectedRegions = _sortBy(
                                                                    e.target.value,
                                                                    'regionName',
                                                                );
                                                                const defaultRegions = _sortBy(
                                                                    regionList,
                                                                    'regionName',
                                                                );
                                                                const filteredRegions = selectedRegions?.filter(
                                                                    (region) =>
                                                                        defaultRegions?.some(
                                                                            (defaultRegion) =>
                                                                                defaultRegion?.regionID ===
                                                                                region?.regionID,
                                                                        ),
                                                                );
                                                                const isDefaultRegionSelected = _isEqual(
                                                                    filteredRegions,
                                                                    defaultRegions,
                                                                );
                                                                setValue('defaultRegions', isDefaultRegionSelected);
                                                                setValue('companyRegion', '');

                                                                let values = e.target.value;
                                                                const lastItem = values[values?.length - 1];
                                                                if (lastItem && lastItem?.regionID === undefined) {
                                                                    values.pop();
                                                                    const sameItem = values.find(
                                                                        (v) => v.regionName === lastItem.regionName,
                                                                    );
                                                                    if (sameItem === undefined) {
                                                                        lastItem.regionID = new Date().getTime();
                                                                        values.push(lastItem);
                                                                    }
                                                                    setValue('preferredRegions', values);
                                                                }
                                                            }}
                                                        />
                                                        <RSCheckbox
                                                            className="smaller"
                                                            name={'defaultRegions'}
                                                            control={control}
                                                            // defaultValue={defaultRegions}
                                                            labelName={'Select all regions where you operate'}
                                                            handleChange={({ target: { checked } }) => {
                                                                if (checked) {
                                                                    setValue('preferredRegions', regionList);
                                                                    clearErrors('preferredRegions');
                                                                } else {
                                                                    setValue('preferredRegions', []);
                                                                    setValue('companyRegion', '');
                                                                }
                                                            }}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </Col>
                                    </>
                                )}
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <Row>
                                            <Col md={isEnterprise && isHeadQuaters ? 8 : 12}>
                                                {companyName?.length > 18 ? (
                                                    <RSTooltip text={companyName}>
                                                        <ListNameExists
                                                            name={'companyName'}
                                                            field="clientName"
                                                            apiCallback={checkClientNameExists}
                                                            condition={(status) => {
                                                                return !status?.status;
                                                            }}
                                                            maxLength={MAX_LENGTH50}
                                                            placeholder={ENTER_COMPANY}
                                                            extraPayload={{ departmentId: 0, isChild: true }}
                                                            rules={LIST_NAME_RULES(ENTER_COMPANY_MSG)}
                                                            customErrorMessage={ENTER_COMPANY_MSG}
                                                            disabled={!isCreate}
                                                            className="ellispis"
                                                        />
                                                    </RSTooltip>
                                                ) : (
                                                    <ListNameExists
                                                        name={'companyName'}
                                                        field="clientName"
                                                        apiCallback={checkClientNameExists}
                                                        condition={(status) => {
                                                            return !status?.status;
                                                        }}
                                                        maxLength={MAX_LENGTH50}
                                                        placeholder={ENTER_COMPANY}
                                                        extraPayload={{ departmentId: 0 ,isChild: true}}
                                                        rules={LIST_NAME_RULES(ENTER_COMPANY_MSG)}
                                                        customErrorMessage={ENTER_COMPANY_MSG}
                                                        disabled={!isCreate}
                                                        className="ellispis"
                                                    />
                                                )}
                                            </Col>
                                            {isEnterprise && isHeadQuaters && (!isAgency || !isAccountSettings) && (
                                                <Col md={4}>
                                                    <RSKendoDropDownList
                                                        name={'companyStatus'}
                                                        data={brandCompanystatus}
                                                        control={control}
                                                        required
                                                        disabled={!isCreate && !isAccountSettings}
                                                        textField={'title'}
                                                        dataItemKey={'titleId'}
                                                        // label={HEAD_QUATERS}
                                                        rules={{
                                                            required: SELECT_COMPANY_BRAND,
                                                        }}
                                                        handleChange={(e) => {
                                                            if (isCreate && e?.value?.titleId === 1) {
                                                                const isGHQexists =
                                                                    _find(companyAddSupportDatas?.ChildInfo, [
                                                                        'clientbranchTypeId',
                                                                        1,
                                                                    ]) && !isAgency;
                                                                if (isGHQexists) {
                                                                    setShow(true);
                                                                    reset((prev) => ({
                                                                        ...prev,
                                                                        companyStatus: businessList[3],
                                                                    }));
                                                                }
                                                            } else {
                                                                if (!isCreate) {
                                                                    setHQModal({ show: true, id: e?.value?.titleId });
                                                                    reset((prev) => ({
                                                                        ...prev,
                                                                        companyStatus: businessList[3],
                                                                    }));
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Col>
                                            )}
                                        </Row>
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            control={control}
                                            name={'companyWebsite'}
                                            id="rs_CompanyInfo_companyWebsite"
                                            placeholder={WEBSITE}
                                            required
                                            maxLength={MAX_LENGTH50}
                                            isLoading={websiteLoading.loading}
                                            isValidIcon={websiteLoading.valid}
                                            rules={WEBSITE_RULES_SECURE}
                                            onKeyDown={(e) => {
                                                const result = validateHttpsUrl.handleKeyDown(e);
                                                if (result.preventDefault) {
                                                    e.preventDefault();
                                                    if (result.value) {
                                                        setValue('companyWebsite', result.value);
                                                    }
                                                    if (result.selectionStart !== undefined) {
                                                        e.target.setSelectionRange(
                                                            result.selectionStart,
                                                            result.selectionEnd,
                                                        );
                                                    }
                                                }
                                            }}
                                            onChange={(e) => {
                                                setValue('companyWebsite', validateHttpsUrl.formatUrl(e.target.value));
                                            }}
                                            handleOnPaste={async (e) => {
                                                e.preventDefault();
                                                const finalValue = validateHttpsUrl.handlePaste(e);
                                                setValue('companyWebsite', finalValue, { shouldValidate: true });
                                                if (!brandWebsiteHasError) {
                                                    setWebsiteLoading({ loading: true, valid: false });
                                                    const { status } = await dispatch(
                                                        validateWebsite({
                                                            payload: { Website: finalValue },
                                                            setError,
                                                            name: 'companyWebsite',
                                                        }),
                                                    );
                                                    setWebsiteLoading({ loading: false, valid: status });
                                                }
                                            }}
                                            handleOnBlur={async ({ target: { value } }) => {
                                                if (value.trim() === 'https://') {
                                                    setWebsiteLoading({ loading: false, valid: false });
                                                    return;
                                                }
                                                if (!brandWebsiteHasError) {
                                                    setWebsiteLoading({ loading: true, valid: false });
                                                    const { status } = await dispatch(
                                                        validateWebsite({
                                                            payload: { Website: value },
                                                            setError,
                                                            name: 'companyWebsite',
                                                        }),
                                                    );
                                                    setWebsiteLoading({ loading: false, valid: status });
                                                }
                                            }}
                                        />
                                    </div>
                                </Col>
                                {/* {isEnterprise && (
                                    <Col sm={6} xs={12}>
                                        <div className="form-group">
                                            <RSKendoDropDownList
                                                name={'companiesList'}
                                                data={companyAddSupportDatas?.ChildInfo}
                                                control={control}
                                                required={isAgency && parentcompanyList ? true : false}
                                                disabled={!isCreate}
                                                textField={'clientName'}
                                                dataItemKey={'clientId'}
                                                label={'Companies list'}
                                                rules={
                                                    isAgency &&
                                                    parentcompanyList && {
                                                        required: SELECT_COMPANY_LIST,
                                                    }
                                                }
                                            />
                                        </div>
                                    </Col>
                                )} */}
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            control={control}
                                            name={'companyAddress'}
                                            id="rs_CompanyInfo_companyAddress"
                                            required
                                            minLength={MIN_LENGTH}
                                            maxLength={MAX_LENGTH255}
                                            rules={{
                                                required: ENTER_ADDRESS,
                                                minLength: {
                                                    value: MIN_LENGTH,
                                                    message: MINLENGTH,
                                                },
                                            }}
                                            placeholder={ADDRESS}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={6} xs={12} className="Pa_Company_City">
                                                <RSInput
                                                    control={control}
                                                    name={'companyCity'}
                                                    id="rs_CompanyInfo_companyCity"
                                                    required
                                                    maxLength={MAX_LENGTH50}
                                                    rules={{ required: ENTER_CITY }}
                                                    placeholder={CITY}
                                                />
                                            </Col>
                                            <Col sm={6} xs={12}>
                                                <RSInput
                                                    control={control}
                                                    type="text"
                                                    name={'companyZipcode'}
                                                    id="rs_CompanyInfo_companyZipcode"
                                                    required
                                                    onKeyDown={charNum}
                                                    rules={ZIP_RULES}
                                                    placeholder={ZIP}
                                                    maxLength={MAX_LENGTH10}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group" id="rs_CompanyInfo_companyCountry">
                                        <RSKendoDropDown
                                            control={control}
                                            name={'companyCountry'}
                                            // data={countryMasterList}
                                            data={(Array.isArray(countryMasterList)
                                                ? [...countryMasterList]
                                                : []
                                            ).sort((a, b) =>
                                                String(a?.country ?? '').toLowerCase() >
                                                String(b?.country ?? '').toLowerCase()
                                                    ? 1
                                                    : -1,
                                            )}
                                            textField="country"
                                            required
                                            dataItemKey={'countryID'}
                                            label={'Country'}
                                            rules={{
                                                required: SELECT_COUNTRY,
                                            }}
                                            popupSettings={{
                                                popupClass: `addImportAudienceDropdownListContainer`,
                                            }}
                                            handleChange={() => {
                                                setValue('state', null);
                                                clearErrors('state');
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group" id="rs_CompanyInfo_state">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'state'}
                                            data={filteredStateList}
                                            textField="state"
                                            placeholder={STATE}
                                            dataItemKey={'stateID'}
                                            label={'State'}
                                            disabled={!selectedCountry || filteredStateList.length === 0}
                                        />
                                    </div>
                                </Col>
                                {(!isAgency || !isAccountSettings) && isEnterprise && (
                                    <Col sm={6} xs={12}>
                                        <div className="form-group" id="rs_CompanyInfo_companyRegion">
                                            <RSKendoDropDownList
                                                control={control}
                                                name={'companyRegion'}
                                                //  defaultValue={companyRegion}
                                                data={isEnterprise ? selectedRegions : regionList}
                                                textField="regionName"
                                                required
                                                dataItemKey={'regionID'}
                                                label={'Entity region'}
                                                rules={{
                                                    required: SELECT_REGION,
                                                }}
                                            />
                                        </div>
                                    </Col>
                                )}
                                {(!isAgency || !isAccountSettings) && (
                                    <Col sm={6} xs={12}>
                                        <div className= {`form-group ${!isEnterprise ? '': 'm0'}`} id="rs_CompanyInfo_companyIndustry">
                                            <RSKendoDropDown
                                                control={control}
                                                name={'companyIndustry'}
                                                // data={industryList}
                                                data={(Array.isArray(industryList)
                                                    ? [...industryList]
                                                    : []
                                                ).sort((a, b) =>
                                                    String(a?.industryName ?? '').toLowerCase() >
                                                    String(b?.industryName ?? '').toLowerCase()
                                                        ? 1
                                                        : -1,
                                                )}
                                                textField="industryName"
                                                required
                                                disabled={!isCreate}
                                                dataItemKey={'industryID'}
                                                label={'Industry'}
                                                rules={{
                                                    required: SELECT_INDUSTRY,
                                                }}
                                                popupSettings={{
                                                    popupClass: `addImportAudienceDropdownListContainer`,
                                                }}
                                            />
                                        </div>
                                    </Col>
                                )}
                                {(!isAgency || !isAccountSettings) && (
                                    <Col sm={12} xs={12}>
                                        <div className="form-group m0">
                                            <Row>
                                                <Col sm={6} xs={12} id="rs_CompanyInfo_businessType">
                                                    <RSKendoDropDownList
                                                        control={control}
                                                        name={'businessType'}
                                                        // data={businessTypeList}
                                                        data={(Array.isArray(businessTypeList)
                                                            ? [...businessTypeList]
                                                            : []
                                                        ).sort((a, b) =>
                                                            String(a?.businessType ?? '').toLowerCase() >
                                                            String(b?.businessType ?? '').toLowerCase()
                                                                ? 1
                                                                : -1,
                                                        )}
                                                        textField="businessType"
                                                        required
                                                        disabled={!isCreate}
                                                        dataItemKey={'businessTypeID'}
                                                        label={'Business type'}
                                                        handleChange={(e) => {
                                                            let value = e.value;
                                                            const data = getBrandPositionsByClientType(
                                                                value?.businessTypeID,
                                                            );
                                                            setBrandPosition((prev) => ({
                                                                ...prev,
                                                                [value?.businessTypeID]: data,
                                                            }));
                                                            setValue('BrandPosition', '');
                                                        }}
                                                        rules={{
                                                            required: SELECT_BUSINESS_TYPE,
                                                        }}
                                                    />
                                                </Col>
                                                <Col sm={6} xs={12} id="rs_CompanyInfo_BrandPosition">
                                                    <RSKendoDropDownList
                                                        control={control}
                                                        name={'BrandPosition'}
                                                        data={
                                                            brandPosition?.[businessType?.businessTypeID] ??
                                                            companyBrandPositionOptions
                                                        }
                                                        textField="brandPositionName"
                                                        required={
                                                            !isCreate
                                                                ? false
                                                                : companyBrandPositionOptions.length !== 0
                                                        }
                                                        disabled={
                                                            !isCreate ||
                                                            companyBrandPositionOptions.length === 0
                                                        }
                                                        dataItemKey={'brandPositionID'}
                                                        label={'Brand position'}
                                                        rules={
                                                            !isCreate
                                                                ? {}
                                                                : companyBrandPositionOptions.length !== 0
                                                                ? {
                                                                      required: SELECT_BUSINESS_POSITION,
                                                                  }
                                                                : {}
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                )}
                                {isEnterprise && (!isAgency || !isAccountSettings) && (
                                    <Col sm={6} xs={12}>
                                        <div className="form-group m0 position-relative top6">
                                            <RSCheckbox
                                                control={control}
                                                id="rs_CompanyInfo_Checkbox"
                                                name="isHybrid"
                                                type="checkbox"
                                                disabledchk={mode === 'edit' && !isHybridEdit}
                                                labelName={HYBRID_SOLUTION}
                                                defaultValue={true}
                                                className="smaller"
                                            />
                                        </div>
                                    </Col>
                                )}
                                {isEnterprise && (!isAgency || !isAccountSettings) &&  mode === 'edit' && watch('crossBU') && (
                                    <Col sm={6} xs={12}>
                                        <div className="form-group m0 position-relative top6">
                                            <RSCheckbox
                                                control={control}
                                                name="crossBU"
                                                type="checkbox"
                                                labelName={CROSS_BU}
                                                className="smaller"
                                                disabled={true}
                                                id="rs_CompanyInfo_Checkbox_crossBU"
                                                disabledchk={true}
                                            />
                                        </div>
                                    </Col>
                                )}
                            </Row>
                            {/* {mode != 'create' && isEnterprise && ( */}
                            {mode != 'create' && isEnterprise && (!isAgency || !isAccountSettings) && (
                                <Fragment>
                                    <h3 className="mt20 mb20">{BUSINESS_UNIT}</h3>
                                    {!brandBus && (
                                        <div className="alert alert-warning text-center flex-center p5">
                                            {CLICK_ON}
                                            <RSTooltip position="top" text={ADD} className="lh0">
                                                <div  className={`${addAccess ? '' : 'pe-none click-off'} ${
                                                        allowedBULength > 0 ? '' : 'pe-none click-off'
                                                    } `}>
                                                <i
                                                    onClick={() => {
                                                        if (addAccess) handleBusUnits();
                                                    }}
                                                    className={`${
                                                        circle_plus_fill_edge_medium
                                                    } icon-md primary-color mx5 cp`}
                                                    id="rs_data_circle_plus_fill_edge"
                                                ></i>
                                                </div>
                                            </RSTooltip>
                                            {ICON_TO_ADD_BUSINESS_UNITS}
                                        </div>
                                    )}

                                    {brandBus && (
                                        <Fragment>
                                            {fields.map((field, index) => {
                                                const isLock = businessUnitWatch?.[index]?.isLock || false;
                                                const isDelete = field?.isDelete ? true : false;
                                                let buName = getValues(`bus[${index}].buName`);
                                                let isExist = checkBus(buName, index);
                                                let hasError = _get(errors, `bus[${index}].buName.message`, '');
                                                return (
                                                    <div key={field.id} className="bu_Container form-group mt40 mb0">
                                                        <Row>
                                                            <Col md={3} className="valid_error_depart">
                                                                <ListNameExists
                                                                    name={`bus[${index}].buName`}
                                                                    field="departmentName"
                                                                    nameExists={isExist || !!hasError}
                                                                    defaultValue={field.departmentName}
                                                                    blockBodyPointerEvents
                                                                    apiCallback={
                                                                        // mode !== 'edit' &&
                                                                        // buName?.length >= 3 &&
                                                                        checkIsBUExists
                                                                    }
                                                                    // selectDisable={!isDelete ? true : false}
                                                                    // selectDisable={!field?.isEdit ? true : false}
                                                                    condition={(data) => {
                                                                        const { status } = data;
                                                                        return !status;
                                                                    }}
                                                                    onBlur={({ target: { value } }) => {
                                                                        if (
                                                                            value?.trim() !==
                                                                            clientDetails?.businessUnit?.[index]
                                                                                ?.departmentName
                                                                        ) {
                                                                            setValue(`bus[${index}].hasChanged`, true);
                                                                        } else {
                                                                            setValue(`bus[${index}].hasChanged`, false);
                                                                        }
                                                                    }}
                                                                    rules={LIST_NAME_RULES(BUSINESS_UNIT_MSG)}
                                                                    customErrorMessage={BUSINESS_UNIT_MSG}
                                                                    validate={{
                                                                        duplicateName: (value, ii) => {
                                                                            let tempSet = new Set();
                                                                            const isDuplicate =
                                                                                businessUnitWatch?.filter(
                                                                                    (val, ind) => {
                                                                                        if (val?.buName?.trim()) {
                                                                                            if (
                                                                                                tempSet.has(
                                                                                                    val?.buName?.trim(),
                                                                                                )
                                                                                            ) {
                                                                                                return true;
                                                                                            }
                                                                                            tempSet.add(
                                                                                                val?.buName?.trim(),
                                                                                            );
                                                                                            return false;
                                                                                        }
                                                                                    },
                                                                                );
                                                                            const isExist = isDuplicate?.find(
                                                                                (duplicate) =>
                                                                                    duplicate?.buName?.trim() ===
                                                                                        value?.trim() &&
                                                                                    businessUnitWatch?.[index]
                                                                                        ?.hasChanged,
                                                                            );
                                                                            return isExist
                                                                                ? BU_NAME_EXISTS
                                                                                : true;
                                                                        },
                                                                    }}
                                                                    customError={BU_NAME_EXISTS}
                                                                    placeholder={'Business unit'}
                                                                    extraPayload={{
                                                                        clientId: _get(state, 'clientId', 0),
                                                                    }}
                                                                    maxLength={MAX_LENGTH25}
                                                                    fromCompanies={fromCompanies}
                                                                />
                                                            </Col>
                                                            <Col md={3} id="rs_CompanyInfo_selectIndustry">
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    name={`bus[${index}].SelectIndustry`}
                                                                    data={industryList}
                                                                    disabled
                                                                    textField="industryName"
                                                                    required
                                                                    dataItemKey={'industryID'}
                                                                    label={'Industry'}
                                                                    rules={{
                                                                        required: SELECT_INDUSTRY,
                                                                    }}
                                                                    //disabled={businessTypeListBuDisable}
                                                                />
                                                            </Col>

                                                            <Col md={2} id="rs_CompanyInfo_SelectBUType">
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    name={`bus[${index}].SelectBUType`}
                                                                    data={businessTypeListBu}
                                                                    textField="businessType"
                                                                    required
                                                                    disabled={businessTypeListBuDisable}
                                                                    dataItemKey={'businessTypeID'}
                                                                    label={'Type'}
                                                                    handleChange={({ value }) => {
                                                                        setValue(
                                                                            `bus[${index}].SelectBrandPosition`,
                                                                            '',
                                                                        );
                                                                        const data = getBrandPositionsByClientType(
                                                                            value?.businessTypeID,
                                                                        );
                                                                        setBrandPosition((prev) => ({
                                                                            ...prev,
                                                                            [value?.businessTypeID]: data,
                                                                        }));
                                                                    }}
                                                                    rules={{
                                                                        required: SELECT_BUSINESS_TYPE,
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col
                                                                md={3}
                                                                id={
                                                                    (isAgency || isEnterprisePlus) && isAccountSettings
                                                                        ? 'rs_CompanyInfo_SelectBrandPositon'
                                                                        : 'rs_Companies_SelectBrandPositon'
                                                                }
                                                            >
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    name={`bus[${index}].SelectBrandPosition`}
                                                                    data={
                                                                        brandPosition?.[
                                                                            businessUnitWatch?.[index]?.SelectBUType
                                                                                ?.businessTypeID
                                                                        ] ??
                                                                        getBrandPositionsByClientType(
                                                                            businessUnitWatch?.[index]?.SelectBUType
                                                                                ?.businessTypeID,
                                                                        )
                                                                    }
                                                                    textField="brandPositionName"
                                                                    required
                                                                    // disabled
                                                                    dataItemKey={'brandPositionID'}
                                                                    label={'Brand position'}
                                                                    rules={{
                                                                        required: SELECT_BUSINESS_POSITION,
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col
                                                                md={1}
                                                                className="pl0 position-relative left2 brandPositionAdd"
                                                            >
                                                                <div className="d-flex mt6 justify-content-end">
                                                                    <RSTooltip
                                                                        text={'Lock'}
                                                                        position="top"
                                                                        className="lh0"
                                                                    >
                                                                       <div className='pe-none click-off'>
                                                                         <i
                                                                            onClick={() => {
                                                                                if(!isLock){
                                                                                    setBuLock({
                                                                                        show: true,
                                                                                        index: index
                                                                                    })
                                                                                }else{
                                                                                    setValue(
                                                                                        `bus[${index}].isLock`,
                                                                                        false, { shouldDirty: true }
                                                                                    );
                                                                                }
                                                                                // setValue(
                                                                                //     `bus[${index}].isLock`,
                                                                                //     !isLock,
                                                                                // );
                                                                                // handleUpdateBULock(field, index);
                                                                            }}
                                                                            className={`${
                                                                                lock_medium
                                                                            } icon-md cp ${
                                                                                isLock ? 'color-primary-green' : ''
                                                                            } `}
                                                                            id="rs_CompanyInfo_Lock"
                                                                        ></i>
                                                                       </div>
                                                                    </RSTooltip>
                                                                    {/* <RSTooltip text={'Share'} position="top">
                                                                <i
                                                                    onClick={() => {
                                                                        dispatch(
                                                                            getShareBUDatas({
                                                                                departmentId,
                                                                                userId,
                                                                                clientId,
                                                                            }),
                                                                        );
                                                                        setBrandPosition(data);
                                                                    }}
                                                                    className={`${settings_medium} ${field?.isLock ? 'click-off' : ''
                                                                        } icon-md cp color-primary-blue`}
                                                                ></i>
                                                            </RSTooltip> */}
                                                                    <RSTooltip
                                                                        text={index === 0 ? 'Add' : 'Delete'}
                                                                        position="top"
                                                                        className="lh0 ml5"
                                                                    >
                                                                        <div
                                                                            className={`icon-md cp ${
                                                                                fields?.length >= allowedBULength &&
                                                                                index == 0
                                                                                    ? 'pe-none click-off'
                                                                                    : ''
                                                                            } ${
                                                                                field?.isEdit && index > 0
                                                                                    ? 'pe-none click-off'
                                                                                    : ''
                                                                            } 
                                                                            ${
                                                                                !addAccess && index === 0
                                                                                    ? 'pe-none click-off'
                                                                                    : ''
                                                                            }
                                                                            `}
                                                                        >
                                                                            <i
                                                                                onClick={() => {
                                                                                    if (index === 0) {
                                                                                        let validationState =
                                                                                            businessUnitWatch.findIndex(
                                                                                                (list) => {
                                                                                                    let values =
                                                                                                        Object.values(
                                                                                                            list,
                                                                                                        );
                                                                                                    return values.includes(
                                                                                                        '',
                                                                                                    );
                                                                                                },
                                                                                            );
                                                                                        if (validationState === -1) {
                                                                                            handleBusUnits();
                                                                                        } else {
                                                                                            // remove(index);
                                                                                            trigger('bus');
                                                                                        }
                                                                                    } else {
                                                                                        remove(index);
                                                                                    }
                                                                                }}
                                                                                className={`${selectIcon(
                                                                                    index,
                                                                                )} icon-md cp
                                                                            `}
                                                                            ></i>
                                                                        </div>
                                                                    </RSTooltip>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                );
                                            })}
                                        </Fragment>
                                    )}
                                </Fragment>
                            )}
                        </Col>
                    </Row>
                </div>
                <div className="buttons-holder">
                    {!needBus && <RSSecondaryButton
                        onClick={() => {
                            if (isSaveClientLoading) return;
                            resetCompanyForm();
                            dispatch(resetNewCompanyData());
                            dispatch(resetCompaniesReducer());
                            if (fromUpgrade) navigate('/preferences/license-info');
                            else if (isAccountSettings) navigate('/preferences');
                            else navigate('/preferences/company-list');
                        }}
                        blockInteraction={isSaveClientLoading}
                        id="rs_CompanyInfo_cancel"
                    >
                        {/* {(isAccountSettings && isNextAccountSettings) || (!isAccountSettings) ? 'Cancel' : 'Back'} */}
                        {CANCEL}
                    </RSSecondaryButton>}
                    {/* {void 0} */}

                    {(isAccountSettings && isNextAccountSettings) || !isAccountSettings ? (
                        <>
                            {mode !== 'create' && (
                                <RSSecondaryButton
                                    className={`color-primary-blue`}
                                    // type="submit"
                                    onClick={() => {
                                        if (isSaveClientLoading) return;
                                        handleSubmit((data) => handleFormSubmit(data, true))();
                                    }}
                                    isLoading={isUpdateSaveLoading}
                                    id="rs_CompanyInfo_updatebrand"
                                    disabledClass={`${
                                        mode === 'edit' && businessType?.businessTypeID === 3
                                            ? ''
                                            : Object.keys(errors)?.length === 0 && isBrandPosition && isDirty
                                            ? ''
                                            : 'pe-none click-off'
                                    } ${updateAccess ? '' : 'pe-none click-off'}`}
                                >
                                    {mode === 'edit' ? UPDATE : SAVE}
                                </RSSecondaryButton>
                            )}
                            <RSPrimaryButton
                                // type="submit"
                                onClick={() => {
                                    if (isSaveClientLoading) return;
                                    handleSubmit((data) => handleFormSubmit(data))();
                                }}
                                isLoading={isNextSaveLoading}
                                blockBodyPointerEvents={isNextSaveLoading}
                                className="ml15"
                                disabledClass={`${
                                    mode === 'edit' && businessType?.businessTypeID === 3
                                        ? ''
                                        : Object.keys(errors)?.length === 0 && isBrandPosition
                                        ? ''
                                        : 'pe-none click-off'
                                }`}
                                id="rs_CompanyInfo_Next"
                            >
                                {(isAccountSettings && isNextAccountSettings) || !isAccountSettings
                                    ? NEXT
                                    : SAVE}
                            </RSPrimaryButton>
                        </>
                    ) : (
                        <RSPrimaryButton
                            onClick={() => {
                                if (isSaveClientLoading) return;
                                handleSubmit((data) => handleFormSubmit(data, true))();
                            }}
                            isLoading={isUpdateSaveLoading}
                            blockBodyPointerEvents={isUpdateSaveLoading}
                            id="rs_CompanyInfo_update"
                            disabledClass={updateAccess && isDirty ? '' : 'pe-none click-off'}
                        >
                            {mode === 'edit' ? UPDATE : SAVE}
                        </RSPrimaryButton>
                    )}
                </div>
                <RSModal
                    show={isShow.show}
                    handleClose={() => setIsShow({ show: false, buId: '' })}
                    header={SHARE_BUSINESS_UNITS}
                    body={
                        <>
                            <RSKendoDropDownList
                                control={control}
                                name={'shareBU'}
                                data={shareBus}
                                textField="departmentName"
                                required
                                dataItemKey={'departmentID'}
                                rules={{
                                    required: THIS_FIELD_IS_REQUIRED,
                                }}
                            />
                        </>
                    }
                    footer={<RSPrimaryButton onClick={() => handleShareBU()}>{OK}</RSPrimaryButton>}
                />
                {buLock?.show && <RSConfirmationModal
                    show={buLock?.show}
                    text={SHARING_BUS}
                    primaryButtonText={CONTACT_ADMIN}
                    handleConfirm={() => {
                        setBuLock({
                            show: false,
                            index: null,
                        });
                        setValue(
                            `bus[${buLock?.index}].isLock`,
                            true, { shouldDirty: true }
                        );
                        showToast(REQUEST_SENT, null, null, false);
                    }}
                    handleClose={() => {
                        setBuLock({
                            show: false,
                            index: null,
                        });
                    }}
                    secondaryButtonText={CANCEL}
                    header={PERMISSION_REQUIRED}
                />}
                <RSConfirmationModal
                    show={show}
                    text={YOU_HAVE_ALREADY_CREATED}
                    primaryButtonText={OK}
                    handleConfirm={() => {
                        setShow(false);        
                    }}
                    secondaryButton={false}
                />
                <RSConfirmationModal
                    show={HQModal.show}
                    text={ARE_YOU_SURE_WANT_TO_CHANGE}
                    primaryButtonText={OK}
                    handleConfirm={() => {
                        changeHQ(HQModal.id);
                        //
                    }}
                    handleClose={() => {
                        setHQModal({ show: false, id: 0 });
                    }}
                    // secondaryButton={false}
                />
                {getWarningPopupMessage(failureApiErrors, dispatch)}
            <input
                type="file"
                ref={fileInputRef}
                accept=".png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={handleNativeFileChange}
            />
            {imageModalState.show && imageModalState.tempImageData && (
                <RSModal
                    show={imageModalState.show}
                    header="Edit company logo"
                    size="md"
                    handleClose={handleModalClose}
                    body={
                        <div className="image-upload-crop-container">
                            <ImageCropModal
                                imageSrc={imageModalState.tempImageData}
                                onCropComplete={handleCropComplete}
                                onCancel={handleModalClose}
                                aspectRatio={1}
                                cropShape="round"
                                showGrid={true}
                                height="250px"
                                setTempImageData={setTempImageData}
                                setShowFileUpload={() => {
                                    handleModalClose();
                                    triggerUpload();
                                }}
                                setValue={setValue}
                            />
                        </div>
                    }
                />
            )}
            </form>
            </PreferencesSubPageSkeletonGate>
        </FormProvider>
    );
};
export default CompanyInfo;
