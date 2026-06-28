import RSInput from 'Components/FormFields/RSInput';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { Col, Row } from 'react-bootstrap';

const Maps = ({ name, control }) => {
    return (
        <>
            <Row>
                <Col sm={4}>
                    <RSInput name={name} control={control} placeholder="Latitude" />
                </Col>
                <Col sm={1}>
                    <span>or</span>
                </Col>
                <Col sm={7}>
                    <RSInput name={name} control={control} placeholder="Longitude" />
                </Col>
            </Row>
            <Row>
                <RSTextarea name="street_address" control={control} placeholder="Street Address" />
            </Row>
            <Row>
                <Col sm={4}>
                    <span>Location URL</span>
                </Col>
                <Col sm={8}>
                    <RSInput name="location_url" control={control} />
                </Col>
            </Row>
        </>
    );
};

export default Maps;
