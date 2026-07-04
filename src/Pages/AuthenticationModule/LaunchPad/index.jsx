import { checkIsBrandExists } from 'Utils/modules/brandStorage';
import { getUserDetails, encodeUrl } from 'Utils/modules/crypto';
import { HEADER_QUATER_CHANGED, NOT_A_CLIENT } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, analytics_settings_large, circle_tick_medium, close_medium, communication_plus_large, data_exchange_large, form_generator_large, list_attribute_large, user_leadscore_large, user_persona_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { find as _find, get as _get } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';

import ConfirmationPopup from '../Audience/Pages/AddAudience/Components/CSV/Components/ConfirmationPopup/ConfirmationPopup';
import { getSessionId } from 'Reducers/globalState/selector';

import { globalStateSelector } from 'Utils/Selectors/app';
import { updateClientBranch, updateisClient, updateisClientID } from 'Reducers/globalState/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
const LaunchPad = () => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const { clientBranch, isClient, isClientID } = useSelector((state) => globalStateSelector(state));
    const { isCampaign, permissionList, isAudience, licenseTypeId, departmentList, isHybrid } = getUserDetails() ?? {};
    const [warningModal, setWarningModal] = useState({
        show: false,
        type: '',
    });
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const { departmentId, clientId } = useSelector((state) => getSessionId(state));
    const [show, setShow] = useState(false);

    const handleImportAudience = (link) => {
        if (licenseTypeId === '3') {
            if (departmentList?.length === 0) {
                setWarningModal({
                    show: true,
                    type: '',
                });
            } else {
                if (checkIsBrandExists(departmentId)) {
                    setShow(true);
                } else {
                    const stateRedirect = { from: 'master-data' };
                    const stateredirectEncode = encodeUrl(stateRedirect);

                    // navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
                    //     state: stateRedirect,
                    // });
                    navigate(`${link}?q=${stateredirectEncode}`, {
                        state: { from: 'master-data' },
                    });
                }
            }
        } else {
            if (checkIsBrandExists(departmentId)) {
                setShow(true);
            } else {
                navigate(link, {
                    state: { from: 'master-data' },
                });
            }
        }
    };

    useEffect(() => {
        if (state?.add) {
            if (state?.from === 'MDM') {
                setWarningModal({
                    show: true,
                    type: '',
                });
            } else setShowModal(true);
        }
    }, [state?.add]);
    useEffect(() => {
        return () => {
            dispatch(updateClientBranch(false));
            dispatch(updateisClient(true));
            dispatch(updateisClientID(false));
        };
    }, []);
    const hasAudiencImport = _get(_find(permissionList ?? [], ['featureId', 47]), 'addAccess', false);
    const hasViewAnalytics = _get(_find(permissionList ?? [], ['featureId', 4]), 'viewAccess', false);
    const hasDataExchange = _get(_find(permissionList ?? [], ['featureId', 44]), 'addAccess', false);
    const hasFormGenerator = _get(_find(permissionList ?? [], ['featureId', 16]), 'addAccess', false);
    const hasDataAttribute = _get(_find(permissionList ?? [], ['featureId', 53]), 'addAccess', false);
    const hasAudienceScore = _get(_find(permissionList ?? [], ['featureId', 52]), 'addAccess', false);

    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader title="Manage all your communication with a click" isHeaderLine />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">
                <div className="box-design mt20">
                    {!isClient && isClientID && (
                        <div className={`alert alert-warning mb23 border-r7 align-items-stretch`}>
                            <i
                                className={`mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${alert_medium} icon-md bg-orange-medium `}
                            ></i>
                            <span className='align-items-center d-flex lh-sm py10'>{NOT_A_CLIENT}</span>
                        </div>
                    )}
                    {clientBranch ? (
                        <div className={`alert alert-success mb23 border-r7 align-items-stretch`}>
                            <i
                                className={`mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${circle_tick_medium} icon-md bg-primary-green `}
                            ></i>
                            <span className='align-items-center d-flex lh-sm py10'>{HEADER_QUATER_CHANGED}</span>
                        </div>
                    ) : (
                        <>
                            {/* <div
                                className={`alert alert-danger align-items-center mb23`}
                                style={{ borderRadius: '5px' }}
                            >
                                <i
                                    className={`position-relative mr5 p5 ${close_medium} icon-md color-primary-red `}
                                ></i>
                                <span>Your head quarter has not changed</span>
                            </div> */}
                        </>
                    )}
                    <div className="rs-launchpad-block rlb-01">
                        <Row>
                            <Col
                                className={`pr0 border-0 ${isHybrid || !hasAudiencImport ? 'click-off' : ''}`}
                                onClick={() => {
                                    if (!isHybrid || hasAudiencImport) handleImportAudience('/audience/add-audience');
                                }}
                            >
                                <Link>
                                    <span className="icon-holder">
                                        <i className={`${user_persona_large} icon-xl`}></i>
                                    </span>
                                    <span className="text-holder">Import audience</span>
                                </Link>
                            </Col>
                            <Col
                                className={`p0 ${isAudience === 0 ? 'click-off' : ''}`}
                                onClick={() => {
                                    if (isAudience !== 0) navigate('/communication/communication-creation');
                                }}
                            >
                                <Link>
                                    <span className="icon-holder">
                                        <i className={`${communication_plus_large} icon-xl`}></i>
                                    </span>
                                    <span className="text-holder">Create a communication</span>
                                </Link>
                            </Col>
                            <Col
                                className={`pl0 ${
                                    isAudience === 0 || !isCampaign || !hasViewAnalytics ? 'click-off' : ''
                                }`}
                                onClick={() => {
                                    if (isAudience !== 0 && isCampaign && hasViewAnalytics) {
                                        navigate('/analytics', { state: { index: 0 } });
                                    } else if (isAudience !== 0 && !isCampaign && hasViewAnalytics) {
                                        navigate('/communication/communication-creation');
                                    } else {
                                        const stateRedirect = { from: 'master-data' };
                                        const stateredirectEncode = encodeUrl(stateRedirect);
                                        navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
                                            state: stateRedirect,
                                        });
                                    }
                                }}
                            >
                                <Link>
                                    <span className="icon-holder">
                                        <i className={`${analytics_settings_large} icon-xl`}></i>
                                    </span>
                                    <span className="text-holder">View analytics</span>
                                </Link>
                            </Col>
                        </Row>
                    </div>
                    <div className="rs-launchpad-block rlb-02 mt40">
                        <Row>
                            <Col
                                className={`border-0 ${!hasDataExchange} ? 'click-off':''`}
                                onClick={() => {
                                    if (hasDataExchange) handleImportAudience(`/preferences/data-exchange`);
                                }}
                            >
                                <Link>
                                    <span className="icon-holder">
                                        <i className={`${data_exchange_large} icon-xl`}></i>
                                    </span>
                                    <span className="text-holder">Data exchange</span>
                                </Link>
                            </Col>
                            <Col
                                className={`${!hasFormGenerator ? 'click-off' : ''}`}
                                onClick={() => {
                                    if (hasFormGenerator) handleImportAudience(`/preferences/form-generator`);
                                }}
                            >
                                <Link>
                                    <span className="icon-holder">
                                        <i className={`${form_generator_large} icon-xl`}></i>
                                    </span>
                                    <span className="text-holder">Form builder</span>
                                </Link>
                            </Col>
                            <Col
                                className={`${!hasDataAttribute ? 'click-off' : ''}`}
                                onClick={() => {
                                    if (hasDataAttribute) handleImportAudience(`/preferences/data-catalogue`);
                                }}
                            >
                                <Link>
                                    <span className="icon-holder">
                                        <i className={`${list_attribute_large} icon-xl`}></i>
                                    </span>
                                    <span className="text-holder">Data catalog</span>
                                </Link>
                            </Col>
                            <Col
                                className={`${!hasAudienceScore ? 'click-off' : ''}`}
                                onClick={() => {
                                    if (hasAudienceScore) handleImportAudience(`/preferences/audience-score`);
                                }}
                            >
                                <Link>
                                    <span className="icon-holder">
                                        <i className={`${user_leadscore_large} icon-xl`}></i>
                                    </span>
                                    <span className="text-holder">Audience score</span>
                                </Link>
                            </Col>
                        </Row>
                    </div>
                    {/* <h3 className="rsl-text click-off">
                        Before beginning, you might want to generate a one-line SDK
                        <RSPrimaryButton className="ml15">Generate</RSPrimaryButton>
                    </h3> */}
                </div>
            </Container>
            {/* Main page content block ends */}
            <ConfirmationPopup
                show={show}
                type={'brand'}
                handleClose={() => {
                    setValue('listType', '');
                    setShow(false);
                }}
                handleConfirm={() => setShow(false)}
            />
            <RSConfirmationModal
                show={warningModal?.show}
                text={'Please add department ID to proceed'}
                handleClose={() => {
                    !warningModal?.show;
                }}
                secondaryButton={false}
                handleConfirm={() => {
                    navigate('/preferences/company-list/add-companies', {
                        state: {
                            clientId,
                            mode: 'edit',
                            licenseTypeId,
                            page: 'NEW_COMPANY',
                        },
                    });
                }}
            />
            {/* <WarningPopup
                show={warningModal?.show}
                handleClose={() => {
                    navigate('/preferences/company-list/add-companies', {
                        state: {
                            clientId,
                            mode: 'edit',
                            licenseTypeId,
                            page: 'NEW_COMPANY',
                        },
                    });
                }}
                text={'Please add department ID to proceed'}
                showCancel={false}
            /> */}
        </div>
        // Content holder ends
    );
};

export default LaunchPad;
