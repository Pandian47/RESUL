import { GRID_COLUMN_CONFIG } from './constant';
import { ARE_YOU_SURE_ARCHIVE, DATA_SYNC_STATUS, OK } from 'Constants/GlobalConstant/Placeholders';
import { circle_time_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useContext, useState } from 'react';
import CustomKendoGrid from 'Components/RSCustomKendoGrid';
import TargetInfo from '../Card/TargetInfo';
import { useSelector, useDispatch } from 'react-redux';
import { TargetListContext } from '../..';
import { useNavigate } from 'react-router-dom';
import RSConfirmationModal from 'Components/ConfirmationModal';
import DownloadRecords from '../DownloadRecords/DownloadRecords';
import { TooltipCGTG } from '../Card/TooltipCGTG';
import {
    removeSeedlist,
    duplicateTargetList,
    getTargetListView,
    updateArchivalStatus,
} from 'Reducers/audience/targetList/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useForm } from 'react-hook-form';
import DuplicateModal from './DuplicateModal';
import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';
import DataAugmentation from '../DataAugmentation/DataAugmentation';
import { encodeUrl } from 'Utils/modules/crypto';
const TargetGridView = ({ totalListCount, get_Pagination }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { targetListView, listFailure, listLoading } = useSelector(
        ({ targetListViewReducer }) => targetListViewReducer,
    );
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { height, pageSize } = useWindowSize();

    const [popupStatus, setPopStatus] = useState({ infoStatus: false, selectedList: {} });
    const [warningModal, setWarningModal] = useState({
        show: false,
        data: {},
    });
    const [dataAugmentModal, setDataAugmentModal] = useState({
        show: false,
        dataItem: {},
    });
    const [dataArchiveModal, setDataArchiveModal] = useState({
        show: false,
        dataItem: {},
    });
    const [downloadModal, setDownloadModal] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState({
        show: false,
        selectedList: {},
    });
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [tooltipStatus, setTooltipStatus] = useState({
        cgtgStatus: false,
    });
    const [dataSyncmodal, setDataSyncmodal] = useState(false);

    const { control, watch } = useForm();

    const {
        setInitialGridPagination,
        setPageConfig,
        initialGridPagination,
        setParams,
        params,
        setAudienceView,
        setPagerPageConfig,
        listTypeView,
    } = useContext(TargetListContext);

    const handleAction = (dataItem) => {
        setPopStatus((pre) => ({ pre, selectedList: dataItem, infoStatus: true }));
    };
    const handleInfo = (dataItem) => {
        setPopStatus((pre) => ({ pre, selectedList: dataItem, infoStatus: true }));
    };
    const handleDataAugmentation = (dataItem) => {
        setDataAugmentModal({ show: true, dataItem: dataItem });
    };

    const handleDataArchive = (dataItem) => {
        setDataArchiveModal({ show: true, dataItem: dataItem });
    };
    const handleDataArchiveSubmit = async (dataItem) => {
        const payload = {
            departmentId,
            clientId,
            tableName: 'segmentationlist',
            listId: [dataItem.segmentationListID],
            isArchived: !dataItem?.isArchived,
        };
        const res = await dispatch(updateArchivalStatus(payload));
        if (res?.status) {
            await refreshTargetList();
            setDataArchiveModal({ show: false, dataItem: {} });
        }
    };
    const refreshTargetList = useCallback(async () => {
        await dispatch(getTargetListView({ ...params, departmentId, clientId, userId }));
    }, [clientId, departmentId, dispatch, params, userId]);

    const handleEdit = (dataItem) => {
        const listType = dataItem?.listType;
        const segmentationListID = dataItem?.segmentationListID;
        const recipientsBunchName = dataItem?.recipientsBunchName;
        const communicationsentCount = dataItem?.communicationsentCount ?? dataItem?.blastedCount ?? 0;

        navigate(
            `${'/audience/create-target-list?targetListId='}${segmentationListID}&listType=${listType}&communicationsentCount=${encodeURIComponent(
                String(communicationsentCount),
            )}`,
            {
                state: {
                    mode: 'edit',
                    segmentationListID: segmentationListID,
                    recipientsBunchName: recipientsBunchName,
                },
            },
        );
    };

    const handleView = (dataItem) => {
        const listType = dataItem?.listType;
        const segmentationListID = dataItem?.segmentationListID;
        const recipientsBunchName = dataItem?.recipientsBunchName;

        // For listType === 16, navigate to view mode
        if (listType === 16) {
            const communicationsentCount = dataItem?.communicationsentCount ?? dataItem?.blastedCount ?? 0;
            navigate(
                `${'/audience/create-target-list?targetListId='}${segmentationListID}&listType=${listType}&communicationsentCount=${encodeURIComponent(
                    String(communicationsentCount),
                )}`,
                {
                    state: {
                        mode: 'view',
                        segmentationListID: segmentationListID,
                        recipientsBunchName: recipientsBunchName,
                    },
                },
            );
        } else {
            setAudienceView({
                listId: segmentationListID,
                listName: recipientsBunchName,
                listType: listType,
                status: true,
            });
        }
    };

    const handleApproval = (dataItem) => {
        const listType = dataItem?.listType;
        const segmentationListID = dataItem?.segmentationListID;
        const recipientsBunchName = dataItem?.recipientsBunchName;
        const approverStatus = dataItem?.approverStatus;
        const communicationsentCount = dataItem?.communicationsentCount ?? dataItem?.blastedCount ?? 0;

        navigate(
            `${'/audience/create-target-list?targetListId='}${segmentationListID}&listType=${listType}&rfa=true&approval=${approverStatus}&communicationsentCount=${encodeURIComponent(
                String(communicationsentCount),
            )}`,
            {
                state: {
                    mode: 'rfa',
                    segmentationListID: segmentationListID,
                    recipientsBunchName: recipientsBunchName,
                },
            },
        );
    };

    const handleDuplicate = (dataItem) => {
        // Show duplicate modal
        setDuplicateModal({
            show: true,
            selectedList: dataItem,
        });
    };

    const handleDuplicateSubmit = async (newListName) => {
        setIsDuplicating(true);
        try {
            const payload = {
                departmentId,
                clientId,
                userId,
                ListId: duplicateModal?.selectedList?.segmentationListID,
                ListName: newListName,
            };

            const { status } = await dispatch(duplicateTargetList(payload, false));

            if (status) {
                const firstPagePayload = {
                    ...params,
                    departmentId,
                    clientId,
                    userId,
                    pagination: {
                        ...(params?.pagination || {}),
                        pageNo: 1,
                    },
                };

                setParams((prev) => ({
                    ...prev,
                    pagination: {
                        ...(prev?.pagination || {}),
                        pageNo: 1,
                    },
                }));
                setPageConfig((prev) => ({
                    ...prev,
                    [listTypeView ? 'listPageNo' : 'gridPageNo']: 1,
                }));
                setPagerPageConfig((prev) => ({ ...prev, skip: 0 }));

                await dispatch(getTargetListView(firstPagePayload));
                setDuplicateModal({ show: false, selectedList: {} });
            }
        } finally {
            setIsDuplicating(false);
        }
    };

    const handleDownload = (dataItem) => {
        setPopStatus((pre) => ({ pre, selectedList: dataItem, infoStatus: false }));
        setDownloadModal(true);
    };

    const handleCGTG = (dataItem) => {
        setPopStatus((pre) => ({ pre, selectedList: dataItem, infoStatus: false }));
        setTooltipStatus((pre) => ({ ...pre, cgtgStatus: true }));
    };

    const navigateToAddAudience = (dataItem, type) => {
        const state = {
            type,
            from: 'targetList',
            mode: 'inputList',
            segmentationListID: dataItem.segmentationListID,
            recipientsBunchName: dataItem.recipientsBunchName,
        };
        const encodedState = encodeUrl(state);
        navigate(`/audience/add-audience?q=${encodedState}`, { state });
    };

    const handleMatchList = (dataItem) => {
        navigateToAddAudience(dataItem, 'match-list');
    };

    const handleSuppressionList = (dataItem) => {
        navigateToAddAudience(dataItem, 'suppression-list');
    };

    const handleRemoveList = (dataItem) => {
        setWarningModal((prev) => ({
            ...prev,
            show: true,
            data: dataItem,
        }));
    };

    const removeSeedListData = async (dataItem) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            listId: dataItem?.segmentationListID,
        };
        let res = await dispatch(removeSeedlist(payload));
        if (res?.status) {
            setWarningModal((prev) => ({
                ...prev,
                show: false,
                data: {},
            }));
            setTimeout(() => {
                window.location.reload();
            }, 1);
        }
    };

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        const page = skip === 0 ? 1 : skip / take + 1;

        const nextState = data?.dataState ? data.dataState : data;
        const nextTake = nextState?.take ?? pageInitialValue?.take ?? 5;
        const nextSkip = nextState?.skip ?? 0;
        const size = nextSkip === 0 ? 1 : nextSkip / nextTake + 1;

        // ✅ Pass as object
        get_Pagination({
            pageNo: page,
            pageSize: take,
        });

        setParams((prev) => ({
            ...prev,
            filteration: {
                ...prev.filteration,
                searchBy:
                    data?.dataState?.filter?.filters?.map((e) => e.filters)[0]?.map((i) => i.field)[0] ===
                    'recipientsBunchName'
                        ? 'List name'
                        : '',
                searchValue:
                    data?.dataState?.filter?.filters
                        ?.map((e) => e.filters)[0]
                        ?.map((i) => i.value)
                        ?.toString() || '',
            },
            pagination: {
                pageNo: page,
                pageSize: take,
            },
        }));

        setPageConfig((prev) => ({
            ...prev,
            gridSize: take,
            gridPageNo: page,
        }));

        setInitialGridPagination(false);
    };

    useSkipFirstRender(() => {
        setParams((pre) => ({
            ...pre,
            pagination: {
                pageNo: 1,
                pageSize: pageSize,
            },
        }));
        setPageConfig((prev) => ({
            ...prev,
            gridSize: pageSize,
            gridPageNo: 1,
        }));
        setInitialGridPagination(true);
    }, [pageSize]);

    const handlePageSizeChange = (dataState) => {
        const { skip, take } = dataState;
        const size = skip === 0 ? 1 : skip / take + 1;

        setParams((prev) => ({
            ...prev,
            pagination: {
                pageNo: size,
                pageSize: take,
            },
        }));
        setPageConfig((prev) => ({
            ...prev,
            gridSize: take,
            gridPageNo: size,
        }));
    };

    return (
        <Fragment>
            <div className="position-relative">
                {/* {(listLoading || listFailure) && (
                    <div className={"rs-planner-skeleton-overlay"} >
                        <div className='p1'>
                            <RSSkeletonTable text={!listLoading} />
                        </div>
                    </div>
                )} */}
                <CustomKendoGrid
                        data={targetListView}
                        column={GRID_COLUMN_CONFIG(
                            handleRemoveList,
                            handleInfo,
                            handleDuplicate,
                            handleDownload,
                            handleCGTG,
                            handleMatchList,
                            handleSuppressionList,
                            handleEdit,
                            handleApproval,
                            handleView,
                            handleDataAugmentation,
                            handleDataArchive,
                        )}
                        pageable={true}
                        settings={{ total: totalListCount }}
                        isDataStateRequired
                        onDataStateChange={(data) => handlePagerChange(data)}
                        setInitialPagination={setInitialGridPagination}
                        pagerChange={initialGridPagination}
                        filterable={true}
                        onPageSizeChange={handlePageSizeChange}
                        isLoading={listLoading}
                        loadResetKey={listTypeView ? 'card' : 'grid'}
                    />
            </div>

            {popupStatus.infoStatus && (
                <TargetInfo
                    bunchName={popupStatus.selectedList?.recipientsBunchName}
                    audienceId={popupStatus.selectedList?.segmentationListID}
                    createdBy={popupStatus.selectedList?.createdName}
                    modifiedDate={popupStatus.selectedList?.modifiedDate}
                    createdDate={popupStatus.selectedList?.createdDate}
                    segmentInfoModal={popupStatus.infoStatus}
                    list={popupStatus.selectedList}
                    handleClose={() => {
                        setPopStatus((pre) => ({ pre, infoStatus: false }));
                    }}
                />
            )}

            {downloadModal && (
                <DownloadRecords
                    showPopup={downloadModal}
                    audienceValue={popupStatus.selectedList}
                    handleClose={setDownloadModal}
                />
            )}

            {tooltipStatus.cgtgStatus && (
                <TooltipCGTG
                    show={tooltipStatus.cgtgStatus}
                    onHide={() => setTooltipStatus((pre) => ({ ...pre, cgtgStatus: false }))}
                    listId={popupStatus.selectedList?.segmentationListID}
                    watch={watch}
                    control={control}
                    cgValue={popupStatus.selectedList?.cg}
                    tgValue={popupStatus.selectedList?.tg}
                    initialCgtgEnabled={popupStatus.selectedList?.isCGTGEnabled}
                />
            )}
            <RSConfirmationModal
                show={warningModal?.show}
                handleConfirm={(status) => {
                    if (status) {
                        removeSeedListData(warningModal?.data);
                    }
                }}
                handleClose={() => {
                    setWarningModal((prev) => ({
                        ...prev,
                        show: false,
                        data: {},
                    }));
                }}
            />
            {duplicateModal?.show && (
                <DuplicateModal
                    show={duplicateModal?.show}
                    onHide={() => setDuplicateModal({ show: false, selectedList: {} })}
                    selectedList={duplicateModal?.selectedList}
                    onDuplicate={handleDuplicateSubmit}
                />
            )}
            {dataAugmentModal?.show && (
                <DataAugmentation
                    show={dataAugmentModal?.show}
                    handleClose={(status) => {
                        if (!status) {
                            setDataAugmentModal({
                                show: false,
                                dataItem: {},
                            });
                        } else {
                            setDataAugmentModal({
                                show: false,
                                dataItem: {},
                            });
                            setDataSyncmodal(true);
                        }
                    }}
                    list={dataAugmentModal?.dataItem}
                />
            )}
            {dataSyncmodal && (
                <RSConfirmationModal
                    show={dataSyncmodal}
                    handleConfirm={(status) => {
                        setDataSyncmodal(false);
                    }}
                    handleClose={() => {
                        setDataSyncmodal(false);
                    }}
                    htmlContent={
                        <>
                            <div className="d-flex justify-content-center">
                                <i className={`${circle_time_large} font-xxl`} />
                            </div>
                            <div className="d-flex justify-content-center mt15 text-center">
                                {'Data sync is currently in progress. Estimated to be completed in 3 hours'}
                            </div>
                        </>
                    }
                    header={DATA_SYNC_STATUS}
                />
            )}

            {dataArchiveModal.show && (
                <RSConfirmationModal
                    show={dataArchiveModal.show}
                    text={
                        dataArchiveModal?.dataItem?.isArchived
                            ? 'Are you sure you want to unarchive?'
                            : ARE_YOU_SURE_ARCHIVE
                    }
                    primaryButtonText={OK}
                    handleClose={() => setDataArchiveModal({ show: false, dataItem: {} })}
                    handleConfirm={() => {
                       handleDataArchiveSubmit(dataArchiveModal?.dataItem);
                    }}
                    isCloseButton={false}
                />
            )}
        </Fragment>
    );
};

export default TargetGridView;
