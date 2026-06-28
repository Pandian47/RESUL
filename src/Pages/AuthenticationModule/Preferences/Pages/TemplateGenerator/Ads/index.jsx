import { createContext, useState } from 'react';
import RSTabbarFluid from 'Components/RSTabberFluid';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import { useSelector } from 'react-redux';
import { adsTabData } from './constant';
import { getSessionId } from 'Reducers/globalState/selector';
import usePermission from 'Hooks/usePersmission';

export const AdsProvider = createContext({
    updateUserId: 0,
});

const Ads = () => {
    const navigate = useNavigate();

    const { userId } = useSelector((state) => getSessionId(state));

    const [updateUserId, setUpdateUserId] = useState(0);

    const contextValue = {
        updateUserId,
    };
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};

    return (
        <AdsProvider.Provider value={contextValue}>
            <div className="page-content-holder">
                {/* Main page heading block starts */}
                <RSPageHeader title="Ads" isTabber rightCommonMenus isBack backPath="/preferences/template-gallery" />
                {/* Main page heading block ends */}

                {/* Main page content block starts */}
                <div className="pc-tabs-wrapper">
                    <div className="page-content pc-communication-plan">
                        <Container fluid>
                            <div className="page-content">
                                <RSTabbarFluid
                                    defaultClass={`col-md-4`}
                                    dynamicTab={`mb0 mini rst-left-space`}
                                    activeClass={`active`}
                                    tabData={adsTabData(updateUserId, addAccess)}
                                    defaultTab={0}
                                    className="rs-tabs row"
                                    callBack={(tabState) => {
                                        const tabId = parseInt(tabState?.id, 10);
                                        if (tabId === 1) {
                                            setUpdateUserId(0);
                                        } else if (tabId === 2) {
                                            setUpdateUserId(userId);
                                        } else if (tabId === 3) {
                                            navigate('create_ads', {
                                                state: {
                                                    currentEditId: null,
                                                },
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </Container>
                    </div>
                </div>
                {/* Main page content block ends */}
            </div>
        </AdsProvider.Provider>
    );
};

export default Ads;
