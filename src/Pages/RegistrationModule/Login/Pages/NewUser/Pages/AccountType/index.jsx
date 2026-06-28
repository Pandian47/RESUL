import { Col, Row } from 'react-bootstrap';
import { AgencyIcon, BrandIcon } from 'Assets/Images';
const AccountType = ({ nextScreen }) => {
    return (
        <div className="box-design rs-box">
            <Row className="res-gx-2">
                <Col className="text-center p0">
                    <div className="res-account-type-box ratb-agency">
                        <div className="img-holder">
                            <img src={AgencyIcon} id='rs_AccountType_Agency' onClick={() => nextScreen('KEY_INFO', 'agency')} />
                        </div>
                        <div className="content-holder">
                            <h1>Agency</h1>
                            <p>Manage your clients</p>
                        </div>
                    </div>
                </Col>
                <Col className="text-center p0">
                    <div className="res-account-type-box ratb-brand">
                        <div className="img-holder">
                            <img src={BrandIcon} id='rs_AccountType_Brand' onClick={() => nextScreen('LICENSE_TYPE', 'brand')} />
                        </div>
                        <div className="content-holder">
                            <h1>Brand</h1>
                            <p>Manage your organization</p>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default AccountType;
