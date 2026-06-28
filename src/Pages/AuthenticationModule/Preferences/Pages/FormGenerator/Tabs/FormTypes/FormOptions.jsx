import { Col, Row } from 'react-bootstrap';
const FormOptions = ({ layout }) => {
    switch (layout) {
        case 'form-theme-default': {
            return (
                <div className="ftd-properties">
                    <div className="ftdp-heading">
                        <h3>Theme customize</h3>
                    </div>
                    <Row>
                        <Col sm={4} className="text-right">
                            <label className="control-label-left">Theme color</label>
                        </Col>
                        <Col sm={7}>fasdf</Col>
                    </Row>
                </div>
            );
        }
        case 'form-theme-vertical': {
            return <div>form-theme-vertical</div>;
        }
        case 'form-theme-no-labels': {
            return <div>form-theme-no-labels</div>;
        }
        case 'form-theme-fancy': {
            return <div>form-theme-fancy</div>;
        }
    }
};

export default FormOptions;
