import { memo, useEffect, useRef, useState } from 'react';
const SCALE_FACTOR = 0.4;
const ANALYTICS_IFRAME_HEIGHT = 930;

const EmailListPreview = ({ data }) => {
    const content = data?.content || '';
    const footerContent = data?.footerContent || '';
    const previewImage = data?.previewImage || '';
    const showAsHtml = data?.showAsHtml || false;
    const isModalPreview = data?.isModalPreview || false;
    const iframeRef = useRef(null);
    const isAnalytics = data?.isAnalytics || false;
    const [iframeHeight, setIframeHeight] = useState(null);
    const observerRef = useRef(null);
    const resizeObserverRef = useRef(null);

    useEffect(() => {
        setIframeHeight(null);
        const iframe = iframeRef.current;
        if (!iframe) return;

        const measureHeight = () => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc?.body) return;
                const style = doc.createElement('style');
                style.textContent =
                    'html, body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }';
                if (!doc.head.querySelector('[data-height-reset]')) {
                    style.setAttribute('data-height-reset', '');
                    doc.head.appendChild(style);
                }
                const height = doc.body.offsetHeight;
                if (height > 0) setIframeHeight(height);
            } catch {
                // cross-origin — ignore
            }
        };

        const onLoad = () => {
            const retryDelays = [50, 200, 500, 1000];
            retryDelays.forEach((ms) => setTimeout(measureHeight, ms));

            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc?.body) return;

                observerRef.current?.disconnect();
                observerRef.current = new MutationObserver(measureHeight);
                observerRef.current.observe(doc.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });

                resizeObserverRef.current?.disconnect();
                resizeObserverRef.current = new ResizeObserver(measureHeight);
                resizeObserverRef.current.observe(doc.body);

                doc.querySelectorAll('img').forEach((img) => {
                    if (!img.complete) img.addEventListener('load', measureHeight);
                });
            } catch {
                // cross-origin — ignore
            }
        };

        iframe.addEventListener('load', onLoad);

        if (iframe.contentDocument?.readyState === 'complete') {
            onLoad();
        }

        return () => {
            iframe.removeEventListener('load', onLoad);
            observerRef.current?.disconnect();
            resizeObserverRef.current?.disconnect();
        };
    }, [content, footerContent, showAsHtml, previewImage]);

    const previewCss = `
        <style>
        html, body { margin: 0 !important; padding: 0 !important; box-sizing: border-box; overflow: hidden !important; }
            table.main-column.social-table td { font-size: 0 !important; }
            table.main-column.social-table td table.pc-w620-width-auto {
                display: inline-block !important;
                width: auto !important;
                vertical-align: middle !important;
            }
            a, button, input, textarea, select, img {
                pointer-events: none !important;
                cursor: default !important;
            }
            /* Carousel: parent wrapper as flex column for correct ordering */
            div:has(> [id^="rs-amp-carousel-fb-"]) {
                display: flex !important;
                flex-direction: column !important;
            }
            /* Show interactive (AMP) carousel first */
            [id^="rs-amp-carousel-inter-"] {
                order: 1 !important;
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            /* Show fallback below the interactive version */
            [id^="rs-amp-carousel-fb-"], [class*="fallback"], [id*="fallback"], [fallback] {
                order: 2 !important;
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            h1, h2, h3, h4, h5, h6, p {
                word-wrap: break-word !important;
            }
            p {
                font-size: 2.0625rem !important; /* 17px */
                line-height: 1.25 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            h1 { font-size: 3rem !important; /* 32px */ }
            h2 { font-size: 2.4375rem !important; /* 23px */ }
            h3 { font-size: 2.3125rem; /* 21px */ }
            h4 { font-size: 2.1875rem !important; /* 19px */ }
            h5 { font-size: 2.0625rem !important; /* 17px */ }
            h6 { font-size: 1.9375rem !important; /* 15px */ }
            body, body > table, body > div {
                height: auto !important;
                min-height: 0 !important;
            }
        </style>
    `;

    const injectCss = (html) => {
        if (!html) return '';
        let processedHtml = html;
        if (processedHtml.includes('</head>')) return processedHtml.replace('</head>', `${previewCss}</head>`);
        return `${previewCss}${processedHtml}`;
    };

    if (!showAsHtml && previewImage) {
        return (
            <div className="rs-preview-content css-scrollbar">
                <img alt="Email Preview" src={previewImage} />
            </div>
        );
    }

    if (!showAsHtml && content) {
        return (
            <div className="rs-preview-content css-scrollbar">
                <img alt="Email Preview" src={`data:image/jpeg;base64,${content}`} />
            </div>
        );
    }

    const rawHeight = iframeHeight;
    const visualHeight = rawHeight ? Math.round(rawHeight * SCALE_FACTOR) : null;

    const iframeDoc = injectCss(`${content}${footerContent || ''}`);

    return (
        <div className="rs-email-preview-wrapper">
            <div className="email-preview-container">
                <div className="rspc-content">
                    <div className={`email-listing-preview ${isModalPreview ? ' modal-email-preview' : ''}`}>
                        <div
                            className="preview-iframe-clip"
                            style={
                                visualHeight
                                    ? { height: `${visualHeight + 20}px`, padding: '5px 5px' }
                                    : { padding: '5px 5px' }
                            }
                        >
                            <iframe
                                key={`email-html-${String(content || '').length}-${String(content || '').slice(0, 48)}`}
                                ref={iframeRef}
                                title="Email HTML preview"
                                className={`${isAnalytics ? 'preview-email-iframe-analytics' : 'preview-email-iframe'}${
                                    !iframeHeight && !isAnalytics ? ' preview-iframe-hidden' : ''
                                }`}
                                srcDoc={iframeDoc}
                                style={{ height: iframeHeight ? `${iframeHeight}px` : '0px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(EmailListPreview);
