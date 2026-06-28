import { GRID_COLUMN_CONFIG } from './constant';
import { ARE_YOU_SURE_ARCHIVE, OK } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import CustomKendoGrid from 'Components/RSCustomKendoGrid';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import SegmentInfo from '../SegmentInfo';
import DownloadRecords from '../../../TargetList/Components/DownloadRecords/DownloadRecords';
import DuplicateModal from './DuplicateModal';
import { postDuplicateDynamicList } from 'Reducers/audience/dynamicList/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';
import { updateArchivalStatus } from 'Reducers/audience/targetList/request';
import RSConfirmationModal from 'Components/ConfirmationModal';
import dynamicListInitialState from 'Reducers/audience/dynamicList/initialState';
const DynamicGridView = ({
    setParams,
    setPageConfig,
    initialGridPagination,
    setInitialGridPagination,
    listTypeView,
    params,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dynamicListView, listLoading, listFailure } = useSelector(
        (state) => state?.dynamicListReducer ?? dynamicListInitialState,
    );
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { height, pageSize } = useWindowSize();

    // State for modals and popups
    const [infoModal, setInfoModal] = useState({ show: false, data: {} });
    const [downloadModal, setDownloadModal] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState({ show: false, data: {} });
    const [isDuplicating, setIsDuplicating] = useState(false);
       const [archiveModal, setArchiveModal] = useState({
        show: false,
        selectedList: {},
    });
    // Handler functions for actions
    const handleInfo = (dataItem) => {
        setInfoModal({ show: true, data: dataItem });
    };

    const handleEdit = (dataItem) => {
        const dynamicListId = dataItem?.dynamicListId;
        const dynamicListName = dataItem?.dynamicListName;
        const view_Edit = dataItem?.isAdhoclist || dataItem?.isRequestApproval === 0 || dataItem?.createdBy !== userId;
        
        navigate(
            `${'/audience/create-dynamic-list?DynamicListId='}${dynamicListId}&view=${view_Edit}`,
            {
                state: {
                    mode: 'edit',
                    dynamicListId: dynamicListId,
                    dynamicListName: dynamicListName,
                },
            },
        );
    };

    const handleApproval = (dataItem) => {
        const dynamicListId = dataItem?.dynamicListId;
        const dynamicListName = dataItem?.dynamicListName;
        const approverStatus = dataItem?.approverStatus;
        const isRequestApproval = dataItem?.isRequestApproval;
        
        if (isRequestApproval === 1) {
            navigate(
                `${'/audience/create-dynamic-list?DynamicListId='}${dynamicListId}&rfa=true&approverStatus=${approverStatus}`,
                {
                    state: {
                        mode: 'edit',
                        dynamicListId: dynamicListId,
                        dynamicListName: dynamicListName,
                    },
                },
            );
        }
    };

    const handleDuplicate = (dataItem) => {
        setDuplicateModal({ show: true, data: dataItem });
    };

    const onDuplicate = async (newListName) => {
        setIsDuplicating(true);
        try {
            const payload = {
                listName: newListName,
                duplicateDynamicListId: duplicateModal?.data?.dynamicListId,
                departmentId,
                clientId,
                userId,
            };

            const firstPageParams = {
                ...params,
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
                gridPageNo: 1,
            }));
            setInitialGridPagination(false);

            const response = await dispatch(
                postDuplicateDynamicList({ payload, params: firstPageParams, loading: false }),
            );

            if (response?.status) {
                setDuplicateModal({ show: false, data: {} });
            }
        } finally {
            setIsDuplicating(false);
        }
    };

    const handleDownload = (dataItem) => {
        setDownloadModal(true);
    };
    const handleArchive = (dataItem) => {
        setArchiveModal({ show: true, selectedList: dataItem });
    }
 const handleDataArchiveSubmit = async (dataItem) => {
            const payload = {
                departmentId,
                clientId,
                tableName: 'dynamiclists',
                listId: [dataItem.dynamicListId],
                isArchived: true,
            };
            const res = await dispatch(updateArchivalStatus(payload));
            if (res?.status) {
               // await handleReload();;
                setArchiveModal({ show: false, selectedList: {} });
            }
        };
    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        const size = skip === 0 ? 1 : skip / take + 1;
        setPageConfig((prev) => ({
            ...prev,
            gridSize: take,
            gridPageNo: size,
        }));
        setParams((prev) => ({
            ...prev,
            pagination: {
                pageNo: size,
                pageSize: take,
            },
        }));
        setInitialGridPagination(false);
    };

    useSkipFirstRender(() => {
        setParams((prev) => ({
            ...prev,
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
        
        setPageConfig((prev) => ({
            ...prev,
            gridSize: take,
            gridPageNo: size,
        }));
        setParams((prev) => ({
            ...prev,
            pagination: {
                pageNo: size,
                pageSize: take,
            },
        }));
    };

    return (
        <Fragment>
            <div className='position-relative'>
                {/* {(listLoading || listFailure) && (
                    <div className={"rs-planner-skeleton-overlay"} >
                        <div className='p1'>
                            <RSSkeletonTable text={!listLoading} />
                        </div>
                    </div>
                )} */}
                <CustomKendoGrid
                        data={dynamicListView?.listData}
                        column={GRID_COLUMN_CONFIG(
                            handleInfo,
                            handleEdit,
                            handleApproval,
                            handleDuplicate,
                            handleDownload,
                            userId,handleArchive
                        )}
                        settings={{ total: dynamicListView?.count }}
                        isDataStateRequired
                        pageable={true}
                        pagerChange={initialGridPagination}
                        setInitialPagination={setInitialGridPagination}
                        onDataStateChange={(data) => handlePagerChange(data)}
                        filterable={true}
                        onPageSizeChange={handlePageSizeChange}
                        isLoading={listLoading}
                        loadResetKey={listTypeView ? 'card' : 'grid'}
                    />
            </div>

            {/* Info Modal */}
            {infoModal.show && (
                <SegmentInfo
                    handleClose={() => setInfoModal({ show: false, data: {} })}
                    listInfoModal={infoModal.show}
                    viewData={infoModal.data}
                />
            )}

            {/* Download Modal */}
            {downloadModal && (
                <DownloadRecords
                    showPopup={downloadModal}
                    isDynamic
                    audienceValue={duplicateModal?.data}
                    handleClose={setDownloadModal}
                />
            )}

            {/* Duplicate Modal */}
            {duplicateModal?.show && (
                <DuplicateModal
                    show={duplicateModal?.show}
                    onHide={() => {
                        if (isDuplicating) return;
                        setDuplicateModal({ show: false, data: {} });
                    }}
                    selectedList={duplicateModal?.data}
                    onDuplicate={onDuplicate}
                    isDuplicating={isDuplicating}
                />
            )}
                  {archiveModal.show && (
                                        <RSConfirmationModal
                                            show={archiveModal.show}
                                            text={ARE_YOU_SURE_ARCHIVE}
                                            primaryButtonText={OK}
                                            handleClose={() => setArchiveModal({ show: false, selectedList: {} })}
                                            handleConfirm={() => {
                                               handleDataArchiveSubmit(archiveModal?.selectedList);
                                            }}
                                            isCloseButton={false}
                                            isDuplicating={isDuplicating}
                />
                                    )}
        </Fragment>
    );
};

export default DynamicGridView;
