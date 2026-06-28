import { MAX_LENGTH50, MAX_LENGTH500 } from 'Constants/GlobalConstant/Regex';
import { KEYWORD_ALREADY_EXISTS, MESSAGE_CANNOT_BE_WHITESPACE_ONLY, MESSAGE_IS_REQUIRED, SELECT_VALUE, THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { ACTIONS, ACTION_TYPE, ACTION_TYPE_TOOLTIP, ADD, ADD_CUSTOM_KEYWORD, ADD_CUSTOM_KEYWORDS, CANCEL, CUSTOM_KEYWORDS, CUSTOM_KEYWORDS_TOOLTIP, DELETE, EDIT, EDIT_CUSTOM_KEYWORDS, ENTER_KEYWORD, KEYWORD, KEYWORD_TOOLTIP, NO_CUSTOM_KEYWORDS, RESPONSE_MESSAGE, RESPONSE_MESSAGE_TOOLTIP, UPDATE, VIEW, VIEW_CUSTOM_KEYWORDS } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, circle_question_mark_mini, delete_medium, eye_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';

import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSModal from 'Components/RSModal';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import { getSMSKeyword, deleteSMSKeywordSetting, getInboundActionValue, updateSMSKeyword, insertSMSKeyword } from 'Reducers/preferences/CommunicationSettings/request';

import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
// import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import TextEditor from '../TextEditor';
import {
    CUSTOM_KEYWORD_FORM_CONFIG,
    CUSTOM_KEYWORD_FORM_DEFAULT_VALUES,
    MODAL_INITIAL_STATE,
} from './constant';



const CustomKeywords = ({ clientSmsSenderID = null, isCreate }) => {
    const dispatch = useDispatch();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const customKeywordsData = useSelector((state) => state.communicationSettingsReducer.customKeywordsList);
    const actionTypeOptions = useSelector((state) => state.communicationSettingsReducer.inboundActionTypes);
    const isLoading = useSelector((state) => state.communicationSettingsReducer.customKeywordsLoading);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { permissions } = usePermission();
    const { updateAccess, addAccess, deleteAccess } = permissions || {};

    const isViewMode = !updateAccess;

    const [editModal, setEditModal] = useState(MODAL_INITIAL_STATE);
    const [deleteModal, setDeleteModal] = useState(MODAL_INITIAL_STATE);
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;

    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm(CUSTOM_KEYWORD_FORM_CONFIG);

    const isAddMode = !editModal.item;

    const fetchKeywords = useCallback(async () => {
        await dispatch(
            getSMSKeyword({ clientId, departmentId, userId, ClientSMSSenderID: clientSmsSenderID })
        );
    }, [clientSmsSenderID]);

    useEffect(() => {
        fetchKeywords();
    }, [fetchKeywords]);

    // useEffect(() => {
    //     dispatch(getPersonalizationFields({ payload: { clientId, departmentId, userId } }));
    // }, []);

    useEffect(() => {
        dispatch(getInboundActionValue({ clientId, departmentId, userId }));
    }, []);

    const handleAddClick = () => {
        if (!addAccess) return;
        reset(CUSTOM_KEYWORD_FORM_DEFAULT_VALUES);
        setEditModal({ show: true, item: null });
    };

    const handleEditClick = (dataItem) => {
        reset({
            keyword: dataItem?.keyName || '',
            actionType: actionTypeOptions.find((o) => o.keyValue?.toLowerCase() === dataItem?.keyValue?.toLowerCase()) || '',
            responseMessage: dataItem?.message || '',
        });
        setEditModal({ show: true, item: dataItem });
    };

    const handleDeleteClick = (dataItem) => {
        if (!deleteAccess) return;
        setDeleteModal({ show: true, item: dataItem });
    };

    const handleDeleteConfirm = async () => {
        const sbisId = deleteModal.item?.sbisId;
        setDeleteModal(MODAL_INITIAL_STATE);
        const response = await dispatch(
            deleteSMSKeywordSetting({ clientId, departmentId, userId, SBIS_ID: sbisId })
        );
        if (response?.status) {
            fetchKeywords();
        }
    };

    const handleDeleteClose = () => {
        setDeleteModal(MODAL_INITIAL_STATE);
    };

    const handleModalClose = () => {
        setEditModal(MODAL_INITIAL_STATE);
        reset(CUSTOM_KEYWORD_FORM_DEFAULT_VALUES);
    };

    const handleModalSubmit = async (formState) => {
        if (isSaveLoading) return;
        if (isAddMode) {
            const payload = {
                KeyName: formState.keyword,
                KeyValue: formState.actionType?.keyValue || formState.actionType,
                ClientSmsSenderID: clientSmsSenderID,
                InboundNo: editModal.item?.inBoundNo,
                Message: formState.responseMessage,
            };
            const response = await saveApi.refetch({
                fetcher: () => dispatch(insertSMSKeyword(payload, false)),
                loaderConfig: fieldLoaderConfig,
                mode: 'create',
            });
            handleModalClose();
            if (response?.status) {
                fetchKeywords();
            }
        } else {
            const payload = {
                sbisId: editModal.item?.sbisId,
                InboundNo: editModal.item?.inBoundNo,
                message: formState.responseMessage,
                keyValue: formState.actionType?.inboundkeyvalueID ?? formState.actionType,
                keyName: formState.keyword,
                ClientSmsSender: clientSmsSenderID,
            };
            const response = await saveApi.refetch({
                fetcher: () => dispatch(updateSMSKeyword(payload, false)),
                loaderConfig: fieldLoaderConfig,
                mode: 'edit',
            });
            handleModalClose();
            if (response?.status) {
                fetchKeywords();
            }
        }
    };

    const modalHeader = (
        <span className="d-flex align-items-center">
            {isAddMode ? ADD_CUSTOM_KEYWORDS : isViewMode ? VIEW_CUSTOM_KEYWORDS : EDIT_CUSTOM_KEYWORDS}
            <RSTooltip text={CUSTOM_KEYWORDS_TOOLTIP} position="top">
                <i
                    className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                    id="rs_custom_keywords_modal_info"
                />
            </RSTooltip>
        </span>
    );

    const modalBody = (
        <div className="p10">
            <Row className="align-items-center mb20">
                <Col sm={3} className="d-flex align-items-center">
                    <label className="control-label-left mb0">{KEYWORD}</label>
                    <RSTooltip text={KEYWORD_TOOLTIP} position="top">
                        <i
                            className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                            id="rs_keyword_info"
                        />
                    </RSTooltip>
                </Col>
                <Col sm={9} id="rs_custom_keyword_input">
                    <RSInput
                        name="keyword"
                        control={control}
                        label={ENTER_KEYWORD}
                        placeholder={ENTER_KEYWORD}
                        required={!isViewMode}
                        disabled={isViewMode}
                        rules={!isViewMode ? {
                            required: THIS_FIELD_IS_REQUIRED,
                            validate: (value) => {
                                const trimmed = (value || '').trim().toLowerCase();
                                const isDuplicate = customKeywordsData.some(
                                    (row) =>
                                        row.keyName?.toLowerCase() === trimmed &&
                                        row.sbisId !== editModal.item?.sbisId
                                );
                                return isDuplicate ? KEYWORD_ALREADY_EXISTS : true;
                            },
                        } : {}}
                        maxLength={MAX_LENGTH50}
                    />
                </Col>
            </Row>

            <Row className="align-items-center mb20">
                <Col sm={3} className="d-flex align-items-center">
                    <label className="control-label-left mb0">{ACTION_TYPE}</label>
                    <RSTooltip text={ACTION_TYPE_TOOLTIP} position="top">
                        <i
                            className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                            id="rs_action_type_info"
                        />
                    </RSTooltip>
                </Col>
                <Col sm={9} id="rs_custom_action_type">
                    <RSKendoDropDownList
                        name="actionType"
                        data={actionTypeOptions}
                        control={control}
                        textField="keyValue"
                        dataItemKey="inboundkeyvalueID"
                        label={ACTION_TYPE}
                        required={!isViewMode}
                        disabled={isViewMode}
                        rules={!isViewMode ? { required: SELECT_VALUE } : {}}
                    />
                </Col>
            </Row>

            <Row className="align-items-start mb10">
                <Col sm={3} className="d-flex align-items-center mt10">
                    <label className="control-label-left mb0">{RESPONSE_MESSAGE}</label>
                    <RSTooltip text={RESPONSE_MESSAGE_TOOLTIP} position="top">
                        <i
                            className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                            id="rs_response_message_info"
                        />
                    </RSTooltip>
                </Col>
                <Col sm={9}>
                    <TextEditor
                        name="responseMessage"
                        control={control}
                        rules={
                            !isViewMode
                                ? {
                                      required: MESSAGE_IS_REQUIRED,
                                      validate: {
                                          notWhitespaceOnly: (v) =>
                                              (typeof v === 'string' && v.trim().length > 0) ||
                                              MESSAGE_CANNOT_BE_WHITESPACE_ONLY,
                                      },
                                  }
                                : {}
                        }
                        maxLength={MAX_LENGTH500}
                        disabled={isViewMode}
                    />
                </Col>
            </Row>
        </div>
    );

    const modalFooter = (
        <div className="d-flex justify-content-end gap-2 w-100">
            <RSSecondaryButton
                type="button"
                blockInteraction={isSaveLoading}
                onClick={() => {
                    if (isSaveLoading) return;
                    handleModalClose();
                }}
                id="rs_custom_keyword_cancel"
            >
                {CANCEL}
            </RSSecondaryButton>
            {!isViewMode && (isAddMode ? addAccess : updateAccess) && (
                <RSPrimaryButton
                    type="button"
                    onClick={handleSubmit(handleModalSubmit)}
                    className={`${!isValid ? 'click-off' : ''}`}
                    isLoading={isSaveLoading}
                    id="rs_custom_keyword_save"
                >
                    {isAddMode ? ADD : UPDATE}
                </RSPrimaryButton>
            )}
        </div>
    );

    return (
        <>
            {getWarningPopupMessage(failureApiErrors, dispatch)}
            <div className="rs-sub-heading mt15">
                <div className="align-items-center d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                        <h4 className="mb0">{CUSTOM_KEYWORDS}</h4>
                        <RSTooltip text={CUSTOM_KEYWORDS_TOOLTIP} position="top">
                            <i
                                className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                                id="rs_custom_keywords_info"
                            />
                        </RSTooltip>
                    </div>
                    {!isCreate &&
                        <RSTooltip position="top" text={ADD_CUSTOM_KEYWORD} className="lh0">
                            <i
                                onClick={handleAddClick}
                                className={`icon-md color-primary-blue icon-hover-shadow-primary ${
                                    circle_plus_fill_edge_medium
                                } ${!addAccess ? 'click-off pe-none' : ''}`}
                                id="rs_custom_keyword_add"
                            />
                        </RSTooltip>
                    }
                </div>
            </div>

            <KendoGrid
                data={customKeywordsData}
                isLoading={isLoading}
                noBoxShadow
                isFailure={!customKeywordsData?.length}
                settings={{ total: customKeywordsData?.length }}
                isCustomBox
                noDataText={NO_CUSTOM_KEYWORDS}
                column={[
                    {
                        field: 'keyName',
                        title: KEYWORD,
                        width: 150,
                        cell: ({ dataItem }) => (
                            <td>
                                <span>{dataItem?.keyName}</span>
                            </td>
                        ),
                    },
                    {
                        field: 'keyValue',
                        title: ACTION_TYPE,
                        width: 130,
                        cell: ({ dataItem }) => (
                            <td>
                                <span>{dataItem?.keyValue}</span>
                            </td>
                        ),
                    },
                    {
                        field: 'message',
                        title: RESPONSE_MESSAGE,
                        cell: ({ dataItem }) => (
                            <TruncatedCell value={dataItem?.message} />
                        ),
                    },
                    {
                        field: 'actions',
                        title: ACTIONS,
                        width: 120,
                        cell: (props) => (
                            <td>
                                <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                    <li onClick={() => handleEditClick(props.dataItem)}>
                                        <RSTooltip text={isViewMode ? VIEW : EDIT} position="top">
                                            <i
                                                id="rs_custom_keyword_pencil_edit"
                                                className={`${isViewMode ? eye_medium : pencil_edit_medium} icon-md color-primary-blue`}
                                            />
                                        </RSTooltip>
                                    </li>
                                    <li className={`${!deleteAccess ? 'pe-none click-off' : ''}`}>
                                        <RSTooltip text={DELETE} position="top">
                                            <div onClick={() => handleDeleteClick(props.dataItem)}>
                                                <i
                                                    id="rs_custom_keyword_delete"
                                                    className={`${delete_medium} icon-md color-primary-red`}
                                                />
                                            </div>
                                        </RSTooltip>
                                    </li>
                                </ul>
                            </td>
                        ),
                    },
                ]}
            />

            <RSModal
                show={editModal.show}
                header={modalHeader}
                size="lg"
                handleClose={handleModalClose}
                body={modalBody}
                footer={modalFooter}
            />

            <RSConfirmationModal
                show={deleteModal.show}
                handleConfirm={handleDeleteConfirm}
                handleClose={handleDeleteClose}
            />
        </>
    );
};

export default CustomKeywords;
