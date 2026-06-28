import { UpdateState } from 'Utils/modules/misc';
import { isURLValid } from 'Utils/modules/dateTime';

import { WEBSITE_RULES } from 'Constants/GlobalConstant/Rules';
import { formatName } from 'Utils/modules/formatters';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { HTTPS_REGEX, MAXL_LENGTH2048, SMARTLINK_REGEX, WEBURL_REGEX } from 'Constants/GlobalConstant/Regex';
import { DOMAIN_URL as DOMAIN_URL_MSG, ENTER_ADAPTIVE, ENTER_DEVICE_TYPE, ENTER_VALID_DOMAIN, ENTER_VALID_URL, ENTER_VALID_WEBSITE, SELECT_APP_SCREEN, SELECT_MOBILE_APP, SELECT_SUB_APP_SCREEN } from 'Constants/GlobalConstant/ValidationMessage';
import { ADAPTIVE_URL, ADD_MOBILE_DEVICE, ALL, ANDROID, APP_SCREEN, CLOSE, COPIED_SUCCESSFULLY, DEEP_LINK, DEF_DEEP_LINKING, DELETE, DEVICE_TYPE, DOMAIN_URL, ENTER_AN_URL, ENTER_NEW_SUB_SCREEN, FRIENDLY_NAME, GENERATE, IOS, MOBILE_ADAPTIVE, MOBILE_APP, MOBILE_PLATFORM as MOBILE_PLATFORM_PH, MULTIPLE_PERSONALIZATIONS, PROCEED, REMOVE, SMART_URL, SUB_APP_SCREEN, URI_PARAMETER, URL_PARAMETER, URL_PERSONALIZATION, UTM_PARAMETER, WOULD_YOU_LIKE_TO_REMOVE, YOUR_SITE_IS_NOT_SECURE } from 'Constants/GlobalConstant/Placeholders';
import { circle_arrow_down_medium, circle_arrow_up_medium, circle_minus_fill_medium, circle_plus_fill_edge_medium, circle_plus_fill_medium, close_mini, copy_medium, delete_medium, user_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import _get from 'lodash/get';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import { cloneDeep } from 'lodash';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Accordion, Row, Col, Container } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import SmartLinkProvider from '../../context';
import RSInput from 'Components/FormFields/RSInput';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import { RSPrimaryButton } from 'Components/Buttons';
import { TABS_NAME, MOBILE_PLATFORM, disableUTMParameters, getDeviceType, getBase_url, get_dublicate_base, get_key_val, renderItemAppScreen } from './constant';

