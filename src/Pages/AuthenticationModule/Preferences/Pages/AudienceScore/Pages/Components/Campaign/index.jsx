import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Col } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';


const CampainCard = ({ constants, name, head }) => {
    const { control, trigger, getValues, setError, setValue } = useFormContext();

    const { fields, append } = useFieldArray({
        control,
        name: name,
    });

    const addMore = () => {
        let key1 = `${name}Data`;
        
        let key2 = `${name}Value`;
        let val = getValues(name);
                        

        const total = getValues(name).reduce((a, b) => Number(a) + Number(b[`${name}Value`]), 0);
        if (val[val?.length - 1][`${name}Value`] == '') trigger(name);
        else if (total >= 100)
            setError(`${name}[${val?.length - 1}].${name}Value`, {
                type: 'manual',
                message: 'Given value exceeds overall value of 100',
            });
        else append({ [key1]: '', [key2]: '' });
    };

    return (
        <Col sm={6}>
            <div className="box-design  p10 mb30 no-box-shadow">
                <div className="pref-as-card-wrapper">
                    <div className="pacr-row pacrw-heading">
                        <div className="pacr-column">{head}</div>
                        <div className="pacr-column flex-right">
                            <RSInput control={control} name={`${name}.Total`} />
                        </div>
                    </div>
                    {fields.map((ele, ind) => {
                        return (
                            <div className="pacr-row pacrw-content" key={ele?.id}>
                                <div className="pacr-column">
                                    <div className="pacr-column width60p">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={`${name}[${ind}].${name}Data`}
                                            data={constants}
                                            rules={{
                                                required: ENTER_VALID_DATA,
                                            }}
                                            // label="Priority"
                                        />
                                    </div>
                                </div>
                                <div className="pacr-column d-flex align-items-center">
                                    <RSInput
                                        control={control}
                                        rules={{
                                            required: ENTER_VALID_DATA,
                                        }}
                                        name={`${name}[${ind}].${name}Value`}
                                        onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                        handleOnBlur={() => {
                                            let total = getValues(name)
                                                .map((e) => e.reachValue)
                                                .reduce((a, b) => Number(a) + Number(b), 0);
                                            if (total <= 100) setValue(`${name}.Total`, total);
                                        }}
                                    />
                                    {ind === 0 && (
                                        <RSTooltip position="top" text="Add" className="lh0">
                                            <i
                                                onClick={() => {
                                                    addMore();
                                                }}
                                                className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                id='rs_data_circle_plus_fill'
                                            ></i>
                                        </RSTooltip>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Col>
    );
};

export default CampainCard;
