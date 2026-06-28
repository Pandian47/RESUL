import { getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { CustomSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { CommunicationListRowComponent, GridDetailComponent, buildPayload, handleFinalStatusPayload, pagerSettings } from './constant';
import { ADD_FIRST_COMMUNICATION_1, ADD_FIRST_COMMUNICATION_2, ALERT, COMPLETED, DRAFT, EXTRACTION, IN_PROGRESS, MUTLI_STATUS, PAUSE, REJECT, SCHEDULED, SELECT_BU, STOP } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_plus_fill_medium, close_mini } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import _map from 'lodash/map';
import _findIndex from 'lodash/findIndex';
import { process } from '@progress/kendo-data-query';
import { useDispatch, useSelector } from 'react-redux';
import ResGrid from 'Pages/KendoDocs/CommonComponents/ResGrid';
import _get from 'lodash/get';
import HeaderCell from './Components/HeaderCell/HeaderCell';

import { initialDataState } from './constant';
import { getSessionId } from 'Reducers/globalState/selector';
import { updateCommunicationList, updateListDuplicate, resetCommListing } from 'Reducers/communication/listing/reducer';
import { getCampaignStatus, getCommunicationList } from 'Reducers/communication/listing/request';
import useApiLoader from 'Hooks/useApiLoader';
import RSConfirmationModal from 'Components/ConfirmationModal';

import { useNavigate } from 'react-router-dom';
import usePermission from 'Hooks/usePersmission';
import { updateSaveChannelsId, updateSavedStatusId } from 'Reducers/communication/createCommunication/plan/reducer';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { SkeletonCommunicationList } from 'Components/Skeleton/Skeleton';
import {
    EMPTY_COMMUNICATION_LISTING_DATA,
    coerceApiListingPayload,
} from 'Pages/AuthenticationModule/Communication/CommunicationLists/communicationListingDefaults';

export const CommunicationListingsContext = createContext({
    expandChange: () => { },
    requestPayload: {},
    setPlayPauseStopStatusContent: () => { },
    playPauseInitialPayload: {},
    setPlayPauseInitialPayload: () => { },
});

const CommunicationListings = () => {
    const dispatch = useDispatch();
    const { licenseTypeId, isCampaign } = getUserDetails();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { clientId, userId, departmentId, departmentName } = useSelector((state) => getSessionId(state) ?? {});
    const [disableCard, setDisableCard] = useState(false);
    const {
        data = EMPTY_COMMUNICATION_LISTING_DATA,
        isLoading = true,
        isFailure = false,
        isDuplicate = false,
    } = useSelector((state) => state.communicationListingReducer ?? {});
    const { failureApiErrors = [] } = useSelector((state) => state.globalstate ?? {});

    const [formState, setFormState] = useState({});
    const [requestPayload, setRequestPayload] = useState({});
    const [playPauseInitialPayload, setPlayPauseInitialPayload] = useState({
        pageSize: 5,
        index: 1,
        departmentId,
        clientId,
        userId,
        channelType: _get(formState, 'channel_type.id', ''),
        tags: _get(formState, 'tags.tags', ''),
        productCategoryId: _get(formState, 'product_type.categoryname', ''),
        statusId: handleFinalStatusPayload(formState?.status),
        startDate: getYYMMDD(new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER))),
        endDate: getYYMMDD(new Date()),
        name: '',
        createdBy: '',
        deliveryMethod: '',
        communicationType: '',
    });
    const [getPagination, setGetPagination] = useState(null);
    const { communicationsList = [], totalCampaigns = 0, totalRows = 5 } = data;
    const communicationsListRef = useRef(communicationsList);
    useEffect(() => {
        communicationsListRef.current = communicationsList;
    }, [communicationsList]);
    const loading = isLoading || isFailure;
    const nodata = communicationsList?.length === 0;

    const { permissions } = usePermission();
    const [playPauseStopStatusContent, setPlayPauseStopStatusContent] = useState({
        showContent: false,
        messageContent: '',
    });

    const [campaignData, setCampaignData] = useState({
        dataState: initialDataState,
        campaignList: [],
    });

    const communicationListAPI = useApiLoader({ actionCreator: getCommunicationList });
    const campaignStatusAPI = useApiLoader({
        actionCreator: getCampaignStatus,
    });

    useEffect(() => {
        return () => {
            dispatch(resetCommListing());
        };
    }, []);

    const { showContent, messageContent } = playPauseStopStatusContent;

    const { addAccess } = permissions || {};
    const navigate = useNavigate();
    useEffect(() => {

        const { userId: requestUserId, ...restRequestPayload } = requestPayload;
        const payload = buildPayload(
            {
                ...restRequestPayload,
                name: '',
                departmentId,
                clientId,
                userId: restRequestPayload?.createdBy ? userId : 0,
                createdBy: restRequestPayload?.createdBy ?? String(userId),
                index: 1,
                pageSize: getPagination != null ? getPagination : 5,
            },
            false,
        );
        if (isDuplicate) {
            setCampaignData(prevState => ({
                ...prevState,
                dataState: { skip: 0, take: getPagination }
            }));
            setRequestPayload(payload);
        }
        dispatch(updateListDuplicate(false));
    }, [isDuplicate]);



    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setConfimrationModal(true);
        } else {
            setConfimrationModal(false);
        }
        setCampaignData((prev) => ({
            ...prev,
            dataState: initialDataState,
        }));
    }, [departmentName]);

    useEffect(() => {
        const { data: processed } = process(communicationsList, campaignData.dataState);
        setCampaignData((prev) => ({
            ...prev,
            campaignList: Array.isArray(processed) ? processed : [],
        }));
    }, [communicationsList, campaignData.dataState]);
    const dataStateChange = async (event) => {
        const { skip, take } = event.dataState;
        setGetPagination(take);
        const index = Math.floor(skip / take + 1);
        const { userId: requestUserId, ...restRequestPayload } = requestPayload;
        const payload = buildPayload(
            {
                ...restRequestPayload,
                pageSize: take,
                index,
                departmentId,
                clientId,
                userId: requestUserId ?? userId,
            },
            true,
        );
        const apiResult = await communicationListAPI.refetch({ payload });
        const { data: listPayload } = coerceApiListingPayload(apiResult);
        const { communicationsList } = listPayload ?? EMPTY_COMMUNICATION_LISTING_DATA;
        setRequestPayload(payload);
        setCampaignData({
            dataState: event.dataState,
            campaignList: Array.isArray(communicationsList) ? communicationsList : [],
        });
        window.scrollTo(0, 0);
    };

    const collapseOtherRows = (list, activeIndex) =>
        _map(list, (campaign, index) => {
            const row = { ...campaign };
            if (index !== activeIndex) row.expanded = false;
            return row;
        });

    const expandChange = async ({ dataItem }, updateCommunicationsList) => {
        const channel = dataItem?.channelsDetails;
        const isExpand = dataItem?.expanded || false;
        let temp =
            updateCommunicationsList?.length && updateCommunicationsList
                ? [...updateCommunicationsList]
                : [...communicationsList];
        const campaignIndex = _findIndex(temp, ['campaignId', dataItem?.campaignId]);
        if (campaignIndex < 0) return;
        const tempCampaign =
            updateCommunicationsList?.length && updateCommunicationsList
                ? { ...(updateCommunicationsList[campaignIndex] ?? {}) }
                : { ...(communicationsList[campaignIndex] ?? {}) };
        const hasChannelData = Number(channel?.[0]?.channeldetailId ?? channel?.[0]?.channelDetailId) > 0;
        if (!isExpand && !hasChannelData) {
            const payload = {
                userId: userId,
                departmentId,
                clientId,
                campaignId: dataItem?.campaignId,
            };

            tempCampaign.expanded = true;
            tempCampaign.extendedCampaignId = dataItem.campaignId;
            tempCampaign.channelDetailsLoading = true;
            tempCampaign.isFailure = false;
            tempCampaign.channelsDetails = [];
            temp[campaignIndex] = tempCampaign;
            temp = collapseOtherRows(temp, campaignIndex);
            dispatch(updateCommunicationList(temp));

            const apiResult = await campaignStatusAPI.refetch({ payload, loading: false });
            if (apiResult == null) return;

            const { data: channelDetails, status } = apiResult;
            const latestList = [...communicationsListRef.current];
            const latestIndex = _findIndex(latestList, ['campaignId', dataItem.campaignId]);
            if (latestIndex < 0) {
                return;
            }
            const row = { ...latestList[latestIndex] };
            row.channelDetailsLoading = false;
            row.expanded = true;
            row.extendedCampaignId = dataItem.campaignId;

            try {
                if (status) {
                    row.channelsDetails = channelDetails;
                    row.isFailure = false;
                    if (channelDetails?.length) {
                        const filterChannel = channelDetails?.reduce((acc, item) => {
                            const id = item.channelId;
                            if (!acc[id]) {
                                acc[id] = [];
                            }
                            if (id === 7) {
                                acc[id].push(item?.socialPostChannelId);
                            } else if (id === 10) {
                                acc[id].push(item?.socialPostChannelId);
                            } else {
                                acc[id].push(id);
                            }
                            return acc;
                        }, {});
                        dispatch(updateSaveChannelsId(filterChannel));
                        const updateStatusDetailData = channelDetails.map((item) => ({
                            statusId: item?.statusId,
                            channelDetailId: item?.channeldetailId,
                            channelId: item?.channelId,
                            subSegmentLevel: item?.subSegmentLevel,
                            triggerPlayPauseStatus: item?.triggerPlayPauseStatus,
                        }));
                        dispatch(updateSavedStatusId(updateStatusDetailData));
                    } else {
                        dispatch(updateSaveChannelsId({}));
                        dispatch(updateSavedStatusId([]));
                    }
                } else {
                    row.channelsDetails = [];
                    row.isFailure = true;
                    dispatch(updateSaveChannelsId({}));
                    dispatch(updateSavedStatusId([]));
                }
            } catch {
                row.channelsDetails = [];
                row.isFailure = true;
                dispatch(updateSaveChannelsId({}));
                dispatch(updateSavedStatusId([]));
            } finally {
                const currentList = [...communicationsListRef.current];
                const currentIndex = _findIndex(currentList, ['campaignId', dataItem.campaignId]);
                if (currentIndex < 0 || !currentList[currentIndex]?.expanded) return;
                currentList[currentIndex] = row;
                dispatch(updateCommunicationList(collapseOtherRows(currentList, currentIndex)));
            }
        } else {
            campaignStatusAPI.abort();
            tempCampaign.expanded = !isExpand;
            tempCampaign.extendedCampaignId = null;
            tempCampaign.channelDetailsLoading = false;
            temp[campaignIndex] = tempCampaign;
            dispatch(updateCommunicationList(collapseOtherRows(temp, campaignIndex)));
        }
    };

    // useEffect(()=>{
    //     window.scrollTo(0, 0);
    // },[communicationsList])

    const listColumns = useMemo(
        () => [
            {
                cell: (props) =>
                    CommunicationListRowComponent(
                        props,
                        requestPayload,
                        setRequestPayload,
                        setCampaignData,
                    ),
            },
        ],
        [requestPayload],
    );

    const contextValues = {
        expandChange,
        requestPayload,
        setPlayPauseStopStatusContent,
        playPauseInitialPayload,
        setPlayPauseInitialPayload,
    };

    return (
        <CommunicationListingsContext.Provider value={contextValues}>
            {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                <>
                    <div className="mt15">
                        <CustomSkeleton isError={true} count={5} height={80} />
                    </div>
                </>
            ) : (
                <>
                    <HeaderCell
                        requestPayload={requestPayload}
                        setRequestPayload={setRequestPayload}
                        setCampaignData={setCampaignData}
                        setFormState={setFormState}
                        isLoading={isLoading}
                    />
                    {showContent && (
                        <div className="bg-primary-orange p5 text-white mb3 d-flex justify-content-between align-items-center">
                            <div className="d-flex p2 align-items-center ">
                                <i
                                    className={`${alert_medium} icon-md  color-primary-white mr5 cursor-default`}
                                ></i>
                                <p className="ml3"> {messageContent}</p>
                            </div>
                            <i
                                onClick={() =>
                                    setPlayPauseStopStatusContent({
                                        showContent: false,
                                        messageContent: '',
                                    })
                                }
                                className={`${close_mini} icon-sm cp  color-primary-white mr5 cursor-default`}
                            ></i>
                        </div>
                    )}
                    <div className={`rs-grid-listing ${communicationsList?.length ? '' : 'mt15'}`}>
                        {!isCampaign ? (
                            <div className="box-design mt42">
                                <CustomSkeleton
                                    isError={true}
                                    count={8}
                                    height={38}
                                    isShowIcon={false}
                                    text={
                                        <>
                                            <span>

                                                {ADD_FIRST_COMMUNICATION_1}
                                                <i
                                                    onClick={() => {
                                                        if (addAccess) navigate(`communication-creation`, {});
                                                    }}
                                                    className={`${departmentName?.toLowerCase() === 'all' && licenseTypeId == '3'
                                                            ? 'click-off'
                                                            : ''
                                                        } ${circle_plus_fill_medium
                                                        } icon-md px5 color-primary-blue position-relative top4`}
                                                    id="rs_data_circle_plus_fill"
                                                ></i>
                                                {ADD_FIRST_COMMUNICATION_2}.
                                            </span>
                                        </>
                                    }
                                />
                            </div>
                        ) : loading ? (
                            <div className="rs-grid-listing mt15">
                                <SkeletonCommunicationList isError={isFailure} isLoading={isLoading} />
                            </div>
                        ) : nodata ? (
                            <div className="mt15">
                                <SkeletonCommunicationList isError={true} isLoading={isLoading} />
                            </div>
                        ) : (
                            <>
                                <ResGrid
                                    layout="list"
                                    listPreset="communication"
                                    skeletonVariant="communication"
                                    data={communicationsList}
                                    columns={listColumns}
                                    dataItemKey="campaignId"
                                    detail={(props) =>
                                        GridDetailComponent(
                                            props,
                                            disableCard,
                                            (dataItem) => expandChange({ dataItem }),
                                        )
                                    }
                                    expandField="expanded"
                                    onExpandChange={expandChange}
                                    sortable
                                    pageable={totalCampaigns > 5 ? pagerSettings : false}
                                    scrollable="none"
                                    dataState={campaignData.dataState}
                                    onDataStateChange={dataStateChange}
                                    total={totalCampaigns}
                                    isServerSide
                                    className="custom-rspager"
                                />
                                {/* <ul className="rs-legend mt20">
                                    <li>
                                        <span className="rsl-status legend-drafted"></span>
                                        {DRAFT}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-multistatus"></span>
                                        {MUTLI_STATUS}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-scheduled"></span>
                                        {SCHEDULED}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-inprogress"></span>
                                        {IN_PROGRESS}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-completed"></span>
                                        {COMPLETED}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-alerted"></span>
                                        {ALERT}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-stop"></span>
                                        {STOP}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-pause"></span>
                                        {PAUSE}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-extraction"></span>
                                        {EXTRACTION}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-reject"></span>
                                        {REJECT}
                                    </li>
                                </ul> */}
                            </>
                        )}
                    </div>
                </>
            )}
            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                handleClose={() => {
                    setConfimrationModal(false);
                }}
                handleConfirm={() => {
                    setConfimrationModal(false);
                }}
                secondaryButton={false}
            />

            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </CommunicationListingsContext.Provider>
    );
};

export default CommunicationListings;
