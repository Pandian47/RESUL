import { COPYRIGHT, PRIVACYPOLICY, TERMSCONDITIONS } from 'Constants/GlobalConstant/Placeholders';
import { poweredby_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import RSTooltip from 'Components/RSTooltip';
import PoweredBy from 'Assets/Images/powered-by-new.svg';
import { useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import FooterHelpLink from './FooterHelpLink';

const AppFooter = () => {
    const { pathname } = useLocation();
    const splitPath = pathname.split('/');
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const getCurrentPageName = splitPath[splitPath?.length - 1];

    if (!getCurrentPageName) return null;

    return (
        <footer
            className={`screen rs-page-footer-wrapper ${
                getCurrentPageName === 'mdc-workflow' ? 'mdc-footer-hover' : ''
            }`}
        >
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
                    <FooterHelpLink departmentId={departmentId} clientId={clientId} userId={userId} />
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
            <Container fluid className="g-0">
                <ul className="footer-borders-container">
                    <li></li> <li></li> <li></li> <li></li> <li></li>{' '}
                </ul>
            </Container>
        </footer>
    );
};

export default memo(AppFooter);
