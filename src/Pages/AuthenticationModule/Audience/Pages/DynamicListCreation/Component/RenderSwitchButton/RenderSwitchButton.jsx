import RSSwitch from 'Components/FormFields/RSSwitch';
import { useFormContext } from 'react-hook-form';

const RenderSwitchButton = ({ group, title }) => {
    const { control } = useFormContext();
    const isExclusion = title === 'Exclusion';

    if (group === 0) {
        return null;
    }

    if (isExclusion) {
        return (
            <div className="switchBlock pe-none click-off exclusionSwitch">
                <RSSwitch
                    control={control}
                    name="exclusionCondition"
                    onLabel="NOT"
                    offLabel="NOT"
                    disabled
                />
            </div>
        );
    }

    return (
        <div className="switchBlock">
            <RSSwitch
                control={control}
                name="RuleCondition"
                onLabel="AND"
                offLabel="OR"
                className="switchOr"
            />
        </div>
    );
};

export default RenderSwitchButton;
