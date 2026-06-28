import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSInput from 'Components/FormFields/RSInput';
import { Col, Row } from 'react-bootstrap';

const AppStore = ({ control }) => {
    return (
        <div>
            <Row>
                <Col sm={4}>
                    <label>iTunes App Store</label>
                </Col>
                <Col sm={8}>
                    <Row>
                        <RSCheckbox control={control} name="itunes_check" />
                        <RSInput name={'itunes_app_store'} control={control} />
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col sm={4}>
                    <label>Google Play</label>
                </Col>
                <Col sm={8}>
                    <Row>
                        <RSCheckbox control={control} name="google_play_check" />
                        <RSInput name={'google_play'} control={control} />
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col sm={4}>
                    <label>BlackBerry World</label>
                </Col>
                <Col sm={8}>
                    <Row>
                        <RSCheckbox control={control} name="blackberry_check" />
                        <RSInput name={'blackberry_world'} control={control} />
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col sm={4}>
                    <label>Windows Store</label>
                </Col>
                <Col sm={8}>
                    <Row>
                        <RSCheckbox control={control} name="windows_check" />
                        <RSInput name={'windows_store'} control={control} />
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col sm={4}>
                    <label>Fallback URL</label>
                </Col>
                <Col sm={8}>
                    <Row>
                        <RSCheckbox control={control} name="fallback_check" />
                        <RSInput name={'fallback_url'} control={control} />
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export default AppStore;