import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import UTMParameters from './UTMParameter/UTMParameters';
import {
    getGeneratedLink,
    getMobileList,
    screenListSelector,
    smartlinkEdit,
    subScreenlistSelector,
} from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSessionId } from 'Reducers/globalState/selector';
import { getScreenList, getSubScreenList, saveSmartLink } from 'Reducers/communication/createCommunication/smartlink/request';
import { buildSmartLinkPayload, getExistingLinks } from '../../constant';
import {
    deleteGeneratedSmartLink,
    updateEventTrack,
    updateMobileAppId,
    updateMobileChangeConfirm,
} from 'Reducers/communication/createCommunication/smartlink/reducer';
import { updateExistingLinks } from 'Reducers/communication/createCommunication/plan/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { updateName } from 'Pages/AuthenticationModule/Preferences/Pages/AudienceScore/Pages/ProfileData/constant';
import { AUTHORING_FIELD_LOADER_CONFIG, AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
const GenerateSmartLink = ({ fieldName, isEdit, tab, statusId, canEditExistingSmartLink = true, canAddnewSmartLink = true }) => {
    const { tabs, allTabs, setAllTabs, isMobileAppsLoading = false, generateSmartLinkLoader } =
        useContext(SmartLinkProvider);
    const dispatch = useDispatch();
    const domainRef = useRef();
    const LocationPath = useLocation();
    const locationState = useQueryParams('/communication');
    // console.log('locationState: ', locationState);
    // console.log('loca :::: ', locationState);
    const campaignId = _get(locationState, 'campaignId', 0);
    const {
        control,
        trigger,
        setValue,
        setError,
        formState: { isValid, submitCount, errors, isDirty, dirtyFields },
        getValues,
        resetField,
        watch,
        clearErrors,
        unregister,
        getFieldState,
    } = useFormContext();
    const smartLink = useSelector((state) => getGeneratedLink(state));
    const mobileApps = useSelector((state) => getMobileList(state));
    const screenList = useSelector((state) => screenListSelector(state));
    const subScreenList = useSelector((state) => subScreenlistSelector(state));    
    const { eventTrackData, mobileChangeConfirm, isAppEventTrack } = useSelector(
        ({ smartLinkReducer }) => smartLinkReducer,
    );
    const { exisingLinks } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    // console.log('isAppEventTrack: ', isAppEventTrack);
    // console.log('mobileChangeConfirm: ', mobileChangeConfirm);
    const isEditable = canEditExistingSmartLink && canAddnewSmartLink || !canEditExistingSmartLink && exisingLinks?.[fieldName]?.isNew || canAddnewSmartLink && !isEdit
    const edit = useSelector((state) => smartlinkEdit(state));
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    // console.log('eventTrackData: ', eventTrackData);
    const currentLink = _get(smartLink, fieldName, '');
    useEffect(() => {
        const mobileApp = _get(currentLink, 'mobileApp.appGuid', '');
        const appScreen = _get(currentLink, 'appScreen.screenName', '');
        _get(screenList, mobileApp, []);
        _get(subScreenList, appScreen, []);
    }, [screenList, subScreenList]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: fieldName,
    });
    const generateFlag = watch('generateFlag');
    const isChangeAllow = watch('isChangeAllow');
    // console.log('IsChangeAllow: ', isChangeAllow);

    const domain = useWatch({
        control,
        name: `${fieldName}[0].domain`,
    });

    const watchLink = useWatch({
        control,
        name: fieldName,
    });
    // console.log('watchLink: ', watchLink);

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));

    const [activeIndex, setActiveIndex] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobileAdaptive, setMobileAdaptive] = useState(false);
    const isPreCampaign = LocationPath?.pathname === '/communication/execute';
    // const [isGenerateLink, setIsGenerateLink] = useState(false);
    const [isCopied, setCopied] = useState(false);
    const [isConfirm, setConfirm] = useState({
        show: false,
        type: null,
        from: null,
        message: '',
    });
    const [platforms, setPlatforms] = useState(MOBILE_PLATFORM);
    const [platformParams, setSelectedParams] = useState({
        android: null,
        ios: null,
    });

    const defaultTabLabel = useMemo(() => {
        const n = Number(String(fieldName).replace('smartLink', ''));
        return Number.isFinite(n) && n > 0 ? `Smart Link ${n}` : 'Smart Link';
    }, [fieldName]);

    const currentTabLabel = useMemo(() => {
        const meta = Array.isArray(allTabs) ? allTabs.find((t) => t?.id === fieldName) : null;
        return String(meta?.text ?? defaultTabLabel);
    }, [allTabs, fieldName, defaultTabLabel]);

    const smartLinkNameField = `${fieldName}_friendlyName`;
    const watchedSmartLinkName = useWatch({ control, name: smartLinkNameField });


    const [defaultChecked, setDefaultChecked] = useState({
        isAndroid: false,
        androidIdx: 0,
        isIos: false,
        iosIdx: 0,
    });

    const [state, setState] = useState({
        tabs: cloneDeep(TABS_NAME),
    });
    const [mobileAppName, setMobileAppName] = useState({});
    const generateLoader = generateSmartLinkLoader;
    const screenListLoader = useApiLoader();
    const subScreenListLoader = useApiLoader();

    const [isConfirmChangeModal, setIsConfirmChangeModal] = useState({
        show: false,
        isConfirm: false,
    });
    const [isValidURLModal, setIsValidURLModal] = useState({
        show: false,
    });
    const [currentMobileFieldDetail, setCurrentMobileFieldDetail] = useState({});
    // console.log('currentMobileFieldDetail: ', currentMobileFieldDetail);
    const [currentMobileFieldChangeDetail, setCurrentMobileFieldChangeDetail] = useState({
        mobilePlatFormFieldChange: null,
        mobileAppFieldChange: null,
    });
    const [deleteConfirmEventData, setDeleteConfirmEventData] = useState({
        engagement: {},
        conversion: {},
    });
    // console.log('currentFieldDetail: ', currentMobileFieldDetail);

    const accordianIcon = (index) =>
        activeIndex === index
            ? `${circle_arrow_up_medium} icon-md rs-accordion-icon-collapse`
            : `${circle_arrow_down_medium} icon-md rs-accordion-icon-expand`;

    useEffect(() => {
        const findErrorIndex = _findIndex(errors[fieldName], (error = {}) => {
            return Object.keys(error)?.length;
        });
        if (findErrorIndex !== -1) {
            setActiveIndex(findErrorIndex);
        }
    }, [submitCount]);

    // useEffect(() => {
    //     const getCurrentLink = _get(edit, fieldName, {});
    //     if (!_isEmpty(getCurrentLink)) {
    //         const tabs = _map(getCurrentLink, (link, index) => {
    //             if (index === 0)
    //                 return {
    //                     title: 'Web',
    //                     type: 'WEB',
    //                 };

    //             return {
    //                 title: _get(link, 'mobilePlatform'),
    //                 type: 'MOBILE',
    //             };
    //         });
    //         const getPlaform = _map(getCurrentLink?.slice(1, getCurrentLink?.length), 'PhoneType');
    //         setState({ tabs });
    //     }
    // }, [edit]);

    useEffect(() => {
        const getIndex = _findIndex(errors[fieldName], (link) => typeof link !== 'undefined' && link !== null);
        if (getIndex !== -1 && (getIndex !== activeIndex || activeIndex === null)) {
            setActiveIndex(getIndex);
        }
    }, [errors[fieldName]]);
    useEffect(() => {
        if (fields?.length === 1) {
            setActiveIndex(0);
            // trigger();
        }
    }, [fields?.length]);
    // useEffect(() => {
    //     if (isGenerateLink && activeTabs.includes(fieldName)) {
    //         setActiveTabs((prev) => [...prev, 'smartLink2']);
    //     } else {
    //         if (!isGenerateLink && fieldName === 'smartLink1' && activeTabs.includes('smartLink2')) {
    //             const tempTabs = [...activeTabs];
    //             tempTabs.splice(1, 1);
    //             setActiveTabs(tempTabs);
    //         }
    //     }
    // }, [isGenerateLink]);

    useEffect(() => {
        if(isEdit){
            const tempTabs = [...fields];
            const platforms = [...cloneDeep(TABS_NAME),...tempTabs?.filter((item) => item?.mobilePlatform)];
            const filteredTabs = platforms?.map((item, index) => ({
                title: index === 0 ? item?.title : item?.mobilePlatform,
                type: index === 0 ? item?.type : 'MOBILE',
            }));
            if(filteredTabs?.length){
            setState((prev) => ({
                tabs: [ ...filteredTabs],
            }));
        }
    }   
    }, [fields]);

    useEffect(() => {
        setValue('generateFlag', false);
    }, [JSON.stringify(dirtyFields)]);

    useEffect(() => {
            const tempPlatforms = [...MOBILE_PLATFORM];
            let tabsPlatformList = [];
            state.tabs.forEach((item) => {
                if (item.type === 'MOBILE' && item.title !== 'Mobile') {
                    tabsPlatformList = [...tabsPlatformList, item.title];
                }
            });

            let arryDiff = tempPlatforms.filter((item) => !tabsPlatformList.includes(item));
            setPlatforms(arryDiff);
    }, [JSON.stringify(state?.tabs)]);
    
    const personalizeDomainUrl = (url, currentName, e) => {
        if (false) {
            setError(`${currentName}.domain`, {
                type: 'custom',
                message: MULTIPLE_PERSONALIZATIONS,
            });
        } else {
            var start = url.slice(0, domainRef?.current?.startPoistion);
            var end = url.slice(domainRef?.current?.endPosition);
            const [domainUrl, params] = url.split('?');
            // const appendValue = `${domainUrl}${e}${params ? '?' + params : ''}`;
            const appendValue = start + e + end;
            //start + data + end
            setValue(`${currentName}.domain`, appendValue);
            trigger(`${currentName}.domain`);
        }
    };

    const handleMobileAdaptiveBlur = (currentLink, currentName) => {
        const domainUrl = currentLink.domain?.split('?');
        // console.log('domainUrl: ', domainUrl);
        if (!isURLValid(_get(currentLink, 'adaptiveUrl', ''))) {
            setError(`${currentName}.adaptiveUrl`, {
                type: 'custom',
                message: ENTER_VALID_URL,
            });
            return;
        }
        if (!_get(currentLink, 'adaptiveUrl', '')?.startsWith('https://')) {
            if (!_get(currentLink, 'adaptiveUrl', '')?.startsWith('[[')) {
                if (_get(currentLink, 'adaptiveUrl', '')?.startsWith('http://')) {
                    setError(`${currentName}.adaptiveUrl`, {
                        type: 'custom',
                        message: YOUR_SITE_IS_NOT_SECURE,
                    });
                    return;
                } else {
                    setError(`${currentName}.adaptiveUrl`, {
                        type: 'custom',
                        message: ENTER_VALID_URL,
                    });
                    return;
                }
            }
        } else {
            domainUrl.shift();
            const [adaptiveUrl, ...params] = _get(currentLink, 'adaptiveUrl', '').split('?');
            domainUrl.forEach((elem) => {
                const paramIndex = params.indexOf(elem);
                if (paramIndex === -1 && adaptiveUrl !== '') {
                    const parameters = domainUrl[0].split('&');
                    setValue(`${currentName}.adaptiveUrl`, `${adaptiveUrl}?${parameters?.join('&')}`);
                }
            });
        }
    };

    const updateParams = (type) => {
        const tempTabs = [...watchLink];
        const { parameters } = tempTabs.shift();
        if (type) {
            let device = type === 'isAndroid' ? 'android' : 'ip';
            tempTabs.forEach(({ mobilePlatform }, tabInde) => {
                if (mobilePlatform.toLowerCase().startsWith(device)) {
                    setValue(`${fieldName}[${tabInde + 1}].parameters`, parameters);
                    setValue(`${fieldName}[${tabInde + 1}].isURIParameter`, true);
                }
            });
        } else {
            tempTabs.forEach((_, tabsIndex) => {
                setValue(`${fieldName}[${tabsIndex + 1}].parameters`, parameters);
                setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
            });
        }
    };

    const handleUTMParamsChange = (currentName, idx, type, platform) => {
        const allParams = watchLink[0].all;
        const checked = watchLink[0][type];
        const otherPlatform = watchLink[0][platform];
        let device = type === 'isAndroid' ? 'android' : 'ios';
        if (watchLink?.length > 1 && checked) {
            setConfirm({
                type: device,
                show: true,
                from: 'web',
                message: WOULD_YOU_LIKE_TO_REMOVE,
            });
            return;
        } else if (watchLink?.length > 1 && !checked) {
            updateParams(type);
        }
        if (allParams && checked) {
            setValue(`${currentName}.all`, false);
            setValue(`${currentName}.${type}`, false);
        }
        if (!checked && otherPlatform) {
            setValue(`${currentName}.all`, true);
            setValue(`${currentName}.${type}`, true);
        } else {
            setValue(`${currentName}.${type}`, !checked);
        }
    };

    const addPlaform = (idx) => {
        const getIndex = _findIndex(errors[fieldName], (link) => typeof link !== 'undefined' && link !== null);
        if (getIndex !== -1 && (getIndex !== activeIndex || activeIndex === null)) {
            setActiveIndex(getIndex);
            return;
        }
        if (isValid && fields?.length >= 1) {
            const tempState = { ...state };
            tempState.tabs.push({
                title: 'Mobile',
                type: 'MOBILE',
            });
            // if (idx !== 0) {
            //     console.log(state.tabs, 'state.tabs');
            //     const tempPlatforms = [...platforms];
            //     const platformIndex = tempPlatforms.indexOf(state.tabs[idx].title);
            //     tempPlatforms.splice(platformIndex, 1);
            //    // setPlatforms(tempPlatforms);
            // }
            // console.log('App name ::: ', getValues(`mobileAppName`));
            append({
                mobilePlatform: '',
                mobileApp: !!getValues(fieldName)?.[1]?.mobileApp?.appGuid ? getValues(fieldName)?.[1]?.mobileApp : '',
                isURIParameter: false,
                deferredDeepLink: true,
                appScreen: '',
                parameters: [{ tags: '', tagValue: '', isUTMParameterInput: false, customValue: '' }],
            });
            setValue('deferredDeepValue', false);
            clearErrors();
            setState(tempState);
            // if (currentLink) dispatch(deleteGeneratedSmartLink(fieldName));
            setActiveIndex(idx + 1);
            let tempDevices = getValues(fieldName);
            let tempCheckBox = {
                isAndroid: false,
                androidIdx: 0,
                isIOS: false,
                iosIdx: 0,
            };
            tempDevices?.map((item, idx) => {
                if (idx !== 0) {
                    if (
                        item?.isAndroid === true &&
                        item?.mobilePlatform.startsWith('Android') &&
                        !tempCheckBox?.isAndroid
                    ) {
                        tempCheckBox.isAndroid = true;
                        tempCheckBox.androidIdx = idx;
                    } else if (item?.isIOS === true && item?.mobilePlatform.startsWith('iP') && !tempCheckBox?.isIOS) {
                        tempCheckBox.isIOS = true;
                        tempCheckBox.iosIdx = idx;
                    }
                }
            });
            // console.log('Check :::::::::::::::: ', tempCheckBox, tempDevices);
            setDefaultChecked(tempCheckBox);
            setValue('generateFlag', false);
        } else {
            trigger();
        }
        // const { smartLink1, smartLink2 } = control._formValues;
        // let activeData = activeTabs[0] === 'smartLink1' ? smartLink1 : smartLink2;
        // setActiveValues(activeData);
    };

    const handleMobilePlaformChange = (e, idx) => {
        const { value } = e;
        const platformType = value.startsWith('And');
        const { isAndroid, isIOS, all, parameters } = getValues(`${fieldName}[0]`);
        const platformParametres = getValues(`${fieldName}[1]`);
        const name = platformType ? 'isAndroid' : 'isIOS';
        var tempTabs = [...getValues(fieldName)];
        const paramsIndex = platformType ? platformParams.android : platformParams.ios;
        const getParams = _get(tempTabs[paramsIndex], 'parameters', []);
        const device = platformType ? 'and' : 'ip';
        // tempTabs.shift();
        if (paramsIndex !== null) {
            setValue(`${fieldName}[${idx}].parameters`, getParams);
            setValue(`${fieldName}[${idx}].isURIParameter`, true);
        }
        if (all) {
            tempTabs[idx].parameters = parameters;
            tempTabs[idx].isURIParameter = true;
        } else if ((isAndroid && device === 'and') || (isIOS && device === 'ip')) {
            if (value.toLowerCase().startsWith(device)) {
                tempTabs[idx].parameters = parameters;
                tempTabs[idx].isURIParameter = true;
            }
        } else if (
            (tempTabs?.length > 2 && platformParametres.isAndroid && device === 'and') ||
            (platformParametres.isIOS && device === 'ip')
        ) {
            if (value.toLowerCase().startsWith(device)) {
                tempTabs[idx].parameters = getParams;
                tempTabs[idx].isURIParameter = true;
            }
        }
        const temp = { ...state };
        temp.tabs[idx] = {
            ...temp.tabs[idx],
            title: value,
        };
        // temp.tabs[idx].title = value;
        UpdateState(setState, 'tabs', temp.tabs);
        setValue(fieldName, tempTabs);
        setValue('generateFlag', false);
    };

    const removePlatform = (idx) => {
        remove(idx);
        if (idx !== 0) {
            // debugger;
            const temp = { ...state };
            const currentTitle = temp.tabs[idx].title;
            let prevTitle;
            if (idx > 1) {
                prevTitle = temp.tabs[idx - 1].title;
            }
            temp.tabs.splice(idx, 1);
            const tempPlatForm = [...platforms];
            if (!platforms.includes(currentTitle) && currentTitle !== 'Mobile') {
                tempPlatForm.push(currentTitle);
            }
            if (prevTitle && !platforms.includes(prevTitle)) tempPlatForm.push(prevTitle);
            setState(temp);
            //setPlatforms(tempPlatForm);
            // const tempTabs = [...watchLink];
            // tempTabs.splice(0, 1);
            // const currentPlatform = _map(tempTabs, 'mobilePlatform');
            // const filterPlatformList = MOBILE_PLATFORM.filter((plat) => !currentPlatform.includes(plat));
            // setPlatforms(filterPlatformList);
            let tempDevices = getValues(fieldName);
            let tempCheckBox = {
                isAndroid: false,
                androidIdx: 0,
                isIOS: false,
                iosIdx: 0,
            };
            tempDevices?.map((item, idx) => {
                if (idx !== 0) {
                    if (
                        item?.isAndroid === true &&
                        item?.mobilePlatform.startsWith('Android') &&
                        !tempCheckBox?.isAndroid
                    ) {
                        tempCheckBox.isAndroid = true;
                        tempCheckBox.androidIdx = idx;
                    } else if (item?.isIOS === true && item?.mobilePlatform.startsWith('iP') && !tempCheckBox?.isIOS) {
                        tempCheckBox.isIOS = true;
                        tempCheckBox.iosIdx = idx;
                    }
                }
            });
            // console.log('Check :::::::::::::::: ', tempCheckBox, tempDevices);
            setDefaultChecked(tempCheckBox);
            setValue('generateFlag', false);
        }
        // if (isGenerateLink) setIsGenerateLink(false);
        if (currentLink) dispatch(deleteGeneratedSmartLink(fieldName));
    };

    const handleWebAllPlatformChange = (currentName) => {
        const isChecked = watchLink[0].all;
        if (watchLink?.length > 1 && isChecked) {
            setConfirm({
                show: true,
                type: 'all',
                message: WOULD_YOU_LIKE_TO_REMOVE
            });
            return;
        } else if (watchLink?.length > 1 && !isChecked) {
            updateParams();
        }
        setValue(`${currentName}.all`, !isChecked);
        setValue(`${currentName}.isAndroid`, !isChecked);
        setValue(`${currentName}.isIOS`, !isChecked);
    };

    const checkParamsforPlatform = ({ type, index }) => {
        const { isAndroid, isIOS } = watchLink[1];
        const name = type === 'android' ? 'isAndroid' : 'isIOS';
        // debugger;
        if ((type === 'android' && isAndroid) || (type === 'ios' && isIOS)) {
            setConfirm({
                show: true,
                type,
                message: WOULD_YOU_LIKE_TO_REMOVE,
                from: 'platform',
                ignoreIndex: index,
            });
            // return;
            // setValue(`${fieldName}[${index}].parameters`, [
            //     { tags: '', tagValue: '', isUTMParameterInput: false, customValue: '' },
            // ]);
            // setValue(`${fieldName}[${index}].parameters`, []);
            setValue(`${fieldName}[${index}].${name}`, false);
        }
        const device = type === 'android' ? 'and' : 'ip';
        var temp = [...getValues(fieldName)];
        const getParams = temp[index].parameters;
        // if (temp?.length > 2) {
        temp = temp.map((platform, tempIndex) => {
            // debugger;
            if (tempIndex === 1) platform[name] = true;
            if (tempIndex !== 0 && platform.mobilePlatform.toLowerCase().startsWith(device)) {
                platform.parameters = getParams;
                platform.isURIParameter = true;
            }
            return platform;
        });
        // }
        setValue(fieldName, temp);
        setSelectedParams((prev) => ({ ...prev, [type]: index }));
        // const webTab = tempTabs.shift();
        // const params = !isIOS || !isAndroid ? parameters : [];
        // else {
        //     setValue(`${fieldName}[${index}].${name}`, true);
        // }

        // const findParamsIndex = _findIndex(
        //     tempTabs,
        //     (tabs) => tabs.isURIParameter && mobilePlatform.toLowerCase().includes(type),
        // );
        // if (type === 'android') {
        //     const params = !isAndroid ? parameters : [];
        //     tempTabs.forEach(({ mobilePlatform }, tabsIndex) => {
        //         if (mobilePlatform.startsWith('Android')) {
        //             setValue(`${fieldName}[${tabsIndex + 1}].parameters`, params);
        //             setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
        //         }
        //         setValue(`${fieldName}[${tabsIndex + 1}].isAndroid`, !isAndroid);
        //     });
        // }
        // if (type === 'ios') {
        //     const params = !isIOS ? parameters : [];
        //     tempTabs.forEach(({ mobilePlatform }, tabsIndex) => {
        //         if (mobilePlatform.startsWith('IP')) {
        //             setValue(`${fieldName}[${tabsIndex + 1}].parameters`, params);
        //             setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
        //         }
        //         setValue(`${fieldName}[${tabsIndex + 1}].isIOS`, !isIOS);
        //     });
        // }
    };

    const handleSelectionChange = (e) => {
        domainRef.current = {
            startPoistion: e.target.selectionStart,
            endPosition: e.target.selectionEnd,
        };
    };
    const validateSmartURLHttp = (smarturl) => {
        try {
            if (smarturl?.startsWith('[[')) {
                return true;
            } else if (smarturl?.startsWith('https:')) {
                return true;
            } else return false;
            // smarturl = smarturl.split('?')[0].split('[[')[0];
            // const url = new URL(smarturl);

            // if (url?.protocol == 'http:') {
            //     return false;
            // } else {
            //     return true;
            // }
        } catch (_) {
            return false;
        }
    };
    const IsValidURL = (url) => {
        const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/.*)?$/i;

        try {
            let newUrl = new URL(url);
            let origin = newUrl.origin;
            let rslt = regex.test(origin);

            if (!rslt) {
                return 'Enter a valid  URL';
            }
        } catch (e) {
            return 'Enter a valid  URL';
        }
        try {
            const parsedUrl = new URL(url);
            const validProtocols = ['https:'];
            return validProtocols.includes(parsedUrl.protocol);
        } catch (e) {
            return 'Enter a valid  URL';
        }
    };
    const handleDomainBlur = (url, currentName, e) => {
        // const handleDomainBlur = ({ target: { value } }) => {
        // if (validateSmartURL(url) === false) {
        //     setError(`${currentName}.domain`, {
        //         type: 'custom',
        //         message: 'Enter a valid URL',
        //     });
        // } else
        // if (!url) {
        //     setError(`${currentName}.domain`, {
        //         type: 'custom',
        //         message: 'Enter a valid URL',
        //     });
        //     return;
        // }
        if (!isURLValid(url)) {
            setError(`${currentName}.domain`, {
                type: 'custom',
                message: ENTER_VALID_URL,
            });
            return;
        }
        if (!url?.startsWith('https://')) {
            if (!url?.startsWith('[[')) {
                if (url?.startsWith('http://')) {
                    setError(`${currentName}.domain`, {
                        type: 'custom',
                        message: YOUR_SITE_IS_NOT_SECURE,
                    });
                    return;
                } else {
                    setError(`${currentName}.domain`, {
                        type: 'custom',
                        message: ENTER_VALID_URL,
                    });
                    return;
                }
            }
        }
        if (!validateSmartURLHttp(url)) {
            setError(`${currentName}.domain`, {
                type: 'custom',
                message: YOUR_SITE_IS_NOT_SECURE,
            });
        }
    };

    useEffect(() => {
        setValue('deferredDeepLinkValue', false);
        let tempDevices = getValues(fieldName);
        let tempCheckBox = {
            isAndroid: false,
            androidIdx: 0,
            isIOS: false,
            iosIdx: 0,
        };
        tempDevices?.map((item, idx) => {
            if (idx !== 0) {
                if (
                    item?.isAndroid === true &&
                    item?.mobilePlatform.startsWith('Android') &&
                    !tempCheckBox?.isAndroid
                ) {
                    tempCheckBox.isAndroid = true;
                    tempCheckBox.androidIdx = idx;
                } else if (item?.isIOS === true && item?.mobilePlatform.startsWith('iP') && !tempCheckBox?.isIOS) {
                    tempCheckBox.isIOS = true;
                    tempCheckBox.iosIdx = idx;
                }
            }
        });
        // console.log('Check :::::::::::::::: ', tempCheckBox, tempDevices);
        setDefaultChecked(tempCheckBox);
    }, []);

    const onFormSubmit = (formState) => {};

    const isDomainValid = _get(errors?.[fieldName]?.[0], 'domain.message', '');

    const callback = (val) => {
        // let { smartLink1, smartLink2, smartLink3, smartLink4, smartLink5 } = getValues();
        setValue('generateFlag', false);
        setValue('saveFlag', false);
        let { count, ...rest } = getValues();
        let other_links = Object.entries(rest)
            .map((e, i) => e[0] !== fieldName && e[1] && e[1][0] && e[1][0]?.domain)
            .filter((e) => e);
        let curent_links = Object.entries(rest)
            .map((e, i) => e[0] == fieldName && e[1] && e[1][0] && e[1][0]?.domain)
            .filter((e) => e);

        let curent_links_base = getBase_url(curent_links);
        let other_links_base = getBase_url(other_links);
        let dublicate_base = get_dublicate_base(curent_links, other_links);

        let current_key_value = get_key_val(curent_links);
        let other_key_value = get_key_val(other_links);

        if (dublicate_base) {
            // if (get_validate_params(other_key_value, current_key_value[0])) {
            setError(`${fieldName}[${0}].domain`, {
                type: 'server',
                message: 'Enter unique SmartLink url',
            });
        } else {
            clearErrors(`${fieldName}[${0}].domain`);
        }
    };

    const checkDeferLink = () => {
        // console.log(
        //     'WatchLink :::: ',
        //     watchLink,
        //     watchLink.some((e) => e?.type !== 'WEB' && e?.deferredDeepLink),
        // );
        if (watchLink?.length === 1) return false;
        return watchLink.some((e) => e?.type !== 'WEB' && e?.deferredDeepLink);
    };

    const getScreenListData = async (value, status, index) => {
        const mobileApp = getValues(fieldName)?.[index]?.mobileApp || {} // mobileApp?.appGuid;
        // if (screenList[appGuid]?.length === 0) {
        const payload = {
            clientId,
            userId,
            departmentId,
            mobileAppId: mobileApp?.appGuid || '',
            mobileplatformId: getDeviceType(value),
            mobileType: value,
            isdeferdeeplinkchecked: status ? 'Y' : 'N', //-- S
        };

        return screenListLoader.refetch({
            fetcher: ({ payload: p, field } = {}) =>
                dispatch(getScreenList({ payload: p, field, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload, field: `${mobileApp?.appGuid}${value}` },
        });
        // }
    };

    const getSubScreen = async (payload, data, currentName) => {
        const res = await subScreenListLoader.refetch({
            fetcher: ({ payload: p, field } = {}) =>
                dispatch(getSubScreenList({ payload: p, field, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload, field: data },
        });
        const { data: result, status } = res || {};
        let deepLink = status ? _get(result, 'deepLinkURL', '') : '';
        setValue(`${currentName}.appDpURL`, deepLink);
        // console.log('Resul for subscreen :::: ', res);
    };

    // const getParamsCheck = (idx) => {
    //     let temp = watchLink[idx];
    //     console.log('Watch link ::::::: ', getValues(fildN));
    // };

    // console.log('AAAAAasdasd ::: ', isValid, isDomainValid, generateFlag, tab);
    // console.log('Default :::::::::: ', getFieldState(`${fieldName}[${0}].domain`));

    const handlePreventChangeMobileField = (value = '', field, currentName, type, idx = null) => {
        setCurrentMobileFieldDetail({
            app: field.mobileApp.appName,
            mobileType: field.mobilePlatform,
            changeValue: {
                fieldName: type === 'app' ? `${fieldName}[${1}].mobileApp` : `${currentName}.mobilePlatform`,
                value: value,
            },
            type: type,
            isDeleteScenario: idx,
        });
        if (eventTrackData['engagementPrimaryGoal']?.length || eventTrackData['conversionPrimaryGoal']?.length) {
            const modifiedPlatForm = updateName(field.mobilePlatform);
            // console.log('modifiedPlatForm: ', modifiedPlatForm);
            const isContainEngagementPlatForm = eventTrackData['engagementPrimaryGoal']?.find(
                (eventTrack) => updateName(eventTrack.mobileAppDetail?.type) === modifiedPlatForm,
            );
            const isContainConversionPlatForm = eventTrackData['conversionPrimaryGoal']?.find(
                (eventTrack) => updateName(eventTrack.mobileAppDetail?.type) === modifiedPlatForm,
            );
            setDeleteConfirmEventData({
                engagement: isContainEngagementPlatForm,
                conversion: isContainConversionPlatForm,
            });
            if (isContainEngagementPlatForm || isContainConversionPlatForm) {
                if (type === 'app') {
                    setValue(`${fieldName}[${1}].mobileApp`, field.mobileApp);
                } else {
                    setValue(`${currentName}.mobilePlatform`, field.mobilePlatform);
                }
                setIsConfirmChangeModal({
                    isConfirm: false,
                    show: true,
                });
                return true;
            } else {
                return false;
            }
        }
    };

    const handleMobilePlatformChangeFunction = (e, idx, currentLink) => {
        handleMobilePlaformChange(e, idx, 'android');
        if (idx > 1) {
            getScreenListData(e.target.value, currentLink?.deferredDeepLink, idx);
        }
    };
    const handleMobileAppChangeFunction = (value, idx, currentName) => {
        const platform = getValues(`${currentName}.mobilePlatform`);
        setValue(`${currentName}.deferredDeepLink`, true);
        if (idx === 1) {
            setValue(`mobileAppName`, value);
        }
        const payload = {
            clientId,
            userId,
            departmentId,
            mobileAppId: value.appGuid,
            mobileplatformId: getDeviceType(platform),
            mobileType: platform,
            isdeferdeeplinkchecked: 'Y', //-- S
        };
        screenListLoader.refetch({
            fetcher: ({ payload: p, field } = {}) =>
                dispatch(getScreenList({ payload: p, field: `${value.appGuid}${platform}`, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload, field: `${value.appGuid}${platform}` },
        });
    };

    const handleDeleteEventTrack = () => {
        if (
            (mobileChangeConfirm?.isConfirmNotSaved && eventTrackData['engagementPrimaryGoal']?.length) ||
            eventTrackData['conversionPrimaryGoal']?.length
        ) {
            const updateEnagementEventData = eventTrackData['engagementPrimaryGoal']?.filter((allData) => {
                return (
                    formatName(allData.mobileAppDetail?.type) !==
                    formatName(deleteConfirmEventData?.engagement?.mobileAppDetail?.type)
                );
            });
            const updateConversionEventData = eventTrackData['conversionPrimaryGoal']?.filter((allData) => {
                return (
                    formatName(allData.mobileAppDetail?.type) !==
                    formatName(deleteConfirmEventData?.conversion?.mobileAppDetail?.type)
                );
            });
            dispatch(
                updateEventTrack({
                    field: 'engagementPrimaryGoal',
                    data: updateEnagementEventData || [],
                }),
            );
            dispatch(
                updateEventTrack({
                    field: 'conversionPrimaryGoal',
                    data: updateConversionEventData || [],
                }),
            );
        }
    };
    const handleGenerate = async () => {
        const formState = {
            ...getValues(),
            userId,
            clientId,
            departmentId,
            campaignId,
            tabs,
            allTabs,
        };
        let isEventTrack = Object.values(eventTrackData)[0]?.length || Object.values(eventTrackData)[1]?.length;
        const payload = buildSmartLinkPayload(formState, isEventTrack);
        const res = await generateLoader.refetch({
            fetcher: ({ payload: savePayload } = {}) =>
                dispatch(saveSmartLink({ payload: savePayload, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            params: { payload },
        });
        if (res?.status) {
            if (formState?.smartLink1?.length >= 2) {
                if (formState?.smartLink1[1]?.mobileApp?.appGuid ?? formState?.smartLink1[1]?.mobileAppName?.appGuid) {
                    dispatch(
                        updateMobileAppId(
                            formState?.smartLink1[1]?.mobileApp?.appGuid ??
                                formState?.smartLink1[1]?.mobileApp?.appGuid,
                        ),
                    );
                }
            } else {
                dispatch(updateMobileAppId(''));
            }
            setValue('saveFlag', true);
            setValue('generateFlag', true);
            handleDeleteEventTrack();
            dispatch(
                updateMobileChangeConfirm({
                    field: 'isConfirmSaved',
                    data: true,
                }),
            );
            let existing = getExistingLinks(formState)
            dispatch(updateExistingLinks(existing))
            
        } else {
            updateMobileChangeConfirm({
                field: 'isConfirmSaved',
                data: false,
            });
        }
    };
    const handleQueryParams = (e) => {
        const value = e?.target.value;
        if (!value) {
            setValue(`${fieldName}[0].utmParameters`, false);
            setValue(`${fieldName}[0].isAndroid`, false);
            setValue(`${fieldName}[0].isIOS`, false);
            return;
        }
        let domainSplit = value.split('?');
        let queryString = domainSplit.slice(1).join('?');

        if (!queryString) return;

        let queryMap = queryString.split('&');
        let tempParams = [];

        for (let i = 0; i < queryMap.length; i++) {
            let currQuery = queryMap[i].trim();
            if (!currQuery) continue;
            let keyValues = currQuery.split('=');
            let rawKey = keyValues?.[0] || '';
            const val = keyValues.slice(1).join('=') || '';
            let key = i === 0 && rawKey.includes('/')
                ? rawKey.substring(rawKey.lastIndexOf('/') + 1)
                : rawKey;
            let keyMatch = _find(personalization, { attributeName: key });
            let valueMatch = _find(personalization, { personalizationKey: val });

            if (keyMatch && valueMatch) {
                tempParams.push({
                    tags: keyMatch,
                    tagValue: valueMatch?.personalizationKey,
                    isUTMParameterInput: false,
                    customValue: "",
                });
            } else {
                tempParams.push({
                    tags: '',
                    tagValue: val,
                    isUTMParameterInput: true,
                    customValue: key,
                });
            }
        }

        setValue(`${fieldName}[0].parameters`, tempParams);
        setValue(`${fieldName}[0].utmParameters`, true);
        setTimeout(() => {
            trigger(`${fieldName}[0].parameters`)
        }, 100)
    };

    return (
        <Fragment>
            <div className="form-group pl30 my35 smartlink-name-field">
                <Row>
                    <Col sm={6} className='pr40'>
 <RSInput
                    name={smartLinkNameField}
                    control={control}
                    placeholder={FRIENDLY_NAME}
                    maxLength={50}
                    preserveConsecutiveSpaces
                    onKeyDown={charNumUnderScore}
                    handleOnchange={(e) => {
                        const next = e?.target?.value ?? '';
                        const sanitizedValue = String(next).replace(/[^A-Za-z0-9_-]/g, '').replace(/ +/g, ' ');
                        if (sanitizedValue !== next) {
                            setTimeout(() => {
                                setValue(smartLinkNameField, sanitizedValue, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }, 0);
                        }
                        if (typeof setAllTabs === 'function') {
                            const trimmed = sanitizedValue.trim();
                            const nextLabel = trimmed;
                            setAllTabs((prev) =>
                                Array.isArray(prev)
                                    ? prev.map((t) =>
                                          t?.id === fieldName
                                              ? { ...t, text: nextLabel, friendlyName: trimmed }
                                              : t,
                                      )
                                    : prev,
                            );
                            const isDuplicate = allTabs?.some(
                            (item) =>
                                item?.id !== fieldName &&
                                    (item?.friendlyName || '').trim().toLowerCase() === trimmed.toLowerCase()
                            );
                            setValue('saveFlag', !isDuplicate);
                        }
                        
                    }}
                    rules={{
                        validate: (value) => {
                            const trimmed = value?.trim?.() || '';
                            if (trimmed) {
                                const isDuplicate = allTabs?.some(
                                    (item) =>
                                        item?.id !== fieldName &&
                                        (item?.friendlyName || '').trim().toLowerCase() === trimmed.toLowerCase()
                                );
                                return isDuplicate ? 'Smart link name already exist' : true;
                            }
                        }
                    }}
                />
                </Col>
                </Row>
            </div>
            <div className="rs-accordion-wrapper mt21">
                {fields?.map((field, idx) => {
                    // console.log('field: ', field, watchLink[0]);
                    const currentLink = watchLink[idx];
                    const mobilePlatform = _get(currentLink, 'mobilePlatform');
                    const currentPlatform =
                        mobilePlatform &&
                        (mobilePlatform.toLowerCase().startsWith('and') ||
                            mobilePlatform.toLowerCase().startsWith('ip'));
                    const currentName = `${fieldName}[${idx}]`;
                    const currentMobileAppName = watchLink[1];
                    // setValue(`${currentName}.mobileApp`, idx !== 0 ? getValues('mobileAppName') : '');

                    // domainState.invalid || !domainState.isTouched;
                    // const mobileApp = currentLink.mobileApp;
                    const mobileApp = _get(currentLink, 'mobileApp.appGuid', '');
                    const mobileAppOne = `${_get(currentMobileAppName, 'mobileApp.appGuid', '')}${mobilePlatform}`;
                    const appScreen = _get(currentLink, 'appScreen.screenName', '');
                    let title = _get(state.tabs?.[idx], 'title', '');
                    // console.log('Screen list ::::::::::::: ', screenList);
                    const appScreenList = [..._get(screenList, mobileAppOne, [])];
                    // let appFlagValue = getValues(`${currentName}.isappScreenNew`) || currentLink?.customAppScreen;
                    let appFlagValue = currentLink?.customAppScreen;
                    const handleEnterNewAppScreen = () => {
                        setValue(`${currentName}.appScreen`, '');
                        setValue(`${currentName}.isappScreenNew`, true);
                        setValue(`${currentName}.customAppScreen`, true);
                        setValue(`${currentName}.subappScreenNew`, '');
                        setValue(`${currentName}.deferredDeepLink`, false);
                    };
                    // console.log('appFlagValue: ', appFlagValue);
                    return (
                        <Row className="mb10" key={field.id}>
                            <Col className="px46 position-relative">
                                <Accordion activeKey={activeIndex} key={field.id} className="no-box-shadow p0">
                                    <Accordion.Item eventKey={idx}>
                                        <Accordion.Header
                                            onClick={() => {
                                                if (activeIndex === idx) setActiveIndex(null);
                                                else setActiveIndex(idx);
                                                if (currentIndex !== idx) setCurrentIndex(idx);
                                            }}
                                        >
                                            <i
                                                className={`${accordianIcon(idx)}`}
                                                id="rs_GenerateSmartLink_accordian"
                                            />
                                            <span>{!title ? mobilePlatform : title}</span>
                                            <RSTooltip
                                                text={REMOVE}
                                                position="top"
                                                className="position-absolute right15 lh0 z-1"
                                            >
                                                <div className={`${
                                                            !isEditable ||
                                                            (isAppEventTrack && idx === 1) ||
                                                            isPreCampaign
                                                                ? 'pe-none click-off'
                                                                : ''
                                                        }`}>
                                                <i
                                                    className={`${
                                                        idx !== 0 &&
                                                        `${circle_minus_fill_medium}  icon-md color-primary-red`
                                                    }`}
                                                    onClick={() => {
                                                        if (
                                                            !mobileChangeConfirm?.isConfirmNotSaved &&
                                                            idx === 1 &&
                                                            (Object.values(eventTrackData)[0]?.length ||
                                                                Object.values(eventTrackData)[1]?.length) &&
                                                            fieldName === 'smartLink1'
                                                        ) {
                                                            const status = handlePreventChangeMobileField(
                                                                '',
                                                                field,
                                                                currentName,
                                                                '',
                                                                idx,
                                                            );
                                                            if (!status) {
                                                                removePlatform(idx);
                                                            }
                                                        } else {
                                                            removePlatform(idx);
                                                        }
                                                    }}
                                                />
                                                </div>
                                            </RSTooltip>
                                        </Accordion.Header>
                                        <Accordion.Body
                                            onClick={() => {
                                                if (currentIndex !== idx) setCurrentIndex(idx);
                                            }}
                                        >
                                            <Container
                                                className={`${
                                                    !isEditable ||
                                                    (isAppEventTrack && idx === 1) ||
                                                    isPreCampaign
                                                        ? 'pe-none click-off'
                                                        : ''
                                                }`}
                                            >
                                                {field.type === 'WEB' ? (
                                                    <Fragment>
                                                        <div className="form-group mt20">
                                                            <Row>
                                                                <Col sm={12} className='pr55'>
                                                            <RSInput
                                                                id="rs_GenerateSmartLink_DomainURL"
                                                                control={control}
                                                                name={`${currentName}.domain`}
                                                                placeholder={ENTER_AN_URL}
                                                                handleOnchange={handleSelectionChange}
                                                                onClick={handleSelectionChange}
                                                                handleOnBlur={(e) => {
                                                                    callback(e);
                                                                    setValue('generateFlag', false);
                                                                    setValue('saveFlag', false);
                                                                    if (
                                                                        !e.target.value?.split('?')?.[0]?.includes('[[')
                                                                    ) {
                                                                        handleDomainBlur(
                                                                            currentLink.domain,
                                                                            currentName,
                                                                            e,
                                                                        );
                                                                    }
                                                                    handleQueryParams(e)
                                                                }}
                                                                maxLength={MAXL_LENGTH2048}
                                                                rules={{
                                                                    //  required: DOMAIN_URL_MSG,
                                                                    validate: (value) => {
                                                                        return value?.split('?')?.[0]?.includes('[[')
                                                                            ? true
                                                                            : IsValidURL(value);
                                                                    },
                                                                    // pattern: {
                                                                    //     value: WEBURL_REGEX,
                                                                    //     message: ENTER_VALID_WEBSITE,
                                                                    // },
                                                                    // pattern: {
                                                                    //     value: SMARTLINK_REGEX,
                                                                    //     message: ENTER_VALID_DOMAIN,
                                                                    // },
                                                                }}
                                                            />
                                                            {/* <ListNameExists
                                                                name={`${currentName}.domain`}
                                                                field="Website"
                                                                // onValid={(valid) => setIsValidListname(valid)}
                                                                apiCallback={validateDomainUrl}
                                                                condition={(data) => {
                                                                    const { status } = data;
                                                                    return status;
                                                                }}
                                                                isEmail
                                                                rules={WEBSITE_RULES}
                                                                // rules={{
                                                                //     required: DOMAIN_URL_MSG,
                                                                // }}
                                                                placeholder={DOMAIN_URL}
                                                                settings={{
                                                                    onKeyDown: handleSelectionChange,
                                                                }}
                                                                callback={callback}
                                                            /> */}
                                                            <div className="d-flex justify-content-between generate-smartlink-dropdown">
                                                                <RSBootstrapdown
                                                                    defaultItem={{
                                                                        key: (
                                                                            <RSTooltip
                                                                                text={URL_PERSONALIZATION}
                                                                                className="lh0"
                                                                            >
                                                                                <i
                                                                                    className={`${user_question_mark_medium} icon-md color-primary-blue`}
                                                                                    id="rs_GenerateSmartLink_URLpersonalization"
                                                                                />
                                                                            </RSTooltip>
                                                                        ),
                                                                    }}
                                                                    className={`no_caret ${
                                                                        !personalization?.length ? 'click-off' : ''
                                                                    }`}
                                                                    showUpdate={false}
                                                                    onSelect={(e) => {
                                                                        personalizeDomainUrl(
                                                                            currentLink.domain,
                                                                            currentName,
                                                                            e.personalizationKey,
                                                                        );
                                                                    }}
                                                                    isObject
                                                                    fieldKey="key"
                                                                    data={personalization}
                                                                    showSearch
                                                                />

                                                                {/* <div
                                                                    className={`d-flex mr-15 ${
                                                                        !!isDomainValid || !domain ? 'click-off' : ''
                                                                    }`}
                                                                >   */}
                                                                <div
                                                                    className={
                                                                        !!currentLink?.domain &&
                                                                        !getFieldState(`${currentName}.domain`)?.invalid
                                                                            ? `d-flex`
                                                                            : 'pe-none click-off'
                                                                    }
                                                                >
                                                                    <RSCheckbox
                                                                        control={control}
                                                                        name={`${currentName}.utmParameters`}
                                                                        labelName={UTM_PARAMETER}
                                                                        labelClass="mr0"
                                                                        handleChange={(e) => {
                                                                            const { checked } = e.target;
                                                                            if (checked === false) {
                                                                                setConfirm({
                                                                                    show: true,
                                                                                    message:
                                                                                        'Would you like to remove the selection?',
                                                                                    from: 'params',
                                                                                    currentName: currentName,
                                                                                    currentLink: currentLink,
                                                                                    index: currentIndex,
                                                                                    idx: idx,
                                                                                });
                                                                            }
                                                                            if (!checked) {
                                                                                // [
                                                                                //     'parameters',
                                                                                //     'all',
                                                                                //     'isAndroid',
                                                                                //     'isIOS',
                                                                                // ].forEach((name) =>
                                                                                //     resetField(
                                                                                //         `${currentName}.${name}`,
                                                                                //     ),
                                                                                // );
                                                                                // const [domainUrl] =
                                                                                //     currentLink.domain.split('?');
                                                                                // setValue(
                                                                                //     `${currentName}.domain`,
                                                                                //     domainUrl,
                                                                                // );
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <RSTooltip
                                                                text={ADAPTIVE_URL}
                                                                position="top"
                                                                className={`position-absolute lh0 right0 top5`}
                                                            >
                                                                <div
                                                                    className={
                                                                        isDomainValid || !domain || isMobileAdaptive
                                                                            ? 'pe-none click-off'
                                                                            : ''
                                                                    }
                                                                >
                                                                    <i
                                                                        id="rs_data_circle_plus_fill"
                                                                        className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                                        onClick={() =>
                                                                            setMobileAdaptive(!isMobileAdaptive)
                                                                        }
                                                                    />
                                                                </div>
                                                            </RSTooltip>
                                                            </Col>
                                                            </Row>
                                                        </div>
                                                        {(isMobileAdaptive || !!watchLink?.[idx]?.adaptiveUrl) && (
                                                            <div className="form-group">
                                                                <Row>
                                                                     <Col sm={12} className='pr55'>
                                                                <RSInput
                                                                    control={control}
                                                                    name={`${currentName}.adaptiveUrl`}
                                                                    placeholder={MOBILE_ADAPTIVE}
                                                                    required
                                                                    rules={{
                                                                        required: ENTER_ADAPTIVE,
                                                                    }}
                                                                    handleOnBlur={(e) => {
                                                                        if (
                                                                            !e.target.value
                                                                                ?.split('?')?.[0]
                                                                                ?.includes('[[')
                                                                        ) {
                                                                            handleMobileAdaptiveBlur(
                                                                                currentLink,
                                                                                currentName,
                                                                            );
                                                                        }
                                                                    }}
                                                                    maxLength={MAXL_LENGTH2048}
                                                                />
                                                                <RSTooltip
                                                                    text={DELETE}
                                                                    position="top"
                                                                    className={`position-absolute lh0 right0 top5`}
                                                                >
                                                                    <i
                                                                        className={`${delete_medium} icon-md color-primary-red`}
                                                                        onClick={() => {
                                                                            setValue(`${currentName}.adaptiveUrl`, '');
                                                                            setMobileAdaptive(false);
                                                                            clearErrors(`${currentName}.adaptiveUrl`);
                                                                            trigger(`${currentName}.domain`);
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                                </Col>
                                                                </Row>
                                                            </div>
                                                        )}
                                                        {currentLink?.utmParameters && (
                                                            <div className="form-group">
                                                                <Row>
                                                                <Col>
                                                                    <label className="control-label-left">
                                                                        {UTM_PARAMETER}
                                                                    </label>
                                                                </Col>
                                                                <Col>
                                                                    <span className="d-flex flex-right">
                                                                        <span
                                                                            className="cp mr15"
                                                                            onClick={() =>
                                                                                handleWebAllPlatformChange(
                                                                                    currentName,
                                                                                    idx,
                                                                                )
                                                                            }
                                                                        >
                                                                            <RSCheckbox
                                                                                control={control}
                                                                                name={`${currentName}.all`}
                                                                                labelName={ALL}
                                                                                containerClass="pe-none"
                                                                            />
                                                                        </span>
                                                                        <span
                                                                            className="cp mr15"
                                                                            onClick={() =>
                                                                                handleUTMParamsChange(
                                                                                    currentName,
                                                                                    idx,
                                                                                    'isAndroid',
                                                                                    'isIOS',
                                                                                )
                                                                            }
                                                                        >
                                                                            <RSCheckbox
                                                                                control={control}
                                                                                name={`${currentName}.isAndroid`}
                                                                                labelName={ANDROID}
                                                                                containerClass="pe-none"
                                                                            />
                                                                        </span>
                                                                        <span
                                                                            className="cp mr27"
                                                                            onClick={() =>
                                                                                handleUTMParamsChange(
                                                                                    currentName,
                                                                                    idx,
                                                                                    'isIOS',
                                                                                    'isAndroid',
                                                                                )
                                                                            }
                                                                        >
                                                                            <RSCheckbox
                                                                                control={control}
                                                                                name={`${currentName}.isIOS`}
                                                                                labelName={IOS}
                                                                                containerClass="pe-none"
                                                                            />
                                                                        </span>
                                                                    </span>
                                                                </Col>
                                                                </Row>
                                                            </div>
                                                        )}
                                                        {currentLink?.utmParameters && (
                                                            // <UTMParameter
                                                            //     key={'webparameter' + idx}
                                                            //     idx={idx}
                                                            //     currentIndex={currentIndex}
                                                            //     fieldName={fieldName}
                                                            //     className={disableUTMParameters({
                                                            //         currentLink,
                                                            //         webLink: watchLink[0],
                                                            //     })}
                                                            // />
                                                            <div className='form-group'>
                                                                    <UTMParameters
                                                                        fieldName={fieldName}
                                                                        fieldInsertName={`${fieldName}[${idx}]`}
                                                                        fieldArrayName={`${fieldName}[${currentIndex}]`}
                                                                        className={disableUTMParameters({
                                                                            currentLink,
                                                                            webLink: watchLink[0],
                                                                        })}
                                                                        utmParams
                                                                        modal={false}
                                                                        index={idx}
                                                                        watchLink={watch(`${fieldName}[${idx}]`)}
                                                                        callback={callback}
                                                                        customTooltipClassName="right0"
                                                                        customColClassName="pr55"
                                                                        type='web'
                                                                    />
                                                            </div>
                                                        )}
                                                    </Fragment>
                                                ) : (
                                                    <Fragment>
                                                        <div className="form-group mt20">
                                                            <Row>
                                                            <Col sm={3} className="pr0">
                                                                <label className="control-label-left">
                                                                    {MOBILE_PLATFORM_PH}
                                                                </label>
                                                            </Col>
                                                            <Col sm={8}>
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    name={`${currentName}.mobilePlatform`}
                                                                    data={platforms}
                                                                    label={DEVICE_TYPE}
                                                                    required
                                                                    rules={{
                                                                        required: ENTER_DEVICE_TYPE,
                                                                    }}
                                                                    handleChange={(e) => {
                                                                        const platform = getValues(
                                                                            `${currentName}.mobilePlatform`,
                                                                        );
                                                                        if (
                                                                            !mobileChangeConfirm?.isConfirmNotSaved &&
                                                                            fieldName === 'smartLink1' &&
                                                                            (Object.values(eventTrackData)[0]?.length ||
                                                                                Object.values(eventTrackData)[1]
                                                                                    ?.length) &&
                                                                            idx === 1
                                                                        ) {
                                                                            const status =
                                                                                handlePreventChangeMobileField(
                                                                                    e.value,
                                                                                    field,
                                                                                    currentName,
                                                                                    'platform',
                                                                                );
                                                                            if (status) {
                                                                                setCurrentMobileFieldChangeDetail(
                                                                                    (pre) => ({
                                                                                        ...pre,
                                                                                        mobilePlatFormFieldChange: {
                                                                                            event: e,
                                                                                            currentLink: currentLink,
                                                                                            idx: idx,
                                                                                        },
                                                                                    }),
                                                                                );
                                                                            } else {
                                                                                handleMobilePlaformChange(
                                                                                    e,
                                                                                    idx,
                                                                                    'android',
                                                                                );
                                                                                const mobileApp = getValues(
                                                                                    `${currentName}.mobileApp`,
                                                                                );
                                                                                // if (mobileApp?.appGuid) {
                                                                                //     const payload = {
                                                                                //         clientId,
                                                                                //         userId,
                                                                                //         departmentId,
                                                                                //         mobileAppId: mobileApp.appGuid,
                                                                                //         mobileplatformId:
                                                                                //             getDeviceType(platform),
                                                                                //         mobileType: platform,
                                                                                //         isdeferdeeplinkchecked: 'Y',
                                                                                //     };
                                                                                //     dispatch(
                                                                                //         getScreenList({
                                                                                //             payload,
                                                                                //             field: mobileApp.appGuid,
                                                                                //         }),
                                                                                //     );
                                                                                // }
                                                                                if (idx > 1 || mobileApp?.appGuid) {
                                                                                    getScreenListData(
                                                                                        e.target.value,
                                                                                        currentLink?.deferredDeepLink,
                                                                                        idx
                                                                                    );
                                                                                }
                                                                            }
                                                                        } else {
                                                                            handleMobilePlaformChange(
                                                                                e,
                                                                                idx,
                                                                                'android',
                                                                            );
                                                                            const mobileApp = getValues(
                                                                                `${currentName}.mobileApp`,
                                                                            );
                                                                            // if (mobileApp?.appGuid) {
                                                                            //     const payload = {
                                                                            //         clientId,
                                                                            //         userId,
                                                                            //         departmentId,
                                                                            //         mobileAppId: mobileApp.appGuid, // Use selected mobileApp's appGuid
                                                                            //         mobileplatformId:
                                                                            //             getDeviceType(platform),
                                                                            //         mobileType: platform,
                                                                            //         isdeferdeeplinkchecked: 'Y',
                                                                            //     };
                                                                            //     dispatch(
                                                                            //         getScreenList({
                                                                            //             payload,
                                                                            //             field:  `${value.appGuid}${platform}`,
                                                                            //         }),
                                                                            //     );
                                                                            // }
                                                                            if (idx > 1 || mobileApp?.appGuid) {
                                                                                    getScreenListData(
                                                                                        e.target.value,
                                                                                        currentLink?.deferredDeepLink,
                                                                                        idx
                                                                                    );
                                                                            }
                                                                            setValue(`${currentName}.appScreen`, '')
                                                                            setValue(`${currentName}.subappScreen`, '')
                                                                            setValue(`${currentName}.appScreenNew`, '')
                                                                            setValue(`${currentName}.subappScreenNew`, '')
                                                                            setValue(`${currentName}.isappScreenNew`, false)
                                                                            setValue(`${currentName}.customAppScreen`, false)
                                                                        }
                                                                    }}
                                                                />
                                                            </Col>
                                                            </Row>
                                                        </div>
                                                        {!!currentLink?.mobilePlatform && (
                                                            <div className="form-group mb20">
                                                                <Row>
                                                                <Col sm={3} >
                                                                    <label className="control-label-left">
                                                                        {MOBILE_APP}
                                                                    </label>
                                                                </Col>
                                                                <Col sm={8}>
                                                                    <RSKendoDropDownList
                                                                        control={control}
                                                                        name={`${fieldName}[${1}].mobileApp`}
                                                                        data={mobileApps}
                                                                        textField={'appName'}
                                                                        dataItemKey={'appGuid'}
                                                                        label={MOBILE_APP}
                                                                        required
                                                                        isLoading={isMobileAppsLoading}
                                                                        rules={{
                                                                            required: SELECT_MOBILE_APP,
                                                                        }}
                                                                        disabled={idx !== 1}
                                                                        handleChange={async ({ value }) => {
                                                                            if (
                                                                                !mobileChangeConfirm?.isConfirmNotSaved &&
                                                                                (Object.values(eventTrackData)[0]
                                                                                    ?.length ||
                                                                                    Object.values(eventTrackData)[1]
                                                                                        ?.length) &&
                                                                                fieldName === 'smartLink1' &&
                                                                                idx === 1
                                                                            ) {
                                                                                const status =
                                                                                    handlePreventChangeMobileField(
                                                                                        value,
                                                                                        field,
                                                                                        currentName,
                                                                                        'app',
                                                                                    );

                                                                                if (status) {
                                                                                    setCurrentMobileFieldChangeDetail(
                                                                                        (pre) => ({
                                                                                            ...pre,
                                                                                            mobileAppFieldChange: {
                                                                                                value: value,
                                                                                                currentName:
                                                                                                    currentName,
                                                                                                idx: idx,
                                                                                            },
                                                                                        }),
                                                                                    );
                                                                                } else {
                                                                                    const platform = getValues(
                                                                                        `${currentName}.mobilePlatform`,
                                                                                    );
                                                                                    setValue(
                                                                                        `${currentName}.deferredDeepLink`,
                                                                                        true,
                                                                                    );
                                                                                    if (idx === 1) {
                                                                                        setValue(
                                                                                            `mobileAppName`,
                                                                                            value,
                                                                                        );
                                                                                    }
                                                                                    const payload = {
                                                                                        clientId,
                                                                                        userId,
                                                                                        departmentId,
                                                                                        mobileAppId: value.appGuid,
                                                                                        mobileplatformId:
                                                                                            getDeviceType(platform),
                                                                                        mobileType: platform,
                                                                                        isdeferdeeplinkchecked: 'Y', //-- S
                                                                                    };
                                                                                    await screenListLoader.refetch({
                                                                                        fetcher: ({ payload: p, field } = {}) =>
                                                                                            dispatch(
                                                                                                getScreenList({
                                                                                                    payload: p,
                                                                                                    field,
                                                                                                    loading: false,
                                                                                                }),
                                                                                            ),
                                                                                        mode: 'create',
                                                                                        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                                                                                        params: { payload, field: `${value.appGuid}${platform}` },
                                                                                    });
                                                                                }
                                                                            } else {
                                                                                const platform = getValues(
                                                                                    `${currentName}.mobilePlatform`,
                                                                                );
                                                                                setValue(
                                                                                    `${currentName}.deferredDeepLink`,
                                                                                    true,
                                                                                );
                                                                                if (idx === 1) {
                                                                                    setValue(`mobileAppName`, value);
                                                                                }
                                                                                const payload = {
                                                                                    clientId,
                                                                                    userId,
                                                                                    departmentId,
                                                                                    mobileAppId: value.appGuid,
                                                                                    mobileplatformId:
                                                                                        getDeviceType(platform),
                                                                                    mobileType: platform,
                                                                                    isdeferdeeplinkchecked: 'Y', //-- S
                                                                                };
                                                                                await screenListLoader.refetch({
                                                                                    fetcher: ({ payload: p, field } = {}) =>
                                                                                        dispatch(
                                                                                            getScreenList({
                                                                                                payload: p,
                                                                                                field,
                                                                                                loading: false,
                                                                                            }),
                                                                                        ),
                                                                                    mode: 'create',
                                                                                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                                                                                    params: { payload, field: `${value.appGuid}${platform}` },
                                                                                });
                                                                            }
                                                                            setValue(`${currentName}.appScreen`, '')
                                                                            setValue(`${currentName}.subappScreen`, '')
                                                                            setValue(`${currentName}.appScreenNew`, '')
                                                                            setValue(`${currentName}.subappScreenNew`, '')
                                                                            setValue(`${currentName}.isappScreenNew`, false)
                                                                            setValue(`${currentName}.customAppScreen`, false)
                                                                            
                                                                            // if (idx === 1) {
                                                                            //     setValue(`mobileAppName`, value);
                                                                            //     for (
                                                                            //         var i = 1;
                                                                            //         i < fields?.length;
                                                                            //         i++
                                                                            //     ) {
                                                                            //         setValue(
                                                                            //             `${fieldName}[${i}].mobileApp`,
                                                                            //             value,
                                                                            //         );
                                                                            //     }

                                                                            //     // setValue(
                                                                            //     //     `${fieldName}[${3}].mobileApp`,
                                                                            //     //     value,
                                                                            //     // );
                                                                            //     // setValue(
                                                                            //     //     `${fieldName}[${4}].mobileApp`,
                                                                            //     //     value,
                                                                            //     // );
                                                                            // }
                                                                        }}
                                                                    />
                                                                    {!!currentLink?.mobileApp && (
                                                                        <div className={`text-right  ${disableUTMParameters({
                                                                                    currentLink,
                                                                                    webLink: watchLink[0],
                                                                                })}`}>
                                                                            <RSCheckbox
                                                                                control={control}
                                                                                name={`${currentName}.isURIParameter`}
                                                                                labelName={URI_PARAMETER}
                                                                                labelClass="mr0"
                                                                               
                                                                                handleChange={(e) => {
                                                                                    if (e.target.checked) {
                                                                                        const type = mobilePlatform
                                                                                            .toLowerCase()
                                                                                            .startsWith('and')
                                                                                            ? 'android'
                                                                                            : 'ios';
                                                                                        }
                                                                                        if (e.target.checked === false){
                                                                                            setConfirm({
                                                                                                show: true,
                                                                                                message:
                                                                                                    'Would you like to remove the selection?',
                                                                                                from: 'params',
                                                                                                currentName: currentName,
                                                                                                currentLink: currentLink,
                                                                                                index: currentIndex,
                                                                                                idx: idx,
                                                                                            });
                                                                                        }
                                                                                    
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Col>
                                                                </Row>
                                                            </div>
                                                        )}
                                                        {currentLink?.isURIParameter && (
                                                            <Fragment>
                                                                <div
                                                                    className={`${disableUTMParameters({
                                                                        currentLink,
                                                                        webLink: watchLink[0],
                                                                    })} form-group`}
                                                                >
                                                                    <Row>
                                                                    <Col sm={3} >
                                                                        <label className="control-label-left">
                                                                            {/* {URL_PARAMETER} */}
                                                                            {'URI parameter'}
                                                                        </label>
                                                                    </Col>
                                                                    <Col sm={8}>
                                                                        <ul className="rs-list-inline rli-space-10">
                                                                            <li>
                                                                                <RSCheckbox
                                                                                    control={control}
                                                                                    labelName={ALL}
                                                                                    name={`${currentName}.all`}
                                                                                    disabled
                                                                                />
                                                                            </li>
                                                                            <li>
                                                                                <span
                                                                                    // onClick={() => {
                                                                                    //     checkParamsforPlatform({
                                                                                    //         type: 'android',
                                                                                    //         index: idx,
                                                                                    //     });
                                                                                    // }}
                                                                                    className={`${disableUTMParameters({
                                                                                        currentLink,
                                                                                        webLink: watchLink[0],
                                                                                    })} d-flex justify-content-between`}
                                                                                >
                                                                                    <RSCheckbox
                                                                                        control={control}
                                                                                        name={`${fieldName}[1].isAndroid`}
                                                                                        labelName={ANDROID}
                                                                                        containerClass={
                                                                                            defaultChecked?.isAndroid &&
                                                                                            defaultChecked?.androidIdx !==
                                                                                                idx
                                                                                                ? 'pe-none'
                                                                                                : ''
                                                                                        }
                                                                                        // checked={
                                                                                        //     idx !== 1
                                                                                        //         ? defaultChecked?.isAndroid
                                                                                        //         : getValues(
                                                                                        //               `${fieldName}[1].isAndroid`,
                                                                                        //           )
                                                                                        // }
                                                                                        handleChange={(e) => {
                                                                                            //  console.log(
                                                                                            //     'ASDASD :::: ',
                                                                                            //     e,
                                                                                            // );
                                                                                                                                                                                        checkParamsforPlatform({
                                                                                                type: 'android',
                                                                                                index: idx,
                                                                                            });
                                                                                            setDefaultChecked(
                                                                                                (prev) => ({
                                                                                                    ...prev,
                                                                                                    isAndroid:
                                                                                                        e?.checked,
                                                                                                    androidIdx: idx,
                                                                                                }),
                                                                                            );
                                                                                        }}
                                                                                        disabled={
                                                                                            watchLink[0].isAndroid ===
                                                                                                true ||
                                                                                            (defaultChecked?.isAndroid &&
                                                                                                defaultChecked?.androidIdx !==
                                                                                                    idx)
                                                                                        }
                                                                                    />
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span
                                                                                    // onClick={() =>
                                                                                    //     checkParamsforPlatform({
                                                                                    //         type: 'ios',
                                                                                    //         index: idx,
                                                                                    //     })
                                                                                    // }
                                                                                    className={`${disableUTMParameters({
                                                                                        currentLink,
                                                                                        webLink: watchLink[0],
                                                                                    })} d-flex justify-content-between`}
                                                                                >
                                                                                    <RSCheckbox
                                                                                        control={control}
                                                                                        // name={`${currentName}.isIOS`}
                                                                                        name={`${fieldName}[1].isIOS`}
                                                                                        labelName={IOS}
                                                                                        // checked={
                                                                                        //     idx !== 1
                                                                                        //         ? defaultChecked?.isIos
                                                                                        //         : getValues(
                                                                                        //               `${fieldName}[1].isIOS`,
                                                                                        //           )
                                                                                        // }
                                                                                        containerClass={
                                                                                            defaultChecked?.isIos &&
                                                                                            defaultChecked?.iosIdx !==
                                                                                                idx
                                                                                                ? 'pe-none'
                                                                                                : ''
                                                                                        }
                                                                                        handleChange={(e) => {
                                                                                            checkParamsforPlatform({
                                                                                                type: 'ios',
                                                                                                index: idx,
                                                                                            });
                                                                                            setDefaultChecked(
                                                                                                (prev) => ({
                                                                                                    ...prev,
                                                                                                    isIos: e?.checked,
                                                                                                    iosIdx: idx,
                                                                                                }),
                                                                                            );
                                                                                        }}
                                                                                        disabled={
                                                                                            watchLink[0].isIOS ===
                                                                                                true ||
                                                                                            (defaultChecked?.isIos &&
                                                                                                defaultChecked?.iosIdx !==
                                                                                                    idx)
                                                                                        }
                                                                                    />
                                                                                </span>
                                                                            </li>
                                                                        </ul>
                                                                    </Col>
                                                                    </Row>
                                                                </div>
                                                                {/* <UTMParameter
                                                                            key={'mobileparameter' + idx}
                                                                            idx={idx}
                                                                            currentIndex={currentIndex}
                                                                            fieldName={fieldName}
                                                                        /> */}
                                                                        <div className="form-group mb0">
                                                                <Row >
                                                                    <Col sm={{ offset: 3, span: 8 }}>
                                                                        <UTMParameters
                                                                            fieldName={fieldName}
                                                                            key={'mobileparameters' + idx}
                                                                            fieldArrayName={`${fieldName}[${currentIndex}]`}
                                                                            fieldInsertName={`${fieldName}[${idx}]`}
                                                                            modal={false}
                                                                            watchLink={watch(`${fieldName}[${idx}]`)}
                                                                            disbaleParams={disableUTMParameters({
                                                                                currentLink,
                                                                                webLink: watchLink[0],
                                                                            })}
                                                                            callback={callback}
                                                                            index={idx}
                                                                            customTooltipClassName="right-41"
                                                                            isEnabled={currentLink?.isURIParameter}
                                                                            type={'mobile'}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                                </div>
                                                            </Fragment>
                                                        )}
                                                        {!!currentLink?.mobileApp && !!currentLink?.mobilePlatform && (
                                                            <Fragment>
                                                                <div className="form-group">
                                                                    <Row>
                                                                    <Col sm={3} className='pr0'>
                                                                        <label className="control-label-left">
                                                                            {/* {DEEP_LINK} */}
                                                                            <div className="d-flex"></div>
                                                                            <RSTooltip
                                                                                text={DEEP_LINK}
                                                                                position="top"
                                                                            >
                                                                                {DEF_DEEP_LINKING}
                                                                            </RSTooltip>
                                                                        </label>
                                                                    </Col>
                                                                    <Col
                                                                        sm={8}
                                                                        className={
                                                                            currentLink?.isappScreenNew
                                                                                ? 'pe-none click-off'
                                                                                : locationState?.channels?.includes(
                                                                                      8,
                                                                                  ) ||
                                                                                  locationState?.channels?.includes(14)
                                                                                ? ''
                                                                                : 'pe-none click-off'
                                                                        }
                                                                    >
                                                                        <RSSwitch
                                                                            control={control}
                                                                            name={`${currentName}.deferredDeepLink`}
                                                                            handleChange={(e) => {
                                                                                setValue('deferredDeepLinkValue', e);
                                                                                const platform = getValues(
                                                                                    `${currentName}.mobilePlatform`,
                                                                                );
                                                                                //if(e)getScreenListData(platform, e);
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                    </Row>
                                                                </div>
                                                                
                                                                {currentLink?.isappScreenNew || appFlagValue ? (
                                                                    <>
                                                                        <div className="form-group">
                                                                            <Row>
                                                                            <Col
                                                                                sm={{
                                                                                    offset: 3,
                                                                                    span:
                                                                                        mobilePlatform === 'iPhone' ||
                                                                                        mobilePlatform === 'iPad'
                                                                                            ? 8
                                                                                            : 4,
                                                                                }}
                                                                                className="position-relative"
                                                                            >
                                                                                <RSInput
                                                                                    control={control}
                                                                                    name={`${currentName}.appScreenNew`}
                                                                                    placeholder={'Enter new app screen'}
                                                                                    required
                                                                                    rules={{
                                                                                        required:
                                                                                            'Enter new app screen',
                                                                                    }}
                                                                                    handleOnBlur={(e) => {
                                                                                        let temp = {
                                                                                            activityName: 0,
                                                                                            screenName: e.target.value,
                                                                                        };
                                                                                        setValue(
                                                                                            `${currentName}.appScreen`,
                                                                                            temp,
                                                                                        );
                                                                                    }}
                                                                                />
                                                                                <RSTooltip
                                                                                    position="top"
                                                                                    text={CLOSE}
                                                                                    className="lh0 position-absolute top7 right16 zIndex2"
                                                                                >
                                                                                    <i
                                                                                        className={`${close_mini} color-primary-red icon-xs`}
                                                                                        id="rs_GenerateSmartLink_close"
                                                                                        onClick={() => {
                                                                                            setValue(
                                                                                                `${currentName}.subappScreen`,
                                                                                                '',
                                                                                            );
                                                                                            setValue(
                                                                                                `${currentName}.subappScreenNew`,
                                                                                                '',
                                                                                            );
                                                                                            setValue(
                                                                                                `${currentName}.isappScreenNew`,
                                                                                                false,
                                                                                            );
                                                                                            setValue(
                                                                                                `${currentName}.customAppScreen`,

                                                                                                false,
                                                                                            );
                                                                                            setValue(
                                                                                                `${currentName}.appScreen`,

                                                                                                '',
                                                                                            );
                                                                                             setValue(
                                                                                                `${currentName}.deferredDeepLink`,
                                                                                                true,
                                                                                            );
                                                                                            unregister(
                                                                                                `${currentName}.appScreenNew`,
                                                                                            );
                                                                                        }}
                                                                                    ></i>
                                                                                </RSTooltip>
                                                                            </Col>
                                                                            <Col
                                                                                sm={4}
                                                                                className={`
                                                                                        ${!mobileApp ? 'pe-none' : ''}
                                                                                        ${
                                                                                            mobilePlatform ===
                                                                                                'iPhone' ||
                                                                                            mobilePlatform === 'iPad'
                                                                                                ? 'd-none'
                                                                                                : 'd-block'
                                                                                        } position-relative
                                                                                    `}
                                                                            >
                                                                                <RSInput
                                                                                    control={control}
                                                                                    name={`${currentName}.subappScreenNew`}
                                                                                    placeholder={
                                                                                        ENTER_NEW_SUB_SCREEN
                                                                                    }
                                                                                    handleOnBlur={(e) => {
                                                                                        let temp = {
                                                                                            subScreenName:
                                                                                                e.target.value,
                                                                                            deepLinkURL: '',
                                                                                        };
                                                                                        setValue(
                                                                                            `${currentName}.subappScreen`,
                                                                                            temp,
                                                                                        );
                                                                                    }}
                                                                                    // rules={{
                                                                                    //     required:
                                                                                    //         'Enter new sub screen',
                                                                                    // }}
                                                                                />
                                                                            </Col>
                                                                            </Row>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <Fragment>
                                                                        {/* {!!currentLink.deferredDeepLink && ( */}
                                                                        <div className="form-group">
                                                                            <Row>
                                                                            <Col
                                                                                sm={{
                                                                                    offset: 3,
                                                                                    span:
                                                                                        mobilePlatform === 'iPhone' ||
                                                                                        mobilePlatform === 'iPad'
                                                                                            ? 8
                                                                                            : 4,
                                                                                }}
                                                                            >
                                                                                <RSKendoDropDownList
                                                                                    control={control}
                                                                                    name={`${currentName}.appScreen`}
                                                                                    label={APP_SCREEN}
                                                                                    data={appScreenList}
                                                                                    isLoading={screenListLoader.isLoading}
                                                                                    footer={
                                                                                        <RSDropdownFooterBtn
                                                                                            title="New app screen"
                                                                                            handleClick={() => {
                                                                                                handleEnterNewAppScreen();
                                                                                            }}
                                                                                        />
                                                                                    }
                                                                                    isCustomRender
                                                                                    dataItemKey={'activityName'}
                                                                                    textField={'screenName'}
                                                                                    rules={{
                                                                                        required:
                                                                                            SELECT_APP_SCREEN,
                                                                                    }}
                                                                                    itemRender={(props) =>
                                                                                        renderItemAppScreen(
                                                                                            props,
                                                                                            () => {
                                                                                                unregister(
                                                                                                    `${currentName}.appScreen`,
                                                                                                );
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                    required
                                                                                    handleChange={({ value }) => {
                                                                                        if (
                                                                                            value?.screenName ===
                                                                                            'Enter new app screen'
                                                                                        ) {
                                                                                            handleEnterNewAppScreen();
                                                                                        } else {
                                                                                            const platform = getValues(
                                                                                                `${currentName}.mobilePlatform`,
                                                                                            );
                                                                                            if(mobilePlatform !=='iPhone' &&
                                                                                            mobilePlatform !== 'iPad'){
                                                                                             
                                                                                            const payload = {
                                                                                                mobileAppId: mobileApp,
                                                                                                deviceType:
                                                                                                    getDeviceType(
                                                                                                        platform,
                                                                                                    ),
                                                                                                screenName:
                                                                                                    value.screenName,
                                                                                                mobileType: platform,
                                                                                            };
                                                                                            getSubScreen(
                                                                                                payload,
                                                                                                value?.screenName,
                                                                                                currentName,
                                                                                            );
                                                                                        }
                                                                                            // dispatch(
                                                                                            //     getSubScreenList({
                                                                                            //         payload,
                                                                                            //         field: value.screenName,
                                                                                            //     }),
                                                                                            // );
                                                                                        }
                                                                                        setValue(
                                                                                            `${currentName}.subappScreen`,
                                                                                            '',
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </Col>
                                                                            {subScreenList?.length !== 0 && (
                                                                                <Col
                                                                                    sm={4}
                                                                                    className={`
                                                                                        ${!mobileApp ? 'pe-none' : ''}
                                                                                        ${
                                                                                            mobilePlatform ===
                                                                                                'iPhone' ||
                                                                                            mobilePlatform === 'iPad'
                                                                                                ? 'd-none'
                                                                                                : 'd-block'
                                                                                        } 
                                                                                    `}
                                                                                >
                                                                                    <RSKendoDropDownList
                                                                                        control={control}
                                                                                        name={`${currentName}.subappScreen`}
                                                                                        label={
                                                                                            SUB_APP_SCREEN
                                                                                        }
                                                                                        isLoading={subScreenListLoader.isLoading}
                                                                                        // isCustomRender
                                                                                        // itemRender={(props) => {
                                                                                        //     renderItemAppSubScreen(
                                                                                        //         props,
                                                                                        //         () => {},
                                                                                        //     );
                                                                                        // }}
                                                                                        data={_get(
                                                                                            subScreenList,
                                                                                            appScreen,
                                                                                            [],
                                                                                        )}
                                                                                        // data={subScreenList}
                                                                                        // textField={'subScreenName'}
                                                                                        //dataItemKey={'deepLinkURL'}
                                                                                        // required
                                                                                        // rules={{
                                                                                        //     required:
                                                                                        //         SELECT_SUB_APP_SCREEN,
                                                                                        // }}
                                                                                    />
                                                                                </Col>
                                                                            )}
                                                                            </Row>
                                                                        </div>
                                                                        {/* )} */}
                                                                    </Fragment>
                                                                )}
                                                            </Fragment>
                                                        )}
                                                    </Fragment>
                                                )}
                                            </Container>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                                {fields?.length - 1 === idx && fields?.length < 5 && (
                                    <RSTooltip
                                        text={ADD_MOBILE_DEVICE}
                                        position="top"
                                        className="rs-sl-add-icon position-absolute bottom0 right15 lh0"
                                    >
                                        <div  className={`${
                                                !isEditable || isPreCampaign ? 'pe-none click-off' : ''
                                            }`}>
                                        <i
                                            id="rs_data_circle_plus_fill_edge"
                                            className={`${
                                                circle_plus_fill_edge_medium
                                            } icon-md color-primary-blue`}
                                            onClick={() => addPlaform(idx)}
                                        />
                                        </div>
                                    </RSTooltip>
                                )}
                            </Col>
                        </Row>
                    );
                })}
                <Row className="justify-content-end mx0 mt21 pr14">
                    <RSPrimaryButton
                        className={`bg-secondary-blue float-end no-box-shadow w-auto rs-bg-secondary-blue`}
                         disabledClass={`${
                            !isEditable || isPreCampaign
                                ? 'pe-none click-off'
                                : // !isDirty ||
                                !isValid || isDomainValid || generateFlag || generateLoader.isFetching
                                ? 'pe-none'
                                : ''
                        }`}
                        onClick={async () => {
                            // console.log('AAAAA ::: ', isValid, isDomainValid, generateFlag);
                            // debugger;
                            if (!HTTPS_REGEX.test(domain?.split('?')?.[0])) {
                                setIsValidURLModal({
                                    show: true,
                                });
                            } else {
                                handleGenerate();
                            }
                        }}
                        isLoading={generateLoader.isFetching}
                        blockBodyPointerEvents
                    >
                        {GENERATE}
                    </RSPrimaryButton>
                </Row>
                {currentLink && (
                    <Row className="smart-url px46">
                        <Col sm={12} className='pl0'>
                            <h4 className="mb10">{SMART_URL}</h4>
                        </Col>
                        <Col className="px0 position-relative pr35">
                            <div className="d-flex align-items-center justify-content-between border-secondary border-bottom">
                                <div className="d-flex justify-content-between w-100">
                                    <span className="pe-none" style={{ userSelect: 'none' }}>
                                        {currentLink}
                                    </span>
                                    {/* <span>https://resu.io/ap7Xgb</span> */}
                                    {isCopied && (
                                        <span className="color-primary-green">{COPIED_SUCCESSFULLY}</span>
                                    )}
                                </div>
                            </div>
                            <RSTooltip text="Copy" position="top" className="position-absolute bottom-2 right0 lh0">
                                <i
                                    id="rs_GenerateSmartLink_Copy"
                                    className={`${copy_medium} icon-md color-primary-blue `}
                                    onClick={async () => {
                                        if ('clipboard' in navigator) {
                                            try {
                                                await navigator.clipboard.writeText(currentLink).then(() => {
                                                    // let temp = { ...state };
                                                    // temp.smartLinks[linkIndex].isCopied = true;
                                                    // UpdateState(setState, 'smartLinks', temp.smartLinks);
                                                    setCopied(true);
                                                    setTimeout(() => {
                                                        // temp.smartLinks[linkIndex].isCopied = false;
                                                        // UpdateState(setState, 'smartLinks', temp.smartLinks);
                                                        setCopied(false);
                                                    }, 1500);
                                                });
                                            } catch {}
                                        }
                                    }}
                                />
                            </RSTooltip>
                        </Col>
                    </Row>
                )}
            </div>
            {/* //Modals */}
            <RSConfirmationModal
                show={isConfirm.show}
                text={isConfirm.message}
                handleClose={() => {
                    const { currentLink, currentName } = isConfirm;
                    if(currentLink?.type?.toLowerCase() === 'web'){
                           setValue(`${currentName}.utmParameters`, true);
                    }else{
                        setValue(`${currentName}.isURIParameter`, true);
                    }
                    
                    setConfirm({
                        show: false,
                        type: null,
                        message: '',
                    });
                }}
                handleConfirm={() => {
                    const { type, from, currentName, currentLink, idx, index } = isConfirm;
                    var temp = [...getValues(fieldName)];
                    if (type === 'all') {
                        temp = temp.map((platform, indx) => {
                            if (indx === 0) {
                                platform['all'] = false;
                                platform['isAndroid'] = false;
                                platform['isIOS'] = false;
                            }
                            if (indx !== 0) {
                                platform.parameters = [
                                    { tags: '', tagValue: '', isUTMParameterInput: false, customValue: '' },
                                ];
                                platform.isURIParameter = false;
                            }
                            return platform;
                        });
                    } else if (type === 'android' || type === 'ios') {
                        const device = type === 'android' ? 'and' : 'ip';
                        const platformType = type === 'android' ? 'isAndroid' : 'isIOS';
                        if (from === 'web') {
                            temp = temp.map((platform, index) => {
                                if (index === 0) {
                                    platform[platformType] = false;
                                    platform['all'] = false;
                                }
                                if (index !== 0 && platform.mobilePlatform.toLowerCase().startsWith(device)) {
                                    platform.parameters = [
                                        { tags: '', tagValue: '', isUTMParameterInput: false, customValue: '' },
                                    ];
                                    platform.isURIParameter = false;
                                }
                                return platform;
                            });
                        } else if (from === 'platform') {
                            temp = temp.map((platform, index) => {
                                // debugger;

                                if (index === 1) {
                                    platform[platformType] = false;
                                }
                                if (
                                    index !== 0 &&
                                    index !== isConfirm.ignoreIndex &&
                                    platform.mobilePlatform.toLowerCase().startsWith(device)
                                ) {
                                    platform.parameters = [
                                        { tags: '', tagValue: '', isUTMParameterInput: false, customValue: '' },
                                    ];
                                    platform.isURIParameter = false;
                                }
                                return platform;
                            });
                        } else {
                        }
                    } else {
                        ['parameters', 'all', 'isAndroid', 'isIOS'].forEach((name) => {
                            resetField(`${currentName}.${name}`);
                        });

                        // resetField(`${currentName}.${parameters}`);
                        setValue(`${currentName}.parameters`, [
                            {
                                tags: '',
                                tagValue: '',
                                isUTMParameterInput: false,
                                customValue: '',
                            },
                        ]);
                        if(currentLink?.type?.toLowerCase() === 'web'){
                            const [domainUrl] = currentLink.domain.split('?');
                            setValue(`${currentName}.domain`, domainUrl);
                        }
                    }
                    setValue(fieldName, temp);
                    setConfirm({
                        show: false,
                        type: null,
                        message: '',
                    });
                    setSelectedParams((prev) => ({ ...prev, [type]: null }));
                }}
            />

            <RSConfirmationModal
                show={isValidURLModal?.show}
                handleClose={() => {
                    setIsValidURLModal({
                        show: false,
                    });
                }}
                htmlContent={
                    <p className="">
                        URL personalization is applied. Please ensure the personalization attribute contains valid data.
                        If the data is invalid, smart link redirection may fail. Would you like to proceed?
                    </p>
                }
                handleConfirm={() => {
                    setIsValidURLModal({
                        show: false,
                    });
                    handleGenerate();
                }}
                primaryButtonText={PROCEED}
            />
            <RSConfirmationModal
                show={isConfirmChangeModal?.show}
                // text={`According to this ${currentMobileFieldDetail?.mobileType}-${currentMobileFieldDetail?.app} , you already create the fieldtrack event , do you want to change the platform?`}
                handleClose={() => {
                    setIsConfirmChangeModal({
                        show: false,
                        isConfirm: false,
                    });
                }}
                htmlContent={
                    <p className="">
                        According to this{' '}
                        <span className="font-bold">{`${currentMobileFieldDetail?.mobileType}-${currentMobileFieldDetail?.app}`}</span>{' '}
                        , you already create the fieldtrack event , do you want to{' '}
                        <span>{currentMobileFieldDetail?.isDeleteScenario ? 'delete' : 'change'}</span> the platform?
                    </p>
                }
                handleConfirm={() => {
                    setIsConfirmChangeModal({
                        show: false,
                        isConfirm: false,
                    });
                    dispatch(
                        updateMobileChangeConfirm({
                            field: 'isConfirmNotSaved',
                            data: true,
                        }),
                    );
                    if (!currentMobileFieldDetail?.isDeleteScenario) {
                        setValue(
                            currentMobileFieldDetail?.changeValue?.fieldName,
                            currentMobileFieldDetail?.changeValue?.value,
                        );
                        if (currentMobileFieldDetail?.type === 'platform') {
                            const {
                                event: e,
                                idx,
                                currentLink,
                            } = currentMobileFieldChangeDetail.mobilePlatFormFieldChange;
                            handleMobilePlatformChangeFunction(e, idx, currentLink);
                        } else {
                            const { value, idx, currentName } = currentMobileFieldChangeDetail.mobileAppFieldChange;
                            handleMobileAppChangeFunction(value, idx, currentName);
                        }
                    } else {
                        removePlatform(currentMobileFieldDetail?.isDeleteScenario);
                    }
                }}
            />
        </Fragment>
    );
};

export default GenerateSmartLink;
