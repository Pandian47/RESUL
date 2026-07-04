import { getYYMM } from 'Utils/modules/dateTime';
import { downloadCSVcommasFile } from 'Utils/modules/download';
import { numberWithCommas } from 'Utils/modules/formatters';
import { maskingString_New } from 'Utils/modules/masking';
import { circle_info_mini, csv_download_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getSessionId } from 'Reducers/globalState/selector';
import { getConsumptionCsvReport, getConsumptionCsvReportDownload } from 'Reducers/preferences/consumptions/request';
import KendoGridNew from 'Components/RSKendoGridNew';
import RSAdvanceSearch from 'Components/AdvanceSearch';
import RSTooltip from 'Components/RSTooltip';

import RSBootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import moment from 'moment';
import useQueryParams from 'Hooks/useQueryParams';
const CsvReport = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const queryData = useQueryParams('/preferences');
    const isFromAA360 = queryData?.fromAA360 === true;
    const [databaseConsumptionData, setDatabaseConsumptionData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState('All channels');
    const [gridColumns, setGridColumns] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [fullDataCache, setFullDataCache] = useState([]); // Cache for client-side pagination
    const [hasGroupingData, setHasGroupingData] = useState(false); // Track if data has grouping (client-side pagination)
    const [useServerPagination, setUseServerPagination] = useState(false); // Track if we should use server-side pagination
    const [hasChannels, setHasChannels] = useState(false); // Track if response has channels (sms, email, whatsApp)
    const [searchText, setSearchText] = useState('');
    const [searchBy, setSearchBy] = useState('');
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const [isAdvanceExpanded, setIsAdvanceExpanded] = useState(false);
    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });

    const channelDropdownData = useMemo(() => {
        return ['All channels', 'Email', 'SMS', 'WhatsApp'];
    }, []);

    // Helper function to format date as DD/MM/YYYY
    const formatDateWithSlash = (date) => {
        if (!date) return '';
        return moment(date).format('DD/MM/YYYY');
    };

    // Dynamically generate static columns from data
    const getCommunicationSentStaticColumns = useMemo(() => {
        if (!fullDataCache || fullDataCache.length === 0) return [];

        const firstItem = fullDataCache[0];
        const staticFields = Object.keys(firstItem).filter(
            key => key !== 'dateCategory' && key !== 'date_Category' && key !== 'sms' && key !== 'email' && key !== 'whatsApp'
        );

        return staticFields.map((field) => {
            // Format field name to readable title
            const title = field
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .split(' ')
                .map((word, index) => {
                    if (index === 0) {
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                    }
                    return word.toLowerCase();
                })
                .join(' ');

            // Determine appropriate width based on field
            const getWidth = (fieldName) => {
                if (fieldName.toLowerCase().includes('name')) return '250px';
                if (fieldName.toLowerCase().includes('product')) return '200px';
                if (
                    fieldName.toLowerCase().includes('type') ||
                    fieldName.toLowerCase().includes('category') ||
                    fieldName.toLowerCase().includes('frequency')
                )
                    return '150px';
                return '120px';
            };

            const width = getWidth(field);

            return {
                field,
                title,
                width,
            };
        });
    }, [fullDataCache]);

    const safeString = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
        try {
            return JSON.stringify(value);
        } catch (e) {
            return String(value);
        }
    };

    const filterDataByField = useCallback((data, field, text) => {
        const term = (text || '').trim().toLowerCase();
        if (!term) return Array.isArray(data) ? data : [];

        const rows = Array.isArray(data) ? data : [];
        return rows.filter((item) => {
            if (!field) {
                return Object.values(item || {}).some((v) => safeString(v).toLowerCase().includes(term));
            }
            return safeString(item?.[field]).toLowerCase().includes(term);
        });
    }, []);

    const titleToField = useMemo(() => {
        const cols = hasGroupingData ? getCommunicationSentStaticColumns : gridColumns;
        return (cols || []).reduce((acc, c) => {
            if (c?.title) acc[c.title] = c.field;
            return acc;
        }, {});
    }, [hasGroupingData, getCommunicationSentStaticColumns, gridColumns]);

    const advanceSearchOptions = useMemo(() => {
        return Object.keys(titleToField);
    }, [titleToField]);

    const formatFieldToTitle = (fieldName) => {
        const result = fieldName.replace(/([A-Z]+)([A-Z][a-z])|([a-z])([A-Z])/g, '$1$3 $2$4');

        const words = result.split(' ');

        const formattedWords = words.map((word, index) => {
            const isAbbreviation = /^[A-Z]{2,}$/.test(word);

            if (isAbbreviation) {
                return word.toUpperCase();
            }

            if (index === 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }

            return word.toLowerCase();
        });

        return formattedWords.join(' ');
    };

    // Dynamic column generation for CSV report based on data
    const generateDynamicColumns = (data) => {
        if (!data || data.length === 0) return [];

        const firstItem = data[0];
        const keys = Object.keys(firstItem);

        // Exclude channel arrays (email, sms, whatsApp) and old grouping fields
        // These will be handled by date columns in KendoGridNew
        const excludedFields = ['sms', 'email', 'whatsApp', 'dateCategory', 'date_Category'];
        const filteredKeys = keys.filter(key => !excludedFields.includes(key));

        return filteredKeys.map((key) => {
            const isNumeric = typeof firstItem[key] === 'number';
            const title = formatFieldToTitle(key);

            const fieldNameLower = key?.toLowerCase();
            const titleLower = title?.toLowerCase();
            const needsMasking = fieldNameLower.includes('mobile') || fieldNameLower.includes('email') || titleLower.includes('mobile') || titleLower.includes('email') || fieldNameLower.includes('brandid') || titleLower.includes('brandid');
            let cellRenderer = undefined;
            if (isNumeric) {
                cellRenderer = ({ dataItem, field }) => <td className="text-right">{numberWithCommas(dataItem?.[field] || 0)}</td>;
            } else if (needsMasking) {
                cellRenderer = ({ dataItem, field }) => {
                    const value = dataItem?.[field];
                    const maskedValue = maskingString_New(value || '');
                    return <td>{maskedValue}</td>;
                };
            }

            return {
                field: key,
                title: title,
                width: 200,
                filter: isNumeric ? 'numeric' : 'text',
                cell: cellRenderer,
            };
        });
    };

    // No client-side filtering needed - API handles search

    // Helper function to detect if response has date fields (for grouping headers)
    const detectDateFields = (data) => {
        if (!data || data.length === 0) return false;

        const firstItem = data[0];

        // Check for old grouping structure (dateCategory, date_Category)
        if ('dateCategory' in firstItem || 'date_Category' in firstItem) {
            return true;
        }

        // Check if channel arrays exist and contain date entries (new structure)
        const channelArrays = ['sms', 'email', 'whatsApp'];
        return channelArrays.some((channel) => {
            const channelData = firstItem[channel];
            if (Array.isArray(channelData) && channelData.length > 0) {
                // Check if the channel array has entries with 'date' field
                return channelData.some((entry) => entry && entry.date);
            }
            return false;
        });
    };

    // Helper function to detect if data should use grouping (only for "All channels" with multiple channels)
    const detectGroupingData = (data) => {
        if (!data || data.length === 0) return false;
        if (selectedChannel !== 'All channels') return false; // Specific channel = no grouping

        const firstItem = data[0];

        // Check for old grouping structure (dateCategory, date_Category)
        if ('dateCategory' in firstItem || 'date_Category' in firstItem) {
            return true;
        }

        // For new structure: only group if multiple channels have data
        const channelArrays = ['sms', 'email', 'whatsApp'];
        let channelsWithData = 0;

        channelArrays.forEach((channel) => {
            const channelData = firstItem[channel];
            if (Array.isArray(channelData) && channelData.length > 0) {
                channelsWithData++;
            }
        });

        // Only use grouping if multiple channels have data
        return channelsWithData > 1;
    };

    const handleFetchCommunicationSent = useCallback(async (pageNum = 1, pageSize = 5) => {
        setIsLoading(true);
        setGridColumns([]);
        setDatabaseConsumptionData([]);
        setFullDataCache([]);

        // Calculate dates: endDate = today, startDate = 29 days before endDate
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const payload = {
            clientId,
            userId,
            departmentId,
            startDate: formatDateWithSlash(startDate),
            endDate: formatDateWithSlash(endDate),
            ChannelType: selectedChannel === "All channels" ? "ALL" : selectedChannel,
            pageNumber: pageNum,
            pageSize: pageSize,
            searchTerm: searchText && searchBy ? { [searchBy]: searchText } : {},
            isKey: false,
            isConsumption: !isFromAA360
        };

        try {
            const result = await dispatch(getConsumptionCsvReport(payload));

            // Extract values from response
            // API response structure: { data: [...], status: true, totalRecords: 883284, totalPages: 58886 }
            const status = result?.status;
            const data = result?.data;
            const totalRecords = result?.totalRecords;

            // Handle different response structures
            let actualData = data;
            let actualTotal = totalRecords;

            // Check if data contains items array and totalRecords (nested structure)
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                actualData = data.items || data.data || data.records || [];
                actualTotal = totalRecords || data.totalRecords || data.total || 0;
            } else if (Array.isArray(data)) {
                actualTotal = totalRecords || 0;
            }

            if (status && actualData) {
                const dataArray = Array.isArray(actualData) ? actualData : [];

                // Check if we should use server-side pagination based on totalRecords
                const totalCount = Number(actualTotal) || 0;
                const hasTotalRecords = totalCount > 0 && totalCount > dataArray.length;
                setUseServerPagination(hasTotalRecords);

                // Detect if response has date fields (for showing channel dropdown and grouping headers)
                const hasDateFields = detectDateFields(dataArray);
                setHasChannels(hasDateFields);

                // Detect if data has grouping fields (for column display only, not pagination)
                const hasGrouping = detectGroupingData(dataArray);
                setHasGroupingData(hasGrouping);

                if (hasTotalRecords) {
                    // Server-side pagination: Use totalRecords from API, only store current page data
                    const finalTotal = actualTotal ? Number(actualTotal) : (totalRecords ? Number(totalRecords) : 0);
                    setDatabaseConsumptionData(dataArray);
                    setTotalRecords(finalTotal);
                    setFullDataCache([]); // Clear cache for server-side pagination

                    // Generate dynamic columns for non-grouping data
                    if (!hasGrouping) {
                        const dynamicColumns = generateDynamicColumns(dataArray);
                        setGridColumns(dynamicColumns);
                    }
                } else {
                    // Client-side pagination: Store all data
                    setFullDataCache(dataArray);
                    setDatabaseConsumptionData(dataArray);
                    setTotalRecords(dataArray.length);

                    // Generate columns based on grouping
                    if (!hasGrouping) {
                        // Generate dynamic columns for non-grouping data
                        const dynamicColumns = generateDynamicColumns(dataArray);
                        setGridColumns(dynamicColumns);
                    }
                }
            } else {
                setDatabaseConsumptionData([]);
                setTotalRecords(0);
                setGridColumns([]);
                setFullDataCache([]);
                setHasGroupingData(false);
                setUseServerPagination(false);
            }
        } catch (error) {
            setDatabaseConsumptionData([]);
            setTotalRecords(0);
            setGridColumns([]);
            setFullDataCache([]);
            setHasGroupingData(false);
            setUseServerPagination(false);
            setHasChannels(false);
        } finally {
            setIsLoading(false);
        }
    }, [
        dispatch,
        clientId,
        userId,
        departmentId,
        selectedChannel,
        searchText,
        searchBy,
    ]);

    const handleSearchText = useCallback(
        ({ type, text }) => {
            const term = (text || '').trim();

            const fieldName = titleToField?.[type] || '';
            setSearchBy(fieldName);
            setSearchText(term);
            // Reset pagination when searching
            setPaginationParams({ skip: 0, take: 5, initialPagination: false });
        },
        [titleToField],
    );

    const handleClearFieldText = useCallback(() => {
        setSearchText('');
        setSearchBy('');
        // Reset pagination when clearing search
        setPaginationParams({ skip: 0, take: 5, initialPagination: false });
    }, []);

    const handleDownloadCsv = useCallback(async () => {
        // Calculate dates: endDate = today, startDate = 29 days before endDate
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);

        const payload = {
            clientId,
            userId,
            departmentId,
            startDate: formatDateWithSlash(startDate),
            endDate: formatDateWithSlash(endDate),
            ChannelType: selectedChannel === "All channels" ? "ALL" : selectedChannel,
            pageNumber: 1,
            pageSize: totalRecords || 5,
            searchTerm: searchText && searchBy ? { [searchBy]: searchText } : {},
        };

        try {
            const result = await dispatch(getConsumptionCsvReportDownload(payload));
            if (result) {
                const fileName = `Communication_Report_${getYYMM(endDate)}_${selectedChannel}`;
                downloadCSVcommasFile(result, fileName);
            }
        } catch (error) {
        }
    }, [
        dispatch,
        clientId,
        userId,
        departmentId,
        selectedChannel,
        searchText,
        searchBy,
        totalRecords,
    ]);

    // Fetch data when filters change (date, channel, search)
    const isInitialFilterLoad = useRef(true);
    useEffect(() => {
        // Skip initial load - component mount will handle it
        if (isInitialFilterLoad.current) {
            isInitialFilterLoad.current = false;
            return;
        }

        // Reset pagination when filters change
        setPaginationParams({ skip: 0, take: 5, initialPagination: false });
        handleFetchCommunicationSent(1, 5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedChannel,
        searchText,
        searchBy,
    ]);

    // Initial load on component mount
    useEffect(() => {
        handleFetchCommunicationSent(1, 5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId, userId, departmentId]);

    // Fetch data when pagination changes (only for server-side pagination)
    const isInitialPaginationLoad = useRef(true);
    useEffect(() => {
        // Skip the first pagination change (it's handled by the filter change effect)
        if (isInitialPaginationLoad.current) {
            isInitialPaginationLoad.current = false;
            return;
        }
        if (useServerPagination && paginationParams.skip !== undefined && paginationParams.take !== undefined) {
            const pageNumber = Math.floor(paginationParams.skip / paginationParams.take) + 1;
            handleFetchCommunicationSent(pageNumber, paginationParams.take);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationParams.skip, paginationParams.take, useServerPagination]);

    // Reset the initial pagination load flag when filters change
    useEffect(() => {
        isInitialPaginationLoad.current = true;
    }, [selectedChannel, searchText, searchBy]);

    const handlePagerChange = useCallback((data) => {
        const { skip, take } = data?.dataState || {};
        if (useServerPagination) {
            if (skip !== paginationParams.skip || take !== paginationParams.take) {
                const currentTake = paginationParams.take || 5;
                const isPageSizeChange = take !== currentTake;
                const newSkip = isPageSizeChange ? 0 : (skip || 0);

                setPaginationParams({ skip: newSkip, take: take || 5 });
            }
        }
    }, [useServerPagination, paginationParams.skip, paginationParams.take]);

    const isCsvDownloadDisabled = isLoading || !databaseConsumptionData?.length || isFromAA360;

    return (
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title={isFromAA360 ? 'Communication response' : 'Communication sent'}
                isBack
                backPath={isFromAA360 ? "/analytics" : "/preferences/consumptions"}
                state={isFromAA360 ? { index: 1 } : {}}
                rightCommonMenus
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <Row className="d-flex align-items-center justify-content-end mb10">
                            <Col md={isAdvanceExpanded ? 12 : 7} className="advanceSearchContainer">
                                <ul className={`rs-list-group-horizontal float-end`}>
                                    {hasChannels && (
                                        <li className={`ml15 ${isLoading ? 'pe-none click-off' : ''}`}>
                                            <RSBootstrapDropdown
                                                data={channelDropdownData}
                                                defaultItem={selectedChannel}
                                                onSelect={(item) => {
                                                    setSelectedChannel(item);
                                                }}
                                                isActive={true}
                                                alignRight
                                            />
                                        </li>
                                    )}
                                    <li className={`advanceSearchBlock ml15 ${isLoading || !databaseConsumptionData?.length ? 'pe-none click-off' : ''}`}>
                                        <RSAdvanceSearch
                                            key={`adv-search-${hasGroupingData}`}
                                            advanceSearchOptions={advanceSearchOptions}
                                            hideDropdown
                                            searchText={(text) => handleSearchText(text)}
                                            isClearSearchText={isCloseSearch}
                                            setIsClearSearchText={setIsCloseSearch}
                                            allClearField={() => handleClearFieldText()}
                                            searchClearField={() => handleClearFieldText()}
                                            onAdvanceToggle={setIsAdvanceExpanded}
                                            inputConfig={{ maxLength: 200 }}
                                        />
                                    </li>
                                    <li className="ml15">
                                        <RSTooltip text="Download CSV" className="lh0">
                                            <span className={isCsvDownloadDisabled ? 'pe-none click-off lh0' : 'lh0'}>
                                                <i
                                                    onClick={() => {
                                                        if (!isCsvDownloadDisabled) {
                                                            handleDownloadCsv();
                                                        }
                                                    }}
                                                    className={`${csv_download_large} icon-lg color-primary-blue`}
                                                />
                                            </span>
                                        </RSTooltip>
                                    </li>
                                </ul>
                            </Col>
                        </Row>

                        <Row>
                            <KendoGridNew
                                key={`communication-sent-${selectedChannel}-${hasGroupingData}-${useServerPagination}-${paginationParams.skip}-${paginationParams.take}-${totalRecords}`}
                                data={databaseConsumptionData}
                                isLoading={isLoading}
                                isFailure={!isLoading && !databaseConsumptionData?.length && totalRecords === 0}
                                staticColumns={isLoading ? [] : (hasGroupingData ? getCommunicationSentStaticColumns : gridColumns)}
                                pageable={true}
                                scrollable={'scrollable'}
                                resizable={true}
                                reorderable={true}
                                groupable={selectedChannel === 'All channels' && (!databaseConsumptionData?.length ? false : true)}
                                sortable={!hasGroupingData ? false : true}
                                searchable={false}
                                settings={{ total: totalRecords }}
                                // Use server-side pagination if totalRecords exists, otherwise client-side
                                isDataStateRequired={Boolean(useServerPagination)}
                                dataState={useServerPagination ? { skip: paginationParams.skip, take: paginationParams.take } : undefined}
                                onDataStateChange={useServerPagination ? (data) => handlePagerChange(data) : undefined}
                                selectedChannel={selectedChannel}
                            />
                            <small className="mt15 color-secondary-black d-flex align-items-center"><i
                                className={`${circle_info_mini} icon-xs color-primary-blue mr5`}
                            ></i>Only the last 7 days of consumption data are shown in the grid. Download the CSV to access the 30-day data</small>
                        </Row>
                    </Container>
                </div>
            </Container>
            {/* Main page content block ends */}
        </div>
    );
};

export default CsvReport;

