import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { ENTER_HOURS, ENTER_VALIDATE_WEEK, ENTER_WEEKS, SELECT_HOURS, SELECT_WEEK } from 'Constants/GlobalConstant/ValidationMessage';
import { EVERY, FREQUENCY_EXCEEDS, HOURS, RESET, WEEK } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { findIndex as _findIndex, get as _get } from 'Utils/modules/lodashReplacements';

import PropTypes from 'prop-types';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { Row, Col } from 'react-bootstrap';
import { hours, weekcheckboxData } from '../Constants';
import { useFormContext } from 'react-hook-form';

import useQueryParams from 'Hooks/useQueryParams';

const Weekly = ({ isMDC = false, isTLShare = false }) => {
    const {
        control,
        getValues,
        setError,
        clearErrors,
        reset,
        formState: { errors },
    } = useFormContext();
    const [campaignStartDate, setCampaignStartDate] = useState('');
    const [campaignEndDate, setCampaignEndDate] = useState('');
    const locationState = useQueryParams('/communication');
    useEffect(() => {
        const startDate = _get(locationState, 'startDate', '');
        const endDate = _get(locationState, 'endDate', '');
        setCampaignStartDate(startDate);
        setCampaignEndDate(endDate);
    }, [locationState]);

    const handleFrequency = (value) => {
        if (isTLShare) return;
        let endDate = campaignStartDate;
        let startDate = campaignEndDate;
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
            setError('weekly.week', {
                type: 'custom',
                message: FREQUENCY_EXCEEDS,
            });
        } else if (diffDays >= 7 && parseInt(value, 10) > 1) {
            if (diffDays < parseInt(value, 10) * 7) {
                setError('weekly.week', {
                    type: 'custom',
                    message: FREQUENCY_EXCEEDS,
                });
            } else {
                clearErrors('weekly.week');
            }
        } else {
            clearErrors('weekly.week');
        }
    };

    const syncWeekdayErrors = useCallback(
        (dayKey, nextChecked) => {
            const current = getValues('weekly.weekDays') || {};
            const next = { ...current, [dayKey]: Boolean(nextChecked) };
            const anySelected = Object.values(next).some((v) => v === true);
            if (anySelected) {
                clearErrors('weekly.weekDays');
                return;
            }
            setError('weekly.weekDays.mon', {
                type: 'custom',
                message: SELECT_WEEK,
            });
        },
        [getValues, clearErrors, setError],
    );

    return (
        <Fragment>
            <div className={`form-group mb0 mt10 ${isMDC ? 'mdc' : ''} `}>
                <Row>
                    <Col sm={7}>
                        <ul className="rs-list-inline flex-vertical-center my20">
                            <li className="mr20">{EVERY}</li>
                            <li className={`${isMDC ? 'col-sm-5' : 'w-38'}`} title={errors?.weekly?.week?.message || ''}>
                                <RSInput
                                    control={control}
                                    name={'weekly.week'}
                                    onKeyDown={onlyNumbers}
                                    placeholder={WEEK}
                                    required
                                    maxLength={2}
                                    rules={{
                                        required: ENTER_WEEKS,
                                        validate: (value) => {
                                            return Number(value) === 0 ? ENTER_VALIDATE_WEEK : true;
                                        },
                                    }}
                                    handleOnBlur={(e) => {
                                        const { value } = e.target;
                                        if (!isTLShare) {
                                            let endDate = getValues('enddate');
                                            let startDate = getValues('startdate');
                                            const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            if (diffDays < 7) {
                                                setError('enddate', {
                                                    type: 'custom',
                                                    message: 'Frequency exceeds the comm. period',
                                                });
                                            } else if (diffDays >= 7 && parseInt(value, 10) > 1) {
                                                if (diffDays < parseInt(value, 10) * 7) {
                                                    setError('enddate', {
                                                        type: 'custom',
                                                        message: 'Frequency exceeds the comm. period',
                                                    });
                                                } else {
                                                    clearErrors('enddate');
                                                }
                                            } else {
                                                clearErrors('enddate');
                                            }
                                        }
                                        if (isMDC) {
                                            handleFrequency(value);
                                        }
                                    }}
                                />
                            </li>
                            <li className="mr20">@ </li>
                            <li className={`${isMDC ? 'col-sm-5' : 'w-38'}`}>
                                <RSKendoDropDownList
                                    control={control}
                                    name="weekly.hours"
                                    data={hours}
                                    // className={'width120'}
                                    label={HOURS}
                                    required
                                    rules={{
                                        required: SELECT_HOURS,
                                    }}
                                />
                                {/* <RSTimePicker
                        name={`weekly.hours`}
                        required
                        control={control}
                        label={HOURS}
                        format={'hh:mm a'}
                        rules={{
                            required: ENTER_HOURS,
                        }}
                        steps={{
                            hour: 1,
                            minute: 30,
                        }}
                    /> */}
                            </li>
                            {/* <li>
                                <RSTooltip text={RESET}>
                                    <i
                                        id="rs_data_refresh"
                                        className={`${restart_medium} color-primary-blue icon-md position-relative top5`}
                                        onClick={() => {
                                            reset((formState) => ({
                                                ...formState,
                                                weekly: {
                                                    week: '',
                                                    hours: '',
                                                    weekDays: {
                                                        mon: false,
                                                        tue: false,
                                                        wed: false,
                                                        thu: false,
                                                        fri: false,
                                                        sat: false,
                                                        sun: false,
                                                    },
                                                },
                                            }));
                                        }}
                                    />
                                </RSTooltip>
                            </li> */}
                        </ul>
                        <ul className="rs-list-inline rli-space-14 flex-vertical-center mt10">
                            {weekcheckboxData.map((days, index) => {
                                return (
                                    <li key={days.name}>
                                        <RSCheckbox
                                            control={control}
                                            name={`weekly.weekDays.${days.name}`}
                                            labelName={days.labelName}
                                            value={days.value}
                                            handleChange={(e) => {
                                                if (isTLShare) return;
                                                syncWeekdayErrors(days.name, e?.target?.checked);
                                            }}
                                            rules={{
                                                validate: () => {
                                                    const findIndex = _findIndex(
                                                        Object.values(getValues('weekly.weekDays')),
                                                        (days) => days === true,
                                                    );
                                                    return findIndex === -1 && index === 0 ? SELECT_WEEK : true;
                                                },
                                            }}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </Col>
                </Row>
            </div>
        </Fragment>
    );
};

export default Weekly;

Weekly.propTypes = {
    isMDC: PropTypes.bool,
    isTLShare: PropTypes.bool,
};
