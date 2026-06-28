import { circle_plus_fill_edge_mini } from 'Constants/GlobalConstant/Glyphicons';
import { INITIAL_STATE, STATE_REDUCER } from './constant';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RSTabbar from 'Components/RSTabber';
import { get_connectorsList, getDataExchangeElements } from 'Reducers/preferences/DataExchange/request';
import { useDispatch, useSelector } from 'react-redux';
import { AUDIENCE_RDSTAB_CONFIG, getTabData } from 'Pages/AuthenticationModule/Preferences/Pages/DataExchange/Pages/constant';
import { getSessionId } from 'Reducers/globalState/selector';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import { reset_failures_API_Errors } from 'Reducers/globalState/reducer';

const RemoteDataSource = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const [state, dispatchState] = useReducer(STATE_REDUCER, INITIAL_STATE);
    const { connectorList } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const [tabData, setTabData] = useState([]);
    useEffect(() => {
            const payload = {
                departmentId,
                clientId,
                userId,
                dataexchangemodelid: 1,
            };
    
            dispatch(get_connectorsList(payload));
            dispatch(getDataExchangeElements(payload, true, AUDIENCE_RDSTAB_CONFIG));
        }, [departmentId, clientId]);
        useEffect(() => {
            if (connectorList) {
                const connectors = connectorList.filter(item => !AUDIENCE_RDSTAB_CONFIG.includes(item.sourceGroupName));
                const tabData = getTabData(connectors);
                setTabData(tabData);
            }
        }, [connectorList]);
    useEffect(() => {
        return () => {
            dispatch(updateIntegartedSytem({ field: 'connectorList', data: [] }));
            dispatch(updateIntegartedSytem({ field: 'GetAPIConnectionActive', data: [] }));
            dispatch(reset_failures_API_Errors());
        };
    }, []);
    return (
        <div className="mt21 dataExchangePageCSS">
            <div className="rs-vertical-tabs-wrapper">
                <RSTabbar
                    dynamicTab="vertical-tabs rsv-tabs-list"
                    activeClass="active"
                    tabData={tabData}
                    defaultTab={0}
                    // callBack={(tabData) => {
                    //     if (tabData.text !== 'All') {
                    //         dispatchState({
                    //             type: 'UPDATE',
                    //             payload: tabData.data,
                    //             field: 'availableSystems',
                    //         });
                    //     } else {
                    //         getAvailableSystems();
                    //     }
                    // }}
                />
            </div>
            {/* <div className="">
                <Row>
                    <h4>{INTEGRATED_SYSTEMS}</h4>
                </Row>
                <Row>
                    {false ? (
                        <Col md={4}></Col>
                    ) : (
                        <div>
                            <p>{NO_ACCOUNTS_CONNECTED}</p>
                        </div>
                    )}
                </Row>
                <Row>
                    <h4>{AVAILABLE_SYSTEMS}</h4>
                </Row>
                <div className="sourceCategory">
                    {!state.renderComponent?.length
                        ? state.availableSystems?.map((system) => {
                              window.scrollTo(0, 0);
                              return (
                                  <div key={system.title}>
                                      <p>{system.title}</p>
                                      <img src={system.img} alt="i" />
                                      <i
                                          className={`${circle_plus_fill_edge_mini}`}
                                          onClick={() => {
                                              navigate('/audience/add-audience', {
                                                  state: {
                                                      from: 'audience',
                                                      type: system?.id,
                                                  },
                                              });
                                          }}
                                      />
                                  </div>
                              );
                          })
                        : 'RDS'}
                </div>
            </div> */}
        </div>
    );
};

export default RemoteDataSource;
