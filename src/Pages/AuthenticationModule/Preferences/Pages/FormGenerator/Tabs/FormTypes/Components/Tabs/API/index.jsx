import { API_REQUEST, COPIED_SUCCESSFULLY, COPY, MOBILE_SDK, WEB_SDK } from 'Constants/GlobalConstant/Placeholders';
import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import SyntaxHighlighter, { solarizedlight } from 'Utils/modules/prismSyntaxHighlight';
import RSTooltip from 'Components/RSTooltip';
import { Environment } from '../../../constant';
import { baseURL } from 'Constants/EndPoints';
import *  as placeholder  from 'Constants/GlobalConstant/Placeholders';

const API = ({ formDataValues, saveData, publishData = {}, isPreview = false, fromTellAFriend = false }) => {

    let tempFormData = formDataValues?.formGenerationColumn
        ?.map((e) => e.dataAttributeName)
        ?.filter((attrName) => attrName && attrName !== 'null' && attrName.trim() !== '');
    const res = tempFormData?.reduce((acc, curr) => ((acc[curr] = 'value'), acc), {});
    // Filter out null/empty values from the res object
    const filteredRes = Object.fromEntries(
        Object.entries(res || {}).filter(([key, value]) => 
            key && key !== 'null' && key.trim() !== '' && value && value !== 'null'
        )
    );

    let query = new URLSearchParams(res);
    const [isAPICopied, setIsAPICopied] = useState('');
    const [isWebSDKCopied, setIsWebSDKCopied] = useState('');
    const [isMobileSDKCopied, setIsMobileSDKCopied] = useState('');
    let url = baseURL.split('//')[1].split('.')[0];
    let settingType = Environment[url];
    
    // Create filtered query string for URL
    const filteredQuery = new URLSearchParams(filteredRes);
    
    const notifyStatus = publishData?.notifyStatus ?? false;
    let tempDataURL = settingType === 'P'?
        'https://formapi.resul.io/Subscription/IndexInsertAPI?' +
        filteredQuery.toString() +
        '&formId=' +
        saveData?.data.formId +
        '&dbId=' +
        saveData?.data.tenantId +
        '&SourceURL=Value&pagereferrerurl=Value&rid=Value&cid=Value&pagetitle=Value' +
        '&notifyStatus=' + notifyStatus :
        'https://formapiv5.resul.io/Subscription/IndexInsertAPI?' +
        filteredQuery.toString() +
        '&formId=' +
        saveData?.data.formId +
        '&dbId=' +
        saveData?.data.tenantId +
        '&SourceURL=Value&pagereferrerurl=Value&rid=Value&cid=Value&pagetitle=Value' +
        '&notifyStatus=' + notifyStatus;

    let apiRequestParam = {
        ...filteredRes,
        formid: saveData?.data.formId,
        apikey: saveData?.data.tenantId,
        SourceURL: 'value',
        pagereferrerurl: 'value',
        rid: 'value',
        cid: 'value',
        pagetitle: 'value',
    };

    const SDKCode = JSON.stringify(apiRequestParam);
    const webSDKCode = `var apiRequestParam = ${SDKCode}\nvar responseData = ReWebSDK.formSubmitSDK(apiRequestParam)`;

    // Helper function to convert to camelCase
    const toCamelCase = (str) => {
        if (!str) return str;
        // Convert first character to lowercase
        let result = str.charAt(0).toLowerCase() + str.slice(1);
        // Handle common cases like "ID" -> "Id"
        result = result.replace(/ID/g, 'Id');
        return result;
    };

    // Generate Android HashMap code
    const generateAndroidCode = () => {
        const androidLines = [];
        androidLines.push('//Android');
        androidLines.push('HashMap<String, Object> formData = new HashMap<>();');
        androidLines.push('');
        
        // Add form fields
        Object.keys(filteredRes).forEach(key => {
            const camelKey = toCamelCase(key);
            androidLines.push(`formData.put("${camelKey}", "value");`);
        });
        
        // Add formid
        androidLines.push(`formData.put("formId", ${saveData?.data.formId || ''});`);
        
        // Add other required fields
        androidLines.push('formData.put("sourceURL", "value");');
        androidLines.push('formData.put("pagereferrerurl", "value");');
        androidLines.push('formData.put("rid", "value");');
        androidLines.push('formData.put("cid", "value");');
        androidLines.push('formData.put("pagetitle", "value");');
        androidLines.push('');
        androidLines.push('ReAndroidSDK.getInstance(getActivity()).formDataCapture(formData);');
        
        return androidLines.join('\n');
    };

    // Generate iOS code
    const generateIOSCode = () => {
        const iosLines = [];
        iosLines.push('');
        iosLines.push('// iOS');
        iosLines.push('');
        iosLines.push('');
        iosLines.push('let formData: [String: Any] = [');
        iosLines.push('');
        
        // Add form fields
        const formFields = Object.keys(filteredRes).map(key => {
            const camelKey = toCamelCase(key);
            return `            "${camelKey}": "value"`;
        });
        
        // Add all fields with commas
        if (formFields.length > 0) {
            iosLines.push(formFields.join(',\n') + ',');
        }
        
        iosLines.push(`            "formId": ${saveData?.data.formId || ''},`);
        iosLines.push('            "sourceURL": "value",');
        iosLines.push('            "pagereferrerurl": "value",');
        iosLines.push('            "rid": "value",');
        iosLines.push('            "cid": "value",');
        iosLines.push('            "pagetitle": "value"');
        iosLines.push('        ]');
        iosLines.push('');
        iosLines.push('');
        iosLines.push('REiosHandler.formDataCapture(dict: formData)');
        
        return iosLines.join('\n');
    };

    const mobileSDKCode = generateAndroidCode() + generateIOSCode();

    return (
        <div className="API">
            <Row>
                <Col sm={12}>
                    <div className="d-flex justify-content-between my20">
                        <h4 className='m0'>{API_REQUEST}</h4>
                        <div >
                            {
                                <div className="rs-qr-link-copy position-relative right5">
                                    {isAPICopied && (
                                        <small className="color-primary-green lh0">{COPIED_SUCCESSFULLY}</small>
                                    )}
                                    <RSTooltip text={'Copy'} className="lh0">
                                        <i
                                            onClick={async () => {
                                                if ('clipboard' in navigator) {
                                                    try {
                                                        await navigator.clipboard.writeText(tempDataURL).then(() => {
                                                            setIsAPICopied(true);
                                                            setTimeout(() => {
                                                                setIsAPICopied(false);
                                                            }, 1500);
                                                        });
                                                    } catch (err) {
                                                                                                            }
                                                }
                                            }}
                                            className={`${copy_medium} color-primary-blue icon-md`}
                                        ></i>
                                    </RSTooltip>
                                </div>
                            }
                        </div>
                    </div>
                    {/* <p className='css-scrollbar'>{tempDataURL}</p> */}
                    <div className="EmbedAPI-bordered css-scrollbar">
                        <SyntaxHighlighter
                            lineProps={{
                                style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                            }}
                            wrapLines={true}
                            language={'javascript'}
                            style={solarizedlight}
                            customStyle={{ backgroundColor: 'white', padding: 0, margin: 0 }}
                        >
                            {tempDataURL}
                        </SyntaxHighlighter>
                    </div>
                    <div className="d-flex justify-content-between  my20">
                        <h4 className='m0'>{WEB_SDK}</h4>
                        <div >
                            {
                                <div className="rs-qr-link-copy position-relative right5">
                                    {isWebSDKCopied && (
                                        <small className="color-primary-green lh24">{COPIED_SUCCESSFULLY}</small>
                                    )}
                                    <RSTooltip text={'Copy'} className="lh0">
                                        <i
                                            onClick={async () => {
                                                if ('clipboard' in navigator) {
                                                    try {
                                                        await navigator.clipboard.writeText(webSDKCode).then(() => {
                                                            setIsWebSDKCopied(true);
                                                            setTimeout(() => {
                                                                setIsWebSDKCopied(false);
                                                            }, 1500);
                                                        });
                                                    } catch (err) {
                                                                                                            }
                                                }
                                            }}
                                            className={`${copy_medium} color-primary-blue icon-md`}
                                        ></i>
                                    </RSTooltip>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="EmbedAPI-bordered css-scrollbar">
                        <p>
                        <SyntaxHighlighter
                            lineProps={{
                                style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                            }}
                            wrapLines={true}
                            language={'javascript'}
                            style={solarizedlight}
                            customStyle={{ backgroundColor: 'white', padding: 0, margin: 0 }}
                        >
                            {webSDKCode}
                        </SyntaxHighlighter>
                        </p>
                    </div>

                    <div className="d-flex justify-content-between  my20">
                        <h4 className='m0'>{MOBILE_SDK}</h4>
                        <div >
                            {
                                <div className="rs-qr-link-copy position-relative right5">
                                    {isMobileSDKCopied && (
                                        <small className="color-primary-green lh24">{COPIED_SUCCESSFULLY}</small>
                                    )}
                                    <RSTooltip text={COPY} className="lh0">
                                        <i
                                            onClick={async () => {
                                                if ('clipboard' in navigator) {
                                                    try {
                                                        await navigator.clipboard.writeText(mobileSDKCode).then(() => {
                                                            setIsMobileSDKCopied(true);
                                                            setTimeout(() => {
                                                                setIsMobileSDKCopied(false);
                                                            }, 1500);
                                                        });
                                                    } catch (err) {
                                                                                                            }
                                                }
                                            }}
                                            className={`${copy_medium} color-primary-blue icon-md`}
                                        ></i>
                                    </RSTooltip>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="EmbedAPI-bordered css-scrollbar">
                        <SyntaxHighlighter
                            lineProps={{
                                style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                            }}
                            wrapLines={true}
                            language={'java'}
                            style={solarizedlight}
                            customStyle={{ backgroundColor: 'white', padding: 0, margin: 0 }}
                        >
                            {mobileSDKCode}
                        </SyntaxHighlighter>
                    </div>

                </Col>
            </Row>
        </div>
    );
};

export default API;

