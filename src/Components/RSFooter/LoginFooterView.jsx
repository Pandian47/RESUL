import { COPYRIGHT, PRIVACYPOLICY, TERMSCONDITIONS } from 'Constants/GlobalConstant/Placeholders';
import { poweredby_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo } from 'react';
import { Container } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';
import PoweredBy from 'Assets/Images/powered-by-new.svg';

/** Presentational login footer for `/` — no Http, Redux session, or Help API. */
const LoginFooterView = () => (
    <footer className="login rs-page-footer-wrapper">
        <Container className="position-relative">
            <ul className="copyright list-group list-group-horizontal ">
                <li>
                    {COPYRIGHT} &copy;{' '}
                    <span className="init-copyright">2004 - {new Date().getFullYear()}</span>
                </li>
                <li onClick={() => window.open('https://www.go.resul.io/privacy-policy.html', '_blank')}>
                    {PRIVACYPOLICY}
                </li>
                <li onClick={() => window.open('https://www.go.resul.io/terms-and-conditions.html', '_blank')}>
                    {TERMSCONDITIONS}
                </li>
            </ul>
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
        </Container>
        <div id="ecertificate" className="position-absolute top-60 right0">
            <a
                href="//privacy.truste.com/privacy-seal/validation?rid=9cad093d-876e-48dc-bf54-53dd33b13361"
                target="_blank"
                rel="noreferrer"
            >
                <img
                    src="https://privacy-policy.truste.com/privacy-seal/seal?rid=9cad093d-876e-48dc-bf54-53dd33b13361"
                    alt="TRUSTe"
                />
            </a>
        </div>
        <Container fluid className="g-0">
            <ul className="footer-borders-container">
                <li></li> <li></li> <li></li> <li></li> <li></li>{' '}
            </ul>
        </Container>
    </footer>
);

export default memo(LoginFooterView);
