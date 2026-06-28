import { COPIED_SUCCESSFULLY, COPY, EMBEDED_SCRIPT } from 'Constants/GlobalConstant/Placeholders';
import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import SyntaxHighlighter, { solarizedlight } from 'Utils/modules/prismSyntaxHighlight';
import RSTooltip from 'Components/RSTooltip';
const buildEmbedCode = (publishedUrl, formName = 'Form') => {
    const url = String(publishedUrl || '').trim();
    if (!url) return '';
    const safeTitle = String(formName || 'Form').replace(/"/g, '&quot;');
    return `<iframe
  src="${url}"
  width="100%"
  height="700"
  style="border:0;border-radius:8px;"
  title="${safeTitle}"
  loading="lazy"
></iframe>`;
};

const AdvancedFormEmbed = ({ publishData = {}, editName = '' }) => {
    const publishedUrl = publishData?.publishUrl ?? '';
    const embedCode = buildEmbedCode(publishedUrl, editName);
    const [isCopied, setIsCopied] = useState(false);

    if (!embedCode) {
        return <p className="my20">Published URL is not available for this form.</p>;
    }

    return (
        <div>
            <div className="text-right my20">
                <div className="d-flex justify-content-between">
                    <h4 className="mb0">{EMBEDED_SCRIPT}</h4>
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
                                            await navigator.clipboard.writeText(embedCode);
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
            <div className="EmbedAPI-bordered">
                <SyntaxHighlighter
                    lineProps={{
                        style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                    }}
                    wrapLines
                    language="html"
                    style={solarizedlight}
                    customStyle={{ backgroundColor: 'white', paddingTop: 0 }}
                >
                    {embedCode}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default AdvancedFormEmbed;
