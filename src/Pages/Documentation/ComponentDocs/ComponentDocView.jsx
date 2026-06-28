import { useState, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import SyntaxHighlighter, { vscDarkPlus } from 'Utils/modules/prismSyntaxHighlight';
import { COMPONENT_REGISTRY } from './docsConfig';
import './componentDocs.scss';

// A simple copy button component
/** Format prop default values for display in the props table */
const formatPropDefault = (value) => {
    if (value === undefined || value === null) return '—';
    const str = String(value);
    if (str === '') return '""';
    return str;
};

const CopyButton = ({ textToCopy, label = "Copy" }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button 
            className={`copy-btn ${copied ? 'copied' : ''}`} 
            onClick={handleCopy}
            title="Copy to clipboard"
        >
            {copied ? '✓ Copied' : label}
        </button>
    );
};

const ComponentDocView = () => {
    const { componentName } = useParams();
    
    const componentData = COMPONENT_REGISTRY.find(
        (c) => c.componentName.toLowerCase() === componentName?.toLowerCase()
    );

    if (!componentData) {
        return (
            <div className="docs-module">
                <Link to="/docs/components" className="back-link">
                    &larr; Back to Components
                </Link>
                <h1>Component Not Found</h1>
                <p>The component '{componentName}' is not registered in the documentation configuration.</p>
            </div>
        );
    }

    const {
        title,
        component: LiveComponent,
        previewProps = {},
        sourceCode = '',
        styleCode = '',
        usageCode = '',
        propsData = [],
        featuresData = [],
        configData = {},
        previewComponent: PreviewWrapper
    } = componentData;

    return (
        <div className="docs-module">
            <Link to="/docs/components" className="back-link">
                &larr; Back to Components
            </Link>
            
            <h1>{title || componentName}</h1>

            {/* 1. Component Preview */}
            <div className="doc-section">
                <div className="doc-section-header">
                    <h2>Component Preview</h2>
                </div>
                <div className="doc-section-body" style={{ minHeight: '150px' }}>
                    <Suspense fallback={<div>Loading preview...</div>}>
                        {PreviewWrapper ? (
                            <PreviewWrapper />
                        ) : LiveComponent ? (
                            <LiveComponent {...previewProps} />
                        ) : (
                            <p>No component provided for preview.</p>
                        )}
                    </Suspense>
                </div>
            </div>

            {/* 2. Usage */}
            {usageCode && (
                <div className="doc-section">
                    <div className="doc-section-header">
                        <h2>Usage</h2>
                        <CopyButton textToCopy={usageCode} />
                    </div>
                    <div className="doc-section-body no-padding code-container">
                        <SyntaxHighlighter language="jsx" style={vscDarkPlus} showLineNumbers>
                            {usageCode}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}

            {/* 3. Component Source Code */}
            {sourceCode && (
                <div className="doc-section">
                    <div className="doc-section-header">
                        <h2>Component Code</h2>
                        <CopyButton textToCopy={sourceCode} />
                    </div>
                    <div className="doc-section-body no-padding code-container">
                        <SyntaxHighlighter language="jsx" style={vscDarkPlus} showLineNumbers>
                            {sourceCode}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}

            {/* 4. Styles (SCSS/CSS) */}
            {styleCode && (
                <div className="doc-section">
                    <div className="doc-section-header">
                        <h2>Styles / SCSS</h2>
                        <CopyButton textToCopy={styleCode} />
                    </div>
                    <div className="doc-section-body no-padding code-container">
                        <SyntaxHighlighter language="scss" style={vscDarkPlus} showLineNumbers>
                            {styleCode}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}

            {/* 5. Props Documentation */}
            {propsData && propsData.length > 0 && (
                <div className="doc-section">
                    <div className="doc-section-header">
                        <h2>Props Documentation</h2>
                    </div>
                    <div className="doc-section-body">
                        <div className="props-table-wrapper">
                            <table className="props-table">
                                <thead>
                                    <tr>
                                        <th>Prop</th>
                                        <th>Type</th>
                                        <th>Default</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {propsData.map((prop, idx) => (
                                        <tr key={idx}>
                                            <td className="prop-name">{prop.name}</td>
                                            <td><span className="prop-type">{prop.type}</span></td>
                                            <td>
                                                <span className="prop-default">
                                                    {formatPropDefault(prop.default)}
                                                </span>
                                            </td>
                                            <td>{prop.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Feature Matrix */}
            {featuresData && featuresData.length > 0 && (
                <div className="doc-section">
                    <div className="doc-section-header">
                        <h2>Feature Matrix</h2>
                    </div>
                    <div className="doc-section-body">
                        <div className="features-table-wrapper">
                            <table className="features-table">
                                <thead>
                                    <tr>
                                        <th>Feature</th>
                                        <th>Supported</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {featuresData.map((item, idx) => (
                                        <tr key={idx} className={item.supported ? 'supported' : 'unsupported'}>
                                            <td className="feature-name">{item.feature}</td>
                                            <td className="feature-status">
                                                {item.supported ? '✅' : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. Component Configuration */}
            {configData && Object.keys(configData).length > 0 && (
                <div className="doc-section">
                    <div className="doc-section-header">
                        <h2>Configuration</h2>
                        <CopyButton textToCopy={JSON.stringify(configData, null, 2)} />
                    </div>
                    <div className="doc-section-body no-padding code-container">
                        <SyntaxHighlighter language="json" style={vscDarkPlus}>
                            {JSON.stringify(configData, null, 2)}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentDocView;
