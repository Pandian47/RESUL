import { scolor1 } from 'Components/Skeleton/Components/constants';
import { useEffect, useState } from 'react';
import RSModal from 'Components/RSModal';
import { RSSecondaryButton } from 'Components/Buttons';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { ChannelPreviewSkeleton } from 'Components/Skeleton/Skeleton';
import { useSelector } from 'react-redux';

const PREVIEW_PANEL_HEIGHT = 330;

const hasMeaningfulHtml = (html) => {
    if (!html || typeof html !== 'string') return false;

    const trimmed = html.trim();
    if (!trimmed) return false;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = trimmed;

    if (tempDiv.querySelector('img[src], iframe[src], video source, audio source')) {
        return true;
    }

    const textContent = tempDiv.textContent?.replace(/\u00a0/g, ' ').trim() || '';
    return textContent.length > 0;
};

const ClickMapPreviewPanel = ({ children, variant = 'empty' }) => (
    <div
        className="listing-preview-scroll listing-preview-skeleton px0 border-r10 skeleton-span-con position-relative"
        style={{
            height: PREVIEW_PANEL_HEIGHT,
            minHeight: PREVIEW_PANEL_HEIGHT,
            background: variant === 'empty' ? scolor1 : undefined,
            border: variant === 'empty' ? `1px solid ${scolor1}` : undefined,
            overflow: 'hidden',
        }}
    >
        {children}
    </div>
);

export const EdmPreview = ({ show, onHide, selectedItem, isPreviewLoading = false }) => {
    const { linkPreviewData } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const [processedHtml, setProcessedHtml] = useState('');
    const [isContentReady, setIsContentReady] = useState(false);

    useEffect(() => {
        if (isPreviewLoading) {
            setProcessedHtml('');
            setIsContentReady(false);
            return;
        }

        const rawContent = typeof selectedItem === 'string' ? selectedItem.trim() : '';
        if (!rawContent) {
            setProcessedHtml('');
            setIsContentReady(true);
            return;
        }

        let htmlString = rawContent;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const aTagsToWrap = tempDiv.querySelectorAll('a');
        const overlayHeatMap = tempDiv.querySelectorAll('.overlayHeatMap');
        overlayHeatMap?.forEach((ele) => {
            ele.style.position = 'relative';
            ele.style.display = 'block';
        });
        const linkUrls = linkPreviewData?.linkClickList?.map((item) => item.url) ?? [];
        aTagsToWrap.forEach((aTagToWrap, index) => {
            const hreftrim = aTagToWrap.href.endsWith('/') ? aTagToWrap.href.slice(0) : aTagToWrap.href;
            const getInd = linkUrls.findIndex(
                (url) => url === hreftrim.trim() || url === hreftrim.trim().replace(/\/$/, ''),
            );

            if (linkUrls.includes(hreftrim) || linkUrls.includes(hreftrim.replace(/\/$/, ''))) {
                const spanElement = document.createElement('span');
                spanElement.style.backgroundColor = 'yellow';
                spanElement.style.color = 'black';
                const style2 = {
                    background: '#99142d',
                    color: '#fff',
                    padding: '6px',
                    fontSize: '11px',
                    position: 'relative',
                    top: '0',
                    marginTop: '20px',
                    marginBottom: '5px',
                    display: 'inline-block',
                };
                for (const [key, val] of Object.entries(style2)) {
                    spanElement.style[key] = val;
                }

                spanElement.id = `spanLink_${index}`;
                spanElement.className = 'spanLink';

                const childSpan = document.createElement('span');
                const childSpan_line = document.createElement('span');

                const style = {
                    display: 'inline-block',
                    background: '#0bc30b',
                    position: 'absolute',
                    bottom: '100%',
                    left: '0px',
                    paddingTop: '5px',
                    paddingLeft: '10px',
                    paddingBottom: '5px',
                    paddingRight: '10px',
                };
                for (const [key, val] of Object.entries(style)) {
                    childSpan.style[key] = val;
                }

                childSpan.className = 'spanlinkCount';
                childSpan_line.className = 'spanlinkLine';
                const linkClick = linkPreviewData?.linkClickList?.[getInd];
                childSpan.textContent = `${linkClick?.percentage ?? 0}% (${linkClick?.totalUniqueClicks ?? 0})`;
                if ((linkClick?.percentage ?? 0) <= 20) {
                    childSpan.style.backgroundColor = 'blue';
                    spanElement.style.backgroundColor = '#0d0de130';
                } else if ((linkClick?.percentage ?? 0) <= 40) {
                    childSpan.style.backgroundColor = 'green';
                    spanElement.style.backgroundColor = 'green';
                } else if ((linkClick?.percentage ?? 0) <= 60) {
                    childSpan.style.backgroundColor = 'yellow';
                    spanElement.style.backgroundColor = '#eaea0d30';
                    childSpan.style.color = '#000';
                } else if ((linkClick?.percentage ?? 0) <= 80) {
                    childSpan.style.backgroundColor = 'orange';
                    spanElement.style.backgroundColor = 'orange';
                } else {
                    childSpan.style.backgroundColor = 'red';
                    spanElement.style.backgroundColor = 'red';
                }
                childSpan.style.opacity = '75%';
                childSpan.style.transform = 'translateY(-1px)%';
                childSpan.style.fontSize = '11px';
                childSpan.style.whiteSpace = 'pre';
                spanElement.style.color = 'hsl(220, calc(100  1%), calc(81  1%))';
                spanElement.style.fontFamily = ' verdana, geneva, sans-serif';
                spanElement.style.letterSpacing = '0';
                aTagToWrap.parentNode.replaceChild(spanElement, aTagToWrap);
                spanElement.appendChild(aTagToWrap);
                spanElement.appendChild(childSpan);
                spanElement.appendChild(childSpan_line);
            }
        });

        const spanLinkElements = tempDiv.querySelectorAll('.spanLink');
        spanLinkElements.forEach((element) => {
            const parentElement = element.parentElement;
            parentElement.style.position = 'relative';
        });
        htmlString = tempDiv.innerHTML;
        setProcessedHtml(htmlString);
        setIsContentReady(true);
    }, [selectedItem, linkPreviewData, isPreviewLoading]);

    const showSkeleton = isPreviewLoading || !isContentReady;
    const showContent = isContentReady && hasMeaningfulHtml(processedHtml);

    const renderBody = () => {
        if (showSkeleton) {
            return (
                <ClickMapPreviewPanel variant="loading">
                    <ChannelPreviewSkeleton />
                </ClickMapPreviewPanel>
            );
        }

        if (!showContent) {
            return (
                <ClickMapPreviewPanel variant="empty">
                    <NoDataAvailableRender className="nodata-skeleton-con" />
                </ClickMapPreviewPanel>
            );
        }

        return (
            <div className="css-scrollbar">
                <div
                    className="click-map-edm mx-auto d-block"
                    style={{ maxHeight: '400px', maxWidth: '600px' }}
                >
                    <div className="pe-none" dangerouslySetInnerHTML={{ __html: processedHtml }} />
                </div>
            </div>
        );
    };

    return (
        <RSModal
            show={show}
            size="xlg"
            header="Click map"
            handleClose={onHide}
            body={renderBody()}
            // footer={
            //     <>
            //         <RSSecondaryButton onClick={onHide}>Close</RSSecondaryButton>
            //     </>
            // }
        />
    );
};
