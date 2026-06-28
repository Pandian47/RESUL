
import { COMMUNICATION_METRICS_BY_CHANNEL, CONVERSION, ENGAGEMENT, REACH } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

import KendoGrid from 'Components/RSKendoGrid';

import useApiLoader from 'Hooks/useApiLoader';
import { NONE_LOADER_CONFIG as noLoaderConfig } from 'Hooks/loaderTypes';

import { GOALS_SUMMARY } from './constant';


const CHANNEL_GOALS_SKELETON_COLUMNS = 4;
const CHANNEL_GOALS_SKELETON_ROWS = 5;

const CHANNEL_GOALS_COLUMNS = [
    {
        title: 'Channels',
        width: 250,
        cell: ({ dataItem }) => (
            <td>
                <div className="align-items-center d-flex gap-2 rs-goals-grid-col">
                    <i className={`${dataItem?.iconName} icon-lg color-primary-blue pointer-event-none`} />
                    <span>{dataItem?.channelName}</span>
                </div>
            </td>
        ),
    },
    {
        field: 'reach',
        title: REACH,
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.reach}
            </td>
        ),
    },
    {
        field: 'engagement',
        title: ENGAGEMENT,
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.engagement}
            </td>
        ),
    },
    {
        field: 'conversion',
        title: CONVERSION,
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.conversion}
            </td>
        ),
    },
];

const ChannelGoals = () => {
    const state = useLocation();
    const gridApi = useApiLoader({ autoFetch: false, loaderConfig: noLoaderConfig, mode: 'create' });
    const [gridData, setGridData] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    const isGridLoading = gridApi.isFetching || !hasLoaded;

    useEffect(() => {
        gridApi.refetch({
            fetcher: async () => GOALS_SUMMARY,
            loaderConfig: noLoaderConfig,
            mode: 'create',
            onSuccess: (data) => {
                setGridData(Array.isArray(data) ? data : []);
            },
            onSettled: () => {
                setHasLoaded(true);
            },
        });

        return () => {
            gridApi.reset();
        };
    }, [gridApi.refetch, gridApi.reset]);

    return (
        <div className="page-content-holder">
            <RSPageHeader
                title={COMMUNICATION_METRICS_BY_CHANNEL}
                isBack
                backPath="/preferences/goals-and-benchmark/channel-benchmark"
                state={state?.state}
            />

            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <div className="rs-goals-summary-grid-wrapper">
                            <KendoGrid
                                data={gridData}
                                pageable={false}
                                isLoading={isGridLoading}
                                hasLoaded={hasLoaded}
                                skeletonColumns={CHANNEL_GOALS_SKELETON_COLUMNS}
                                skeletonRows={CHANNEL_GOALS_SKELETON_ROWS}
                                column={CHANNEL_GOALS_COLUMNS}
                            />
                        </div>
                    </Container>
                </div>
            </Container>
        </div>
    );
};

export default ChannelGoals;
