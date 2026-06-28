import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { downloadCSVcommasFile } from 'Utils/modules/download';
import { numberWithCommas } from 'Utils/modules/formatters';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { csv_download_large, trophy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import _map from 'lodash/map';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getConsumptionChannelDetails,
    getConsumptionChannelDetailsDownload,
} from 'Reducers/preferences/consumptionsTwins/request';
import useQueryParams from 'Hooks/useQueryParams';
import { useNavigate } from 'react-router-dom';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';

import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { numericParentSumCell } from '../../../../constant';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

const ConsumptionWhatsApp = () => {
    const navigate = useNavigate();
    const { u_consumptionMM, u_consumptionYY, consumptionYY, consumptionMM, consumptionChannel } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const currentDate = new Date().toDateString();
    const [consumptionChannelList, setConsumptionChannelList] = useState([]);
    const [gridData, setGridData] = useState([]);

    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams('/preferences/consumptionsTwins/consumption-channel');
    const [custColumns, setCustColumns] = useState(['dd', 'dd1', 'dd2']);

    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 21,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
        startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
    });

    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });

    const [paramsDownload, setParamsDownload] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 21,
        startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
    });

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState;
        setPaginationParams({ skip, take });
    };

    // const handlePagerChange = (data) => {
    //     const { skip, take } = data?.dataState ?? {};
    //     setParams((prev) => ({
    //         ...prev,
    //         pageNo: skip === 0 ? 1 : skip / take + 1,
    //         pageSize: take,
    //     }));
    // };

    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        if (status) {
            setConsumptionChannelList(data);
            const tableName =
                Array.isArray(data?.whatsAppChannelConsumptionList?.[0]?.custom) &&
                data?.whatsAppChannelConsumptionList[0].custom?.length > 0
                    ? _map(data?.whatsAppChannelConsumptionList[0].custom, (res, key) => {
                          return { field: res, title: res, width: 150 };
                      })
                    : [];
            setCustColumns(tableName);
        } else {
            setConsumptionChannelList([]);
        }
    };
    const [updateConsumptionDate, setUpdateConsumptionDate] = useState({
        startDate: getFirstDayOfMonth(consumptionYY, consumptionMM + 1),
        endDate: getCurrentDateOfMonth(consumptionYY, consumptionMM + 1),
    });

    useEffect(() => {
        setUpdateConsumptionDate({
            startDate: getFirstDayOfMonth(u_consumptionYY, u_consumptionMM + 1),
            endDate: getCurrentDateOfMonth(u_consumptionYY, u_consumptionMM + 1),
        });
    }, [u_consumptionMM, u_consumptionYY]);

    // useEffect(() => {
    //         setUpdateConsumptionDate({
    //             startDate: getFirstDayOfMonth(consumptionYY, consumptionMM + 1),
    //             endDate: getCurrentDateOfMonth(consumptionYY, consumptionMM + 1),
    //         });
    // }, []);
    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            departmentId,
            clientId,
            userId,
        }));
    }, [departmentId, clientId, userId]);

    // useEffect(() => {
    //     handleConsumptionChannelDetails(params);
    // }, [params]);

    useEffect(() => {
        setParams((pre) => ({
            ...pre,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
            startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
            endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
        }));
    }, [u_consumptionMM, u_consumptionYY]);

    useEffect(() => {
        setParamsDownload((pre) => ({
            ...pre,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
            startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
            endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
        }));
    }, [u_consumptionMM, u_consumptionYY]);

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
        setParamsDownload((pre) => ({
            ...pre,
            startDate: getYYMMDD(date.startDate),
            endDate: getYYMMDD(date.endDate),
        }));
    };
    const downloadConsumptionData = async () => {
        let res = await dispatch(getConsumptionChannelDetailsDownload(paramsDownload));
        // downloadCSVcommasFile(
        //     res,
        //     'WhatsApp_' + new Date().toLocaleDateString() + '_' + new Date().toLocaleTimeString(),
        // );
        downloadCSVcommasFile(
            res,
            'WhatsApp_' + getYYMM(paramsDownload.startDate) + '_' + new Date().toLocaleTimeString(),
        );
    };

    const processCustomFields = useCallback((item) => {
        if (!item.custom || !Array.isArray(item.custom)) return {};

        return item.custom.reduce((acc, customKey, index) => {
            if (customKey === 'Communication Docket') {
                acc[customKey] = item.customValues[index] ? 'Yes' : 'No';
            } else {
                acc[customKey] = item.customValues[index] || '';
            }
            return acc;
        }, {});
    }, []);

    const isParentRow = (dataItem) => {
        return (dataItem?.expandDetails?.length ?? 0) > 0;
    };

    const handleExpandClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tr = e.currentTarget.closest('tr');
        if (!tr) return;
        const expandTarget = tr.querySelector(
            '.k-hierarchy-cell .k-icon-button, .k-hierarchy-cell a, .k-hierarchy-cell button, .k-hierarchy-cell .k-icon',
        );
        if (expandTarget && typeof expandTarget.click === 'function') {
            expandTarget.click();
        }
    };

    const getChildGridColumns = useCallback(() => {
        const baseColumns = getGridColumn();

        return baseColumns.map((col) => {
            if (col.field === 'campaignName') {
                return {
                    ...col,
                    cell: ({ dataItem, field }) => {
                        const baseSplitType = dataItem?.splitType?.split(' - ')?.[0]?.trim();
                        const isMdc = dataItem?.deliveryMethod === 'Multi dimension';
                        const displayValue = isMdc
                            ? dataItem?.channelFriendlyName || dataItem?.[field] || ''
                            : baseSplitType || dataItem?.splitType || dataItem?.[field] || '';

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
                                                    blastId:
                                                        dataItem?.iswinnerB2 && dataItem?.iswinnerSplit
                                                            ? dataItem?.iswinnerB2
                                                            : dataItem?.blastShortCode,
                                                    channelId: 21,
                                                    currIndex:
                                                        dataItem?.deliveryMethod === 'Multi dimension'
                                                            ? dataItem?.mdcLevel - 1
                                                            : 0,
                                                }),
                                            );
                                            const state = {
                                                channelName: consumptionChannel?.lable,
                                                campaignId: dataItem?.campaignID,
                                                channelId: 21,
                                                iswinnerSplit: dataItem?.iswinnerSplit,
                                                iswinnerSplitType: dataItem?.iswinnerSplitType,
                                                isSplitAB: dataItem?.isSplitAB,
                                                iswinnerBlastId:
                                                    dataItem?.iswinnerSplit && dataItem?.iswinnerB2
                                                        ? dataItem?.iswinnerB2
                                                        : '',
                                            };
                                            const encryptState = encodeUrl(state);
                                            navigate(`/analytics/detail-analytics?q=${encryptState}`, {
                                                state,
                                            });
                                        }}
                                    >
                                        {displayValue?.length > 25 ? (
                                            <RSTooltip
                                                text={`${displayValue}`}
                                                position="top"
                                                className="color-primary-black"
                                                innerContent={false}
                                            >
                                                <span className="color-primary-black">
                                                    {truncateTitle(displayValue, 25)}
                                                </span>
                                            </RSTooltip>
                                        ) : (
                                            <span className="m0">{displayValue}</span>
                                        )}
                                    </span>
                                </div>
                            </td>
                        );
                    },
                };
            }
            return col;
        });
    }, [custColumns, consumptionChannel, dispatch, navigate]);

    const listViewSettings = useMemo(
        () => ({
            expandField: 'expanded',
            total: gridData?.length,
            onExpandChange: (event) => expandChange(event),
            rowRender: (trElement, rowProps) => {
                const hasDetails = (rowProps?.dataItem?.expandDetails?.length ?? 0) > 0;
                const isExpanded = rowProps.dataItem?.expanded;

                if (!hasDetails) {
                    return cloneElement(trElement, {
                        ...trElement.props,
                        className: `${trElement.props.className || ''} no-expand-row`,
                    });
                }

                if (hasDetails && isExpanded) {
                    return cloneElement(trElement, {
                        ...trElement.props,
                        className: `${trElement.props.className || ''} parent-row-expanded`,
                    });
                }

                return trElement;
            },
            detail: (props) => {
                const processedDetails = props.dataItem?.expandDetails.map((detail) => {
                    const customFields = processCustomFields(detail);
                    return { ...detail, ...customFields };
                });

                return (
                    <div className="rs-kendo-table-hide-header ml-10">
                        <KendoGrid
                            data={processedDetails}
                            isConsumption
                            className="rs-kendo-scrollable-grid mb-0"
                            column={getChildGridColumns()}
                            pageable={false}
                            config={{ take: processedDetails?.length || 999, skip: 0 }}
                        />
                    </div>
                );
            },
        }),
        [
            consumptionChannelList?.whatsAppChannelConsumptionList?.length,
            custColumns,
            processCustomFields,
            getChildGridColumns,
        ],
    );

    const buildGridData = useCallback(() => {
        if (!consumptionChannelList?.whatsAppChannelConsumptionList) return [];

        const allItems = consumptionChannelList?.whatsAppChannelConsumptionList;

        const campaignIdCounts = allItems.reduce((acc, item) => {
            acc[item.campaignID] = (acc[item.campaignID] || 0) + 1;
            return acc;
        }, {});

        const processedCampaignIds = new Set();
        const gridRows = [];

        allItems.forEach((item) => {
            if (processedCampaignIds.has(item.campaignID)) return;

            const hasDuplicates = campaignIdCounts[item.campaignID] > 1;

            if (hasDuplicates) {
                const childRows = allItems.filter((i) => i.campaignID === item.campaignID);

                const parentRow = {
                    campaignID: item.campaignID,
                    campaignName: item.campaignName,
                    expanded: false,
                    expandDetails: childRows,
                };

                Object.keys(item).forEach((key) => {
                    if (!['campaignID', 'campaignName', 'expanded', 'expandDetails'].includes(key)) {
                        parentRow[key] = '';
                    }
                });

                gridRows.push(parentRow);
                processedCampaignIds.add(item.campaignID);
            } else {
                const customFields = processCustomFields(item);
                const normalRow = {
                    ...item,
                    ...customFields,
                    expanded: false,
                    expandDetails: [],
                };
                gridRows.push(normalRow);
            }
        });

        return gridRows;
    }, [consumptionChannelList?.whatsAppChannelConsumptionList, processCustomFields]);

    const expandChange = ({ dataItem }) => {
        const itemId = dataItem?.campaignID;

        setGridData((prevGridData) =>
            prevGridData.map((item) => {
                if (item?.campaignID === itemId) {
                    return {
                        ...item,
                        expanded: !item.expanded,
                    };
                }
                return item;
            }),
        );
    };

    const getGridColumn = () => {
        return [
            {
                field: 'campaigngroupingID',
                title: 'Group ID',
                width: 100,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    return <td>{dataItem?.[field]}</td>;
                },
            },
            {
                field: 'campaignName',
                title: 'Communication name',
                width: 210,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    if (isParentRow(dataItem)) {
                        return (
                            <td>
                                <div className="d-flex justify-content-between">
                                    <span
                                        className={`cursor-pointer link-underline-hover color-primary-black ${
                                            dataItem?.expanded ? 'font-semi-bold' : ''
                                        }`}
                                    >
                                        {dataItem?.[field]?.length > 15 ? (
                                            <RSTooltip text={`${dataItem?.[field]}`} position="top" innerContent={false}>
                                                <span className="m0">{truncateTitle(dataItem?.[field], 15)}</span>
                                            </RSTooltip>
                                        ) : (
                                            <span className="m0">{dataItem?.[field]}</span>
                                        )}
                                    </span>
                                    {/* {dataItem?.expandDetails?.length > 0 && (
                                        <div>
                                            <i
                                                onClick={handleExpandClick}
                                                className={`k-icon ${dataItem?.expanded ? 'k-i-minus' : 'k-i-plus'}`}
                                                style={{ pointerEvents: 'auto' }}
                                            ></i>
                                        </div>
                                    )} */}
                                </div>
                            </td>
                        );
                    }

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
                                                blastId:
                                                    dataItem?.iswinnerB2 && dataItem?.iswinnerSplit
                                                        ? dataItem?.iswinnerB2
                                                        : dataItem?.blastShortCode,
                                                channelId: 21,
                                                currIndex:
                                                    dataItem?.deliveryMethod === 'Multi dimension'
                                                        ? dataItem?.mdcLevel - 1
                                                        : 0,
                                            }),
                                        );
                                        const state = {
                                            channelName: consumptionChannel?.lable,
                                            campaignId: dataItem?.campaignID,
                                            channelId: 21,
                                            iswinnerSplit: dataItem?.iswinnerSplit,
                                            iswinnerSplitType: dataItem?.iswinnerSplitType,
                                            isSplitAB: dataItem?.isSplitAB,
                                            iswinnerBlastId:
                                                dataItem?.iswinnerSplit && dataItem?.iswinnerB2
                                                    ? dataItem?.iswinnerB2
                                                    : '',
                                        };
                                        const encryptState = encodeUrl(state);
                                        navigate(`/analytics/detail-analytics?q=${encryptState}`, { state });
                                    }}
                                >
                                    {dataItem?.[field]?.length > 15 ? (
                                        <RSTooltip text={`${dataItem?.[field]}`} position="top" innerContent={false}>
                                            <span className="m0">{truncateTitle(dataItem?.[field], 15)}</span>
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
            {
                field: 'displayStartdate',
                title: 'Start date',
                width: 180,
                filter: 'date',
                cell: ({ dataItem }) => {
                    if (
                        isParentRow(dataItem) &&
                        Array.isArray(dataItem?.expandDetails) &&
                        dataItem?.expandDetails?.length > 0
                    ) {
                        const firstChild = dataItem?.expandDetails?.[0];
                        const formattedDate = getUserCurrentFormat(firstChild?.displayStartdate)?.dateFormat;

                        return (
                            <td>
                                <span className="m0">{formattedDate || ''}</span>
                            </td>
                        );
                    }
                    return (
                        <td>
                            <span className="m0">{getUserCurrentFormat(dataItem?.displayStartdate)?.dateFormat}</span>
                        </td>
                    );
                },
            },
            {
                field: 'displayEnddate',
                title: 'End date',
                width: 180,
                filter: 'date',
                cell: ({ dataItem }) => {
                    if (
                        isParentRow(dataItem) &&
                        Array.isArray(dataItem?.expandDetails) &&
                        dataItem?.expandDetails?.length > 0
                    ) {
                        const firstChild = dataItem?.expandDetails?.[0];
                        const formattedDate = getUserCurrentFormat(firstChild?.displayEnddate)?.dateFormat;

                        return (
                            <td>
                                <span className="m0">{formattedDate || ''}</span>
                            </td>
                        );
                    }
                    return (
                        <td>
                            <span className="m0">{getUserCurrentFormat(dataItem?.displayEnddate)?.dateFormat}</span>
                        </td>
                    );
                },
            },
            {
                field: 'displayScheduledate',
                title: 'Sent on',
                width: 180,
                filter: 'date',
                cell: ({ dataItem }) => (
                    <td>
                        {isParentRow(dataItem) ? (
                            ''
                        ) : (
                            <span className="m0">
                                {getUserCurrentFormat(dataItem?.displayScheduledate)?.dateFormat}
                            </span>
                        )}
                    </td>
                ),
            },
            {
                field: 'senderName',
                title: 'Sender ID',
                width: 150,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    let value = '';

                    if (isParentRow(dataItem)) {
                        value =
                            dataItem?.[field] ||
                            (Array.isArray(dataItem?.expandDetails) && dataItem?.expandDetails?.length > 0
                                ? dataItem?.expandDetails?.[0]?.[field]
                                : '');
                    } else {
                        value = dataItem?.[field] || '';
                    }

                    return <TruncatedCell value={value || ''} />;
                },
            },
            {
                field: 'deliveryMethod',
                title: 'Delivery method',
                width: 180,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    let value = '';

                    if (isParentRow(dataItem)) {
                        value =
                            dataItem?.[field] ||
                            (Array.isArray(dataItem?.expandDetails) && dataItem?.expandDetails?.length > 0
                                ? dataItem?.expandDetails?.[0]?.[field]
                                : '');
                    } else {
                        value = dataItem?.[field] || '';
                    }

                    return <td>{value}</td>;
                },
            },
            {
                field: 'productCategory',
                title: 'Product category',
                width: 170,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    let value = '';

                    if (isParentRow(dataItem)) {
                        value =
                            dataItem?.[field] ||
                            (Array.isArray(dataItem?.expandDetails) && dataItem?.expandDetails?.length > 0
                                ? dataItem?.expandDetails?.[0]?.[field]
                                : '');
                    } else {
                        value = dataItem?.[field] || '';
                    }

                    return (
                        <td>
                            {value?.length > 15 ? (
                                <RSTooltip text={value} position="top" innerContent={false}>
                                    <span className="m0">{truncateTitle(value, 15)}</span>
                                </RSTooltip>
                            ) : (
                                <span className="m0">{value}</span>
                            )}
                        </td>
                    );
                },
            },
            {
                field: 'subProductCategory',
                title: 'Sub product category',
                width: 190,
                cell: ({ dataItem, field }) => {
                    let value = '';

                    if (isParentRow(dataItem)) {
                        value =
                            dataItem?.[field] ||
                            (Array.isArray(dataItem?.expandDetails) && dataItem?.expandDetails?.length > 0
                                ? dataItem?.expandDetails?.[0]?.[field]
                                : '');
                    } else {
                        value = dataItem?.[field] || '';
                    }

                    return <td>{value}</td>;
                },
            },
            {
                field: 'mdcLevel',
                title: 'MDC level',
                width: 150,
                filter: 'numeric',
                cell: ({ dataItem, field }) => {
                    return <td className="text-right">{isParentRow(dataItem) ? '' : dataItem?.[field]}</td>;
                },
            },
            {
                field: 'subSegmentLevelFriendlyName',
                title: 'Subsegment level',
                width: 170,
                filter: 'numeric',
                cell: ({ dataItem, field }) => {
                    return <td className="text-right">{isParentRow(dataItem) ? '' : dataItem?.[field]}</td>;
                },
            },
            {
                field: 'audience',
                title: 'Audience',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('audience', isParentRow, numberWithCommas),
            },
            {
                field: 'splitType',
                title: 'Split type',
                width: 150,
                filter: 'numeric',
                cell: ({ dataItem, field }) => {
                    const value = isParentRow(dataItem) ? '' : dataItem?.[field];
                    const isWinner = value && value?.toString()?.toLowerCase()?.includes('winner');
                    return (
                        <td>
                            {value !== '' && value !== undefined && (
                                <>
                                    <span className="mr5">{value}</span>
                                    {isWinner && (
                                        <i
                                            className={`${trophy_medium} icon-sm color-primary-yellow lh0 position-relative top2`}
                                        />
                                    )}
                                </>
                            )}
                        </td>
                    );
                },
            },
            {
                field: 'submittedToCarrier',
                title: 'Awaiting vendor response',
                width: 250,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    if (isParentRow(dataItem)) return <td></td>;
                    return <td className='text-right'>{dataItem?.[field]}</td>;
                },
            },
            {
                field: 'delivered',
                title: 'Delivered',
                width: 110,
                filter: 'numeric',
                cell: numericParentSumCell('delivered', isParentRow, numberWithCommas),
            },
            {
                field: 'rejected',
                title: 'Rejected',
                width: 110,
                filter: 'numeric',
                cell: numericParentSumCell('rejected', isParentRow, numberWithCommas),
            },
            {
                field: 'read',
                title: 'Seen',
                width: 100,
                filter: 'numeric',
                cell: numericParentSumCell('read', isParentRow, numberWithCommas),
            },
            {
                field: 'reachPercentage',
                title: 'Reach %',
                width: 100,
                filter: 'numeric',
                cell: ({ dataItem, field }) => {
                    return (
                        <td className="text-right">{isParentRow(dataItem) ? '' : numberWithCommas(dataItem?.[field])}</td>
                    );
                },
            },
            {
                field: 'responded',
                title: 'Responded',
                width: 130,
                filter: 'numeric',
                cell: numericParentSumCell('responded', isParentRow, numberWithCommas),
            },
            {
                field: 'engagement',
                title: 'Clicks',
                width: 100,
                filter: 'numeric',
                cell: numericParentSumCell('engagement', isParentRow, numberWithCommas),
            },
            {
                field: 'engagePercentage',
                title: 'Engagement %',
                width: 150,
                filter: 'numeric',
                cell: ({ dataItem, field }) => {
                    return (
                        <td className="text-right">{isParentRow(dataItem) ? '' : numberWithCommas(dataItem?.[field])}</td>
                    );
                },
            },
            {
                field: 'conversion',
                title: 'Conversion',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('conversion', isParentRow, numberWithCommas),
            },
            {
                field: 'convertionPercentage',
                title: 'Conversion %',
                width: 150,
                filter: 'numeric',
                cell: ({ dataItem, field }) => {
                    return (
                        <td className="text-right">{isParentRow(dataItem) ? '' : numberWithCommas(dataItem?.[field])}</td>
                    );
                },
            },
            {
                field: 'convertionValue',
                title: 'Conversion value',
                width: 180,
                filter: 'numeric',
                cell: numericParentSumCell('convertionValue', isParentRow, numberWithCommas),
            },
            {
                field: 'blocked',
                title: 'Blocked',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('blocked', isParentRow, numberWithCommas),
            },
            {
                field: 'reported',
                title: 'Reported',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('reported', isParentRow, numberWithCommas),
            },
            {
                field: 'undelivered',
                title: 'Undelivered',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('undelivered', isParentRow, numberWithCommas),
            },
            ...custColumns,
        ];
    };

    useEffect(() => {
        const tableName =
            Array.isArray(consumptionChannelList?.whatsAppChannelConsumptionList?.[0]?.custom) &&
            consumptionChannelList.whatsAppChannelConsumptionList[0].custom?.length > 0
                ? _map(consumptionChannelList.whatsAppChannelConsumptionList[0].custom, (res, key) => {
                      return { field: res, title: res, width: 250 };
                  })
                : [];
        setCustColumns(tableName);
        const data = buildGridData();
        setGridData(data);
    }, [consumptionChannelList, buildGridData]);
    return (
        <Fragment>
            <style>{`.no-expand-row .k-hierarchy-cell > a, .no-expand-row .k-hierarchy-cell > button { display: none !important; }`}</style>
            {consumptionChannelList?.length > 0 || consumptionChannelList ? (
                <>
                    {/* <Row className="my10 align-items-center d-none">
                        <Col md={6} className="d-flex align-items-center">
                            <h3 className="d-flex align-items-center">
                                {consumptionChannel?.lable}{' '}
                                <small className="color-primary-grey ml10 position-relative top1">
                                    (As on: {dateFormat(currentDate)})
                                </small>
                            </h3>
                        </Col>
                        <Col md={6}>
                            <ul className="rs-list-group-horizontal float-end">
                                <li>
                                    <RSDateRangePicker
                                        onDatePickerClosed={handleDateFilter}
                                        isConsumption={true}
                                        consumptionStartDate={updateConsumptionDate.startDate}
                                        consumptionEndDate={updateConsumptionDate.endDate}
                                    />
                                </li>
                                <li className="ml15">
                                    {' '}
                                    <RSSearchField
                                        searchedText={handleSearchFilter}
                                        placeholder={'By communication name'}
                                    />{' '}
                                </li>{' '}
                                <li className="ml15">
                                    <i
                                        onClick={() => {
                                            downloadConsumptionData();
                                            // downloadCSV(
                                            //     consumptionChannelList?.whatsAppChannelConsumptionList,
                                            //     consumptionChannel?.lable + '_' + new Date().toDateString(),
                                            // );
                                        }}
                                        className={`${csv_download_large} icon-lg color-primary-blue`}
                                    ></i>
                                </li>
                            </ul>
                        </Col>
                    </Row> */}

                    <ConsumptionChannelHeader
                        setConsumptionChannelList={setConsumptionChannelList}
                        setCustColumns={setCustColumns}
                        paginationParams={paginationParams}
                        setPaginationParams={setPaginationParams}
                    />
                    {consumptionChannelList?.whatsAppChannelConsumptionList !== null ? (
                        <div className="mb70">
                            <KendoGrid
                                data={gridData}
                                isLoading={isLoading}
                                isConsumption
                                isFailure={!consumptionChannelList?.length}
                                settings={listViewSettings}
                                pagerChange={paginationParams?.initialPagination}
                                scrollable={'scrollable'}
                                pageable={true}
                                onDataStateChange={(data) => handlePagerChange(data)}
                                autoResizeSize
                                column={getGridColumn()}
                            />
                        </div>
                    ) : (
                        <HorizontalSkeleton isError={gridData?.length === 0 || !gridData} />
                    )}
                </>
            ) : (
                <div className=" ">
                    <HorizontalSkeleton isError={gridData?.length === 0 || !gridData} />
                </div>
            )}
        </Fragment>
    );
};

export default ConsumptionWhatsApp;
