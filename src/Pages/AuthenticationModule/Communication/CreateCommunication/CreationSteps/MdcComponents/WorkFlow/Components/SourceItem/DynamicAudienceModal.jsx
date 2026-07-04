import { getTriggerDynamicListChanneltype } from 'Reducers/communication/createCommunication/plan/request';
import { getmasterData } from 'Utils/modules/masterData';
import { getUserDetails } from 'Utils/modules/crypto';
import { SELECT_DYNAMIC_LIST } from 'Constants/GlobalConstant/ValidationMessage';
import { ALLOW_AUDIENCE, CREATE_NEW_DYNAMIC_LIST, DAYLIGHT_SAVINGS, FREQUENCY, TIME_ZONE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Container, Row, Col } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import { pencil_edit_mini } from 'Constants/GlobalConstant/Glyphicons';
import { get as _get, find as _find } from 'Utils/modules/lodashReplacements';


import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTabbar from 'Components/RSTabber';
import RSTooltip from 'Components/RSTooltip';

import { FREQUENCY_TAB_CONFIG, FORM_INITIAL_STATE } from './constant';
import useQueryParams from 'Hooks/useQueryParams';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader from 'Hooks/useApiLoader';

const DynamicAudienceModal = ({
    show,
    handleClose,
    dynamicList,
    handleSaveDynamicAudienceList,
    selectedDynamicList,
    disableSave,
    isDynamicListLoading = false,
    isSaveLoading = false,
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [isTimeZoneEdit, setTimeZoneEdit] = useState(false);
    const [frequencyType, setFrequencyType] = useState(0);
    const [frequencyId, setFrequencyId] = useState(4);
    const [timeZoneId, setTimeZoneId] = useState('');
    const [timeZoneList, setTimeZoneList] = useState([]);
    const [userTimeZoneName, setUserTimeZoneName] = useState('');
    const [userTimeZone, setUserTimeZone] = useState({});
    const [isFrequency, setFrequency] = useState(false);
    const [frequencyTabConfig, setFrequencyTabConfig] = useState(FREQUENCY_TAB_CONFIG);
    const locationState = useQueryParams('/communication');
    const dynamicListChangeLoader = useApiLoader({ autoFetch: false });
    const closeFunction = handleClose;
    const isAudienceFieldLoading =
        isDynamicListLoading || dynamicListChangeLoader.isFetching;

    useEffect(() => {
        const { timeZoneId } = getUserDetails();
        const { timeZoneList } = getmasterData();
        const userTimeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
        const userTimeZoneName = _get(_find(timeZoneList, ['timeZoneID', timeZoneId]), 'timeZoneName');
        setTimeZoneId(timeZoneId);
        setTimeZoneList(timeZoneList);
        setUserTimeZone(userTimeZone);
        setUserTimeZoneName(userTimeZoneName);
        if (userTimeZone) {
            methods.setValue('timezone', userTimeZone);
        }
    }, []);
    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, touchedFields },
        watch,
        setError,
        reset,
        getValues
    } = methods;
    const watchedFields = watch(['daily.days', 'weekly.hours', 'weekly.weekDays',
        'weekly.hours',
        'weekly.week',
        'monthly.type',  
        'shortly.every_time',
        'shortly.period']);
    const [timeZoneWatch, isDaylightSavingsWatch] = watch(['timezone', 'isDaylightSavings']);
    useEffect(() => {
        if (selectedDynamicList && Object.keys(selectedDynamicList)?.length) {
            let freqIndex = FREQUENCY_TAB_CONFIG.findIndex((item) => item.id === selectedDynamicList.frequencyId);

            setFrequency(selectedDynamicList.isFrequency);
            setFrequencyType(freqIndex);
            setFrequencyId(selectedDynamicList.frequencyId);
            switch (selectedDynamicList.frequencyId) {
                case 1:
                    setValue('daily.days', selectedDynamicList['daily']['days']);
                    setValue('daily.hours', selectedDynamicList['daily']['hours']);
                    break;
                case 2:
                    setValue('weekly.week', selectedDynamicList['weekly']['week']);
                    setValue('weekly.hours', selectedDynamicList['weekly']['hours']);
                    let enteries = Object.entries(selectedDynamicList['weekly']['weekDays']);
                    enteries.forEach(([key, val] = entry) => {
                        setValue(`weekly.weekDays.${key}`, val);
                    });

                    break;
                case 3:
                    setValue(`monthly.type`, selectedDynamicList['monthly']['type']);
                    if (selectedDynamicList['monthly']['type'] === 'Day(s)') {
                        setValue(`monthly.first_day`, selectedDynamicList['monthly']['first_day']);
                        setValue(`monthly.first_hours`, selectedDynamicList['monthly']['first_hours']);
                        setValue(`monthly.first_months`, selectedDynamicList['monthly']['first_months']);
                    } else if (selectedDynamicList['monthly']['type'] === 'Month(s)') {
                        setValue(`monthly.second_days`, selectedDynamicList['monthly']['second_days']);
                        setValue(`monthly.second_frequency`, selectedDynamicList['monthly']['second_frequency']);
                        setValue(`monthly.second_hours`, selectedDynamicList['monthly']['second_hours']);
                        setValue(`monthly.second_months`, selectedDynamicList['monthly']['second_months']);
                    }
                    break;
                case 4:
                    break;
                case 5:
                    setValue('shortly.every_time', selectedDynamicList['shortly']['every_time']);
                    setValue('shortly.period', selectedDynamicList['shortly']['period']);
                    break;
                default:
            }

            if (selectedDynamicList?.timezone) {
                setUserTimeZone(selectedDynamicList?.timezone);
                setUserTimeZoneName(selectedDynamicList?.timezone?.timeZoneName);
                setValue('timezone', selectedDynamicList?.timezone);
            }
            if (selectedDynamicList?.isFrequency) {
                setValue('isFrequency', true);
            } else {
                setValue('isFrequency', false);
            }
            if(selectedDynamicList?.dynamicList){
                setValue('dynamicList', selectedDynamicList?.dynamicList);
                // Call API to get isImmediate status and update tab configuration
                const checkImmediateStatus = async () => {
                    const savedFrequencyId = selectedDynamicList.frequencyId;
                    const savedFrequencyType = freqIndex;
                    let dynamicListId = selectedDynamicList?.dynamicList?.dynamicListId;
                    const payload = {
                        dynamicList: dynamicListId || 0,
                        campaignType: 'T',
                        campaignId: _get(locationState, 'campaignId', 0),
                        departmentId: departmentId
                    };
                    const response = await dispatch(
                        getTriggerDynamicListChanneltype({ payload, loading: false }),
                    );
                    const { isImmediate } = response;
                    
                    // Update tab configuration based on isImmediate
                    if(isImmediate === false) {
                        // Disable both Immediate (4) and Shortly (5) tabs
                        setFrequencyTabConfig(FREQUENCY_TAB_CONFIG.map((tab) => ({
                            ...tab,
                            disable: tab.id === 4 || tab.id === 5,
                        })));
                        // If saved frequencyId was 4 or 5, switch to Daily since those tabs are now disabled
                        if (savedFrequencyId === 4 || savedFrequencyId === 5) {
                            setFrequencyId(1);
                            setFrequencyType(2);
                        } else {
                            // Preserve the saved frequencyId if it's not 4 or 5
                            setFrequencyId(savedFrequencyId);
                            setFrequencyType(savedFrequencyType);
                        }
                    } else {
                        // Enable Immediate tab, disable Shortly tab
                        setFrequencyTabConfig(
                            FREQUENCY_TAB_CONFIG.map((tab) => {
                                if (tab.id === 4) {
                                    const { disable, ...rest } = tab;
                                    return rest;
                                }
                                return { ...tab };
                            }),
                        );
                        // Preserve the saved frequencyId
                        setFrequencyId(savedFrequencyId);
                        setFrequencyType(savedFrequencyType);
                    }
                };
                checkImmediateStatus();
            }      
        }
    }, [selectedDynamicList]);
    const handleTabChange = (id) => {
        if (frequencyId !== id)
            switch (id) {
                case 1:
                    reset((formState) => ({
                        ...formState,
                        daily: {
                            days: '',
                            hours: '',
                        },
                    }));
                    break;
                case 2:
                    reset((formState) => ({
                        ...formState,
                        weekly: {
                            weekDays: [],
                            hours: '',
                            week: '',
                        },
                    }));
                    break;
                case 3:
                    reset((formState) => ({
                        ...formState,
                        monthly: {
                            type: '',
                            second_hours: '',
                            second_months: '',
                            second_days: '',
                            second_frequency: '',
                            first_hours: '',
                            first_months: '',
                            first_day: '',
                        },
                    }));
                    break;
                case 4:
                    break;
                case 5:
                    reset((formState) => ({
                        ...formState,
                        shortly: {
                            every_time: '',
                            period: '',
                        },
                    }));
                    break;
            }
    };
    const addDynamicAudience = () => {
        const targetListUrl = `/audience/create-dynamic-list`;
        navigate(targetListUrl);
    };

    const handleDynamicList = async (list) => {
        const dynamicListId = list?.dynamicListId;
        const payload = {
            dynamicList: dynamicListId || 0,
            campaignType: 'T',
            campaignId: _get(locationState, 'campaignId', 0),
            departmentId: departmentId,
        };

        const response = await dynamicListChangeLoader.refetch({
            fetcher: () => dispatch(getTriggerDynamicListChanneltype({ payload, loading: false })),
        });
        const { status, data, isImmediate } = response || {};
        
        if(isImmediate === false) {
            setFrequencyId(1);
            setFrequencyType(2); // Set to Daily tab
            setFrequencyTabConfig(FREQUENCY_TAB_CONFIG.map((tab) => ({
                ...tab,
                disable: tab.id === 4 || tab.id === 5,
            })));
        } else {
            setFrequencyId(4);
            if (Object.keys(touchedFields)?.length) {
                setFrequencyType(0);
            }
            setFrequencyTabConfig(
                FREQUENCY_TAB_CONFIG.map((tab) => {
                    if (tab.id === 4) {
                        const { disable, ...rest } = tab;
                        return rest;
                    }
                    return { ...tab };
                }),
            );
        }
        
        return { status, data, isImmediate };
    };



    const type = _get(watch('monthly'), 'type', 'day');
    const handleFrequency = () => {
        let endDate = new Date(locationState?.endDate);
        let startDate = new Date(locationState?.startDate);
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let diffYears = endDate.getFullYear() - startDate.getFullYear();
        const week = watch('weekly.week');
        const days = watch('daily.days');
        const months = type === 'Day(s)' ? watch('monthly.first_months') : watch('monthly.second_months');
        let diffMonths = new Date(endDate).getMonth() - new Date(startDate).getMonth();
        let totalMonths = diffYears * 12 + diffMonths;
        if (frequencyId === 2) {
            //week
            if (diffDays < 7) {
                setError('weekly.week', {
                    type: 'custom',
                    message: 'Frequency exceeds the comm. period',
                });
                return false;
            } else if (diffDays >= 7 && parseInt(week, 10) > 1) {
                if (diffDays < parseInt(week, 10) * 7) {
                    setError('weekly.week', {
                        type: 'custom',
                        message: 'Frequency exceeds the comm. period',
                    });
                    return false;
                }
            }
        } else if (frequencyId === 3) {
            //Month
            if (totalMonths < parseInt(months, 10)) {
                if (type === 'Day(s)') {
                    setError('monthly.first_months', {
                        type: 'custom',
                        message: 'Frequency exceeds the comm. period',
                    });
                    return false;
                } else {
                    setError('monthly.second_months', {
                        type: 'custom',
                        message: 'Frequency exceeds the comm. period',
                    });
                    return false;
                }
            }
        } else if (diffDays < 1) {
            setError('enddate', {
                type: 'custom',
                message: 'Frequency exceeds the comm. period',
            });
            return false;
        } else if (frequencyId === 1) {
            //daily

            if (diffDays < 1) {
                setError('daily.days', {
                    type: 'custom',
                    message: 'Frequency exceeds the comm. period',
                });
                return false;
            } else if (parseInt(days, 10) > 1) {
                if (diffDays < parseInt(days, 10)) {
                    setError('daily.days', {
                        type: 'custom',
                        message: 'Frequency exceeds the comm. period',
                    });
                    return false;
                }
            }
        } else {
            return true;
        }
        return true;
    };

    return (
        <FormProvider {...methods}>
            <RSModal
                size={'xlg'}
                show={show}
                header={'Dynamic audience'}
                isMarginTop={false}
                className="Dynamic-audience"
                handleClose={() => {
                    if (isSaveLoading) return;
                    closeFunction();
                }}
                body={
                    <Container>
                        <Row className="mt10 mb30">
                             <Col sm={2} className="text-left">
                                <label className="control-label-left fs19">{"Audience"}</label>
                            </Col>
                            <Col sm={6} className={`${disableSave || isAudienceFieldLoading ? 'click-off' : ''} pr0`}>
                                <RSKendoDropDownList
                                    control={control}
                                    name="dynamicList"
                                    data={dynamicList || []}
                                    label={'Select the list'}
                                    dataItemKey={'dynamicListId'}
                                    textField={'dynamicListName'}
                                    defaultValue={selectedDynamicList?.dynamicList}
                                    rules={{
                                        required: SELECT_DYNAMIC_LIST,
                                    }}
                                    required
                                    className="w-100"
                                    isLoading={isAudienceFieldLoading}
                                    disabled={isAudienceFieldLoading}
                                    handleChange={(e) => {
                                        handleDynamicList(e.value);
                                    }}
                                    footer={() => (
                                        <div
                                            className="d-flex align-items-center justify-content-between px-10 py-8 cp rs-kendo-footer-add-new"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => {
                                                if (disableSave) return;
                                                e.preventDefault();
                                                e.stopPropagation();
                                                addDynamicAudience();
                                            }}
                                        >
                                            <span className="text-primary-blue">
                                                {CREATE_NEW_DYNAMIC_LIST}
                                            </span>
                                            <i
                                                className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                id="rs_DynamicAudienceModal_dynamicList_footer"
                                            />
                                        </div>
                                    )}
                                />
                                {frequencyId === 4 && (
                                    <RSCheckbox
                                        control={control}
                                        name="isFrequency"
                                        labelName={ALLOW_AUDIENCE}
                                        checked={isFrequency}
                                        handleChange={(e) => {
                                            // alert(e.target.checked);
                                            setFrequency(e.target.checked);
                                        }}
                                    />
                                )}
                            </Col>
                        </Row>
                        {/* <div
                            className={`form-group ${!nameState.isValid ? 'pe-none' : ''} ${
                                !isEditable ? 'click-off' : ''
                            }`}
                        > */}
                        <Row className="mb30">
                            <Col sm={2} className="text-left">
                                <label className="control-label-left fs19">{FREQUENCY}</label>
                            </Col>
                            <Col sm={10}>
                                <RSTabbar
                                    dynamicTab={`rs-content-tabs-2 rct-ra`}
                                    activeClass={`active`}
                                    tabData={frequencyTabConfig}
                                    defaultTab={frequencyType}
                                    callBack={(tab, index) => {
                                        if (index !== locationState.currentFrequencyTab) {
                                            setValue('frequencyTab', true, { shouldTouch: true });
                                        }
                                        setFrequencyType(index);
                                        setFrequencyId(tab?.id);
                                        if (Object.keys(touchedFields)?.length) {
                                            handleTabChange(tab?.id);
                                        }
                                        // reset((formState) => ({
                                        //     ...formState,
                                        //     ...RESET_FREQUENCY,
                                        // }));
                                    }}
                                />
                            </Col>
                        </Row>
                        {/* </div> */}
                        {/* <div
                            className={`form-group mb0  ${!nameState.isValid ? 'pe-none' : ''} ${
                                !isEditable ? 'click-off' : ''
                            }`}
                        > */}
                        <Row className="mt30">
                            <Col sm={2} className="text-left">
                                <label className="control-label-left fs19">{TIME_ZONE}</label>
                            </Col>
                            <Col sm={10}>
                                {isTimeZoneEdit ? (
                                    <Fragment>
                                        {/* <RSKendoDropDownList
                                            control={control}
                                            name="timezone"
                                            label={TIME_ZONE}
                                            data={timeZoneList}
                                            defaultValue={userTimeZone}
                                            textField={'timeZoneName'}
                                            dataItemKey={'timeZoneID'}
                                        /> */}
                                        <RSKendoDropDown
                                            control={control}
                                            name="timezone"
                                            label={TIME_ZONE}
                                            data={timeZoneList}
                                            textField="timeZoneName"
                                            dataItemKey={'timeZoneID'}
                                            popupClass={'timezone'}
                                        />
                                        <span className={!timeZoneWatch?.isDayLight ? 'click-off' : ''}>
                                            <RSCheckbox
                                                control={control}
                                                name={'isDaylightSavings'}
                                                labelName={DAYLIGHT_SAVINGS}
                                            />
                                        </span>
                                    </Fragment>
                                ) : (
                                    <div className="position-relative top3 d-flex">
                                        <span>{userTimeZoneName}</span>
                                        <RSTooltip text="Edit time zone">
                                            <i
                                                className={`${pencil_edit_mini} color-primary-blue cp ml5 ${
                                                    disableSave ? 'click-off' : ''
                                                }`}
                                                onClick={() => {
                                                    setTimeZoneEdit(true);
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                )}
                            </Col>
                        </Row>
                        {/* </div> */}
                    </Container>
                }
                footer={
                    <>
                        <RSSecondaryButton onClick={handleClose} disabled={isSaveLoading}>
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleSubmit(async (data) => {
                                if (!handleFrequency()) return;
                                const isEditMode = !!selectedDynamicList?.frequencyId;
                                const finalFrequencyId = isEditMode
                                    ? frequencyId && frequencyId !== selectedDynamicList?.frequencyId
                                        ? frequencyId
                                        : selectedDynamicList?.frequencyId
                                    : frequencyId || 4;
                                const finalTimeZoneId = isEditMode
                                    ? timezone?.timeZoneID ||
                                      selectedDynamicList?.timezone?.timeZoneID ||
                                      selectedDynamicList?.timeZoneId
                                    : data?.timezone?.timeZoneID || timeZoneId;
                                await handleSaveDynamicAudienceList({
                                    dynamicData: {
                                        ...data,
                                        frequencyId: finalFrequencyId,
                                        timeZoneId: finalTimeZoneId,
                                    },
                                });
                            })}
                            className={`${errors?.dynamicList || disableSave || isSaveLoading ? 'click-off' : ''}`}
                            isLoading={isSaveLoading}
                            disabled={isSaveLoading || !!errors?.dynamicList || disableSave}
                        >
                            Save
                        </RSPrimaryButton>
                    </>
                }
            ></RSModal>
        </FormProvider>
    );
};

export default DynamicAudienceModal;
