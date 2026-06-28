import { getUserDetails } from 'Utils/modules/crypto';
import { ENTER_CONVERSION_VALUE, ENTER_GRACE_PERIOD, ENTER_VALID_GRACE_PERIOD } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_WANT_TO_RESET, CANCEL, IGNORE_CHANNEL, NEXT, OK, RESET, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import _map from 'lodash/map';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import AttributeSelector from '../../../Component/AttributeSelector/AttributeSelector';
import useQueryParams from 'Hooks/useQueryParams';

import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import { onlyNumbers, onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { getDDMMMYYYYWITHOUTCOMMAS } from 'Utils/modules/dateTime';
import { FORM_INITIAL_STATE, filterValue, handleOfflineConversionEdit } from './constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getAuthoringSaveButtonType, useAuthoringChannelSaveLoader } from 'Components/Skeleton/pages/communication/authoring';
import useApiLoader from 'Hooks/useApiLoader';
import {
    CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG,
    OfflineConversionEditSkeleton,
} from '../../../../MdcComponents/Create/ConfigureAnalytics/components/LandingAnalyticsSkeletons';
import { numberOfDaysValidtor } from 'Utils/HookFormValidate';
import {
    resetCreateCommunication,
    updateOfflineConversion,
    updateTab,
} from 'Reducers/communication/createCommunication/create/reducer';

import { useNavigate } from 'react-router-dom';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { availableTabs, hasMismatchedChannelAudienceForOfflineConversion } from '../../../constant';

import { getSessionId } from 'Reducers/globalState/selector';
import {
    GetOfflineConversionAttributes,
    GetOfflineConversionValues,
    saveOfflineConversionChannel,
    GetOfflineConversionDetails,
    GetOfflineAttributeValues,
    getCrossBUStatus,
    getOfflineConversionBUList,
    getConversionMatchingKey,
} from 'Reducers/communication/createCommunication/Create/request';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { handleTabNavigationFlow } from '../../../../MdcComponents/Create/constant';
import { ConfigureAnalyticsProvider } from '../../../../MdcComponents/Create/ConfigureAnalytics';

import RSTooltip from 'Components/RSTooltip';
const OfflineConversion = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const [fixedValue, setFixedValue] = useState(false);
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showAdhocInfoModal, setShowAdhocInfoModal] = useState(false);
    const [showBU, setShowBU] = useState(false);
    const [alreadyCalledEditCall, setAlreadyCalledEditCall] = useState(false);
    const [offlineConversionCrossBUList, setOfflineConversionCrossBUList] = useState([]);
    const { setDefaultTabIndex } = useContext(ConfigureAnalyticsProvider);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { licenseTypeId } = getUserDetails();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const {
        tabsState: { analytics: tabAnalyticsState },
        isDirty,
        OfflineConversion,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { channelAudiences = {} ,campaignBlastDetails} = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();
    const pageLoadLoader = useApiLoader({ autoFetch: false, loaderConfig: CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG });
    const attributesLoader = useApiLoader({ autoFetch: false, loaderConfig: CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG });
    const conversionValuesLoader = useApiLoader({ autoFetch: false, loaderConfig: CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG });
    const matchingKeyLoader = useApiLoader({ autoFetch: false, loaderConfig: CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG });
    const buListLoader = useApiLoader({ autoFetch: false, loaderConfig: CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG });
    const isEnterpriseLicense = parseInt(licenseTypeId, 10) === 3;
    const isPageContentLoading = pageLoadLoader.isFetching;
    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        handleSubmit,
        formState: { errors, dirtyFields, isValid },
        reset,
        setValue,
        watch,
        getValues,
        clearErrors,
    } = methods;

    const createPayload = (additionalData = {}) => {
        const formState = watch();
        return {
            clientId,
            departmentId,
            userId,
            crossBUDepartmentId: formState?.departmentId?.Id || 0,
            isCrossBUEbaled: formState?.isCrossBU || false,
            ...additionalData,
        };
    };

    const loadConversionAttributes = async () => {
        const payload = createPayload();
        await Promise.all([
            attributesLoader.refetch({
                fetcher: () => dispatch(GetOfflineConversionAttributes({ payload, loading: false })),
            }),
            conversionValuesLoader.refetch({
                fetcher: () => dispatch(GetOfflineConversionValues(payload, false)),
            }),
        ]);
    };

    const loadConversionMatchingKey = async (crossBUDepartmentId) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            isCrossBU: true,
            crossBUDepartmentId: crossBUDepartmentId ?? departmentId,
        };
        await matchingKeyLoader.refetch({
            fetcher: () => dispatch(getConversionMatchingKey({ payload, loading: false })),
        });
    };

    const loadOfflineConversionDetails = async () =>
        dispatch(
            GetOfflineConversionDetails(
                {
                    campaignId: state?.campaignId,
                    clientId,
                    departmentId,
                    userId,
                },
                false,
            ),
        );

    useEffect(() => {
        if (hasMismatchedChannelAudienceForOfflineConversion(channelAudiences) || parseInt(campaignBlastDetails?.[0]?.isAdhoclist,10) === 3) {
            setShowAdhocInfoModal(true);
        } else {
             setShowAdhocInfoModal(false);
        }
    }, [channelAudiences,campaignBlastDetails]);

    useEffect(() => {
        if (!state?.campaignId) return;

        pageLoadLoader.refetch({
            fetcher: async () => {
                if (parseInt(licenseTypeId, 10) === 3) {
                    const crossBUStatus = await dispatch(
                        getCrossBUStatus({ payload: { clientId, departmentId, userId }, loading: false }),
                    );
                    if (crossBUStatus?.status) {
                        const isCrossBUEnabled =
                            crossBUStatus?.data?.length && crossBUStatus?.data[0]?.IsCrossBuEnabled;

                        if (isCrossBUEnabled) {
                            setValue('isCrossBU', true);
                            setShowBU(true);

                            const buList = await buListLoader.refetch({
                                fetcher: () =>
                                    dispatch(
                                        getOfflineConversionBUList({
                                            payload: { clientId, departmentId, userId },
                                            loading: false,
                                        }),
                                    ),
                            });
                            const filteredData = buList?.status ? buList?.data?.filter((item) => item.Id) || [] : [];
                            setOfflineConversionCrossBUList(filteredData);

                            const response = await dispatch(
                                GetOfflineConversionDetails(
                                    {
                                        campaignId: state?.campaignId,
                                        clientId,
                                        departmentId,
                                        userId,
                                    },
                                    false,
                                ),
                            );

                            let selectedDeptId = departmentId;
                            if (
                                response?.status &&
                                response?.data?.length &&
                                response?.data[0]?.crossBUId &&
                                filteredData?.length
                            ) {
                                const matchBuListItem = filteredData.find(
                                    (item) => item.Id === response?.data[0].crossBUId,
                                );
                                const matchBuListDefaultItem = filteredData.find((item) => item.Id === departmentId);
                                if (matchBuListItem) {
                                    setValue('departmentId', matchBuListItem);
                                    selectedDeptId = matchBuListItem.Id;
                                } else if (!matchBuListItem) {
                                    setValue('departmentId', matchBuListDefaultItem);
                                    selectedDeptId = matchBuListDefaultItem?.Id ?? departmentId;
                                }
                            } else {
                                const defaultBuItem = filteredData.find((item) => item.Id === departmentId);
                                setValue('departmentId', defaultBuItem);
                                selectedDeptId = defaultBuItem?.Id ?? departmentId;
                            }
                            await loadConversionAttributes();
                            await loadConversionMatchingKey(selectedDeptId);
                            return response;
                        }

                        setValue('isCrossBU', false);
                        setShowBU(false);
                        dispatch(updateOfflineConversion({ data: [], field: 'OfflineConversionMatchingKey' }));
                        await Promise.all([loadConversionAttributes(), loadOfflineConversionDetails()]);
                        return null;
                    }

                    setShowBU(false);
                    dispatch(updateOfflineConversion({ data: [], field: 'OfflineConversionMatchingKey' }));
                    await Promise.all([loadConversionAttributes(), loadOfflineConversionDetails()]);
                    return null;
                }

                setShowBU(false);
                dispatch(updateOfflineConversion({ data: [], field: 'OfflineConversionMatchingKey' }));
                await Promise.all([loadConversionAttributes(), loadOfflineConversionDetails()]);
                return null;
            },
        });
    }, [state?.campaignId, clientId, departmentId, userId, licenseTypeId]);

    const handleEditReset = async () => {
        const hasEditData = OfflineConversion?.OfflineConversionEdit?.length > 0;
        const hasValuesData = OfflineConversion?.OfflineConversionValues?.length > 0;
        const hasAttributesData = OfflineConversion?.OfflineConversionAttributes?.length > 0;
        if (hasEditData && hasValuesData && hasAttributesData && !alreadyCalledEditCall) {
            const finalResetValue = await handleOfflineConversionEdit(
                OfflineConversion,
                getAttributeField,
                conversionValues,
                setFixedValue,
            );
            reset((formState) => ({
                ...formState,
                ...finalResetValue,
            }));
            setAlreadyCalledEditCall(true);
        }
    };

    useEffect(() => {
        handleEditReset();
    }, [
        OfflineConversion?.OfflineConversionEdit?.length,
        OfflineConversion?.OfflineConversionValues?.length,
        OfflineConversion?.OfflineConversionAttributes?.length,
    ]);

    const parseConversionKeyIdFromEdit = (edit) => {
        const val = edit?.conversionMatchingKey ?? edit?.conversionMatchingKeyId;
        if (val == null || val === '') return null;
        if (Array.isArray(val)) return val[0] ?? null;
        if (typeof val === 'string' && val.includes(',')) return val.split(',')[0]?.trim() ?? null;
        return val;
    };

    useEffect(() => {
        if (
            showBU &&
            alreadyCalledEditCall &&
            OfflineConversion?.OfflineConversionMatchingKey?.length &&
            OfflineConversion?.OfflineConversionEdit?.[0]
        ) {
            const edit = OfflineConversion.OfflineConversionEdit[0];
            const conversionKeyId = parseConversionKeyIdFromEdit(edit);
            if (conversionKeyId) {
                const match = OfflineConversion.OfflineConversionMatchingKey.find(
                    (item) => String(item?.DataAttributeID) === String(conversionKeyId),
                );
                if (match && !watch('conversionKey')?.Id) {
                    setValue('conversionKey', match);
                }
            }
        } else if (
            alreadyCalledEditCall &&
            OfflineConversion?.OfflineConversionEdit?.[0] &&
            !parseConversionKeyIdFromEdit(OfflineConversion?.OfflineConversionEdit?.[0])
        ) {
            setValue('conversionKey', null);
        }
    }, [
        showBU,
        alreadyCalledEditCall,
        OfflineConversion?.OfflineConversionMatchingKey?.length,
        OfflineConversion?.OfflineConversionEdit?.[0]?.conversionMatchingKeys,
        OfflineConversion?.OfflineConversionEdit?.[0]?.conversionMatchingKeyId,
    ]);

    const handleNavigation = () => {
        let { analyticsTypes = [] } = state;
        let tempTabsIndex = [];
        const tabIndex = tabAnalyticsState?.currentTab + 1;
        const tempTabs = _map(analyticsTypes, (id) => {
            const { label } = getChannelId(id === 1001 ? 'offline conversion' : id);
            const normalizedLabel = label.toLowerCase();
            if (normalizedLabel === 'app analytics') return 'app';
            if (normalizedLabel === 'webinar') return 'events';
            return normalizedLabel;
        });
        if (state?.offlineConversion && !tempTabs.includes('offlineconversion')) {
            tempTabs.push('offlineconversion');
        }
        const tempTabsName = _map(availableTabs['analytics'], (index, value) => {
            if (tempTabs.includes(index?.toLowerCase())) {
                tempTabsIndex.push(value);
            }
        });
        if (
            tempTabs?.length ===
            tempTabs.findIndex((id) => tabAnalyticsState.tabName?.toLowerCase() == id?.toLowerCase()) + 1
        ) {
            if (state?.channels?.length === 1 && state?.channels?.includes(3)) {
                navigate('/communication', {
                    replace: true,
                    state: {
                        index: 0,
                    },
                });
            } else {
                let url = '/communication/execute';
                const encryptState = encodeUrl(state);
                dispatch(resetCreateCommunication());
                navigate(`${url}?q=${encryptState}`, {
                    state,
                });
            }
        } else {
            dispatch(
                updateTab({
                    field: 'analytics',
                    // data: {
                    //     tabName: tempTabs[tabIndex], //availableTabs['analytics'][tabIndex],
                    //     currentTab: tempTabsIndex[tabIndex], // tabIndex,
                    // },
                    data: {
                        tabName: tempTabs[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], //tempTabs[tabIndex], //availableTabs['analytics'][tabIndex],
                        currentTab: tempTabsIndex[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], // tempTabsIndex[tabIndex], // tabIndex,
                    },
                }),
            );
        }
    };
    const findAttributeTypeName = (attrs = {}, val = '', fieldType = '') => {
        let obj = {};
        if (fieldType === 4 || fieldType === 3) obj = attrs['Integer'];
        else if (fieldType === 8) obj = attrs['DateTime'];
        else obj = attrs['String'];

        return Object.keys(obj).find((key) => obj[key] === val);
    };
    const findAttributeFieldType = (value) => {
        switch (value) {
            case 1:
                return 'D';
            case 2:
                return 'AN';
            case 3:
                return 'NR';
            case 4:
                return 'NR';
            case 8:
                return 'AN';
            default:
                return 'AN';
        }
    };
    const formSubmitHandler = async (data, type) => {
        // console.log('type: ', type);
        // console.log('data: ', data);

        let tempAttributeData = data?.attributes?.map((res) => {
            let tempCondition = res?.attributeComparison;
            let tempFieldType = res?.attributeName?.fieldTypeId;
            let conditionValue = findAttributeTypeName(filterValue, tempCondition, tempFieldType);
            let attributeValues = '';
            if (tempFieldType === 8) {
                if (tempCondition === 'between' || tempCondition === '[]') {
                    const toVal = res?.attributeTo ? getDDMMMYYYYWITHOUTCOMMAS(res?.attributeTo) : '';
                    const fromVal = res?.attributeValue ? getDDMMMYYYYWITHOUTCOMMAS(res?.attributeValue) : '';
                    attributeValues = `${fromVal},${toVal}`;
                } else {
                    attributeValues = res?.attributeValue ? getDDMMMYYYYWITHOUTCOMMAS(res?.attributeValue) : '';
                }
            } else if (
                (tempFieldType === 4 || tempFieldType === 3) &&
                (tempCondition === 'between' || tempCondition === '[]')
            ) {
                attributeValues = res?.attributeValue + ',' + res?.attributeTo;
            } else {
                attributeValues = res?.attributeValue;
            }

            let attributeComparison;
            let availableCompare = {
                Contains: 'in',
                'Not contains': 'not in',
            };
            attributeComparison = availableCompare[res?.attributeComparison] || res?.attributeComparison;

            return {
                Name: res?.attributeName?.uiPrintableName,
                FieldType: findAttributeFieldType(res?.attributeName?.fieldTypeId),
                CompareValue: attributeComparison || res?.attributeComparison,
                // CompareValue: tempFieldType === 4 ? res?.attributeComparison : conditionValue,
                Value: res?.attributeName?.fieldTypeId === 1 ? res?.attributeMutipleValues.toString() : attributeValues,
                SOLRFieldName: res?.attributeName?.solrFieldName,
            };
        });
        const tempConversionValueAttributeId = data?.conversionValue?.map((item) => item.dataAttributeId);
        const payload = {
            clientId,
            departmentId,
            userId,
            offlineconDetail: {
                campaignId: state?.campaignId,
                gracePeriod: data?.gracePeriod,
                conversionAttibutesJson: tempAttributeData,
                statusId: 1,
                createdBy: userId,
                modifiedBy: userId,
                createdDate: new Date(),
                campaignType: state?.campaignType,
                GoalType: state?.primaryGoal,
                conversionValueAttributeId: tempConversionValueAttributeId.map(Number),
                conversionValueAttributeValues: data?.conversionValueAttributeValues || 0,
                conversionMatchingKeys: data?.conversionKey?.DataAttributeID
                    ? String(data?.conversionKey?.DataAttributeID)
                    : '',
            },
            isCrossBUEnabled: data?.departmentId?.Id
                ? parseInt(data?.departmentId?.Id, 10) !== parseInt(departmentId, 10)
                : false,
            crossBUID: data?.departmentId?.Id || 0,
        };
        const { status } = await runSave(getAuthoringSaveButtonType(type), () =>
            dispatch(saveOfflineConversionChannel({ payload, loading: false })),
        );
        // console.log('payload: ', payload);

        if (status) {
            if (state?.campaignType === 'M') {
                if (type === 'save') {
                    const mdcCanvasUrl = `/communication/mdc-workflow`;
                    const encryptState = encodeUrl(state);
                    navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                        state,
                    });
                } else {
                    const tabStatus = handleTabNavigationFlow(state, 2);
                    if (tabStatus?.status) {
                        setDefaultTabIndex(tabStatus?.tabIndex);
                    } else {
                        const mdcCanvasUrl = `/communication/mdc-workflow`;
                        const encryptState = encodeUrl(state);
                        navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                            state,
                        });
                    }
                }
            } else {
                if (type === 'save') {
                    dispatch(resetCreateCommunication());
                    navigate('/communication', {
                        index: 0,
                    });
                } else {
                    handleNavigation();
                }
            }
        }
    };
    const conversionValues = [
        {
            dataAttributeId: 129,
            fieldTypeId: 3,
            solrFieldName: 'Subscriptionform_i',
            uiPrintableName: 'Subscription forms',
        },
        {
            dataAttributeId: 131,
            fieldTypeId: 3,
            solrFieldName: 'XML_i',
            uiPrintableName: 'XML',
        },
        {
            dataAttributeId: 264,
            fieldTypeId: 4,
            solrFieldName: 'p7s_i',
            uiPrintableName: 'ZIPcode11',
        },
        {
            dataAttributeId: 265,
            fieldTypeId: 4,
            solrFieldName: 'asz_i',
            uiPrintableName: 'Account NO 2305',
        },
        {
            dataAttributeId: 266,
            fieldTypeId: 4,
            solrFieldName: 'mo2_i',
            uiPrintableName: 'Account NO 2307',
        },
        {
            dataAttributeId: 99999999999999,
            fieldTypeId: 4,
            solrFieldName: '[[Fixed_value_i]]',
            uiPrintableName: '[[Fixedvalue]]',
        },
    ];

    const getAttributeField = async (value) => {
        const payload = {
            attributeName: value?.SOLRFieldName,
            clientId,
            userId,
            departmentId,
        };
        const { status, data } = await dispatch(GetOfflineAttributeValues(payload, false));
        if (status) {
            return data;
        } else {
            return [];
        }
    };

    const handleMdcCancel = () => {
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const encryptState = encodeUrl(state);
        navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
            state,
        });
    };

    const handleResetClick = () => {
        setShowResetConfirmation(true);
    };

    const confirmReset = () => {
        clearErrors();
        reset((formState) => ({
            ...FORM_INITIAL_STATE?.defaultValues,
            isCrossBU: formState.isCrossBU,
            conversionKey: null,
        }));
        dispatch(
            updateOfflineConversion({
                data: [],
                field: 'OfflineConversionAttributes',
            }),
        );
        setShowResetConfirmation(false);
    };

    const handleResetCancel = () => {
        setShowResetConfirmation(false);
    };
    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit((data) => formSubmitHandler(data, 'form'))}
                className="rsv-tabs-content tab-content position-relative"
            >
                <div className="box-design bd-top-border p30">
                    {isPageContentLoading ? (
                        <OfflineConversionEditSkeleton showBUSection={isEnterpriseLicense} />
                    ) : (
                        <>
                    {showBU && offlineConversionCrossBUList?.length ? (
                        <>
                            <h4 className="mb20">Business unit</h4>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className={watch('departmentId') ? 'click-off pe-none' : ''}>
                                        <RSKendoDropdown
                                            data={offlineConversionCrossBUList || []}
                                            control={control}
                                            name={'departmentId'}
                                            textField={'Name'}
                                            dataItemKey={'Id'}
                                            placeholder="Select Business Unit"
                                            rules={{
                                                required: 'Select Business Unit',
                                            }}
                                            isLoading={buListLoader.isLoading}
                                            disabled={buListLoader.isFetching}
                                            handleChange={({ value }) => {
                                                if (value) {
                                                    loadConversionAttributes();
                                                    loadConversionMatchingKey(value?.Id);
                                                }
                                            }}
                                            label={'Business Unit'}
                                        />
                                    </Col>
                                    <Col sm={4} className={!watch('departmentId') ? 'click-off pe-none' : ''}>
                                        {showBU ? (
                                            <RSKendoDropdown
                                                data={OfflineConversion?.OfflineConversionMatchingKey || []}
                                                control={control}
                                                name={'conversionKey'}
                                                textField={'UIPrintableName'}
                                                dataItemKey={'DataAttributeID'}
                                                placeholder="Conversion key"
                                                label={'Conversion key'}
                                                isLoading={matchingKeyLoader.isLoading}
                                                disabled={matchingKeyLoader.isFetching}
                                            />
                                        ) : null}
                                    </Col>
                                    <Col sm={1} className="ml0 pl0">
                                        {watch('departmentId') && (
                                            <RSTooltip
                                                text={'Reset'}
                                                className="rs-tooltip-wrapper d-inline-flex lh0 position-relative"
                                                position="top"
                                            >
                                                <i
                                                    id="rs_data_reset"
                                                    className={`${restart_medium} icon-md color-primary-blue d-inline-block mt5`}
                                                    onClick={handleResetClick}
                                                />
                                            </RSTooltip>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        </>
                    ) : null}
                    <h4 className="mb20">Conversion attributes</h4>
                    <div className={attributesLoader.isFetching ? 'position-relative click-off' : ''}>
                        {attributesLoader.isLoading ? (
                            <div className="res-inputIcon-wrapper" aria-hidden="true">
                                <div className="segment-loader" />
                            </div>
                        ) : null}
                        <AttributeSelector data={OfflineConversion?.OfflineConversionAttributes} />
                    </div>
                    <h4 className="mb20">Grace period of conversion mapping</h4>
                    <div className="form-group">
                        <Row>
                            <Col sm={4}>
                                <RSInput
                                    control={control}
                                    name={'gracePeriod'}
                                    label="Grace period"
                                    onKeyDown={onlyNumbers}
                                    maxLength={3}
                                    required
                                    rules={{
                                        required: ENTER_GRACE_PERIOD,
                                        validate: (value) =>
                                            numberOfDaysValidtor(value, ENTER_VALID_GRACE_PERIOD),
                                    }}
                                />
                            </Col>
                            <Col sm={1} className="ml0 pl0">
                                <small className="mt4">days</small>
                            </Col>
                        </Row>
                    </div>
                    <h4 className="mb20">Conversion value</h4>
                    <div className="form-group mb0">
                        <Row>
                            <Col sm={4}>
                                <RSMultiSelect
                                    control={control}
                                    placeholder="Conversion value"
                                    name={'conversionValue'}
                                    rules={{
                                        required: ENTER_CONVERSION_VALUE,
                                    }}
                                    required
                                    data={OfflineConversion?.OfflineConversionValues}
                                    dataItemKey="dataAttributeId"
                                    textField="uiPrintableName"
                                    isLoading={conversionValuesLoader.isLoading}
                                    disabled={conversionValuesLoader.isFetching}
                                    handleChange={(e) => {
                                        let isFixedValue = e.value.filter((p) => p.uiPrintableName.startsWith('[['));

                                        if (isFixedValue?.length > 0) {
                                            setFixedValue(true);
                                        } else {
                                            setFixedValue(false);
                                        }
                                    }}
                                />
                            </Col>
                            {fixedValue && (
                                <Col sm={4}>
                                    <RSInput
                                        control={control}
                                        name={'conversionValueAttributeValues'}
                                        label="Fixed value"
                                        onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                        required
                                        maxLength={10}
                                        rules={{
                                            required: ENTER_CONVERSION_VALUE,
                                        }}
                                    />
                                </Col>
                            )}
                        </Row>
                    </div>
                        </>
                    )}
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            if (state?.campaignType === 'M') {
                                handleMdcCancel();
                            } else {
                                dispatch(resetCreateCommunication());
                                navigate('/communication', {
                                    replace: true,
                                    state: {
                                        index: 0,
                                    },
                                });
                            }
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        onClick={() => {
                            handleSubmit((data) => formSubmitHandler(data, 'save'))();
                        }}
                        className="color-primary-blue"
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                    >
                        {SAVE}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        isLoading={isNextLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                        onClick={() => {
                            if (!isDirty && !isValid) {
                                setNavigate_confirm(true);
                            } else {
                                handleSubmit((data) => formSubmitHandler(data, 'form', false))();
                            }
                        }}
                    >
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </form>
            {getWarningPopupMessage(failureApiErrors, dispatch)}
            <RSConfirmationModal
                show={navigate_confirm}
                text={IGNORE_CHANNEL}
                primaryButtonText={OK}
                handleClose={() => {
                    setNavigate_confirm(false);
                }}
                handleConfirm={() => {
                    handleNavigation();
                    setNavigate_confirm(false);
                }}
            />
            <RSConfirmationModal
                show={showResetConfirmation}
                text={ARE_YOU_SURE_WANT_TO_RESET}
                header={RESET}
                primaryButtonText={OK}
                secondaryButtonText={CANCEL}
                handleClose={handleResetCancel}
                handleConfirm={confirmReset}
            />
            <RSConfirmationModal
                show={showAdhocInfoModal}
                text="Offline Conversion will not be available for channels that include Ad-hoc lists."
                primaryButtonText="Proceed"
                handleClose={() => setShowAdhocInfoModal(false)}
                handleConfirm={() => setShowAdhocInfoModal(false)}
                secondaryButton={false}
                isCloseButton={false}
            />
        </FormProvider>
    );
};

export default OfflineConversion;
