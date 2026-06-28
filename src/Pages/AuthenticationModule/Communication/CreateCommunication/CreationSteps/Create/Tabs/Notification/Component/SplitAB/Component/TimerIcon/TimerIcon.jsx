import { timer_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import TimerModal from '../../../Create/Component/TimerModal/TimerModal';
const TimerIcon = ({ isSplit, fieldName, wrapperClass }) => {
    const { control, setValue, resetField } = useFormContext();
    const [timer, setTimer] = useState(false);

    const timerEnabledName = isSplit ? `${fieldName}.timerEnabled` : 'timerEnabled';
    const timerName = isSplit ? `${fieldName}.timer` : 'timer';
    const remainingTimeName = isSplit ? `${fieldName}.remainingTime` : 'remainingTime';
    const timerTextColorName = isSplit ? `${fieldName}.timerTextColor` : 'timerTextColor';
    const timerBgColorName = isSplit ? `${fieldName}.timerBgColor` : 'timerBgColor';

    return (
        <div className={`${wrapperClass}`}>
            {/* <RSTooltip text={'Update timer'} position="top" className="lh0"> */}
                <i
                    title="Update timer" className={`${timer_medium} icon-md `}
                    onClick={() => { 
                        setTimer(true);
                        setValue(timerEnabledName, true);
                    }}
                />
            {/* </RSTooltip> */}
            <TimerModal
                show={timer}
                isSplit={isSplit}
                handleClose={(status) => {
                    setTimer(false);
                    setValue(timerEnabledName, status);
                    if (!status) {
                        resetField(timerName);
                        resetField(remainingTimeName);
                        resetField(timerBgColorName);
                        resetField(timerTextColorName);
                    }
                }}
                fieldName={fieldName}
            />
        </div>
    );
};

export default TimerIcon;
