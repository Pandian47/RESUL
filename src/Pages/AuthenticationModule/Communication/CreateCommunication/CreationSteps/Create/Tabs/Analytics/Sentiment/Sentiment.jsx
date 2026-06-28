import { ENTER_ORM_PROFILE_NAME, EXIST_ORM_PROFILE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, IGNORE_CHANNEL, NEXT, OK, ORM_PROFILE_CREATED, ORM_PROFILE_NAME, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RSPPophover from 'Components/RSPPophover';
import RSInput from 'Components/FormFields/RSInput';
import RSTagsComponent from 'Components/RSTagsComponent';
import useQueryParams from 'Hooks/useQueryParams';

import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import { useNavigate } from 'react-router-dom';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getAuthoringSaveButtonType, useAuthoringChannelSaveLoader } from 'Components/Skeleton/pages/communication/authoring';
import { formInitialState } from './constant';
import { resetCreateCommunication, updateTab } from 'Reducers/communication/createCommunication/create/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { availableTabs } from '../../../constant';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    editSentimentORMChannel,
    saveSentimentORMChannel,
    nameSentimentORMExistChannel,
} from 'Reducers/communication/createCommunication/Create/request';
const Sentiment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));

    const methods = useForm(formInitialState);
    const {
        control,
        watch,
        setValue,
        register,
        setError,
        clearErrors,
        reset,
        formState: { errors, dirtyFields, isValid },
        handleSubmit,
    } = methods;
    const {
        tabsState: { analytics: tabAnalyticsState },
        activeTabs,
        isDirty,
        ORMAnalytics,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();
    const [showORMProfileModal, setORMProfileModal] = useState(false);
    const [keywords, exceptionList, range] = watch(['keywords', 'exceptionList', 'range']);
    const keywordsError = _get(errors, 'keywords.message', '');
    const exceptionListError = _get(errors, 'exceptionList.message', '');
    const rangeError = _get(errors, 'range.message', '');

    const validateFormFields = () => {
        if (!keywords?.length) {
            setError('keywords', {
                type: 'custom',
                message: 'Enter keywords',
            });
            return false;
        }
        return true;
    };

    const handleNavigation = () => {
        let { analyticsTypes = [] } = state;
        let tempTabsIndex = [];
        const tabIndex = tabAnalyticsState?.currentTab + 1;
        const tempTabs = _map(analyticsTypes, (id) => {
            const { label } = getChannelId(id);
            const normalizedLabel = label.toLowerCase();
            if (normalizedLabel === 'app analytics') return 'app';
            if (normalizedLabel === 'webinar') return 'events';
            return normalizedLabel;
        });
        const tempTabsName = _map(availableTabs['analytics'], (index, value) => {
            if (tempTabs.includes(index)) {
                tempTabsIndex.push(value);
            }
        });
        if (tempTabs?.length === tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1) {
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
                    data: {
                        tabName: tempTabs[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], //tempTabs[tabIndex], //availableTabs['analytics'][tabIndex],
                        currentTab: tempTabsIndex[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], // tempTabsIndex[tabIndex], // tabIndex,
                    },
                }),
            );
        }
    };

    const formSubmitHandler = async (data, type) => {
                const payload = {
            clientId,
            departmentId,
            userId,
            ormProfile: {
                campaignId: state?.campaignId,
                trackWords: keywords.toString(),
                omitterWords: exceptionList.toString(),
                ormProfileId: ormProfileId || 0,
                profileName: profileName,
                trackingCity: '',
                apiProfileId: 0,
                preserveOld: false,
                mentionval: range,
            },
        };
        const { status } = await runSave(getAuthoringSaveButtonType(type), () =>
            dispatch(saveSentimentORMChannel({ payload, loading: false })),
        );
        if (status) {
            if (type === 'save') {
                dispatch(resetCreateCommunication());
                navigate('/communication', {
                    index: 0,
                });
            } else {
                handleNavigation();
            }
        }
    };
    useEffect(() => {
        if (state) {
            const payload = {
                clientId,
                userId,
                departmentId,
                campaignId: state.campaignId,
            };
            dispatch(editSentimentORMChannel({ payload }));
        }
    }, [state]);
    useEffect(() => {
        if (!_isEmpty(ORMAnalytics?.ormData)) {
                        const { ormData } = ORMAnalytics;

            const temp = {};

            temp.range = ormData?.mentionval;
            temp.exceptionList = ormData?.omitterWords.split(',');
            temp.keywords = ormData?.trackWords.split(',');
            temp.profileName = ormData?.profileName;
            temp.ormProfileId = ormData?.ormProfileId;
                        reset((formState) => ({ ...formState, ...temp }));
        }
    }, [ORMAnalytics]);
    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit((data) => formSubmitHandler(data, 'form'))}
                onKeyDown={(e) => {
                    e.key === 'Enter' && e.preventDefault();
                }}
                className="rsv-tabs-content tab-content position-relative"
            >
                <div className="box-design bd-top-border">
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">ORM profile name</label>
                            </Col>
                            <Col sm={7}>
                                <RSInput
                                    control={control}
                                    name={'profileName'}
                                    placeholder={ORM_PROFILE_NAME}
                                    required
                                    rules={{
                                        required: ENTER_ORM_PROFILE_NAME,
                                    }}
                                    handleOnBlur={async ({ target: { value } }) => {
                                        const { status } = await dispatch(
                                            nameSentimentORMExistChannel({
                                                payload: {
                                                    profileName: value,
                                                    clientId,
                                                    userId,
                                                    departmentId,
                                                    campaignId: state.campaignId,
                                                },
                                                //  setError,
                                                //  name: `profileName`,
                                            }),
                                        );
                                        if (status) {
                                            setError(`profileName`, {
                                                type: 'custom',
                                                message: EXIST_ORM_PROFILE_NAME,
                                            });
                                        } else {
                                            clearErrors(`profileName`);
                                        }
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">keywords to track</label>
                            </Col>
                            <Col sm={7}>
                                {!!keywordsError && <span>{keywordsError}</span>}
                                <div className="rs-tags-container">
                                    <RSTagsComponent
                                        updatedTags={(tags) => {
                                            if (keywordsError) {
                                                clearErrors('keywords');
                                            }
                                            setValue('keywords', tags);
                                        }}
                                        tags={keywords}
                                        isRefresh={false}
                                        isNoOfCharacters
                                        required
                                        maxLength={120}
                                    />
                                    <div className="rstc-icon-inside-box bottom-0 right1">
                                        <RSPPophover
                                            text={parse(
                                                'These are the words which will be searched for the keyword profile. </br></br>Multiple keywords need to be comma (,) separated<br><br>For exact match or phrases, enclose keyword in double quotes. Example-"Smartphone"',
                                            )}
                                        >
                                            <i className={`${circle_question_mark_mini} icon-xs color-primary-blue editor-help-icon`} id='circle_question_mark'/>
                                        </RSPPophover>
                                    </div>
                             
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">Exceptions list</label>
                            </Col>
                            <Col sm={7}>
                                {!!exceptionListError && <span>{exceptionListError}</span>}
                                <div className="rs-tags-container">
                                    <RSTagsComponent
                                        updatedTags={(tags) => {
                                            if (exceptionListError) {
                                                clearErrors('exceptionList');
                                            }
                                            setValue('exceptionList', tags);
                                        }}
                                        tags={exceptionList}
                                        isRefresh={false}
                                        isNoOfCharacters
                                        required
                                        maxLength={120}
                                    />
                                    <div className="rstc-icon-inside-box bottom-0 right1">
                                        <RSPPophover text={'These are the words which will not be searched.'}>
                                        <i className={`${circle_question_mark_mini} icon-xs color-primary-blue editor-help-icon`} id='circle_question_mark' />
                                        </RSPPophover>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left" htmlFor="range">
                                    Number of mentions
                                </label>
                            </Col>
                            <Col sm={7}>
                                {rangeError && <p>{rangeError}</p>}
                                <div>
                                    <input
                                        name="mentionval"
                                        type="range"
                                        min="500"
                                        max="5000"
                                        className="pl15"
                                        {...register('range', {
                                            validate: (range) => (Number(range) < 500 ? 'Select Range' : true),
                                        })}
                                    />
                                </div>
                                <small className="position-relative top-10 text-center">{range}</small>
                            </Col>
                        </Row>
                    </div>
                    <Row className="mb20">
                        <Col sm={{ offset: 4 }}>
                            <span
                                onClick={() => {
                                    if (isValid) {
                                        const formValidState = validateFormFields();
                                        if (formValidState) {
                                            setORMProfileModal(true);
                                        }
                                    }
                                }}
                            >
                                <RSPrimaryButton type="submit">Add Profile</RSPrimaryButton>
                            </span>
                        </Col>
                    </Row>
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            dispatch(resetCreateCommunication());
                            navigate('/communication', {
                                replace: true,
                                state: {
                                    index: 0,
                                },
                            });
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        className="color-primary-blue"
                        //type="submit"
                        onClick={() => {
                            handleSubmit((data) => formSubmitHandler(data, 'save'))();
                        }}
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
                                handleSubmit((data) => formSubmitHandler(data, 'form'))();
                            }
                        }}
                    >
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </form>
            {/* Modals */}
            <RSModal
                show={showORMProfileModal}
                size="md"
                handleClose={() => setORMProfileModal(false)}
                header={'ORM profile'}
                body={<p>{ORM_PROFILE_CREATED}</p>}
                footer={<RSPrimaryButton onClick={() => setORMProfileModal(false)}>{OK}</RSPrimaryButton>}
            />
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
        </FormProvider>
    );
};

export default Sentiment;
