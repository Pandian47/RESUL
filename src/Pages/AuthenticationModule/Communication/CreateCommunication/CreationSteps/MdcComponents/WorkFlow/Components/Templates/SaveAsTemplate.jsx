import { ENTER_TEMPLATE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, SAVE, SAVE_AS_TEMPLATE, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import AlertModal from '../Modal/AlertModal';

import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import { mdcSaveAsTemplate } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { convertTemplate, targetCode } from './TemplateConst';
import useApiLoader from 'Hooks/useApiLoader';
const SaveAsTemplate = ({ isShowSaveAsTemplate, primaryGoal, handleClose, handleUpdatetemplateList }) => {
    const dispatch = useDispatch();
    const saveTemplateLoader = useApiLoader({ autoFetch: false });
    const [isShow, setShow] = useState(isShowSaveAsTemplate);
    const [isShowSavedStatus, setShowSavedStatus] = useState(false);
    const [statusText, setStatusText] = useState({});
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { canvasState } = useContext(CreateWorkFlowContext);
    const { handlePriorityApi, setIsNewTemplateSaved } = useContext(CreateWorkFlowOtherContext);
    const isSaveLoading = saveTemplateLoader.isFetching;
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm();

    useEffect(() => {
        setShow(isShowSaveAsTemplate);
    }, [isShowSaveAsTemplate]);

    const handleSaveAsTemplate = async (data) => {
        const { templateName } = data;
        const { mdcTemplate } = convertTemplate(canvasState);
        const payload = {
            departmentId,
            clientId,
            userId,
            templateName,
            goalType: targetCode[primaryGoal],
            templateData: mdcTemplate,
        };

        const result = await saveTemplateLoader.refetch({
            fetcher: async () => {
                const priorityResponse = await handlePriorityApi();
                if (!priorityResponse?.status) {
                    return { status: false, message: priorityResponse?.message || '' };
                }
                return dispatch(mdcSaveAsTemplate({ payload, loading: false }));
            },
        });

        const { message, status } = result || {};
        setShow(false);
        setShowSavedStatus(true);

        if (status) {
            setStatusText({ type: true, text: 'Template created successfully' });
            setIsNewTemplateSaved(true);
        } else if (!status && message?.includes('already exists')) {
            setStatusText({ type: false, text: 'Template name already exists' });
        } else {
            setStatusText({ type: false, text: message || 'Unable to save template' });
        }
    };

    const handleAlertClose = () => {
        setShowSavedStatus(false);
        handleClose();
    };

    const handleModalClose = () => {
        if (isSaveLoading) return;
        handleClose();
    };

    return (
        <>
            <RSModal
                size={'md'}
                show={isShow}
                handleClose={handleModalClose}
                header={SAVE_AS_TEMPLATE}
                body={
                    <>
                        <Row>
                            <Col sm={12}>
                                <RSInput
                                    name="templateName"
                                    placeholder={TEMPLATE_NAME}
                                    control={control}
                                    required
                                    rules={{
                                        required: ENTER_TEMPLATE_NAME,
                                        minLength: {
                                            value: 3,
                                            message: 'Min. 3 char',
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-start mt10">
                                <small>
                                    {`* MDC Templates are mapped with the ${primaryGoal} goal type, you are saving this flow as ${primaryGoal} `}
                                </small>
                            </Col>
                        </Row>
                    </>
                }
                footer={
                    <>
                        <RSSecondaryButton onClick={handleModalClose} disabled={isSaveLoading}>
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleSubmit(handleSaveAsTemplate)}
                            className={!isValid || isSaveLoading ? 'click-off' : ''}
                            isLoading={isSaveLoading}
                            loadingText={SAVE}
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    </>
                }
            ></RSModal>

            {isShowSavedStatus && (
                <AlertModal show={isShowSavedStatus} data={statusText} handleClose={handleAlertClose} />
            )}
        </>
    );
};

export default SaveAsTemplate;
