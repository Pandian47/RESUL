import { PAYPAL_PAYMENT } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import PayPalLogoWithText from 'Assets/Images/logos/logo-paypal-with-text.svg';
const Paypal = () => {
    return (
        <Row>
            <Col sm={12}>
                <p>
                {PAYPAL_PAYMENT}
                </p>
            </Col>
            <Col sm={12} className="mt20 text-right">
                <a href="">
                    <img src={PayPalLogoWithText} alt={'Paypal checkout'} className="rs-payment-logo" />
                </a>
            </Col>
        </Row>
    );
};

export default Paypal;
