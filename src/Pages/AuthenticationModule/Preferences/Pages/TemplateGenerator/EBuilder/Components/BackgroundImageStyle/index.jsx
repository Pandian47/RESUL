import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { Col, Row } from 'react-bootstrap';
import { position } from '../../constant';
import { useFormContext } from 'react-hook-form';
import RSSwitch from 'Components/FormFields/RSSwitch';

const BackgroundImageStyle = ({ name }) => {
    const { control, watch } = useFormContext();

    // console.log(watch(`${name}ImageURL`), 'ImageURL');
    // console.log(watch(`${name}XAxis`), 'XAxis');
    // console.log(watch(`${name}YAxis`), 'YAxis');
    // console.log(watch(`${name}RepeatImage`), 'RepeatImage');

    return (
        <div>
            <Row>
                <Col>
                    <span>Image URL</span>
                    <RSInput name={`${name}ImageURL`} control={control} label={'URL'} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <span>Position</span>
                    <RSKendoDropdown control={control} name={`${name}XAxis`} label={'x axis'} data={position} />
                    <RSKendoDropdown control={control} name={`${name}YAxis`} label={'y axis'} data={position} />
                </Col>
                <Col>
                    <span>Repeat image</span>
                    <RSSwitch control={control} name={`${name}RepeatImage`} />
                </Col>
            </Row>
        </div>
    );
};

export default BackgroundImageStyle;
