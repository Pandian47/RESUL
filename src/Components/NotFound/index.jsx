import { encodeUrl } from 'Utils/modules/crypto';
import { notFound } from 'Assets/Images';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import { RSPrimaryButton } from 'Components/Buttons';


const NotFound = () => {
    const navigate = useNavigate();
    const isSession = localStorage.getItem('accessToken');

    useEffect(() => {
        document.body.className = 'pageNotFoundBody';
        return () => {
            document.body.className = '';
        };
    }, []);

    // useEffect(() => {
    //     if (isSession) {
    //         const state = { index: 0 };
    //         const encryptState = encodeUrl(state);
    //         navigate(`/dashboard?q=${encryptState}`, {
    //             state,
    //             replace: true,
    //         });
    //     }
    // }, [isSession, navigate]);

    return (
        <Container className="page-header">
            <Row>
                <Col className="borderRight text-center">
                    <img src={notFound} alt={'Page not found'} />
                </Col>
                <Col className="errorPageContent">
                    <div>
                        <h1>404 error!</h1>
                        <h3>Sorry! The page you're looking for cannot be found.</h3>
                        <p>Either something went wrong or the page doesn't exists anymore.</p>
                        <RSPrimaryButton  onClick={() => {
                            if (isSession) {
                            const state = { index: 0 };
                            const encryptState = encodeUrl(state);
                            navigate(`/dashboard?q=${encryptState}`, {
                                state: {
                                index: 0
                                }
                            });
                            } else {
                            navigate(`/`);
                            }
                        }}>
                            Go to {isSession ? 'dashboard' : 'login'}
                        </RSPrimaryButton>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFound;
