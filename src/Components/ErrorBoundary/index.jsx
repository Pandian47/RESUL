import { ResulticksLogoWhite, errorImgNew } from 'Assets/Images';
import { COPYRIGHT, PRIVACYPOLICY, TERMSCONDITIONS } from 'Constants/GlobalConstant/Placeholders';
import { poweredby_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { redirect } from 'react-router-dom';
import RSTooltip from 'Components/RSTooltip';

import { PoweredBy } from 'Assets/Images';
import { captureRuntimeError } from 'Utils/RSPLogger/RSPLogger';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        document.body.className = 'pageNotFoundBody';

        captureRuntimeError({
            type: 'react-boundary',
            message: error?.message || String(error),
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
        });

        if (window.ReWebSDK && window.ReWebSDK.customEvent) {
            window.ReWebSDK.customEvent({
                eventName: 'Page crash',
                data: {
                    requestURL: window.location.href,
                    payload: {
                        path: window.location.pathname,
                        query: window.location.search,
                        error: error?.toString(),
                        timestamp: new Date().toISOString(),
                        userAgent: navigator?.userAgent
                    },
                    response: 'CRASH'
                }
            });
        }
    }

    componentWillUnmount() {
        document.body.className = '';
    }

    render() {
        if (this.state.hasError)
            return (
                <>
                    <header className="rs-page-header-wrapper">
                        <div className="header-wrapper">
                            <div className="logo-holder">
                                <img src={ResulticksLogoWhite} alt="RESUL" className="brand-logo" />
                            </div>
                        </div>
                    </header>

                    <section className="rs-page-content-wrapper">
                        <Container className="page-header">
                            <Row>
                                <Col className="borderRight text-center">
                                    <img
                                        src={errorImgNew}
                                        alt="No internet connection"
                                        onClick={() => redirect(`/`)}
                                    />
                                </Col>
                                <Col className="errorPageContent">
                                    <div>
                                        <h1 className="d-flex align-items-baseline">
                                            SORRY <span className="white font-xl">...</span>
                                        </h1>
                                        <h3>It's not you. It's us.</h3>
                                        <p>
                                            We're experiencing an internal server error problem, <br /> Please try again
                                            later...
                                        </p>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </section>
                    <footer className={`rs-page-footer-wrapper`}>
                        <Container className="position-relative">
                            <ul className="copyright list-group list-group-horizontal ">
                                <li>
                                    {COPYRIGHT} &copy;{' '}
                                    <span className="init-copyright">2004 - {new Date().getFullYear()}</span>
                                </li>
                                <li onClick={() => window.open('https://www.go.resul.io/privacy-policy.html', '_blank')}>
                                    {PRIVACYPOLICY}
                                </li>
                                <li
                                    onClick={() =>
                                        window.open('https://www.go.resul.io/terms-and-conditions.html', '_blank')
                                    }
                                >
                                    {TERMSCONDITIONS}
                                </li>
                                <li onClick={() => window.open('https://www.go.resul.io/help', '_blank')}>Help</li>
                            </ul>
                            {/* <RSTooltip position="top" text="Powered by RESUL"> */}
                            <div className="rs-footer-pb-wrapper">
                                <div className="powered-by">
                                    <RSTooltip
                                        position="top"
                                        text="Powered by Resulticks"
                                        className="lh0"
                                        innerContent={false}
                                    >
                                        <i className={`${poweredby_medium} icon-md`}></i>
                                        <img src={PoweredBy} alt="Powered by Resulticks" />
                                    </RSTooltip>
                                </div>
                            </div>
                            {/* </RSTooltip> */}
                        </Container>
                        <Container fluid className="g-0">
                            <ul className="footer-borders-container">
                                <li></li> <li></li> <li></li> <li></li> <li></li>{' '}
                            </ul>
                        </Container>
                    </footer>
                </>
            );
        return this.props.children;
    }
}

export default ErrorBoundary;
