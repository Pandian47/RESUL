import { onlyNumbers } from 'Utils/modules/inputValidators';
import { DIGIPOP_VALUE } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_COLOR, DIGIPOP_FONTSIZE, DIGIPOP_POSITION_BOTTOM, DIGIPOP_POSITION_LEFT, DIGIPOP_POSITION_RIGHT, DIGIPOP_POSITION_TOP } from 'Constants/GlobalConstant/Placeholders';
import { colorpicker_text_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { useFormContext } from 'react-hook-form';

import RSColorPicker from 'Components/ColorPicker';

const OptionalSetting = () => {
    const { control, watch, setValue } = useFormContext();

    const uniqueName = 'digipop.optionalSetting';
    const getUniqueName = (name = '') => {
        return `${uniqueName}.${name}`;
    };

    const watchOptinalSetting = watch(uniqueName);

    return (
        <div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_POSITION_TOP}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('top')}
                            placeholder={DIGIPOP_POSITION_TOP}
                            onKeyDown={onlyNumbers}
                            maxLength={2}
                            rules={{
                                required: DIGIPOP_VALUE,
                            }}
                            required
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_POSITION_BOTTOM}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('bottom')}
                            placeholder={DIGIPOP_POSITION_BOTTOM}
                            onKeyDown={onlyNumbers}
                            maxLength={2}
                            rules={{
                                required: DIGIPOP_VALUE,
                            }}
                            required
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_POSITION_LEFT}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('left')}
                            placeholder={DIGIPOP_POSITION_LEFT}
                            onKeyDown={onlyNumbers}
                            maxLength={2}
                            rules={{
                                required: DIGIPOP_VALUE,
                            }}
                            required
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_POSITION_RIGHT}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('right')}
                            placeholder={DIGIPOP_POSITION_RIGHT}
                            onKeyDown={onlyNumbers}
                            maxLength={2}
                            rules={{
                                required: DIGIPOP_VALUE,
                            }}
                            required
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_FONTSIZE}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('fontSize')}
                            placeholder={DIGIPOP_FONTSIZE}
                            onKeyDown={onlyNumbers}
                            maxLength={2}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_COLOR}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('color')}
                            placeholder={DIGIPOP_COLOR}
                            onKeyDown={onlyNumbers}
                            disabled
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Text color</label>
                    </Col>
                    <Col sm={6}>
                        <RSColorPicker
                            icon={colorpicker_text_medium}
                            onSelect={(e) => {
                                setValue(getUniqueName('color'), e);
                            }}
                            colorValue={watchOptinalSetting?.color}
                            customClass={true}
                            defaultIconColor = {'#000000'}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default OptionalSetting;
