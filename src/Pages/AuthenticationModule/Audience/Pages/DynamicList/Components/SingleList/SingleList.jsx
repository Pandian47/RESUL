import { convertObjectToBase64 } from 'Utils/modules/crypto';
import { formatNumber } from 'Utils/modules/campaignUtils';
import { numberWithCommas, formatPercentageDisplay } from 'Utils/modules/formatters';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { NAME_CANNOT_BE_EMPTY } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';
import { INITIAL_STATE, STATE_REDUCER } from '../../../DynamicListCreation/constant';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { ARE_YOU_SURE_ARCHIVE, AVG_AUDIENCE, COMMUNICATION_SEND, CREATED_BY, DYNAMICLIST_NAME, EDIT, MODIFIED_BY, MORE, NO_COMMUNICATIONS_BLASTED, OK, PENDING_FOR_APPROVAL, PROJECTED, REACH_RATE, REQUEST_APPROVED, REQUEST_REJECTED, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { approved_medium, circle_info_medium, circle_pencil_medium, close_mini, duplicate_medium, eye_medium, menu_dot_medium, pending_medium, reject_medium, save_mini, user_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useReducer, useState } from 'react';
import { Col } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';


import { postDuplicateDynamicList, getDynamicListsData } from 'Reducers/audience/dynamicList/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import RSTooltip from 'Components/RSTooltip';
import SegmentInfo from '../SegmentInfo';
import { DynamicListContext } from '../..';
import DuplicateModal from '../DynamicGridView/DuplicateModal';

import RSConfirmationModal from 'Components/ConfirmationModal';
import { getAudienceFooterData } from '../../constant';
import DownloadRecords from '../../../TargetList/Components/DownloadRecords/DownloadRecords';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';

import { updateArchivalStatus } from 'Reducers/audience/targetList/request';
const SingleList = ({ list, type, duplicate, setDuplicate, setPageState, params, SetheadrerView }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [downloadModal, setDownloadModal] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState({
        show: false,
        selectedList: {},
    });
    const [isDuplicating, setIsDuplicating] = useState(false);
    const archiveStatusAPI = useApiLoader({ autoFetch: false });
      const [archiveModal, setArchiveModal] = useState({
        show: false,
        selectedList: {},
    });
    const methods = useForm();
    const {
        control,
        handleSubmit,
        reset,
        watch,
        getValues,
        setValue,
        formState: { isValid, errors },
    } = methods;

    const { setPagerPageConfig, setIsClearSearch } = useContext(DynamicListContext);
    const dynamicListName = list.dynamicListName;
    const dynamicListId = list.dynamicListId;
    const createdBy = list.modifiedDate === '' ? list.createdName : list.modifiedName;
    const createdDate = list.modifiedDate === '' ? list.createdDate : list.modifiedDate;
    const view_Edit =
        list?.isAdhoclist || (!list?.isAdhoclist && !list?.isRequestApproval === 0) || list?.createdBy !== userId;
    const recipientCount = list.audienceCount;
    const recipientPercentage = list.audiencePercentage;
    const hasRecipientPercentage =
        recipientPercentage !== '' && recipientPercentage !== undefined && recipientPercentage !== null;
    const formattedRecipientPercentage = hasRecipientPercentage
        ? formatPercentageDisplay(String(recipientPercentage).replace('%', '').trim())
        : null;
    const status = list.status;
    const usersIcon = list.usersIcon;
    const blastedCount = list.blastedCount;
    // const ApproverStatus = list.approverStatus === 1 ? true : false; //approverstatus = 0(allow to approve/reject), 1(approved), 2(rejected)
    const ApproverStatus = list.isRequestApproval === 1 ? true : false;

    const [state, dispatchState] = useReducer(STATE_REDUCER, INITIAL_STATE);
    // OLD CODE - Inline duplicate functionality
    // const [duplicateInput, setDuplicateInput] = useState('');
    // const newName = watch('dynamicListName');
    // const [showElement, setShowElement] = useState(true);
    // const submitSegmentDetails = async () => {
    //     if (isValid) {
    //         const payload = {
    //             listName: newName,
    //             duplicateDynamicListId: dynamicListId,
    //             departmentId,
    //             clientId,
    //             userId,
    //         };
    //         const { pagination, ...rest } = params;
    //         const tempParams = {
    //             ...rest,
    //             pagination: { pageNo: 1, pageSize: 9 },
    //         };
    //         setPagerPageConfig((pre) => ({
    //             ...pre,
    //             skip: 1,
    //         }));

    //         const res = await dispatch(postDuplicateDynamicList({ payload, params: tempParams }));
    //         if (!res?.status) {
    //             setPageState((prev) => {
    //                 const temp = [...prev];
    //                 temp.shift();
    //                 return temp;
    //             });
    //         }
    //         setIsClearSearch(true);
    //         setDuplicate(false);
    //         SetheadrerView(false);
    //         reset();
    //     }
    // };

    // const onDuplicate = (listName) => {
    //     const temp = { ...list };
    //     temp.duplicate = true;
    //     setDuplicate(true);
    //     SetheadrerView(true);
    //     setPageState((prev) => {
    //         const tList = [...prev];
    //         tList.unshift(temp);
    //         return tList;
    //     });
    //     setValue('dynamicListName', listName);
    // };
    // useEffect(() => {
    //     if (state?.isValidListname) {
    //          setShowElement(false);
    //     } else {
    //         setShowElement(true);
    //     }
    // }, [state]);

    // NEW CODE - Modal duplicate functionality
    const onDuplicate = () => {
        setDuplicateModal({
            show: true,
            selectedList: list,
        });
    };
  const onArchive = () => {
        setArchiveModal({
            show: true,
            selectedList: list,
        });
    };
     const handleDataArchiveSubmit = async (dataItem) => {
        const payload = {
            departmentId,
            clientId,
            tableName: 'dynamiclists',
            listId: [dataItem.dynamicListId],
            isArchived: !dataItem?.isArchived,
        };
        const res = await archiveStatusAPI.refetch({
            fetcher: () => dispatch(updateArchivalStatus(payload, false)),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
        });
        if (res?.status) {
            await dispatch(
                getDynamicListsData({
                    ...params,
                    departmentId,
                    clientId,
                    userId,
                }),
            );
            setArchiveModal({ show: false, selectedList: {} });
        }
    };
          
    const handleDuplicateSubmit = async (newListName) => {
        setIsDuplicating(true);
        try {
            const payload = {
                listName: newListName,
                duplicateDynamicListId: dynamicListId,
                departmentId,
                clientId,
                userId,
            };
            const { pagination, ...rest } = params;
            const tempParams = {
                ...rest,
                pagination: { pageNo: 1, pageSize: pagination?.pageSize ?? 9 },
            };

            setPagerPageConfig((pre) => ({
                ...pre,
                skip: 0,
            }));

            const res = await dispatch(
                postDuplicateDynamicList({ payload, params: tempParams, loading: false }),
            );

            if (res?.status) {
                setIsClearSearch(true);
                setDuplicate(false);
                SetheadrerView(false);
                setDuplicateModal({
                    show: false,
                    selectedList: {},
                });
            }
        } finally {
            setIsDuplicating(false);
        }
    };
    const TLUserName = list.createdName;
    const TLUserModifiName = list.modifiedName;

    const renderCountWithTooltip = (count) => {
        const numericCount = Number(count);
        const formattedCount = formatNumber(count);
        if (!isNaN(count) && numericCount >= 1000) {
            return (
                <RSTooltip text={numberWithCommas(count)} position="top">
                    <span>{formattedCount}</span>
                </RSTooltip>
            );
        }
        return !isNaN(count) ? formattedCount : count;
    };

    return (
        <FormProvider {...methods}>
            <Col sm={4}>
                <div
                    className={
                        duplicate && !list.duplicate
                            ? `rs-card-bottom-sep rc-tl ${status} pe-none click-off`
                            : `rs-card-bottom-sep rc-tl ${status} `
                    }
                >
                    <div className="rc-top">
                        <div className="rci-list-name">
                            {/* OLD CODE - Inline duplicate form */}
                            {/* {duplicate && list.duplicate ? (
                                        <form onSubmit={handleSubmit(submitSegmentDetails)}>
                                            <div className="align-items-center d-flex justify-content-between editNameFieldContainer my14">
                                                <div className="editNameField">
                                                    <ListNameExists
                                                        name="dynamicListName"
                                                        field="listName"
                                                        onValid={(status) => {
                                                            if (status) {
                                                                dispatchState({
                                                                    type: 'UPDATE',
                                                                    payload: true,
                                                                    field: 'isValidListname',
                                                                });
                                                                setTimeout(function () {
                                                                    setShowElement(true);
                                                                }, 3002);
                                                            } else {
                                                                dispatchState({
                                                                    type: 'UPDATE',
                                                                    payload: false,
                                                                    field: 'isValidListname',
                                                                });
                                                            }
                                                        }}
                                                        apiCallback={isListNameExist}
                                                        condition={({ status }) => {
                                                            return !status;
                                                        }}
                                                        placeholder={DYNAMICLIST_NAME}
                                                        rules={LIST_NAME_RULES(NAME_CANNOT_BE_EMPTY)}
                                                        defaultValue={list?.dynamicListName}
                                                        customErrorMessage={NAME_CANNOT_BE_EMPTY}
                                                        maxLength={MAX_LENGTH50}
                                                    />
                                                    {showElement && (
                                                        <RSTooltip position="top" text="Cancel">
                                                            <i
                                                                className={`${close_mini} font-xxs color-primary-red m0`}
                                                                id="rs_SingleList_close"
                                                                onClick={() => {
                                                                    setPageState((prev) => {
                                                                        const temp = [...prev];
                                                                        temp.shift();
                                                                        return temp;
                                                                    });
                                                                    setDuplicate(false);
                                                                    SetheadrerView(false);
                                                                    reset();
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    )}
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!state.isValidListname}
                                                    className={!state.isValidListname ? 'click-off' : ''}
                                                >
                                                    <RSTooltip position="top" text="Save">
                                                        <i
                                                            id="rs_SingleList_save"
                                                            className={`${save_mini} icon-xs color-primary-blue m0`}
                                                        ></i>
                                                    </RSTooltip>
                                                </button>
                                            </div>
                                        </form>
                                    ) : ( */}
                            {dynamicListName?.length > 35 ? (
                                <RSTooltip text={dynamicListName} position="top">
                                    <h4 className="mb0">{truncateTitle(dynamicListName, 35)}</h4>
                                </RSTooltip>
                            ) : (
                                <h4 className="mb0">{dynamicListName}</h4>
                            )}
                            {/* )} */}
                        </div>
                    </div>
                    <div className="rc-top">
                        <span className="rct-cb">
                            {(list?.modifiedDate && !list?.modifiedName) ||
                            list.modifiedDate === 'NaT' ||
                            list.modifiedDate === null ? (
                                <>
                                    <span className="rctcb-by-text">{CREATED_BY}: </span>
                                    {/* <span className="rctcb-by-name">{list.createdName}</span> */}
                                    {TLUserName?.length > 13 ? (
                                        <RSTooltip text={TLUserName} position="top" className="d-inline-block">
                                            <span className="rctcb-by-name">{TLUserName.substring(0, 13) + '...'}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span className="rctcb-by-name">{TLUserName}</span>
                                    )}

                                    {moment(list.createdDate).isValid() && (
                                        <>
                                        <span className='d-inline-block my-3 mx7' style={{width: "1px", height:'14px', borderRight: 'solid 1px #666666'}}></span>
                                        <span className="rctcb-by-date tl-left-border">
                                            {/* {getUserDateTimeFormat(list.createdDate + ' UTC', 'formatDateTime')} */}
                                            {/* {getUserCurrentFormat(list.createdDate + ' UTC')?.dateTimeFormat} */}
                                            {getUserCurrentFormat(list.createdDate, { isOffset: true })?.utcformat}
                                        </span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="rctcb-by-text">{MODIFIED_BY}: </span>
                                    {/* <span className="rctcb-by-name">{list.modifiedName}</span> */}
                                    {TLUserModifiName?.length > 13 ? (
                                        <RSTooltip text={TLUserModifiName} position="top" className="d-inline-block">
                                            <span className="rctcb-by-name">
                                                {TLUserModifiName.substring(0, 13) + '...'}
                                            </span>
                                        </RSTooltip>
                                    ) : (
                                        <span className="rctcb-by-name">{TLUserModifiName}</span>
                                    )}

                                    {moment(list.modifiedDate).isValid() && (
                                        <>
                                        <span className='d-inline-block my-3 mx7' style={{width: "1px", height:'14px', borderRight: 'solid 1px #666666'}}></span>
                                        <span className="rctcb-by-date 1 tl-left-border">
                                            {/* {getUserDateTimeFormat(
                                                        list.modifiedDate + ' UTC',
                                                        'formatDateTime',
                                                    )} */}
                                            {getUserCurrentFormat(list.modifiedDate, { isOffset: true })?.utcformat}
                                        </span>
                                        </>
                                    )}
                                </>
                            )}
                        </span>
                    </div>
                    <div className="rc-info pt5">
                        {!list.duplicate && createdBy !== 'Admin' && (
                            <div className="rci-list-id">{convertObjectToBase64(dynamicListId)}</div>
                        )}
                    </div>
                    <div className="rc-info">
                        <div className="rs-table-row">
                            <div className="rstr-cell rstrc-left">
                                {/* OLD CODE - Conditional list ID display */}
                                {/* {!list.duplicate && createdBy !== 'Admin' && (
                                    <div className="rci-list-id">{convertObjectToBase64(dynamicListId)}</div>
                                )} */}

                                <div className="rci-content-block top20">
                                    {usersIcon && <div className="rci-users-icon"></div>}

                                    {/* <div className={`rci-text ${isNaN(recipientCount) ? 'rci-inprogress-text' : ''}`}>
                                        <span>
                                            {!isNaN(recipientCount)
                                                ? AVG_AUDIENCE + ': ' + numberWithCommas(recipientCount)
                                                : recipientCount}
                                        </span>
                                    </div> */}
                                    <div className="clearfix"></div>
                                    <div className="rci-text">
                                        <span>
                                            {COMMUNICATION_SEND}: <span className='font-bold'>{renderCountWithTooltip(blastedCount)}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="rstr-cell rstrc-right">
                                {blastedCount === 0 ? (
                                    <Fragment>
                                        <span className="rcit-avg">{NO_COMMUNICATIONS_BLASTED}</span>
                                        {/* <div className="cardInfo">
                                            <RSTooltip position="top" text="Info">
                                                <i
                                                    className={`${circle_info_medium} icon-md`}
                                                    onClick={() =>
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: true,
                                                            field: 'listInfoModal',
                                                        })
                                                    }
                                                />
                                            </RSTooltip>
                                        </div> */}
                                    </Fragment>
                                ) : (
                                    <div className="rci-text">
                                        <span className="rcit-avg">
                                            <span>{PROJECTED} </span>
                                            {REACH_RATE}
                                        </span>

                                        <div className="rcit-number">
                                            <span
                                                className={`rcitn-number ${!hasRecipientPercentage ? 'na' : ''}`}
                                            >
                                                {hasRecipientPercentage ? formattedRecipientPercentage : 'NA'}
                                            </span>
                                            <span className="rcitn-per">
                                                {hasRecipientPercentage ? '%' : ''}
                                            </span>
                                        </div>
                                        {/* <div className="cardInfo">
                                            <RSTooltip position="top" text="Info">
                                                <i
                                                    className={`${circle_info_medium} icon-md`}
                                                    onClick={() =>
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: true,
                                                            field: 'listInfoModal',
                                                        })
                                                    }
                                                />
                                            </RSTooltip>
                                        </div> */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="rc-bottom">
                        <div className="cardInfo">
                            <RSTooltip position="top" text="Info">
                                <div className={status !== 'completed' ? 'pe-none click-off' : undefined}>
                                    <i
                                        id="rs_data_circle_info"
                                        className={`${circle_info_medium} icon-md`}
                                        onClick={() =>
                                            dispatchState({
                                                type: 'UPDATE',
                                                payload: true,
                                                field: 'listInfoModal',
                                            })
                                        }
                                    />
                                </div>
                            </RSTooltip>
                        </div>
                        <ul
                            className={
                                duplicate && list.duplicate
                                    ? `rs-list-inline rli-al text-right pe-none click-off`
                                    : `rs-list-inline rli-al text-right`
                            }
                        >
                            <>
                                <li>
                                    <RSTooltip
                                        position="top"
                                        text={`${view_Edit ? VIEW : EDIT}`}
                                    >
                                        <div className={dynamicListName === 'All audience' ? 'pe-none click-off' : ''}>
                                            <i
                                                id="rs_data_circle_pencil"
                                                className={`${
                                                    view_Edit ? eye_medium : circle_pencil_medium
                                                } icon-md`}
                                                onClick={() =>
                                                    navigate(
                                                        `${'/audience/create-dynamic-list?DynamicListId='}${dynamicListId}&view=${view_Edit}`,
                                                        {
                                                            state: {
                                                                mode: 'edit',
                                                                dynamicListId: dynamicListId,
                                                                dynamicListName: dynamicListName,
                                                            },
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    </RSTooltip>
                                </li>
                                <li>
                                    <RSTooltip
                                        position="top"
                                        text={`${
                                            list?.approverStatus === 0
                                                ? PENDING_FOR_APPROVAL
                                                : list?.approverStatus === 1
                                                ? REQUEST_APPROVED
                                                : REQUEST_REJECTED
                                        }`}
                                    >
                                        <div className={list?.isRequestApproval === 0 ? 'pe-none click-off' : ''}>
                                            <i
                                                onClick={() => {
                                                    ApproverStatus &&
                                                        navigate(
                                                            `${'/audience/create-dynamic-list?DynamicListId='}${dynamicListId}&rfa=true&approverStatus=${
                                                                list.approverStatus
                                                            }`,
                                                            {
                                                                state: {
                                                                    mode: 'edit',
                                                                    dynamicListId: dynamicListId,
                                                                    dynamicListName: dynamicListName,
                                                                },
                                                            },
                                                        );
                                                }}
                                                className={`${
                                                    list.isRequestApproval === 0
                                                        ? user_medium
                                                        : list.approverStatus === 0
                                                        ? pending_medium
                                                        : list.approverStatus === 1
                                                        ? approved_medium
                                                        : reject_medium
                                                }  
                                                 icon-md `}
                                            />
                                        </div>
                                    </RSTooltip>
                                </li>
                                <li>
                                    {/* //Throwing Error here because of the dropdown pass ref error */}

                                    {/* <RSTooltip position="top" text={'Duplicate'}>
                                        <i
                                            id="rs_SingleList_duplicate"
                                            className={`${duplicate_medium} color-primary-blue icon-md`}
                                            onClick={() => onDuplicate()}
                                        />
                                    </RSTooltip> */}

                                    <BootstrapDropdown
                                        data={getAudienceFooterData(list?.isArchived)}
                                        flatIcon
                                        defaultItem={
                                            <RSTooltip position="top" text={MORE}>
                                                <i
                                                    id="rs_data_menu_dot"
                                                    className={`${menu_dot_medium} 
                                                        color-primary-blue icon-md`}
                                                />
                                            </RSTooltip>
                                        }
                                        showUpdate={false}
                                        onSelect={(e) => {
                                            if (e === 'Download') {
                                                setDownloadModal(true);
                                            } else if (e === 'Duplicate') {
                                                onDuplicate(list.dynamicListName);
                                            } else if (e === 'Archive'|| e === 'Unarchive') {
                                                onArchive(list);
                                            }                                            
                                        }}
                                        className="no_caret"
                                    />
                                </li>
                            </>
                            {/* <li>
                                <RSTooltip position="top" text="Info">
                                    <i
                                        className={`${circle_info_medium} icon-md`}
                                        onClick={() =>
                                            dispatchState({
                                                type: 'UPDATE',
                                                payload: true,
                                                field: 'listInfoModal',
                                            })
                                        }
                                    />
                                </RSTooltip>
                            </li> */}
                        </ul>
                    </div>
                </div>
            </Col>
            {/* Modals */}
            {state.listInfoModal && (
                // <div className="overlayCSS">
                //     <div className="fade modal-backdrop show"></div>
                //     </div>
                <SegmentInfo
                    handleClose={() =>
                        dispatchState({
                            type: 'UPDATE',
                            payload: false,
                            field: 'listInfoModal',
                        })
                    }
                    listInfoModal={state.listInfoModal}
                    viewData={list}
                />
            )}
            {downloadModal && (
                <DownloadRecords
                    showPopup={downloadModal}
                    isDynamic
                    audienceValue={list}
                    handleClose={setDownloadModal}
                />
            )}

            {duplicateModal?.show && (
                <DuplicateModal
                    show={duplicateModal?.show}
                    onHide={() => {
                        if (isDuplicating) return;
                        setDuplicateModal({ show: false, selectedList: {} });
                    }}
                    selectedList={duplicateModal?.selectedList}
                    onDuplicate={handleDuplicateSubmit}
                    isDuplicating={isDuplicating}
                />
            )}
             {archiveModal.show && (
                                        <RSConfirmationModal
                                            show={archiveModal.show}
                                           text={
                                                                               archiveModal?.selectedList?.isArchived
                                                                                   ? 'Are you sure you want to unarchive?'
                                                                                   : ARE_YOU_SURE_ARCHIVE
                                                                           }
                                            primaryButtonText={OK}
                                            isLoading={archiveStatusAPI?.isFetching}
                                            handleClose={() => {
                                                if (archiveStatusAPI?.isFetching) return;
                                                setArchiveModal({ show: false, selectedList: {} });
                                            }}
                                            handleConfirm={() => {
                                               handleDataArchiveSubmit(archiveModal?.selectedList);
                                            }}
                                            isCloseButton={false}
                                        />
                                    )}
        </FormProvider>
    );
};

export default SingleList;
