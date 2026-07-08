import { encodeUrl } from 'Utils/modules/crypto';
import { selectIcon } from 'Utils/modules/display';
import { formatName } from 'Utils/modules/formatters';
import { NOTIFICATION_TAB_ID } from 'Utils/modules/navigation';
import { EMOJI_REPRESENTATION, MAX_LENGTH10, MAX_LENGTH250, MAX_LENGTH50, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { FRIENDLY_NAME_EMOJI_ONLY, GOAL_NAME, PLATFORMNAME, SELECT_APP_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { APP_NAME, CONFIRM_GOAL_SAVE_HEADER, CONFIRM_GOAL_SAVE_MESSAGE } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, useWatch, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { PushMobileContext } from '../../AppsList/context.js';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import usePermission from 'Hooks/usePersmission';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    get_mobilePush_GoalDataByMaster,
    get_mobilePush_GoalDataByID,
    save_mobilePush_GoalData,
    mobilePush_goalNameExists,
    getScreenNameList,
    getSubScreenNameList,
} from 'Reducers/preferences/CommunicationSettings/request';
import { FORM_INITIAL_STATE } from './constant.js';

import ListNameExists from 'Components/ListNameExists/index.jsx';
import RSConfirmationModal from 'Components/ConfirmationModal';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsWebGoalEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';



// const CONFIRM_GOAL_SAVE_HEADER = 'Confirm';
// const CONFIRM_GOAL_SAVE_MESSAGE = 'Once the goal is configured, it cannot be edited.';

const MobilePushGoalSettingCreate = ({ type, config, setFailedApi }) => {
        const context = useContext(PushMobileContext);

    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [tempData, setTempData] = useState([]);
    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        watch,
        reset,
        handleSubmit,
        setValue,
        getFieldState,
        trigger,
        setError,
        getValues,
        clearErrors,
        formState: { isValid, errors },
    } = methods;
    const [platformName] = watch(['platformName']);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [gridData, setGridData] = useState([]);
    const [updateGoalTypeData, setUpdateGoalTypeData] = useState(gridData?.goalType);
    const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);

    const [nameExists, setNameExists] = useState(true);
    const [goalName, setGoalName] = useState('');
    const goalNameWatch = watch('goalName');
    const [goalScreenData, setGoalScreenData] = useState({
        screenData: [],
        subScreenData: [],
    });
    const [subScreenData, setSubScreenData] = useState({});
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && !config?.isEdit;

    useEffect(() => {
        if (goalName?.toLowerCase().trim() === goalNameWatch?.toLowerCase().trim()) {
            setNameExists(true);
        } else {
            setNameExists(false);
        }
    }, [goalNameWatch, goalName]);

    useEffect(() => {
        if (Object.keys(gridData)?.length || gridData?.length) {
            setUpdateGoalTypeData(gridData?.goalType);
        }
    }, [gridData]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'mobileGoalsetting',
    });
    const mobileGoalWatch = useWatch({
        control,
        name: 'mobileGoalsetting',
    });
    const findDuplicatesObject = (array, keyPath) => {
        const seen = new Map(); // To track occurrences of eventId
        const duplicates = [];

        array.forEach((item) => {
            // const eventId = item.eventId.eventId;
            const key = keyPath.split('.').reduce((obj, key) => obj && obj[key], item); // Extract dynamic key value
            if (key !== undefined) {
                if (seen.has(key)) {
                    duplicates.push(item);
                } else {
                    seen.set(key, item);
                }
            }
        });
        return duplicates;
    };

    const getScreenList = async (name) => {
        const payload = {
            appGuid: config?.editState?.appId,
            deviceType: platformName || name,
            clientId,
            userId,
            departmentId,
        };
        const { status, data } = await dispatch(getScreenNameList({ payload }));
        if (status) {
            setGoalScreenData({
                screenData: data,
                subScreenData: [],
            });
        } else {
            setGoalScreenData({
                screenData: [],
                subScreenData: [],
            });
        }
    };
    const getSubScreenList = async (e, name, index) => {
        const payload = {
            appGuid: config?.editState?.appId,
            deviceType: platformName || name,
            screenName: e,
            clientId,
            userId,
            departmentId,
        };
        const { status, data } = await dispatch(getSubScreenNameList({ payload }));
        if (status) {
            setSubScreenData((prevState) => ({
                ...prevState,
                [index]: data,
            }));
            return data;
        }
        setSubScreenData({});
        return [];
    };

    const applyGoalData = useCallback(
        async (data) => {
            const tempDataGoal = JSON.parse(data[0]?.pushGoalJSON);
            const goalDetails = tempDataGoal?.map((item) => ({
                friendlyName: item?.friendlyName,
                goaltype: item?.goaltype,
                screen: item?.screen,
                subScreen: item?.subScreen,
                eventId: item?.eventId,
            }));
            setGoalName(data[0]?.pushNotifyGoalName);
            reset({
                goalName: data[0]?.pushNotifyGoalName,
                mobileGoalsetting: goalDetails,
                platformName: data[0]?.deviceType,
            });
            const goalTypeName = goalDetails[0]?.goaltype?.typeName;
            const screen = data[0]?.deviceType;
            if (goalTypeName === 'Screen') {
                await getScreenList(screen);
                await Promise.all(
                    goalDetails.map((item, ind) => getSubScreenList(item?.screen, screen, ind)),
                );
            }
        },
        [reset, config?.editState?.appId, clientId, userId, departmentId, dispatch],
    );

    const bootstrapPage = useCallback(() => {
        if (!sessionReady) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: async () => {
                const masterRes = await dispatch(
                    get_mobilePush_GoalDataByMaster({
                        clientId,
                        userId,
                        departmentId,
                        appGuid: config?.editState?.appId,
                    }),
                );
                if (masterRes?.status) {
                    setGridData(masterRes.data);
                } else {
                    setGridData({});
                }
                if (config?.isEdit) {
                    const goalRes = await dispatch(
                        get_mobilePush_GoalDataByID({
                            clientId,
                            userId,
                            departmentId,
                            pushNotifyGoalSettingId: config?.editState?.pushNotifyGoalSettingId,
                        }),
                    );
                    if (goalRes?.status) {
                        await applyGoalData(goalRes.data);
                    } else if (setFailedApi) {
                        setFailedApi('GetPushnotifyGoalSettingbyID');
                    }
                }
                return masterRes;
            },
            loaderConfig: fieldLoaderConfig,
            mode: config?.isEdit ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        clientId,
        userId,
        departmentId,
        config?.isEdit,
        config?.editState?.appId,
        config?.editState?.pushNotifyGoalSettingId,
        dispatch,
        applyGoalData,
        setFailedApi,
    ]);

    const bootstrapPageRef = useRef(bootstrapPage);
    bootstrapPageRef.current = bootstrapPage;

    useEffect(() => {
        if (!sessionReady) return undefined;
        bootstrapPageRef.current();
    }, [
        sessionReady,
        clientId,
        userId,
        departmentId,
        config?.isEdit,
        config?.editState?.appId,
        config?.editState?.pushNotifyGoalSettingId,
    ]);

    const addmobileGoalsettings = (index) => {
        if (index === 0) {
            if (mobileGoalWatch?.length) {
                const fieldCheck =
                    formatName(mobileGoalWatch[index]?.goaltype?.typeName) === 'screen'
                        ? ['friendlyName', 'goaltype', 'screen']
                        : ['friendlyName', 'goaltype', 'eventId'];
                let hasErrors = false;

                mobileGoalWatch.forEach((goal, index) => {
                    fieldCheck.forEach((field) => {
                        if (goal[field] === '') {
                            trigger(`mobileGoalsetting[${index}][${field}]`);
                            hasErrors = true;
                        }
                    });
                });

                if (!hasErrors) {
                    // const finalGoalTypeData = updateGoalTypeData?.filter((grid) => {
                    //     return mobileGoalWatch?.some((goal) => {
                    //         return formatName(grid.typeName) !== formatName(goal?.goaltype?.typeName);
                    //     });
                    // });

                    // setUpdateGoalTypeData(finalGoalTypeData);

                    append({
                        friendlyName: '',
                        goaltype: '',
                    });
                }
            }
        } else {
            remove(index);
        }
    };

    const handleConfirmSave = () => {
        setShowConfirmSaveModal(false);
        const formState = getValues();
        handleFormSubmit(formState);
    };

    const handleFormSubmit = async (formState) => {
        if (isSaveLoading) return;
        let webDomainData = formState?.mobileGoalsetting?.map((res) => ({
            ...res,
            goaltype: res?.goaltype?.typeId,
            eventId: res?.eventId?.eventId || 0,
        }));
        let id = type === 'create' ? formState?.appName?.pushNotifySettingId : config?.editState?.pushNotifySettingId;
        const payload = {
            departmentId,
            clientId,
            userId,
            pushNotifyGoalSettingId: config?.editState?.pushNotifyGoalSettingId || 0,
            // pushNotifyAppStoreId: id || 0,
            pushNotifyAppStoreId: config?.editState?.pushNotifySettingId || id,
            pushNotifyGoalName: formState?.goalName,
            deviceType: formState?.platformName,
            pushGoalJSON: JSON.stringify(formState?.mobileGoalsetting),
        };

        const { status } = await saveApi.refetch({
            fetcher: () => dispatch(save_mobilePush_GoalData(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (status) {
            if (typeof context === 'object') {
                context.setGridCreate((prev) => ({
                    ...prev,
                    showGrid: false,
                    pushMobileAction: {
                        edit: {
                            editState: config?.editState,
                            isEdit: false,
                        },
                        create: false,
                        show: false,
                    },
                    pushMobileGoalAction: {
                        edit: {
                            editState: [],
                            isEdit: false,
                        },
                        create: false,
                        showGrid: true,
                        show: false,
                    },
                }));
            } else {
                // navigate('/preferences/channel-settings', {
                //     state: { tab: '2', innerTab: '0' },
                // });
                // window.location.replace('/preferences/channel-settings', {
                //     state: { tab: 2, innerTab: '1' },
                // });
                const state = {
                    from: 'cs_preferences',
                    tab: COMMUNICATION_SETTINGS_VERTICAL_TAB.NOTIFICATION,
                    verticalTabId: VERTICAL_TAB_ID.NOTIFICATION,
                    notificationTabId: NOTIFICATION_TAB_ID.MOBILE,
                    mobileTabId: 'userDeviceSetup',
                };
                const encryptState = encodeUrl(state);
                let url = '/preferences/communication-settings';

                window.location.replace(`${url}?q=${encryptState}`, {
                    state,
                });
            }
        }
    };

    const handleOnChangeGoalType = async (e, index) => {
        const updateValue = formatName(e?.target.value?.typeName);
        if (updateValue === 'screen') {
            getScreenList();
            setValue(`mobileGoalsetting[${index}].eventId`, '');
            setValue(`mobileGoalsetting[${index}].screen`, '');
            setValue(`mobileGoalsetting[${index}].subScreen`, '');
        } else {
            setGoalScreenData({
                screenData: [],
                subScreenData: [],
            });
            setValue(`mobileGoalsetting[${index}].eventId`, '');
            setValue(`mobileGoalsetting[${index}].screen`, '');
            setValue(`mobileGoalsetting[${index}].subScreen`, '');
        }
    };

    const checkStatus = (statusResponse) => {
        const checkStatus = statusResponse?.every((status) => !status);
        if (!checkStatus) {
            return true;
        } else {
            return false;
        }
    };

    const isEmojiOnly = (value) => {
        if (!value || typeof value !== 'string') return false;
        const trimmed = value.trim();
        if (!trimmed) return false;
        const emojiRegex = new RegExp(EMOJI_REPRESENTATION.source, 'g');
        const withoutEmoji = trimmed.replace(emojiRegex, '').replace(/\s/g, '').trim();
        return withoutEmoji === '';
    };

    const handleValidateFriendlyName = (value, index) => {
        return mobileGoalWatch?.some((goal, ind) => {
            return index !== ind && formatName(goal?.friendlyName) === formatName(value);
        });
    };

    const handleValidateScreenAndSubScreen = (value, index, type) => {
        const updateValue = formatName(value);
        if (mobileGoalWatch?.length > 1) {
            const statusResponse = mobileGoalWatch?.map((goal, ind) => {
                const updateGoalScreen = formatName(goal.screen);
                const updateGoalSubScreen = formatName(goal.subScreen);
                if (index !== ind && updateGoalScreen === updateValue) {
                    return true;
                } else {
                    return false;
                }
            });
            return checkStatus(statusResponse);
        }
    };

    const handleValidateGoalType = (value, index) => {
        // let validationState = mobileGoalWatch.findIndex((list) => {
        //     let values = list?.goaltype?.typeName || list?.goaltype;
        //     return values === '';
        // });
        // if (validationState === -1 && mobileGoalWatch?.length > 1) {
        //     const formattedValue = formatName(value?.typeName);
        //     return mobileGoalWatch?.every((goal, ind) => {
        //         const formattedGoalType = formatName(goal?.goaltype?.typeName);
        //         return ind === index || formattedGoalType === formattedValue;
        //     })
        //         ? false
        //         : true;
        // }
        // return false;

        if (mobileGoalWatch?.length > 1) {
            const statusResponse = mobileGoalWatch?.map((goal, ind) => {
                const updateValue = formatName(value?.typeName);
                const updateGoalType = formatName(goal?.goaltype?.typeName);
                if (index !== ind && updateGoalType && updateGoalType !== updateValue) {
                    return true;
                } else {
                    return false;
                }
            });
            return checkStatus(statusResponse);
        } else {
            return false;
        }
    };
    const handleValidateEventType = (value, index) => {
        if (mobileGoalWatch?.length > 1) {
            const formattedValue = formatName(value?.eventListName);
            return mobileGoalWatch?.every((event, ind) => {
                const formattedEventName = formatName(event?.eventId?.eventListName);
                return ind === index || formattedEventName !== formattedValue;
            })
                ? false
                : true;
        }
        return false;
    };

    const onSaveButtonClick = async (e) => {
        e.preventDefault();
        const isValid = await trigger();
        if (isValid) {
            setShowConfirmSaveModal(true);
        }
    };

    return (
        <CommunicationSettingsWebGoalEditSkeletonGate
            isLoading={pageLoadApi.isFetching}
            isEditMode={Boolean(config?.isEdit)}
        >
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <>
                    {/* Content starts */}
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>Goal settings</h4>
                        </div>
                        <div className="form-group">
                            <Row>
                                {typeof context !== 'object' && (
                                    <Col sm={6} id="rs_MobilePushGoalSettingCreate_appName">
                                        <RSKendoDropDownList
                                            control={control}
                                            name="appName"
                                            label={APP_NAME}
                                            data={gridData?.appList}
                                            textField={'appName'}
                                            dataItemKey={'pushNotifySettingId'}
                                            required
                                            isLoading={showFieldLoader}
                                            rules={{
                                                required: SELECT_APP_NAME,
                                            }}
                                        />
                                    </Col>
                                )}
                                <Col sm={6}>
                                    {/* <RSInput
                                 id="rs_MobilePushGoalSettingCreate_goalName"
                                    name={'goalName'}
                                    placeholder={'Goal name'}
                                    control={control}
                                    required
                                    onKeyDown={onKeyChar}
                                    // maxLength={MAX_LENGTH50}
                                    // minLength={MAX_LENGTH10}
                                    rules={{
                                        required: 'Enter goal name',
                                        maxLength: {
                                            value: MAX_LENGTH250,
                                            message: 'Enter a Max value',
                                        },
                                        minLength: {
                                            value: MIN_LENGTH,
                                            message: 'Enter a Min value',
                                        },
                                    }}
                                /> */}
                                    <ListNameExists
                                        name="goalName"
                                        field="goalName"
                                        control={control}
                                        condition={(status) => {
                                            return !status?.status;
                                        }}
                                        nameExists={nameExists}
                                        placeholder={'Goal name'}
                                        rules={{
                                            required: 'Enter goal name',
                                        }}
                                        apiCallback={mobilePush_goalNameExists}
                                        extraPayload={{ pushNotifySettingId: config?.editState?.pushNotifySettingId }}
                                        customErrorMessage={'Enter goal name'}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col
                                    sm={6}
                                    className={`mt41 ${platformName ? 'click-off' : ''}`}
                                    id="rs_MobilePushGoalSettingCreate_platformName"
                                >
                                    <RSKendoDropDownList
                                        control={control}
                                        name="platformName"
                                        label={'Platform'}
                                        data={MOBILE_DEVICES}
                                        required
                                        rules={{
                                            required: PLATFORMNAME,
                                        }}
                                    />
                                </Col>
                                {platformName && (
                                    <Col className="align-content-end">
                                        <div className="d-flex">
                                            <RSTooltip
                                                //className="lh0 rs-tooltip-wrapper"
                                                text={`${'Reset'}`}
                                                position="top"
                                            >
                                                <i
                                                    className={`${restart_medium} icon-md color-primary-blue`}
                                                    onClick={() => {
                                                        setValue('mobileGoalsetting', FORM_INITIAL_STATE.defaultValues.mobileGoalsetting);
                                                        setValue('platformName', '');
                                                        setGoalScreenData({
                                                            screenData: [],
                                                            subScreenData: [],
                                                        });
                                                        clearErrors('mobileGoalsetting');
                                                    }}
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                            <h4 className="mt41">Goal tracking type</h4>
                            <div className="form-row">
                                {fields.map((field, index) => {
                                    // console.log('fields: ', fields);
                                    const goalType = mobileGoalWatch?.[index];
                                    // console.log('goalType: ', goalType);
                                    return (
                                        <div className="webGoalContainer mt30" key={field.id}>
                                            <Row>
                                                <Col sm={12}>
                                                    <div className="rsbr-block">
                                                        <Row>
                                                            <Col sm={3}>
                                                                <RSInput
                                                                    control={control}
                                                                    name={`mobileGoalsetting[${index}].friendlyName`}
                                                                    placeholder={'Friendly name'}
                                                                    id="rs_MobilePushGoalSettingCreate_Friendlyname"
                                                                    required
                                                                    maxLength={MAX_LENGTH250}
                                                                    rules={{
                                                                        required: GOAL_NAME,
                                                                        validate: (value) => {
                                                                            if (isEmojiOnly(value)) {
                                                                                return FRIENDLY_NAME_EMOJI_ONLY;
                                                                            }
                                                                            if (
                                                                                handleValidateFriendlyName(value, index)
                                                                            ) {
                                                                                return 'Duplicate friendly name';
                                                                            }
                                                                            return true;
                                                                        },
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col sm={3} id="rs_MobilePushGoalSettingCreate_Goaltype">
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    name={`mobileGoalsetting[${index}].goaltype`}
                                                                    label={'Goal type'}
                                                                    data={
                                                                        index === 0
                                                                            ? gridData?.goalType
                                                                            : updateGoalTypeData
                                                                    }
                                                                    textField={'typeName'}
                                                                    dataItemKey={'typeId'}
                                                                    required
                                                                    isLoading={showFieldLoader}
                                                                    handleChange={(e) =>
                                                                        handleOnChangeGoalType(e, index)
                                                                    }
                                                                    rules={{
                                                                        required: 'Select goal type',
                                                                        validate: (value) => {
                                                                            if (!value) {
                                                                                return 'Select goal type';
                                                                            }
                                                                            if (handleValidateGoalType(value, index)) {
                                                                                return 'Goal type should be same';
                                                                            } else {
                                                                                return true;
                                                                            }
                                                                        },
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col sm={6}>
                                                                <Row>
                                                                    {goalType?.goaltype?.typeId === 0 && (
                                                                        <Col sm={11}>
                                                                            <RSInput
                                                                                id="rs_MobilePushGoalSettingCreate_Allscreen"
                                                                                control={control}
                                                                                name={`mobileGoalsetting[${index}].screen`}
                                                                                placeholder={'All'}
                                                                                required
                                                                                disabled
                                                                            />
                                                                        </Col>
                                                                    )}
                                                                    {goalType?.goaltype?.typeId === 1 && (
                                                                        <>
                                                                            {' '}
                                                                            <Col sm={5}>
                                                                                {/* <RSInput
                                                                                    control={control}
                                                                                    name={`mobileGoalsetting[${index}].screen`}
                                                                                    placeholder={'Page URL screen'}
                                                                                    id="rs_MobilePushGoalSettingCreate_pageUrlScreen"
                                                                                    required
                                                                                    rules={{
                                                                                        required: 'Enter  screen',
                                                                                        validate: (value) => {
                                                                                            if (
                                                                                                handleValidateScreenAndSubScreen(
                                                                                                    value,
                                                                                                    index,
                                                                                                    'screen',
                                                                                                )
                                                                                            ) {
                                                                                                return 'Duplicate screen';
                                                                                            } else {
                                                                                                return true;
                                                                                            }
                                                                                        },
                                                                                    }}
                                                                                /> */}
                                                                                <RSKendoDropDownList
                                                                                    control={control}
                                                                                    name={`mobileGoalsetting[${index}].screen`}
                                                                                    label={'Page URL screen'}
                                                                                    data={goalScreenData?.screenData}
                                                                                    required
                                                                                    rules={{
                                                                                        required: 'Select URL screen',
                                                                                        validate: (value) => {
                                                                                            if (value === '') {
                                                                                                return 'Select URL screen';
                                                                                            } else if (
                                                                                                handleValidateScreenAndSubScreen(
                                                                                                    value,
                                                                                                    index,
                                                                                                    'screen',
                                                                                                )
                                                                                            ) {
                                                                                                return 'Duplicate screen';
                                                                                            } else {
                                                                                                return true;
                                                                                            }
                                                                                        },
                                                                                    }}
                                                                                    handleChange={async (e) => {
                                                                                        getSubScreenList(
                                                                                            e?.target.value,
                                                                                            '',
                                                                                            index,
                                                                                        );
                                                                                        setValue(
                                                                                            `mobileGoalsetting[${index}].subScreen`,
                                                                                            '',
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </Col>{' '}
                                                                            <Col sm={6}>
                                                                                {/* <RSInput
                                                                                    control={control}
                                                                                    name={`mobileGoalsetting[${index}].subScreen`}
                                                                                    placeholder={'Page URL subscreen'}
                                                                                    id="rs_MobilePushGoalSettingCreate_pageUrlsubScreen"
                                                                                    required
                                                                                    rules={{
                                                                                        required: 'Enter sub screen',
                                                                                        validate: (value) => {
                                                                                            if (
                                                                                                handleValidateScreenAndSubScreen(
                                                                                                    value,
                                                                                                    index,
                                                                                                    'subscreen',
                                                                                                )
                                                                                            ) {
                                                                                                return 'Duplicate sub screen';
                                                                                            } else {
                                                                                                return true;
                                                                                            }
                                                                                        },
                                                                                    }}
                                                                                /> */}

                                                                                <RSKendoDropDownList
                                                                                    control={control}
                                                                                    name={`mobileGoalsetting[${index}].subScreen`}
                                                                                    label={'Page URL subscreen'}
                                                                                    data={subScreenData[index]}
                                                                                    rules={
                                                                                        {
                                                                                            //required: 'Select URL subscreen',
                                                                                            // validate: (value) => {
                                                                                            //     if (
                                                                                            //         handleValidateScreenAndSubScreen(
                                                                                            //             value,
                                                                                            //             index,
                                                                                            //             'subscreen',
                                                                                            //         )[index]
                                                                                            //     ) {
                                                                                            //         return 'Duplicate screen';
                                                                                            //     } else {
                                                                                            //         return true;
                                                                                            //     }
                                                                                            // },
                                                                                        }
                                                                                    }
                                                                                />
                                                                            </Col>
                                                                        </>
                                                                    )}
                                                                    {goalType?.goaltype?.typeId === 2 && (
                                                                        <Col
                                                                            sm={5}
                                                                            id="rs_MobilePushGoalSettingCreate_eventtype"
                                                                        >
                                                                            <RSKendoDropDownList
                                                                                control={control}
                                                                                name={`mobileGoalsetting[${index}].eventId`}
                                                                                label={'Event type'}
                                                                                data={gridData?.eventList}
                                                                                textField={'eventListName'}
                                                                                dataItemKey={'eventId'}
                                                                                required
                                                                                isLoading={showFieldLoader}
                                                                                rules={{
                                                                                    required: 'Select event type',
                                                                                    validate: (value) => {
                                                                                        if (!value) {
                                                                                            return 'Select event type';
                                                                                        }
                                                                                        if (
                                                                                            handleValidateEventType(
                                                                                                value,
                                                                                                index,
                                                                                            )
                                                                                        ) {
                                                                                            return 'Duplicate event type';
                                                                                        } else {
                                                                                            return true;
                                                                                        }
                                                                                    },
                                                                                }}
                                                                            />
                                                                        </Col>
                                                                    )}
                                                                    <Col sm={1} className="d-flex pl0 mt5">
                                                                        <div
                                                                            className={`rs-was-icon  ${index === 0 &&
                                                                                    errors['mobileGoalsetting']?.length
                                                                                    ? 'click-off'
                                                                                    : ''
                                                                                }`}
                                                                        >
                                                                            <RSTooltip
                                                                                text={index === 0 ? 'Add' : 'Delete'}
                                                                                position="top"
                                                                            >
                                                                                <i
                                                                                    onClick={() =>
                                                                                        addmobileGoalsettings(index)
                                                                                    }
                                                                                    className={`ml9 ${selectIcon(
                                                                                        index,
                                                                                    )} icon-md cp ${fields?.length > 9 && index == 0
                                                                                            ? 'click-off'
                                                                                            : ''
                                                                                        } ${fields?.length < 4 && index > 0
                                                                                            ? 'click-off'
                                                                                            : ''
                                                                                        }`}
                                                                                ></i>
                                                                            </RSTooltip>{' '}
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
                <div className="buttons-holder pref-cs-buttons-outside mb0">
                    <RSSecondaryButton
                        type="button"
                        blockInteraction={isSaveLoading}
                        onClick={() => {
                            if (typeof context === 'object') {
                                context.setGridCreate((prev) => ({
                                    ...prev,
                                    showGrid: false,
                                    pushMobileAction: {
                                        edit: {
                                            editState: config?.editState,
                                            isEdit: false,
                                        },
                                        create: false,
                                        show: false,
                                    },
                                    pushMobileGoalAction: {
                                        edit: {
                                            editState: [],
                                            isEdit: false,
                                        },
                                        create: false,
                                        showGrid: true,
                                        show: false,
                                    },
                                }));
                            } else {
                                const state = {
                    from: 'cs_preferences',
                    tab: COMMUNICATION_SETTINGS_VERTICAL_TAB.NOTIFICATION,
                    verticalTabId: VERTICAL_TAB_ID.NOTIFICATION,
                    notificationTabId: NOTIFICATION_TAB_ID.MOBILE,
                    mobileTabId: 'userDeviceSetup',
                };
                                const encryptState = encodeUrl(state);
                                let url = '/preferences/communication-settings';

                                window.location.replace(`${url}?q=${encryptState}`, {
                                    state,
                                });
                                // window.location.replace('/preferences/channel-settings', {
                                //     state: { tab: 2, innerTab: '1' },
                                // });
                                // navigate('/preferences/channel-settings', {
                                //     state: { tab: '2', innerTab: '0' },
                                // });
                            }
                        }}
                        id="rs_MobilePushGoalSettingCreate_Cancel"
                    >
                        Cancel
                    </RSSecondaryButton>
                    {addAccess && (
                        <RSPrimaryButton
                            type="button"
                            onClick={onSaveButtonClick}
                            id="rs_MobilePushGoalSettingCreate_Save"
                            className={`${config?.isEdit ? 'click-off' : ''}`}
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents
                        >
                            {config?.isEdit ? 'Update' : 'Save'}
                        </RSPrimaryButton>
                    )}
                </div>
            </form>
            <RSConfirmationModal
                show={showConfirmSaveModal}
                header={CONFIRM_GOAL_SAVE_HEADER}
                text={CONFIRM_GOAL_SAVE_MESSAGE}
                primaryButtonText="Save"
                secondaryButtonText="Cancel"
                handleClose={() => setShowConfirmSaveModal(false)}
                handleConfirm={handleConfirmSave}
                isLoading={isSaveLoading}
                blockBodyPointerEvents
            />
        </FormProvider>
        </CommunicationSettingsWebGoalEditSkeletonGate>
    );
};

export default MobilePushGoalSettingCreate;
