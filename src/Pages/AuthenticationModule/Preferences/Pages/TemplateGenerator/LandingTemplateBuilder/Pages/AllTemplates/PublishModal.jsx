import { NO_DATA_AVAILABEL, PUBLISH_URL_COPIED_SUCCESSFULLY } from 'Constants/GlobalConstant/Placeholders';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { Fragment, useEffect, useState } from 'react';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import { lp_Template_Publish } from 'Reducers/preferences/EmailBuilder/request';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';

const PublishModal = ({ show, handleClose, templateName, landingPageTemplateId }) => {
    const methods = useForm();
    const { control, setValue } = methods;
    const dispatch = useDispatch();
    const [copied, setCopied] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFailure, setIsFailure] = useState({
        status: false,
        message: '',
    });

    useEffect(() => {
        if (!show) {
            setCopied('');
            setIsLoading(false);
            setIsFailure({ status: false, message: '' });
            setValue('templatePublish', '');
            return;
        }
        if (!landingPageTemplateId) {
            return;
        }
        fetchData();
    }, [show, landingPageTemplateId]);

    const fetchData = async () => {
        setIsLoading(true);
        setIsFailure({ status: false, message: '' });
        try {
            const payload = {
                templateId: landingPageTemplateId,
            };
            const res = await dispatch(lp_Template_Publish({ payload }, { loading: false }));

            if (res?.status) {
                setCopied(res?.data?.formtypeurl);
                setValue('templatePublish', res?.data?.formtypeurl);
            } else {
                setIsFailure({
                    status: true,
                    message: res?.message || NO_DATA_AVAILABEL,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        toast.success(PUBLISH_URL_COPIED_SUCCESSFULLY, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        setTimeout(() => {
            handleClose();
        }, 500);
    };

    const handleModalClose = () => {
        if (isLoading) {
            return;
        }
        handleClose();
    };

    return (
        <RSModal
            show={show}
            size="xl"
            header={templateName + '-  Publish URL'}
            handleClose={handleModalClose}
            isCloseDisabled={isLoading}
            body={
                <Fragment>
                    {isLoading ? (
                        <Row className="form-group top50 ml30" aria-hidden="true">
                            <Col sm={2}>
                                <CommonSkeleton box height={19} width={40} stopAnimation />
                            </Col>
                            <Col sm={8} className="form-group">
                                <CommonSkeleton box height={38} width="100%" stopAnimation />
                            </Col>
                        </Row>
                    ) : !isFailure?.status ? (
                        <Row className="form-group top50 ml30">
                            <Col sm={2}>
                                <label className="control-label-left">URL</label>
                            </Col>

                            <Col sm={8} className="form-group">
                                <div className="form-group ">
                                    <RSInput name={'templatePublish'} disabled={true} control={control} />
                                </div>
                            </Col>
                        </Row>
                    ) : (
                        <div className="text-center">{isFailure?.message}</div>
                    )}
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton blockInteraction={isLoading} onClick={handleModalClose}>
                        Cancel
                    </RSSecondaryButton>
                    {!isFailure?.status && !isLoading && copied && (
                        <CopyToClipboard text={copied} onCopy={handleCopy}>
                            <RSPrimaryButton>Copy</RSPrimaryButton>
                        </CopyToClipboard>
                    )}
                </Fragment>
            }
        />
    );
};

export default PublishModal;
