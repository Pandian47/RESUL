import { Card, Col, Container, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
// import { Resulticks } from 'Assets/Images/DataExchange';
import { iconSocialFollow } from 'Assets/Images';

const TemplateHeader = () => {

    const { state } = useLocation();

    return (
        <Container>
            <Card>
                <Row>
                    {/* <Col sm={1}>
                        <img src={Resulticks} />
                    </Col> */}
                    <Col sm={1}>
                        <p>Template Name</p>
                        {state?.data?.templateName || ''}
                    </Col>

                    <Col sm={1}>
                        <p>Created Date</p>
                        {state?.data?.createdDate || ''}
                    </Col>
                    <Col sm={3}></Col>
                    <Col sm={3}>
                        <img src={iconSocialFollow} />
                        <img src={iconSocialFollow} />
                        <img src={iconSocialFollow} />
                        <img src={iconSocialFollow} />
                        <img src={iconSocialFollow} />
                    </Col>
                </Row>
            </Card>
        </Container>
    );
};

export default TemplateHeader;
