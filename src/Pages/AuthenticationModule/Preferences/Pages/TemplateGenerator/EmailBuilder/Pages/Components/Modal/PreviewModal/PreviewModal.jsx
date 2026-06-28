import { useState, useMemo } from 'react';
import RSModal from 'Components/RSModal';

const PreviewModal = ({ show = false, handleClose = () => { }, data = '', title = 'Preview' }) => {
    const [previewMode, setPreviewMode] = useState('amp');

    const hasAmp = useMemo(() => data?.includes('<!-- Start of Script amp Conditions -->'), [data]);

    const processEmailHTML = (rawHTML, mode) => {
        if (!rawHTML || !hasAmp) return rawHTML;

        let processedHTML = rawHTML;
        const ampStart = "<!-- Start of Script amp Conditions -->";
        const ampEnd = "<!-- End of Script amp Conditions -->";
        const htmlStart = "<!-- Start of Script html Conditions -->";
        const htmlEnd = "<!-- End of Script html Conditions -->";

        if (mode === 'amp') {
            while (processedHTML.includes(ampStart)) {
                const startIndex = processedHTML.indexOf(ampStart);
                const endIndex = processedHTML.indexOf(ampEnd, startIndex);
                if (endIndex === -1) break;
                const before = processedHTML.substring(0, startIndex);
                const ampContent = processedHTML.substring(startIndex + ampStart.length, endIndex);
                const after = processedHTML.substring(endIndex + ampEnd.length);
                processedHTML = before + ampContent + after;
            }
            while (processedHTML.includes(htmlStart)) {
                const startIndex = processedHTML.indexOf(htmlStart);
                const endIndex = processedHTML.indexOf(htmlEnd, startIndex);
                if (endIndex === -1) break;
                const before = processedHTML.substring(0, startIndex);
                const after = processedHTML.substring(endIndex + htmlEnd.length);
                processedHTML = before + after;
            }
        } else {
            while (processedHTML.includes(ampStart)) {
                const startIndex = processedHTML.indexOf(ampStart);
                const endIndex = processedHTML.indexOf(ampEnd, startIndex);
                if (endIndex === -1) break;
                const before = processedHTML.substring(0, startIndex);
                const after = processedHTML.substring(endIndex + ampEnd.length);
                processedHTML = before + after;
            }
            while (processedHTML.includes(htmlStart)) {
                const startIndex = processedHTML.indexOf(htmlStart);
                const endIndex = processedHTML.indexOf(htmlEnd, startIndex);
                if (endIndex === -1) break;
                const before = processedHTML.substring(0, startIndex);
                const htmlContent = processedHTML.substring(startIndex + htmlStart.length, endIndex);
                const after = processedHTML.substring(endIndex + htmlEnd.length);
                processedHTML = before + htmlContent + after;
            }
        }
        return processedHTML;
    };

    // Gallery preview renders exported email HTML inside an iframe (srcDoc). Unlike the builder preview,
    // this surface doesn't inject email-safe CSS, so social icon tables can stack vertically.
    // Also disable all interactive elements to prevent clicks in preview mode.
    const previewCss = `
        <style>
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
        </style>
    `;

    const injectCss = (html) => {
        if (!html) return '';
        if (html.includes('</head>')) return html.replace('</head>', `${previewCss}</head>`);
        return `${previewCss}${html}`;
    };

    return (
        <RSModal
            show={show}
            size={'xxlg'}
            handleClose={handleClose}
            header={title}
            className='Preview_emailbuilder'
            closeTooltipPosition={true}
            bodyClassName='custom_modal_tableTop'
            body={
                <>
                    <div className="d-flex align-items-center">

                        {hasAmp && (
                            <div className="amp-preview-modal-tabs ms-auto me-auto">
                                <button
                                    type="button"
                                    className={`amp-tab-btn ${previewMode === 'amp' ? 'active' : ''}`}
                                    onClick={() => setPreviewMode('amp')}
                                >
                                    <svg 
                                        width="14" 
                                        height="14" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        style={{ marginRight: '4px' }}
                                    >
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                    AMP HTML
                                </button>
                                <button
                                    type="button"
                                    className={`amp-tab-btn ${previewMode === 'html' ? 'active' : ''}`}
                                    onClick={() => setPreviewMode('html')}
                                >
                                    Fallback
                                </button>
                            </div>
                        )}
                    </div>
                    <iframe
                        srcDoc={injectCss(processEmailHTML(data, previewMode))}
                        className='w-100 h-100 border-0'
                        style={{ minHeight: '450px' }}
                    />
                    <style>
                        {`
                        .Preview_emailbuilder,
                        .Preview_emailbuilder .modal-body,
                        .custom_modal_tableTop {
                            overflow-y: hidden !important;
                            scrollbar-width: none;
                            -ms-overflow-style: none;
                        }
                        .Preview_emailbuilder::-webkit-scrollbar,
                        .Preview_emailbuilder .modal-body::-webkit-scrollbar,
                        .custom_modal_tableTop::-webkit-scrollbar {
                            display: none;
                        }
                        .amp-preview-modal-tabs {
                            display: inline-flex;
                            background: #fff;
                            border-radius: 8px;
                            border: 1px solid #d1d5db;
                            overflow: hidden;
                        }
                        .amp-tab-btn {
                            border: none;
                            background: transparent;
                            padding: 8px 18px;
                            font-size: 14px;
                            font-weight: 500;
                            color: #1f2937;
                            cursor: pointer;
                            transition: all 0.15s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .amp-tab-btn.active {
                            background: #0000FF;
                            color: #fff;
                        }
                        .amp-tab-btn:not(.active):hover {
                            background: #f9fafb;
                        }
                        `}
                    </style>
                </>
            }
        />
    );
};

export default PreviewModal;
