import { encodeUrl } from 'Utils/modules/crypto';
import RSPageHeader from 'Components/RSPageHeader';
import { Container } from 'react-bootstrap';
import RSTabbarFluid from 'Components/RSTabberFluid';
import { OFFER_TAB_CONFIG } from './Tabs/constants';
import { useNavigate } from 'react-router-dom';

import useQueryParams from 'Hooks/useQueryParams';

const OfferManagement = () => {
    const navigate = useNavigate();
    const queryState = useQueryParams('/preferences/offer-management');
    const indexValue = queryState?.index || 0;
    return (
        <div className="page-content-holder">
            <RSPageHeader title="Offer management" isBack backPath="/preferences" isHeaderLine rightCommonMenus />
            <Container fluid>
                <div className="page-content">
                    <RSTabbarFluid
                        defaultClass={'col-md-6'}
                        dynamicTab={`sp-mb-space-sm mini`}
                        activeClass={`active`}
                        tabData={OFFER_TAB_CONFIG}
                        className="rs-tabs row rst-left-space"
                        defaultTab={indexValue}
                        callBack={(_, index) => {
                            const state = { index };
                            const encryptState = encodeUrl(state);
                            navigate(`/preferences/offer-management?q=${encryptState}`, {
                                state,
                            });
                        }}
                    />
                </div>
            </Container>
        </div>
    );
};

export default OfferManagement;
