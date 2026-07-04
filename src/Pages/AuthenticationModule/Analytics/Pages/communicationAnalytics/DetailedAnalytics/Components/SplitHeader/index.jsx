import { analytics_large, bar_filter_medium, filter_fill_large, filter_large, pdf_download_medium, popup_close_circle_fill_medium, popup_close_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSTooltip from 'Components/RSTooltip';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import SankeyGridView from '../SankeyGridView';
import SankeyChartView from '../SankeyChartView';
import RSIcon from 'Components/RSIcon';
import { RSPrimaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import { getBackgroundColor } from './constants';
import { Col, Row } from 'react-bootstrap';
import useQueryParams from 'Hooks/useQueryParams';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { getDetailAdvanceSearchData } from 'Reducers/analytics/details/request';
import { useDispatch, useSelector } from 'react-redux';
import { DetailAnalyticsProvider } from '../..';
import { getSessionId } from 'Reducers/globalState/selector';
import { getAttributeValues } from 'Reducers/audience/targetListCreation/request';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { COMMUNICATION_STATUS } from '../../constants';

const ANALYTICS_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const getFilterDisplayName = (value) =>
    value?.includes('_') ? value?.replace(/_[^_]*$/, '') : value;

const isCommunicationStatusFilter = (value) =>
    getFilterDisplayName(value)?.trim()?.toLowerCase() === COMMUNICATION_STATUS.toLowerCase();

const splitDataFilterHeader = [
    { id: 'targetGroup', splitType: 'Target group' },
    { id: 'controlGroup', splitType: 'Control group' },
];

const SplitHeader = (props) => {
    const { callbackSplit = () => { }, splitViewCGTG = false, downloadUI, advanceAnalyticsList = [], blastID, campaignID, channelId, departmentId } = props;
    const dispatch = useDispatch();
    const advanceSearchFilterLoader = useApiLoader({ autoFetch: false, loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG });
    const { userId, clientId } = useSelector((state) => getSessionId(state));
    const { defaultItemSplitHeader } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const { refAPIStatus, isPdfExporting } = useContext(DetailAnalyticsProvider) || {};
    const { control, setValue, getValues, watch } = useForm();
    const queryParams = useQueryParams('/analytics/analytics-report');
    const detailParams = useQueryParams('/analytics/detail-analytics');
    // console.log('state32424: ', queryParams);

    const date = new Date();
    const startDate = new Date(date.setDate(date.getDate() - 30));
    const [state, setState] = useState({
        splitSegment: props?.splitData?.[0],
        logo: 'facebookApp',
        filterSelectedData: 0,
        downloadShow: false,
        selectedDate: {
            startDate: props?.startDate,
            endDate: props?.endDate, //new Date(),
        },
        campaignDate: {
            startDate: props?.startDate,
            endDate: props?.endDate,
        },
    });

    const [searchList, setSearchList] = useState([]);
    const [dropDownChange, setDropDownChange] = useState(false);
    const [updateHeaderTitle, setUpdateHeaderTitle] = useState({});
    // console.log('updateHeaderTitle: ', updateHeaderTitle);
    const [defaultSplitItem, setDefaultSplitItem] = useState(props?.splitData?.[0]);
    const [isShowSankeyGrid, setIsShowSankeyGrid] = useState(false);
    const [isShowSankeyChart, setIsShowSankeyChart] = useState(false);
    const [advancedSearchBlock, setadvancedSearchBlock] = useState(false);
    const [searchTypeField, setSearchTypeField] = useState();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const searchInput = watch('searchInput');
    const [accumulatedFilterValues, setAccumulatedFilterValues] = useState([]);
    const [selectedFilterList, setSelectedFilterList] = useState({
        filterList: [],
        searchKey: '',
        originalKey: '',
    });
    const [advancedSearchData, setAdvancedSearchData] = useState([]);
    const [isAdvancedFilterApplied, setIsAdvancedFilterApplied] = useState(false);
    const transformedAnalyticsList = advancedSearchData?.map((item) => ({
        original: item,
        display: getFilterDisplayName(item),
    }));
    const filteredAnalyticsList = isAdvancedFilterApplied
        ? transformedAnalyticsList?.filter((item) => !isCommunicationStatusFilter(item.original))
        : transformedAnalyticsList;
    const filterDropdownOptions = filteredAnalyticsList?.map((item) => item.display) ?? [];
    const hasFilterDropdownOptions = filterDropdownOptions.length > 0;
    const tempData = (searchTypeField && selectedFilterList?.filterList?.filter((ele) =>
        ele?.toLowerCase()?.startsWith(searchTypeField?.toLowerCase()),
    )) || [];
    const getAvailableFilterValues = (filterValues) => {
        if (!filterValues || !Array.isArray(filterValues)) return [];
        const selectedValuesForCurrentType = accumulatedFilterValues
            ?.filter(filter => filter.FilterType === selectedFilterList?.originalKey)
            ?.map(filter => filter.FilterValue);
        const allSelectedValues = [...new Set([...selectedValuesForCurrentType, ...searchList])];
        return filterValues.filter(value =>
            value && value.trim() !== '' && !allSelectedValues.includes(value)
        );
    };

    const availableFilterValues = getAvailableFilterValues(selectedFilterList?.filterList || []);
    const availableTempData = getAvailableFilterValues(tempData);

    const filterValuesToShow = searchTypeField ? availableTempData : availableFilterValues;
    //debugger
    const defaultDropdown = props?.splitData.find(
        (item) =>
            item.subchannelId === detailParams?.subChannelId ||
            item.subChannelId === detailParams?.subChannelId ||
            item.subchannelId === queryParams?.subChannelId ||
            item.subChannelId === queryParams?.subChannelId,
    );
    const getResolvedBlastShortCode = (selectedSplitItem) => {
        if (!selectedSplitItem) return undefined;
        if (selectedSplitItem?.splitType === 'Actual communication') {
            const actualCommunicationItem = props?.splitData?.find(
                (splitItem) => splitItem?.splitType === 'Actual communication',
            );
            return (
                selectedSplitItem?.blastShortCode ||
                actualCommunicationItem?.blastShortCode ||
                blastID
            );
        }
        const matchedSplit = props?.splitData?.find(
            (splitItem) => splitItem?.splitType === selectedSplitItem?.splitType,
        );
        return matchedSplit?.blastShortCode || selectedSplitItem?.blastShortCode;
    };
    useEffect(() => {
        //debugger
        if (!dropDownChange) {
            setUpdateHeaderTitle(defaultDropdown || props?.splitData?.[0]);
            // if (props.channelId === 7) {
            //     setUpdateHeaderTitle(props?.splitData?.[0]);
            // }
        }
        if (defaultItemSplitHeader && !dropDownChange) {
            const isChannelHeader =
                Number(props?.channelId) === 7 || Number(props?.channelId) === 10;
            const headerFieldKey = isChannelHeader ? 'channelFriendlyName' : 'name';
            if (!isChannelHeader || defaultItemSplitHeader?.[headerFieldKey]) {
                setUpdateHeaderTitle(defaultItemSplitHeader);
            } else {
                const subchannelId =
                    defaultItemSplitHeader?.subchannelId ??
                    defaultItemSplitHeader?.subChannelId;
                const resolvedItem =
                    props?.splitData?.find(
                        (item) =>
                            item.subchannelId === subchannelId || item.subChannelId === subchannelId,
                    ) || props?.splitData?.[0];
                if (resolvedItem) {
                    setUpdateHeaderTitle(resolvedItem);
                }
            }
        }
    }, [queryParams, props, defaultItemSplitHeader, dropDownChange]);

    const searchDropdownRef = useRef(null);
    const filterDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                searchDropdownRef.current &&
                !searchDropdownRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
            if (
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(e.target)
            ) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // console.log(state, 'state');

    useEffect(() => {
        const filterSplitData = props.splitData?.find((split) => detailParams?.splitName === split?.splitType);
        setDefaultSplitItem(filterSplitData);
    }, [detailParams]);

    useEffect(() => {
        splitViewCGTG &&
            setState((pre) => ({
                ...pre,
                filterSelectedData: {
                    segmentName: 'Control/Target group',
                },
            }));
    }, [splitViewCGTG]);

    useEffect(() => {
        if (props?.startDate && props?.endDate) {
            setState((prev) => ({
                ...prev,
                selectedDate: { startDate: props.startDate, endDate: props.endDate },
                campaignDate: { startDate: props.startDate, endDate: props.endDate },
            }));
        }
    }, [props?.startDate, props?.endDate]);

    const allowedAudienceListTypes = ['0', '1', '3', '5', '10'];
    const filteredData =
        Array.isArray(props?.filterData) && props?.filterData?.length > 0
            ? props.filterData.filter((item) =>
                allowedAudienceListTypes.includes(String(item?.listType)),
            )
            : [];

    const shouldShowAudienceDropdown = filteredData?.length > 1;
    const isControlTargetMode =
        state?.filterSelectedData?.segmentName === 'Control/Target group' ||
        state?.splitSegment?.splitType === 'Control group' ||
        state?.splitSegment?.splitType === 'Target group';
    // Paid media (10) and Social media (7): do not show split dropdown only because splitData has multiple rows
    const isPaidMediaOrSocialMediaChannel =
        Number(props?.channelId) === 7 || Number(props?.channelId) === 10;
    const showSplitDropdownFromMultipleSplits =
        !isPaidMediaOrSocialMediaChannel && props?.splitData?.length > 1;
    const defaultAudienceItem =
        filteredData?.find((item) => item?.listType === '0') || filteredData?.[0] || {};

    const normalizeItem = (item) => {
        if (!item || typeof item !== 'object') return item;
        const subId = Number(item?.subchannelId ?? item?.subChannelId);
        const nameStr = String(item?.channelFriendlyName || item?.name || item?.id || '').toLowerCase();
        if (subId === 5 || nameStr.includes('pinterest') || nameStr.includes('pininterest')) {
            return {
                ...item,
                id: 'pinterest',
                channelFriendlyName: 'Pinterest',
                name: 'Pinterest',
            };
        }
        return item;
    };

    const normalizedHeaderTitle = normalizeItem(updateHeaderTitle);
    const normalizedSplitData = Array.isArray(props.splitData)
        ? props.splitData.map(normalizeItem)
        : props.splitData;

    return (
        <>
            <div
                className={`d-flex justify-content-between align-items-center splite_ab splite_ab_bg `}
                style={{
                    background:
                        (Number(updateHeaderTitle?.subchannelId ?? updateHeaderTitle?.subChannelId) === 5 ||
                         updateHeaderTitle?.channelFriendlyName?.toLowerCase() === 'pinterest' ||
                         updateHeaderTitle?.id?.toLowerCase() === 'pinterest')
                            ? '#e60023'
                            : getBackgroundColor[updateHeaderTitle?.id] ||
                              getBackgroundColor[updateHeaderTitle?.channelFriendlyName?.toLowerCase()] ||
                              getBackgroundColor[updateHeaderTitle?.channelFriendlyName],
                }}
            >
                <div>
                    {props.colorfulHeader && (
                        <RSBootstrapdown
                            data={normalizedSplitData}
                            flatIcon
                            defaultItem={normalizedHeaderTitle}
                            className=""
                            isObject
                            fieldKey={
                                props?.channelId === 7 || props?.channelId === 10
                                    ? 'channelFriendlyName'
                                    : 'name'
                            }
                            showUpdate={true}
                            onSelect={(selectedItem) => {
                                setUpdateHeaderTitle(selectedItem);
                                setDropDownChange(true);
                                const currentSplit = state?.splitSegment ?? defaultSplitItem;
                                let filterData = {
                                    ...selectedItem,
                                    selectedDate: {
                                        startDate: props?.startDate,
                                        endDate: props?.endDate,
                                    },
                                    filterValue: accumulatedFilterValues,
                                    ...(currentSplit && {
                                        splitData: currentSplit?.splitType,
                                        isCG: currentSplit?.splitType === 'Control group',
                                        isTG: currentSplit?.splitType === 'Target group',
                                        ...(currentSplit?.blastShortCode && { blastShortCode: currentSplit.blastShortCode }),
                                    }),
                                };
                                callbackSplit(filterData);
                            }}
                            isActive
                        />
                    )}
                    {(props.splitView ||
                        splitViewCGTG ||
                        isControlTargetMode ||
                        showSplitDropdownFromMultipleSplits) && (
                            <RSBootstrapdown
                                data={
                                    isControlTargetMode
                                        ? splitDataFilterHeader
                                        : props?.splitData
                                }
                                isObject={true}
                                customAlignRight={true}
                                fieldKey="splitType"
                                idKey="splitType"
                                defaultItem={
                                    isControlTargetMode
                                        ? state?.splitSegment ||
                                        splitDataFilterHeader.find((item) => item.splitType === 'Target group')
                                        : defaultSplitItem
                                }
                                className="splitsize"
                                onSelect={(item) => {
                                    //debugger
                                    if (refAPIStatus?.current) {
                                        refAPIStatus.current.totalActivityAPI = false;
                                        refAPIStatus.current.communicationStatusAPI = false;
                                    }
                                    const resolvedBlastShortCode = getResolvedBlastShortCode(item);
                                    setState((prev) => ({ ...prev, splitSegment: item }));
                                    setDefaultSplitItem(item);
                                    const currentSplit = item;
                                    let filterData = {
                                        splitData: item?.splitType,
                                        selectedDate: {
                                            startDate: props?.startDate,
                                            endDate: props?.endDate,
                                        },
                                        filterSelectedData: state?.filterSelectedData?.segmentId || 0,
                                        blastShortCode: resolvedBlastShortCode,
                                        isCG: item?.splitType === "Control group",
                                        isTG: item?.splitType === "Target group",
                                        filterValue: accumulatedFilterValues
                                    };
                                    callbackSplit(filterData);
                                }}
                                isActive
                            />
                        )}
                </div>
                <div className="d-flex align-items-center">
                    {props?.filterDropdown && shouldShowAudienceDropdown && (
                        <RSBootstrapdown
                            data={filteredData}
                            isObject={true}
                            customAlignRight={true}
                            defaultItem={defaultAudienceItem}
                            fieldKey="segmentName"
                            className="mr15"
                            alignRight
                            onSelect={(item) => {
                                if (refAPIStatus?.current) {
                                    refAPIStatus.current.totalActivityAPI = false;
                                    refAPIStatus.current.communicationStatusAPI = false;
                                }
                                setState((pre) => ({ ...pre, filterSelectedData: item }));
                                const currentSplit = state?.splitSegment ?? defaultSplitItem;
                                const filterData = {
                                    splitData: state?.splitSegment?.splitType,
                                    selectedDate: {
                                        startDate: props?.startDate,
                                        endDate: props?.endDate,
                                    },
                                    filterSelectedData: item?.segmentId,
                                    selectedListType: item?.listType,
                                    audienceChanged: true,
                                    filterValue: accumulatedFilterValues,
                                    ...(currentSplit && {
                                        splitData: currentSplit?.splitType,
                                        isCG: currentSplit?.splitType === 'Control group',
                                        isTG: currentSplit?.splitType === 'Target group',
                                        ...(currentSplit?.blastShortCode && { blastShortCode: currentSplit.blastShortCode }),
                                    }),
                                };
                                callbackSplit(filterData);
                            }}
                            isActive
                        />
                    )}
                    <span className={`${downloadUI ? 'download-UI' : ''}`}>
                        {props?.datePicker && (
                            <RSDateRangePicker
                                key={`${updateHeaderTitle?.channelFriendlyName || ''}-${state?.splitSegment?.splitType || ''
                                    }-${state?.filterSelectedData?.segmentId}`}
                                selectedDateText={'All time'}
                                // startDate={props.startDate !== undefined && new Date(props.startDate)}
                                // endDate={props.endDate !== undefined && new Date(props.endDate)}
                                startDate={
                                    state?.campaignDate?.startDate !== undefined &&
                                    new Date(state?.campaignDate?.startDate)
                                }
                                endDate={
                                    state?.campaignDate?.endDate !== undefined &&
                                        new Date(state?.campaignDate?.endDate) >= new Date()
                                        ? new Date()
                                        : new Date(state?.campaignDate?.endDate)
                                }
                                selectedFullDate={{
                                    start: state?.campaignDate?.startDate,
                                    end:
                                        state?.campaignDate?.endDate !== undefined &&
                                            new Date(state?.campaignDate?.endDate) >= new Date()
                                            ? new Date()
                                            : new Date(state?.campaignDate?.endDate),
                                }}
                                onDatePickerClosed={(date) => {
                                    // console.log('date: ', date);
                                    setState((prev) => ({ ...prev, selectedDate: date }));
                                    const currentSplit = state?.splitSegment ?? defaultSplitItem;
                                    let filterData = {
                                        ...updateHeaderTitle,
                                        splitData: state?.splitSegment?.splitType,
                                        selectedDate: date,
                                        filterSelectedData: state?.filterSelectedData?.segmentId,
                                        subchannelId:
                                            updateHeaderTitle?.subchannelId ??
                                            updateHeaderTitle?.subChannelId,
                                        filterValue: accumulatedFilterValues,
                                        ...(currentSplit && {
                                            splitData: currentSplit?.splitType,
                                            isCG: currentSplit?.splitType === 'Control group',
                                            isTG: currentSplit?.splitType === 'Target group',
                                            ...(currentSplit?.blastShortCode && { blastShortCode: currentSplit.blastShortCode }),
                                        }),
                                    };
                                    callbackSplit(filterData);
                                }}
                                isAnalytics
                            />
                        )}
                    </span>

                    {props?.detailAnalytics && (
                        <Fragment>
                            <RSTooltip
                                text={isPdfExporting ? 'Preparing PDF...' : 'Download PDF'}
                                position="top"
                                show={state?.downloadShow && !isPdfExporting}
                            >
                                <span
                                    className={`eye-icon-wrapper d-inline-flex align-items-center justify-content-center ml10 ${isPdfExporting ? 'pe-none click-off eye-icon-wrapper--loading' : 'cp'
                                        }`}
                                >
                                    {isPdfExporting ? (
                                        <span
                                            className="segment_loader listing-preview-eye-loader"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <i
                                            id="rs_data_download"
                                            className={`${pdf_download_medium} icon-md`}
                                            onMouseEnter={() => {
                                                setState((pre) => ({ ...pre, downloadShow: true }));
                                            }}
                                            onMouseLeave={() => {
                                                setState((pre) => ({ ...pre, downloadShow: false }));
                                            }}
                                            onClick={() => {
                                                if (isPdfExporting) return;
                                                setState((pre) => ({ ...pre, downloadShow: false }));
                                                props.isDownloadUI?.(true);
                                            }}
                                        />
                                    )}
                                </span>
                            </RSTooltip>
                        </Fragment>
                    )}

                    <ul className="d-flex ml15">
                        {props?.advanceSearch && (
                            <li className="">
                                <RSTooltip
                                    text={advanceSearchFilterLoader.isLoading ? 'Loading...' : 'Advanced search'}
                                    position="top"
                                >
                                    <div
                                        className={`eye-icon-wrapper d-flex align-items-center justify-content-center ${advancedSearchBlock || advanceSearchFilterLoader.isLoading
                                                ? 'pe-none click-off'
                                                : ''
                                            } ${advanceSearchFilterLoader.isLoading ? 'eye-icon-wrapper--loading' : ''}`}
                                    >
                                        {advanceSearchFilterLoader.isLoading ? (
                                            <span
                                                className="segment_loader listing-preview-eye-loader"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <i
                                                className={`${advancedSearchBlock ? filter_fill_large : filter_large
                                                    } click-on icon-md blue`}
                                                onClick={async () => {
                                                    if (!advancedSearchBlock) {
                                                        const payload = {
                                                            campaignId: campaignID,
                                                            departmentId: departmentId,
                                                            userId: userId,
                                                        };

                                                        await advanceSearchFilterLoader.refetch({
                                                            fetcher: async () => {
                                                                const res = await dispatch(
                                                                    getDetailAdvanceSearchData(payload),
                                                                );
                                                                setAdvancedSearchData(res?.data || []);
                                                                return res;
                                                            },
                                                            mode: 'create',
                                                            loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
                                                        });
                                                    }
                                                    setadvancedSearchBlock(!advancedSearchBlock);
                                                }}
                                                id="rs_SplitHeader_filter"
                                            />
                                        )}
                                    </div>
                                </RSTooltip>
                            </li>
                        )}

                        {props?.sankey && (
                            <li>
                                <RSTooltip text="Sankey" position="top">
                                    <i
                                        className={`${analytics_large} icon-md blue`}
                                        onClick={() => {
                                            setIsShowSankeyGrid(!isShowSankeyGrid);
                                        }}
                                    />
                                </RSTooltip>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            <div className={`advanced-search-block mt11 ${advancedSearchBlock ? 'enabled' : 'disabled'}`}>
                <Row className="advanced-search-container align-items-center">
                    <Col md={7}>
                        <ul className="search-tagsfield d-flex css-scrollbar-y">
                            {searchList?.map((item, ind) => (
                                <li className="select-tag" key={`tag-${ind}`}>
                                    {item}{' '}
                                    <i
                                        className={'icon-rs-circle-close-fill-edge-mini color-primary-red'}
                                        onClick={() => {
                                            const updatedSearchList = [...searchList].toSpliced(ind, 1);
                                            setSearchList(updatedSearchList);
                                            const updatedFilterValues = accumulatedFilterValues.filter(filter =>
                                                filter.FilterValue !== item
                                            );
                                            setAccumulatedFilterValues(updatedFilterValues);
                                            if (updatedFilterValues.length === 0) {
                                                setIsAdvancedFilterApplied(false);
                                            }
                                            const currentSplit = state?.splitSegment ?? defaultSplitItem;
                                            callbackSplit({
                                                filterValue: updatedFilterValues,
                                                selectedDate: state?.campaignDate ?? {
                                                    startDate: props?.startDate,
                                                    endDate: props?.endDate,
                                                },
                                                ...(currentSplit && {
                                                    splitData: currentSplit?.splitType,
                                                    isCG: currentSplit?.splitType === 'Control group',
                                                    isTG: currentSplit?.splitType === 'Target group',
                                                    ...(currentSplit?.blastShortCode && { blastShortCode: currentSplit.blastShortCode }),
                                                }),
                                                ...(state?.filterSelectedData?.segmentId != null && {
                                                    filterSelectedData: state.filterSelectedData.segmentId,
                                                }),
                                            });
                                        }}
                                    />{' '}
                                </li>
                            ))}
                        </ul>
                    </Col>
                    <Col md={5} className="d-flex justify-content-lg-end align-items-center">
                        <div
                            className="d-flex align-items-center border-left pl20 position-relative"
                            ref={searchDropdownRef}
                        >
                            <RSInput
                                classWrapper="rs-input-bg"
                                name={'searchInput'}
                                control={control}
                                placeholder={selectedFilterList.searchKey || "Select"}
                                handleOnchange={(e) => {
                                    setSearchTypeField(e.target.value);
                                    setShowDropdown(e.target.value.trim().length > 0);
                                }}
                                id="rs_SplitHeader_searchInput"
                            />

                            {/* <span>{`Search by ${selectedFilterList.searchKey}`}</span> */}
                            {/* <BootstrapDropdown
                            className={`${selectedFilterList.filterList?.length === 0 ? 'click-off' : ''} `}
                            data={selectedFilterList.filterList}
                            defaultItem={getValues('selectedtype')}
                            name={'selectedtype'}
                            customAlignRight={true}
                            showUpdate={false}
                            onSelect={(newValue) => {
                                if (searchList?.length < 5) {
                                    setSearchList((pre) => [...pre, newValue]);
                                    props.setFilterListValue((pre) => [...pre, newValue]);

                                }
                                setValue('selectedtype', '');
                            }}
                        /> */}
                        </div>
                        {showDropdown && (
                            <div
                                className="box-design css-scrollbar"
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    backgroundColor: 'white',
                                    width: '260px',
                                    height: '160px',
                                    overflow: 'auto',
                                    zIndex: '1',
                                    right: '232px',
                                }}
                            >
                                <ul>
                                    {filterValuesToShow?.length > 0 ? (
                                        filterValuesToShow?.map((item, idx) => (
                                            <li
                                                key={`${item}-${idx}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setValue('searchInput', '');
                                                    setShowDropdown(false);
                                                    if (!searchList.includes(item)) {
                                                        setSearchList((prev) => [...prev, item]);
                                                    }
                                                    const newFilterValue = {
                                                        FilterType: selectedFilterList?.originalKey,
                                                        FilterName: item,
                                                        FilterValue: item
                                                    };
                                                    const filterExists = accumulatedFilterValues.some(filter =>
                                                        filter.FilterType === newFilterValue.FilterType &&
                                                        filter.FilterValue === newFilterValue.FilterValue
                                                    );
                                                    if (!filterExists) {
                                                        const updatedFilterValues = [...accumulatedFilterValues, newFilterValue];
                                                        setAccumulatedFilterValues(updatedFilterValues);
                                                    }
                                                    if (props.setFilterListValue) {
                                                        props.setFilterListValue((prev) => [
                                                            {
                                                                ...prev,
                                                                filterData: item,
                                                                key: selectedFilterList.originalKey,
                                                            },
                                                        ]);
                                                    }
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {item}
                                            </li>
                                        ))
                                    ) : (
                                        <span>No data</span>
                                    )}
                                </ul>
                            </div>
                        )}
                        <div className="ml15" ref={filterDropdownRef}>
                            <RSTooltip position="top" text="Filter by">
                                <span
                                    className={`${!hasFilterDropdownOptions ? 'pe-none click-off' : ''} lh0`}
                                >
                                    <BootstrapDropdown
                                        data={filterDropdownOptions}
                                        defaultItem={
                                            <i
                                                className={`${bar_filter_medium} icon-md color-primary-blue`}
                                                id="rs_SplitHeader_bar_filter"
                                            />
                                        }
                                        alignRight
                                        customAlignRight={true}
                                        showUpdate={false}
                                        title={<i className={`${filter_large}`} />}
                                        className="mr15 no_caret"
                                        disabled={!hasFilterDropdownOptions}
                                        controlledShow={showFilterDropdown}
                                        onToggle={(nextOpen) => {
                                            if (!hasFilterDropdownOptions && nextOpen) return;
                                            setShowFilterDropdown(nextOpen);
                                        }}
                                        onSelect={async (selectedDisplayItem) => {
                                            setShowFilterDropdown(false);
                                            setValue('selectedtype', '');
                                            setValue('searchInput', '');
                                            const selectedAnalytic = filteredAnalyticsList?.find(
                                                item => item.display === selectedDisplayItem
                                            );
                                            const originalValue = selectedAnalytic
                                                ? selectedAnalytic.original
                                                : selectedDisplayItem;
                                            const payload = {
                                                attributeName: originalValue,
                                                clientId,
                                                userId,
                                                departmentId,
                                                partnerID: 0,
                                            };

                                            const response = await dispatch(getAttributeValues(payload, () => { }, '', 0));

                                            try {
                                                if (!response?.data) {
                                                    throw new Error('Response or response.data is undefined or null');
                                                }
                                                const parsedOnce = safeParseJSON(response?.data, null);
                                                const parsedTwice =
                                                    typeof parsedOnce === 'string'
                                                        ? safeParseJSON(parsedOnce, {})
                                                        : parsedOnce && typeof parsedOnce === 'object'
                                                            ? parsedOnce
                                                            : {};
                                                if (
                                                    typeof parsedTwice !== 'object' ||
                                                    parsedTwice === null ||
                                                    Array.isArray(parsedTwice)
                                                ) {
                                                    throw new Error('Parsed result is not a valid object');
                                                }
                                                const keys = Object.keys(parsedTwice);
                                                setSelectedFilterList((prev) => ({
                                                    ...prev,
                                                    filterList: keys,
                                                    searchKey: selectedDisplayItem,
                                                    originalKey: originalValue,
                                                }));
                                            } catch (error) {
                                                setSelectedFilterList((prev) => ({
                                                    ...prev,
                                                    filterList: [],
                                                    searchKey: selectedDisplayItem,
                                                    originalKey: originalValue,
                                                }));
                                            }
                                            // const { data: advanceSearchData } = await dispatch(getDetailAdvanceSearch({
                                            //         blastID,
                                            //     campaignId:campaignID,
                                            //         channelId,
                                            //     departmentId
                                            // }));

                                            // const matchedFilter = advanceSearchData.find(
                                            //     (item) => item.displayName === selectedDisplayItem,
                                            // );

                                        }}
                                    />
                                </span>
                            </RSTooltip>
                        </div>

                        <div className={`mr55 ${accumulatedFilterValues?.length === 0 && !searchInput?.length || !hasFilterDropdownOptions ? 'pe-none click-off' : ''}`}>
                            <RSPrimaryButton
                                onClick={() => {
                                    let finalFilterValues = [...accumulatedFilterValues];
                                    if (searchInput?.trim()) {
                                        const newFilterValue = {
                                            FilterType: selectedFilterList?.originalKey,
                                            FilterName: searchInput,
                                            FilterValue: searchInput
                                        };
                                        const filterExists = accumulatedFilterValues.some(filter =>
                                            filter.FilterType === newFilterValue.FilterType &&
                                            filter.FilterValue === newFilterValue.FilterValue
                                        );
                                        if (!filterExists) {
                                            finalFilterValues = [...accumulatedFilterValues, newFilterValue];
                                            setAccumulatedFilterValues(finalFilterValues);
                                            if (!searchList.includes(searchInput)) {
                                                setSearchList((prev) => [...prev, searchInput]);
                                            }
                                        }
                                    }
                                    const currentSplit = state?.splitSegment ?? defaultSplitItem;
                                    callbackSplit({
                                        filterValue: finalFilterValues,
                                        selectedDate: state?.campaignDate ?? {
                                            startDate: props?.startDate,
                                            endDate: props?.endDate,
                                        },
                                        ...(currentSplit && {
                                            splitData: currentSplit?.splitType,
                                            isCG: currentSplit?.splitType === 'Control group',
                                            isTG: currentSplit?.splitType === 'Target group',
                                            ...(currentSplit?.blastShortCode && { blastShortCode: currentSplit.blastShortCode }),
                                        }),
                                        ...(state?.filterSelectedData?.segmentId != null && {
                                            filterSelectedData: state.filterSelectedData.segmentId,
                                        }),
                                    });
                                    setIsAdvancedFilterApplied(finalFilterValues.length > 0);
                                    setValue('searchInput', '');
                                }}
                                // onClick={() => callbackSplit({ filterValue: {FilterType : selectedFilterList?.searchKey ,FilterName: searchInput,FilterValue: searchInput} })}
                                id="rs_SplitHeader_Apply">
                                Apply
                            </RSPrimaryButton>
                        </div>

                        <div
                            onClick={() => {
                                setValue('searchInput', '');
                                setSearchList([]);
                                setAccumulatedFilterValues([]);
                                setIsAdvancedFilterApplied(false);
                                setSearchTypeField('');
                                setShowDropdown(false);
                                setShowFilterDropdown(false);
                                setSelectedFilterList({
                                    filterList: [],
                                    searchKey: '',
                                    originalKey: '',
                                });
                                setadvancedSearchBlock(false);
                                const currentSplit = state?.splitSegment ?? defaultSplitItem;
                                const filterData = {
                                    filterValue: [],
                                    selectedDate: state?.campaignDate ?? {
                                        startDate: props?.startDate,
                                        endDate: props?.endDate,
                                    },
                                    ...(currentSplit && {
                                        splitData: currentSplit?.splitType,
                                        isCG: currentSplit?.splitType === 'Control group',
                                        isTG: currentSplit?.splitType === 'Target group',
                                        ...(currentSplit?.blastShortCode && { blastShortCode: currentSplit.blastShortCode }),
                                    }),
                                    ...(state?.filterSelectedData?.segmentId != null && {
                                        filterSelectedData: state.filterSelectedData.segmentId,
                                    }),
                                };
                                callbackSplit(filterData);
                            }}
                            className="filterclose"
                        >
                            <RSIcon
                                className="icon-md color-primary-blue top-14 position-relative"
                                defaultItem={popup_close_circle_medium}
                                hoverItem={popup_close_circle_fill_medium}
                            />
                        </div>
                    </Col>
                </Row>
            </div>

            <SankeyGridView
                cls={`${isShowSankeyGrid ? 'enabled' : 'disabled'}`}
                gridView={setIsShowSankeyGrid}
                chartView={setIsShowSankeyChart}
            />
            <SankeyChartView
                cls={`${isShowSankeyChart ? 'enabled' : 'disabled'}`}
                gridView={setIsShowSankeyGrid}
                chartView={setIsShowSankeyChart}
            />
        </>
    );
};

export default SplitHeader;
