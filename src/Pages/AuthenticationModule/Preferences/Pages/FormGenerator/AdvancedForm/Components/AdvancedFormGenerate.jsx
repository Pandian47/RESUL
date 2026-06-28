import { COPIED_SUCCESSFULLY, COPY, GENERATE_HTML_SNIPPET } from 'Constants/GlobalConstant/Placeholders';
import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import SyntaxHighlighter, { solarizedlight } from 'Utils/modules/prismSyntaxHighlight';
import RSTooltip from 'Components/RSTooltip';
const AdvancedFormGenerate = ({ formDataValues = {} }) => {
    const htmlContent = formDataValues?.htmlContent ?? '';
    const [isCopied, setIsCopied] = useState(false);

    if (!htmlContent || !String(htmlContent).trim()) {
        return (
            <p className="my20">
                HTML export is not available. Re-save or re-publish the form in FormForge to generate it.
            </p>
        );
    }

    return (
        <div>
            <div className="text-right my20">
                <div className="d-flex justify-content-between">
                    <h4 className="m0">{GENERATE_HTML_SNIPPET}</h4>
                    <div className="rs-qr-link-copy position-relative right5">
                        {isCopied && (
                            <small className="color-primary-green lh0">
                                {COPIED_SUCCESSFULLY}
                            </small>
                        )}
                        <RSTooltip text={COPY} className="lh0">
                            <i
                                onClick={async () => {
                                    if ('clipboard' in navigator) {
                                        try {
                                            await navigator.clipboard.writeText(htmlContent);
                                            setIsCopied(true);
                                            setTimeout(() => setIsCopied(false), 1500);
                                        } catch {
                                            /* ignore */
                                        }
                                    }
                                }}
                                className={`${copy_medium} color-primary-blue icon-md`}
                            />
                        </RSTooltip>
                    </div>
                </div>
            </div>
            <div className="EmbedAPI-bordered css-scrollbar">
                <SyntaxHighlighter
                    lineProps={{
                        style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                    }}
                    wrapLines
                    language="html"
                    style={solarizedlight}
                    customStyle={{ backgroundColor: 'white', paddingTop: 0 }}
                >
                    {htmlContent}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default AdvancedFormGenerate;
