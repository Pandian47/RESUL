import { onlyNumbers, onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_ATTRIBUTE } from 'Constants/GlobalConstant/ValidationMessage';
import { CONDITION_ATTRIBUTE_VALUE_DATE, CONDITION_ATTRIBUTE_VALUE_DECIMAL, CONDITION_ATTRIBUTE_VALUE_INTEGER, CONDITION_ATTRIBUTE_VALUE_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { arrow_left_medium, arrow_right_medium, equal_to_attribute_medium, in_between_medium, not_equal_to_attribute_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';

import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';
import { Col, Row } from 'react-bootstrap';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
const symbols = [
    { name: 'greater', value: '<' },
    { name: 'between', value: '[]' },
    { name: 'smaller', value: '>' },
    { name: 'equal', value: '=' },
    { name: 'notEqual', value: '!=' },
];

export const MULTIPLE_DROPDOWN_TYPES = [
    {
        name: 'before',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${arrow_left_medium} icon-md`}></i>
                <span className="rsaiw-label">Before</span>
            </span>
        ),
        value: '<',
    },
    {
        name: 'between',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${in_between_medium} icon-md`}></i>
                <span className="rsaiw-label">Between</span>
            </span>
        ),
        value: '[]',
    },
    {
        name: 'after',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${arrow_right_medium} icon-md`}></i>
                <span className="rsaiw-label">After</span>
            </span>
        ),
        value: '>',
    },
    {
        name: 'equal',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${equal_to_attribute_medium} icon-md`}></i>
                <span className="rsaiw-label">Equal</span>
            </span>
        ),
        value: '=',
    },
    {
        name: 'notEqual',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${not_equal_to_attribute_medium} icon-md`}></i>
                <span className="rsaiw-label">Not equal</span>
            </span>
        ),
        value: '!=',
    },
];

const RenderInputs = ({ attr, isUpdate, ind }) => {
    const { control, setValue } = useFormContext();

    const type = attr?.attribute?.fieldTypeId;
    const isBetween = attr?.value?.condition?.name === 'between';
    const conditionOperator = attr?.value?.condition?.value || '<';

    switch (type) {
        case 4: // Integer
            return (
                <Row>
                    <Col sm={1} className="rs-render-field-operator dc-operator m0 position-relative top-4">
                        <BootstrapDropdown
                            defaultItem={MULTIPLE_DROPDOWN_TYPES[0]}
                            data={MULTIPLE_DROPDOWN_TYPES}
                            isObject
                            fieldKey="icon"
                            onSelect={(e) => setValue(`kpiConditions.${ind}.value.condition`, e)}
                            containerClass={`${isUpdate ? 'click-off' : ''}`}
                        />
                    </Col>
                    <Col sm={10} className='pr0'>
                        {isBetween ? (
                            <Row>
                                <Col sm={5}>
                                    <RSInput
                                        name={`kpiConditions.${ind}.value.from`}
                                        control={control}
                                        placeholder={CONDITION_ATTRIBUTE_VALUE_INTEGER}
                                        required
                                        disabled={isUpdate}
                                        onKeyDown={onlyNumbers}
                                        rules={{ required: ENTER_ATTRIBUTE }}
                                    />
                                </Col>
                                <Col sm={1} className='left-7 position-relative top1'>
                                    <p>to</p>
                                </Col>
                                <Col sm={6}>
                                    <RSInput
                                        name={`kpiConditions.${ind}.value.to`}
                                        control={control}
                                        placeholder={CONDITION_ATTRIBUTE_VALUE_INTEGER}
                                        required
                                        disabled={isUpdate}
                                        onKeyDown={onlyNumbers}
                                        rules={{ required: ENTER_ATTRIBUTE }}
                                    />
                                </Col>
                            </Row>
                        ) : (
                            <RSInput
                                name={`kpiConditions.${ind}.value.from`}
                                control={control}
                                placeholder={CONDITION_ATTRIBUTE_VALUE_INTEGER}
                                required
                                rules={{ required: ENTER_ATTRIBUTE }}
                                disabled={isUpdate}
                                onKeyDown={onlyNumbers}
                            />
                        )}
                    </Col>
                </Row>
            );
        case 3: // Decimal
            return (
                <RSInput
                    name={`kpiConditions.${ind}.value`}
                    control={control}
                    placeholder={CONDITION_ATTRIBUTE_VALUE_DECIMAL}
                    required
                    rules={{ required: ENTER_ATTRIBUTE }}
                    disabled={isUpdate}
                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                />
            );
        case 8: // Date
            return (
                <Row>
                    <Col sm={6} className="pr28">
                        <RSDatetimePicker
                            control={control}
                            name={`kpiConditions.${ind}.value.start`}
                            disabled={isUpdate}
                            placeholder={CONDITION_ATTRIBUTE_VALUE_DATE}
                            format={'MMM dd, yyyy:HH:mm a'}
                            steps={{
                                minute: 5,
                                second: 10,
                            }}
                            defaultValue={new Date()}
                            // rules={scheduleRule}
                        />
                    </Col>
                    <Col sm={6} className="pl5">
                        <RSDatetimePicker
                            control={control}
                            name={`kpiConditions.${ind}.value.end`}
                            disabled={isUpdate}
                            placeholder={CONDITION_ATTRIBUTE_VALUE_DATE}
                            format={'MMM dd, yyyy:HH:mm a'}
                            steps={{
                                minute: 5,
                                second: 10,
                            }}
                            defaultValue={new Date()}
                            // rules={scheduleRule}
                        />
                    </Col>
                </Row>
            );
        default:
            return (
                <RSInput
                    name={`kpiConditions.${ind}.value`}
                    control={control}
                    placeholder={CONDITION_ATTRIBUTE_VALUE_TEXT}
                    required
                    disabled={isUpdate}
                    rules={{ required: ENTER_ATTRIBUTE }}
                />
            );
    }
};

export default RenderInputs;
