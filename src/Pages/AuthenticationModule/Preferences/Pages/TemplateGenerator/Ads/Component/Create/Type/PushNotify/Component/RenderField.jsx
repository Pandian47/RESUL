import { DIGIPOP_SIZE as DIGIPOP_SIZE_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_SIZE } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { PushNotifyResolution } from '../../../../../constant';
import Import from '../../Component/Import';

const RenderField = ({ fieldName, item, index, customField = false, key }) => {
    const { control, setValue, getValues, watch } = useFormContext();
    const getUniqueFielArrayName = (name = '', index) => {
        const uniqueName = `${fieldName}[${index}]`;
        return `${uniqueName}.${name}`;
    };
    const watchPushNotifyResolution = useWatch({
        control,
        name: 'digipop.pushNotifySetting.pushNotifyResolution',
    });
    const currResolutionValue = watchPushNotifyResolution?.[index]?.['imageResolution'];
    const { fields, append, remove } = useFieldArray({
        name: 'digipop.pushNotifySetting.pushNotifyResolution',
        control,
    });

    return (
        <div key={key}>
            <div className={`form-group d-none`}>
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Size</label>
                    </Col>
                    <Col md={6} className="click-off">
                        <RSKendoDropDownList
                            data={PushNotifyResolution}
                            control={control}
                            name={getUniqueFielArrayName('imageResolution', index)}
                            label={DIGIPOP_SIZE}
                            dataItemKey={'id'}
                            textField={'size'}
                            required
                            rules={{
                                required: DIGIPOP_SIZE_MSG,
                            }}
                            handleChange={() => {}}
                        />
                    </Col>
                </Row>
            </div>
            <Row>
                <Col md={12}>
                    <Import
                        key={item.id}
                        type="image"
                        fieldName={getUniqueFielArrayName('imageContent', index)}
                        isPreview={true}
                        isShowRadioField={currResolutionValue}
                        size={item.imageResolution?.size || ''}
                        isCustomrender={true}
                        customField={customField}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default RenderField;
