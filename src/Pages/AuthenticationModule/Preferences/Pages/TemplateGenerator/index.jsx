import { getUserDetails } from 'Utils/modules/crypto';
import { getEnvironment } from 'Utils/modules/environment';
import { BUSINESS_UNIT, CHOOSE_TEMPLATE_BUILDER, SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useMemo, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { templateLists } from './constants';
import { getSessionId } from 'Reducers/globalState/selector';

import RSConfirmationModal from 'Components/ConfirmationModal';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { warmUpFormForgeFF } from 'Reducers/preferences/AdvancedForm/request';

const TemplateGenerator = () => {
    const dispatch = useDispatch();
    const { licenseTypeId } = getUserDetails();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { departmentName, clientId, userId } = useSelector((state) => getSessionId(state));
    const env = getEnvironment();

    const showSelectBu = departmentName?.toLowerCase() === 'all' && licenseTypeId === '3';

    const isPageReady = useMemo(() => {
        if (!clientId || !userId) return false;
        if (String(licenseTypeId) === '3' && !departmentName) return false;
        return true;
    }, [clientId, userId, departmentName, licenseTypeId]);

    useEffect(() => {
        if (showSelectBu) setConfimrationModal(true);
        dispatch(warmUpFormForgeFF());
    }, [showSelectBu]);

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setConfimrationModal(true);
        } else {
            setConfimrationModal(false);
        }
    }, [departmentName, licenseTypeId]);

    return (
        <div className="page-content-holder">
            <RSPageHeader
                title={CHOOSE_TEMPLATE_BUILDER}
                isBack
                backPath="/preferences"
                isHeaderLine
                rightCommonMenus
            />

            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <PreferencesSubPageSkeletonGate
                            variant={PREFERENCES_SUBPAGE_VARIANT.TEMPLATE_GALLERY}
                            isLoading={!isPageReady}
                        >
                            {showSelectBu ? null : (
                                <Row>
                                    {templateLists(env)?.map((item, index) => (
                                        <Col sm={3} className={item?.itemClass} key={index.toString()}>
                                            <div className="rs-box-grid">
                                                <Link to={`/preferences/${item?.link}`} className="no-hover py40">
                                                    <div className="rsbg-holder">
                                                        <i className={`${item?.icon} icon-xl`} />
                                                        <h4>{item?.title}</h4>
                                                    </div>
                                                </Link>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </PreferencesSubPageSkeletonGate>
                    </Container>
                </div>
            </Container>

            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                header={BUSINESS_UNIT}
                isBorder
                handleClose={() => {
                    setConfimrationModal(false);
                }}
                handleConfirm={() => {
                    setConfimrationModal(false);
                }}
                secondaryButton={false}
            />
        </div>
    );
};

export default TemplateGenerator;
