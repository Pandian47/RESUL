import RSModal from 'Components/RSModal';
import { useEffect, useState } from 'react';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';

const PreviewModal = ({ show, handleClose, data, isLoading = false }) => {
    const [clientheight, setClientheight] = useState(0);

    const calculateHeight = () => {
        setTimeout(() => {
            const iframeEl = document.querySelector('#footerEDM iframe');
            const edmelement = document.querySelector('#footerEDM.edm-import-wrapper');

            if (iframeEl && iframeEl.contentDocument) {
                const htmlNode = iframeEl.contentDocument.children?.[0];
                const bodyNode = Array.from(htmlNode?.childNodes || []).find(
                    (node) => node.nodeType === 1 && node.nodeName.toLowerCase() === 'body',
                );
                const height = bodyNode?.offsetHeight;
                if (height) {
                    setClientheight(height);
                    if (edmelement) {
                        edmelement.style.height = `${height + 10}px`;
                    }
                }
            }
        }, 1000);
    };

    useEffect(() => {
        if (show && !isLoading && data && data.length !== 0) {
            calculateHeight();
        }
    }, [show, data, isLoading]);

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header="Preview"
            className="Preview_emailFooter"
            closeTooltipPosition
            bodyClassName="custom_modal_tableTop"
            body={
                <div className="form-group mt15 pref-email-footer-preview-body">
                    {isLoading ? (
                        <div className="pref-email-footer-preview-skeleton" aria-hidden="true">
                            <CommonSkeleton box height={48} width="100%" stopAnimation />
                            <CommonSkeleton box height={120} width="85%" stopAnimation mainClass="mt20 mx-auto d-block" />
                            <CommonSkeleton box height={14} width="70%" stopAnimation mainClass="mt20 mx-auto d-block" />
                            <CommonSkeleton box height={14} width="55%" stopAnimation mainClass="mt10 mx-auto d-block" />
                            <CommonSkeleton box height={32} width={140} stopAnimation mainClass="mt25 mx-auto d-block" />
                        </div>
                    ) : (
                        <div
                            id="footerEDM"
                            className="d-flex justify-content-center pe-none rs-auth-footer-holder edm-import-wrapper"
                        >
                            <iframe
                                srcDoc={data}
                                className="w-100 border-0"
                                style={{
                                    minHeight: clientheight,
                                }}
                                onLoad={calculateHeight}
                                title="Email footer preview"
                            />
                        </div>
                    )}
                </div>
            }
        />
    );
};

export default PreviewModal;
