import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';

import RSTooltip from 'Components/RSTooltip';

const CopyCode = ({ label, code, lang = 'jsx' }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return undefined;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    if (!code) return null;

    return (
        <div className="kendo-docs-code-block">
            <div className="kendo-docs-code-block__head">
                <span className="kendo-docs-code-block__label">{label}</span>
                <CopyToClipboard text={code} onCopy={() => setCopied(true)}>
                    <button
                        type="button"
                        className={`kendo-docs-code-block__copy${copied ? ' is-copied' : ''}`}
                        aria-label={`Copy ${label}`}
                    >
                        <RSTooltip text={copied ? 'Copied' : 'Copy'} position="top">
                            <i
                                className={`${copy_medium} icon-md ${copied ? 'color-primary-green' : 'color-primary-blue'}`}
                                aria-hidden
                            />
                        </RSTooltip>
                    </button>
                </CopyToClipboard>
            </div>
            <pre className={`kendo-docs-code-block__pre language-${lang}`}>
                <code>{code}</code>
            </pre>
        </div>
    );
};

CopyCode.propTypes = {
    label: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    lang: PropTypes.string,
};

export default memo(CopyCode);
