import { subtractDays_dddmmmddyyyy } from 'Constants/Utils/dates';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { EDIT } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, circle_plus_fill_medium, pencil_edit_medium, refresh_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import ApiModel from './ApiModel';
import ViewEyeModel from './ViewEyeModel';
import { get_ApiConsumption, get_connectorsList } from 'Reducers/preferences/DataExchange/request';

import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader, { API_STATUS } from 'Hooks/useApiLoader';

import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { DataExchangeTabContentSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import IntegratedSystemsConnectionsModal from '../DataIngestion/Components/DataExchangeModals/Common/IntegratedSystemsConnectionsModal';
import RSTooltip from 'Components/RSTooltip';




const groupConnectionsByRemoteDataSourceId = (items) => {
    if (!items?.length) return [];
    const map = new Map();
    items.forEach((item, index) => {
        const id = item?.remoteDataSourceID;
        const key =
            id === undefined || id === null ? `__single_${item?.apiConsumptionsDetailsId ?? `idx_${index}`}` : String(id);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
    });
    return Array.from(map.values()).map((connections) => ({
        remoteDataSourceID: connections[0]?.remoteDataSourceID,
        connections,
    }));
};

const ApiConsumption = () => {
    const dispatch = useDispatch();
    const connectorsAPI = useApiLoader();
    const apiConsumptionAPI = useApiLoader();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const { connectorList } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const { GetAPIConnectionActive } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const [modelShow, setModelShow] = useState({
        addModel: false,
        eyeModel: false,
        data: [],
        isEdit: false,
    });
    const [selectedItem, setSelectedItem] = useState({
        viewItem: [],
        addItem: [],
        details: {},
    });
    const [integratedSystemsModal, setIntegratedSystemsModal] = useState({
        show: false,
        connections: [],
        title: '',
    });

    const groupedActiveConnection = useMemo(
        () => groupConnectionsByRemoteDataSourceId(GetAPIConnectionActive || []),
        [GetAPIConnectionActive],
    );

    const hideIntegratedSystemsConnectionsModal = useCallback(
        () => setIntegratedSystemsModal((m) => ({ ...m, show: false })),
        [],
    );

    const openApiEditModal = useCallback((row) => {
        hideIntegratedSystemsConnectionsModal();
        setModelShow((pre) => ({
            ...pre,
            addModel: true,
            data: row,
            isEdit: true,
        }));
    }, [hideIntegratedSystemsConnectionsModal]);

    const apiConsumptionPayload = useMemo(
        () => ({
            departmentId,
            clientId,
            userId,
            dataexchangemodelid: 2,
        }),
        [departmentId, clientId, userId],
    );

    const fetchActiveConnections = useCallback(() => {
        return apiConsumptionAPI.refetch({
            fetcher: ({ payload: requestPayload }) => dispatch(get_ApiConsumption(requestPayload)),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload: apiConsumptionPayload },
        });
    }, [apiConsumptionPayload, dispatch, apiConsumptionAPI]);

    useEffect(() => {
        connectorsAPI.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(get_connectorsList({ payload: requestPayload, loading: false })),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload: apiConsumptionPayload },
        });

        fetchActiveConnections();
    }, [departmentId, clientId, userId]);

    const isConnectorsReady =
        connectorsAPI.status === API_STATUS.SUCCESS || connectorsAPI.status === API_STATUS.ERROR;
    const isApiConsumptionReady =
        apiConsumptionAPI.status === API_STATUS.SUCCESS || apiConsumptionAPI.status === API_STATUS.ERROR;
    const isApiContentLoading =
        connectorsAPI.isFetching ||
        apiConsumptionAPI.isFetching ||
        !isConnectorsReady ||
        !isApiConsumptionReady;

    return (
        <DataExchangeTabContentSkeletonGate isLoading={isApiContentLoading} tab="api">
            <div className="mt20">
            <Row>
                <Col sm={12} className="mb15">
                    <h3>Integrated systems</h3>
                </Col>
                <Col sm={12} className="mb15">
                    <Card>
                        <>
                        <Row className="m0">
                            {/* {selectedItem?.addItem?.length !== 0 ? (
                                selectedItem?.addItem?.map((item, index) => (
                                    <Col sm={4} className="py15 topSmallCard" key={index}>
                                        <Card>
                                            <ListGroup variant="flush">
                                                <ListGroup.Item>
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <i
                                                            className={`${item?.icon} icon-xxl p16 color-secondary-blue`}
                                                        />
                                                        {item?.title}
                                                    </div>
                                                </ListGroup.Item>
                                                <ListGroup.Item>
                                                    <span>{item.domain}</span>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="bg-tertiary-blue">
                                                    <small>Last sync : {subtractDays_dddmmmddyyyy(1)}</small>
                                                    <small>Update cycle : Daily</small>
                                                </ListGroup.Item>
                                            </ListGroup>
                                            <div className="addPlusIcon">
                                                <i
                                                    className={`${refresh_medium} icon-md color-primary-blue`}
                                                    id="rs_data_refresh"
                                                ></i>
                                            </div>
                                            <ul className="iconList">
                                                <li>
                                                    <i
                                                        className="color-primary-blue icon-md icon-rs-eye-medium"
                                                        onClick={() =>
                                                            setModelShow((pre) => ({ ...pre, eyeModel: true }))
                                                        }
                                                    ></i>
                                                </li>
                                                <li>
                                                    <i
                                                        className="color-primary-red icon-xs icon-rs-close-mini"
                                                        onClick={() =>
                                                            setSelectedItem((pre) => ({
                                                                ...pre,
                                                                addItem: selectedItem?.addItem.toSpliced(index, 1),
                                                            }))
                                                        }
                                                    ></i>
                                                </li>
                                            </ul>
                                        </Card>
                                    </Col>
                                ))
                            ) : ( */}
                            <>
                                {GetAPIConnectionActive?.length === 0 && (
                                    <div className="card-body border-primary text-center">
                                        <p className="d-flex align-items-center justify-content-center py81 color-primary-grey">
                                             Click {' '}
                                            <i
                                                className={`${circle_plus_fill_medium} icon-md px5 color-primary-blue`}
                                                id="rs_data_circle_plus_fill"
                                            ></i>{' '}
                                            to connect RESUL to an external system.
                                        </p>
                                    </div>
                                )}
                            </>
                            {/* )} */}
                        </Row>
                        <Row className="m0">
                            {groupedActiveConnection?.map((group, ind) => {
                                const ele = group.connections[0];
                                const isMulti = group.connections.length > 1;
                                const cardKey = `g_${group?.remoteDataSourceID ?? 'x'}_${ind}`;
                                const modalTitle =
                                    [ele?.sourceGroupName, ele?.sourceName].filter(Boolean).join(' - ') ||
                                    ele?.sourceName ||
                                    'Connections';
                                const cardTitle = ele?.sourceName;

                                return (
                                    <Fragment key={cardKey}>
                                        <Col sm="4" className="py15 topSmallCard">
                                            <Card>
                                                <ListGroup variant="flush">
                                                    <ListGroup.Item>
                                                        <i
                                                            className={`${
                                                                ele?.imagePath?.split('.')[0]
                                                            }  icon-xxl p16 color-secondary-blue`}
                                                        ></i>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item>{ele?.sourceName}</ListGroup.Item>
                                                    <ListGroup.Item className="bg-tertiary-blue">
                                                        {/* <small>{`Created date : ${dateFormat(
                                                            ele?.CreatedDate,
                                                            'date',
                                                        )}`}</small> */}
                                                        <small>{`Created date: ${
                                                            getUserCurrentFormat(ele?.CreatedDate)?.dateFormat
                                                        }`}</small>
                                                    </ListGroup.Item>
                                                </ListGroup>
                                                <ul className="iconList">
                                                    <li>
                                                        <RSTooltip text={EDIT} position="top">
                                                            <i
                                                                id={`rs_api_consumption_edit_${cardKey}`}
                                                                onClick={() => {
                                                                    setIntegratedSystemsModal({
                                                                        show: true,
                                                                        connections: [...group.connections].reverse(),
                                                                        title: modalTitle,
                                                                    });
                                                                }}
                                                                className={`${pencil_edit_medium} color-primary-blue icon-md cp`}
                                                            />
                                                        </RSTooltip>
                                                    </li>
                                                </ul>
                                            </Card>
                                        </Col>
                                    </Fragment>
                                );
                            })}
                        </Row>
                        </>
                    </Card>
                </Col>
            </Row>
            <Row className="sourceCategory">
                <div className="mt10 mb10">
                    <h3>Available systems</h3>
                </div>
                {connectorList?.map((item, index) => {
                    return (
                        <Col md={4} key={index}>
                            <Card>
                                <Card.Body className="justify-content-start">
                                    <i
                                        className={`${
                                            item?.imagePath?.split('.')[0]
                                        } icon-xxl p16 color-secondary-blue`}
                                    />
                                    <h5>{item.sourceName}</h5>
                                    <div className="addPlusIcon">
                                        <i
                                            id="rs_data_circle_plus_fill_edge"
                                            className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue`}
                                            onClick={() => {
                                                setSelectedItem((pre) => ({
                                                    ...pre,
                                                    viewItem: [item.viewDetails],
                                                    details: item,
                                                }));
                                                setModelShow((pre) => ({ ...pre, addModel: true }));
                                            }}
                                        ></i>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            {modelShow.addModel && (
                <ApiModel
                    show={modelShow.addModel}
                    handleClose={() => {
                        setModelShow((pre) => ({ ...pre, addModel: false, data: [], isEdit: false }));
                    }}
                    editData={modelShow?.data}
                    selcectedData={selectedItem}
                    setSelectedItem={setSelectedItem}
                    isEdit={modelShow?.isEdit}
                    onSaveSuccess={fetchActiveConnections}
                />
            )}
            {modelShow.eyeModel && (
                <ViewEyeModel
                    show={modelShow.eyeModel}
                    handleClose={() => {
                        setModelShow((pre) => ({ ...pre, eyeModel: false }));
                    }}
                />
            )}
            {integratedSystemsModal.show && (
                <IntegratedSystemsConnectionsModal
                    show={integratedSystemsModal.show}
                    onHide={hideIntegratedSystemsConnectionsModal}
                    title={integratedSystemsModal.title}
                    connections={integratedSystemsModal.connections}
                    onEditRow={openApiEditModal}
                    variant="apiConsumption"
                />
            )}
        </div>
        </DataExchangeTabContentSkeletonGate>
    );
};

export default ApiConsumption;
