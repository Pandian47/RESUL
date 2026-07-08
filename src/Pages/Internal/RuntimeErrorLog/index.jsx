import { useCallback, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSPageHeader from 'Components/RSPageHeader';
import { alert_large } from 'Constants/GlobalConstant/Glyphicons';
import { clearCapturedErrors, getCapturedErrors } from 'Utils/RSPLogger/RSPLogger';

function LogEntryCard({ entry, isLatest = false }) {
    const isWarning = entry.level === 'warn';

    return (
        <div
            className={`box-design mb19 ${isLatest ? '' : ''}`}
            style={{ borderLeft: `4px solid ${isWarning ? '#f0ad4e' : '#dc3545'}` }}
        >
            <div className="d-flex justify-content-between align-items-start mb10 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span
                        className={`badge ${isWarning ? 'bg-warning text-dark' : 'bg-danger'}`}
                        style={{ fontSize: '11px' }}
                    >
                        {isWarning ? 'Warning' : 'Error'}
                    </span>
                    <span className="text-muted small">{entry.type || 'unknown'}</span>
                </div>
                <span className="text-muted small">{entry.timestamp || '-'}</span>
            </div>
            <p className="mb8 fw-medium">{entry.message || 'No message'}</p>
            <p className="text-muted small mb8">
                <strong>Route:</strong> {entry.route || '-'}
            </p>
            {(entry.stack || entry.componentStack || entry.source) && (
                <pre
                    className="mb0 p-3 rounded small overflow-auto"
                    style={{
                        maxHeight: isLatest ? '320px' : '220px',
                        fontSize: '12px',
                        backgroundColor: '#1e1e1e',
                        color: '#f8f9fa',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {entry.stack || entry.componentStack || entry.source}
                </pre>
            )}
        </div>
    );
}

function StatCard({ label, count, accentColor }) {
    return (
        <div className="box-design h-100" style={{ borderTop: `3px solid ${accentColor}` }}>
            <p className="text-muted small mb5">{label}</p>
            <p className="h3 mb0" style={{ color: accentColor }}>
                {count}
            </p>
        </div>
    );
}

function RuntimeErrorLog() {
    const [issues, setIssues] = useState(() => getCapturedErrors());

    const handleRefresh = useCallback(() => {
        setIssues(getCapturedErrors());
    }, []);

    const handleClear = useCallback(() => {
        clearCapturedErrors();
        setIssues([]);
    }, []);

    const { errors, warnings } = useMemo(() => {
        const errorItems = issues.filter((entry) => entry.level !== 'warn');
        const warningItems = issues.filter((entry) => entry.level === 'warn');
        return { errors: errorItems, warnings: warningItems };
    }, [issues]);

    const latestIssue = issues[0];

    return (
        <div className="page-content-holder">
            <RSPageHeader title="Runtime error log" isHeaderLine rightCommonMenus />
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <div className="d-flex justify-content-between align-items-start mb19 flex-wrap gap-3">
                            <div>
                                <p className="mb0 text-muted">
                                    Review runtime errors and warnings from this browser tab. Data is kept in memory
                                    only — open this route in the same tab after an issue occurs, then click Refresh.
                                </p>
                            </div>
                            <div className="d-flex gap-2 flex-shrink-0">
                                <RSSecondaryButton type="button" onClick={handleRefresh}>
                                    Refresh
                                </RSSecondaryButton>
                                <RSPrimaryButton type="button" onClick={handleClear}>
                                    Clear log
                                </RSPrimaryButton>
                            </div>
                        </div>

                        <Row className="mb19 g-3">
                            <Col md={6}>
                                <StatCard label="Errors" count={errors.length} accentColor="#dc3545" />
                            </Col>
                            <Col md={6}>
                                <StatCard label="Warnings" count={warnings.length} accentColor="#f0ad4e" />
                            </Col>
                        </Row>

                        {!latestIssue ? (
                            <div className="box-design text-center py-5">
                                <i className={`${alert_large} icon-xl color-primary-blue d-block mb15`} />
                                <h4 className="mb10">No errors or warnings captured yet</h4>
                                <p className="text-muted mb0 mx-auto" style={{ maxWidth: '520px' }}>
                                    Navigate to the page where the issue happens, reproduce it in this tab, then return
                                    here and click Refresh.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h5 className="mb15">Latest issue</h5>
                                <LogEntryCard entry={latestIssue} isLatest />

                                {errors.length > 1 && (
                                    <>
                                        <h5 className="mb15 mt30">All errors ({errors.length})</h5>
                                        {errors.map((entry, index) => (
                                            <LogEntryCard
                                                key={`error-${entry.timestamp}-${index}`}
                                                entry={entry}
                                            />
                                        ))}
                                    </>
                                )}

                                {warnings.length > 0 && (
                                    <>
                                        <h5 className="mb15 mt30">All warnings ({warnings.length})</h5>
                                        {warnings.map((entry, index) => (
                                            <LogEntryCard
                                                key={`warn-${entry.timestamp}-${index}`}
                                                entry={entry}
                                            />
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </Container>
                </div>
            </Container>
        </div>
    );
}

export default RuntimeErrorLog;
