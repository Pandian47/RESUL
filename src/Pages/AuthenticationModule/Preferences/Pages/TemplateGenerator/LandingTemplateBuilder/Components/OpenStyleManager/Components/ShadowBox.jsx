import { circle_minus_fill_medium, colorpicker_bg_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { useFormContext } from 'react-hook-form';
import RSColorPicker from 'Components/ColorPicker';

const ShadowBox = ({ rowName, remove, idx, element, shadowText }) => {
    const { control, setValue } = useFormContext();
    const setShadowValue = () => {
        var values = '';
        for (var i = 0; i < shadowText?.length; i++) {
            values +=
                shadowText[i].shadowRight +
                'px ' +
                shadowText[i].shadowBottom +
                'px ' +
                shadowText[i].shadowSpread +
                'px ' +
                shadowText[i].shadowColor;
            if (i !== shadowText?.length - 1) {
                values += ', ';
            }
        }
                setValue(element, values);
    };
    return (
        <Row className="mb30">
            <Col sm={3}>
                <i className={`${settings_medium}`} />
                <span>{'Layer ' + idx + 1}</span>
            </Col>
            <Col sm={8}>
                <Row>
                    <Col sm={3}>
                        <RSInput
                            name={`${rowName}[${idx}].shadowRight`}
                            defaultValue={'0'}
                            control={control}
                            type={'number'}
                            handleOnBlur={() => setShadowValue()}
                        />
                    </Col>
                    <Col sm={3}>
                        <RSInput
                            name={`${rowName}[${idx}].shadowBottom`}
                            defaultValue={'0'}
                            control={control}
                            type={'number'}
                            handleOnBlur={() => setShadowValue()}
                        />
                    </Col>
                    <Col sm={3}>
                        <RSInput
                            name={`${rowName}[${idx}].shadowSpread`}
                            defaultValue={'0'}
                            control={control}
                            type={'number'}
                            handleOnBlur={() => setShadowValue()}
                        />
                    </Col>
                    <Col sm={3}>
                        <RSColorPicker
                            icon={`${colorpicker_bg_medium}`}
                            onSelect={(e) => {
                                setValue(`${rowName}[${idx}].shadowColor`, e);
                                setShadowValue();
                            }}
                        />
                    </Col>
                </Row>
            </Col>
            <Col sm={1}>
                <i
                    className={`${circle_minus_fill_medium}`}
                    onClick={() => {
                        remove(idx);
                        setShadowValue();
                    }}
                />
            </Col>
        </Row>
    );
};

export default ShadowBox;
