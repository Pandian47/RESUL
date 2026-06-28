import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';

import RSTooltip from 'Components/RSTooltip';
import _map from 'lodash/map';
import { getSessionId } from 'Reducers/globalState/selector';
import { getConsumptionChannelDetails } from 'Reducers/preferences/consumptions/request';
import useQueryParams from 'Hooks/useQueryParams';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import { useNavigate } from 'react-router-dom';
import { commonConsumptionColumns } from '../../../../constant';

const ConsumptionCommunicationResponse = () => {
    const { u_consumptionMM, u_consumptionYY, consumptionYY, consumptionMM, consumptionChannel } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const navigate = useNavigate();
    const currentDate = new Date().toDateString();
    const [consumptionChannelList, setConsumptionChannelList] = useState([]);
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams('/preferences/consumptions/consumption-channel');
    const [custColumns, setCustColumns] = useState([]);
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 40,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
    });
    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState;
        setPaginationParams({ skip, take });
    };
    
    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
                if (status) {
            setConsumptionChannelList(data);
            const tableName =
                Array.isArray(data?.communicationResponseChannelConsumptionList?.[0]?.custom) &&
                data.communicationResponseChannelConsumptionList[0].custom?.length > 0
                    ? _map(data.communicationResponseChannelConsumptionList[0].custom, (res, key) => {
                          return { field: res, title: res, width: 150 };
                      })
                    : [];
            setCustColumns(tableName);
        } else {
            setConsumptionChannelList([]);
        }
    };

    useEffect(() => {
        if (departmentId && clientId && userId) {
            const updatedParams = {
                ...params,
                month: u_consumptionMM + 1,
                year: u_consumptionYY,
            };
            setParams(updatedParams);
            handleConsumptionChannelDetails(updatedParams);
        }
    }, [u_consumptionMM, u_consumptionYY, departmentId, clientId, userId]);

    const handleSearchFilter = (searchName) => {
        setParams((pre) => ({
            ...pre,
            searchText: searchName,
        }));
    };
    
    const handleDateFilter = (date) => {
        setParams((pre) => ({
            ...pre,
            startDate: getYYMMDD(date.startDate),
            endDate: getYYMMDD(date.endDate),
        }));
    };

    return (
        <Fragment>
            {consumptionChannelList?.campResponseConsumptionList?.length ? (
                <>
                    <ConsumptionChannelHeader
                        setConsumptionChannelList={setConsumptionChannelList}
                        setCustColumns={setCustColumns}
                        paginationParams={paginationParams}
                        setPaginationParams={setPaginationParams}
                    />

                    <div className="mb70">
                        <KendoGrid
                            data={consumptionChannelList?.campResponseConsumptionList}
                            isLoading={isLoading}
                            isConsumption
                            scrollable={'scrollable'}
                            onDataStateChange={(data) => handlePagerChange(data)}
                            pagerChange={paginationParams?.initialPagination}
                            autoResizeSize
                            column={[
                                { field: 'campaigngroupingID', title: 'Group ID', width: 120, filter: 'text' },
                                {
                                    field: 'campaignName',
                                    title: 'Communication name',
                                    width: 210,
                                    filter: 'text',
                                    cell: ({ dataItem, field }) => {
                                        return (
                                            <td>
                                                <div className="d-flex justify-content-between">
                                                    <span
                                                        className="cursor-pointer link-underline-hover color-primary-black"
                                                        onClick={() => {
                                                            dispatch(
                                                                updateAnalyticsDetail({
                                                                    channelName: consumptionChannel?.lable,
                                                                    campaignId: dataItem?.campaignID,
                                                                    from: 'analytics',
                                                                    blastId: dataItem?.blastShortCode,
                                                                    channelId: 40,
                                                                    currIndex:
                                                                        dataItem?.deliveryMethod === 'Multi dimension'
                                                                            ? dataItem?.mdcLevel - 1
                                                                            : 0,
                                                                }),
                                                            );
                                                            const state = {
                                                                channelName: consumptionChannel?.lable,
                                                                campaignId: dataItem?.campaignID,
                                                                from: dataItem?.campaignID,
                                                                campaignName: dataItem?.campaignName,
                                                                isGolden: dataItem?.isGoldCampaign,
                                                                channelId: dataItem?.channelId,
                                                                iswinnerSplit: dataItem?.iswinnerSplit,
                                                                iswinnerSplitType: dataItem?.iswinnerSplitType,
                                                                startDate: dataItem?.displayStartdate,
                                                                endDate: dataItem?.displayEnddate,
                                                                campaignTypeValue: dataItem?.campaignTypeValue,
                                                                subSegmentFriendlyName: dataItem?.subSegmentLevelFriendlyName,
                                                                subSegmentLevel: dataItem?.subSegmentLevel,
                                                            };
                                                            const encryptState = encodeUrl(state);
                                                            navigate(`/analytics/analytics-report?q=${encryptState}`, {
                                                                state,
                                                            });
                                                        }}
                                                    >
                                                        {dataItem?.[field]?.length > 21 ? (
                                                            <RSTooltip
                                                                text={`${dataItem?.[field]}`}
                                                                position="top"
                                                                innerContent={false}
                                                            >
                                                                <span className="m0">
                                                                    {truncateTitle(dataItem?.[field], 21)}
                                                                </span>
                                                            </RSTooltip>
                                                        ) : (
                                                            <span className="m0">{dataItem?.[field]}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    },
                                },
                                ...commonConsumptionColumns(),
                                // {
                                //     field: 'displayStartdate',
                                //     title: 'Start date',
                                //     width: 180,
                                //     filter: 'date',
                                //     cell: ({ dataItem }) => (
                                //         <td>
                                //             <span className="m0">
                                //                 {getUserCurrentFormat(dataItem?.displayStartdate)?.dateFormat}
                                //             </span>
                                //         </td>
                                //     ),
                                // },
                                // {
                                //     field: 'displayEnddate',
                                //     title: 'End date',
                                //     width: 180,
                                //     filter: 'date',
                                //     cell: ({ dataItem }) => (
                                //         <td>
                                //             <span className="m0">
                                //                 {getUserCurrentFormat(dataItem?.displayEnddate)?.dateFormat}
                                //             </span>
                                //         </td>
                                //     ),
                                // },
                                { field: 'transactionType', title: 'Transaction type', width: 200, filter: 'text' },
                                // { field: 'fileName', title: 'File name', width: 150, filter: 'text' },
                                { field: 'destination', title: 'Destination', width: 150, filter: 'text' },
                                { field: 'fileRowCount', title: 'File row count', width: 180, filter: 'text', cell : ({dataItem}) => {
                                    return (
                                        <td className='text-right'>{numberWithCommas(dataItem?.fileRowCount)}</td>
                                    )
                                } },
                                 {
                                    field: 'displayScheduledate',
                                    title: 'Schedule date',
                                    width: 150,
                                    filter: 'date',
                                    cell: ({ dataItem, field }) => {
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                            ]}
                        />
                    </div>
                </>
            ) : (
                <div className="">
                    <RSSkeletonTable text={true} count={5} />
                </div>
            )}
        </Fragment>
    );
};

export default ConsumptionCommunicationResponse;

