import { Col, Row } from 'react-bootstrap';
import Import from '../Component/Import';

const AudioSetting = () => {
    return (
        <div className="form-group">
            <Row>
                <Col sm={{ offset: 1, span: 8 }}>
                    <Import fieldName={'digipop.audioSetting'} type="audio" size={'Upload audio'} />
                </Col>
            </Row>
        </div>
    );
};

export default AudioSetting;
