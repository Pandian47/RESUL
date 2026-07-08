import { encryptWithAES, getPermissions, getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { DATE_FORMAT as DATE_FORMAT_MSG, ENTER_HOURS, SELECT_CURRENCY, SELECT_LANGUAGE, SELECT_TIMEZONE } from 'Constants/GlobalConstant/ValidationMessage';
import { ALERT, ANALYTICS_CALCULATIONS_SETUP, ASSOCIATES, BACK, BYCOST, CANCEL, CHANNEL_PRIORITIZATION, COMMUNICATION_LINK, COMMUNICATION_REFERENCE, COMMUNICATION_TYPES, CONVERSION, CONVERSION_TYPES, CURRENCY, DATE_FORMAT, DAYLIGHT_SAVINGS, ENGAGEMENT, ENTER_KEYWORDS, EVENT_TRIGGER, HOURS, JOB_SERVICE, LANGUAGE, LOCALIZATION_SETTINGS, MAX_WAVES, MULITI_COMMUNICATION_SETUP, MULTI_DIMENSION, NO_DATA_AVAILABEL, OFFER_TYPES, OK, PREFERED_REGION, PRODUCT_TYPES, PROPENSITY, RESUL_IO, RESUL_MAILER, SAVE, SINGLE_DIMENSION, SMART_LINK, SUB_PRODUCT_TAGS, TIME_FORMAT, TIME_ZONE, UP_TO_10PRODUCT } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { find as _find, get as _get, isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTagsComponent from 'Components/RSTagsComponent';
import RSInput from 'Components/FormFields/RSInput';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSSwitch from 'Components/FormFields/RSSwitch';

import { WAVES, REACH, INITIAL_WATCH_STATE, INITIAL_STATE } from '../../../constants';
import { getCountryCoordinates } from 'Reducers/login/newUser/request';
import { getActiveDSTTimezones } from 'Reducers/globalState/request';
import usePermission from 'Hooks/usePersmission';
import { getCompanySettingsDetails, updateLocalization } from 'Reducers/preferences/Companies/request';
import { analyticsCalculationSetup, conversionTypes, getFieldValue, normalizeToArray } from './Constant';

import { getSessionId } from 'Reducers/globalState/selector';
import RSModal from 'Components/RSModal';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';

import CacheManager from 'Utils/cacheManager';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
const { currencyMasterList, dateFormatList, timeFormatList, timeZoneList, languageMasterList, regionList } =
    getmasterData() || {};

const isPreferencesApiSuccess = (status) =>
    status === true || status === 1 || status === 'true' || status === 'True';

const getLocalizationResponseData = (response) => response?.data ?? response;

const isEmptyLocalizationData = (data) => {
    if (!data || typeof data !== 'object') return true;

    const clientInfo = data.clientinfo ?? data.clientInfo;
    const hasClientFields =
        clientInfo &&
        typeof clientInfo === 'object' &&
        [
            clientInfo.currencyId,
            clientInfo.languageId,
            clientInfo.dateFormatID,
            clientInfo.dateFormatId,
            clientInfo.timeformatId,
            clientInfo.timeZoneId,
            clientInfo.regionalStructure,
        ].some((value) => value != null && value !== '');

    if (hasClientFields) return false;

    const listKeys = [
        'productCategories',
        'subCategories',
        'offerTypes',
        'communicationReference',
        'subscriptionCategory',
        'campaignAttributes',
        'analyticsCalculation',
        'multidimensionCampaignsetup',
        'jobServicesExecution',
    ];

    const hasListData = listKeys.some((key) => {
        const value = data[key];
        if (Array.isArray(value)) return value.length > 0;
        return value != null && typeof value === 'object' && Object.keys(value).length > 0;
    });

    return !hasListData;
};

const LocalizationSettings = ({ back, isAgencyValue = false, companies }) => {
    const { userId, departmentId, clientId, parentClientId, isAgency } = useSelector((state) => getSessionId(state));
    const { localizationSettings, clientDetails, Country } = useSelector(({ companiesReducer }) => companiesReducer);
    const { failureApiErrors, company_departmentId, company_clientId, currentPageConfig } = useSelector(({ globalstate }) => globalstate);
    // console.log('localizationSettings, clientDetails, Country: ', localizationSettings, clientDetails, Country);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTimeZones, setActiveTimeZones] = useState([]);

    useEffect(() => {
        const fetchActiveTimeZones = async () => {
            const response = await dispatch(getActiveDSTTimezones(false));
            if (response?.status) {
                setActiveTimeZones(response?.data?.timezones || []);
            }
        };

        fetchActiveTimeZones();
    }, [dispatch]);

    const currentTimeZones = activeTimeZones.length > 0 ? activeTimeZones : timeZoneList;
    const { state } = !_isEmpty(currentPageConfig) ? currentPageConfig : location || {};
    const isAccountSettings = useLocation()?.pathname?.split('/')?.pop() === 'account-settings';
    const { control, handleSubmit, watch, reset, setValue } = useForm({
        mode: 'onChange',
        defaultValues: INITIAL_STATE,
    });
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const permissionList = getPermissions();
    const { viewAccess: userViewAccess } = _find(permissionList, { featureId: 12 });
    // console.log('state://////////////', state);
    const isEnterprise = clientDetails?.licenseTypeId || state?.licenseTypeId === 3;
    const [reach = {}, engagement = {}, engagementTags, isCommunicationReference] = watch(INITIAL_WATCH_STATE);
    // const [locationTypeWatch] = watch(['locationType']);
    const [productCategories, setProductCategories] = useState({ show: false, popupSettings: {} });
    const [subProductTags, setSubProductTags] = useState([]);
    const [modal, setModal] = useState(false);
    const [errorModal, setErrorModal] = useState({
        status: false,
        message: '',
    });
    const mode = _get(state, 'mode', 'create');
    useEffect(() => {
        (async function () {
            const countryID = _get(Country, 'countryID', 0);
            const stateID =
                _get(Country, 'stateID', 0) ??
                _get(clientDetails, 'stateID', 0) ??
                _get(clientDetails, 'stateId', 0) ??
                0;
            0;

            if (!countryID) return;

            await dispatch(getCountryCoordinates({ countryID, stateID }, { loading: false }));
        })();
    }, []);

    // useEffect(() => {
    //     if (locationTypeWatch) {
    //         setValue('defaultDaylight', locationTypeWatch.isDayLight || false);
    //     }
    // }, [locationTypeWatch, setValue]);

    const localizationClientId = isAgencyValue
        ? parentClientId
        : companies
        ? company_clientId?.clientId
        : clientId;

    const canFetchLocalization = Boolean(localizationClientId && userId);

    const localizationApi = usePreferencesSubPageApi({
        enabled: canFetchLocalization,
        deps: [localizationClientId, userId],
        fetcher: async () => {
            const payload = {
                departmentId: 0,
                userId,
                clientId: localizationClientId,
            };
            const response = await dispatch(
                getCompanySettingsDetails({ payload, loading: false, isFailureCheck: false }),
            );
            const data = getLocalizationResponseData(response);
            if (!isPreferencesApiSuccess(response?.status) || isEmptyLocalizationData(data)) {
                throw new Error(response?.message || NO_DATA_AVAILABEL);
            }
            return response;
        },
    });

    const updateLocalizationApi = useApiLoader({ autoFetch: false });
    const isSaveLocalizationLoading = updateLocalizationApi.isFetching;

    const showLocalizationNoData = canFetchLocalization && localizationApi.isError;
    const showLocalizationSkeleton = !canFetchLocalization || localizationApi.isPageLoading || showLocalizationNoData;
    const clientBranchTypeId = clientDetails?.clientBranchTypeId;
    const getData = (key) => getFieldValue(localizationSettings, key);
    const clientInfo = getData('clientinfo');
    const [allSubProductTags, setAllSubProductTags] = useState(getData('subCategories'));
    useEffect(() => {
        setAllSubProductTags(getData('subCategories'));
    }, [localizationSettings]);

    useEffect(() => {
        if (!localizationApi.isSuccess || localizationApi.isError) return;

        const preferredRegions =
            Object.keys(clientInfo)?.length && clientInfo?.regionalStructure !== ''
                ? clientInfo?.regionalStructure
                    ?.split(',')
                    ?.map((region) => _find(regionList, ['regionName', region]))
                    ?.filter(Boolean)
                : [];
        const currencyType = _find(currencyMasterList, ['currencyID', clientInfo?.currencyId]);
        const dateFormat = _find(dateFormatList, ['dateFormatID', clientInfo?.dateFormatID]) || _find(dateFormatList, ['dateFormatID', 4]);
        const language = _find(languageMasterList, ['languageID', clientInfo?.languageId]);
        const hours = _find(timeFormatList, ['timeFormatID', clientInfo?.timeformatId]);
        const locationType = _find(currentTimeZones, ['timeZoneID', clientInfo?.timeZoneId]);
        const defaultDaylight = clientInfo?.isDaylight;
        const smartLink = getData('smartLink')?.smartlinkname;
        const communicationLink = getData('customCommunicationLink')?.communicationLinkname;
        const jobServicesExecution = getData('jobServicesExecution');
        const firstItem = Array.isArray(jobServicesExecution) && jobServicesExecution.length > 0 ? jobServicesExecution[0] : {};
        const { singleDimension = 0, multiDimension = 0, eventTrigger = 0 } = firstItem;
        const analyticsCalculation = getData('analyticsCalculation');
        let { reach, engagement, conversion } = analyticsCalculation;
        if (reach) {
            reach = analyticsCalculationSetup[reach] || [];
            engagement = analyticsCalculationSetup[engagement] || [];
            conversion = analyticsCalculationSetup[conversion] || [];
        }
        const { numberofWaves, channelPrioritizationId } = getData('multidimensionCampaignsetup');
        const waves = _find(WAVES, ['titleId', numberofWaves]);
        const prioritization = channelPrioritizationId === 1 ? PROPENSITY : BYCOST;

        reset((state) => ({
            ...state,
            preferredRegions,
            currencyType,
            dateFormat,
            language,
            hours,
            locationType,
            smartLink,
            singleDimension,
            multiDimension,
            eventTrigger,
            reach,
            engagement,
            conversion,
            waves,
            prioritization,
            communicationLink,
            defaultDaylight,
            productTags: getData('productCategories'),
            subscriptionTag: getData('subscriptionCategory'),
        }));
    }, [localizationSettings, localizationApi.isSuccess, localizationApi.isError]);

    const onUpdate = async (e) => {
        e.preventDefault();
        const data = watch();
        const payload = {
            timeFormatId: data?.hours?.timeFormatID,
            dateFormatId: data?.dateFormat?.dateFormatID,
            timeZoneId: data?.locationType?.timeZoneID,
            userId,
            departmentId: 0,
            clientId: isAgency ? parentClientId : _get(clientDetails, 'clientId', clientId),
            reach: data?.reach?.titleId,
            engagement: data?.engagement?.titleId,
            conversion: data?.conversion?.titleId,
            target: 1,
            UpdateLocalizations: handleLocationTagsData(data?.productTags),
            subCategory: getAllSubCategoryData(allSubProductTags, data?.productTags),
            subscriptionCategory: handleSubscriptionTagsData(data?.subscriptionTag),
            multidimensionCampaign: [
                {
                    channelPrioritizationId: data.prioritization === 'By propensity' ? 1 : 2,
                    numberofWaves: data?.waves?.titleId,
                },
            ],
            jobServices: [
                {
                    singleDimension: data?.singleDimension,
                    multiDimension: data?.multiDimension,
                    eventTrigger: data?.eventTrigger,
                },
            ],
            analyticsCal: [
                {
                    reach: data?.reach?.titleId,
                    engagement: data?.engagement?.titleId,
                    conversion: data?.conversion?.titleId,
                },
            ],
        };
        const res = await updateLocalizationApi.refetch({
            fetcher: () =>
                dispatch(
                    updateLocalization(payload, navigate, clientBranchTypeId, isAccountSettings, false),
                ),
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD },
            mode: 'create',
        });
        if (res?.status && company_clientId?.clientId === clientId) {
            const userDetails = getUserDetails();
            const userInfo = {
                ...userDetails,
                dateFormatId: data?.dateFormat?.dateFormatID,
                timeFormatId: data?.hours?.timeFormatID,
                timeZoneId: data?.locationType?.timeZoneID,
                timezoneName: data?.locationType?.timeZoneName,
            };
            localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
            CacheManager.set('userDetails', userInfo);
        }
        if (!res?.status) {
            setErrorModal({
                status: true,
                message: res?.message || 'Update localization settings failed.',
            });
        }
    };
    // console.log('state://////////////', subProductTags);

    const getAllSubCategoryData = (allSub, productTags) => {
        const filteredItems = allSub
            .filter((tag) => productTags.some((category) => category.categoryId === tag.categoryID))
            .map((item) => ({
                subCategoryId: item?.subCategoryID,
                categoryId: item?.categoryID,
                subCategoryName: item?.subCategoryName,
            }));
        return filteredItems;
    };
    const handleLocationTagsData = (tags) => {
        const previousTags = getData('productCategories');
        const updateTags = tags?.map((tag) => {
            const matchedPreTag = previousTags?.find((preTag) => tag?.categoryName === preTag?.categoryName);
            return matchedPreTag ? { ...(tag || '') } : { categoryId: 0, categoryName: tag?.categoryName || '' };
        });

        return updateTags?.length ? updateTags : previousTags;
    };

    const handleSubscriptionTagsData = (tags) => {
        if (!tags) return getData('subscriptionCategory') || [];
        const previousTags = getData('subscriptionCategory') || [];
        return tags.map((tag) => {
            const matchedPreTag = previousTags?.find(
                (preTag) => tag?.subscriberCategoryname?.trim()?.toLowerCase() === preTag?.subscriberCategoryname?.trim()?.toLowerCase()
            );
            return matchedPreTag
                ? {
                    subscriberCategoryId: matchedPreTag.subscriberCategoryId,
                    subscriberCategoryname: matchedPreTag.subscriberCategoryname,
                }
                : {
                    subscriberCategoryId: 0,
                    subscriberCategoryname: tag?.subscriberCategoryname || '',
                };
        });
    };

    const getSubCategoryData = (tag, allTags) => {
        return normalizeToArray(allTags).filter((item) => item?.categoryID === tag?.categoryId);
    };
    useEffect(() => {
        const data = getSubCategoryData(productCategories.popupSettings, allSubProductTags);
        setSubProductTags(data);
    }, [productCategories?.show]);
    const [newTags, setNewTags] = useState([]);
    const [removedTags, setRemovedTags] = useState({
        isRemove: false,
        removedTag: [],
    });
    return (
        <PreferencesSubPageSkeletonGate
            variant={PREFERENCES_SUBPAGE_VARIANT.COMPANY_LOCALIZATION}
            isLoading={showLocalizationSkeleton}
            showNoData={showLocalizationNoData}
            ariaLabel="Loading localization settings"
        >
        <Fragment>
            {/* onSubmit={handleSubmit(onUpdate)} */}
            <form >
                <div className="box-design rs-box accountsetup-contact-info py30">
                    <Row>
                        {' '}
                        <h4 className="mb30">{LOCALIZATION_SETTINGS}</h4>
                    </Row>
                    <Row className='d-flex align-items-end'>
                        {isEnterprise && (
                            <Col sm={6} xs={6}>
                                <div className="form-group mt4" id="rs_LocalizationSettings_Preferredregions">
                                    <RSMultiSelect
                                        control={control}
                                        placeholder={PREFERED_REGION}
                                        allowCustom
                                        textField={'regionName'}
                                        dataItemKey={'regionID'}
                                        name={'preferredRegions'}
                                        data={regionList ?? []}
                                        label={PREFERED_REGION}
                                        disabled
                                    />
                                    {/* <span>
                                <RSCheckbox
                                    className="smaller"
                                    name={'defaultRegions'}
                                    control={control}
                                    value={EDITDATA.defaultRegions}
                                    labelName={'Insert the default regions'}
                                />
                            </span> */}
                                </div>
                            </Col>
                        )}
                        <Col sm={6} xs={6}>
                            <div className="form-group" id="rs_LocalizationSettings_currencyType">
                                <RSKendoDropDownList
                                    name={'currencyType'}
                                    data={currencyMasterList}
                                    control={control}
                                    required
                                    disabled
                                    textField={'currencyName'}
                                    dataItemKey={'currencyID'}
                                    label={CURRENCY}
                                    rules={{
                                        required: SELECT_CURRENCY,
                                    }}
                                />
                            </div>
                        </Col>
                        <Col sm={6} xs={6}>
                            <div className="form-group" id="rs_LocalizationSettings_dateFormat">
                                <RSKendoDropDownList
                                    name={'dateFormat'}
                                    data={dateFormatList}
                                    control={control}
                                    required
                                    textField={'dateformat'}
                                    dataItemKey={'dateFormatID'}
                                    label={DATE_FORMAT}
                                    rules={{
                                        required: DATE_FORMAT_MSG,
                                    }}
                                />
                            </div>
                        </Col>
                        <Col sm={6} xs={6}>
                            <div className="form-group" id="rs_LocalizationSettings_language">
                                <RSKendoDropDownList
                                    name={'language'}
                                    data={languageMasterList}
                                    control={control}
                                    required
                                    disabled
                                    textField={'languageName'}
                                    dataItemKey={'languageID'}
                                    label={LANGUAGE}
                                    rules={{
                                        required: SELECT_LANGUAGE,
                                    }}
                                />
                            </div>
                        </Col>
                        <Col sm={6} xs={6}>
                            <div className="form-group" id="rs_LocalizationSettings_timeformatList">
                                <RSKendoDropDownList
                                    name={'hours'}
                                    data={timeFormatList}
                                    control={control}
                                    required
                                    textField={'timeformat'}
                                    dataItemKey={'timeFormatID'}
                                    label={TIME_FORMAT}
                                    rules={{
                                        required: ENTER_HOURS,
                                    }}
                                />
                            </div>
                        </Col>
                        <Col sm={6} xs={6}>
                            <div className="form-group" id="rs_LocalizationSettings_timeZoneList">
                                <RSKendoDropDownList
                                    name={'locationType'}
                                    data={currentTimeZones}
                                    control={control}
                                    required
                                    textField={'timeZoneName'}
                                    dataItemKey={'timeZoneID'}
                                    label={TIME_ZONE}
                                    rules={{
                                        required: SELECT_TIMEZONE,
                                    }}
                                />
                                {/* <RSCheckbox
                                    className="smaller"
                                    id="rs_LocalizationSettings_Daylightsaving"
                                    name={'defaultDaylight'}
                                    control={control}
                                    disabled
                                    // value={clientInfo?.isDaylight}
                                    labelName={DAYLIGHT_SAVINGS}
                                /> */}
                            </div>
                        </Col>
                    </Row>
                    {(isAgencyValue === undefined || !isAgencyValue) && (
                        <>
                            <Row>
                                <Col sm={6} xs={6}>
                                    {/* <h4 className="mb15">{COMMUNICATION_TYPES}</h4> */}
                                    <div className="form-group">
                                        <RSTagsComponent
                                            headerText={COMMUNICATION_TYPES}
                                            isShowHeader={true}
                                            placeholder={ENTER_KEYWORDS}
                                            tags={getData('campaignAttributes')}
                                            id="rs_LocalizationSettings_communicationtypes"
                                            size={10}
                                            disabled
                                            isObject
                                            fieldItemKey={'attributeName'}
                                            tagsBig
                                            isLocalization
                                            updatedTags={(tags) => setValue('communicationTag', tags)}
                                            customTagClass='rs-tags-wrapper-scroll rs-tag-custom-height'
                                        />
                                        {/* <small className="mr25 mt5">Maximum of 10 communication types can be added</small> */}
                                    </div>
                                </Col>
                                <Col sm={6} xs={6}>
                                    {/* <h4 className="mb15">{CONVERSION_TYPES}</h4> */}
                                    <div className="form-group">
                                        <div className="rs-tags-multiple rstm-small p0 border-r7 border ">
                                            {/* <h6>{ENGAGEMENT}</h6> */}
                                            <RSTagsComponent
                                                isShowHeader={true}
                                                headerText={CONVERSION_TYPES}
                                                multiHeaderText={ENGAGEMENT}
                                                //placeholder={'Engagement'}
                                                tags={getData('engagementTypes')}
                                                // id="rs_LocalizationSettings_EngagemnetTag"
                                                size={5}
                                                disabled
                                                // cssScrollbar
                                                isObject
                                                fieldItemKey={'typeName'}
                                                isLocalization
                                                updatedTags={(tags) => setValue('engagementTag', tags)}
                                                customTagClass='rs-tags-wrapper-scroll'
                                                noBorder ={true}
                                            />
                                            {/* <h6>{CONVERSION}</h6> */}
                                            <RSTagsComponent
                                                //placeholder={'Conversion'}
                                                tags={getData('conversionTypes')}
                                                multiHeaderText={CONVERSION}
                                                name={'conversionTag'}
                                                id="rs_LocalizationSettings_ConversionTag"
                                                size={10}
                                                disabled
                                                isObject
                                                // cssScrollbar
                                                fieldItemKey={'typeName'}
                                                isLocalization
                                                updatedTags={(tags) => setValue('conversionTag', tags)}
                                                customTagClass='rs-tags-wrapper-scroll'
                                                noBorder ={true}
                                            />
                                        </div>
                                        {/* <small className="mr25 mt5">Maximum of 10 conversion types can be added</small> */}
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={6} xs={6}>
                                    {/* <h4 className="mb15">{PRODUCT_TYPES}</h4> */}
                                    <div className="form-group">
                                        <RSTagsComponent
                                            showDeleteWarnig={true}
                                            tagWarningKey={'connected'}
                                            tagWarningText={'This Product/Sub Product Type is currently used in active Communications or Analytics. It cannot be removed until the related Communication or Analytics status is changed to Completed.'}
                                            isShowHeader={true}
                                            headerText={PRODUCT_TYPES}
                                            placeholder={ENTER_KEYWORDS}
                                            id="rs_LocalizationSettings_productCategories"
                                            tags={getData('productCategories')}
                                            size={10}
                                            isObject
                                            returnObj
                                            tagsBig
                                            ignoreLength
                                            isRefresh={true}
                                            isDisabledRemove
                                            // disabled={true}
                                            fieldItemKey={'categoryName'}
                                            isLocalization
                                            onTagClick={(name) => {
                                                const previousTags = getData('productCategories');
                                                const matchedPreTag = previousTags?.find(
                                                    (preTag) => name?.categoryName === preTag?.categoryName,
                                                );
                                                if (matchedPreTag !== undefined) {
                                                    setProductCategories({
                                                        show: true,
                                                        popupSettings: matchedPreTag,
                                                    });
                                                } else {
                                                    setModal(true);
                                                }
                                            }}
                                            updatedTags={(tags) => {
                                                const previousTags = getData('productCategories');
                                                const updateTags = tags?.map((tag) => {
                                                    const matchedPreTag = previousTags?.find(
                                                        (preTag) => tag?.categoryName === preTag?.categoryName,
                                                    );
                                                    return matchedPreTag
                                                        ? { ...(matchedPreTag || '') }
                                                        : { categoryId: 0, categoryName: tag?.categoryName || '' };
                                                });

                                                setValue('productTags', updateTags);
                                            }}
                                            removedTags={(tag) => {
                                                //debugger
                                                // const updatedTags = allSubProductTags?.filter((item) => item?.categoryID !== tag?.categoryId)
                                                // console.log('updatedTags: ', updatedTags);
                                                // setAllSubProductTags(updatedTags)
                                            }}
                                            customTagClass='rs-tags-wrapper-scroll'
                                        />
                                        {/* <small className="mr25">{UP_TO_10PRODUCT}</small> */}
                                    </div>
                                </Col>
                                <Col sm={6} xs={6}>
                                    {/* <h4 className="mb15">{OFFER_TYPES}</h4> */}
                                    <div className="form-group">
                                        <RSTagsComponent

                                            isShowHeader={true}
                                            headerText={OFFER_TYPES}
                                            placeholder={ENTER_KEYWORDS}
                                            tags={getData('offerTypes')}
                                            id="rs_LocalizationSettings_offerTypes"
                                            disabled
                                            tagsBig
                                            isObject
                                            fieldItemKey="offerName"
                                            size={10}
                                            updatedTags={(tags) => setValue('offerTag', tags)}
                                            customTagClass='rs-tags-wrapper-scroll'
                                            isLocalization
                                        />
                                        {/* <small className="mr25 mt5">Maximum of 10 offer types can be added</small> */}
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={6} xs={6}>
                                    <div className="form-group">
                                        <RSInput
                                            disabled
                                            control={control}
                                            id="rs_LocalizationSettings_smartLink"
                                            name={'smartLink'}
                                            placeholder={SMART_LINK}
                                        />
                                        <small className="mr25">{RESUL_IO}</small>
                                    </div>
                                </Col>
                                <Col sm={6} xs={6}>
                                    <div className="form-group">
                                        <RSInput
                                            disabled
                                            control={control}
                                            name={'communicationLink'}
                                            id="rs_LocalizationSettings_communicationLink"
                                            placeholder={COMMUNICATION_LINK}
                                        />
                                        <small className="mr25">{RESUL_MAILER}</small>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={6} xs={6}>
                                    {isCommunicationReference && (
                                        <div className="form-group textbox-min-h">
                                            <RSTagsComponent
                                                headerText={COMMUNICATION_REFERENCE}
                                                isShowHeader
                                                customRender={
                                                    <RSSwitch
                                                        disabled
                                                        control={control}
                                                        id="rs_LocalizationSettings_isCommunicationReference"
                                                        name="isCommunicationReference"
                                                        defaultValue={!!isCommunicationReference}
                                                    />
                                                }
                                                hideTagsSection={!isCommunicationReference}
                                                placeholder={COMMUNICATION_TYPES}
                                                id="rs_LocalizationSettings_CommunicationReference"
                                                tags={getData('communicationReference')}
                                                size={5}
                                                disabled
                                                isObject
                                                fieldItemKey="columnValue"
                                                isLocalization
                                                updatedTags={(tags) => {
                                                    setValue('communicationRefferenceTag', tags);
                                                }}
                                                customTagClass="communication-reference-scroll"
                                            />
                                            {/* <small className="mr25 mt5">
                                        Maximum of 5 communication reference can be added
                                    </small> */}
                                        </div>)}
                                </Col>
                                <Col sm={6} xs={6}>
                                    <h4 className="mt15">{JOB_SERVICE}</h4>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={5} xs={6} className="text-left">
                                                <label className="control-label-left font-xsm">{SINGLE_DIMENSION}</label>
                                            </Col>
                                            <Col sm={7} xs={3}>
                                                <RSInput
                                                    type={'number'}
                                                    id="rs_LocalizationSettings_singleDimension"
                                                    disabled
                                                    control={control}
                                                    name={'singleDimension'}
                                                    placeholder={HOURS}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={5} xs={6} className="text-left">
                                                <label className="control-label-left font-xsm">{MULTI_DIMENSION}</label>
                                            </Col>
                                            <Col sm={7} xs={3}>
                                                <RSInput
                                                    type={'number'}
                                                    disabled
                                                    control={control}
                                                    id="rs_LocalizationSettings_multiDimension"
                                                    name={'multiDimension'}
                                                    placeholder={HOURS}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={5} xs={6} className="text-left">
                                                <label className="control-label-left font-xsm">{EVENT_TRIGGER}</label>
                                            </Col>
                                            <Col sm={7} xs={3}>
                                                <RSInput
                                                    type={'number'}
                                                    disabled
                                                    control={control}
                                                    name={'eventTrigger'}
                                                    id="rs_LocalizationSettings_eventTrigger"
                                                    placeholder={HOURS}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                {/* <Col sm={6} xs={6}>
                            {isCommunicationReference && (
                                <>
                                    <h4 className="mb15">Subscription category</h4>
                                    <div className="form-group">
                                        <RSTagsComponent
                                            placeholder={'Subscription types'}
                                            tags={getData('subscriptionCategory')}
                                            id="rs_LocalizationSettings_subscriptionCategory"
                                            size={5}
                                            disabled
                                            isObject
                                            fieldItemKey="subscriberCategoryname"
                                            updatedTags={(tags) => {
                                                setValue('subscriptionTag', tags);
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </Col> */}
                            </Row>
                        </>
                    )}
                    {/* <Row>
                    <Col sm={6} xs={6}>
                        <h4>Last mile associates</h4>
                        <div className="form-group">
                            <RSInput control={control} name={'associates'} placeholder={ASSOCIATES} />
                            <small className="mr25 mt5">Eg: Partners/Distributors</small>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col sm={6} xs={6}>
                        <h4>Tier Settings</h4>
                        <div className="form-group">
                            <RSTagsComponent
                                placeholder={'Tier Settings'}
                                tags={tierSettingsTags}
                                size={5}
                                updatedTags={(tags) => {
                                    setValue('tierSettingsTag', tags);
                                }}
                            />
                            <small className="mr25 mt5">Enter value with comma separator</small>
                        </div>
                    </Col>
                    <Col sm={6} xs={6}>
                        <h4>Zone settings</h4>
                        <div className="form-group">
                            <RSTagsComponent
                                placeholder={'Zone settings'}
                                tags={zoneTags}
                                size={5}
                                updatedTags={(tags) => {
                                    setValue('zoneTag', tags);
                                }}
                            />
                            <small className="mr25 mt5">Enter value with comma separator</small>
                        </div>
                    </Col>
                </Row> */}
                    {(isAgencyValue === undefined || !isAgencyValue) && (
                        <>
                            <Row>
                                <h4 className='MB15'>{ANALYTICS_CALCULATIONS_SETUP}</h4>
                                <div className="form-group">
                                    <Row>
                                        <Col sm={4} xs={4} id="rs_LocalizationSettings_Reach">
                                            <Row>
                                                {/* <span className="mb20">Reach %</span> */}
                                                <RSKendoDropDownList
                                                    name={'reach'}
                                                    data={REACH}
                                                    control={control}
                                                    textField={'title'}
                                                    dataItemKey={'titleId'}
                                                    label={'Reach %'}
                                                    handleChange={() => {
                                                        setValue('engagement', {});
                                                        setValue('conversion', {});
                                                    }}
                                                />
                                            </Row>
                                        </Col>
                                        <Col sm={4} xs={4} id="rs_LocalizationSettings_Engagement">
                                            <Row>
                                                {/* <span className="mb20">Engagement %</span> */}
                                                <RSKendoDropDownList
                                                    name={'engagement'}
                                                    data={[reach, { titleId: 4, title: 'By Reach' }]}
                                                    disabled={!Object.keys(reach)?.length}
                                                    control={control}
                                                    textField={'title'}
                                                    dataItemKey={'titleId'}
                                                    label={'Engagement %'}
                                                    handleChange={() => setValue('conversion', {})}
                                                />
                                            </Row>
                                        </Col>
                                        <Col sm={4} xs={4} id="rs_LocalizationSettings_Conversion">
                                            <Row>
                                                {/* <span className="mb20">Conversion %</span> */}
                                                <RSKendoDropDownList
                                                    name={'conversion'}
                                                    data={
                                                        engagement?.titleId !== 4
                                                            ? [engagement, ...conversionTypes]
                                                            : conversionTypes
                                                    }
                                                    disabled={!Object.keys(engagement)?.length}
                                                    control={control}
                                                    textField={'title'}
                                                    dataItemKey={'titleId'}
                                                    label={'Conversion %'}
                                                />
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                            </Row>
                            <Row>
                                <Col sm={7} xs={6}>
                                    <h4 className='mb15'>{MULITI_COMMUNICATION_SETUP}</h4>
                                    <div className="form-group">
                                        <Row className="align-items-end">
                                            <Col sm={5} xs={6} className="text-left">
                                                <label className="control-label-left font-xsm">
                                                    {CHANNEL_PRIORITIZATION}
                                                </label>
                                            </Col>
                                            <Col sm={7} xs={6} className="pl0">
                                                <ul className="rs-list-inline rli-space-5">
                                                    <li>
                                                        <RSRadioButton
                                                            control={control}
                                                            name="prioritization"
                                                            labelName={PROPENSITY}
                                                            id="rs_LocalizationSettings_prioritization"
                                                        />
                                                    </li>
                                                    <li>
                                                        <RSRadioButton
                                                            control={control}
                                                            name="prioritization"
                                                            labelName={BYCOST}
                                                            id="rs_LocalizationSettings_prioritization"
                                                        />
                                                    </li>
                                                </ul>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="form-group mb0">
                                        <Row>
                                            <Col sm={5} xs={6} className="text-left">
                                                <label className="control-label-left font-xsm">{MAX_WAVES}</label>
                                            </Col>
                                            <Col sm={5} xs={6} id="rs_LocalizationSettings_waves" className="pl0 pr3">
                                                <RSKendoDropDownList
                                                    name={'waves'}
                                                    data={WAVES}
                                                    control={control}
                                                    textField={'title'}
                                                    dataItemKey={'titleId'}
                                                    label={MAX_WAVES}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col sm={5} xs={6}>
                                    <h4 className="mb15">{JOB_SERVICE}</h4>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={5} xs={6} className="text-left">
                                                <label className="control-label-left font-xsm">{SINGLE_DIMENSION}</label>
                                            </Col>
                                            <Col sm={7} xs={3}>
                                                <RSInput
                                                    type={'number'}
                                                    id="rs_LocalizationSettings_singleDimension"
                                                    disabled
                                                    control={control}
                                                    name={'singleDimension'}
                                                    placeholder={HOURS}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={5} xs={6} className="text-left">
                                                <label className="control-label-left font-xsm">{MULTI_DIMENSION}</label>
                                            </Col>
                                            <Col sm={7} xs={3}>
                                                <RSInput
                                                    type={'number'}
                                                    disabled
                                                    control={control}
                                                    id="rs_LocalizationSettings_multiDimension"
                                                    name={'multiDimension'}
                                                    placeholder={HOURS}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={5} xs={6} className="text-left">
                                                <label className="control-label-left font-xsm">{EVENT_TRIGGER}</label>
                                            </Col>
                                            <Col sm={7} xs={3}>
                                                <RSInput
                                                    type={'number'}
                                                    disabled
                                                    control={control}
                                                    name={'eventTrigger'}
                                                    id="rs_LocalizationSettings_eventTrigger"
                                                    placeholder={HOURS}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </>
                    )}
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        type="button"
                        onClick={() => {
                            if (isSaveLocalizationLoading) return;
                            const screen = mode === 'edit' && userViewAccess ? 'ASSIGN_ROLE' : 'NEW_COMPANY';
                            back(screen)
                        }}
                        blockInteraction={isSaveLocalizationLoading}
                        id="rs_LocalizationSettings_back"
                    >
                        {BACK}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        disabledClass={` ${updateAccess ? '' : 'pe-none click-off'}`}
                        id="rs_LocalizationSettings_save"
                        onClick={onUpdate}
                        isLoading={isSaveLocalizationLoading}
                        blockBodyPointerEvents={isSaveLocalizationLoading}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </div>
            </form>
            {!showLocalizationNoData && getWarningPopupMessage(failureApiErrors, dispatch)}
            <RSModal
                show={productCategories.show}
                header={`${productCategories.popupSettings?.categoryName ?? ''} - Sub products`}
                handleClose={() => setProductCategories({ show: false, popupSettings: {} })}
                body={
                    <RSTagsComponent
                        placeholder={ENTER_KEYWORDS}
                        tags={subProductTags}
                        size={5}
                        isObject
                        isSubProductTypes
                        fieldItemKey={'subCategoryName'}
                        customTagClass={'chars30'}
                        isRefresh={false}
                        updatedTags={(tags) => {
                            const newTag = tags
                                .filter(
                                    (tag) =>
                                        !allSubProductTags.some(
                                            (existingTag) =>
                                                existingTag.subCategoryID === tag.subCategoryID &&
                                                existingTag.categoryID === tag.categoryID &&
                                                existingTag.subCategoryName === tag.subCategoryName,
                                        ),
                                )
                                .map((tag) => ({
                                    subCategoryName: tag?.subCategoryName,
                                    subCategoryID: 0,
                                    categoryID: productCategories.popupSettings?.categoryId,
                                }));
                            setNewTags(newTag);
                        }}
                        removedTags={(tags) => {
                            setRemovedTags((prev) => ({
                                ...prev,
                                isRemove: true,
                                removedTag: [...prev.removedTag, tags],
                            }));
                        }}
                    />
                }
                footer={
                    <>
                        <RSSecondaryButton onClick={() => setProductCategories({ show: false, popupSettings: {} })}>
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={() => {
                                setProductCategories({ show: false, popupSettings: {} });
                                const deletedTags = removedTags.isRemove
                                    ? allSubProductTags.filter(
                                        (tag) =>
                                            !removedTags.removedTag.some(
                                                (removedTag) =>
                                                    tag.subCategoryID === removedTag.subCategoryID &&
                                                    tag.categoryID === removedTag.categoryID &&
                                                    tag.subCategoryName === removedTag.subCategoryName,
                                            ),
                                    )
                                    : [];
                                if (removedTags.isRemove) {
                                    setAllSubProductTags((prevTags) => [...newTags, ...deletedTags]);
                                } else {
                                    setAllSubProductTags((prevTags) => [...prevTags, ...newTags, ...deletedTags]);
                                }
                                setNewTags([]);
                                setRemovedTags({
                                    isRemove: false,
                                    removedTag: [],
                                });
                            }}
                        >
                            {OK}
                        </RSPrimaryButton>
                    </>
                }
            />
            <WarningPopup
                customHeader={<>{ALERT} {'  '}</>}
                show={modal}
                showCancel={false}
                handleClose={() => setModal(false)}
                text={SUB_PRODUCT_TAGS}
                isPrimaryText={OK}
            />

            <WarningPopup
                customHeader={<>{ALERT} {'  '}</>}
                show={errorModal?.status}
                showCancel={false}
                handleClose={() =>
                    setErrorModal({
                        status: false,
                        message: '',
                    })
                }
                text={errorModal?.message}
                isPrimaryText={OK}
            />
        </Fragment>
        </PreferencesSubPageSkeletonGate>
    );
};

export default LocalizationSettings;
