import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat, getYYMM, getYYMMDD } from 'Utils/modules/dateTime';
import { downloadCSVcommasFile } from 'Utils/modules/download';
import { numberWithCommas } from 'Utils/modules/formatters';
import { csv_download_large, trophy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import { map as _map } from 'Utils/modules/lodashReplacements';
import KendoGrid from 'Components/RSKendoGrid';


import RSTooltip from 'Components/RSTooltip';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import { globalStateSelector } from 'Utils/Selectors/app';
import {getFirstDayOfMonth, getCurrentDateOfMonth} from 'Utils/modules/dateTime.jsx'
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getConsumptionChannelDetails,
    getConsumptionChannelDetailsDownload,
} from 'Reducers/preferences/consumptions/request';
import { useDispatch, useSelector } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';
import { useNavigate } from 'react-router-dom';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { numericParentSumCell, commonConsumptionColumns, sanitizeText } from '../../../../constant';
const ConsumptionEmail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useQueryParams('/preferences/consumptions/consumption-channel');
    const currentDate = new Date().toDateString();
    const [consumptionChannelList, setConsumptionChannelList] = useState([]);
    const { u_consumptionMM, u_consumptionYY, consumptionMM, consumptionYY, consumptionChannel } = useSelector(
        (state) => globalStateSelector(state),
    );
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const [custColumns, setCustColumns] = useState(['dd', 'dd1', 'dd2']); //consumptionChannelList?.emailChannelConsumptionList?.

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

    const expandChange = useCallback(({ dataItem }) => {
        const itemId = dataItem?.campaignID || dataItem?.campaignGUID;

        setGridData((prevGridData) =>
            prevGridData.map((item) => {
                if ((item?.campaignID || item?.campaignGUID) === itemId) {
                    return {
                        ...item,
                        expanded: !item.expanded, // Toggle the boolean
                    };
                }
                return item;
            }),
        );
    }, []);

    const processCustomFields = useCallback((item) => {
        if (!item.custom || !Array.isArray(item.custom)) return {};

        return item.custom.reduce((acc, key, index) => {
            acc[key] =
                key === 'Communication Docket'
                    ? item.customValues?.[index]
                        ? 'Yes'
                        : 'No'
                    : item.customValues?.[index] || '';
            return acc;
        }, {});
    }, []);

    const getGridColumn = useCallback(() => {
        return [
            {
                field: 'campaigngroupingID',
                title: 'Group ID',
                width: 90,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    return <td>{isParentRow(dataItem) ? '' : dataItem?.[field]}</td>;
                },
            },
            {
                field: 'campaignName',
                title: 'Communication name',
                width: 250,
                filter: 'text',
                cell: ({ dataItem, field }) => {
                    const isBold = isParentRow(dataItem) && dataItem?.expanded;
                    const rawCommunicationName = isParentRow(dataItem)
                        ? dataItem?.[field]
                        : dataItem?.channelFriendlyName || dataItem?.[field];
                    const communicationName = sanitizeText(rawCommunicationName);
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
                                        channelId: 1,
                                        currIndex:
                                            dataItem?.deliveryMethod === 'Multi dimension'
                                                ? dataItem?.mdcLevel - 1
                                                : 0,
                                    }),
                                );
                                const state = {
                                    channelName: consumptionChannel?.lable,
                                    campaignId: dataItem?.campaignID,
                                    channelId: 1,
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
                            <TruncateCell value={communicationName ?? ''} noTable={true} wrapperClassName="m0" />
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
                    return <td className="text-right">{isParentRow(dataItem) ? '' : dataItem?.[field]}</td>;
                },
            },
            {
                field: 'subSegmentLevelFriendlyName',
                title: 'Subsegment level',
                width: 180,
                filter: 'numeric',
                cell: ({ dataItem, field }) => {
                    return <td className="text-right">{isParentRow(dataItem) ? '' : dataItem?.[field]}</td>;
                },
            },
            {
                field: 'splitType',
                title: 'Split type',
                width: 150,
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
                field: 'subjectLine',
                title: 'Subject line',
                width: 350,
                filter: 'text',
                cell: ({ dataItem }) => {
                    const cleanedSubjectLine = sanitizeText(dataItem?.subjectLine);
                    return (
                        <td>
                            {isParentRow(dataItem) ? (
                                ''
                            ) : (
                                <TruncateCell value={cleanedSubjectLine ?? ''} noTable={true} wrapperClassName="m0" />
                            )}
                        </td>
                    );
                },
            },
            {
                field: 'sent',
                title: 'Sent',
                width: 100,
                filter: 'numeric',
                cell: numericParentSumCell('sent', isParentRow, numberWithCommas),
            },
            {
                field: 'delivered',
                title: 'Delivered',
                width: 110,
                filter: 'numeric',
                cell: numericParentSumCell('delivered', isParentRow, numberWithCommas),
            },
            {
                field: 'opened',
                title: 'Opened',
                width: 100,
                filter: 'numeric',
                cell: numericParentSumCell('opened', isParentRow, numberWithCommas),
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
                field: 'totalOpens',
                title: 'Total opens',
                width: 130,
                filter: 'numeric',
                cell: numericParentSumCell('totalOpens', isParentRow, numberWithCommas),
            },
            {
                field: 'clicked',
                title: 'Clicked',
                width: 100,
                filter: 'numeric',
                cell: numericParentSumCell('clicked', isParentRow, numberWithCommas),
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
                field: 'totalClicks',
                title: 'Total clicks',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('totalClicks', isParentRow, numberWithCommas),
            },
            {
                field: 'conversion',
                title: 'Conversion',
                width: 130,
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
                field: 'hardBounce',
                title: 'Hard bounced',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('hardBounce', isParentRow, numberWithCommas),
            },
            {
                field: 'softBounce',
                title: 'Soft bounced',
                width: 150,
                filter: 'numeric',
                cell: numericParentSumCell('softBounce', isParentRow, numberWithCommas),
            },
            {
                field: 'spam',
                title: 'Spam',
                width: 100,
                filter: 'numeric',
                cell: numericParentSumCell('spam', isParentRow, numberWithCommas),
            },
            {
                field: 'unsubscribed',
                title: 'Unsubscribed',
                width: 135,
                filter: 'numeric',
                cell: numericParentSumCell('unsubscribed', isParentRow, numberWithCommas),
            },
            ...custColumns,
            {
                field: 'attachments',
                title: 'Attachment',
                width: 130,
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
        ];
    }, [custColumns, consumptionChannel, dispatch, navigate]);


    const getChildGridColumns = useCallback(() => {
        const baseColumns = getGridColumn();

        return baseColumns.map((col) => {
            if (col.field === 'campaignName') {
                return {
                    ...col,
                    cell: ({ dataItem, field }) => {
                        const baseSplitType = dataItem?.splitType?.split(' - ')?.[0]?.trim();
                        const isMdc = dataItem?.deliveryMethod === 'Multi dimension';
                        const rawDisplayValue = isMdc
                            ? dataItem?.channelFriendlyName || dataItem?.[field] || ''
                            : baseSplitType || dataItem?.splitType || dataItem?.[field] || '';
                        const displayValue = sanitizeText(rawDisplayValue);

                        return (
                            <td
                                className="cursor-pointer link-underline-hover color-primary-black"
                                onClick={() => {
                                    // Winner row pre-selects "Actual communication"; others pre-select their split letter
                                    const splitName = dataItem?.iswinnerSplit
                                        ? 'Actual communication'
                                        : baseSplitType ? `Split ${baseSplitType}` : '';
                                    dispatch(
                                        updateAnalyticsDetail({
                                            channelName: consumptionChannel?.lable,
                                            campaignId: dataItem?.campaignID,
                                            from: 'analytics',
                                            blastId: dataItem?.blastShortCode,
                                            channelId: 1,
                                            currIndex:
                                                dataItem?.deliveryMethod === 'Multi dimension'
                                                    ? dataItem?.mdcLevel - 1
                                                    : 0,
                                        }),
                                    );
                                    const state = {
                                        channelName: consumptionChannel?.lable,
                                        campaignId: dataItem?.campaignID,
                                        channelId: 1,
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
    }, [custColumns, consumptionChannel, dispatch, navigate]);
    


    // useEffect(() => {
    //         setUpdateConsumptionDate({
    //             startDate: getFirstDayOfMonth(consumptionYY, consumptionMM + 1),
    //             endDate: getCurrentDateOfMonth(consumptionYY, consumptionMM + 1),
    //         });
    // }, []);
    //console.log('updateConsumptionDate', updateConsumptionDate);

    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });
    const [gridData, setGridData] = useState([]);
    const [customFilterValue, setCustomFilterValue] = useState(null);
    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: u_consumptionMM + 1,
        year: u_consumptionYY,
        channelId: 1,
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
        channelId: 1,

        startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
    });

    const listViewSettings = useMemo(
        () => ({
            expandField: 'expanded',
            expandColumn: true,
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
                const details = props.dataItem?.expandDetails || [];

                if (!details || details.length === 0) {
                    return <div style={{ padding: '10px' }}>No additional details available.</div>;
                }

                const processedDetails = details.map((item) => ({
                    ...item,
                    ...processCustomFields(item),
                }));

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
            consumptionChannelList?.emailChannelConsumptionList?.length,
            custColumns,
            processCustomFields,
            getChildGridColumns,
            expandChange,
            gridData?.length,
        ],
    );

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState;
        setPaginationParams({ skip, take });
    };

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

    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        if (status) {
            setConsumptionChannelList(data);
            const tableName =
                Array.isArray(data?.emailChannelConsumptionList?.[0]?.custom) &&
                data.emailChannelConsumptionList[0].custom?.length > 0
                    ? _map(data.emailChannelConsumptionList[0].custom, (res, key) => {
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
        }));
    }, [departmentId, clientId]);

    const buildGridData = useCallback(() => {
        if (!consumptionChannelList?.emailChannelConsumptionList) return [];

        const allItems = consumptionChannelList.emailChannelConsumptionList;

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
                const allPossibleFields = Object.keys(item);
                allPossibleFields.forEach((key) => {
                    if (!parentManagedKeys.includes(key)) {
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
    }, [consumptionChannelList?.emailChannelConsumptionList, processCustomFields]);
    useEffect(() => {
        const tableName =
            Array.isArray(consumptionChannelList?.emailChannelConsumptionList?.[0]?.custom) &&
            consumptionChannelList.emailChannelConsumptionList[0].custom?.length > 0
                ? _map(consumptionChannelList.emailChannelConsumptionList[0].custom, (res, key) => {
                      return { field: res, title: res, width: 250 };
                  })
                : [];
        setCustColumns(tableName);

        const gridData = buildGridData();
        setGridData(gridData);
    }, [consumptionChannelList, buildGridData]);

    // useEffect(() => {
    //     handleConsumptionChannelDetails(params);
    //     // }, [params, custColumns]);
    // }, [params]);

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
        //downloadCSVcommasFile(res, 'Email_' + new Date().toLocaleDateString() + '_' + new Date().toLocaleTimeString());
        downloadCSVcommasFile(
            res,
            'Email_' + getYYMM(paramsDownload.startDate) + '_' + new Date().toLocaleTimeString(),
        );
    };



    return (
        <>
            <style>{`.no-expand-row .k-hierarchy-cell > a, .no-expand-row .k-hierarchy-cell > button { display: none !important; }`}</style>
                <>
                    {/* <Row className="my10 align-items-center consumptionEmail d-none">
                        <Col md={6} className="d-flex align-items-center">
                            <h3 className="d-flex align-items-center">
                                {consumptionChannel?.lable}
                                <small className="color-primary-grey ml10 position-relative top1">
                                    (As on: {dateFormat(currentDate)})
                                    (As on: {getUserDateTimeFormat(currentDate + ' UTC', 'formatDateTime')})
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
                                </li>
                                <li className="ml15">
                                    <RSTooltip text={'Download CSV'}>
                                        <i
                                            onClick={() => {
                                                downloadConsumptionData();
                                                downloadCSV(
                                                    consumptionChannelList?.emailChannelConsumptionList,
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
                        customFilterValue={customFilterValue}
                    />

                        <div className="mb70">
                            <KendoGrid
                                // data={CONSUMPTION_EMAIL_DATA?.data?.activityList}
                                // isFailure={!CONSUMPTION_EMAIL_DATA?.data?.activityList?.length}
                                // settings={{ total: CONSUMPTION_EMAIL_DATA?.data?.activityList?.count }}
                                data={gridData}
                                isLoading={isLoading}
                                isConsumption
                                isFailure={!consumptionChannelList?.length}
                                settings={listViewSettings}
                                scrollable={'scrollable'}
                                // isDataStateRequired
                                pageable={true}
                                pagerChange={paginationParams?.initialPagination}
                                onDataStateChange={(data) => handlePagerChange(data)}
                                className="rs-kendo-scrollable-grid mb-0 hide-default-expand-column"
                                column={getGridColumn()}
                                autoResizeSize
                            />
                        </div>
                </>
        </>
    );
};

export default ConsumptionEmail;
