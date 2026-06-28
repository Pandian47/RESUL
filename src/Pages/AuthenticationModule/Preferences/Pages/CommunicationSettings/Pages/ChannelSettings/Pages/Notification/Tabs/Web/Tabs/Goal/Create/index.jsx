import { encodeUrl } from 'Utils/modules/crypto';
import { selectIcon } from 'Utils/modules/display';
import { formatName } from 'Utils/modules/formatters';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { NOTIFICATION_TAB_ID } from 'Utils/modules/navigation';
import { MAX_LENGTH15, MAX_LENGTH25, MAX_LENGTH50, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { FRIENDLY_NAME_EMOJI_ONLY, GOAL_NAME, SELECT_DOMAIN_NAME as SELECT_DOMAIN_NAME_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { SELECT_DOMAIN_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useFieldArray, useWatch, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import { Push_WebContext } from '../../Web/Context';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import usePermission from 'Hooks/usePersmission';
import RSTooltip from 'Components/RSTooltip';
import { EMOJI_REPRESENTATION } from 'Constants/GlobalConstant/Regex';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getWebPushEventData,
    saveWebPushGoalData,
    getWebPushGoalEventDataById,
    webPush_goalNameExists,
} from 'Reducers/preferences/CommunicationSettings/request';
import { FORM_INITIAL_STATE } from './constant.js';
import { WEB_FORM_ACTIONS_PORTAL_ID } from '../../../constant';

import ListNameExists from 'Components/ListNameExists';
import { IsValidURL } from 'Utils/HookFormValidate';
import RSConfirmationModal from 'Components/ConfirmationModal';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsWebGoalEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';


const WEB_GOAL_CREATE_FORM_ID = 'rs_WebPushGoalSettingsCreate_Form';

const CONFIRM_GOAL_SAVE_HEADER = 'Confirm';
const CONFIRM_GOAL_SAVE_MESSAGE = 'Once the goal is configured, it cannot be edited.';

const WebPushGoalSettingsCreate = ({ type, config, setFailedApi }) => {
    const context = useContext(Push_WebContext);

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
        getValues,
        clearErrors,
        formState: { isValid },
    } = methods;
    const [domainName] = watch(['domainName']);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [nameExists, setNameExists] = useState(true);
    const goalNameWatch = watch('goalName');
    const [goalName, setGoalName] = useState('');
    const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
    const domainUrl = context?.gridCreate?.domainUrl;
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

    const applyGoalData = useCallback(
        (data) => {
            const tempDataGoal = JSON.parse(data[0]?.GoalTracking);
            const goalDetails = tempDataGoal?.map((item) => ({
                friendlyName: item?.friendlyName,
                goaltype: item?.goaltype,
                pageUrl: item?.pageUrl,
                eventId: item?.eventId,
            }));
            setGoalName(data[0]?.goalName);
            reset({
                goalName: data[0]?.goalName,
                webGoalsetting: goalDetails,
            });
        },
        [reset],
    );

    const bootstrapPage = useCallback(() => {
        if (!sessionReady) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: async () => {
                const eventsRes = await dispatch(
                    getWebPushEventData({
                        clientId,
                        userId,
                        departmentId,
                        webnotifySettingId: config?.editState?.webNotifySettingId,
                        domainName: config?.editState?.domainName,
                    }),
                );
                if (eventsRes?.status) {
                    setTempData(eventsRes.data);
                } else {
                    setTempData({});
                }
                if (config?.isEdit) {
                    const goalRes = await dispatch(
                        getWebPushGoalEventDataById({
                            clientId,
                            userId,
                            departmentId,
                            webnotifyGoalSettingId: config?.editState?.webnotifyGoalSettingId,
                            domainName: config?.editState?.domainName,
                        }),
                    );
                    if (goalRes?.status) {
                        applyGoalData(goalRes.data);
                    } else if (setFailedApi) {
                        setFailedApi('GetWebnotifyGoalSettingbyID');
                    }
                }
                return eventsRes;
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
        config?.editState?.webNotifySettingId,
        config?.editState?.domainName,
        config?.editState?.webnotifyGoalSettingId,
        dispatch,
        pageLoadApi.refetch,
        applyGoalData,
        setFailedApi,
    ]);

    useEffect(() => {
        bootstrapPage();
    }, [bootstrapPage]);
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'webGoalsetting',
    });
    const webGoalWatch = useWatch({
        control,
        name: 'webGoalsetting',
    });

    const addwebGoalSettings = async (index) => {
        if (index === 0) {
            /**
             * Validate ALL fields for ALL rows before adding a new row.
             * Because every field in `webGoalsetting` has its own `rules`
             * (friendly name, goal type, and based on goal type: page URL / event type),
             * calling trigger on the field-array name will run validation
             * for every nested field according to its goal type.
             */
            const isValid = await trigger('webGoalsetting');
            // If any field is empty / invalid, errors are shown and we do NOT add a new row
            if (!isValid) {
                return;
            }

            // All validations passed, add a new empty row
            append({
                friendlyName: '',
                goaltype: 0,
                pageUrl: '',
                eventId: 0,
            });
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
        let webDomainData = formState?.webGoalsetting?.map((res) => ({
            ...res,
            goaltype: res?.goaltype?.typeId,
            eventId: res?.eventId?.eventId || 0,
        }));
        let id = type === 'create' ? domainName?.domainId : config?.editState?.webNotifySettingId || 0;
        const payload = {
            webnotifySettingId: config?.editState?.webNotifySettingId || id,
            // webnotifySettingId: id || 0,
            goalName: formState?.goalName,
            departmentId,
            clientId,
            userId,
            GoalTracking: JSON.stringify(formState?.webGoalsetting), //webDomainData,
        };
        // console.log('payload: ', payload);
        const { status } = await saveApi.refetch({
            fetcher: () => dispatch(saveWebPushGoalData(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (status) {
            if (typeof context === 'object') {
                context.setGridCreate((prev) => ({
                    ...prev,
                    showGrid: false,
                    pushWebAction: {
                        edit: {
                            editState: config?.editState,
                            isEdit: false,
                        },
                        create: false,
                        show: false,
                    },
                    pushWebGoalAction: {
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
                //     state: { tab: '2', innerTab: '1' },
                // });
                const state = {
                    from: 'cs_preferences',
                    tab: COMMUNICATION_SETTINGS_VERTICAL_TAB.NOTIFICATION,
                    verticalTabId: VERTICAL_TAB_ID.NOTIFICATION,
                    notificationTabId: NOTIFICATION_TAB_ID.WEB,
                    innerTab: 0,
                };
                const encryptState = encodeUrl(state);
                let url = '/preferences/communication-settings';

                window.location.replace(`${url}?q=${encryptState}`, {
                    state,
                });
            }
        }
    };

    const handlePageUrlValue = (value, index) => {
        const status = IsValidURL(value);
        const isError = status === 'Enter a valid  URL';
        const splitInputValue = value.split('/');
        const splitDomainUrlValue = domainUrl.split('/');
        const checkPageUrlValue =
            splitInputValue?.length && `${splitInputValue[0]}/${splitInputValue[1]}/${splitInputValue[2]}`;
        const checkDomainValue =
            splitDomainUrlValue?.length &&
            `${splitDomainUrlValue[0]}/${splitDomainUrlValue[1]}/${splitDomainUrlValue[2]}`;
        const isDuplicateURL =  webGoalWatch?.some((goal, ind) => {
            return index !== ind && formatName(goal?.pageUrl) === formatName(value);
        });
        if (isError) {
            return 'Enter a valid URL';
        } else if (!isError && checkPageUrlValue !== checkDomainValue) {
            return 'Domain not matched';
        }else if(isDuplicateURL){
            return 'Duplicate URL'
        } else {
            return true;
        }
    };

    const isEmojiOnly = (value) => {
        if (!value || typeof value !== 'string') return false;
        const trimmed = value.trim();
        if (!trimmed) return false;
        const withoutEmoji = trimmed.replace(EMOJI_REPRESENTATION, '').replace(/\s/g, '').trim();
        return withoutEmoji === '';
    };

    const handleValidateFriendlyName = (value, index) => {
        return webGoalWatch?.some((goal, ind) => {
            return index !== ind && formatName(goal?.friendlyName) === formatName(value);
        });
    };
    const handleValidateEvent = (value, index) => {
        return webGoalWatch?.some((goal, ind) => {
            return index !== ind && (goal?.eventId?.eventId === value?.eventId) && value?.eventId
        });
    };
    
    const onSaveButtonClick = async (e) => {
        e.preventDefault();
        const isValid = await trigger();
        if (isValid) {
            setShowConfirmSaveModal(true);
        }
    };

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(WEB_FORM_ACTIONS_PORTAL_ID));

        return () => {
            setActionsPortalTarget(null);
        };
    }, []);

    const handleCancelClick = () => {
        if (isSaveLoading) return;
        if (typeof context === 'object') {
            context.setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                pushWebAction: {
                    edit: {
                        editState: config?.editState,
                        isEdit: false,
                    },
                    create: false,
                    show: false,
                },
                pushWebGoalAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: false,
                    showGrid: true,
                    show: false,
                },
            }));
            return;
        }

        const navState = {
            from: 'cs_preferences',
            tab: COMMUNICATION_SETTINGS_VERTICAL_TAB.NOTIFICATION,
            verticalTabId: VERTICAL_TAB_ID.NOTIFICATION,
            notificationTabId: NOTIFICATION_TAB_ID.WEB,
            innerTab: 0,
        };
        const encryptState = encodeUrl(navState);
        const url = '/preferences/communication-settings';

        window.location.replace(`${url}?q=${encryptState}`, {
            state: navState,
        });
    };

    const renderFormActions = () => (
        <div className="buttons-holder pref-cs-buttons-outside mt20">
            <RSSecondaryButton
                type="button"
                blockInteraction={isSaveLoading}
                onClick={handleCancelClick}
                id="rs_WebPushGoalSettingsCreate_Cancel"
            >
                Cancel
            </RSSecondaryButton>
            {addAccess && (
                <RSPrimaryButton
                    type="button"
                    disabledClass={`${config?.isEdit ? 'pe-none click-off' : ''}`}
                    id="rs_WebPushGoalSettingsCreate_Save"
                    onClick={onSaveButtonClick}
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents
                >
                    {config?.isEdit ? 'Update' : 'Save'}
                </RSPrimaryButton>
            )}
        </div>
    );

    const formActions = actionsPortalTarget ? createPortal(renderFormActions(), actionsPortalTarget) : null;

    return (
        <CommunicationSettingsWebGoalEditSkeletonGate
            isLoading={pageLoadApi.isFetching}
            isEditMode={Boolean(config?.isEdit)}
        >
        <FormProvider {...methods}>
            <form id={WEB_GOAL_CREATE_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
                <>
                    {/* Content starts */}
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>Goal settings</h4>
                        </div>
                        <div className="form-group mb0">
                            <Row>
                                {typeof context !== 'object' && (
                                    <Col sm={6} id="rs_WebPushGoalSettingsCreate_domainName">
                                        <RSKendoDropDownList
                                            control={control}
                                            name="domainName"
                                            label={SELECT_DOMAIN_NAME}
                                            data={tempData?.domainList}
                                            textField={'domainName'}
                                            dataItemKey={'domainId'}
                                            required
                                            isLoading={showFieldLoader}
                                            rules={{
                                                required: SELECT_DOMAIN_NAME_MSG,
                                            }}
                                        />
                                    </Col>
                                )}
                                <Col sm={6}>
                                    {/* <RSInput
                                    name={'goalName'}
                                    id="rs_WebPushGoalSettingsCreate_goalName"
                                    placeholder={'Goal name'}
                                    control={control}
                                    required
                                    onKeyDown={onKeyChar}
                                    // maxLength={MAX_LENGTH15}
                                    rules={{
                                        required: 'Enter goal name',
                                        maxLength: {
                                            value: MAX_LENGTH25,
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
                                        condition={(data) => {
                                            const { status } = data;
                                            if (status) {
                                                return false;
                                            } else {
                                                return true;
                                            }
                                        }}
                                        nameExists={nameExists}
                                        placeholder={'Goal name'}
                                        rules={{
                                            required: 'Enter goal name',
                                        }}
                                        apiCallback={webPush_goalNameExists}
                                        extraPayload={{ webnotifySettingId: config?.editState?.webNotifySettingId }}
                                        customErrorMessage={'Enter goal name'}
                                    />
                                </Col>
                            </Row>
                            <h4 className="mt30">Goal tracking type</h4>
                            <div className={`form-group ${config?.isEdit ? 'pe-none click-off' : ''} mb0`}>
                                {fields.map((field, index) => {
                                    const goalType = webGoalWatch?.[index];

                                                                        return (
                                        <div className="webGoalContainer form-group" key={field.id}>
                                            <Row>
                                                <Col sm={12}>
                                                    <div className="rsbr-block">
                                                        <Row>
                                                            <Col sm={3}>
                                                                <RSInput
                                                                    control={control}
                                                                    name={`webGoalsetting[${index}].friendlyName`}
                                                                    id="rs_WebPushGoalSettingsCreate_friendlyname"
                                                                    placeholder={'Friendly name'}
                                                                    required
                                                                    maxLength={MAX_LENGTH50}
                                                                    rules={{ 
                                                                        required: GOAL_NAME ,
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
                                                                    onKeyDown={charNumUnderScore}
                                                                />
                                                            </Col>
                                                            <Col sm={3}>
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    name={`webGoalsetting[${index}].goaltype`}
                                                                    label={'Goal type'}
                                                                    id="rs_WebPushGoalSettingsCreate_goaltype"
                                                                    data={tempData?.goalType}
                                                                    textField={'typeName'}
                                                                    dataItemKey={'typeId'}
                                                                    required
                                                                    isLoading={showFieldLoader}
                                                                    handleChange={() => {
                                                                        setValue(`webGoalsetting[${index}].pageUrl`, '')
                                                                        setValue(`webGoalsetting[${index}].eventId`, '')
                                                                        clearErrors(`webGoalsetting[${index}].pageUrl`)
                                                                        clearErrors(`webGoalsetting[${index}].eventId`)
                                                                    }}
                                                                    rules={{
                                                                        required: 'Select goal type',
                                                                         validate: (value) => {
                                                                            if ((!value)) {
                                                                                return 'Select Goal type';
                                                                            }                                                                            
                                                                            return true;
                                                                        },
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col sm={6}>
                                                                <Row>
                                                                    {goalType?.goaltype === 0 && (
                                                                        <Col sm={11}>
                                                                            <RSInput
                                                                                control={control}
                                                                                name={`webGoalsetting[${index}].pageUrl`}
                                                                                placeholder={'All'}
                                                                                id="rs_WebPushGoalSettingsCreate_Allpageurl"
                                                                                required
                                                                                disabled
                                                                            />
                                                                        </Col>
                                                                    )}{' '}
                                                                    {goalType?.goaltype?.typeId === 1 && (
                                                                        <Col sm={11}>
                                                                            <RSInput
                                                                                control={control}
                                                                                name={`webGoalsetting[${index}].pageUrl`}
                                                                                placeholder={'Page URL'}
                                                                                id="rs_WebPushGoalSettingsCreate_pageurl"
                                                                                required
                                                                                rules={{
                                                                                    required: 'Enter  page URL',
                                                                                    validate: (value) => {
                                                                                        return handlePageUrlValue(
                                                                                            value, index
                                                                                        );
                                                                                    },
                                                                                }}
                                                                            />
                                                                        </Col>
                                                                    )}
                                                                    {goalType?.goaltype?.typeId === 2 && (
                                                                        <Col
                                                                            sm={11}
                                                                            id="rs_WebPushGoalSettingsCreate_eventtype"
                                                                        >
                                                                            <RSKendoDropDownList
                                                                                control={control}
                                                                                name={`webGoalsetting[${index}].eventId`}
                                                                                label={'Event type'}
                                                                                data={tempData?.eventList?.map(
                                                                                    (item, idx) => ({
                                                                                        ...item,
                                                                                        eventId: idx + 1,
                                                                                    }),
                                                                                )}
                                                                                textField={'EventListName'}
                                                                                dataItemKey={'eventId'}
                                                                                required
                                                                                isLoading={showFieldLoader}
                                                                                rules={{
                                                                                    required: 'Select event type',
                                                                                    validate: (value) => {
                                                                                        if (
                                                                                            handleValidateEvent(value, index)
                                                                                        ) {
                                                                                            return 'Duplicate event';
                                                                                        } else {
                                                                                            return true;
                                                                                        }

                                                                                    },
                                                                                }}
                                                                            />
                                                                        </Col>
                                                                    )}
                                                                    <Col sm={1} className="d-flex pl0">
                                                                        <div className="rs-was-icon">
                                                                            <RSTooltip
                                                                                text={index === 0 ? 'Add' : 'Delete'}
                                                                                position="top"
                                                                                className="lh0 position-relative top2"
                                                                            >
                                                                                <i
                                                                                    onClick={() =>
                                                                                        addwebGoalSettings(index)
                                                                                    }
                                                                                    className={` ${selectIcon(
                                                                                        index,
                                                                                    )} icon-md cp ${
                                                                                        fields?.length > 9 && index == 0
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
        {formActions}
        </CommunicationSettingsWebGoalEditSkeletonGate>
    );
};

export default WebPushGoalSettingsCreate;
