import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat, getYYMM, getYYMMDD } from 'Utils/modules/dateTime';
import { downloadCSVcommasFile } from 'Utils/modules/download';
import { numberWithCommas } from 'Utils/modules/formatters';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { csv_download_large, trophy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import { map as _map } from 'Utils/modules/lodashReplacements';
import KendoGrid from 'Components/RSKendoGrid';

import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getConsumptionChannelDetails,
    getConsumptionChannelDetailsDownload,
} from 'Reducers/preferences/consumptions/request';
import { useDispatch, useSelector } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { numericParentSumCell, commonConsumptionColumns } from '../../../../constant';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import {getFirstDayOfMonth, getCurrentDateOfMonth} from 'Utils/modules/dateTime.jsx'

const ConsumptionSms = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useQueryParams('/preferences/consumptions/consumption-channel');

    const [consumptionChannelList, setConsumptionChannelList] = useState([]);
    const { u_consumptionYY, u_consumptionMM, consumptionMM, consumptionYY, consumptionChannel } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const currentDate = new Date().toDateString();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [custColumns, setCustColumns] = useState(['dd', 'dd1', 'dd2']);
    const [gridData, setGridData] = useState([]);

    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });

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

    const getGridColumn = useCallback(() => {
        return [
            {
                field: 'campaigngroupingID',
                title: 'Group ID',
                width: 120,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    return <td>{isParentRow(dataItem) ? '' : dataItem?.[field]}</td>;
                },
            },
            {
                field: 'campaignName',
                title: 'Communication name',
                width: 220,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    const isBold = isParentRow(dataItem) && dataItem?.expanded;
                    return (
                        <td
                            className={`cursor-pointer link-underline-hover color-primary-black ${
                                isBold ? 'font-semi-bold' : ''
                            }`}
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
                                        channelId: 2,
                                        currIndex:
                                            dataItem?.deliveryMethod === 'Multi dimension'
                                                ? dataItem?.mdcLevel - 1
                                                : 0,
                                    }),
                                );
                                const state = {
                                    channelName: consumptionChannel?.lable,
                                    campaignId: dataItem?.campaignID,
                                    channelId: 2,
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
                            <TruncateCell value={dataItem?.[field] ?? ''} noTable={true} wrapperClassName="m0" />
                        </td>
                    );
                },
            },
            ...commonConsumptionColumns(),
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
                title: 'Schedule date',
                width: 180,
                filter: 'date',
                cell: ({ dataItem }) => {
                    if (isParentRow(dataItem)) return <td></td>;
                    return (
                        <td>
                            <span className="m0">
                                {getUserCurrentFormat(dataItem?.displayScheduledate)?.dateFormat}
                            </span>
                        </td>
                    );
                },
            },
            {
                field: 'campaignType',
                title: 'Communication type',
                width: 200,
                filter: 'text',
                cell: ({ dataItem }) => {
                    let value = '';

                    // ✅ If Parent Row
                    if (isParentRow(dataItem)) {
                        if (dataItem?.campaignType) {
                            value = dataItem?.campaignType;
                        } else if (Array.isArray(dataItem?.expandDetails) && dataItem?.expandDetails?.length > 0) {
                            // If parent doesn't directly have campaignType, take first child value
                            value = dataItem?.expandDetails?.[0]?.campaignType || '';
                        }
                    }
                    // ✅ Child Row
                    else {
                        value = dataItem?.campaignType || '';
                    }

                    return (
                        <td>
                            <TruncateCell value={value ?? ''} noTable={true} wrapperClassName="m0" />
                        </td>
                    );
                },
            },
            {
                field: 'deliveryMethod',
                title: 'Delivery method',
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

                    return <td>{value}</td>;
                },
            },
            {
                field: 'smsGateWay',
                title: 'SMS Gateway',
                width: 150,
                filter: 'text',
                // cell: ({ dataItem, field }) => {
                //     if (isParentRow(dataItem)) return <td></td>;
                //     return <td>{dataItem?.[field]}</td>;
                // },
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
                field: 'senderName',
                title: 'Sender ID',
                width: 150,
                filter: 'text',
                // cell: ({ dataItem, field }) => {
                //     if (isParentRow(dataItem)) return <td></td>;
                //     return <TruncatedCell value={dataItem?.[field] || ''} />;
                // },
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

                    return <TruncateCell value={value || ''} />;
                },
            },
            {
                field: 'productCategory',
                title: 'Product category',
                width: 200,
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
                            <TruncateCell value={value ?? ''} noTable={true} wrapperClassName="m0" />
                        </td>
                    );
                },
            },
            {
                field: 'subProductCategory',
                title: 'Sub product category',
                width: 200,
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
                field: 'mdcLevel',
                title: 'MDC level',
                width: 120,
                filter: 'numeric',
                cell: ({ dataItem, field }) => {
                    if (isParentRow(dataItem)) return <td></td>;
                    return <td className="text-right">{dataItem?.[field]}</td>;
                },
            },
            {
                field: 'splitType',
                title: 'Split type',
                width: 120,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    const value = isParentRow(dataItem) ? '' : dataItem?.[field];
                    const isWinner = value && value?.toLowerCase()?.includes('winner');
                    return (
                        <td>
                            {value !== '' && (
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
                field: 'smsContent',
                title: 'char. per message Min - Max',
                width: 250,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    if (isParentRow(dataItem)) return <td></td>;
                    return <td>{dataItem?.[field]}</td>;
                },
            },
             {
                field: 'smsContentSize',
                title: 'Message count - max *',
                width: 220,
                filter: 'numeric',
                cell: numericParentSumCell('smsContentSize', isParentRow, numberWithCommas),
            },
             {
                field: 'actualsent',
                title: 'Volume sent',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('actualsent', isParentRow, numberWithCommas),
            },
            {
                field: 'actualDelivered',
                title: 'Volume Delivered',
                width: 180,
                filter: 'numeric',
                cell: numericParentSumCell('actualDelivered', isParentRow, numberWithCommas),
            },
             {
                field: 'sent',
                title: 'Audience count',
                width: 160,
                filter: 'numeric',
                cell: numericParentSumCell('sent', isParentRow, numberWithCommas),
            },
            {
                field: 'submittedToCarrier',
                title: 'Awaiting vendor response',
                width: 250,
                filter: 'text',
                cell: numericParentSumCell('submittedToCarrier', isParentRow, numberWithCommas),
            },
            {
                field: 'delivered',
                title: 'Delivered',
                width: 120,
                filter: 'numeric',
                cell: numericParentSumCell('delivered', isParentRow, numberWithCommas),
            },
            {
                field: 'totalOpens',
                title: 'Total opens',
                width: 130,
                filter: 'numeric',
                cell: numericParentSumCell('totalOpens', isParentRow, numberWithCommas),
            },
            {
                field: 'reachPercentage',
                title: 'Reach %',
                width: 110,
                filter: 'numeric',
                cell: numericParentSumCell('reachPercentage', isParentRow, numberWithCommas),
            },
            {
                field: 'undelivered',
                title: 'Undelivered',
                width: 130,
                filter: 'numeric',
                cell: numericParentSumCell('undelivered', isParentRow, numberWithCommas),
            },
            {
                field: 'rejected',
                title: 'Rejected',
                width: 110,
                filter: 'numeric',
                cell: numericParentSumCell('rejected', isParentRow, numberWithCommas),
            },
            {
                field: 'totalClicks',
                title: 'Total clicks',
                width: 125,
                filter: 'numeric',
                cell: numericParentSumCell('totalClicks', isParentRow, numberWithCommas),
            },
            {
                field: 'engagePercentage',
                title: 'Engagement %',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('engagePercentage', isParentRow, numberWithCommas),
            },
            {
                field: 'uniqueClicks',
                title: 'Unique clicks',
                width: 140,
                filter: 'numeric',
                cell: numericParentSumCell('uniqueClicks', isParentRow, numberWithCommas),
            },
            {
                field: 'converted',
                title: 'Conversion',
                width: 130,
                filter: 'numeric',
                cell: numericParentSumCell('converted', isParentRow, numberWithCommas),
            },
            {
                field: 'convertionPercentage',
                title: 'Conversion %',
                width: 140,
                filter: 'numeric',
                cell: numericParentSumCell('convertionPercentage', isParentRow, numberWithCommas),
            },
            {
                field: 'conversionValue',
                title: 'Conversion value',
                width: 170,
                filter: 'numeric',
                cell: numericParentSumCell('conversionValue', isParentRow, numberWithCommas),
            },
            ...custColumns,
            {
                field: 'attachments',
                title: 'Attachment',
                width: 130,
                filter: 'text',
            },
        ];
    }, [custColumns, consumptionChannel, dispatch, navigate]);

    // Helper function to get child grid columns
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
                            <td
                                className="cursor-pointer link-underline-hover color-primary-black"
                                onClick={() => {
                                    const splitName = dataItem?.iswinnerSplit
                                        ? 'Actual communication'
                                        : baseSplitType ? `Split ${baseSplitType}` : '';
                                    dispatch(
                                        updateAnalyticsDetail({
                                            channelName: consumptionChannel?.lable,
                                            campaignId: dataItem?.campaignID,
                                            from: 'analytics',
                                            blastId: dataItem?.blastShortCode,
                                            channelId: 2,
                                            currIndex:
                                                dataItem?.deliveryMethod === 'Multi dimension'
                                                    ? dataItem?.mdcLevel - 1
                                                    : 0,
                                        }),
                                    );
                                    const state = {
                                        channelName: consumptionChannel?.lable,
                                        campaignId: dataItem?.campaignID,
                                        channelId: 2,
                                        iswinnerSplit: dataItem?.iswinnerSplit,
                                        iswinnerSplitType: dataItem?.iswinnerSplitType,
                                        isSplitAB: true,
                                        splitName,
                                        iswinnerBlastId: dataItem?.iswinnerSplit
                                            ? dataItem?.blastShortCode
                                            : '',
                                        groupWinnerSplitType: dataItem?.groupWinnerSplitType || '',
                                    };
                                    const encryptState = encodeUrl(state);
                                    navigate(`/analytics/detail-analytics?q=${encryptState}`, {
                                        state,
                                    });
                                }}
                            >
                                <TruncateCell value={displayValue ?? ''} noTable={true} wrapperClassName="m0" />
                            </td>
                        );
                    },
                };
            }
            return col;
        });
    }, [getGridColumn, consumptionChannel, dispatch, navigate]);

    // Helper function to build grid data with parent-child grouping
    const buildGridData = useCallback(() => {
        if (!consumptionChannelList?.mobileChannelConsumptionList) return [];

        const allItems = consumptionChannelList?.mobileChannelConsumptionList;

        // Count occurrences of each campaignID
        const campaignIdCounts = allItems.reduce((acc, item) => {
            acc[item.campaignID] = (acc[item.campaignID] || 0) + 1;
            return acc;
        }, {});

        const processedCampaignIds = new Set();
        const gridRows = [];

        allItems.forEach((item) => {
            // Skip if we've already processed this campaignID
            if (processedCampaignIds.has(item.campaignID)) return;

            const hasDuplicates = campaignIdCounts[item.campaignID] > 1;

            if (hasDuplicates) {
                const childRows = allItems.filter((i) => i.campaignID === item.campaignID);
                const winnerChild = childRows.find((i) => i.iswinnerSplit);
                const groupWinnerSplitType = winnerChild?.iswinnerSplitType || '';
                const enhancedChildRows = childRows.map((child) => ({
                    ...child,
                    groupWinnerSplitType,
                }));

                const parentRow = {
                    campaignID: item.campaignID,
                    campaignName: item.campaignName,
                    expanded: false,
                    expandDetails: enhancedChildRows,
                    iswinnerB2: winnerChild?.blastShortCode || '',
                    iswinnerSplit: !!winnerChild,
                    iswinnerSplitType: groupWinnerSplitType,
                    isSplitAB: true,
                };

                const parentManagedKeys = ['campaignID', 'campaignName', 'expanded', 'expandDetails', 'iswinnerB2', 'iswinnerSplit', 'iswinnerSplitType', 'isSplitAB'];
                Object.keys(item).forEach((key) => {
                    if (!parentManagedKeys.includes(key)) {
                        parentRow[key] = '';
                    }
                });

                gridRows.push(parentRow);
                processedCampaignIds.add(item.campaignID);
            } else {
                // No duplicates, add as normal row with custom fields
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
    }, [consumptionChannelList?.mobileChannelConsumptionList, processCustomFields]);

    const expandChange = useCallback(({ dataItem }) => {
        const itemId = dataItem?.campaignID;

        setGridData((prevGridData) =>
            prevGridData.map((item) => {
                if (item?.campaignID === itemId) {
                    return {
                        ...item,
                        expanded: !item.expanded, // Toggle the boolean
                    };
                }
                return item;
            }),
        );
    }, []);

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
        [gridData?.length, processCustomFields, getChildGridColumns, expandChange],
    );

    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 2,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
        startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
    });
    const [paramsDownload, setParamsDownload] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 2,
        startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
    });
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

    useEffect(() => {
        setParams((pre) => ({
            ...pre,
            startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, consumptionMM + 1)),
            endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, consumptionMM + 1)),
        }));
    }, [consumptionMM, consumptionYY]);

    // const handlePagerChange = (data) => {
    //     const { skip, take } = data?.dataState ?? {};
    //     setParams((prev) => ({
    //         ...prev,
    //         pageNo: skip === 0 ? 1 : skip / take + 1,
    //         pageSize: take,
    //     }));
    // };

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState;
        setPaginationParams({ skip, take });
    };
    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        //console.log('status getConsumptionChannelDetails: ', data);
        if (status) {
            setConsumptionChannelList(data);
            const tableName =
                Array.isArray(data?.mobileChannelConsumptionList?.[0]?.custom) &&
                data.mobileChannelConsumptionList[0].custom?.length > 0
                    ? _map(data.mobileChannelConsumptionList[0].custom, (res, key) => {
                          return { field: res, title: res, width: 150 };
                      })
                    : [];
            setCustColumns(tableName);
        } else {
            setConsumptionChannelList([]);
        }
    };
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
        //downloadCSVcommasFile(res, 'SMS_' + new Date().toLocaleDateString() + '_' + new Date().toLocaleTimeString());
        downloadCSVcommasFile(res, 'SMS_' + getYYMM(paramsDownload.startDate) + '_' + new Date().toLocaleTimeString());
    };

    useEffect(() => {
        const tableName =
            Array.isArray(consumptionChannelList?.mobileChannelConsumptionList?.[0]?.custom) &&
            consumptionChannelList.mobileChannelConsumptionList[0].custom?.length > 0
                ? _map(consumptionChannelList.mobileChannelConsumptionList[0].custom, (res, key) => {
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
            {/* {consumptionChannelList?.length > 0 || consumptionChannelList ? ( */}
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
                                    <RSTooltip position="top" text={'Download CSV'}>
                                        <i
                                            onClick={() => {
                                                downloadConsumptionData();
                                                downloadCSV(
                                                    consumptionChannelList?.mobileChannelConsumptionList,
                                                    consumptionChannel?.lable + '_' + new Date().toDateString(),
                                                );
                                            }}
                                            className={`${csv_download_large} icon-lg color-primary-blue`}
                                        ></i>
                                    </RSTooltip>
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

                    {/* {consumptionChannelList?.mobileChannelConsumptionList !== null ? ( */}
                        <div className="mb70">
                            <KendoGrid
                                data={gridData}
                                isConsumption
                                isLoading={isLoading}
                                isFailure={!consumptionChannelList?.length}
                                settings={listViewSettings}
                                scrollable={'scrollable'}
                                pagerChange={paginationParams?.initialPagination}
                                pageable={true}
                                onDataStateChange={(data) => handlePagerChange(data)}
                                className="rs-kendo-scrollable-grid mb-0 hide-default-expand-column"
                                autoResizeSize
                                column={getGridColumn()}
                            />
                        </div>
                    {/* ) : (
                        <HorizontalSkeleton
                            isError={
                                consumptionChannelList?.mobileChannelConsumptionList === null ||
                                consumptionChannelList?.mobileChannelConsumptionList?.length === 0
                            }
                        />
                    )} */}
                </>
            {/* ) : (
                <HorizontalSkeleton
                    isError={consumptionChannelList?.length === 0 || !consumptionChannelList}
                />
            )} */}
            <p className="fs12 pt20">
                <span className='font-bold'>Message Units:</span> Up to 160 English characters = 1 message unit (limits may vary for regional languages)<br />
                <span className='font-bold'>Note:</span> Usage counts rely on telecom partner reporting and may take 24-48 hours to fully reconcile.
            </p>
        </Fragment>
    );
};

export default ConsumptionSms;
