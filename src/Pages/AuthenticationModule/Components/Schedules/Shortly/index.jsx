import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { ENTER_TIME, ENTER_VALIDATE_TIME, SELECT_PERIOD } from 'Constants/GlobalConstant/ValidationMessage';
import { PERIOD, TIME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { useFormContext } from 'react-hook-form';
import { PERIODS } from '../Constants';


const Shortly = ({ isMDC = false }) => {
    const { control, getValues, clearErrors, watch, setValue, setError, reset } = useFormContext();
    const selectedPeriod = watch('shortly.period');
    // useEffect(() => {
    //     setValue('shortly.every_time','')
    //     clearErrors('shortly.every_time');
    // }, [selectedPeriod, clearErrors]);
    
    const [val, setVal] = useState(false);
    return (
        <div className="form-group mt30 mb0">
            <ul className="flex-list fl-space-15 mt30">
                <li className="mr8">After</li>
                <li className={`${isMDC ? 'col-sm-3' : 'w-23'}`}>
                    <RSInput
                        control={control}
                        name={'shortly.every_time'}
                        onKeyDown={onlyNumbers}
                        maxLength={2}
                        placeholder={TIME}
                        required
                        rules={{
                            required: ENTER_TIME,
                            validate: (value) => {
                                const period = getValues('shortly.period')?.value;
                                const val = Number(value);
                                if (val === 0) return ENTER_VALIDATE_TIME;
                                if (period === 'minutes' && (val < 5 || val > 90)) return 'Minutes must be 5 - 90';
                                if (period === 'hours' && (val < 1 || val > 24)) return 'Hours must be 1 - 24';
                                return true;
                            },
                        }}
                    />
                </li>
                <li className={`${isMDC ? 'col-sm-3' : 'w-23'}`}>
                    <RSKendoDropDownList
                        control={control}
                        name={'shortly.period'}
                        data={PERIODS}
                        textField={'value'}
                        dataItemKey={'id'}
                        required
                        rules={{
                            required: SELECT_PERIOD,
                            validate: (value) => {
                                if (Object.keys(value)?.length === 0) {
                                    setVal(true);
                                    return SELECT_PERIOD;
                                } else {
                                    setVal(false);
                                    return true;
                                }
                            },
                        }}
                        handleChange={(e) => {
                            setVal(false);
                            if (!val) {
                                // setValue('shortly.every_time', '');
                                clearErrors('shortly.every_time');
                            }
                            const period = e.value?.value;
                            const valShortly = getValues('shortly.every_time');
                            if (valShortly) {
                                if (period === 'minutes' && (valShortly < 5 || valShortly > 90))
                                    setError('shortly.every_time', {
                                        type: 'custom',
                                        message: 'Minutes must be 5 - 90',
                                    });
                                if (period === 'hours' && (valShortly < 1 || valShortly > 24))
                                    setError('shortly.every_time', { type: 'custom', message: 'Hours must be 1 - 24' });
                            }
                        }}
                        label={PERIOD}
                    // defaultValue={'hours'}
                    />
                </li>
                {/* <li>
                    {' '}
                    <RSTooltip text="Reset">
                        <i
                            id="rs_data_refresh"
                            className={`${restart_medium} color-primary-blue icon-md position-relative top5`}
                            onClick={() => {
                                reset((formState) => ({ ...formState, shortly: { every_time: '', period: '' } }));
                            }}
                        />
                    </RSTooltip>
                </li> */}
            </ul>
        </div>
    );
};

export default Shortly;
