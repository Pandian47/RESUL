import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { ENTER_DAYS, ENTER_HOURS, ENTER_VALIDATE_DAYS, SELECT_HOURS } from 'Constants/GlobalConstant/ValidationMessage';
import { DAYS, EVERY, FREQUENCY_EXCEEDS, HOURS, RESET } from 'Constants/GlobalConstant/Placeholders';
import { useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { hours } from '../Constants';

import useQueryParams from 'Hooks/useQueryParams';

const Daily = ({ isMDC = false, isTLShare = false }) => {
    const {
        control,
        getValues,
        setError,
        clearErrors,
        reset,
        formState: { errors },
    } = useFormContext();
    const locationState = useQueryParams('/communication');
    const handleFrequency = (value) => {
        if (isTLShare) return;
        let endDate = locationState?.endDate;
        let startDate = locationState?.startDate;
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) {
            setError('daily.days', {
                type: 'custom',
                message: FREQUENCY_EXCEEDS,
            });
        } else if (parseInt(value, 10) > 1) {
            if (diffDays < parseInt(value, 10)) {
                setError('daily.days', {
                    type: 'custom',
                    message: FREQUENCY_EXCEEDS,
                });
            } else {
                clearErrors('daily.days');
            }
        } else {
            clearErrors('daily.days');
        }
    };
    return (
        <ul className={`flex-list mt30 ${isMDC ? 'mdc' : ''}`}>
            <li className="mr10">{EVERY}</li>
            <li className={`${isMDC ? 'col-sm-3' : 'w-23'}`} title={errors?.daily?.days?.message || ''}>
                <RSInput
                    // type={'number'}
                    control={control}
                    name={'daily.days'}
                    onKeyDown={onlyNumbers}
                    maxLength={2}
                    placeholder={DAYS}
                    required
                    rules={{
                        required: ENTER_DAYS,
                        validate: (value) => {
                            return Number(value) === 0 ? ENTER_VALIDATE_DAYS : true;
                        },
                    }}
                    handleOnBlur={(e) => {
                        const { value } = e.target;
                        if (!isTLShare) {
                            let endDate = getValues('enddate');
                            let startDate = getValues('startdate');
                            const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays < 1) {
                                setError('enddate', {
                                    type: 'custom',
                                    message: FREQUENCY_EXCEEDS,
                                });
                            } else if (parseInt(value, 10) > 1) {
                                if (diffDays < parseInt(value, 10)) {
                                    setError('enddate', {
                                        type: 'custom',
                                        message: FREQUENCY_EXCEEDS,
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
            <li className="mr10">@ </li>
            <li className={`${isMDC ? 'col-sm-3' : 'w-23'}`} title={errors?.daily?.days?.message || ''}>
                <RSKendoDropDownList
                    control={control}
                    name="daily.hours"
                    data={hours}
                    // className={'width120'}
                    label={HOURS}
                    required
                    rules={{
                        required: SELECT_HOURS,
                    }}
                />
                {/* <RSTimePicker
                    name={`daily.hours`}
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
                        // second: 30,
                    }}
                /> */}
            </li>
            {/* <li>
                <RSTooltip text={RESET}>
                    <i
                        id="rs_data_refresh"
                        className={`${restart_medium} color-primary-blue icon-md position-relative top5`}
                        onClick={() => {
                            reset((formState) => ({ ...formState, daily: { days: '', hours: '' } }));
                        }}
                    />
                </RSTooltip>
            </li> */}
        </ul>
    );
};

export default Daily;

Daily.propTypes = {
    isMDC: PropTypes.bool,
    isTLShare: PropTypes.bool,
};
