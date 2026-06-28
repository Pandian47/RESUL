import { API_REQUEST, COPIED_SUCCESSFULLY, COPY } from 'Constants/GlobalConstant/Placeholders';
import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import SyntaxHighlighter, { solarizedlight } from 'Utils/modules/prismSyntaxHighlight';

import RSTooltip from 'Components/RSTooltip';
import { getFormFieldsAndNotifyFF } from 'Reducers/preferences/AdvancedForm/request';
import {
    buildApiRequestText,
    getSubmittableFields,
    normalizeFieldDetails,
    parseFormForgeUrls,
} from '../formForgeApiUtils';

const CopyHeader = ({ title, text, copiedKey, isCopied, onCopy }) => (
    <div className="d-flex justify-content-between my20">
        <h4 className="m0">{title}</h4>
        <div className="rs-qr-link-copy position-relative right5">
            {isCopied === copiedKey && (
                <small className="color-primary-green lh24">{COPIED_SUCCESSFULLY}</small>
            )}
            <RSTooltip text={COPY} className="lh0">
                <i
                    onClick={async () => {
                        if ('clipboard' in navigator) {
                            try {
                                await navigator.clipboard.writeText(text);
                                onCopy(copiedKey);
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
);

const CodeBlock = ({ code, language = 'javascript' }) => (
    <div className="EmbedAPI-bordered css-scrollbar">
        <SyntaxHighlighter
            lineProps={{
                style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
            }}
            wrapLines
            language={language}
            style={solarizedlight}
            customStyle={{ backgroundColor: 'white', padding: 0, margin: 0 }}
        >
            {code}
        </SyntaxHighlighter>
    </div>
);

const AdvancedFormAPI = ({ saveData = {}, publishData = {}, formDataValues = {} }) => {
    const dispatch = useDispatch();
    const formId = saveData?.data?.formId;
    const publishedUrl = publishData?.publishUrl ?? '';
    const [fieldDetails, setFieldDetails] = useState([]);
    const [apiBaseUrl, setApiBaseUrl] = useState('');
    const [tenantSlug, setTenantSlug] = useState('default');
    const [loading, setLoading] = useState(true);
    const [fieldLabelsOnly, setFieldLabelsOnly] = useState([]);
    const [notifyStatus, setNotifyStatus] = useState(false);
    const [isCopied, setIsCopied] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadFields = async () => {
            if (!formId) {
                setLoading(false);
                return;
            }

            const parsed = parseFormForgeUrls(publishedUrl);
            const prefilledDetails = normalizeFieldDetails({
                fieldDetails:
                    formDataValues?.fieldDetails ||
                    formDataValues?.field_details ||
                    publishData?.fieldDetails ||
                    publishData?.field_details,
            });

            if (!cancelled) {
                setTenantSlug(
                    publishData?.tenantSlug ||
                        publishData?.tenant_slug ||
                        formDataValues?.tenantSlug ||
                        formDataValues?.tenant_slug ||
                        parsed.tenantSlug,
                );
                setApiBaseUrl(
                    publishData?.apiBaseUrl ||
                        publishData?.api_base_url ||
                        formDataValues?.apiBaseUrl ||
                        formDataValues?.api_base_url ||
                        parsed.apiBaseUrl,
                );
            }

            let details = prefilledDetails;
            let labels = [];

            if (!getSubmittableFields(details).length) {
                const res = await dispatch(getFormFieldsAndNotifyFF(formId));
                if (cancelled) return;

                if (res?.status) {
                    details = normalizeFieldDetails(res?.data || {});
                    labels = (res?.data?.fields || []).filter(
                        (field) => typeof field === 'string' && field.trim(),
                    );
                    if (!cancelled) {
                        if (res?.data?.apiBaseUrl || res?.data?.api_base_url) {
                            setApiBaseUrl(res.data.apiBaseUrl || res.data.api_base_url);
                        }
                        if (res?.data?.tenantSlug || res?.data?.tenant_slug) {
                            setTenantSlug(res.data.tenantSlug || res.data.tenant_slug);
                        }
                        setNotifyStatus(!!res?.data?.notify?.notify);
                    }
                }
            }

            if (!cancelled) {
                setFieldDetails(details);
                if (!labels.length) {
                    labels = details.map((field) => field.label).filter(Boolean);
                }
                setFieldLabelsOnly(labels);
                setLoading(false);
            }
        };

        setLoading(true);
        loadFields();

        return () => {
            cancelled = true;
        };
    }, [dispatch, formId, publishedUrl, formDataValues, publishData]);

    const handleCopy = (key) => {
        setIsCopied(key);
        setTimeout(() => setIsCopied(''), 1500);
    };

    if (!formId) {
        return <p className="my20">Form ID is not available.</p>;
    }

    if (loading) {
        return <p className="my20">Loading API configuration...</p>;
    }

    const submittableFields = getSubmittableFields(fieldDetails);
    if (!submittableFields.length) {
        const labelHint =
            fieldLabelsOnly.length > 0
                ? ` Fields detected: ${fieldLabelsOnly.join(', ')}.`
                : '';
        return (
            <p className="my20">
                {`Unable to load field keys for API snippets.${labelHint} Re-publish the form in FormForge or deploy the latest RESUL FormForge integration backend.`}
            </p>
        );
    }

    const snippetConfig = { formId, tenantSlug, apiBaseUrl, fieldDetails, notifyStatus };
    const apiRequestText = buildApiRequestText(snippetConfig);

    return (
        <div className="API">
            <Row>
                <Col sm={12}>
                    <CopyHeader
                        title={API_REQUEST}
                        text={apiRequestText}
                        copiedKey="api"
                        isCopied={isCopied}
                        onCopy={handleCopy}
                    />
                    <CodeBlock code={apiRequestText} language="javascript" />
                </Col>
            </Row>
        </div>
    );
};

export default AdvancedFormAPI;
