import { getYYMMDD } from 'Utils/modules/dateTime';
import { OverviewList } from '../../Components';
import { areasplineChartOptions } from 'Constants/Charts';
import { Col, Row } from 'react-bootstrap';
import KendoGrid from 'Components/RSKendoGrid';
import useQueryParams from 'Hooks/useQueryParams';
import { getChartData, overview_data } from './data';
import SplitHeader from '../../Components/SplitHeader';
import { useDispatch, useSelector } from 'react-redux';
import RSHighchartsContainer from 'Components/Highcharts';
import { HorizontalSkeleton, DetailAnalyticsChannelPortletLoader } from 'Components/Skeleton/Skeleton';
import { getSessionId } from 'Reducers/globalState/selector';
import { get_Digipop_Reports } from 'Reducers/analytics/details/request';
import { updateDetailsMainList } from 'Reducers/analytics/details/reducer';

const Digipop = ({ reports }) => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/analytics/detail-analytics');
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { fromSplitHeader, channelDetail } = useSelector(({ analyticsDetails }) => analyticsDetails);

    const getData = async (filterData) => {
        const payload = {
            clientId,
            departmentId,
            userId,
            campaignId: channelDetail?.campaignId,
            fromDate: filterData?.selectedDate?.startDate
                ? getYYMMDD(filterData?.selectedDate?.startDate)
                : getYYMMDD(channelDetail?.startDate),
            toDate: filterData?.selectedDate?.endDate
                ? getYYMMDD(filterData?.selectedDate?.endDate)
                : getYYMMDD(channelDetail?.endDate),
        };
        const { status, data } = await dispatch(get_Digipop_Reports(payload));

        dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: true }));
    };
    return (
        <div className="rs-csr-wrapper">
            {fromSplitHeader || Object.keys(reports)?.length > 0 ? (
                <>
                    <SplitHeader
                        datePicker={true}
                        callbackSplit={getData}
                        colorfulHeader={false}
                        splitView={false}
                        splitData={[]}
                        detailAnalytics={false}
                        startDate={channelDetail?.startDate ? new Date(channelDetail?.startDate) : reports?.startDate}
                        endDate={channelDetail?.endDate ? new Date(channelDetail?.endDate) : reports?.endDate}
                    />
                    {Object.keys(reports)?.length > 0 ? (
                        <>
                            <div className="mt30">
                                <OverviewList
                                    dataObj={overview_data(
                                        { count: reports?.reach },
                                        { count: reports?.engagement },
                                        { count: reports?.ctr },
                                    )}
                                    isFooter={false}
                                />
                            </div>
                            <Row>
                                <Col md={6}>
                                    <div className="portlet-container portlet-md">
                                        <div className="portlet-heading">
                                            <h3>{'Reach'}</h3>
                                        </div>
                                        <div className="portlet-body">
                                            <RSHighchartsContainer
                                                key={'overall'}
                                                options={areasplineChartOptions(
                                                    getChartData('Reach', reports),
                                                )}
                                            />
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="portlet-container portlet-md">
                                        <div className="portlet-heading">
                                            <h3>{'Engagement'}</h3>
                                        </div>
                                        <div className="portlet-body">
                                            <RSHighchartsContainer
                                                key={'overall'}
                                                options={areasplineChartOptions(
                                                    getChartData('Engagement', reports),
                                                )}
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <div className="rs-table-with-heading mb30">
                                        <div className="portlet-header flex-row mb10 ">
                                            <div className="fr flex-left d-flex align-items-center">
                                                <h4 className="mb0">Creatives</h4>
                                            </div>
                                        </div>

                                        <div className="portlet-body">
                                            {reports?.creative?.length > 0 ? (
                                                <>
                                                    <KendoGrid
                                                        data={reports?.creative}
                                                        scrollable="scrollable"
                                                        column={[
                                                            {
                                                                field: 'creative',
                                                                title: 'Creative',
                                                                width: 80,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td>
                                                                        <div>
                                                                            <p>{dataItem?.creative}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'creative_url',
                                                                title: 'Image',
                                                                width: 80,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td>
                                                                        <div>
                                                                            <img
                                                                                src={dataItem?.creative_url}
                                                                                width={50}
                                                                                height={20}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'creativeclicks',
                                                                title: 'Reach',
                                                                width: 80,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td className="text-right">
                                                                        <div>
                                                                            <p>{dataItem?.creativeimpressions}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'creativeclicks',
                                                                title: 'Engagement',
                                                                width: 80,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td className="text-right">
                                                                        <div>
                                                                            <p>{dataItem?.creativeclicks}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'creativectr',
                                                                title: 'CTR',
                                                                width: 80,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td className="text-right">
                                                                        <div>
                                                                            <p>{dataItem?.creativectr}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                        ]}
                                                        settings={{
                                                            total: reports?.creative?.length,
                                                        }}
                                                        isScrollTop={false}
                                                    />
                                                </>
                                            ) : (
                                                <HorizontalSkeleton isError={true} message={'No data available'} />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className="rs-table-with-heading mb10">
                                        <div className="portlet-header flex-row mb10 ">
                                            <div className="fr flex-left d-flex align-items-center">
                                                <h4 className="mb0">Publishers</h4>
                                            </div>
                                        </div>

                                        <div className="portlet-body">
                                            {reports?.publisher?.length > 0 ? (
                                                <>
                                                    <KendoGrid
                                                        data={reports?.publisher}
                                                        scrollable="scrollable"
                                                        column={[
                                                            {
                                                                field: 'publisher',
                                                                title: 'Publisher',
                                                                width: 80,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td>
                                                                        <div>
                                                                            <p>{dataItem?.publisher}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'publisher_url',
                                                                title: 'Publisher URL',
                                                                width: 140,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td>
                                                                        <div>
                                                                            <p>{dataItem?.publisher_url}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'publisherimpressions',
                                                                title: 'Reach',
                                                                width: 70,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td className="text-right">
                                                                        <div>
                                                                            <p>{dataItem?.publisherimpressions}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'publisherclicks',
                                                                title: 'Engagement',
                                                                width: 70,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td className="text-right">
                                                                        <div>
                                                                            <p>{dataItem?.publisherclicks}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },

                                                            {
                                                                field: 'publisherctr',
                                                                title: 'CTR',
                                                                width: 70,
                                                                filter:'text',
                                                                cell: ({ dataItem }) => (
                                                                    <td className="text-right">
                                                                        <div>
                                                                            <p>{dataItem?.publisherctr}</p>
                                                                        </div>
                                                                    </td>
                                                                ),
                                                            },
                                                        ]}
                                                        settings={{
                                                            total: reports?.publisher?.length,
                                                        }}
                                                        isScrollTop={false}
                                                    />
                                                </>
                                            ) : (
                                                <HorizontalSkeleton isError={true} message={'No data available'} />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <DetailAnalyticsChannelPortletLoader isError hideTabbarSkeleton={fromSplitHeader} />
                    )}
                </>
            ) : (
                <DetailAnalyticsChannelPortletLoader isError hideTabbarSkeleton={fromSplitHeader} />
            )}
        </div>
    );
};

export default Digipop;
