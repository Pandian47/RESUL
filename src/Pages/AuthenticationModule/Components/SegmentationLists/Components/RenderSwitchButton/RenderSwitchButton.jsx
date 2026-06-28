import RSSwitch from 'Components/FormFields/RSSwitch';
import { useFormContext } from 'react-hook-form';
import { getListTypeDetail } from 'Pages/AuthenticationModule/Audience/Pages/TargetListCreation/constant';
import RSTooltip from 'Components/RSTooltip';

const RenderSwitchButton = ({ group, isZeroDayFiles, handleChange, ispartnerDigipopstate, isDisable }) => {
    const { control, setValue } = useFormContext();
    const finalGroupName = getListTypeDetail(group)?.key;
    if (isZeroDayFiles && finalGroupName === 'filterLists') {
        return (
            <RSSwitch
                control={control}
                name=""
                onLabel="AND"
                defaultValue={true}
                handleChange={async (e) => {
                    const operator = e ? 'AND' : 'OR';
                    await setValue(`segmentation.${group}.groupOperator`, operator);
                    handleChange(e);
                }}
            />
        );
    } else if (finalGroupName === 'inclusionLists') {
        return (
            <RSSwitch
                control={control}
                handleChange={async (e) => {
                    const operator = e ? 'AND' : 'OR';
                    await setValue(`segmentation.${group}.groupOperator`, operator);
                    handleChange(e);
                }}
                name={`segmentation.${group}.groupOperator`}
                onLabel="AND"
                className={`switchOr ${ispartnerDigipopstate ? ' ' : ''}`}
                offLabel="OR"
                disabled={isDisable}
            />
        );
    } else if (finalGroupName === 'exclusionLists') {
        return (
            <RSSwitch
                control={control}
                handleChange={(e) => {
                    //  handleChange(e);
                }}
                onLabel="OR"
                name={`segmentation.${group}.groupOperator`}
                className={'switchNot pe-none'}
                offLabel="NOT"
            />
        );
    } else if (finalGroupName === 'lookALikeAttrLists')
        return (
            <RSTooltip
                text="AND is unavailable because it requires all selected attributes to match, which reduces audience reach."
                position="top"
                innerContent={false}
            >
                <RSSwitch
                    control={control}
                    handleChange={async (e) => {
                        const operator = e ? 'AND' : 'OR';
                        await setValue(`segmentation.${group}.groupOperator`, operator);
                        handleChange(e);
                    }}
                    name={`segmentation.${group}.groupOperator`}
                    onLabel="AND"
                    className={`switchOr ${ispartnerDigipopstate ? ' ' : ''}`}
                    offLabel="OR"
                    disabled={true}
                />
            </RSTooltip>
        );
};

export default RenderSwitchButton;
