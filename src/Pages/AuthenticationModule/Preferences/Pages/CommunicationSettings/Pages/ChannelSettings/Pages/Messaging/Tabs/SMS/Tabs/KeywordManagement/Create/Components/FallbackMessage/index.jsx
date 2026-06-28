import { MAX_LENGTH500 } from 'Constants/GlobalConstant/Regex';
import { MESSAGE_CANNOT_BE_WHITESPACE_ONLY, MESSAGE_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { ACTIONS, CANCEL, EDIT, EDIT_FALLBACK_MESSAGE, FALLBACK_MESSAGE, FALLBACK_MESSAGE_TOOLTIP, NO_FALLBACK_MESSAGE, RESPONSE_MESSAGE, UPDATE, VIEW, VIEW_FALLBACK_MESSAGE } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, eye_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';

import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import { getSmsOptoutFallbackKeywords, updateSmsOptoutFallbackKeywords } from 'Reducers/preferences/CommunicationSettings/request';

import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
// import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import TextEditor from '../TextEditor';



const FallbackMessage = ({ clientSmsSenderID = null, isCreate = false }) => {
    const dispatch = useDispatch();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const fallbackData = useSelector((state) => state.communicationSettingsReducer.fallbackMessageData);
    const isLoading = useSelector((state) => state.communicationSettingsReducer.fallbackMessageLoading);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { permissions } = usePermission();
    const { updateAccess } = permissions || {};

    const [editModal, setEditModal] = useState({ show: false, item: null });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'edit' });
    const isSaveLoading = saveApi.isFetching;

    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' });

    // useEffect(() => {
    //     dispatch(getPersonalizationFields({ payload: { clientId, departmentId, userId } }));
    // }, []);

    const fetchFallback = useCallback(async () => {
        await dispatch(
            getSmsOptoutFallbackKeywords({ clientId, departmentId, userId, ClientSmsSenderID: clientSmsSenderID })
        );
    }, [clientSmsSenderID]);

    useEffect(() => {
        if (isCreate) return;
        fetchFallback();
    }, [clientSmsSenderID]);

    const handleEditClick = (dataItem) => {
        reset({ responseMessage: dataItem?.message || '' });
        setEditModal({ show: true, item: dataItem });
    };

    const handleModalClose = () => {
        setEditModal({ show: false, item: null });
        reset({ responseMessage: '' });
    };

    const handleModalSubmit = async (formState) => {
        if (isSaveLoading) return;
        const payload = {
            clientId,
            departmentId,
            userId,
            SBIS_ID: editModal.item?.sbiS_ID,
            Message: formState.responseMessage,
        };
        const response = await saveApi.refetch({
            fetcher: () => dispatch(updateSmsOptoutFallbackKeywords(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'edit',
        });
        handleModalClose();
        if (response?.status) {
            fetchFallback();
        }
    };

    const modalBody = (
        <Row className="align-items-start">
            <Col sm={4} className="d-flex align-items-center pr0">
                <label className="control-label-left mt-3">{RESPONSE_MESSAGE}</label>
                {/* <RSTooltip text={FALLBACK_MESSAGE_TOOLTIP} position="top" innerContent={false}>
                    <i
                        className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                        id="rs_fallback_response_info"
                    />
                </RSTooltip> */}
            </Col>
            <Col sm={8}>
                <TextEditor
                    name="responseMessage"
                    control={control}
                    resize="none"
                    rules={
                        updateAccess
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
                    disabled={!updateAccess || isCreate}
                />
            </Col>
        </Row>
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
                id="rs_fallback_cancel"
            >
                {CANCEL}
            </RSSecondaryButton>
            {updateAccess && !isCreate && (
                <RSPrimaryButton
                    type="button"
                    onClick={handleSubmit(handleModalSubmit)}
                    className={`${!isValid ? 'click-off' : ''}`}
                    isLoading={isSaveLoading}
                    id="rs_fallback_update"
                >
                    {UPDATE}
                </RSPrimaryButton>
            )}
        </div>
    );

    return (
        <>
        {getWarningPopupMessage(failureApiErrors, dispatch)}
        <div className="mt20">
            <div className="rs-sub-heading">
                <div className="align-items-center d-flex">
                    <h4 className="mb0">{FALLBACK_MESSAGE}</h4>
                    <RSTooltip text={FALLBACK_MESSAGE_TOOLTIP} position="top">
                        <i
                            className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                            id="rs_fallback_message_info"
                        />
                    </RSTooltip>
                </div>
            </div>

            <KendoGrid
                data={fallbackData}
                isLoading={isLoading}
                noBoxShadow
                isFailure={!fallbackData?.length}
                settings={{ total: fallbackData?.length }}
                isCustomBox
                noDataText={NO_FALLBACK_MESSAGE}
                column={[
                    {
                        field: 'message',
                        title: RESPONSE_MESSAGE,
                        cell: ({ dataItem }) => (
                            <TruncatedCell value={dataItem?.message} />
                        ),
                    },
                    {
                        field: 'action',
                        title: ACTIONS,
                        width: 100,
                        cell: (props) => (
                            <td>
                                <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                    <li onClick={() => handleEditClick(props.dataItem)}>
                                        <RSTooltip
                                            text={updateAccess && !isCreate ? EDIT : VIEW}
                                            position="top"
                                        >
                                            <i
                                                id="rs_fallback_pencil_edit"
                                                className={`${updateAccess && !isCreate ? pencil_edit_medium : eye_medium} icon-md color-primary-blue`}
                                            />
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
                header={updateAccess ? EDIT_FALLBACK_MESSAGE : VIEW_FALLBACK_MESSAGE}
                size="lg"
                handleClose={handleModalClose}
                body={modalBody}
                footer={modalFooter}
            />
        </div>
        </>
    );
};

export default FallbackMessage;
