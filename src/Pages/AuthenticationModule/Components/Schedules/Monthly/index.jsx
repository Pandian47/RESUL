import { onlyNumbers } from 'Utils/modules/inputValidators';
import { ENTER_DAYS, ENTER_HOURS, ENTER_MONTHS, ENTER_VALIDATE_DAYS, ENTER_VALIDATE_MONTH, ENTER_WEEK_DAYS, SELECT_FREQUENCY, SELECT_MONTHLY_CONDITION } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_RESET, DAY, DAYS, FREQUENCY as FREQUENCY_PH, FREQUENCY_EXCEEDS, HOURS, MONTH, OF_EVERY, RESET, THE, WEEK_DAYS as WEEK_DAYS_PH } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { useFormContext, useWatch } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { hours, WEEK_DAYS, FREQUENCY } from '../Constants';
import RSTooltip from 'Components/RSTooltip';

import useQueryParams from 'Hooks/useQueryParams';
import RSConfirmationModal from 'Components/ConfirmationModal';

const Monthly = ({ isMDC = false, isFormCSVDownload = false, isTLShare = false }) => {
    const {
        control,
        reset,
        setValue,
        setError,
        watch,
        formState: { errors },
        getValues,
    } = useFormContext();
    const monthly = useWatch({
        control,
        name: 'monthly',
    });

    useEffect(() => {
        if (isFormCSVDownload) {
            setValue('monthly.type', 'Day(s)');
        }
    }, [isFormCSVDownload, setValue]);

    const [isReset, setIsReset] = useState({
            show: false,
        });

    const type = _get(monthly, 'type', 'day');
    const locationState = useQueryParams('/communication');

    const frequecyMonthlyValidator = (value, f_type, error) => (type === f_type && !value ? error : true);

    const handleFrequency = (value) => {
        if (isTLShare) return;
        let endDate = new Date(locationState?.endDate);
        let startDate = new Date(locationState?.startDate);
        let diffYears = endDate.getFullYear() - startDate.getFullYear();
        let diffMonths = new Date(endDate).getMonth() - new Date(startDate).getMonth();
        let totalMonths = diffYears * 12 + diffMonths;
        const months = type === 'Day(s)' ? watch('monthly.first_months') : watch('monthly.second_months');
        if (totalMonths < parseInt(months, 10)) {
            if (type === 'Day(s)') {
                setError('monthly.first_months', {
                    type: 'custom',
                    message: FREQUENCY_EXCEEDS,
                });
            } else {
                setError('monthly.second_months', {
                    type: 'custom',
                    message: FREQUENCY_EXCEEDS,
                });
            }
            // return false;
        }
    };

    return (
        <Fragment>
            <div className={`d-flex form-group mb0 mt30 ${isMDC ? 'mdc' : ''}`}>
                <div className="position-relative">
                    <Row>
                        <ul className={`flex-list align-items-end ${!isFormCSVDownload && type === 'Month(s)' ? 'pe-none click-off' : ''}`}>
                            {!isFormCSVDownload ? (
                                <li className="d-flex align-items-center pb2 position-relative top-4">
                                    <RSRadioButton
                                        control={control}
                                        name={`monthly.type`}
                                        labelName={DAYS}
                                        defaultValue={type}
                                        isLabel={false}
                                        isError={false}
                                        radio_wrapper_class="mb0 mt0"
                                        rules={{
                                            required: SELECT_MONTHLY_CONDITION,
                                        }}
                                        showLabelName={true}
                                    />
                                </li>
                            ) : (
                                <li className="mr15">{DAY}</li>
                            )}
                            {!isFormCSVDownload && (
                                <li className={`${!type ? 'click-off pe-none' : ''} mr15`}>{DAY}</li>
                            )}
                            <Col sm={2} className={`mr15 ${isFormCSVDownload ? 'width100' : 'width125'}`}>
                                <li className={` ${!type && !isFormCSVDownload ? 'click-off pe-none ' : 'mr15'} ${ isFormCSVDownload ? 'width100' : 'width125'}`}>
                                    <RSInput
                                        name={'monthly.first_day'}
                                        control={control}
                                        placeholder={DAYS}
                                        required
                                        maxLength={2}
                                        // onKeyDown={onlyNumbers}
                                        onKeyDown={(e) => {
                                            onlyNumbers(e);
                                            const currentValue = e.target.value;
                                            const newValue = currentValue + e.key;
                                            if (newValue.length === 2 && parseInt(newValue) > 31) {
                                                e.preventDefault();
                                            }
                                        }}
                                        rules={{
                                            required: type === 'Day(s)' ? ENTER_DAYS : null,
                                            validate: (value) => {
                                                if (Number(value) === 0 && type === 'Day(s)')
                                                    return ENTER_VALIDATE_DAYS;
                                                return frequecyMonthlyValidator(value, 'day', ENTER_DAYS);
                                            },
                                        }}
                                    />
                                </li>
                            </Col>
                            <li className={`${!type && !isFormCSVDownload ? 'click-off pe-none  text-center' : ' text-center'} ${isFormCSVDownload ? 'mr15' : 'mr15'}`}>{OF_EVERY}</li>
                            <Col sm={2} className={`mr15 ${isMDC ? 'width26p' : isFormCSVDownload ? 'width100' : 'width125'}`}>
                                <li
                                    className={` ${!type && !isFormCSVDownload ? `click-off pe-none mr15 ${isMDC ? 'width100p' : 'width125'}`  : `mr15 ${isMDC ? 'width100p' : 'width125'}`}`}
                                    title={monthly?.first_months?.message || ''}
                                >
                                    <RSInput
                                        name={'monthly.first_months'}
                                        control={control}
                                        placeholder={MONTH}
                                        required
                                        maxLength={2}
                                        onKeyDown={onlyNumbers}
                                        rules={{
                                            required: type === 'Day(s)' ? ENTER_MONTHS : null,
                                            validate: (value) => {
                                                if (Number(value) === 0 && type === 'Day(s)')
                                                    return ENTER_VALIDATE_MONTH;
                                                return frequecyMonthlyValidator(value, 'day', ENTER_MONTHS);
                                            },
                                        }}
                                        handleOnBlur={(e) => {
                                            const { value } = e.target;
                                            if (isMDC) {
                                                handleFrequency(value);
                                            }
                                        }}
                                    />
                                </li>
                            </Col>
                            <li className={!type && !isFormCSVDownload ? 'click-off pe-none mr15' : 'mr15'}>@</li>
                            <Col sm={2} className="mr15 width115">
                                <li className={`${!type && !isFormCSVDownload ? 'click-off pe-none mr15 ' : 'mr15 '} ${isFormCSVDownload ? 'width120' : 'width125'}`}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name="monthly.first_hours"
                                        data={hours}
                                        label={HOURS}
                                        // className={'width100'}
                                        required
                                        rules={{
                                            required: type === 'Day(s)' ? ENTER_HOURS : null,

                                            validate: (value) => {
                                                {
                                                    frequecyMonthlyValidator(value, 'day', ENTER_HOURS);
                                                    //debugger
                                                    // if(Object.keys(value)?.length === 0){
                                                    //     return ENTER_HOURS
                                                    // }
                                                    // else return true
                                                }
                                            },
                                        }}
                                    />
                                    {/* <RSTimePicker
                                name={`monthly.first_hours`}
                                required
                                control={control}
                                label={HOURS}
                                format={'hh:mm a'}
                                rules={{
                                    validate: (value) => frequecyMonthlyValidator(value, 'day', ENTER_HOURS),
                                }}
                                steps={{
                                    hour: 1,
                                    minute: 30,
                                }}
                            /> */}
                                </li>
                            </Col>
                        </ul>
                    </Row>
                    {!isFormCSVDownload && (
                    <Row>
                        <ul className={`flex-list align-items-end mt30 ${type === 'Day(s)' ? 'pe-none click-off' : ''}`}>
                            <li className="d-flex align-items-center pb2 position-relative top-4">
                                <RSRadioButton
                                    control={control}
                                    name={`monthly.type`}
                                    labelName={MONTH}
                                    defaultValue={type}
                                    isError={false}
                                    isLabel={false}
                                    radio_wrapper_class="mb0 mt0"
                                    rules={{
                                        required: SELECT_MONTHLY_CONDITION,
                                    }}
                                    showLabelName={true}
                                />
                            </li>

                            <li className={`${!type ? 'click-off pe-none mr15' : 'mr15'}`}>{THE}</li>
                            <Col sm={1.5} className={`mr15 ${isFormCSVDownload ? 'width70' : 'width95'}`}>
                                <li className={` ${!type ? 'pe-none click-off' : ''}`}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name="monthly.second_frequency"
                                        data={FREQUENCY}
                                        textField={'label'}
                                        dataItemKey={'id'}
                                        defaultValue={{ id: 1, label: 'First' }}
                                        label={FREQUENCY_PH}
                                        required
                                        rules={{
                                            required: type === 'Month(s)' ? SELECT_FREQUENCY : null,
                                            validate: (value) =>
                                                frequecyMonthlyValidator(value, 'month', SELECT_FREQUENCY),
                                        }}
                                    />
                                </li>
                            </Col>
                            <Col sm={1.5} className={`mr15 ${isFormCSVDownload ? 'width70 ml11 mr18' : 'width95'}`}>
                                <li className={` ${!type ? 'click-off pe-none' : ''}`}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name="monthly.second_days"
                                        data={WEEK_DAYS}
                                        textField={'value'}
                                        dataItemKey={'id'}
                                        defaultValue={WEEK_DAYS[0]}
                                        label={WEEK_DAYS_PH}
                                        required
                                        rules={{
                                            required: type === 'Month(s)' ? ENTER_WEEK_DAYS : null,
                                            validate: (value) =>
                                                frequecyMonthlyValidator(value, 'month', ENTER_WEEK_DAYS),
                                        }}
                                    />
                                </li>
                            </Col>
                            <li className={!type ? 'click-off pe-none mr15 text-center' : 'mr16 text-center'}>{OF_EVERY}</li>
                            <Col sm={1.5} className={`mr15 ${isMDC ? 'width125' : isFormCSVDownload ? 'width70' : 'width80'}`}>
                                <li
                                    className={` ${!type ? 'click-off pe-none' : `mr15 ${isMDC ? 'width125' : 'width80'}`}`}
                                    title={monthly?.second_months?.message || ''}
                                >
                                    <RSInput
                                        name={'monthly.second_months'}
                                        control={control}
                                        placeholder={MONTH}
                                        required
                                        maxLength={2}
                                        onKeyDown={onlyNumbers}
                                        rules={{
                                            required: type === 'Month(s)' ? ENTER_MONTHS : null,
                                            validate: (value) => {
                                                if (Number(value) === 0 && type === 'Month(s)')
                                                    return ENTER_VALIDATE_MONTH;
                                                return frequecyMonthlyValidator(value, 'month', ENTER_MONTHS);
                                            },
                                        }}
                                        handleOnBlur={(e) => {
                                            const { value } = e.target;
                                            if (isMDC) {
                                                handleFrequency(value);
                                            }
                                        }}
                                    />
                                </li>
                            </Col>
                            <li className={!type ? 'pe-none click-off mr15' : 'mr15'}>@</li>
                            <Col sm={2} className={`mr15 ${isFormCSVDownload ? 'width75' : isMDC ? 'width95': 'width94'}`}>
                                <li className={!type ? 'click-off pe-none ' : ''}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name="monthly.second_hours"
                                        data={hours}
                                        // className={'width100'}
                                        label={HOURS}
                                        required
                                        rules={{
                                            required: type === 'Month(s)' ? ENTER_HOURS : null,
                                            validate: (value) =>
                                                frequecyMonthlyValidator(value, 'month', ENTER_HOURS),
                                        }}
                                    />

                                    {/* <RSTimePicker
                                name={`monthly.second_hours`}
                                required
                                control={control}
                                label={HOURS}
                                format={'hh:mm a'}
                                rules={{
                                    validate: (value) => frequecyMonthlyValidator(value, 'month', ENTER_HOURS),
                                }}
                                steps={{
                                    hour: 1,
                                    minute: 30,
                                    // second: 30,
                                }}
                            /> */}
                                </li>
                            </Col>
                        </ul>
                    </Row>
                    )}
                    {!isFormCSVDownload && getValues('monthly.type') && 
                    <>
               <div className={`position-absolute ${type === 'Month(s)' ? 'top62': 'top0'} ${isMDC ? 'right0' : 'right-20'}`}>
                    <RSTooltip text={RESET}>
                        <i
                            id="rs_data_refresh"
                            className={`${restart_medium} color-primary-blue icon-md position-relative top7`}
                            onClick={() => {
                                setIsReset({
                                    show: true,
                                });
                                
                            }}
                        />
                    </RSTooltip>
                </div>
                </>}
                </div>
            </div>
            {!isFormCSVDownload && isReset?.show && <RSConfirmationModal
                show={isReset?.show}
                isCloseButton={false}
                text={ARE_YOU_SURE_RESET}
                handleConfirm={(status) => {
                    if (status) {
                        setValue('monthly', {
                            type: '',
                            second_hours: '',
                            second_months: '',
                            second_days: '',
                            second_frequency: '',
                            first_hours: '',
                            first_months: '',
                            first_days: '',
                            first_day: '',
                        })
                    setIsReset({
                        show: false,
                    });
                    }
                }}
                handleClose={() => {
                    setIsReset({
                        show: false,
                    });
                }}
            />}
        </Fragment>
    );
};

export default Monthly;

Monthly.propTypes = {
    isMDC: PropTypes.bool,
    isFormCSVDownload: PropTypes.bool,
    isTLShare: PropTypes.bool,
};
