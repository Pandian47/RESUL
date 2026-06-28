import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import _find from 'lodash/find';

import KendoGrid from 'Components/RSKendoGrid';

import { GOALS_AND_BENCHMARK_GRID_CONFIG } from './constants';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import { useDispatch, useSelector } from 'react-redux';
import { communicationAttributesBenchmark, getBenchMarkList } from 'Reducers/preferences/GoalsAndBenchmark/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { CommunicationSettingsGoalsBenchmarkTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const GoalsAndBenchmark = () => {
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const dispatch = useDispatch();
    const [initialPagination, setInitialPagination] = useState(false);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { benchmarkOverview, attributesData, isLoading } = useSelector(({ benchmarkOverview }) => benchmarkOverview);

    const [benchmarkOverviewList, setBenchmarkOverviewList] = useState([]);
    useEffect(() => {
        const payload = { departmentId, clientId, userId };
        const attributePayload = { departmentId, clientId, userId };
        setInitialPagination(true);
        dispatch(getBenchMarkList({ payload }));
        dispatch(communicationAttributesBenchmark(attributePayload));
    }, [departmentId, clientId, userId]);

    useEffect(() => {
        if (benchmarkOverview?.length && attributesData?.length) {
            const overview = benchmarkOverview?.map((res) => ({
                ...res,
                attributeName: _find(attributesData, ['campaignAttributeId', res?.campaignAttributeId])?.attributename,
            }));
            setBenchmarkOverviewList(overview);
        }
    }, [benchmarkOverview, attributesData]);

    return (
        // Contend holder starts
        <div className="mt15">
            {/* Main page heading block starts */}
            {/* <RSPageHeader title="Benchmark" isBack backPath="/preferences" rightCommonMenus /> */}
            {/* Main page heading block ends */}
            {/* Main page content block starts */}
            <div className="flex-row mt21 top-sub-heading">
                <div className="fr flex-right tsh-icons">
                    <ul className="rs-list-group-horizontal jc-right">
                        {
                            <li
                                onClick={() => {
                                    if (addAccess)
                                        navigate('/preferences/goals-and-benchmark/channel-benchmark', {
                                            state: {
                                                benchmarkOverView: {},
                                                mode: 'create',
                                            },
                                        });
                                }}
                            >
                                <RSTooltip position="top" text="Add" className="lh0">
                                    <div   className={`${
                                            !addAccess ? 'pe-none click-off' : ''
                                        }`}>
                                    <i
                                        className={`${
                                            circle_plus_fill_edge_large
                                        } icon-lg color-primary-blue icon-hover-shadow-primary`}
                                        id="rs_data_circle_plus_fill_edge"
                                    ></i>
                                    </div>
                                </RSTooltip>
                            </li>
                        }
                    </ul>
                </div>
            </div>
            <div>
                {isLoading ? (
                    <CommunicationSettingsGoalsBenchmarkTableSkeleton />
                ) : (
                    <KendoGrid
                        data={benchmarkOverviewList}
                        column={GOALS_AND_BENCHMARK_GRID_CONFIG}
                        settings={{
                            total: benchmarkOverview?.length,
                        }}
                        pagerChange={initialPagination}
                        setInitialPagination={setInitialPagination}
                        filterable={true}
                        isLoading={false}
                    />
                )}
            </div>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default GoalsAndBenchmark;
