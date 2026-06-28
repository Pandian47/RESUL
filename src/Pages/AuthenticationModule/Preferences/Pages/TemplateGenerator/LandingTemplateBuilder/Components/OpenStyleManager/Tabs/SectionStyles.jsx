import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { ANIMATION_DATA } from '../constants';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';

const SectionStyles = ({ element }) => {
    const { control } = useFormContext();
    return (
        <div className="rsbstc-settings-block">
            <div className="form-group mt10">
                <RSInput name={`${element}.id`} control={control} placeholder={'ID'} />
            </div>
            <div className="form-group">
                <RSInput name={`${element}.title`} control={control} placeholder={'Title'} />
            </div>
            <div className="form-group">
                <RSKendoDropdown
                    data={ANIMATION_DATA}
                    control={control}
                    dataItemKey={'id'}
                    textField={'label'}
                    label={'Animation'}
                    name={`${element}.animationName`}
                />
            </div>
            <div className="form-group">
                <RSInput name={`${element}.durationSec`} control={control} placeholder={'Duration (seconds)'} />
            </div>
            <div className="form-group">
                <RSInput name={`${element}.delaySec`} control={control} placeholder={'Delay (seconds)'} />
            </div>
        </div>
    );
};

export default SectionStyles;
