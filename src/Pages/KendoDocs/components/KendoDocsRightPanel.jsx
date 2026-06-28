import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';
import CopyCode from './CopyCode';
import KendoDocsDemos from './KendoDocsDemos';
import RSTooltip from 'Components/RSTooltip';

const KendoDocsRightPanel = ({ entry }) => {
    const [copiedImport, setCopiedImport] = useState(false);
    const [copiedUsage, setCopiedUsage] = useState(false);

    useEffect(() => {
        if (!copiedImport) return undefined;
        const timer = window.setTimeout(() => setCopiedImport(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copiedImport]);

    useEffect(() => {
        if (!copiedUsage) return undefined;
        const timer = window.setTimeout(() => setCopiedUsage(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copiedUsage]);

    if (!entry) return null;

    return (
        <div className="kendo-docs-right-panel">
             <div className="kendo-docs-right-card kendo-docs-right-card--preview">
                <div className="kendo-docs-right-card__header">
                    <span className="kendo-docs-right-card__title">PREVIEW</span>
                </div>
                <div className="kendo-docs-right-card__body kendo-docs-right-card__body--preview">
                    <div className="kendo-docs-preview-container my31">
                        <KendoDocsDemos demoId={entry.id} />
                    </div>
                </div>
            </div>
            <div className="kendo-docs-right-card">
                <div className="kendo-docs-right-card__header">
                    
                    <span className="kendo-docs-right-card__title">IMPORT</span>
                    <CopyToClipboard text={entry.importCode || ''} onCopy={() => setCopiedImport(true)}>
                        <button
                            type="button"
                            className="kendo-docs-right-card__copy-btn"
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                            aria-label="Copy Import Code"
                        >
                            <RSTooltip text={copiedImport ? 'Copied' : 'Copy'} position="top">
                                <i className={`${copy_medium} kendo-docs-right-card__icon ${copiedImport ? 'color-primary-green' : ''}`} />
                            </RSTooltip>
                        </button>
                    </CopyToClipboard>
                </div>
                <div className="kendo-docs-right-card__body">
                    <CopyCode label="" code={entry.importCode} lang="javascript" />
                </div>
            </div>

            <div className="kendo-docs-right-card">
                <div className="kendo-docs-right-card__header">
                    <span className="kendo-docs-right-card__title">USAGE</span>
                    <CopyToClipboard text={entry.usageCode || ''} onCopy={() => setCopiedUsage(true)}>
                        <button
                            type="button"
                            className="kendo-docs-right-card__copy-btn"
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                            aria-label="Copy Usage Code"
                        >
                            <RSTooltip text={copiedUsage ? 'Copied' : 'Copy'} position="top">
                                <i className={`${copy_medium} kendo-docs-right-card__icon ${copiedUsage ? 'color-primary-green' : ''}`} />
                            </RSTooltip>
                        </button>
                    </CopyToClipboard>
                </div>
                <div className="kendo-docs-right-card__body">
                    <CopyCode label="" code={entry.usageCode} lang="jsx" />
                </div>
            </div>

            {entry.propsDocs?.length > 0 && (
                <div className="kendo-docs-right-card">
                    <div className="kendo-docs-right-card__header">
                        <span className="kendo-docs-right-card__title">PROPS</span>
                    </div>
                    <div className="kendo-docs-right-card__body kendo-docs-right-card__body--props">
                        <ul className="kendo-docs-props-list">
                            {entry.propsDocs.map((prop) => (
                                <li key={prop.name} className="kendo-docs-props-list__item">
                                    <div className="kendo-docs-props-list__name">
                                        <code>{prop.name}</code>
                                        {prop.required && (
                                            <span className="kendo-docs-props-list__required">required</span>
                                        )}
                                        {prop.type && (
                                            <span className="kendo-docs-props-list__type">{prop.type}</span>
                                        )}
                                    </div>
                                    <p className="kendo-docs-props-list__desc">{prop.description}</p>
                                    {prop.example && (
                                        <pre className="kendo-docs-props-list__example">
                                            <code>{prop.example}</code>
                                        </pre>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

        </div>
    );
};

KendoDocsRightPanel.propTypes = {
    entry: PropTypes.object,
};

export default memo(KendoDocsRightPanel);
