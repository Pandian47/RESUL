import { copy_medium, email_medium, eye_medium, tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const OnlineLineSDKGenerate = ({ show, handleCloseGenerate, handleSaveGenerate }) => {
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        setIsShow(show);
    }, [show]);

    return (
        <RSModal
            show={isShow}
            size="xlg"
            header={'One-line SDK'}
            handleClose={handleCloseGenerate}
            body={
                <div className="form-group mb20">
                    <Container>
                        <div className="mb30">
                            <Row>
                                <Col sm={12}>
                                    <h4 className="mb10">Web SDK</h4>
                                </Col>
                            </Row>
                            <Row className="mt5">
                                <Col sm={3}>One-line SDK</Col>
                                <Col sm={7}>https://sdk.res.io/handlers/cc33cd4b2fea4b949123bb7d48ff673e.sdk</Col>
                                <Col sm={2}>
                                    <ul className="d-flex align-items-center justify-content-end">
                                        <li>
                                            <i
                                                className={`${eye_medium} icon-md color-primary-blue`}
                                                id='rs_data_eye'
                                                onClick={() => {
                                                    handleSaveGenerate(false);
                                                }}
                                            ></i>
                                        </li>
                                        <li className="ml15">
                                            <i className={`${copy_medium} icon-md color-primary-blue`}></i>
                                        </li>
                                        <li className="ml15">
                                            <i className={`${email_medium} icon-md color-primary-blue`}></i>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                            <Row className="mt5">
                                <Col sm={3}>Analytics</Col>
                                <Col sm={7}>
                                    <Row>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={10}>RESUL analytics</Col>
                                                <Col sm={2}>
                                                    <i
                                                        className={`${tick_medium} icon-md color-primary-green`}
                                                    ></i>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={10}>Google analytics</Col>
                                                <Col sm={2}>
                                                    <i
                                                        className={`${tick_medium} icon-md color-primary-green`}
                                                    ></i>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col sm={2}></Col>
                            </Row>
                            <Row className="mt5">
                                <Col sm={3}>Tag management</Col>
                                <Col sm={7}>
                                    <Row>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={10}>Google tag manager</Col>
                                                <Col sm={2}>
                                                    <i
                                                        className={`${tick_medium} icon-md color-primary-green`}
                                                    ></i>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col sm={6}></Col>
                                    </Row>
                                </Col>
                                <Col sm={2}></Col>
                            </Row>
                        </div>
                        <div className="mb30">
                            <Row>
                                <Col sm={12}>
                                    <h4 className="mb10">Mobile SDK</h4>
                                </Col>
                            </Row>
                            <Row className="mt5">
                                <Col sm={3}>Android</Col>
                                <Col sm={7}>
                                    compile 'io.resu:ReAndroidSDK_55e5b135-4d1c-4925-97b7-5030bb8235ab:-SNAPSHOT'
                                </Col>
                                <Col sm={2}>
                                    <ul className="d-flex align-items-center justify-content-end">
                                        <li>
                                            <i
                                                className={`${eye_medium} icon-md color-primary-blue`}
                                                id='rs_data_eye'
                                                onClick={() => {
                                                    handleSaveGenerate(false);
                                                }}
                                            ></i>
                                        </li>
                                        <li className="ml15">
                                            <i className={`${copy_medium} icon-md color-primary-blue`}></i>
                                        </li>
                                        <li className="ml15">
                                            <i className={`${email_medium} icon-md color-primary-blue`}></i>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                            <Row className="mt5">
                                <Col sm={3}>Analytics</Col>
                                <Col sm={7}>
                                    <Row>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={10}>App Annie</Col>
                                                <Col sm={2}>
                                                    <i
                                                        className={`${tick_medium} icon-md color-primary-green`}
                                                    ></i>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={10}>Mixpanel</Col>
                                                <Col sm={2}>
                                                    <i
                                                        className={`${tick_medium} icon-md color-primary-green`}
                                                    ></i>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col sm={2}></Col>
                            </Row>
                            <Row className="mt5">
                                <Col sm={3}>iOS</Col>
                                <Col sm={7}>
                                    mob.resu.io/resulticks/REIOSSDK_55e5b135-4d1c-4925-97b7-5030bb8235ab.git
                                </Col>
                                <Col sm={2}>
                                    <ul className="d-flex align-items-center justify-content-end">
                                        <li>
                                            <i
                                                className={`${eye_medium} icon-md color-primary-blue`}
                                                id='rs_data_eye'
                                                onClick={() => {
                                                    handleSaveGenerate(false);
                                                }}
                                            ></i>
                                        </li>
                                        <li className="ml15">
                                            <i className={`${copy_medium} icon-md color-primary-blue`}></i>
                                        </li>
                                        <li className="ml15">
                                            <i className={`${email_medium} icon-md color-primary-blue`}></i>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                            <Row className="mt5">
                                <Col sm={3}>Analytics</Col>
                                <Col sm={7}>
                                    <Row>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={10}>App Annie</Col>
                                                <Col sm={2}>
                                                    <i
                                                        className={`${tick_medium} icon-md color-primary-green`}
                                                    ></i>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={10}>Mixpanel</Col>
                                                <Col sm={2}>
                                                    <i
                                                        className={`${tick_medium} icon-md color-primary-green`}
                                                    ></i>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col sm={2}></Col>
                            </Row>
                        </div>
                    </Container>
                </div>
            }
            footer={
                <div className="btn-container d-flex justify-content-end m0">
                    <RSSecondaryButton
                        onClick={() => {
                            handleCloseGenerate(false);
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            handleCloseGenerate(false);
                        }}
                    >
                        Save
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default OnlineLineSDKGenerate;
