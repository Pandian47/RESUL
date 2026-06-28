import { MAX_LENGTH150, URLPATTERN } from 'Constants/GlobalConstant/Regex';
import { ADD_VIEW_IN_BROWSER, COMMUNICATION_URL, EMAIL_NOT_DISPLAYING, INBOX_FIRST_LINE_MESSAGE, INBOX_FIRST_LINE_PREVIEW, RES_75_CHARACTERS, VIEW_IN_BROWSER } from 'Constants/GlobalConstant/Placeholders';
import { email_preview_medium, import_link_large, restart_medium, spam_assassin_medium, users_persona_large, zip_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import _get from 'lodash/get';

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
import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
const scriptTagStartText = '<!-- Start of Script Conditions -->';
const scripttagEndText = '<!-- End of Script Conditions -->';
const tagStartText = '<!-- TCTAG:- [START] -->';
const tagEndText = ' <!-- TCTAG:- [END] -->';

const scriptAmpStart = '<!-- Start of Script amp Conditions -->';
const scriptAmpEnd = '<!-- End of Script amp Conditions -->';
const scriptHtmlStart = '<!-- Start of Script html Conditions -->';
const scriptHtmlEnd = '<!-- End of Script html Conditions -->';

import RSAlertWarning from 'Components/RSAlertWarning';
import { uploadFileEDMInEmailSubUnsub, uploadURLEDMInEmailSubUnsub } from 'Reducers/preferences/CommunicationSettings/request';

const EDMImport = ({ fieldName = '', isSplit = false, showBrowerText = false, isNotification = false, channelId }) => {
    // console.log('fieldName: ', fieldName);
    const locationState = useQueryParams();
    const dispatch = useDispatch();
    const uploadRef = useRef();
    const uploadAttemptCount = useRef(0);
    // Width   // Height
    const width = uploadRef.current?.clientWidth;
    const height = uploadRef.current?.clientHeight;
    const [state, setState] = useState({
        SpamScoreModal: false,
    });
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [isClickOff, setIsClickOff] = useState(false);
    const [ampValidations, setAmpValidations] = useState('');
    const [bannerSizeWarning, setBannerSizeWarning] = useState('');
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
        sampleEmailFooter,
        myFileName,
        zipFileNameText,
        importName,
        deliveryType,
        inPageBanner,
    ] = watch([
        edmContentName,
        edmContentDimensionName,
        viewInbrowserName,
        importTypeName,
        sampleEmailFooterName,
        zipFileTextName,
        zipFileName,
        importURLName,
        'deliveryType',
        'inPageBanner',
    ]);
    const location = useQueryParams('/communication');
    const isInitializedRef = useRef(false);

    // const edmJsonContent = JSON.parse(edmContentAPIResponse.data.channelJson).content[0].body;
    // console.log('myFileName: ', zipFileNameText);

    const isInPageBannerDeliveryType = deliveryType?.id == 5;
    const importUrlLabelText = isInPageBannerDeliveryType ? 'Image URL' : 'Import URL';
    const importUrlPlaceholder = isInPageBannerDeliveryType ? 'Enter image URL' : COMMUNICATION_URL;
    // console.log('zipFileTextName: ', myFileName);

    // Parse banner size from bannerSize string (e.g., "300x250" -> {width: 300, height: 250})
    const parseBannerSize = useCallback((bannerSize) => {
        if (!bannerSize || typeof bannerSize !== 'string') return null;

        // Extract dimensions from formats like "300x250", "300 x 250", "(300x250)", etc.
        const match = bannerSize.match(/(\d+)\s*[xX×]\s*(\d+)/);
        if (match) {
            return {
                width: parseInt(match[1], 10),
                height: parseInt(match[2], 10),
            };
        }
        return null;
    }, []);

    // Function to check banner size against element dimensions
    const checkBannerDimensions = useCallback(() => {
        if (!isInPageBannerDeliveryType || !inPageBanner || !edmContent) {
            setBannerSizeWarning('');
            return;
        }

        // Get banner size from inPageBanner
        // The bannerSize might be in the banner object or extracted from bannerName
        let bannerSize = inPageBanner?.bannerSize;

        // If bannerSize is not directly available, try to extract from bannerName
        // Format: "Banner Name (300x250)" or similar
        if (!bannerSize && inPageBanner?.bannerName) {
            const sizeMatch = inPageBanner.bannerName.match(/\((\d+\s*[xX×]\s*\d+)\)/);
            if (sizeMatch) {
                bannerSize = sizeMatch[1];
            }
        }

        if (!bannerSize) {
            setBannerSizeWarning('');
            return;
        }

        const bannerDimensions = parseBannerSize(bannerSize);
        if (!bannerDimensions) {
            setBannerSizeWarning('');
            return;
        }

        // Get element dimensions
        const edmelement = document.querySelector('.edm-import-wrapper');
        const templateElement = document.getElementById('template');
        const iframeEl = document.querySelector('#template iframe');
        const imgElement = templateElement?.querySelector('img');

        if (!edmelement && !templateElement && !iframeEl && !imgElement) {
            setBannerSizeWarning('');
            return;
        }

        // Get image dimensions if it exists
        let imageWidth = 0;
        let imageHeight = 0;
        if (imgElement && !iframeEl) {
            imageWidth = imgElement.naturalWidth || imgElement.offsetWidth || 0;
            imageHeight = imgElement.naturalHeight || imgElement.offsetHeight || 0;
        }

        // Get iframe dimensions if it exists
        let iframeWidth = 0;
        let iframeHeight = 0;
        if (iframeEl && iframeEl.contentDocument) {
            const bodyElement = Array.from(iframeEl.contentDocument.children?.[0]?.childNodes || []).filter(
                (node) => node.nodeType === 1 && node.nodeName.toLowerCase() === 'body',
            )?.[0];
            if (bodyElement) {
                iframeWidth = bodyElement?.scrollWidth || bodyElement?.offsetWidth || 0;
                iframeHeight = bodyElement?.scrollHeight || bodyElement?.offsetHeight || 0;
            }
        }

        // Get dimensions from elements - use computed styles and actual dimensions
        const elementWidth = Math.max(
            edmelement?.offsetWidth || 0,
            templateElement?.offsetWidth || 0,
            iframeEl?.offsetWidth || 0,
            iframeWidth,
            imageWidth,
            parseInt(edmelement?.style?.width?.replace('px', '') || '0', 10),
            parseInt(templateElement?.style?.width?.replace('px', '') || '0', 10),
        );

        const elementHeight = Math.max(
            parseInt(edmelement?.style?.height?.replace('px', '') || '0', 10),
            parseInt(templateElement?.style?.height?.replace('px', '') || '0', 10),
            parseInt(iframeEl?.style?.height?.replace('px', '') || '0', 10),
            edmelement?.offsetHeight || 0,
            templateElement?.offsetHeight || 0,
            iframeEl?.offsetHeight || 0,
            iframeHeight,
            imageHeight,
        );

        // Check if banner dimensions are less than element dimensions
        if (elementWidth > 0 && elementHeight > 0) {
            if (bannerDimensions.width < elementWidth || bannerDimensions.height < elementHeight) {
                setBannerSizeWarning(
                    `Warning: Banner size (${bannerDimensions.width}x${bannerDimensions.height}) is smaller than the imported content dimensions (${elementWidth}x${elementHeight}). This may cause display issues.`,
                );
            } else {
                setBannerSizeWarning('');
            }
        } else {
            setBannerSizeWarning('');
        }
    }, [isInPageBannerDeliveryType, inPageBanner, edmContent, parseBannerSize]);

    useEffect(() => {
        [importURLName, zipFileName, edmContentName, edmContentDimensionName].forEach((name) => {
            resetField(name);
        });
        setAmpValidations('');
    }, [importType]);
    useEffect(() => {
        if (edmContent) {
            let iframeEl = document.querySelector('#template iframe');
            let edmelement = document.querySelector('.edm-import-wrapper');
            const templateElement = document.getElementById('template');

            // Check if it's an image (not iframe)
            const imgElement = templateElement?.querySelector('img');
            if (imgElement && !iframeEl) {
                // For images, set height based on image height
                const imageHeight = imgElement.offsetHeight || imgElement.naturalHeight;
                const imageWidth = imgElement.offsetWidth || imgElement.naturalWidth;
                if (templateElement && imageHeight) {
                    // Ensure image doesn't exceed container width
                    if (imageWidth > templateElement.offsetWidth && templateElement.offsetWidth > 0) {
                        imgElement.style.maxWidth = '100%';
                        imgElement.style.width = '100%';
                        imgElement.style.height = 'auto';
                        // Recalculate height after width adjustment
                        const adjustedHeight = (imageHeight / imageWidth) * templateElement.offsetWidth;
                        templateElement.style.height = `${adjustedHeight}px`;
                    } else {
                        templateElement.style.height = `${imageHeight}px`;
                    }
                    templateElement.style.overflow = 'hidden';
                    templateElement.style.overflowX = 'hidden';
                    templateElement.style.overflowY = 'hidden';
                }
                if (edmelement && imageHeight) {
                    edmelement.style.height = `${imageHeight}px`;
                    edmelement.style.overflow = 'hidden';
                    edmelement.style.overflowX = 'hidden';
                    edmelement.style.overflowY = 'hidden';
                }
            } else if (iframeEl && iframeEl.contentDocument) {
                // Use the helper function to properly calculate and set height
                updateIframeHeight(iframeEl);
                // Also recalculate after delays to ensure content is fully loaded
                setTimeout(() => updateIframeHeight(iframeEl), 200);
                setTimeout(() => updateIframeHeight(iframeEl), 500);
                setTimeout(() => updateIframeHeight(iframeEl), 1000);
            }

            // Check banner dimensions after elements are rendered
            if (isInPageBannerDeliveryType && inPageBanner) {
                setTimeout(() => {
                    checkBannerDimensions();
                }, 600);
            }
        }
    }, [edmContent, isInPageBannerDeliveryType, inPageBanner, checkBannerDimensions]);

    // Check banner size when banner changes (separate from edmContent effect)
    useEffect(() => {
        if (!isInPageBannerDeliveryType || !inPageBanner || !edmContent) {
            setBannerSizeWarning('');
            return;
        }

        // Wait for DOM to be ready, then check dimensions
        const timeoutId = setTimeout(() => {
            checkBannerDimensions();
        }, 800);

        return () => clearTimeout(timeoutId);
    }, [inPageBanner, checkBannerDimensions]);

    // Fix import flow bind issue and add dependency.
    const edmContentVal = getValues(edmContentName);
    const edmContentDimensionNameVal = getValues(edmContentDimensionName);
    useEffect(() => {
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
    }, [importType, edmContentDimensionNameVal]);

    const [isTrigger, setIsTrigger] = useState(false);
    useEffect(() => {
        if (isInitializedRef.current) {
            return;
        }

        const hasExistingCampaign =
            campaignDetails && Object.keys(campaignDetails).length && campaignDetails?.content?.length;

        if (hasExistingCampaign) {
            const content = campaignDetails?.content;
            if (content && content?.length) {
                if (isSplit && fieldName) {
                    const splitType = fieldName.replace('split', '');
                    const splitContent = content.find((item) => item.splitType === splitType);
                    if (splitContent && splitContent.hasOwnProperty('isViewinBrowser')) {
                        setValue(viewInbrowserName, splitContent.isViewinBrowser);
                    } else {
                        setValue(viewInbrowserName, true);
                    }
                    isInitializedRef.current = true;
                } else {
                    if (content[0] && content[0].hasOwnProperty('isViewinBrowser')) {
                        setValue(viewInbrowserName, content[0].isViewinBrowser);
                    } else {
                        setValue(viewInbrowserName, true);
                    }
                    isInitializedRef.current = true;
                }
            } else {
                setValue(viewInbrowserName, true);
                isInitializedRef.current = true;
            }
        } else {
            setValue(viewInbrowserName, true);
            isInitializedRef.current = true;
        }
    }, [campaignDetails, location]);

    useEffect(() => {
        const campaignId = location?.campaignId;
        return () => {
            isInitializedRef.current = false;
        };
    }, [location?.campaignId]);
    useEffect(() => {
        if (
            checkTrigger(location?.campaignType, location?.endDate) ||
            !statusIdCheck(Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null)
        ) {
            setIsClickOff(false);
            if (document.getElementById('iframe')) {
                document.getElementById('iframe').contentDocument.body.contentEditable = 'false';
                document.getElementById('iframe').contentDocument.body.style.pointerEvents = 'none';
            }
        } else {
            setIsClickOff(false);
        }
    }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);
    const sampleFooterText = _get(sampleEmailFooter, 'emailFooterRawcode', '');
    // console.log('importType::', importType, edmContent?.length);
    // console.log('File name 2024::', getValues(zipFileTextName));
    const spamScoreModalProps = {
        show: state.SpamScoreModal,
        content: getValues(editorTextName),
        edmContent: getValues(edmContentName),
        emailFooter: sampleFooterText,
        subjectLine: getValues(subjectLineName),
        inboxLinePreview: getValues(inboxLinePreviewName),
        isSplit,
        fieldName,
        handleClose: () => UpdateState(setState, 'SpamScoreModal', false),
        isSpam: true,
    };
    // Helper function to calculate and set iframe height after content loads
    const updateIframeHeight = (iframe, attempt = 0) => {
        if (!iframe || !iframe.contentDocument) return;

        const maxAttempts = 10;
        if (attempt >= maxAttempts) return;

        try {
            const body = iframe.contentDocument.body;
            const html = iframe.contentDocument.documentElement;

            if (!body) {
                setTimeout(() => updateIframeHeight(iframe, attempt + 1), 100);
                return;
            }

            // Wait for images to load
            const images = body.querySelectorAll('img');
            let imagesLoaded = 0;
            let totalImages = images.length;

            if (totalImages === 0) {
                // No images, calculate height immediately
                setIframeHeight(iframe, body);
            } else {
                images.forEach((img) => {
                    if (img.complete) {
                        imagesLoaded++;
                    } else {
                        img.onload = () => {
                            imagesLoaded++;
                            if (imagesLoaded === totalImages) {
                                setIframeHeight(iframe, body);
                            }
                        };
                        img.onerror = () => {
                            imagesLoaded++;
                            if (imagesLoaded === totalImages) {
                                setIframeHeight(iframe, body);
                            }
                        };
                    }
                });

                // Fallback: set height after a delay even if images aren't loaded
                setTimeout(() => {
                    setIframeHeight(iframe, body);
                }, 500);

                // Also set height immediately in case all images are already loaded
                if (imagesLoaded === totalImages) {
                    setIframeHeight(iframe, body);
                }
            }
        } catch (error) {
            if (attempt < maxAttempts) {
                setTimeout(() => updateIframeHeight(iframe, attempt + 1), 200);
            }
        }
    };

    const setIframeHeight = (iframe, body) => {
        if (!iframe || !body) return;

        try {
            // Get the actual scroll height of the content
            const scrollHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                body.clientHeight,
                iframe.contentDocument.documentElement.scrollHeight,
                iframe.contentDocument.documentElement.offsetHeight,
                iframe.contentDocument.documentElement.clientHeight,
            );

            const scrollWidth = Math.max(
                body.scrollWidth,
                body.offsetWidth,
                body.clientWidth,
                iframe.contentDocument.documentElement.scrollWidth,
                iframe.contentDocument.documentElement.offsetWidth,
            );

            // Set iframe height
            if (scrollHeight > 0) {
                iframe.style.height = `${scrollHeight}px`;
                iframe.style.overflowY = 'hidden';
                iframe.style.overflowX = 'hidden';
                iframe.style.maxHeight = 'none';
            }

            // Update container elements
            const templateElement = document.getElementById('template');
            const edmelement = document.querySelector('.edm-import-wrapper');

            if (templateElement && scrollHeight > 0) {
                templateElement.style.height = `${scrollHeight}px`;
                templateElement.style.maxHeight = 'none';
                templateElement.style.overflowY = 'hidden';
                templateElement.style.overflowX = 'hidden';
            }

            if (edmelement && scrollHeight > 0) {
                edmelement.style.height = `${scrollHeight}px`;
                edmelement.style.maxHeight = 'none';
                edmelement.style.overflowY = 'hidden';
                edmelement.style.overflowX = 'hidden';
            }

            // Update dimension value
            if (scrollHeight > 0 && scrollWidth > 0) {
                const tempedmDimension = scrollHeight * scrollWidth;
                setValue(edmContentDimensionName, tempedmDimension);
                iframe.setAttribute('data-scrollWidth', scrollWidth);
                iframe.setAttribute('data-scrollHeight', scrollHeight);
            }
        } catch (error) {
        }
    };

    function handleFileInputChange(content = '', fieldName = '', dimension = 0) {
        try {
            if (content) {
                // Check if content is just an image tag (simple image, not HTML with iframe)
                const trimmedContent = content.trim();
                const isSimpleImageTag = /^<img[^>]*src=["'][^"']+["'][^>]*\/?\s*>$/i.test(trimmedContent);

                if (isSimpleImageTag) {
                    // Extract image src from the tag
                    const srcMatch = trimmedContent.match(/src=["']([^"']+)["']/i);
                    const imageSrc = srcMatch ? srcMatch[1] : '';

                    if (imageSrc) {
                        // Clear existing content
                        const templateElement = document.getElementById('template');
                        if (templateElement) {
                            templateElement.innerHTML = '';
                        }

                        // Create wrapper div to center the image
                        const wrapperDiv = document.createElement('div');
                        wrapperDiv.style.display = 'flex';
                        wrapperDiv.style.justifyContent = 'center';
                        wrapperDiv.style.alignItems = 'center';
                        wrapperDiv.style.width = '100%';
                        wrapperDiv.style.minHeight = 'auto';
                        wrapperDiv.style.overflow = 'hidden';
                        wrapperDiv.style.overflowX = 'hidden';
                        wrapperDiv.style.overflowY = 'hidden';

                        // Create and display image directly (not in iframe)
                        const imgElement = document.createElement('img');
                        imgElement.src = imageSrc;
                        imgElement.alt = 'Content';
                        imgElement.style.maxWidth = '100%';
                        imgElement.style.width = 'auto';
                        imgElement.style.height = 'auto';
                        imgElement.style.display = 'block';

                        // Set height based on image load
                        imgElement.onload = () => {
                            if (templateElement) {
                                const imageHeight = imgElement.offsetHeight || imgElement.naturalHeight;
                                const imageWidth = imgElement.offsetWidth || imgElement.naturalWidth;
                                // Ensure image doesn't exceed container width
                                if (imageWidth > templateElement.offsetWidth && templateElement.offsetWidth > 0) {
                                    imgElement.style.width = '100%';
                                    imgElement.style.height = 'auto';
                                    // Recalculate height after width adjustment
                                    const adjustedHeight = (imageHeight / imageWidth) * templateElement.offsetWidth;
                                    templateElement.style.height = `${adjustedHeight}px`;
                                } else {
                                    templateElement.style.height = `${imageHeight}px`;
                                }
                            }
                        };

                        wrapperDiv.appendChild(imgElement);

                        // Add wrapper to template
                        if (templateElement) {
                            templateElement.appendChild(wrapperDiv);
                            templateElement.classList.add('edm-import-wrapper');
                            // Reset height initially, will be set on image load
                            templateElement.style.height = 'auto';
                            templateElement.style.overflow = 'hidden';
                            templateElement.style.overflowX = 'hidden';
                            templateElement.style.overflowY = 'hidden';
                        }

                        // Set dimension for simple image
                        setValue(edmContentDimensionName, 0);
                        return [true, 'Image loaded successfully'];
                    }
                }

                setTimeout(() => {
                    if (edmContent) {
                        let iframeEl = document.querySelector('#template iframe');
                        let edmelement = document.querySelector('.edm-import-wrapper');
                        const templateElement = document.getElementById('template');

                        if (iframeEl && iframeEl.contentDocument) {
                            // Use the helper function to properly calculate and set height
                            updateIframeHeight(iframeEl);
                            // Also recalculate after delays to ensure content is fully loaded
                            setTimeout(() => updateIframeHeight(iframeEl), 200);
                            setTimeout(() => updateIframeHeight(iframeEl), 500);
                            setTimeout(() => updateIframeHeight(iframeEl), 1000);
                        }
                    }
                }, 1000);
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
                    createFrame.height = 'auto';
                    createFrame.style.width = '100%';
                    createFrame.style.border = 'none';
                    createFrame.scrolling = 'no';
                    document.getElementById('template').appendChild(createFrame);
                    const frameDocument = createFrame.contentDocument;
                    //Reloading the iframe to update
                    createFrame.contentWindow.document.open();
                    createFrame.contentWindow.document.write(content);
                    createFrame.contentDocument.body.setAttribute('contenteditable', false);
                    // Set body styles to prevent scrollbars
                    if (createFrame.contentDocument.body) {
                        createFrame.contentDocument.body.style.overflow = 'hidden';
                        createFrame.contentDocument.body.style.overflowX = 'hidden';
                        createFrame.contentDocument.body.style.overflowY = 'hidden';
                        createFrame.contentDocument.body.style.margin = '0';
                        createFrame.contentDocument.body.style.padding = '0';
                    }
                    // Set html styles to prevent scrollbars
                    if (createFrame.contentDocument.documentElement) {
                        createFrame.contentDocument.documentElement.style.overflow = 'hidden';
                        createFrame.contentDocument.documentElement.style.overflowX = 'hidden';
                        createFrame.contentDocument.documentElement.style.overflowY = 'hidden';
                    }
                    createFrame.contentWindow.document.close();

                    // Update height after content is loaded
                    createFrame.onload = () => {
                        updateIframeHeight(createFrame);
                    };
                    // Also update immediately and after a delay to catch async content
                    setTimeout(() => updateIframeHeight(createFrame), 100);
                    setTimeout(() => updateIframeHeight(createFrame), 500);
                    setTimeout(() => updateIframeHeight(createFrame), 1000);
                    //Adding the style to the iframe
                    frameDocument.body.innerHTML = frameDocument.body.innerHTML + iframeStyles;
                    const tabNames = document.createElement('ul');
                    tabNames.className = 'nav nav-tabs targetTab';
                    const TabNamesList = ['Amp', 'Fallback'];
                    const fontElement = [...frameDocument.getElementsByTagName('font')];
                    fontElement.forEach((fele, index) => {
                        fele.setAttribute('contenteditable', false);
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
                    // Recalculate height after tabs are added
                    setTimeout(() => updateIframeHeight(createFrame), 100);
                    setTimeout(() => updateIframeHeight(createFrame), 500);
                } else if (content.includes(scriptTagStartText) && content.includes(scripttagEndText)) {
                    ///1/2/5/8 Bundling
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
                    createFrame.height = 'auto';
                    createFrame.style.width = '100%';
                    createFrame.style.border = 'none';
                    createFrame.scrolling = 'no';
                    document.getElementById('template').appendChild(createFrame);
                    const frameDocument = createFrame.contentDocument;
                    //Reloading the iframe to update
                    createFrame.contentWindow.document.open();
                    createFrame.contentWindow.document.write(content);
                    createFrame.contentDocument.body.setAttribute('contenteditable', true);
                    // Set body styles to prevent scrollbars
                    if (createFrame.contentDocument.body) {
                        createFrame.contentDocument.body.style.overflow = 'hidden';
                        createFrame.contentDocument.body.style.overflowX = 'hidden';
                        createFrame.contentDocument.body.style.overflowY = 'hidden';
                        createFrame.contentDocument.body.style.margin = '0';
                        createFrame.contentDocument.body.style.padding = '0';
                    }
                    // Set html styles to prevent scrollbars
                    if (createFrame.contentDocument.documentElement) {
                        createFrame.contentDocument.documentElement.style.overflow = 'hidden';
                        createFrame.contentDocument.documentElement.style.overflowX = 'hidden';
                        createFrame.contentDocument.documentElement.style.overflowY = 'hidden';
                    }
                    createFrame.contentWindow.document.close();
                    //Adding the style to the iframe
                    frameDocument.body.innerHTML = frameDocument.body.innerHTML + iframeStyles;

                    // Update height after content is loaded
                    createFrame.onload = () => {
                        updateIframeHeight(createFrame);
                    };
                    // Also update immediately and after delays to catch async content
                    setTimeout(() => updateIframeHeight(createFrame), 100);
                    setTimeout(() => updateIframeHeight(createFrame), 500);
                    setTimeout(() => updateIframeHeight(createFrame), 1000);
                    //Checking whether the labelset is available and throwing the error
                    const editorEle = [...createFrame.contentWindow.document.getElementsByClassName('edit-outline')];
                    // if (labelSet?.length === editorEle?.length) {
                    //Looping the seperated content and adding the the tab and tab content
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
                    // } else {
                    //     throw new Error('Label and tags Set did not match');
                    // }
                    // Recalculate height after all tabs are added
                    setTimeout(() => updateIframeHeight(createFrame), 200);
                    setTimeout(() => updateIframeHeight(createFrame), 600);
                } else {
                    //Creating the iframe and adding the content of the iframe
                    // const iDiv = document.createElement('div');
                    // iDiv.id = 'blocktemplate';
                    // iDiv.className = 'block';
                    // document.getElementById('template').appendChild(iDiv);
                    // document.getElementById('template').setAttribute('contenteditable', true);
                    // document.getElementById('template').setAttribute('change', handleBlurTemplate);
                    // const doc = new DOMParser().parseFromString(content, 'text/html');
                    // document.getElementById('blocktemplate').append(doc?.body);
                    const createFrame = document.createElement('iframe');
                    createFrame.id = 'iframe';
                    createFrame.width = '100%';
                    createFrame.height = 'auto';
                    createFrame.style.width = '100%';
                    createFrame.style.border = 'none';
                    createFrame.scrolling = 'no';
                    document.getElementById('template').appendChild(createFrame);
                    createFrame.contentWindow.document.open();
                    createFrame.contentWindow.document.write(content);
                    createFrame.contentDocument.body.setAttribute('contenteditable', true);
                    // Set body styles to prevent scrollbars
                    if (createFrame.contentDocument.body) {
                        createFrame.contentDocument.body.style.overflow = 'hidden';
                        createFrame.contentDocument.body.style.overflowX = 'hidden';
                        createFrame.contentDocument.body.style.overflowY = 'hidden';
                        createFrame.contentDocument.body.style.margin = '0';
                        createFrame.contentDocument.body.style.padding = '0';
                    }
                    // Set html styles to prevent scrollbars
                    if (createFrame.contentDocument.documentElement) {
                        createFrame.contentDocument.documentElement.style.overflow = 'hidden';
                        createFrame.contentDocument.documentElement.style.overflowX = 'hidden';
                        createFrame.contentDocument.documentElement.style.overflowY = 'hidden';
                    }
                    createFrame.contentWindow.document.close();
                    const frameDocument = createFrame.contentDocument;
                    frameDocument.body.innerHTML = frameDocument.body.innerHTML + iframeStyles;

                    // Update height after content is loaded
                    createFrame.onload = () => {
                        updateIframeHeight(createFrame);
                    };
                    // Also update immediately and after delays to catch async content
                    setTimeout(() => updateIframeHeight(createFrame), 100);
                    setTimeout(() => updateIframeHeight(createFrame), 500);
                    setTimeout(() => updateIframeHeight(createFrame), 1000);
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

                    //setValue(edmContentName, tmp);
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
    // useEffect(() => {
    //     setValue(edmContentName, document.querySelector('iframe')?.contentDocument?.childNodes[1]?.innerHTML);
    // }, [uploadRef]);

    const checkImportUrlError = isSplit ? errors?.[fieldName]?.importUrl : errors?.importUrl;

    const validateImageExtension = useCallback((url) => {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname.toLowerCase();
            const extension = pathname.split('.').pop()?.split('?')[0]; // Remove query params if any
            const allowedExtensions = ['png', 'jpeg', 'jpg', 'gif'];
            return allowedExtensions.includes(extension);
        } catch (error) {
            // If URL parsing fails, try to extract extension from the string directly
            const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/i);
            if (match) {
                const extension = match[1].toLowerCase();
                const allowedExtensions = ['png', 'jpeg', 'jpg', 'gif'];
                return allowedExtensions.includes(extension);
            }
            return false;
        }
    }, []);

    const checkIfImageUrl = useCallback(
        (url) =>
            new Promise((resolve) => {
                const img = new Image();
                let resolved = false;
                const timer = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        resolve(false);
                    }
                }, 5000);
                img.onload = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        resolve(true);
                    }
                };
                img.onerror = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        resolve(false);
                    }
                };
                img.src = url;
            }),
        [],
    );

    const importCampaignFromUrl = useCallback(
        async (url) => {
            if (!url) return;
            const payload = {
                url,
                clientId,
                userId,
                departmentId,
                emailSubscribeType: getValues('type') || 'subscription',
                settingId: locationState?.id || 0,
                emailMessageType: getValues('emailMessageType') || 'welcome',
            };

            const response = await dispatch(uploadURLEDMInEmailSubUnsub({payload}));
            if (response?.status) {
                document.getElementById('template').innerHTML = response?.data?.html;
                setValue(edmContentName, response?.data?.html);
                handleFileInputChange(response?.data?.importContentResult);
                clearErrors(importURLName);
                setAmpValidations('');
            } else {
                setError(importURLName, {
                    type: 'server',
                    message: response?.message,
                });
            }
        },
        [clientId, departmentId, dispatch, edmContentName, importURLName, setError, setValue, userId],
    );

    const processImportUrl = useCallback(
        async (rawUrl) => {
            const trimmedUrl = (rawUrl || '').trim();
            if (!trimmedUrl) return;
            setValue(importURLName, trimmedUrl);

            // If it's an Image URL context, validate extension first
            if (isInPageBannerDeliveryType) {
                const isValidExtension = validateImageExtension(trimmedUrl);
                if (!isValidExtension) {
                    setError(importURLName, {
                        type: 'custom',
                        message: 'Image URL only supports .png, .jpeg, .jpg, .gif extensions only',
                    });
                    return;
                }
            }

            // Check if URL is an image for all cases
            const isImageUrl = await checkIfImageUrl(trimmedUrl);
            if (isImageUrl) {
                // Validate image extension (double check for non-Image URL contexts)
                if (!isInPageBannerDeliveryType) {
                    const isValidExtension = validateImageExtension(trimmedUrl);
                    if (!isValidExtension) {
                        setError(importURLName, {
                            type: 'custom',
                            message: 'Image URL only supports .png, .jpeg, .jpg, .gif extensions only',
                        });
                        return;
                    }
                }

                const imageHtml = `<img src="${trimmedUrl}" alt="Content" style="max-width:100%;height:auto;" />`;
                const [status, message] = handleFileInputChange(imageHtml, fieldName, 0);
                if (status) {
                    setValue(edmContentName, imageHtml);
                    clearErrors(importURLName);
                    setAmpValidations('');
                    return;
                } else {
                    setError(importURLName, {
                        type: 'custom',
                        message,
                    });
                    return;
                }
            }

            // If not an image, try to import as HTML content
            // But if it's Image URL context, show error
            if (isInPageBannerDeliveryType) {
                setError(importURLName, {
                    type: 'custom',
                    message: 'Valid image URL',
                });
                return;
            }

            await importCampaignFromUrl(trimmedUrl);
        },
        [
            isInPageBannerDeliveryType,
            checkIfImageUrl,
            validateImageExtension,
            clearErrors,
            fieldName,
            importCampaignFromUrl,
            importURLName,
            setError,
            setValue,
            edmContentName,
        ],
    );

    const handleImportUrlBlur = useCallback(
        async (e) => {
            const url = e?.target?.value;
            await processImportUrl(url);
        },
        [processImportUrl],
    );

    const formatAmpValidations = (text = '') => {
        if (!text) return null;
        return text
            .split(/(?=line\s\d+)/g)
            .map((item) => item.trim())
            .filter(Boolean);
    };
    return (
      <div className='import-url-blank'>
          <div className="form-group mb0 ">
            <Row className=' my20 ml0 mr0'>
                    <div
                        className={`rs-import-block ${
                            importType === 'url' ? 'import-url-blank' : 'import-url-selected'
                        }`}
                    >
                        <div className="form-group mb0 ">
                            <div className="rs-import-refresh">
                                {(edmContent?.length > 0 ||
                                    zipFileNameText?.[0]?.name?.split('.')?.pop() === 'zip' ||
                                    getValues(importURLName)?.length > 0) && (
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
                                                setAmpValidations('');
                                                const edmelement = document.querySelector('.edm-import-wrapper');
                                                if (edmelement) {
                                                    edmelement.style.height = '';
                                                }
                                                [
                                                    (importURLName,
                                                    zipFileName,
                                                    edmContentName,
                                                    edmContentDimensionName),
                                                ].forEach((name) => {
                                                    resetField(name);
                                                });
                                            }}
                                        />
                                    </RSTooltip>
                                )}
                            </div>
                            <Row
                                className={`rs-import-url-wrapper my20 ml0 mr0 ${
                                    importType === 'url' ? 'active' : ''
                                } ${edmContent?.length > 0 ? 'click-off' : ''}`}
                            >
                                {/* getValues('contentType') === 'Z' */}
                                <Col
                                    sm={2}
                                    className="rsiuw-1 text-center"
                                    onClick={() => setValue(importTypeName, 'url')}
                                >
                                    <div className="rsiuw-holder position-relative top4">
                                        <i className={`${import_link_large} icon-lg color-primary-blue `}></i>
                                        <label className="control-label-left cp">{importUrlLabelText}</label>
                                    </div>
                                </Col>
                                {importType === 'url' && (
                                    <Fragment>
                                        <Col sm={6} className="rsiuw-2 pl50">
                                            <RSInput
                                                control={control}
                                                name={importURLName}
                                                id="rs_Import_CommunicationURL"
                                                placeholder={importUrlPlaceholder}
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
                                        <Col sm={2} className="pl0 rsiuw-3 mt-12">
                                            <RSPrimaryButton
                                                className={`pr20 ${
                                                    !importName || checkImportUrlError ? 'click-off' : ''
                                                }`}
                                                id="rs_Import_Go"
                                                onClick={async () => {
                                                    if (!checkImportUrlError) {
                                                        await processImportUrl(importName);
                                                    }
                                                }}
                                            >
                                                GO
                                            </RSPrimaryButton>
                                        </Col>
                                    </Fragment>
                                )}
                                <Col
                                    sm={importType !== 'url' ? 10 : 2}
                                    className="pr0 pl0 rsiuw-4"
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
                                                    onClick={() => {
                                                        uploadAttemptCount.current += 1;
                                                    }}
                                                    {...register(zipFileName, {
                                                        // required: 'Please select the zip file',
                                                        onChange: (e) => {
                                                            const files = e.target.files[0];
                                                            const fileName = _get(files, 'name', '');
                                                            const edmFileWeight = _get(files, 'size', '');
                                                            setAmpValidations('');
                                                            // console.log('EDM name : ', fileName);
                                                            if (fileName.includes('.zip')) {
                                                                //  const content = converBase64ToText(edmJsonContent);
                                                                // const data = handleFileInputChange(edmContant);
                                                                // if (edmFileWeight < 6485760) {
                                                                // 6mb
                                                                if (edmFileWeight < 5242880) {
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
                                                                                clientId,
                                                                                userId,
                                                                                departmentId,
                                                                                emailSubscribeType: getValues('type') || 'subscription',
                                                                                settingId: locationState?.id || 0,
                                                                                emailMessageType: getValues('emailMessageType') || 'welcome',
                                                                            };
                                                                                const {
                                                                                    data,
                                                                                    status,
                                                                                    message = 'No data available',
                                                                                } = await dispatch(
                                                                                    uploadFileEDMInEmailSubUnsub({
                                                                                        payload,
                                                                                    }),
                                                                                );
                                                                                if (status) {
                                                                                    const { html } = data;
                                                                                    localStorage.setItem(
                                                                                        fieldName || 'edm',
                                                                                        edmFileWeight,
                                                                                    );
                                                                                    // const edmStatus = handleFileInputChange(edmConstant);
                                                                                    const [edmStatus, message] =
                                                                                        handleFileInputChange(
                                                                                            html,
                                                                                            fieldName,
                                                                                            0,
                                                                                        );
                                                                                    setValue(zipFileName, fileName);
                                                                                    clearErrors(zipFileName);
                                                                                    if (edmStatus) {
                                                                                        setValue(edmContentName, html);
                                                                                    } else {
                                                                                        setError(zipFileName, {
                                                                                            type: 'custom',
                                                                                            message,
                                                                                        });
                                                                                    }
                                                                                } else {
                                                                                    if (
                                                                                        message.startsWith(
                                                                                            'AMP Validation',
                                                                                        ) ||
                                                                                        message.includes(
                                                                                            'AMP Validation',
                                                                                        )
                                                                                    ) {
                                                                                        setAmpValidations(message);
                                                                                    } else {
                                                                                        setError(zipFileName, {
                                                                                            type: 'custom',
                                                                                            message,
                                                                                        });
                                                                                    }
                                                                                }
                                                                            }
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
                                                            // console.log('edmContent: ', edmContent);
                                                            const name = _get(value?.[0], 'name', '');
                                                            const edmFileWeight = _get(value?.[0], 'size', '');
                                                            // if (!edmContent && value?.length === 0)
                                                            //     return 'Please select the zip file';
                                                            // else
                                                            if (
                                                                name?.split('.')?.pop() !== 'zip' &&
                                                                name?.length !== 0
                                                            ) {
                                                                return 'Only Zip files are allowed';
                                                            } else if (
                                                                name?.split('.')?.pop() === 'zip' &&
                                                                edmFileWeight > 5242880
                                                            ) {
                                                                return 'File size too large';
                                                            } else if (!edmContent && uploadAttemptCount.current > 1)
                                                                return 'Select zip file';
                                                            else {
                                                                if (edmFileWeight > 5242880)
                                                                    return 'File size too large';
                                                                return true;
                                                            }
                                                        },
                                                        // required: isNotification ? importType === 'import' : false,
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
                                                {/* file name */}
                                                {importType !== 'url' ? (
                                                    <div>
                                                        {typeof zipFileNameText === 'string'
                                                            ? zipFileNameText
                                                            : '' || ''}
                                                    </div>
                                                ) : null}
                                                {/* validate message */}
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
                            <div className="form-group mt30">
                                <Row>
                                    <Col sm={3} className="ml15" style={{ width: '20%' }}>
                                        <label className="control-label-left">
                                            {INBOX_FIRST_LINE_PREVIEW}
                                        </label>
                                    </Col>
                                    <Col
                                        sm={6}
                                        style={{ width: '544px' }}
                                        className={`${isClickOff ? 'pe-none click-off' : ''} position-relative`}
                                    >
                                        <RSEmojiPickerInput
                                            inputName={inboxLinePreviewName}
                                            placeholder={INBOX_FIRST_LINE_MESSAGE}
                                            maxLength={MAX_LENGTH150}
                                            required={false}
                                            iconTopspace={false}
                                            isEmoji={false}
                                        />
                                        <small className="bottom5 position-absolute right15">
                                            {RES_75_CHARACTERS}
                                        </small>
                                        {/* <RSTooltip position="top" text="Recommended: 75 characters" className="lh0">
                                            <i
                                                className={`${users_persona_large} icon-lg color-primary-blue`}
                                                title="Users"
                                            ></i>
                                        </RSTooltip> */}
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
                        {!!ampValidations && (
                            <div className="border p20 color-primary-red">
                                {formatAmpValidations(ampValidations).map((error, index) => (
                                    <div key={index} className="mb10">
                                        {error}
                                    </div>
                                ))}
                            </div>
                        )}
                        {!!bannerSizeWarning && (
                            <RSAlertWarning
                                show={true}
                                message={bannerSizeWarning}
                                showClose={false}
                                handleClose={() => setBannerSizeWarning('')}
                            />
                        )}
                        <div
                            id="template"
                            ref={uploadRef}
                            className={`${edmContent?.length > 0 ? 'edm-import-wrapper EDM-template-preview' : ''}`}
                            style={{
                                overflow: 'hidden',
                                overflowX: 'hidden',
                                overflowY: 'hidden',
                                maxHeight: 'none',
                                width: '100%',
                            }}
                        ></div>
                    </div>
            </Row>
        </div>
      </div>
    );
};

export default EDMImport;

const iframeStyles = `<style>
iframe {
 height: 100vh;
 background
}
.nav-tabs{
list-style:none;
display: flex;
padding-left: 10px;
cursor: pointer;
align-items: center;
justify-content: center;
}
.tab-active{
border:1px dotted blue;
position: relative;
background-color: blue !important;
color: white !important;
}
.tab-active::before {
  content: '';
  position: absolute;
  top: 100%; 
  left: 50%;
  margin-left: -10px;
  width: 0;
  height: 0;
  border-top: 10px solid #005bf6;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}
.nav-tabs li {
    padding: 8px 12px;
    margin-right:1px;
    border: 1px solid blue;
    background-color: white;
}
.active {
 display: block !important;
}
.tab-pane {
 display: none;
}
a, input, button {
 pointer-events: none !important;
}
</style>`;
