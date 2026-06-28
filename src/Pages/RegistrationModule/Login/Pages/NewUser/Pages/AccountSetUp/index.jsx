import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Col, Row } from 'react-bootstrap';

import RSPageHeader from 'Components/RSPageHeader';
import RSProgressSteps from 'Components/ProgressSteps';
import RenderComponent from './Component/RenderComponent';

import { pages as pageConstant, MAIN_HEADING, buildAccountSetupProgressSteps } from './constant';
import AccountContext from './context';
import { getUserDetails } from 'Utils/modules/crypto';

const AccountSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { emailId } = useSelector(({ newUserReducer }) => newUserReducer);
    const { isAgency } = getUserDetails() || {};
    // const { isAgency } = useSelector(({ loginReducer }) => loginReducer);
        const [type, setType] = useState(location.state?.fromUpgrade ? (isAgency ? 'agency' : 'brand') : '');
    const [typeBack, setTypeBack] = useState('');
    const [currentPage, setCurrentPage] = useState((isAgency && !location.state?.fromUpgrade) ? 'LICENSE_TYPE' : 'ACCOUNT_TYPE');
    const [pages, setPages] = useState([]);
    // console.log('pages: ', pages);
    // const [currentPage, setCurrentPage] = useState('KEY_INFO');
    //  const [currentPage, setCurrentPage] = useState('AGENCY_DETAILS');
    //const [currentPage, setCurrentPage] = useState('BRAND_DETAILS');
    //const [currentPage, setCurrentPage] = useState('LOCALIZATION_SETTINGS');

    useEffect(() => {
        if (!emailId && !isAgency && !location.state?.fromUpgrade) navigate('/');
    }, []);

    const value = useMemo(() => ({ setPages }), []);
    const progressSteps = useMemo(
        () => buildAccountSetupProgressSteps(pageConstant(type), pages, currentPage),
        [type, pages, currentPage],
    );

    return (
        // Contend holder starts
        <AccountContext.Provider value={value}>
            <div className="page-content-holder">
                {/* Main page heading block starts */}

                <RSPageHeader
                    title={MAIN_HEADING[currentPage]?.main}
                    isHeaderLine={true}
                //isBack={currentPage === 'LICENSE_TYPE' ? true : false}
                //isLicense
                //  backPath={'ACCOUNT_TYPE'}
                />

                {/* Main page heading block ends */}
                {/* Main page content block starts */}
                <Container fluid>
                    <div className="page-content">
                        <Container className='px0'>
                            <Row>
                                <Col sm={12}>
                                    {currentPage !== 'LICENSE_TYPE' && <RSProgressSteps customSteps={progressSteps} />}
                                    <RenderComponent
                                        currentPage={currentPage}
                                        type={type}
                                        nextScreen={(screenName, type) => {
                                            const temp = [...pages];
                                            if (!temp.includes(currentPage)) temp.push(currentPage);
                                            setPages(temp);
                                            setCurrentPage(screenName);
                                            if (type?.length) setType(type);
                                        }}
                                        back={(screenName, type) => {
                                            setCurrentPage(screenName);
                                            const temp = [...pages].filter((page) => page !== currentPage);
                                            setPages(temp);
                                            if (type === '') setType(type);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Container>
                {/* Main page content block ends */}
            </div>
        </AccountContext.Provider>
        // Content holder ends
    );
};

export default AccountSetup;
