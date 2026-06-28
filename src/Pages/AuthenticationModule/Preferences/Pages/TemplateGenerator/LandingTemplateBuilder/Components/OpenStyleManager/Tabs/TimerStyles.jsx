import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';

const TimerStyles = ({ element }) => {
    const { control } = useFormContext();

    const setTimerData = (time) => {
        // const [days, hours, minutes, seconds] = useCountdown(time);
        // console.log('Time remaining ----> > > > > ', days, hours, minutes, seconds);
    };

    return (
        <div className="rsbstc-settings-block">
            <div className="form-group mt10">
                <RSDatetimePicker
                    control={control}
                    name={`${element}.start`}
                    format={'dd-MM-yyyy:HH:mm'}
                    handleChange={(e) => {
                                                setTimerData(e.value);
                    }}
                />
            </div>
            <div className="form-group">
                <RSInput
                    name={`${element}.endText`}
                    control={control}
                    defaultValue={'Expired'}
                    placeholder={'End text'}
                />
            </div>
        </div>
    );
};

export default TimerStyles;
