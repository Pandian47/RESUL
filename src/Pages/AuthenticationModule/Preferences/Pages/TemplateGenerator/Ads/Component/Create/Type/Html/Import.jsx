import { MAX_LENGTH150, URLPATTERN } from 'Constants/GlobalConstant/Regex';
import { ADD_VIEW_IN_BROWSER, COMMUNICATION_URL, EMAIL_NOT_DISPLAYING, INBOX_FIRST_LINE_MESSAGE, INBOX_FIRST_LINE_PREVIEW, RES_75_CHARACTERS, VIEW_IN_BROWSER } from 'Constants/GlobalConstant/Placeholders';
import { email_preview_medium, import_link_large, restart_medium, spam_assassin_medium, zip_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useRef, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';

import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { RSPrimaryButton } from 'Components/Buttons';
import { statusIdCheck, checkTrigger } from 'Utils/modules/campaignUtils';

import { removeTags } from 'Utils/modules/stringUtils';
import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';
import { getImportCampaign, uploadCommunicationFile } from 'Reducers/communication/createCommunication/Create/request';
import SpamScoreModal from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/SpamScoreModal/SpamScoreModal';
import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import { iframeStyles } from 'Pages/AuthenticationModule/Components/Import/constant';
import { UpdateState } from 'Utils/modules/misc';
const scriptTagStartText = '<!-- Start of Script Conditions -->';
const scripttagEndText = '<!-- End of Script Conditions -->';
const tagStartText = '<!-- TCTAG:- [START] -->';
const tagEndText = ' <!-- TCTAG:- [END] -->';

const scriptAmpStart = '<!-- Start of Script amp Conditions -->';
const scriptAmpEnd = '<!-- End of Script amp Conditions -->';
const scriptHtmlStart = '<!-- Start of Script html Conditions -->';
const scriptHtmlEnd = '<!-- End of Script html Conditions -->';

const Import = ({ fieldName = '', isSplit = false, showBrowerText = false, isNotification = false }) => {
    const dispatch = useDispatch();
    const uploadRef = useRef();
    // Width   // Height
    const width = uploadRef.current?.clientWidth;
    const height = uploadRef.current?.clientHeight;
    const [state, setState] = useState({
        SpamScoreModal: false,
    });
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [isClickOff, setIsClickOff] = useState(false);
    const { campaignDetails } = useSelector((state) => emailList(state));
    if (Object.keys(campaignDetails)?.length) {
        const { content, isSplitAB } = campaignDetails;
        let temp = {};
    }
    const {
        control,
        formState: { errors },
        register,
        setValue,
        setFocus,
        watch,
        resetField,
        setError,
        clearErrors,
        getValues,
        trigger,
    } = useFormContext();

    const importURLName = isSplit ? `${fieldName}.importUrl` : 'importUrl';
    const zipFileName = isSplit ? `${fieldName}.zipFile` : 'zipFile';
    const zipFileTextName = isSplit ? `${fieldName}.zipFileText` : 'zipFileText';
    const edmContentName = isSplit ? `${fieldName}.edmContent` : 'edmContent';
    const edmContentDimensionName = isSplit ? `${fieldName}.edmDimension` : 'edmDimension';
    const templateContentName = isSplit ? `${fieldName}.templateContent` : 'templateContent';
    const importTypeName = isSplit ? `${fieldName}.importType` : 'importType';
    const viewInbrowserName = isSplit ? `${fieldName}.viewInBrowser` : 'viewInBrowser';
    const zipFileErrorMessage = _get(errors, `${zipFileName}.message`, '');
    const subjectLineName = isSplit ? `${fieldName}.subjectLine` : 'subjectLine';
    const inboxLinePreviewName = isSplit ? `${fieldName}.inboxLinePreview` : 'inboxLinePreview';
    const editorTextName = isSplit ? `${fieldName}.editorText` : 'editorText';
    const edmGuidName = isSplit ? `${fieldName}.edmGuid` : 'edmGuid';
    const sampleEmailFooterName = isSplit ? `${fieldName}.sampleEmailFooter` : 'sampleEmailFooter';
    const emailFooterName = isSplit ? `${fieldName}.emailFooter` : 'emailFooter';
    const unSubscriptionName = isSplit ? `${fieldName}.unSubscription` : 'unSubscription';
    const schedulerName = isSplit ? `${fieldName}.schedule` : 'schedule';
    const sendTimeRecommendationName = isSplit ? `${fieldName}.sendTimeRecommendation` : 'sendTimeRecommendation';
    const timezoneName = isSplit ? `${fieldName}.timezone` : 'timezone';
    const daylightSavingsName = isSplit ? `${fieldName}.daylightSavings` : 'daylightSavings';
    const spamScoreName = isSplit ? `${fieldName}.spamScore` : 'spamScore';
    const top3Name = isSplit ? `${fieldName}.top3` : 'top3';
    const [
        edmContent = [],
        edmContentDimension = 0,
        viewInBrowser,
        importType = 'url',
        subjectLine,
        inboxLinePreview,
        editorText,
        sampleEmailFooter,
        myFileName,
        zipFileNameText,
        importName,
    ] = watch([
        edmContentName,
        edmContentDimensionName,
        viewInbrowserName,
        importTypeName,
        subjectLineName,
        inboxLinePreviewName,
        editorTextName,
        sampleEmailFooterName,
        zipFileTextName,
        zipFileName,
        importURLName,
    ]);
    const location = useQueryParams('/communication');

    useEffect(() => {
        [importURLName, zipFileName, edmContentName, edmContentDimensionName].forEach((name) => {
            resetField(name);
        });
    }, [importType]);
    useEffect(() => {
        const edmContentVal = getValues(edmContentName);
        const edmContentDimensionNameVal = getValues(edmContentDimensionName);
        if (edmContentVal) {
            handleFileInputChange(edmContentVal, '', edmContentDimensionNameVal);
        }
        if (!edmContent) {
            if (importType === 'url') {
                setFocus(importURLName);
            } else if (importType === 'import') {
                setFocus(zipFileName);
            } else {
                setFocus(importURLName);
            }
        }
        importType === 'import' && setValue(importURLName, '');
    }, []);

    const [isTrigger, setIsTrigger] = useState(false);
    useEffect(() => {
        if (location?.campaignType === 'T') {
            setIsTrigger(true);
            setValue(viewInbrowserName, false);
        } else {
            setIsTrigger(false);
            setValue(viewInbrowserName, true);
        }
    }, [location]);
    useEffect(() => {
        if (
            checkTrigger(location?.campaignType, location?.endDate) ||
            !statusIdCheck(Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null)
        ) {
            setIsClickOff(true);
            if (document.getElementById('iframe')) {
                document.getElementById('iframe').contentDocument.body.contentEditable = 'false';
                document.getElementById('iframe').contentDocument.body.style.pointerEvents = 'none';
            }
        } else {
            setIsClickOff(false);
        }
    }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);
    const sampleFooterText = _get(sampleEmailFooter, 'emailFooterRawcode', '');

    function handleFileInputChange(content = '', fieldName = '', dimension = 0) {
        setTimeout (()=>{
            let iframeEl = document.querySelector('#template iframe')
            let edmelement =document.querySelector('.edm-import-wrapper')
            const clientheight =iframeEl?.contentDocument?.children[0]?.childNodes[1]?.childNodes[0]?.clientHeight
            if (edmelement && clientheight) {
                edmelement.style.height = `${clientheight + 10}px`;
            }
        },1000)
        try {
            if (content) {
                const currentIframeElement = document.querySelector('iframe');
                //Removing the old iframe template to exclude duplicate
                if (currentIframeElement !== null) {
                    document.getElementById('template').innerHTML = '';
                }
                if (content.includes('⚡4email data-css-strict')) {
                    // Amp Flow
                    const ampOccurence = content.match(/<!-- Start of Script amp Conditions -->/g)?.length;
                    const htmlOccurence = content.match(/<!-- Start of Script html Conditions -->/g)?.length;
                    if (ampOccurence > 2 || ampOccurence < 2 || htmlOccurence > 2 || htmlOccurence < 2) {
                        throw new Error('Invalid Amp file');
                    }
                    const createFrame = document.createElement('iframe');
                    createFrame.id = 'iframe';
                    createFrame.width = '100%';
                    createFrame.height = '800px';
                    document.getElementById('template').appendChild(createFrame);
                    const frameDocument = createFrame.contentDocument;
                    //Reloading the iframe to update
                    createFrame.contentWindow.document.open();
                    createFrame.contentWindow.document.write(content);
                    let edmHeight = createFrame.contentWindow.document.body.scrollHeight;
                    let edmWidth = createFrame.contentWindow.document.body.scrollWidth;
                    createFrame.contentDocument.body.setAttribute('contenteditable', true);
                    let tempedmDimension = edmHeight * edmWidth;
                    setValue(edmContentDimensionName, tempedmDimension);
                    createFrame.setAttribute('data-scrollWidth', createFrame.contentWindow.document.body.scrollWidth);
                    createFrame.setAttribute('data-scrollHeight', createFrame.contentWindow.document.body.scrollHeight);

                    createFrame.contentDocument.body.setAttribute('contenteditable', true);
                    createFrame.contentWindow.document.close();
                    //Adding the style to the iframe
                    frameDocument.body.innerHTML = frameDocument.body.innerHTML + iframeStyles;
                    const tabNames = document.createElement('ul');
                    tabNames.className = 'nav nav-tabs targetTab';
                    const TabNamesList = ['Amp', 'Fallback'];
                    const fontElement = [...frameDocument.getElementsByTagName('font')];
                    fontElement.forEach((fele, index) => {
                        fele.setAttribute('data-font', TabNamesList[index]);
                        if (index === 0) fele.classList.add('active');
                        fele.classList.add('tab-pane');
                    });
                    const paragraphs = frameDocument.querySelectorAll('p');
                    for (const paragraph of paragraphs) {
                        if (paragraph.textContent.includes('Fall back')) {
                            frameDocument.body.removeChild(paragraph);
                        }
                    }
                    TabNamesList.forEach((name, nameIndex) => {
                        const tab = document.createElement('li');
                        const link = document.createElement('span');
                        link.innerHTML = name;
                        tab.setAttribute('data-id', name);
                        tab.className = `${nameIndex === 0 ? 'tab-active' : ''}`;
                        tab.appendChild(link);
                        tab.onclick = () => {
                            const tabElement = [...frameDocument.querySelectorAll('.tab-pane')];
                            const listElement = [...tabNames.children];
                            tabElement.forEach((ele, eleIndex) => {
                                const fontName = ele.getAttribute('data-font');
                                if (fontName === name) {
                                    ele.classList.add('active');
                                    listElement[nameIndex].classList.add('tab-active');
                                } else {
                                    ele.classList.remove('active');
                                    listElement[eleIndex].classList.remove('tab-active');
                                }
                            });
                        };
                        tabNames.appendChild(tab);
                    });
                    // frameDocument.body.innerHTML = tabNames.outerHTML + frameDocument.body.innerHTML;
                    frameDocument.body.prepend(tabNames);
                    // frameDocument.appendChild(tabNames);
                } else if (content.includes(scriptTagStartText) && content.includes(scripttagEndText)) {
                    //Getting the script tag content on the page
                    const startIndex = content.indexOf(scriptTagStartText) + scriptTagStartText?.length;
                    const endIndex = content.lastIndexOf(scripttagEndText);
                    const scriptTagContent = content.slice(startIndex, endIndex) || '';
                    const convertScriptTagToObject = JSON.parse(removeTags(scriptTagContent));
                    const labelSet = convertScriptTagToObject?.LabelSet;
                    //Creating the iframe and adding the content of the iframe
                    const createFrame = document.createElement('iframe');
                    createFrame.id = 'iframe';
                    createFrame.width = '100%';
                    document.getElementById('template').appendChild(createFrame);
                    const frameDocument = createFrame.contentDocument;
                    createFrame.contentWindow.document.open();
                    createFrame.contentWindow.document.write(content);
                    let edmHeight = createFrame.contentWindow.document.body.scrollHeight;
                    let edmWidth = createFrame.contentWindow.document.body.scrollWidth;
                    createFrame.contentDocument.body.setAttribute('contenteditable', true);
                    let tempedmDimension = edmHeight * edmWidth;
                    setValue(edmContentDimensionName, tempedmDimension);
                    createFrame.setAttribute('data-scrollWidth', createFrame.contentWindow.document.body.scrollWidth);
                    createFrame.setAttribute('data-scrollHeight', createFrame.contentWindow.document.body.scrollHeight);
                    createFrame.contentDocument.body.setAttribute('contenteditable', true);
                    createFrame.contentWindow.document.close();
                    frameDocument.body.innerHTML = frameDocument.body.innerHTML + iframeStyles;
                    const editorEle = [...createFrame.contentWindow.document.getElementsByClassName('edit-outline')];
                    editorEle.forEach((ele, eleIndex) => {
                        const elementInnerHTML = ele.innerHTML;
                        const scriptTag = elementInnerHTML.slice(
                            elementInnerHTML.indexOf(tagStartText) + tagStartText?.length,
                            elementInnerHTML.lastIndexOf(tagEndText),
                        );
                        const imageEditor = ele.parentNode.className.includes('img');
                        const buildId = `${imageEditor ? 'imgblk' : 'textblk'}${eleIndex}_target`;
                        const parentElement = document.createElement('div');
                        const parenetElementId = imageEditor ? 'imgblk' + eleIndex : 'textblk' + eleIndex;
                        parentElement.id = parenetElementId;
                        parentElement.className = 'editable';
                        const tabNames = document.createElement('ul');
                        tabNames.className = 'nav nav-tabs targetTab';
                        labelSet.forEach((label, labelIndex) => {
                            const tab = document.createElement('li');
                            const link = document.createElement('span');
                            link.innerHTML = label;
                            tab.setAttribute('data-id', labelSet[labelIndex]);
                            tab.className = `${labelIndex === 0 ? 'tab-active' : ''}`;
                            tab.appendChild(link);
                            tab.onclick = () => {
                                const tabElement = [...parentElement.querySelector('.tab-content').children];
                                const listElement = [...tabNames.children];
                                tabElement.forEach((ele, eleIndex) => {
                                    const dataIndex = Number(ele.getAttribute('data-index'));
                                    if (dataIndex === labelIndex) {
                                        ele.classList.add('active');
                                        listElement[eleIndex].classList.add('tab-active');
                                    } else {
                                        ele.classList.remove('active');
                                        listElement[eleIndex].classList.remove('tab-active');
                                    }
                                });
                            };
                            tabNames.appendChild(tab);
                        });
                        parentElement.appendChild(tabNames);
                        const tempEle = document.createElement('div');
                        tempEle.innerHTML = scriptTag;
                        let childNodes = [...tempEle.children];
                        if (childNodes?.length === labelSet?.length) {
                            const tabContentElement = document.createElement('div');
                            tabContentElement.className = 'tab-content';
                            tabContentElement.appendChild(
                                document.createComment(`<!--DIVSTART:${parenetElementId}-->`),
                            );
                            childNodes.forEach((childEle, index) => {
                                const tabPane = document.createElement('div');
                                tabPane.id = `${buildId}${index}`;
                                tabPane.setAttribute('data-name', labelSet[index]);
                                tabPane.setAttribute('data-index', index);
                                tabPane.className = `tab-pane${index === 0 ? ' active' : ''}`;
                                const tagType = imageEditor ? 'img' : 'txt';
                                tabPane.appendChild(
                                    document.createComment(`<!--[st:${tagType}:${eleIndex}:li:${index}]-->`),
                                );
                                tabPane.appendChild(childEle);
                                tabPane.appendChild(
                                    document.createComment(`<!--[end:${tagType}:${eleIndex}:li:${index}]-->`),
                                );
                                tabContentElement.appendChild(tabPane);
                            });
                            tabContentElement.appendChild(document.createComment(`<!--DIVEND:${parenetElementId}-->`));
                            parentElement.appendChild(tabContentElement);
                            ele.replaceChildren(parentElement);
                        } else {
                            throw new Error('Tabcontent did not match');
                        }
                    });
                } else {
                    const createFrame = document.createElement('iframe');
                    createFrame.id = 'iframe';
                    createFrame.width = '100%';
                    createFrame.height = '100%';
                    document.getElementById('template').appendChild(createFrame);
                    createFrame.contentWindow.document.open();
                    createFrame.contentWindow.document.write(content);
                    let edmHeight = createFrame.contentWindow.document.body.scrollHeight;
                    let edmWidth = createFrame.contentWindow.document.body.scrollWidth;
                    createFrame.contentDocument.body.setAttribute('contenteditable', true);
                    let tempedmDimension = edmHeight * edmWidth;
                    setValue(edmContentDimensionName, tempedmDimension);
                    createFrame.setAttribute('data-scrollWidth', createFrame.contentWindow.document.body.scrollWidth);
                    createFrame.setAttribute('data-scrollHeight', createFrame.contentWindow.document.body.scrollHeight);

                    createFrame.contentWindow.document.close();
                    const frameDocument = createFrame.contentDocument;
                    frameDocument.body.innerHTML = frameDocument.body.innerHTML + iframeStyles;
                }
                let iframe = document.getElementById('iframe').contentDocument.body;

                // Setup the config
                let config = { subtree: true, attributes: true, childList: true, characterData: true };
                // Create a callback
                let callback = function (mutationsList) {
                    let tmp = '';
                    document.querySelector('iframe').contentWindow.document.childNodes.forEach((item) => {
                        tmp += new XMLSerializer().serializeToString(item);
                    });

                    setValue(edmContentName, tmp);
                };

                // Watch the iframe for changes
                let observer = new MutationObserver(callback);
                observer.observe(iframe, config);
                return [true, 'Uploaded successfully'];
            } else {
                // throw new Error('Empty content');
                throw new Error('Not a valid EDM');
            }
        } catch (error) {
            document.getElementById('template').innerHTML = '';
            return [false, error.message];
        }
    }
    return (
        <div className="form-group mb0 digipop-custom-import">
            <Row>
                <Col sm={12}>
                    <div
                        className={`rs-import-block ${
                            importType === 'url' ? 'import-url-blank' : 'import-url-selected'
                        }`}
                    >
                        <div className="form-group mb0 ">
                            <div className="rs-import-refresh top25 right-40">
                                <RSTooltip text="Reset" position="top">
                                    <i
                                        id="rs_data_refresh"
                                        className={`${restart_medium} icon-md color-primary-blue cp ${
                                            edmContent?.length > 0 ||
                                            zipFileNameText?.[0]?.name?.split('.')?.pop() === 'zip' ||
                                            getValues(importURLName)?.length
                                                ? ''
                                                : 'click-off'
                                        } ${isClickOff ? 'pe-none click-off' : ''}`}
                                        onClick={() => {
                                            handleFileInputChange('');
                                            setValue(edmContentName, '');
                                            setValue(edmContentDimensionName, 0);
                                            setValue(templateContentName, '');
                                            setValue(sampleEmailFooterName, '');
                                            setValue(unSubscriptionName, false);
                                            setValue(emailFooterName, false);
                                            setValue(viewInbrowserName, true);
                                            setValue(zipFileName, '');
                                            setValue(schedulerName, '');
                                            setValue(sendTimeRecommendationName, '');
                                            setValue(timezoneName, '');
                                            setValue(daylightSavingsName, '');
                                            clearErrors(zipFileName);
                                            setValue(importURLName, '');
                                            [
                                                (importURLName, zipFileName, edmContentName, edmContentDimensionName),
                                            ].forEach((name) => {
                                                resetField(name);
                                            });
                                        }}
                                    />
                                </RSTooltip>
                            </div>
                            <Row
                                className={`rs-import-url-wrapper my20 mx0  ${importType === 'url' ? 'active' : ''} ${
                                    edmContent?.length > 0 ? 'click-off' : ''
                                }`}
                            >
                                {/* getValues('contentType') === 'Z' */}
                                <Col
                                    sm={2}
                                    className="rsiuw-1 text-center p0"
                                    onClick={() => setValue(importTypeName, 'url')}
                                >
                                    <div className="rsiuw-holder position-relative top4">
                                        <i className={`${import_link_large} icon-lg color-primary-blue `}></i>
                                        <label className="control-label-left cp">Import URL</label>
                                    </div>
                                </Col>
                                {importType === 'url' && (
                                    <Fragment>
                                        <Col sm={5} className="rsiuw-2">
                                            <RSInput
                                                control={control}
                                                name={importURLName}
                                                id="rs_Import_CommunicationURL"
                                                placeholder={COMMUNICATION_URL}
                                                rules={
                                                    edmContent?.length === 0
                                                        ? {
                                                              required: 'Enter a URL',
                                                              pattern: {
                                                                  value: URLPATTERN,
                                                                  message: 'Enter valid URL',
                                                              },
                                                          }
                                                        : {}
                                                }
                                                // required={isNotification ? importType === 'url' : false}
                                            />
                                        </Col>
                                        <Col sm={2} className="pl0 rsiuw-3">
                                            <RSPrimaryButton
                                                className={`pr20 ${
                                                    importName === undefined ||
                                                    Object.keys(errors)?.includes(importURLName)
                                                        ? 'click-off'
                                                        : ''
                                                }`}
                                                id="rs_Import_Go"
                                                onClick={async () => {
                                                    if (!Object.keys(errors)?.includes(importURLName)) {
                                                        let payload = {
                                                            url: importName, //https://js.resulticks.com/vb/index.html
                                                            splitType: '',
                                                            clientId,
                                                            userId,
                                                            departmentId,
                                                        };
                                                        const response = await dispatch(getImportCampaign(payload));
                                                        if (response?.status) {
                                                            document.getElementById('template').innerHTML =
                                                                response?.data?.html;
                                                            setValue(edmContentName, response?.data?.html);
                                                            // handleFileInputChange(response?.data?.importContentResult);
                                                        } else {
                                                            setError(importURLName, {
                                                                type: 'server',
                                                                message: response?.message,
                                                            });
                                                        }
                                                    }
                                                }}
                                            >
                                                GO
                                            </RSPrimaryButton>
                                        </Col>
                                    </Fragment>
                                )}
                                <Col
                                    sm={importType !== 'url' ? 10 : 3}
                                    className="pr0 rsiuw-4"
                                    onClick={() => setValue(importTypeName, 'import')}
                                >
                                    <div className="rs-import-with-icon or-sep">
                                        <div className="import-zip-file-tab text-center position-relative top4">
                                            <div className="rsiwi-icon d-grid pointer-event-none">
                                                <i className={`${zip_large} icon-lg color-primary-blue`}></i>
                                            </div>
                                            <label className="rsiwi-label control-label-left">Import ZIP file</label>
                                            {/* {importType === 'import' && ( */}
                                            <Fragment>
                                                <input
                                                    {...register(zipFileName, {
                                                        // required: 'Please select the zip file',
                                                        onChange: (e) => {
                                                            const files = e.target.files[0];
                                                            const fileName = _get(files, 'name', '');
                                                            const edmFileWeight = _get(files, 'size', '');
                                                            // console.log('EDM name : ', fileName);
                                                            if (fileName.includes('.zip')) {
                                                                //  const content = converBase64ToText(edmJsonContent);
                                                                // const data = handleFileInputChange(edmContant);
                                                                // if (edmFileWeight < 6485760) {
                                                                // 6mb
                                                                if (edmFileWeight < 2097152) {
                                                                    // 2mb
                                                                    try {
                                                                        const reader = new FileReader();
                                                                        reader.readAsDataURL(files);
                                                                        reader.onload = async () => {
                                                                            const fileByte =
                                                                                reader.result.split(',')[1];
                                                                            const payload = {
                                                                                fileName,
                                                                                fileByte,
                                                                                edmFileWeight,
                                                                            };
                                                                            if (isNotification) {
                                                                            } else {
                                                                                const {
                                                                                    data,
                                                                                    status,
                                                                                    message = 'No data available',
                                                                                } = await dispatch(
                                                                                    uploadCommunicationFile({
                                                                                        payload,
                                                                                    }),
                                                                                );
                                                                                if (status) {
                                                                                    const { html } = data;
                                                                                    localStorage.setItem(
                                                                                        fieldName || 'edm',
                                                                                        edmFileWeight,
                                                                                    );
                                                                                    //console.log('html: ', html);
                                                                                    // const edmStatus = handleFileInputChange(edmConstant);
                                                                                    const [edmStatus, message] =
                                                                                        handleFileInputChange(
                                                                                            html,
                                                                                            fieldName,
                                                                                            0,
                                                                                        );
                                                                                    // console.log(
                                                                                    //     edmStatus,
                                                                                    //     fileName,
                                                                                    //     '--edmStatus',
                                                                                    // );
                                                                                    setValue(zipFileName, fileName);
                                                                                    if (edmStatus) {
                                                                                        setValue(edmContentName, html);
                                                                                    } else {
                                                                                        setError(zipFileName, {
                                                                                            type: 'custom',
                                                                                            message,
                                                                                        });
                                                                                    }
                                                                                } else {
                                                                                    dispatch(
                                                                                        update_failures_API_Errors({
                                                                                            field: 'uploadCommunicationFile',
                                                                                            message:
                                                                                                message ||
                                                                                                'No data available',
                                                                                        }),
                                                                                    );
                                                                                }
                                                                            }
                                                                        };
                                                                    } catch (err) {
                                                                                                                                            }
                                                                } else {
                                                                    setError(zipFileName, {
                                                                        type: 'custom',
                                                                        message: 'File size too large',
                                                                    });
                                                                }
                                                            }
                                                        },
                                                        validate: async (value) => {
                                                            const edmContent = await getValues(edmContentName);
                                                            const name = _get(value?.[0], 'name', '');
                                                            const edmFileWeight = _get(value?.[0], 'size', '');
                                                            if (
                                                                name?.split('.')?.pop() !== 'zip' &&
                                                                name?.length !== 0
                                                            ) {
                                                                return 'Only Zip files are allowed';
                                                            } else if (
                                                                name?.split('.')?.pop() === 'zip' &&
                                                                edmFileWeight > 2097152
                                                            ) {
                                                                return 'File size too large';
                                                            } else if (!edmContent) return false;
                                                            else {
                                                                if (edmFileWeight > 3000000)
                                                                    return 'File size too large';
                                                                return true;
                                                            }
                                                        },
                                                    })}
                                                    type="file"
                                                    accept=".zip"
                                                    className="browse-hidden rsiwi-input"
                                                    id="rs_Import_zipfile"
                                                />
                                            </Fragment>
                                            {/* )} */}
                                        </div>
                                        {importType === 'import' || importType !== 'url' ? (
                                            <div className="import-zip-message">
                                                {importType !== 'url' ? (
                                                    <div>
                                                        {typeof zipFileNameText === 'string'
                                                            ? zipFileNameText
                                                            : '' || ''}
                                                    </div>
                                                ) : null}
                                                {importType === 'import' && (
                                                    <Fragment>
                                                        {!!zipFileErrorMessage && (
                                                            <div className="color-primary-red">
                                                                {zipFileErrorMessage}
                                                            </div>
                                                        )}
                                                    </Fragment>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        {showBrowerText && edmContent?.length > 0 && (
                            <div className="form-group mt30 mb0">
                                <Row>
                                    <Col sm={3} className="ml15" style={{ width: '20%' }}>
                                    <label className="control-label-left">{INBOX_FIRST_LINE_PREVIEW}</label>
                                    </Col>
                                    <Col
                                        sm={6}
                                        style={{ width: '540px' }}
                                        className={`${isClickOff ? 'pe-none click-off' : ''}`}
                                    >
                                        <RSInput
                                            control={control}
                                            name={inboxLinePreviewName}
                                           placeholder={INBOX_FIRST_LINE_MESSAGE}
                                            maxLength={MAX_LENGTH150}
                                        />
                                        <small className="text-end pt2">{RES_75_CHARACTERS}</small>
                                    </Col>
                                </Row>
                            </div>
                        )}
                        {showBrowerText && edmContent?.length > 0 && (
                            <div
                                className={`d-flex ${
                                    viewInBrowser ? 'justify-content-end align-items-center' : 'justify-content-end'
                                } my15`}
                            >
                                {viewInBrowser && (
                                    <small className="text-left smaller mr64 pe-none">
                                        {EMAIL_NOT_DISPLAYING}{' '}
                                        <a href="{{#VIB}}" onClick={(e) => e.preventDefault()}>
                                            {VIEW_IN_BROWSER}
                                        </a>
                                    </small>
                                )}

                                <ul className={`rs-list-inline rli-space-10 ${isClickOff ? 'pe-none click-off' : ''}`}>
                                    <li>
                                        <RSCheckbox
                                            control={control}
                                            name={viewInbrowserName}
                                            labelName={ADD_VIEW_IN_BROWSER}
                                            //defaultValue={true}
                                        />
                                    </li>
                                    <li className="position-relative top2 mr0">
                                        <RSTooltip text={'Spam score'} className="lh0">
                                            <i
                                                className={`${spam_assassin_medium}   icon-md color-primary-blue cp`}
                                                onClick={() => {
                                                    UpdateState(setState, 'SpamScoreModal', true);
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </li>
                                    {/* <li className="position-relative top2 ml15">
                                        <RSTooltip text={'Litmus Preview template'} className="lh0">
                                            {' '}
                                            <i
                                                className={`${email_preview_medium} icon-md color-primary-blue cp click-off`}
                                            />
                                        </RSTooltip>
                                    </li> */}
                                </ul>
                            </div>
                        )}
                        <div id="template" ref={uploadRef} className={`${edmContent?.length > 0 ? 'edm-import-wrapper EDM-template-preview' : ''}`}></div>
                        {state?.SpamScoreModal && <SpamScoreModal {...spamScoreModalProps} />}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Import;
