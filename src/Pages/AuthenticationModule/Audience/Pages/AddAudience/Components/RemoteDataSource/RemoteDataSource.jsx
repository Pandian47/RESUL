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
import { CustomSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import useApiLoader from 'Hooks/useApiLoader';

import { FIELD_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';

const RemoteDataSource = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const connectorsAPI = useApiLoader();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const [state, dispatchState] = useReducer(STATE_REDUCER, INITIAL_STATE);
    const { connectorList } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const [tabData, setTabData] = useState([]);

    const isConnectorsLoading = connectorsAPI.isLoading;
    const showEmptyState = !isConnectorsLoading && tabData?.length === 0;
    const showConnectorsSkeleton = isConnectorsLoading || showEmptyState;

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
            dataexchangemodelid: 1,
        };

        connectorsAPI.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(get_connectorsList({ payload: requestPayload, loading: false })),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload },
        });
        dispatch(getDataExchangeElements(payload, true, AUDIENCE_RDSTAB_CONFIG, false));
    }, [departmentId, clientId]);

    useEffect(() => {
        if (connectorList) {
            const connectors = connectorList.filter(
                (item) => !AUDIENCE_RDSTAB_CONFIG.includes(item.sourceGroupName),
            );
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
            {showConnectorsSkeleton ? (
                <div className="mt20 box-design">
                    <CustomSkeleton isError={showEmptyState} count={8} height={35} />
                </div>
            ) : (
                <div className="rs-vertical-tabs-wrapper">
                    <RSTabbar
                        dynamicTab="vertical-tabs rsv-tabs-list"
                        activeClass="active"
                        tabData={tabData}
                        defaultTab={0}
                    />
                </div>
            )}
        </div>
    );
};

export default RemoteDataSource;
