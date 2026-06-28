import { arrow_left_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import KendoGrid from 'Components/RSKendoGrid';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import { TargetListContext } from '../..';
import { getTLSampleRecords } from 'Reducers/audience/targetList/request';

import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
const AudienceView = () => {
    const { setAudienceView, audienceView } = useContext(TargetListContext);
    const dispatch = useDispatch();
    const sampleRecordsAPI = useApiLoader();
    const [listData, setlistData] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    useEffect(() => {
        const fetchSampleData = async () => {
            setHasLoaded(false);

            const payload = {
                departmentId,
                clientId,
                userId,
                listType: audienceView?.listType,
                listId: audienceView?.listId,
            };

            const response = await sampleRecordsAPI.refetch({
                fetcher: ({ payload: requestPayload }) =>
                    dispatch(getTLSampleRecords({ payload: requestPayload, loading: false })),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
                params: { payload },
                onSettled: () => {
                    setHasLoaded(true);
                },
            });

            if (response?.status) {
                const updated = parseAudienceJsonArray(response?.data, []).map((item) => ({
                    Name: item.Name,
                    Email: item.EmailID,
                    Mobile: item.MobileNo,
                    City: item.City,
                }));
                setlistData(updated);
            } else {
                setlistData([]);
            }
        };

        fetchSampleData();
    }, [audienceView?.listId]);

    return (
        <Fragment>
            <div className="d-flex justify-content-between my21">
                <div className="fs19">{audienceView?.listName}</div>
                <div
                    className="mhwcr-item mhwcr-back cp color-primary-blue"
                    onClick={() => {
                        setAudienceView((prev) => ({
                            listId: 0,
                            listType: 5,
                            listName: '',
                            status: false,
                        }));
                    }}
                >
                    <i className={`${arrow_left_mini} icon-xs color-primary-blue`}></i>
                    {'Back'}
                </div>
            </div>

            <KendoGrid
                data={listData}
                isLoading={sampleRecordsAPI?.isLoading}
                hasLoaded={hasLoaded}
                isFailure={!sampleRecordsAPI?.isLoading && !listData?.length}
                settings={{
                    total: listData?.length,
                }}
            />
        </Fragment>
    );
};

export default AudienceView;
