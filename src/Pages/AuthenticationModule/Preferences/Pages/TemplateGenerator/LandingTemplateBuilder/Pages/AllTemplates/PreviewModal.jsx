import { NO_DATA_AVAILABEL } from 'Constants/GlobalConstant/Placeholders';
import RSModal from 'Components/RSModal';
import { lp_Template_preview } from 'Reducers/preferences/EmailBuilder/request';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
const PreviewModal = ({ show, handleClose, templateName, landingPageTemplateId }) => {
    const [contentData, setContentData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFailure, setIsFailure] = useState({
        status: false,
        message: '',
    });
    const dispatch = useDispatch();
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!show) {
            setContentData('');
            setIsLoading(false);
            setIsFailure({ status: false, message: '' });
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
                channelId: 32,
                templateId: landingPageTemplateId,
            };
            const res = await dispatch(lp_Template_preview({ payload }, { loading: false }));
            if (res?.status) {
                setContentData(res?.data);
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

    useEffect(() => {
        if (!contentData || isLoading || !iframeRef.current) {
            return;
        }
        const timeoutId = setTimeout(() => {
            const iframeDoc = iframeRef.current?.contentDocument;
            if (iframeDoc) {
                const body = iframeDoc.body;
                body.style.overflow = 'auto';
                body.style.pointerEvents = 'none';
                iframeRef.current.style.overflow = 'auto';

                const style = iframeDoc.createElement('style');
                style.textContent = `
                     @-moz-document url-prefix() {
        scrollbar-color: #999999 #e9e9e9;
      }
      @-moz-document url-prefix() {
        scrollbar-width: thin;
      }
      ::-webkit-scrollbar-track {
        display: none;
        background: transparent;
      }
      ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
        background-color: transparent;
        border-radius: 3px;
        transition: 0.3s ease all;
      }
      ::-webkit-scrollbar-thumb {
         background-color: transparent;
        border-radius: 100px;
        -webkit-border-radius: 100px;
        -moz-border-radius: 100px;
        cursor: pointer;
      }
                `;
                iframeDoc.head.appendChild(style);
            }
        }, 10);
        return () => clearTimeout(timeoutId);
    }, [contentData, isLoading]);

    const handleModalClose = () => {
        if (isLoading) {
            return;
        }
        handleClose();
    };

    return (
        <RSModal
            show={show}
            size="xxlg"
            header={templateName + ' - Preview'}
            handleClose={handleModalClose}
            isCloseDisabled={isLoading}
            closeTooltipPosition={true}
            body={
                <Fragment>
                    {isLoading ? (
                        <div className="pref-landing-preview-skeleton p15" aria-hidden="true" style={{ minHeight: '70vh' }}>
                            <CommonSkeleton box height={48} width="100%" stopAnimation />
                            <CommonSkeleton box height={180} width="100%" stopAnimation mainClass="mt20" />
                            <CommonSkeleton box height={16} width="70%" stopAnimation mainClass="mt20 mx-auto d-block" />
                            <CommonSkeleton box height={16} width="55%" stopAnimation mainClass="mt10 mx-auto d-block" />
                            <CommonSkeleton box height={120} width="85%" stopAnimation mainClass="mt25 mx-auto d-block" />
                            <CommonSkeleton box height={36} width={160} stopAnimation mainClass="mt25 mx-auto d-block" />
                        </div>
                    ) : !isFailure?.status ? (
                        <iframe
                            ref={iframeRef}
                            srcDoc={contentData}
                            style={{ width: '100%', height: '100vh', border: 'none' }}
                            title={`${templateName} preview`}
                        />
                    ) : (
                        <div className="text-center">{isFailure?.message}</div>
                    )}
                </Fragment>
            }
        />
    );
};

export default PreviewModal;
