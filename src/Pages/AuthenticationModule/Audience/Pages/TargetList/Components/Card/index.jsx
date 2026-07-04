import { convertObjectToBase64, encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { formatNumber } from 'Utils/modules/campaignUtils';
import { numberWithCommas } from 'Utils/modules/formatters';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { AD_HOC_FOOTER_DATA, ALL_AUDIENCE_FOOTER_DATA, DDL_AUDIENCE_FOOTER_DATA, DDL_COMMUNICATION_DATA, getAudienceFooterData, getMetricLabel, INITIAL_STATE, STATE_REDUCER } from './constant';
import { LIST_NAME_CREATION, MAX_LENGTH, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { MAX75LENGTH, MINLENGTH, SEGMENT_NAME as SEGMENT_NAME_MSG, SPECIAL_CHATACTERS_NOT_ALlOWED } from 'Constants/GlobalConstant/ValidationMessage';
import { AD_HOC_LIST_TITLE, ARCHIVE, ARE_YOU_SURE_ARCHIVE, AVERAGE, CALCULATING, CANCEL, COMMS_LINKED, CONTROL_GROUP_TARGET, CREATED_BY, DATA_AUGMENTATION_ENRICH, DATA_SYNC_STATUS, DOWNLOADSHARE, DUPLICATE, EDIT, INFO, LIST_APPROVAL_PENDING, LIST_APPROVED, LIST_EXTRACTION_IS_IN_PROGRESS, LIST_REJECTED, MATCH_INPUT_LIST_TARGET, MATCH_LIST_TITLE, MODIFIED_BY, MORE, OK, PROJECTED, REMOVE_LIST, SAVE, SEED_LIST_TITLE, SEGMENT, SEGMENT_NAME, SHARE, SUPPRESSION_INPUT_LIST_TARGET, SUPPRESSION_LIST_TITLE, TOTAL_AUDIENCE, UNARCHIVE, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { approved_medium, circle_info_medium, circle_pencil_medium, circle_time_large, close_mini, delete_medium, duplicate_medium, eye_medium, menu_dot_medium, pencil_edit_medium, pending_medium, reject_medium, save_mini, share_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import moment from 'moment';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import TargetInfo from './TargetInfo';
import RSTooltip from 'Components/RSTooltip';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import RSInput from 'Components/FormFields/RSInput';
import DownloadRecords from '../DownloadRecords/DownloadRecords';
import SegmentInfo from '../../../DynamicList/Components/SegmentInfo';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';

import { TargetListContext } from '../..';
import { TooltipCGTG } from './TooltipCGTG';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    duplicateTargetList,
    edit_recipientBunchName,
    getTargetListView,
    removeSeedlist,updateArchivalStatus,
} from 'Reducers/audience/targetList/request';
import { target_list_view } from 'Reducers/audience/targetList/reducer.js';
import { checkTargetListName } from 'Reducers/audience/targetListCreation/request';

import { isListNameExist } from 'Reducers/audience/dynamicList/request';

import { MatchList } from './MatchList';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { communicationNamevalidtor } from 'Utils/HookFormValidate';

import { parseAudienceJson } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import DuplicateModal from '../TargetGridView/DuplicateModal';
import DataAugmentation from '../DataAugmentation/DataAugmentation';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
let duplicatesegmentationListID = 0,
    duplicateListName = '',
    matchInputName = '';
const Card = ({ list, type, duplicate, setDuplicate, setPageState, listNameEdit, setlistNameEdit }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const existingName = useRef();
    const [warningModal, setWarningModal] = useState({
        show: false,
        data: {},
    });
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [nameState, setNameState] = useState({
        loading: false,
        isValid: false,
    });
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setError,
        setValue,
        clearErrors,
        formState: { isValid, errors },
    } = useForm();
    const isTarget = type === 'targetList';

    const { params, setParams, setPageConfig, setPagerPageConfig, listTypeView, setAudienceView, audienceView } =
        useContext(TargetListContext);
    const recipientsBunchName = !isTarget ? list.dynamicListName : list.recipientsBunchName;
    const segmentationListID = !isTarget ? list.dynamicListId : list.segmentationListID;
    const createdBy = list.modifiedDate === '' || list.modifiedDate === null ? list.createdName : list.modifiedName;
    const createdByInfo = list.createdName;
    const createdDate = list.modifiedDate === '' || list.modifiedDate === null ? list.createdDate : list.modifiedDate;
    const createdDateInfo = list.createdDate;

    const recipientCount = !isTarget ? list.audienceCount : list.recipientCount;
    const recipientPercentage = !isTarget ? list.audiencePercentage : list.projectedReachRate;
    const status = list.status;
    const nameListIcon = list.nameListIcon;
    const usersIcon = list.usersIcon;
    const communicationsentCount = isTarget ? list.communicationsentCount : list.blastedCount;
    const listType = isTarget ? list.listType : 0;
    const isCGTGEnabled = list.isCGTGEnabled;
    const cgValue = list.cg;
    const tgValue = list.tg;
    const nameHasError = Object.hasOwn(errors, 'recipientsBunchName');
    const editnameHasError = Object.hasOwn(errors, 'editrecipientsBunchName');

    const [state, dispatchState] = useReducer(STATE_REDUCER, INITIAL_STATE);
    // const [duplicateInput, setDuplicateInput] = useState('');
    const [downloadModal, setDownloadModal] = useState(false);
    const [dataAugmentModal, setDataAugmentModal] = useState(false);
    const [dataSyncmodal, setDataSyncmodal] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState({
        show: false,
        selectedList: {},
    });
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [tooltipStatus, setTooltipStatus] = useState({
        cgtgStatus: false,
        matchListStatus: false,
        suppressionStatus: false,
    });
      const [dataArchiveModal, setDataArchiveModal] = useState({
            show: false,
            dataItem: {},
        });
    const [editrecipientName, setEditrecipientName] = useState(list?.recipientsBunchName);
    const [editName_flag, setEditName_flag] = useState(false);
    const editNameSaveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
    });
    const archiveStatusAPI = useApiLoader({ autoFetch: false });
    const lastCheckedEditNameRef = useRef(null);
    const [isFailure, setIsFailure] = useState(false);
    const [selectedPredictionMetric, setSelectedPredictionMetric] = useState('reach');

    const parsedPredictedReachRate = useMemo(() => {
        if (list?.predictedReachRate == null) return null;
        if (typeof list.predictedReachRate === 'string') {
            return parseAudienceJson(list.predictedReachRate, null);
        }
        return list.predictedReachRate;
    }, [list?.predictedReachRate]);

    const hasPredictedData = parsedPredictedReachRate != null;
    const activePredictedData = hasPredictedData ? parsedPredictedReachRate[selectedPredictionMetric] : null;

    const [selectedProjectedMetric, setSelectedProjectedMetric] = useState('reach');

    const parsedProjectedReachRate = useMemo(() => {
        if (list?.projectedReachRate == null) return null;
        if (typeof list.projectedReachRate === 'string') {
            return parseAudienceJson(list.projectedReachRate, null);
        }
        return list.projectedReachRate;
    }, [list?.projectedReachRate]);

    const hasProjectedData = parsedProjectedReachRate != null;
    const activeProjectedMetricKey = selectedProjectedMetric.charAt(0).toUpperCase() + selectedProjectedMetric.slice(1);
    const activeProjectedValue = hasProjectedData ? parsedProjectedReachRate[activeProjectedMetricKey] : null;

    const [warningMessage, setWarningMessage] = useState('');
    const TLUserName = list.createdName;
    const TLUserModifiName = list.modifiedName;

    useEffect(() => {
        setValue('cgtgValue', isCGTGEnabled);
    }, [isCGTGEnabled, tooltipStatus?.cgtgStatus]);

    // const submitSegmentDetails = async () => {
    //     if (isValid) {
    //         if (isTarget) {
    //             const payload = {
    //                 departmentId,
    //                 ListId: duplicatesegmentationListID, //list.segmentationListID,
    //                 ListName: duplicateInput,
    //                 clientId,
    //                 userId,
    //             };
    //             const { data, status, message } = await dispatch(duplicateTargetList(payload));
    //             setWarningMessage(message);
    //             console.log('status: ', status);
    //             if (status) {
    //                 window.location.reload();
    //             } else {
    //                 // setIsFailure(true);
    //             }
    //         }
    //         setDuplicate(false);
    //         setDuplicateInput('');
    //         reset();
    //     }
    // };

    // const onDuplicate = () => {
    //     const temp = { ...list };
    //     temp.duplicate = true;
    //     duplicatesegmentationListID = temp.segmentationListID;
    //     duplicateListName = temp.recipientsBunchName;
    //     temp.createdDate = new Date();
    //     temp.segmentationListID = lists?.length + 1;
    //     setDuplicate(true);
    //     setPageState((prev) => {
    //         const tList = [...prev];
    //         tList.unshift(temp);
    //         return tList;
    //     });
    //     window.scrollTo(0, 0);
    // };

    // NEW CODE - Modal duplicate functionality
    const onDuplicate = () => {
        setDuplicateModal({
            show: true,
            selectedList: list,
        });
    };

    const navigateToAddAudience = (type) => {
        const state = {
            type,
            from: 'targetList',
            mode: 'inputList',
            segmentationListID: list.segmentationListID,
            recipientsBunchName: recipientsBunchName,
        };
        const encodedState = encodeUrl(state);
        navigate(`/audience/add-audience?q=${encodedState}`, { state });
    };

    const handleDuplicateSubmit = async (newListName) => {
        setIsDuplicating(true);
        try {
            const payload = {
                departmentId,
                clientId,
                userId,
                ListId: list.segmentationListID,
                ListName: newListName,
            };

            const { status, message } = await dispatch(duplicateTargetList(payload, false));
            setWarningMessage(message);

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
                setDuplicateModal({
                    show: false,
                    selectedList: {},
                });
            } else {
                setIsFailure(true);
            }
        } finally {
            setIsDuplicating(false);
        }
    };

    // const handleSegmentationName = async ({ target: { value } }) => {
    const handleSegmentationName = async (value) => {
        const payloadData = {
            departmentId,
            clientId,
            userId,
            listName: value,
            listId: duplicatesegmentationListID,
        };
        if (value?.length >= 3 && !nameHasError && existingName.current !== value) {
            let api;
            if (isTarget) api = checkTargetListName;
            else api = isListNameExist;
            // if (isTarget) {
            setNameState({
                loading: true,
                isValid: false,
            });
            const { status } = await dispatch(api(payloadData));
            if (status) {
                setError('recipientsBunchName', {
                    type: 'custom',
                    message: 'List name already exists',
                });
                setNameState({
                    loading: false,
                    isValid: false,
                });
            } else {
                setNameState({
                    loading: false,
                    isValid: true,
                });
                setDuplicateInput(value);
            }
            // if (status) {
            //     setError('recipientsBunchName', {
            //         type: 'custom',
            //         message: 'List name already exists',
            //     });
            // } else clearErrors('recipientsBunchName');
            // } else {
            //     const res = await dispatch(isListNameExist(payloadData));
            //     if (res?.data === 'Success') {
            //         setError('recipientsBunchName', {
            //             type: 'custom',
            //             message: 'List name already exists',
            //         });
            //     } else clearErrors('recipientsBunchName');
            // }
        }
        setDuplicateInput(value);
    };

    const handleEditSegmentationName = async ({ target: { value } }) => {
        const trimmedValue = (value ?? '').trim();
        const originalName = (matchInputName || list?.recipientsBunchName || '').trim();

        if (!trimmedValue || editnameHasError || nameState.loading) return;

        if (trimmedValue === originalName) {
            lastCheckedEditNameRef.current = trimmedValue;
            setNameState({ loading: false, isValid: false });
            return;
        }

        if (lastCheckedEditNameRef.current === trimmedValue) return;

        const payloadData = {
            departmentId,
            clientId,
            userId,
            listName: trimmedValue,
            listId: list.segmentationListID,
        };

        lastCheckedEditNameRef.current = trimmedValue;

        const api = isTarget ? checkTargetListName : isListNameExist;
        setNameState({
            loading: true,
            isValid: false,
        });

        const { status } = await dispatch(api(payloadData));
        if (status) {
            setError('editrecipientsBunchName', {
                type: 'custom',
                message: 'List name already exists',
            });
            setNameState({
                loading: false,
                isValid: false,
            });
        } else {
            setNameState({
                loading: false,
                isValid: true,
            });
            setEditrecipientName(trimmedValue);
        }
    };
    const submit_edit_recipientsBunchName = async () => {
        if (!isValid || !isTarget || editNameSaveApi.isFetching) return;

        const payload = {
            departmentId,
            segmentationListId: list.segmentationListID,
            segmentationListName: editrecipientName,
            clientId,
            userId,
        };

        const response = await editNameSaveApi.refetch({
            mode: 'create',
            fetcher: () => dispatch(edit_recipientBunchName({ payload, loading: false })),
        });

        if (response?.status) {
            setEditrecipientName('');
            setEditName_flag(false);
            setlistNameEdit(0);
            reset();
            await dispatch(
                getTargetListView({
                    ...params,
                    departmentId,
                    clientId,
                    userId,
                }),
            );
        }
    };
    const handleDataArchiveSubmit = async (dataItem) => {
        const payload = {
            departmentId,
            clientId,
            tableName: 'segmentationlist',
            listId: [dataItem.segmentationListID],
            isArchived: !dataItem?.isArchived,
        };
        const res = await archiveStatusAPI.refetch({
            fetcher: () => dispatch(updateArchivalStatus(payload, false)),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
        });
        if (res?.status) {
            await dispatch(
                getTargetListView({
                    ...params,
                    departmentId,
                    clientId,
                    userId,
                }),
            );
            setDataArchiveModal({ show: false, dataItem: {} });
        }
    };
      
    const [showElement, setShowElement] = useState(true);
    useEffect(() => {
        if (nameState.isValid) {
            setTimeout(function () {
                setShowElement(true);
            }, 3002);
        } else if (nameState.loading) {
            setShowElement(false);
        } else {
            setShowElement(true);
        }
    }, [nameState]);
    // console.log('nameState: ', nameState);

    const handleReload = () => {
        window.location.reload();
    };

    const removeSeedListData = async (segmentationListID) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            listId: segmentationListID,
        };
        let res = await dispatch(removeSeedlist(payload));
        if (res?.status) {
            setWarningModal((prev) => ({
                ...prev,
                show: false,
                data: 0,
            }));
            setTimeout(() => {
                handleReload();
            }, 1);
        }
    };

    const listClassName = `${list.listMappingStatus !== 9 || recipientCount === 0 ? 'pe-none click-off' : ''}`;

    const getRecipientCountTitle = () => {
        if (listType === 1) return AD_HOC_LIST_TITLE;
        if (listType === 2) return MATCH_LIST_TITLE;
        if (listType === 3) return SEED_LIST_TITLE;
        if (listType === 4) return SUPPRESSION_LIST_TITLE;
        return SEGMENT;
    };

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

    const renderRecipientCount = () => {
        if (isNaN(recipientCount)) return recipientCount;
        return (
            <>
                {getRecipientCountTitle()}
                <span className="font-bold">{renderCountWithTooltip(recipientCount)}</span>
            </>
        );
    };

    return (
        <>
            <Col
                sm={4}
                className={listNameEdit === list?.segmentationListID || listNameEdit === 0 ? '' : 'pe-none click-off'}
            >
                <div
                    className={
                        duplicate && !list.duplicate
                            ? `rs-card-bottom-sep rc-tl ${status} pe-none click-off`
                            : `rs-card-bottom-sep rc-tl ${status} `
                    }
                >
                    {/* start */}
                    <div className="rc-info pt0">
                        <div className="align-items-center d-flex justify-content-between">
                            <div className={`${editName_flag ? 'rci-list-name d-block w-100' : 'rci-list-name'}`}>
                                {!editName_flag && (
                                    <h4 className="mb0">
                                        <TruncatedCell value={recipientsBunchName} noTable />
                                    </h4>
                                )}
                                {!editName_flag &&(
                                    <>
                                {(listType === 2 || listType === 4) && list?.parentListId > 0 && (
                                    <RSTooltip
                                        position="top"
                                        text={EDIT}
                                        className="lh0 position-relative top-5"
                                    >
                                            <i
                                                onClick={() => {
                                                    matchInputName = list?.recipientsBunchName;
                                                    lastCheckedEditNameRef.current = null;
                                                    setNameState({ loading: false, isValid: false });
                                                    setlistNameEdit(list?.segmentationListID);
                                                    setEditName_flag(!editName_flag);
                                                }}
                                                className={`${pencil_edit_medium}   color-primary-blue icon-md`}
                                                id="rs_data_pencil_edit"
                                            />
                                    </RSTooltip>
                                )}
                                </>
                            )}
                                {editName_flag && (
                                    <form onSubmit={handleSubmit(submit_edit_recipientsBunchName)}>
                                        <div className="editNameFieldContainer mt15">
                                            <div className="editNameField">
                                                <RSInput
                                                    name={'editrecipientsBunchName'}
                                                    type="text"
                                                    isValidIcon={nameState.isValid}
                                                    isLoading={nameState.loading}
                                                    placeholder={SEGMENT_NAME}
                                                    defaultValue={matchInputName}
                                                    control={control}
                                                    className="pr40"
                                                    handleOnchange={() => {
                                                        if (editnameHasError) clearErrors('editrecipientsBunchName');
                                                        if (nameState.isValid || nameState.loading) {
                                                            setNameState({
                                                                loading: false,
                                                                isValid: false,
                                                            });
                                                        }
                                                        lastCheckedEditNameRef.current = null;
                                                    }}
                                                    handleOnBlur={handleEditSegmentationName}
                                                    required
                                                    onKeyDown={charNumUnderScore}
                                                    rules={{
                                                        required: SEGMENT_NAME_MSG,
                                                        pattern: {
                                                            value: LIST_NAME_CREATION,
                                                            message: SPECIAL_CHATACTERS_NOT_ALlOWED,
                                                        },
                                                        minLength: {
                                                            value: MIN_LENGTH,
                                                            message: MINLENGTH,
                                                        },
                                                        maxLength: {
                                                            value: MAX_LENGTH,
                                                            message: MAX75LENGTH,
                                                        },
                                                        validate: {
                                                            communicationNamevalidtor,
                                                            nameExists: () =>
                                                                editnameHasError
                                                                    ? _get(errors, 'editrecipientsBunchName.message')
                                                                    : true,
                                                        },
                                                    }}
                                                />
                                                <div className="editNameField-actions">
                                                    {showElement && (
                                                        <RSTooltip position="top" text={CANCEL}>
                                                            <i
                                                                id="rs_Card_closeremove"
                                                                className={`${close_mini} font-xxs color-primary-red mr5`}
                                                                onClick={() => {
                                                                    reset();
                                                                    lastCheckedEditNameRef.current = null;
                                                                    setNameState({ loading: false, isValid: false });
                                                                    setlistNameEdit(0);
                                                                    setEditName_flag(!editName_flag);
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        disabled={!nameState.isValid || editNameSaveApi.isFetching}
                                                    >
                                                        <RSTooltip position="top" text={SAVE}>
                                                            <div
                                                                className={
                                                                    !nameState.isValid || editNameSaveApi.isFetching
                                                                        ? 'pe-none click-off'
                                                                        : ''
                                                                }
                                                            >
                                                                {editNameSaveApi.isFetching ? (
                                                                    <div className="segment_loader" />
                                                                ) : (
                                                                    <i
                                                                        className={`${save_mini} icon-xs color-primary-blue m0`}
                                                                    />
                                                                )}
                                                            </div>
                                                        </RSTooltip>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {type !== 'dynamicList' && nameListIcon && <i className={nameListIcon}></i>}
                            </div>
                            <div className="position-absolute right0">
                                <div className="align-items-center d-flex">
                                    {list?.share && (
                                        <RSTooltip position="top" text={SHARE} className="lh0 mr15">
                                            <i className={`${share_tick_medium} color-primary-blue icon-md`} />
                                        </RSTooltip>
                                    )}

                                    {listType === 5 &&
                                        ((status === 'scheduled' && hasPredictedData) ||
                                            (status === 'completed' && hasProjectedData)) && (
                                            <BootstrapDropdown
                                                data={DDL_COMMUNICATION_DATA}
                                                flatIcon
                                                alignRight
                                                defaultItem={
                                                    <i
                                                        className={`${menu_dot_medium} color-primary-blue icon-md`}
                                                    />
                                                }
                                                showUpdate={false}
                                                className="no_caret ml5"
                                                onSelect={(e) => {
                                                    if (status === 'scheduled') {
                                                        setSelectedPredictionMetric(e.toLowerCase());
                                                    } else {
                                                        setSelectedProjectedMetric(e.toLowerCase());
                                                    }
                                                }}
                                            />
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* end */}
                    <div className="rc-top">
                        <span className="rct-cb">
                            {list.modifiedDate === 'NaT' ||
                            list.modifiedDate === 'None' ||
                            list.modifiedDate === '' ||
                            list.modifiedDate === null ||
                            (list?.modifiedDate && !list?.modifiedName) ? (
                                <>
                                    <span className="rctcb-by-text">{CREATED_BY}: </span>
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
                                        <span className="rctcb-by-date tl-left-border">{getUserCurrentFormat(list.createdDate, { isOffset: true }).dateTimeFormat}
                                        </span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="rctcb-by-text">{MODIFIED_BY}: </span>
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
                                        <span className="rctcb-by-date tl-left-border">{getUserCurrentFormat(list.createdDate, { isOffset: true })?.dateTimeFormat}
                                        </span>
                                        </>
                                    )}
                                </>
                            )}
                        </span>
                    </div>
                    <div className="rc-info pt5">
                        {/* {createdBy !== 'Admin' && ( */}
                        <div className={`rci-list-id ${editName_flag ? 'd-none' : ''}`}>
                            {convertObjectToBase64(segmentationListID)}
                        </div>
                        {/* )} */}
                    </div>
                    <div className="rc-info">
                        <div className="rs-table-row">
                            <div className="rstr-cell rstrc-left">
                                <div className="rci-content-block top20">
                                    {usersIcon && <div className="rci-users-icon"></div>}
                                    {list.listMappingStatus === 9 ? (
                                        <div
                                            className={`align-items-center d-flex rci-text Segment-count-wrapper gap-1${
                                                isNaN(recipientCount) ? 'rci-inprogress-text' : ''
                                            }`}
                                        >
                                            <span className='d-flex gap-1'> {renderRecipientCount()}
                                            </span>
                                            {recipientsBunchName !== 'All audience' &&
                                                (listType === 5 || listType === 3) && (
                                                    <RSTooltip
                                                        text={VIEW}
                                                        position="top"
                                                        className="lh0"
                                                        innerContent={false}
                                                    >
                                                        <span
                                                            className={`${listClassName}`}
                                                            onClick={() => {
                                                                // setAudienceView(!audienceView);
                                                                if (!listClassName?.includes('click-off')) {
                                                                    setAudienceView((prev) => ({
                                                                        listId: list?.segmentationListID,
                                                                        listName: list?.recipientsBunchName,
                                                                        listType: listType,
                                                                        status: true,
                                                                    }));
                                                                }

                                                                // setAudienceView( true);
                                                            }}
                                                        >
                                                            <i
                                                                id="rs_data_eye"
                                                                className={`${eye_medium} icon-md ${
                                                                    list.listMappingStatus === 9
                                                                        ? 'color-primary-blue'
                                                                        : 'color-primary-grey'
                                                                }`}
                                                            ></i>
                                                        </span>
                                                    </RSTooltip>
                                                )}
                                        </div>
                                    ) : (
                                        <div>
                                            {recipientsBunchName !== 'All audience' &&
                                            listType !== 2 &&
                                            listType !== 4 ? (
                                                <span>{LIST_EXTRACTION_IS_IN_PROGRESS}</span>
                                            ) : listType === 2 || listType === 4 ? (
                                                <span>{CALCULATING}</span>
                                            ) : (
                                                <span>
                                                    {TOTAL_AUDIENCE}: <span className="font-bold">{renderCountWithTooltip(recipientCount)}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className="clearfix"></div>
                                    <div className="rci-text">
                                        {recipientsBunchName !== 'All audience' && (
                                            <span>
                                                {COMMS_LINKED}: <span className="font-bold">{renderCountWithTooltip(communicationsentCount)}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="rstr-cell rstrc-right">
                                <div className="rci-text">
                                    <span className="rcit-avg">
                                        {listType === 5 && (
                                            <>
                                                <span>
                                                    {status === 'completed'
                                                        ? AVERAGE
                                                        : PROJECTED}
                                                </span>
                                                {` ${getMetricLabel(
                                                    status === 'scheduled'
                                                        ? selectedPredictionMetric
                                                        : selectedProjectedMetric,
                                                )}:`}
                                            </>
                                        )}
                                    </span>
                                    <div className="rcit-number">
                                        <span
                                            className={`rcitn-number ${
                                                listType !== 5 || list.listMappingStatus === 0
                                                    ? 'na'
                                                    : status === 'scheduled'
                                                    ? activePredictedData?.predicted_rate_pct == null
                                                        ? 'na'
                                                        : ''
                                                    : status === 'completed'
                                                    ? activeProjectedValue == null
                                                        ? 'na'
                                                        : ''
                                                    : 'na'
                                            }`}
                                        >
                                            {listType !== 5 || list.listMappingStatus === 0
                                                ? 'NA'
                                                : status === 'scheduled'
                                                ? activePredictedData?.predicted_rate_pct ?? 'NA'
                                                : status === 'completed'
                                                ? activeProjectedValue != null
                                                    ? activeProjectedValue
                                                    : 'NA'
                                                : 'NA'}
                                        </span>
                                        <span className="rcitn-per">
                                            {listType !== 5 || list.listMappingStatus === 0
                                                ? ''
                                                : status === 'scheduled'
                                                ? String(activePredictedData?.predicted_rate_pct || '').includes('%')
                                                    ? ''
                                                    : activePredictedData?.predicted_rate_pct != null
                                                    ? ' %'
                                                    : ''
                                                : status === 'completed'
                                                ? activeProjectedValue != null
                                                    ? ' %'
                                                    : ''
                                                : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`rc-bottom `}>
                        {/* {usersIcon ? <div className="rci-users-icon"></div> : <div className="rci-user-icon"></div>} */}
                        <RSTooltip
                            position="top"
                            text={INFO}
                            className="lh0 position-absolute right5 top-35"
                        >
                            <div
                                className={`cardInfo position-static ${
                                    (listType === 2 || listType === 4) && list?.parentListId === 0 ||
                                    listType === 3 ||
                                    // listType === 1 ||
                                    list.listMappingStatus === 1 ||
                                    list.listMappingStatus === 0 ||
                                    recipientCount === 0 ||
                                    list?.duplicate
                                        ? 'pe-none click-off'
                                        : ''
                                }`}
                            >
                                <i
                                    className={`${circle_info_medium} icon-md`}
                                    id="rs_data_circle_info"
                                    onClick={() => {
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: true,
                                            field: 'segmentInfoModal',
                                        });
                                        //setPagerStatus(true);
                                    }}
                                />
                            </div>
                        </RSTooltip>
                        <ul
                            className={`${
                                duplicate && list.duplicate
                                    ? `rs-list-inline rli-al text-right pe-none click-off ${
                                          listType === 2 || listType === 4 ? 'pe-none click-off' : ''
                                      }`
                                    : `rs-list-inline rli-al text-right`
                            } ${recipientsBunchName === 'All audience' ? 'h32' : ''}`}
                        >
                            <li>
                                <RSTooltip
                                    position="top"
                                    text={`${listType === 16 ? VIEW : EDIT} `}
                                >
                                    <div
                                        className={`${
                                            listType === 3 ||
                                            listType === 2 ||
                                            listType === 4 ||
                                            listType === 1 ||
                                            listType === 10 ||
                                            listType === 15 ||
                                            list.listMappingStatus === 1 ||
                                            list.listMappingStatus === 0
                                                ? 'pe-none click-off'
                                                : ''
                                        }`}
                                    >
                                        {recipientsBunchName !== 'All audience' ? (
                                            <i
                                                id="rs_data_circle_pencil"
                                                className={`${
                                                    listType === 16 ? eye_medium : circle_pencil_medium
                                                } icon-md`}
                                                onClick={() =>
                                                    navigate(
                                                        `${'/audience/create-target-list?targetListId='}${segmentationListID}&listType=${listType}&communicationsentCount=${encodeURIComponent(
                                                            String(communicationsentCount ?? 0),
                                                        )}`,
                                                        // `${
                                                        //     type === 'targetList'
                                                        //         ? '/audience/create-target-list'
                                                        //         : '/audience/create-dynamic-list'
                                                        // }`,
                                                        {
                                                            state: {
                                                                mode: 'edit',
                                                                segmentationListID: segmentationListID,
                                                                recipientsBunchName: recipientsBunchName,
                                                            },
                                                        },
                                                    )
                                                }
                                            />
                                        ) : null}
                                    </div>
                                </RSTooltip>
                            </li>
                            {/* <li className={`${listType === 3 || listType === 1 ? 'click-off' : ''}`}> */}
                            {list?.isRequestApproval !== false && (
                                <li className={`${listType === 16 ? 'd-none' : ''}`}>
                                    <RSTooltip
                                        position="top"
                                        text={
                                            list.approverStatus === 2
                                                ? LIST_REJECTED
                                                : list.approverStatus === 0
                                                ? LIST_APPROVAL_PENDING
                                                : LIST_APPROVED
                                        }
                                    >
                                        <div
                                            className={`${
                                                listType !== 5 ||
                                                recipientsBunchName === 'All audience' ||
                                                list.isRequestApproval === false
                                                    ? 'pe-none click-off'
                                                    : ''
                                            }`}
                                        >
                                            <i
                                                onClick={() =>
                                                    navigate(
                                                        `${'/audience/create-target-list?targetListId='}${segmentationListID}&listType=${listType}&rfa=true&approval=${
                                                            list.approverStatus
                                                        }&communicationsentCount=${encodeURIComponent(
                                                            String(communicationsentCount ?? 0),
                                                        )}`,

                                                        {
                                                            state: {
                                                                mode: 'rfa',
                                                                segmentationListID: segmentationListID,
                                                                recipientsBunchName: recipientsBunchName,
                                                            },
                                                        },
                                                    )
                                                }
                                                id="rs_data_user_tick"
                                                className={`${
                                                    list.approverStatus === 2
                                                        ? reject_medium
                                                        : list.approverStatus === 0
                                                        ? pending_medium
                                                        : approved_medium
                                                }  icon-md `}
                                            />
                                        </div>
                                    </RSTooltip>
                                </li>
                            )}
                            {listType === 3 && (
                                <li
                                    onClick={() => {
                                        setWarningModal((prev) => ({
                                            ...prev,
                                            show: true,
                                            data: segmentationListID,
                                        }));
                                    }}
                                >
                                    <RSTooltip position="top" text={REMOVE_LIST}>
                                        <i
                                            id="rs_data_delete"
                                            className={`${delete_medium}  
                                                 icon-md `}
                                        />
                                    </RSTooltip>
                                </li>
                            )}
                            <li className={listType === 16 ? 'd-none' : (listType === 10 || listType === 15) ? 'pe-none click-off' : ''}>
                                <RSTooltip
                                    className="lh0"
                                    position="top"
                                    text={`${type !== 'targetList' ? DUPLICATE : MORE}`}
                                >
                                    <div
                                        className={`${
                                            listType === 3 ||
                                           ((listType === 2 ||
                                            listType === 4) && list?.parentListId === 0) ||
                                            list?.listMappingStatus === 1 ||
                                            recipientsBunchName === 'All audience'
                                                ? 'pe-none click-off'
                                                : ''
                                        }`}
                                    >
                                        {/* //Throwing Error here because of the dropdown pass ref error */}
                                        {type === 'targetList' ? (
                                            listType !== 1 && (
                                                <BootstrapDropdown
                                                    containerClass={
                                                        list.listMappingStatus === 0 ? 'pe-none click-off' : ''
                                                    }
                                                    data={
                                                        listType === 1
                                                            ? AD_HOC_FOOTER_DATA
                                                            : recipientsBunchName === 'All audience'
                                                            ? ALL_AUDIENCE_FOOTER_DATA :
                                                            (listType === 2 || listType === 4) && list?.parentListId > 0  ? [ DOWNLOADSHARE]
                                                            : getAudienceFooterData(list?.isArchived)
                                                    }
                                                    flatIcon
                                                    defaultItem={
                                                        <i
                                                            id="rs_data_menu_dot"
                                                            className={`${menu_dot_medium} 
                                                        } color-primary-blue icon-md`}
                                                        />
                                                    }
                                                    showUpdate={false}
                                                    disbleItems={[
                                                        ...(listType === 10 ? [DOWNLOADSHARE] : []),
                                                        ...(recipientCount < 5
                                                            ? [DDL_AUDIENCE_FOOTER_DATA[1]]
                                                            : []),
                                                    ]}
                                                    onSelect={(e) => {
                                                        if (e === DOWNLOADSHARE) {
                                                            setDownloadModal(true);
                                                        } else if (e === DUPLICATE) {
                                                            onDuplicate();
                                                        } else if (e === CONTROL_GROUP_TARGET) {
                                                            setTooltipStatus((pre) => ({ pre, cgtgStatus: true }));
                                                        } else if (e === MATCH_INPUT_LIST_TARGET) {
                                                            // setTooltipStatus((pre) => ({ pre, matchListStatus: true }));
                                                            navigateToAddAudience('match-list');
                                                        } else if (e === SUPPRESSION_INPUT_LIST_TARGET) {
                                                            // setTooltipStatus((pre) => ({
                                                            //     pre,
                                                            //     suppressionStatus: true,
                                                            // }));
                                                            navigateToAddAudience('suppression-list');
                                                        } else if (e === DATA_AUGMENTATION_ENRICH) {
                                                            setDataAugmentModal(true);
                                                        } else if (e === ARCHIVE || e === UNARCHIVE) {
                                                            setDataArchiveModal({ show: true, dataItem: list });
                                                        }
                                                    }}
                                                    className="no_caret"
                                                    alignRight
                                                />
                                            )
                                        ) : (
                                            <i
                                                id="rs_data_duplicate"
                                                className={`${duplicate_medium} color-primary-blue icon-md`}
                                                onClick={() => onDuplicate()}
                                            />
                                        )}
                                    </div>
                                </RSTooltip>
                            </li>
                        </ul>
                    </div>
                    {downloadModal && (
                        <DownloadRecords
                            showPopup={downloadModal}
                            audienceValue={list}
                            handleClose={setDownloadModal}
                        />
                    )}
                </div>
            </Col>
            {/* Modals */}
            {state.segmentInfoModal &&
                (isTarget ? (
                    // <div className="overlayCSS">
                    //      <div className="fade modal-backdrop show"></div>
                    //  </div>
                    <TargetInfo
                        bunchName={recipientsBunchName}
                        audienceId={list.segmentationListID}
                        // createdBy={createdBy}
                        createdBy={createdByInfo}
                        modifiedDate={list.modifiedDate}
                        // createdDate={createdDate}
                        createdDate={createdDateInfo}
                        segmentInfoModal={state.segmentInfoModal}
                        list={list}
                        handleClose={() => {
                            dispatch(target_list_view({ field: 'GetAdvanceAnalyticsList', data: [] }));
                            dispatch(target_list_view({ field: 'getAdvAnalyticsGrid', data: [] }));
                            dispatch(target_list_view({ field: 'targetInfo', data: [] }));
                            dispatchState({
                                type: 'UPDATE',
                                payload: false,
                                field: 'segmentInfoModal',
                            });
                        }}
                    />
                ) : (
                    // <div className="overlayCSS">
                    //     <div className="fade modal-backdrop show"></div>
                    //      </div>
                    <SegmentInfo
                        handleClose={() =>
                            dispatchState({
                                type: 'UPDATE',
                                payload: false,
                                field: 'segmentInfoModal',
                            })
                        }
                        viewData={list}
                        listInfoModal={!state.segmentInfoModal}
                    />
                ))}

            {tooltipStatus.cgtgStatus && (
                <TooltipCGTG
                    show={tooltipStatus.cgtgStatus}
                    onHide={() => setTooltipStatus((pre) => ({ ...pre, cgtgStatus: false }))}
                    listId={list.segmentationListID}
                    watch={watch}
                    cgValue={cgValue}
                    tgValue={tgValue}
                    control={control}
                    initialCgtgEnabled={isCGTGEnabled}
                />
            )}
            {tooltipStatus.matchListStatus && (
                <MatchList
                    show={tooltipStatus.matchListStatus}
                    list={list}
                    listType={2}
                    onHide={() => setTooltipStatus((pre) => ({ pre, matchListStatus: false }))}
                />
            )}
            {tooltipStatus.suppressionStatus && (
                <MatchList
                    list={list}
                    listType={4}
                    show={tooltipStatus.suppressionStatus}
                    onHide={() => setTooltipStatus((pre) => ({ pre, suppressionStatus: false }))}
                />
            )}
            {dataAugmentModal && (
                <DataAugmentation
                    show={dataAugmentModal}
                    handleClose={(status) => {
                        if (!status) {
                            setDataAugmentModal(false);
                        } else {
                            setDataAugmentModal(false);
                            setDataSyncmodal(true);
                        }
                    }}
                    list={list}
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
                        data: 0,
                    }));
                }}
            />
             {dataArchiveModal.show && (
                            <RSConfirmationModal
                                show={dataArchiveModal.show}
                                text={
                                    dataArchiveModal?.dataItem?.isArchived
                                        ? 'Are you sure you want to unarchive?'
                                        : ARE_YOU_SURE_ARCHIVE
                                }
                                primaryButtonText={OK}
                                isLoading={archiveStatusAPI?.isFetching}
                                handleClose={() => {
                                    if (archiveStatusAPI?.isFetching) return;
                                    setDataArchiveModal({ show: false, dataItem: {} });
                                }}
                                handleConfirm={() => {
                                   handleDataArchiveSubmit(dataArchiveModal?.dataItem);
                                }}
                                isCloseButton={false}
                            />
                        )}
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
            {/* <WarningPopup
                show={isFailure}
                handleClose={() => {
                    setIsFailure(false);
                }}
                text={warningMessage}
                showCancel={true}
                isPrimary={false}
            /> */}
        </>
    );
};

export default Card;
