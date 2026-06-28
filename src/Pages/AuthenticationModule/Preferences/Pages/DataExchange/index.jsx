import { decryptWithAES } from 'Utils/modules/crypto';
import { useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import RSTabbarFluid from 'Components/RSTabberFluid';
import DataIngestion from './Pages/DataIngestion';
import ApiConsumption from './Pages/ApiConsumption';
import Publishers from './Pages/Publishers';
import { useDispatch, useSelector } from 'react-redux';
import { connectFieldsLists } from './Pages/DataIngestion/Components/DataExchangeModals/Common/constants';
import ConnectFields from './Pages/DataIngestion/Components/DataExchangeModals/Common/DataExchangeConnect';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import { useNavigate } from 'react-router-dom';
import { navigateBackToCommunicationSocialPostAsync } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';


import { parseDecryptedAudienceQuery } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
const DataExchange = () => {
    const { integratedSystem, connectFields, addCard } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        return () => {
            dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
            dispatch(updateIntegartedSytem({ field: 'integratedSystem', data: [] }));
        };
    }, []);

    return (
        <div className="page-content-holder">
            <RSPageHeader
                title="Data exchange"
                isBack
                isTabber
                rightCommonMenus
                backAction={() => {
                    let socialPostQuery = localStorage.getItem('socialPostQuery');
                    const quries = parseDecryptedAudienceQuery(socialPostQuery, decryptWithAES, null);
                    if (quries?.fromCommunication) {
                        navigateBackToCommunicationSocialPostAsync(dispatch, navigate, quries);
                    } else if (!_isEmpty(connectFields)) {
                        dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                    } else {
                        navigate('/preferences');
                    }
                }}
            />
            {!_isEmpty(connectFields) ? (
                <ConnectFields connectFeildsLists={connectFieldsLists} />
            ) : (
                <Container fluid>
                    <div className="page-content pc-data-exchange">
                        <RSTabbarFluid
                            defaultClass={`col-md-4`}
                            dynamicTab={`mb0 mini rst-left-space`}
                            activeClass={`active`}
                            className="rs-tabs row"
                            tabData={[
                                {
                                    id: 'Data ingestion',
                                    text: 'Data ingestion',
                                    component: () => <DataIngestion />,
                                },
                                {
                                    id: 'API consumption',
                                    text: 'API consumptions',
                                    component: () => <ApiConsumption />,
                                    disable: false,
                                },
                                {
                                    id: 'Publishers',
                                    text: 'Publishers',
                                    component: () => <Publishers />,
                                    disable: true,
                                },
                            ]}
                            defaultTab={0}
                        />
                    </div>
                </Container>
            )}
        </div>
    );
};

export default DataExchange;
