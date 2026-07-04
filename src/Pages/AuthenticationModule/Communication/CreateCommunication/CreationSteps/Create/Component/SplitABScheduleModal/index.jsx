import { ENTER_TIME_INTERVAL, EXCEED_EXPIRY_TIME } from 'Constants/GlobalConstant/ValidationMessage';
import { AUTO_SCHEDULE, CANCEL, CONTENT, DURATION, MUST_BE_2_DAYS, SAVE, SCHEDULE, SCHEDULE_SPLIT_TEST, SPLIT_TEST, START_IN_8HOURS, SUBJECT_LINE } from 'Constants/GlobalConstant/Placeholders';
import { time_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { get as _get,forEach as _forEach  } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RSSwicth from 'Components/FormFields/RSSwitch';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSInput from 'Components/FormFields/RSInput';
import useQueryParams from 'Hooks/useQueryParams';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';

import { onlyNumbers } from 'Utils/modules/inputValidators';
import { numberOfDaysValidtorSplitAB } from 'Utils/HookFormValidate';
import { SCHEDULE_START_TIME_MENU } from '../../Tabs/Email/constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { findTimeDiffernce } from './constant';

const SplitABScheduleModal = ({
    show,
    handleClose = () => {},
    type = 'email',
    tabs,
    isClickOff,
    editAutoScheduleDetails,
}) => {
    const { control, setValue, watch, resetField, getFieldState, trigger, getValues, reset, clearErrors } =
        useFormContext();
    const state = useQueryParams('/communication');
    const defaultItem = useMemo(() => ({ id: 1, value: 'Hour(s)' }), []);
    // const { state } = useLocation();

    const [saved, setSaved] = useState(false);
    const [durationValue, setDurationValue] = useState(8);
    const [commuPerformanceValue, setCommuPerformanceValue] = useState('Subject line');
    const [autoSchedulevalue, setAutoScheduleValue] = useState(false);
    const [autoSchedule] = watch(['splitscehdule.autoSchedule']);
    const [communicationPerformanceBy] = watch(['splitscehdule.communicationPerformanceBy']);
    const [duration] = watch(['splitscehdule.duration']);
    const [durationType, setDurationType] = useState(defaultItem);
    const splitTest = watch('splitTest');

    useEffect(() => {
        if (!splitTest) {
            setDurationType(defaultItem);
            setDurationValue(8);
            setCommuPerformanceValue('Subject line');
            setAutoScheduleValue(false);
        }
    }, [splitTest]);

    // edit flow

    useEffect(() => {
        if (editAutoScheduleDetails && Object.keys(editAutoScheduleDetails)?.length) {
            setDurationValue(editAutoScheduleDetails.duration);
            setCommuPerformanceValue(editAutoScheduleDetails.communicationPerformanceBy);
            setDurationType(editAutoScheduleDetails.time);
            setAutoScheduleValue(editAutoScheduleDetails.autoSchedule);
        }
    }, [editAutoScheduleDetails]);

    const handleModalClose = () => {
        clearErrors();
        // Reset duration values to default when closing modal
        setDurationValue(8);
        setDurationType(defaultItem);
        setValue('splitscehdule.duration', 8);
        setValue('splitscehdule.time', defaultItem);
        setValue('scheduled.time', defaultItem);
        handleClose();
    };

    const findErrorIndex = () => {
        // {
        //     "autoSchedule": true,
        //     "duration": 22,
        //     "communicationPerformanceBy": "Content",
        //       time: undefined
        // }
        // const buttonState = [
        // getFieldState('splitscehdule.autoSchedule', formState),
        // getFieldState(`splitscehdule.duration`, formState),
        // ];
        // console.log(, '--buttonState');
        const { invalid } = getFieldState('splitscehdule.duration');
        const { autoSchedule, duration } = getValues('splitscehdule');
        return autoSchedule && duration !== '' && !invalid;
        // _findIndex(
        //     buttonState,
        //     ({ invalid, isDirty, isTouched, error }) => !(!invalid && isDirty && isTouched && !error),
        // );
    };

    useEffect(() => {
        setValue('splitscehdule.duration', durationValue, {
            shouldDirty: false,
            shouldValidate: false,
        });
        setValue('splitscehdule.communicationPerformanceBy', commuPerformanceValue, {
            shouldDirty: false,
            shouldValidate: false,
        });
        setValue('splitscehdule.time', durationType, {
            shouldDirty: false,
            shouldValidate: false,
        });
    }, [show, autoSchedule]);

    useEffect(() => {
        setValue('splitscehdule.autoSchedule', autoSchedulevalue, {
            shouldDirty: false,
            shouldValidate: false,
        });
    }, [show]);

    return (
        <RSModal
            show={show}
            size={'lg'}
            header={SCHEDULE_SPLIT_TEST}
            handleClose={handleModalClose}
            body={
                <Fragment>
                    <div className={`form-group`}>
                        <Row>
                            <Col sm={4} className="text-right pr0">
                                <label className="control-label-left">{AUTO_SCHEDULE}</label>
                            </Col>
                            <Col sm={{ span: 7, offset: 1 }}  className={`pl0 ${isClickOff ? 'pe-none click-off' : ''}`} >
                                <RSSwicth
                                    control={control}
                                    name={'splitscehdule.autoSchedule'}
                                    handleChange={(e) => {
                                        if (!e) {
                                            // Use setValue instead of reset to preserve dirty state of other fields
                                            setValue('splitscehdule.autoSchedule', false, {
                                                shouldDirty: false,
                                                shouldValidate: false,
                                            });
                                            setValue('splitscehdule.communicationPerformanceBy', 'subject line', {
                                                shouldDirty: false,
                                                shouldValidate: false,
                                            });
                                            setValue('splitscehdule.duration', '', {
                                                shouldDirty: false,
                                                shouldValidate: false,
                                            });
                                            setValue('splitscehdule.time', { id: 1, value: 'Hour(s)' }, {
                                                shouldDirty: false,
                                                shouldValidate: false,
                                            });
                                        }
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    {autoSchedule && (
                        <Fragment>
                            <div className={`form-group mb0 ${isClickOff ? 'pe-none click-off' : ''}`}>
                                <Row className="align-items-center">
                                    <Col sm={4} className="text-right pr0 mt3">
                                        <label className="control-label-left">{SPLIT_TEST}</label>
                                    </Col>
                                    <Col sm={{ span: 7, offset: 1 }} className="pl0">
                                        {type === 'email' && (
                                            <div className="d-flex gap-3">
                                                <RSRadioButton
                                                    control={control}
                                                    name={'splitscehdule.communicationPerformanceBy'}
                                                    id="rs_SplitABScheduleModal_Subjectline"
                                                    labelName={SUBJECT_LINE}
                                                    required
                                                    rules={{
                                                        required: true,
                                                    }}
                                                />
                                                <RSRadioButton
                                                    control={control}
                                                    name="splitscehdule.communicationPerformanceBy"
                                                    labelName={CONTENT}
                                                    id="rs_SplitABScheduleModal_Content"
                                                />
                                                <RSRadioButton
                                                    control={control}
                                                    name={'splitscehdule.communicationPerformanceBy'}
                                                    labelName={SCHEDULE}
                                                    id="rs_SplitABAcheduleModal_Schedule"
                                                />
                                            </div>
                                        )}
                                        {type !== 'email' && (
                                            <RSRadioButton
                                                control={control}
                                                checked
                                                name="splitscehdule.communicationPerformanceBy"
                                                labelName={CONTENT}
                                                id="rs_SplitABScheduleModal_emailContent"
                                            />
                                        )}
                                    </Col>
                                </Row>
                                <Row className="form-group mt30 mb0">
                                    <Col sm={{ offset: 5, span: 7 }} className="pl0">
                                        <ul className="rs-list-inline rli-space-10 d-flex">
                                            <li className="mr">
                                                <i
                                                    id="rs_SplitABScheduleModal_time"
                                                    className={`${time_medium} color-primary-blue icon-md position-relative top1`}
                                                />
                                            </li>
                                            <li className="ml5">Start in</li>
                                            <li>
                                                <RSInput
                                                    control={control}
                                                    name={'splitscehdule.duration'}
                                                    id="rs_SplitABScheduleModal_Duration"
                                                    placeholder={DURATION}
                                                    onKeyDown={onlyNumbers}
                                                    maxLength={durationType?.value === 'Hour(s)' ? 2 : 3}
                                                    required
                                                    rules={{
                                                        required: ENTER_TIME_INTERVAL,
                                                        validate: {
                                                            numberValidator: (value) => {
                                                                const time = getValues('scheduled.time');
                                                                return numberOfDaysValidtorSplitAB(
                                                                    value,
                                                                    EXCEED_EXPIRY_TIME,
                                                                    time,
                                                                );
                                                            },
                                                            timeValidator: (value) => {
                                                                const endDate = new Date(_get(state, 'endDate', ''));
                                                                let modifiedEndDate = new Date(endDate);
                                                                modifiedEndDate.setHours(23, 59, 59, 999);
                                                                modifiedEndDate.setDate(modifiedEndDate?.getDate() - 2);
                                                                const formState = getValues();
                                                                const time = getValues('scheduled.time');
                                                                let dates = [],
                                                                    isError = false;
                                                                let emptySplitdate = '';
                                                                _forEach(tabs, (tab) => {
                                                                    const date = formState[tab]?.['schedule'] || null;
                                                                    if (!date) {
                                                                        emptySplitdate += emptySplitdate
                                                                            ? `, ${tab}`
                                                                            : tab;
                                                                        isError = true;
                                                                    }
                                                                    if (!date) isError = true;
                                                                    dates.push(new Date(date));
                                                                });
                                                                // if (isError && emptySplitdate)
                                                                //     return `Schedule  ${emptySplitdate} `;
                                                                // if (isError) return 'Please select scheduled date';
                                                                const maxDate = new Date(Math.max.apply(null, dates));
                                                                // if (maxDate > endDate)
                                                                //     _forEach(tabs, (tab) => {
                                                                //         debugger;
                                                                //         const filterDate = dates.filter(
                                                                //             (item) =>
                                                                //                 item.getTime() === maxDate.getTime(),
                                                                //         );
                                                                //         if (
                                                                //             filterDate &&
                                                                //             formState[tab]?.['schedule'] ===
                                                                //                 filterDate[0]
                                                                //         ) {
                                                                //             return `Please select ${tab} splitdate before endDate`;
                                                                //         }
                                                                //     });
                                                                const difference = findTimeDiffernce(
                                                                    _get(time, 'value', 'Hour(s)'),
                                                                    maxDate,
                                                                    modifiedEndDate,
                                                                );
                                                                if (value > difference)
                                                                    // return time?.value === 'Hour(s)' ||
                                                                    //     time?.value === undefined
                                                                    //     ? `Cannot enter ${
                                                                    //           time?.value ?? 'Hour(s)'
                                                                    //       } more than ` + difference
                                                                    //     : `Min. 2 days required before comm. end date.`;
                                                                    return MUST_BE_2_DAYS;
                                                                return true;
                                                            },
                                                        },
                                                    }}
                                                />
                                                <small>{START_IN_8HOURS}</small>
                                            </li>
                                            <li>
                                                <RSBootstrapdown
                                                    data={SCHEDULE_START_TIME_MENU}
                                                    defaultItem={durationType || defaultItem}
                                                    isObject
                                                    fieldKey="value"
                                                    alignRight
                                                    onSelect={(value) => {
                                                        setDurationType(value);
                                                        setValue('scheduled.time', value);
                                                        trigger('splitscehdule.duration');
                                                        setValue('splitscehdule.periodRange', value);
                                                        setValue('splitscehdule.time', value);
                                                    }}
                                                />
                                            </li>
                                        </ul>
                                    </Col>
                                </Row>
                            </div>
                        </Fragment>
                    )}
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={handleModalClose}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        disabledClass={`${isClickOff ? 'pe-none click-off' : ''}`}
                        onClick={() => {
                            // const errorIndex = findErrorIndex();
                            if (autoSchedule) {
                                trigger('splitscehdule').then((res) => {
                                    if (res) {
                                        setSaved(true);
                                        setDurationValue(duration);
                                        setAutoScheduleValue(autoSchedule);
                                        setCommuPerformanceValue(communicationPerformanceBy);
                                        const time = getValues('scheduled.time');
                                        setDurationType(time);
                                        
                                        // Use setValue instead of reset to preserve dirty state of other fields
                                        setValue('splitscehdule.communicationPerformanceBy', communicationPerformanceBy, {
                                            shouldDirty: false,
                                            shouldValidate: false,
                                        });
                                        setValue('splitscehdule.autoSchedule', autoSchedulevalue, {
                                            shouldDirty: false,
                                            shouldValidate: false,
                                        });
                                        
                                        // Also set duration and time if they exist
                                        if (duration) {
                                            setValue('splitscehdule.duration', duration, {
                                                shouldDirty: false,
                                                shouldValidate: false,
                                            });
                                        }
                                        if (time) {
                                            setValue('splitscehdule.time', time, {
                                                shouldDirty: false,
                                                shouldValidate: false,
                                            });
                                        }
                                        
                                        handleClose();
                                    }
                                });
                            } else {
                                setAutoScheduleValue(false);
                                setCommuPerformanceValue('Subject line');
                                setDurationType(defaultItem);
                                setDurationValue(8);
                                
                                // Use setValue to update without affecting dirty state
                                setValue('splitscehdule.autoSchedule', false, {
                                    shouldDirty: false,
                                    shouldValidate: false,
                                });
                                
                                handleClose();
                            }
                            // if (errorIndex) {
                            //     setSaved(true);
                            //     trigger('splitscehdule').then((res) => res && handleClose());
                            // } else {
                            //     trigger('splitscehdule');
                            // }
                        }}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

SplitABScheduleModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func,
    onSave: PropTypes.func,
};

export default SplitABScheduleModal;
