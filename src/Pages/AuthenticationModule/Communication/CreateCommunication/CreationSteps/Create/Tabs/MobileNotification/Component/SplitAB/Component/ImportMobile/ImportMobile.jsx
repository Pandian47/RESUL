import { UpdateState } from 'Utils/modules/misc';

import { removeTags } from 'Utils/modules/stringUtils';

import { MAX_LENGTH150, URLPATTERN } from 'Constants/GlobalConstant/Regex';
import { ADD_VIEW_IN_BROWSER, COMMUNICATION_URL, EMAIL_NOT_DISPLAYING, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_VIDEO, INBOX_FIRST_LINE_MESSAGE, INBOX_FIRST_LINE_PREVIEW, RES_75_CHARACTERS, VIEW_IN_BROWSER } from 'Constants/GlobalConstant/Placeholders';
import { builder_upload_large, import_link_large, restart_medium, spam_assassin_medium, zip_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import _get from 'lodash/get';

import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { RSPrimaryButton } from 'Components/Buttons';

import { iframeStyles } from 'Pages/AuthenticationModule/Components/Import/constant';

import InteractivityButtonsPreview from '../../../Create/Component/Preview/InteractivityButtonsPreview';

import Import from '../../Import/Import';

import {
  getCheckSpam,
  getImportCampaign,
  uploadCommunicationFile,
  uploadCommunicationFileWeb,
  uploadMessagingVideoDocument,
  uploadMobilePush } from
'Reducers/communication/createCommunication/Create/request';
import SpamScoreModal from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/SpamScoreModal/SpamScoreModal';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
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

const IMAGE_URL_EXTENSIONS = new Set([
'jpg',
'jpeg',
'png',
'gif']
);
const VIDEO_URL_EXTENSIONS = new Set([
'mp4']
);
const BANNER_IMPORT_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'zip'];
const MAX_IMPORT_FILE_SIZE = 5242880;

const getVideoMimeType = (fileName) => {
  const ext = fileName?.split('.')?.pop()?.toLowerCase() || '';
  const mimeMap = { mp4: 'video/mp4' };
  return mimeMap[ext] || 'video/mp4';
};

const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};

function getUrlResourceExtension(urlString) {
  if (!urlString || typeof urlString !== 'string') return '';
  try {
    const pathname = new URL(urlString, typeof window !== 'undefined' ? window.location.origin : undefined).
    pathname;
    const last = pathname.split('/').pop() || '';
    const name = last.split('?')[0].split('#')[0];
    const dot = name.lastIndexOf('.');
    if (dot < 1 || dot >= name.length - 1) return '';
    return name.slice(dot + 1).toLowerCase();
  } catch {
    const m = urlString.match(/\.([a-z0-9]+)(?:\?|#|$)/i);
    return m ? m[1].toLowerCase() : '';
  }
}

import MobilePreviewConfig from '../MobilePreviewConfig/MobilePreviewConfig';
import RSAlertWarning from 'Components/RSAlertWarning';

import ImageUpload from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Component/ImageUpload/ImageUpload';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';

const ImportMobile = ({
  fieldName = '',
  isSplit = false,
  showBrowerText = false,
  isNotification = false,
  channelId,
  type = 'mobile',
  index
}) => {
    // console.log('fieldName: ', fieldName);
    const dispatch = useDispatch();
    const zipUploadLoader = useApiLoader();
    const uploadRef = useRef();
    const uploadAttemptCount = useRef(0);
    // Width   // Height
    const width = uploadRef.current?.clientWidth;
    const height = uploadRef.current?.clientHeight;
    const [state, setState] = useState({
        SpamScoreModal: false,
    });
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const { personalization, listTypeWisePersonlization } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );
    const [isClickOff, setIsClickOff] = useState(false);
    const [inPageImageUploadModalOpen, setInPageImageUploadModalOpen] = useState(false);
    const [ampValidations, setAmpValidations] = useState('');
    const [bannerSizeWarning, setBannerSizeWarning] = useState('');

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
    trigger
  } = useFormContext();

  const [layoutPosition] = watch(['layoutPosition']);

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
  const serverImageURLName = isSplit ? `${fieldName}.serverImageURL` : 'serverImageURL';
  const serverVideoURLName = isSplit ? `${fieldName}.serverVideoURL` : 'serverVideoURL';

  const expiryName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiry` : 'expiry';
  const titleName = isSplit ? `${fieldName}.title.text` : 'title.text';
  const colorPickerName = isSplit ? `${fieldName}.title.fontColor` : 'title.fontColor';
  const shortDescName = isSplit ? `${fieldName}.shortDesc.text` : 'shortDesc.text';
  const shortDescColorPickerName = isSplit ? `${fieldName}.shortDesc.fontColor` : 'shortDesc.fontColor';
  const interactivityName = isSplit ? `${fieldName}.interactivity` : 'interactivity';
  const bgOverlayName = isSplit ? `${fieldName}.bgOverlay` : 'bgOverlay';
  const bgOverlayColorName = isSplit ? `${fieldName}.bgOverlayColor` : 'bgOverlayColor';
  const currentTabName = isSplit ? `${fieldName}.currentTabIndex` : 'currentTabIndex';
  // const alertName = isSplit ? `${fieldName}.alert` : 'alert';
  const makeAlertName = isSplit ? `${fieldName}.makeAlert` : 'makeAlert';
  const thumbnailName = isSplit ? `${fieldName}.thumbnailUrl` : 'thumbnailUrl';
  const tabErrorText = isSplit ? `${fieldName}.tabErrorText` : 'tabErrorText';
  const buttonTextName = isSplit ? `${fieldName}.buttonText` : 'buttonText';
  const expiryTimeName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiryTime` : 'expiryTime';
  const expiryValueName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiryValue` : 'expiryValue';
  const hashTagName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.hashtag` : 'hashtag';
  const contentInputName = isSplit ? `${fieldName}.contentInput` : 'contentInput';
  const alertSoundName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.alertSound` : 'alertSound';
  const alertSoundValueName =
  isSplit && layoutPosition?.id !== 4 ? `${fieldName}.alertSoundValue` : 'alertSoundValue';
  const newAlertSoundName =
  isSplit && layoutPosition?.id !== 4 ? `${fieldName}.newAlertSoundName` : 'newAlertSoundName';
  const newAlertSound = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.newAlertSound` : 'newAlertSound';
  // const newAlertSoundName =
  //     isSplit && layoutPosition?.id !== 4 ? `${fieldName}.newAlertSoundName` : 'newAlertSoundName';

  const impressionsName = isSplit ? `${fieldName}.impressions` : 'impressions';
  const priorityName = isSplit ? `${fieldName}.priority` : 'priority';
  const [clickOff, setClickOff] = useState(true);

  const tabErrorMessage = _get(errors, `${tabErrorText}.message`, null);
  const hastTagErrorMessage = _get(errors, `${hashTagName}.message`, null);
  const buttonText = useWatch({ name: buttonTextName, control }) || [];
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
  interactivity,
  bgOverLay,
  bgOverlayColor,
  expiry,
  currentPage = null,
  hashTag,
  makeAlert,
  approvalList,
  alertSound,
  mobileApp,
  contentInput,
  titleColor,
  shortDescColor,
  scheduleAlert,
  newAlert,
  expiryTimeType,
  alertSoundValue,
  impressions,
  priority] =
  watch([
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
  interactivityName,
  bgOverlayName,
  bgOverlayColorName,
  expiryName,
  currentTabName,
  hashTagName,
  makeAlertName,
  'approvalList',
  alertSoundName,
  'mobileApp',
  contentInputName,
  colorPickerName,
  shortDescColorPickerName,
  'scheduleAlert',
  newAlertSound,
  expiryTimeName,
  alertSoundValueName,
  impressionsName,
  priorityName]
  );

  const location = useQueryParams('/communication');
  const isInitializedRef = useRef(false);

  // const edmJsonContent = JSON.parse(edmContentAPIResponse.channelJson).content[0].body;
  // console.log('myFileName: ', zipFileNameText);

  const isInPageBannerDeliveryType = deliveryType?.id == 5;
  const importUrlLabelText = isInPageBannerDeliveryType ? 'Media URL' : 'Import URL';
  const importUrlPlaceholder = isInPageBannerDeliveryType ? 'Enter media URL' : COMMUNICATION_URL;
  const importFileLabelText = isInPageBannerDeliveryType ? 'Import' : 'Import ZIP file';
  const importFileAccept = isInPageBannerDeliveryType ? '.jpg,.jpeg,.png,.gif,.mp4,.zip' : '.zip';
  const importSupportedFormatText = isInPageBannerDeliveryType ?
  'Supported: .jpg, .jpeg, .png, .gif, .mp4' :
  '';
  // console.log('zipFileTextName: ', myFileName);

  // Parse banner size from bannerSize string (e.g., "300x250" -> {width: 300, height: 250})
  const parseBannerSize = useCallback((bannerSize) => {
    if (!bannerSize || typeof bannerSize !== 'string') return null;

    // Extract dimensions from formats like "300x250", "300 x 250", "(300x250)", etc.
    const match = bannerSize.match(/(\d+)\s*[xX×]\s*(\d+)/);
    if (match) {
      return {
        width: parseInt(match[1], 10),
        height: parseInt(match[2], 10)
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
    const videoElement = templateElement?.querySelector('video');

    if (!edmelement && !templateElement && !iframeEl && !imgElement && !videoElement) {
      setBannerSizeWarning('');
      return;
    }

    let imageWidth = 0;
    let imageHeight = 0;
    if (imgElement && !iframeEl) {
      imageWidth = imgElement.naturalWidth || imgElement.offsetWidth || 0;
      imageHeight = imgElement.naturalHeight || imgElement.offsetHeight || 0;
    } else if (videoElement && !iframeEl) {
      imageWidth = videoElement.videoWidth || videoElement.offsetWidth || 0;
      imageHeight = videoElement.videoHeight || videoElement.offsetHeight || 0;
    }

    let iframeWidth = 0;
    let iframeHeight = 0;
    if (iframeEl && iframeEl.contentDocument) {
      const bodyElement = Array.from(iframeEl.contentDocument.children?.[0]?.childNodes || []).filter(
        (node) => node.nodeType === 1 && node.nodeName.toLowerCase() === 'body'
      )?.[0];
      if (bodyElement) {
        iframeWidth = bodyElement?.scrollWidth || bodyElement?.offsetWidth || 0;
        iframeHeight = bodyElement?.scrollHeight || bodyElement?.offsetHeight || 0;
      }
    }

    const elementWidth = Math.max(
      edmelement?.offsetWidth - 10 || 0,
      templateElement?.offsetWidth - 10 || 0,
      iframeEl?.offsetWidth || 0,
      iframeWidth,
      imageWidth,
      parseInt(edmelement?.style?.width?.replace('px', '') || '0', 10),
      parseInt(templateElement?.style?.width?.replace('px', '') || '0', 10)
    );

    const elementHeight = Math.max(
      parseInt(edmelement?.style?.height?.replace('px', '') || '0', 10),
      parseInt(templateElement?.style?.height?.replace('px', '') || '0', 10),
      parseInt(iframeEl?.style?.height?.replace('px', '') || '0', 10),
      edmelement?.offsetHeight - 10 || 0,
      templateElement?.offsetHeight - 10 || 0,
      iframeEl?.offsetHeight || 0,
      iframeHeight,
      imageHeight
    );

    // Check if banner dimensions are less than element dimensions
    if (elementWidth > 0 && elementHeight > 0) {
      if (bannerDimensions.width < elementWidth || bannerDimensions.height < elementHeight) {
        setBannerSizeWarning(
          `Warning: Banner size (${bannerDimensions.width}x${bannerDimensions.height}) is smaller than the imported content dimensions (${elementWidth}x${elementHeight}). This may cause display issues.`
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
      const videoEl = templateElement?.querySelector('video');
      if (imgElement && !iframeEl) {
        const imageHeight = imgElement.offsetHeight || imgElement.naturalHeight;
        const imageWidth = imgElement.offsetWidth || imgElement.naturalWidth;
        if (templateElement && imageHeight) {
          if (imageWidth > templateElement.offsetWidth && templateElement.offsetWidth > 0) {
            imgElement.style.maxWidth = '100%';
            imgElement.style.width = '100%';
            imgElement.style.height = 'auto';
          }
          templateElement.style.overflow = 'hidden';
          templateElement.style.overflowX = 'hidden';
          templateElement.style.overflowY = 'hidden';
        }
        if (edmelement && imageHeight) {
          edmelement.style.overflow = 'hidden';
          edmelement.style.overflowX = 'hidden';
          edmelement.style.overflowY = 'hidden';
        }
      } else if (videoEl && !iframeEl) {
        const onVideoReady = () => {
          const vw = videoEl.videoWidth || videoEl.offsetWidth;
          const vh = videoEl.videoHeight || videoEl.offsetHeight;
          if (templateElement && vh) {
            if (vw > templateElement.offsetWidth && templateElement.offsetWidth > 0) {
              videoEl.style.maxWidth = '100%';
              videoEl.style.width = '100%';
              videoEl.style.height = 'auto';
            }
            templateElement.style.overflow = 'hidden';
            templateElement.style.overflowX = 'hidden';
            templateElement.style.overflowY = 'hidden';
          }
          if (edmelement && vh) {
            edmelement.style.overflow = 'hidden';
            edmelement.style.overflowX = 'hidden';
            edmelement.style.overflowY = 'hidden';
          }
          if (isInPageBannerDeliveryType && inPageBanner) {
            setTimeout(() => checkBannerDimensions(), 100);
          }
        };
        if (videoEl.readyState >= 1) {
          onVideoReady();
        } else {
          videoEl.addEventListener('loadedmetadata', onVideoReady, { once: true });
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

  useEffect(() => {
    const campaignId = location?.campaignId;
    return () => {
      isInitializedRef.current = false;
    };
  }, [location?.campaignId]);

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
    isSpam: true
  };
  const getSpamScore = (html) => {
    dispatch(
      getCheckSpam({
        payload: {
          userId,
          clientId,
          departmentId,
          campaignId: location?.campaignId,
          body: html,
          body1: spamScoreModalProps?.content, //Text editor content
          emailFooterRawcode: spamScoreModalProps?.emailFooter,
          preHeaderMessage: getValues(inboxLinePreviewName),
          subjectLine: getValues(subjectLineName),
          spamScore: spamScoreName,
          top3: top3Name,
          setValue
        }
      })
    );
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
      console.error('Error updating iframe height:', error);
      if (attempt < maxAttempts) {
        setTimeout(() => updateIframeHeight(iframe, attempt + 1), 200);
      }
    }
  };

  const setIframeHeight = (iframe, body) => {
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument;
      if (!doc?.body) return;

      const currentBody = doc.body;

      iframe.style.setProperty('height', '10000px', 'important');
      void currentBody.offsetHeight;

      let maxBottom = 0;
      currentBody.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          maxBottom = Math.max(maxBottom, rect.bottom);
        }
      });

      const contentHeight = Math.ceil(maxBottom) || currentBody.scrollHeight;
      const scrollWidth = Math.max(currentBody.scrollWidth, currentBody.offsetWidth);

      const iframeTransform = window.getComputedStyle(iframe).transform;
      let scale = 0.4;
      if (iframeTransform && iframeTransform !== 'none') {
        const match = iframeTransform.match(/matrix\(([^,]+)/);
        if (match) scale = parseFloat(match[1]);
      }
      const scaledHeight = Math.ceil(contentHeight * scale);

      if (contentHeight > 0) {
        iframe.style.setProperty('height', `${contentHeight}px`, 'important');
        iframe.style.overflowY = 'hidden';
        iframe.style.overflowX = 'hidden';
        iframe.style.maxHeight = 'none';
      }

      const templateElement = document.getElementById('template');
      const edmelement = document.querySelector('.edm-import-wrapper');

      if (templateElement && contentHeight > 0) {
        templateElement.style.height = `${scaledHeight}px`;
        templateElement.style.maxHeight = `${scaledHeight}px`;
        templateElement.style.overflow = 'hidden';
      }

      if (contentHeight > 0 && scrollWidth > 0) {
        const tempedmDimension = contentHeight * scrollWidth;
        setValue(edmContentDimensionName, tempedmDimension);
        iframe.setAttribute('data-scrollWidth', scrollWidth);
        iframe.setAttribute('data-scrollHeight', contentHeight);
      }
    } catch (error) {
      console.error('Error setting iframe height:', error);
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
                }
              }
            };

            wrapperDiv.appendChild(imgElement);

            if (templateElement) {
              templateElement.innerHTML = '';
              templateElement.appendChild(wrapperDiv);
              templateElement.classList.add('edm-import-wrapper');
              templateElement.style.overflow = 'hidden';
              templateElement.style.overflowX = 'hidden';
              templateElement.style.overflowY = 'hidden';
            }

            setValue(edmContentDimensionName, 0);
            return [true, 'Image loaded successfully'];
          }
        }

        const isSimpleVideoTag = /^<video[\s\S]*<\/video>\s*$/i.test(trimmedContent);
        if (isSimpleVideoTag) {
          const sourceMatch = trimmedContent.match(/<source[^>]+src=["']([^"']+)["']/i);
          const videoSrcAttr = trimmedContent.match(/<video[^>]+src=["']([^"']+)["']/i);
          const videoSrc = sourceMatch?.[1] || videoSrcAttr?.[1] || '';
          const typeMatch = trimmedContent.match(/type=["']([^"']+)["']/i);
          const mimeType = typeMatch?.[1] || 'video/mp4';

          if (videoSrc) {
            const templateElement = document.getElementById('template');
            if (templateElement) {
              templateElement.innerHTML = '';
            }

            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.display = 'flex';
            wrapperDiv.style.justifyContent = 'center';
            wrapperDiv.style.alignItems = 'center';
            wrapperDiv.style.width = '100%';
            wrapperDiv.style.minHeight = 'auto';
            wrapperDiv.style.overflow = 'hidden';

            const videoElement = document.createElement('video');
            videoElement.setAttribute('controls', '');
            videoElement.setAttribute('playsinline', '');
            videoElement.style.maxWidth = '100%';
            videoElement.style.height = 'auto';
            videoElement.style.display = 'block';
            videoElement.muted = true;

            const sourceEl = document.createElement('source');
            sourceEl.src = videoSrc;
            sourceEl.type = mimeType;
            videoElement.appendChild(sourceEl);

            videoElement.addEventListener(
              'loadedmetadata',
              () => {
                if (
                templateElement &&
                videoElement.videoWidth > templateElement.offsetWidth &&
                templateElement.offsetWidth > 0)
                {
                  videoElement.style.width = '100%';
                  videoElement.style.height = 'auto';
                }
              },
              { once: true }
            );

            wrapperDiv.appendChild(videoElement);
            if (templateElement) {
              templateElement.innerHTML = '';
              templateElement.appendChild(wrapperDiv);
              templateElement.classList.add('edm-import-wrapper');
              templateElement.style.overflow = 'hidden';
            }

            setValue(edmContentDimensionName, 0);
            return [true, 'Video loaded successfully'];
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
          createFrame.class = 'preview-email-iframe';
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
          createFrame.className = 'preview-email-iframe';
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
              elementInnerHTML.lastIndexOf(tagEndText)
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
                document.createComment(`<!--DIVSTART:${parenetElementId}-->`)
              );
              childNodes.forEach((childEle, index) => {
                const tabPane = document.createElement('div');
                tabPane.id = `${buildId}${index}`;
                tabPane.setAttribute('data-name', labelSet[index]);
                tabPane.setAttribute('data-index', index);
                tabPane.className = `tab-pane${index === 0 ? ' active' : ''}`;
                const tagType = imageEditor ? 'img' : 'txt';
                tabPane.appendChild(
                  document.createComment(`<!--[st:${tagType}:${eleIndex}:li:${index}]-->`)
                );
                tabPane.appendChild(childEle);
                tabPane.appendChild(
                  document.createComment(`<!--[end:${tagType}:${eleIndex}:li:${index}]-->`)
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
          createFrame.className = 'preview-email-iframe';
          createFrame.width = '100%';
          createFrame.height = 'auto';
          createFrame.style.width = '100%';
          createFrame.style.border = 'none';
          createFrame.scrolling = 'no';
          document.getElementById('template').appendChild(createFrame);
          createFrame.contentWindow.document.open();
          createFrame.contentWindow.document.write(content);
          //createFrame.contentDocument.body.setAttribute('contenteditable', true);
          // Set body styles to prevent scrollbars
          // if (createFrame.contentDocument.body) {
          //     createFrame.contentDocument.body.style.overflow = 'hidden';
          //     createFrame.contentDocument.body.style.overflowX = 'hidden';
          //     createFrame.contentDocument.body.style.overflowY = 'hidden';
          //     createFrame.contentDocument.body.style.margin = '0';
          //     createFrame.contentDocument.body.style.padding = '0';
          // }
          // // Set html styles to prevent scrollbars
          // if (createFrame.contentDocument.documentElement) {
          //     createFrame.contentDocument.documentElement.style.overflow = 'hidden';
          //     createFrame.contentDocument.documentElement.style.overflowX = 'hidden';
          //     createFrame.contentDocument.documentElement.style.overflowY = 'hidden';
          // }
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

  const checkIfImageUrl = useCallback((url) => {
    const ext = getUrlResourceExtension(url);
    if (ext && IMAGE_URL_EXTENSIONS.has(ext)) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 12000);
      const finish = (ok) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(ok);
        }
      };
      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      img.src = url;
    });
  }, []);

  const checkIfVideoUrl = useCallback((url) => {
    const ext = getUrlResourceExtension(url);
    if (ext && VIDEO_URL_EXTENSIONS.has(ext)) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.muted = true;
      video.preload = 'metadata';
      video.referrerPolicy = 'no-referrer';
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 12000);
      const done = (ok) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(ok);
        }
      };
      video.onloadedmetadata = () => done(true);
      video.onerror = () => done(false);
      video.src = url;
    });
  }, []);

  const getVideoMimeFromUrl = (url) => {
    const ext = (url.match(/\.([a-z0-9]+)(?:\?|#|$)/i) || [])[1]?.toLowerCase();
    const map = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      mov: 'video/quicktime',
      m4v: 'video/x-m4v'
    };
    return map[ext] || 'video/mp4';
  };

  const clearImportValidationErrors = useCallback(() => {
    clearErrors(zipFileName);
    clearErrors(tabErrorText);
  }, [clearErrors, zipFileName, tabErrorText]);

  useEffect(() => {
    if (!isInPageBannerDeliveryType) return;
    const hasContent = typeof edmContent === 'string' && edmContent.trim().length > 0;
    if (hasContent && (zipFileErrorMessage || tabErrorMessage)) {
      clearImportValidationErrors();
    }
  }, [
    edmContent,
    isInPageBannerDeliveryType,
    zipFileErrorMessage,
    tabErrorMessage,
    clearImportValidationErrors,
  ]);

  const importCampaignFromUrl = useCallback(
    async (url) => {
      if (!url) return { status: false, message: 'Enter a URL' };
      const payload = {
        url,
        splitType: '',
        clientId,
        userId,
        departmentId
      };

            const response = await zipUploadLoader.refetch({
                fetcher: ({ payload: urlPayload } = {}) =>
                    dispatch(getImportCampaign(urlPayload, { loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            });
            if (response?.status) {
                document.getElementById('template').innerHTML = response?.data?.html;
                setValue(edmContentName, response?.data?.html);
                handleFileInputChange(response?.data?.importContentResult);
                clearErrors(importURLName);
                setAmpValidations('');
                return { status: true, message: '' };
            }
            setError(importURLName, {
                type: 'server',
                message: response?.message,
            });
            return { status: false, message: response?.message || 'Import failed' };
        },
        [clientId, departmentId, dispatch, edmContentName, importURLName, setError, setValue, userId],
    );

  const processImportUrl = useCallback(
    async (rawUrl, opts = {}) => {
      const trimmedUser = String(rawUrl || '').trim();
      const trimmedServer = String(opts?.serverUrl || '').trim();
      const trimmedUrl = trimmedServer || trimmedUser;
      if (!trimmedUrl) return { status: false, message: 'Enter a URL' };
      setValue(importURLName, trimmedUrl);

      if (isInPageBannerDeliveryType) {
        const isImageUrl = await checkIfImageUrl(trimmedUrl);
        if (isImageUrl) {
          const imageHtml = `<img src="${trimmedUrl.replace(/"/g, '&quot;')}" alt="Content" style="max-width:100%;height:auto;" />`;
          const [status, message] = handleFileInputChange(imageHtml, fieldName, 0);
          if (status) {
            setValue(edmContentName, imageHtml);
            clearErrors(importURLName);
            clearImportValidationErrors();
            setAmpValidations('');
            return { status: true, message: '' };
          }
          setError(importURLName, { type: 'custom', message });
          return { status: false, message: message || 'Unable to apply image URL' };
        }
        const isVideoUrl = await checkIfVideoUrl(trimmedUrl);
        if (isVideoUrl) {
          const mime = getVideoMimeFromUrl(trimmedUrl);
          const safe = trimmedUrl.replace(/"/g, '&quot;');
          const videoHtml = `<video controls playsinline style="max-width:100%;height:auto;"><source src="${safe}" type="${mime}" /></video>`;
          const [status, message] = handleFileInputChange(videoHtml, fieldName, 0);
          if (status) {
            setValue(edmContentName, videoHtml);
            clearErrors(importURLName);
            clearImportValidationErrors();
            setAmpValidations('');
            return { status: true, message: '' };
          }
          setError(importURLName, { type: 'custom', message });
          return { status: false, message: message || 'Unable to apply video URL' };
        }
        return importCampaignFromUrl(trimmedUrl);
      }

      const isImageUrl = await checkIfImageUrl(trimmedUrl);
      if (isImageUrl) {
        const isValidExtension = validateImageExtension(trimmedUrl);
        if (!isValidExtension) {
          const msg = 'Image URL only supports .png, .jpeg, .jpg, .gif extensions only';
          setError(importURLName, {
            type: 'custom',
            message: msg
          });
          return { status: false, message: msg };
        }
        const imageHtml = `<img src="${trimmedUrl.replace(/"/g, '&quot;')}" alt="Content" style="max-width:100%;height:auto;" />`;
        const [status, message] = handleFileInputChange(imageHtml, fieldName, 0);
        if (status) {
          setValue(edmContentName, imageHtml);
          clearErrors(importURLName);
          clearImportValidationErrors();
          setAmpValidations('');
          return { status: true, message: '' };
        }
        setError(importURLName, { type: 'custom', message });
        return { status: false, message: message || 'Unable to apply image URL' };
      }

      return importCampaignFromUrl(trimmedUrl);
    },
    [
    isInPageBannerDeliveryType,
    checkIfImageUrl,
    checkIfVideoUrl,
    validateImageExtension,
    clearErrors,
    clearImportValidationErrors,
    fieldName,
    importCampaignFromUrl,
    importURLName,
    setError,
    setValue,
    edmContentName]

  );

    const handleImportUrlBlur = useCallback(
        async (e) => {
            const url = e?.target?.value;
            await processImportUrl(url);
        },
        [processImportUrl],
    );
    const getFileExtension = (fileName = '') => fileName?.split('.')?.pop()?.toLowerCase();
    const isZipExtension = (ext) => ext === 'zip';
    const isAllowedImportExtension = (ext) =>
        isInPageBannerDeliveryType ? BANNER_IMPORT_EXTENSIONS.includes(ext) : isZipExtension(ext);
    const getImportValidationMessage = () =>
        isInPageBannerDeliveryType
            ? 'Only zip, jpg, jpeg, png, gif, mp4 files are allowed'
            : 'Only Zip files are allowed';
    const extractUploadedUrl = (data) =>
        Array.isArray(data) && data[0]?.url ? data[0]?.url : typeof data === 'string' ? data : url || path || '';
    const getMediaHtml = (mediaUrl, extension) => {
        const safe = mediaUrl.replace(/"/g, '&quot;');
        return extension === 'mp4'
            ? `<video controls playsinline style="max-width:100%;height:auto;"><source src="${safe}" type="video/mp4" /></video>`
            : `<img src="${safe}" alt="Content" style="max-width:100%;height:auto;" />`;
    };
    const applyHtmlToEditor = (htmlContent) => {
        const [edmStatus, message] = handleFileInputChange(htmlContent, fieldName, 0);
        if (edmStatus) {
            setValue(edmContentName, htmlContent);
            clearErrors(zipFileName);
        } else {
            setError(zipFileName, { type: 'custom', message });
        }
    };
    const uploadZipFile = async ({ payload, fileName, edmFileWeight }) => {
        if (isNotification) {
            const { data, status } =
                (await zipUploadLoader.refetch({
                    fetcher: ({ payload: uploadPayload } = {}) =>
                        dispatch(uploadCommunicationFileWeb({ payload: uploadPayload, loading: false })),
                    mode: 'create',
                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload },
                })) || {};
            setValue(zipFileTextName, fileName);
            if (!status) return;
            const html = html;
            localStorage.setItem(fieldName || 'edm', edmFileWeight);
            setValue(edmGuidName, edmGuid);
            applyHtmlToEditor(html);
            return;
        }
        const { data, status, message = 'No data available' } = await dispatch(uploadCommunicationFile({ payload }));
        setValue(zipFileTextName, fileName);
        if (status) {
            const html = html;
            localStorage.setItem(fieldName || 'edm', edmFileWeight);
            setValue(zipFileName, fileName);
            clearErrors(zipFileName);
            applyHtmlToEditor(html);
            setTimeout(() => {
                getSpamScore(html);
            }, 10);
        } else if (message.startsWith('AMP Validation') || message.includes('AMP Validation')) {
            setAmpValidations(message);
        } else {
            setError(zipFileName, { type: 'custom', message });
        }
    };
    const uploadInPageBannerMediaFile = async ({ fileByte, extension, fileName, edmFileWeight }) => {
        let result;
        if (extension === 'mp4') {
            const formData = new FormData();
            const mimeType = getVideoMimeType(fileName);
            const blob = base64ToBlob(fileByte, mimeType);
            formData.append('file', blob, fileName);
            formData.append('departmentId', departmentId);
            formData.append('clientId', clientId);
            formData.append('userId', userId);
            result = await zipUploadLoader.refetch({
                fetcher: ({ payload: mediaPayload } = {}) =>
                    dispatch(uploadMessagingVideoDocument({ payload: mediaPayload, loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload: formData },
            });
        } else {
            const mediaPayload = {
                base64Image: fileByte,
                imageFormat: extension,
                contentLength: edmFileWeight,
                clientId,
                userId,
                departmentId,
                channelId: channelId ?? 0,
                campaignId: location?.campaignId ?? 0,
            };
            result = await zipUploadLoader.refetch({
                fetcher: ({ payload: mediaPayloadInner } = {}) =>
                    dispatch(uploadMobilePush({ payload: mediaPayloadInner, loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload: mediaPayload },
            });
        }
        setValue(zipFileTextName, fileName);
        if (!result?.status) {
            return { status: false, message: result?.message || 'Upload failed' };
        }
        const mediaUrl = extractUploadedUrl(result?.data);
        setValue(importURLName, mediaUrl || '');
        if (!mediaUrl) {
            setError(zipFileName, { type: 'custom', message: 'Unable to upload media file' });
            return { status: false, message: 'Unable to upload media file' };
        }
        const mediaHtml = getMediaHtml(mediaUrl, extension);
        applyHtmlToEditor(mediaHtml);
        return { status: true, message: '' };
    };

  const handleImageUploadFromModal = async (base64Image, fileName, contentLength) => {
    if (!base64Image || !fileName) {
      return { status: false, message: 'Invalid file' };
    }
    const extension = getFileExtension(fileName);
    if (isZipExtension(extension) || !isAllowedImportExtension(extension)) {
      return { status: false, message: getImportValidationMessage() };
    }
    if (contentLength >= MAX_IMPORT_FILE_SIZE) {
      setError(zipFileName, { type: 'custom', message: 'File size too large' });
      return { status: false, message: 'File size too large' };
    }
    return uploadInPageBannerMediaFile({
      fileByte: base64Image,
      extension,
      fileName,
      edmFileWeight: contentLength
    });
  };

  const handleImportFileUpload = async (file) => {
    const fileName = _get(file, 'name', '');
    const edmFileWeight = _get(file, 'size', '');
    const extension = getFileExtension(fileName);
    if (!isAllowedImportExtension(extension)) return;
    if (edmFileWeight >= MAX_IMPORT_FILE_SIZE) {
      setError(zipFileName, { type: 'custom', message: 'File size too large' });
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const fileByte = reader.result.split(',')[1];
      const payload = {
        fileName,
        fileByte,
        edmFileWeight,
        campaignType: location?.campaignType ?? '',
        channelId: channelId ?? 0,
        campaignId: location?.campaignId ?? 0
      };
      if (!isInPageBannerDeliveryType || isZipExtension(extension)) {
        await uploadZipFile({ payload, fileName, edmFileWeight });
        return;
      }
      if (isNotification && isInPageBannerDeliveryType) {
        await uploadInPageBannerMediaFile({ fileByte, extension, fileName, edmFileWeight });
      }
    };
  };

  const showImportResetIcon =
  edmContent?.length > 0 ||
  zipFileNameText?.[0]?.name?.split('.')?.pop() === 'zip' ||
  getValues(importURLName)?.length > 0;

  const handleImportResetClick = () => {
    handleFileInputChange('');
    setValue(edmContentName, '');
    setValue(edmContentDimensionName, 0);
    setValue(templateContentName, '');
    setValue(sampleEmailFooterName, '');
    setValue(unSubscriptionName, false);
    setValue(emailFooterName, false);
    setValue(viewInbrowserName, true);
    setValue(zipFileName, '');
    clearImportValidationErrors();
    setValue(importURLName, '');
    setValue(serverImageURLName, '');
    setValue(serverVideoURLName, '');
    setAmpValidations('');
    setInPageImageUploadModalOpen(false);
    const edmelement = document.querySelector('.edm-import-wrapper');
    if (edmelement) {
      edmelement.style.height = '';
    }
  };

  const browserTextExtras =
  showBrowerText && edmContent?.length > 0 ?
  <Fragment>
                <div className="form-group mt30">
                    <Row>
                        <Col sm={3} className="ml15" style={{ width: '20%' }}>
                            <label className="control-label-left">{INBOX_FIRST_LINE_PREVIEW}</label>
                        </Col>
                        <Col
          sm={6}
          style={{ width: '544px' }}
          className={`${isClickOff ? 'pe-none click-off' : ''} position-relative`}>
          
                            <RSEmojiPickerInput
            inputName={inboxLinePreviewName}
            placeholder={INBOX_FIRST_LINE_MESSAGE}
            maxLength={MAX_LENGTH150}
            required={false}
            iconTopspace={false}
            isEmoji={false} />
          
                            <small className="bottom5 position-absolute right15">{RES_75_CHARACTERS}</small>
                        </Col>
                    </Row>
                </div>
                <div
      className={`d-flex ${
      viewInBrowser ? 'justify-content-end align-items-center' : 'justify-content-end'} my15`
      }>
      
                    {viewInBrowser &&
      <small className="text-left smaller mr64">
                            {EMAIL_NOT_DISPLAYING}{' '}
                            <a href="{{#VIB}}" onClick={(e) => e.preventDefault()}>
                                {VIEW_IN_BROWSER}
                            </a>
                        </small>
      }
                    <ul className={`rs-list-inline rli-space-10 ${isClickOff ? 'pe-none click-off' : ''}`}>
                        <li>
                            <RSCheckbox
            control={control}
            name={viewInbrowserName}
            labelName={ADD_VIEW_IN_BROWSER} />
          
                        </li>
                        <li className="position-relative top2 mr0">
                            <RSTooltip text={'Spam score'} className="lh0">
                                <i
              className={`${spam_assassin_medium}   icon-md color-primary-blue cp`}
              onClick={() => {
                UpdateState(setState, 'SpamScoreModal', true);
              }} />
            
                            </RSTooltip>
                        </li>
                    </ul>
                </div>
            </Fragment> :
  null;

  const formatAmpValidations = (text = '') => {
    if (!text) return null;
    return text.
    split(/(?=line\s\d+)/g).
    map((item) => item.trim()).
    filter(Boolean);
  };
  return (
    <>
            <div
        className={`rs-import-block ${
        isInPageBannerDeliveryType ?
        'import-url-blank rs-import-block--inpage-banner' :
        importType === 'url' ?
        'import-url-blank' :
        'import-url-selected'}`
        }>
        
                <div className="form-group mb0 ">
                    {!isInPageBannerDeliveryType &&
          <div className="rs-import-refresh">
                            {showImportResetIcon &&
            <RSTooltip text="Reset" position="top">
                                    <i
                id="rs_data_refresh"
                className={`${restart_medium} icon-md color-primary-blue cp ${
                edmContent?.length > 0 ||
                zipFileNameText?.[0]?.name?.split('.')?.pop() === 'zip' ||
                getValues(importURLName)?.length ?
                '' :
                'click-off'} ${
                isClickOff ? 'pe-none click-off' : ''}`}
                onClick={handleImportResetClick} />
              
                                </RSTooltip>
            }
                        </div>
                    }
                    {!isInPageBannerDeliveryType ? (
                    <Row
                        className={`rs-import-url-wrapper my20 ml0 mr0 ${importType === 'url' ? 'active' : ''
                            } ${edmContent?.length > 0 ? 'pe-none click-off' : ''} ${
                                zipUploadLoader.isLoading ? 'click-off' : ''
                            }`}
                    >
                        {/* getValues('contentType') === 'Z' */}
                        <Col
              sm={2}
              className="rsiuw-1 text-center"
              onClick={() => setValue(importTypeName, 'url')}>
              
                            <div className="rsiuw-holder position-relative top4">
                                <i className={`${import_link_large} icon-lg color-primary-blue `}></i>
                                <label className="control-label-left cp">{importUrlLabelText}</label>
                            </div>
                        </Col>
                        {importType === 'url' &&
            <Fragment>
                                <Col sm={6} className="rsiuw-2 pl50 position-relative">
                                    <RSInput
                  control={control}
                  name={importURLName}
                  id="rs_Import_CommunicationURL"
                  placeholder={importUrlPlaceholder}
                  rules={
                  edmContent?.length === 0 ?
                  {
                    required: 'Enter a URL',
                    pattern: {
                      value: URLPATTERN,
                      message: 'Enter valid URL'
                    }
                  } :
                  {}
                  }
                  className={`${edmContent?.length > 0 ? 'pe-none' : ''}`}
                  handleOnBlur={handleImportUrlBlur}
                  // required={isNotification ? importType === 'url' : false}
                />
                                    {isInPageBannerDeliveryType && <small className='fs14 position-absolute'>{importSupportedFormatText}</small>}
                                </Col>
                                <Col sm={2} className="pl0 rsiuw-3 mt-12">
                                    <RSPrimaryButton
                  className={`pr20 ${!importName || checkImportUrlError ? 'click-off' : ''}`
                  }
                  id="rs_Import_Go"
                  onClick={async () => {
                    if (!checkImportUrlError) {
                      await processImportUrl(importName);
                    }
                  }}>
                  
                                        GO
                                    </RSPrimaryButton>
                                </Col>
                            </Fragment>
            }
                        <Col
              sm={importType !== 'url' ? 10 : 2}
              className="pr0 pl0 rsiuw-4"
              onClick={() => setValue(importTypeName, 'import')}>
              
                            <div className="rs-import-with-icon or-sep">
                                <div className="import-zip-file-tab text-center position-relative top4">
                                    <div className="rsiwi-icon d-grid pointer-event-none">
                                        <i className={`${zip_large} icon-lg color-primary-blue`}></i>
                                    </div>
                                    <label className="rsiwi-label control-label-left">{importFileLabelText}</label>
                                    {/* {importType === 'import' && ( */}
                                    <Fragment>
                                        <input
                      onClick={() => {
                        uploadAttemptCount.current += 1;
                      }}
                      {...register(zipFileName, {
                        // required: 'Please select the zip file',
                        onChange: async (e) => {
                          const file = e.target.files[0];
                          setAmpValidations('');
                          try {
                            await handleImportFileUpload(file);
                          } catch (err) {

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
                          const extension = name?.split('.')?.pop()?.toLowerCase();
                          if (name?.length !== 0 && !isAllowedImportExtension(extension)) {
                            return getImportValidationMessage();
                          } else if (edmFileWeight > MAX_IMPORT_FILE_SIZE) {
                            return 'File size too large';
                          } else if (!edmContent && uploadAttemptCount.current > 1)
                          return isInPageBannerDeliveryType ? 'Select media file' : 'Select zip file';else
                          {
                            if (edmFileWeight > MAX_IMPORT_FILE_SIZE)
                            return 'File size too large';
                            return true;
                          }
                        }
                        // required: isNotification ? importType === 'import' : false,
                      })}
                      type="file"
                      accept={importFileAccept}
                      className={`browse-hidden rsiwi-input ${edmContent?.length > 0 ? 'pe-none' : ''}`}
                      id="rs_Import_zipfile" />
                    
                                    </Fragment>
                                    {/* )} */}
                                </div>
                                {importType !== 'url' ? (
                                    <div className="import-zip-message position-relative">
                                        {zipUploadLoader.isLoading && (
                                            <span
                                                className="d-inline-flex align-items-center justify-content-center position-absolute"
                                                style={{ right: 20, top: 27 }}
                                                id="rs_ImportMobile_zip_upload_loader"
                                            >
                                                <span className="segment_loader"></span>
                                            </span>
                                        )}
                                        {/* file name */}
                                        {importType !== 'url' ? (
                                            <div className={zipUploadLoader.isLoading ? 'pr25' : ''}>
                                                {typeof zipFileNameText === 'string'
                                                    ? zipFileNameText
                                                    : '' || ''}
                                            </div>
                                        ) : null}
                                        {/* validate message */}
                                        {importType === 'import' &&
                  <Fragment>
                                                {!!zipFileErrorMessage &&
                    <div className="color-primary-red">
                                                        {zipFileErrorMessage}
                                                    </div>
                    }
                                            </Fragment>
                  }
                                    </div>) :
                null}
                            </div>
                        </Col>
                    </Row>) :

          <Fragment>
                            <div className="form-group mt41">
                                <Row>
                                    <Col sm={7} className="pr50 mobile_Import_form_group">
                                        <div className="d-flex align-items-start rs-import-inpage-bar-with-reset mb41">
                                            <div className="flex-grow-1 rs-import-inpage-bar-flex">
                                                <Row
                                                    className={`rs-import-url-wrapper mx0 ${
                                                        edmContent?.length > 0 ? 'pe-none click-off' : ''
                                                    } ${zipUploadLoader.isLoading ? 'click-off' : ''}`}
                                                >
                                                    <Col
                          sm={6}
                          className="pr0 pl0 rsiuw-4"
                          onClick={() => {
                            clearImportValidationErrors();
                            setInPageImageUploadModalOpen(true);
                          }}>
                          
                                                        <div className="rs-import-with-icon border-0">
                                                            <div className="import-zip-file-tab text-center">
                                                                <div className="rsiwi-icon d-grid pointer-event-none">
                                                                    <i className={`${builder_upload_large} icon-lg color-primary-blue`} />
                                                                </div>
                                                                <label className="control-label-left">
                                                                    Upload media
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col
                          sm={6}
                          className="pr0 pl0 rsiuw-4"
                          onClick={() => {
                            setValue(importTypeName, 'import');
                            setValue(edmContentName, '');
                          }}>
                          
                                                        <div className="rs-import-with-icon or-sep m0">
                                                            <div className="import-zip-file-tab text-center">
                                                                <div className="rsiwi-icon d-grid pointer-event-none">
                                                                    <i className={`${zip_large} icon-lg color-primary-blue`} />
                                                                </div>
                                                                <label className="control-label-left">Import</label>
                                                                <input
                                onClick={() => {
                                  uploadAttemptCount.current += 1;
                                }}
                                {...register(zipFileName, {
                                  onChange: async (e) => {
                                    const file = e.target.files[0];
                                    setAmpValidations('');
                                    try {
                                      await handleImportFileUpload(file);
                                    } catch (err) {

                                    }
                                  },
                                  validate: async (value) => {
                                    const edmContentVal = await getValues(
                                      edmContentName
                                    );
                                    const name = _get(value?.[0], 'name', '');
                                    const edmFileWeight = _get(
                                      value?.[0],
                                      'size',
                                      ''
                                    );
                                    const extension = name?.
                                    split('.')?.
                                    pop()?.
                                    toLowerCase();
                                    if (name?.length !== 0) {
                                      if (
                                      !isAllowedImportExtension(
                                        extension
                                      ))
                                      {
                                        return getImportValidationMessage();
                                      }
                                    }
                                    if (edmFileWeight > MAX_IMPORT_FILE_SIZE) {
                                      return 'File size too large';
                                    } else if (
                                    !edmContentVal &&
                                    uploadAttemptCount.current > 1)

                                    return 'Select media file';
                                    return true;
                                  }
                                })}
                                type="file"
                                accept={importFileAccept}
                                className={`browse-hidden rsiwi-input ${
                                edmContent?.length > 0 ? 'pe-none' : ''}`
                                }
                                id="rs_Import_zipfile" />
                              
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                {importType !== 'url' ? (
                                                    <div className="import-zip-message rs-import-inpage-zip-message position-relative">
                                                        {zipUploadLoader.isLoading && (
                                                            <span
                                                                className="d-inline-flex align-items-center justify-content-center position-absolute"
                                                                style={{ right: 20, top: 27 }}
                                                                id="rs_ImportMobile_inpage_zip_upload_loader"
                                                            >
                                                                <span className="segment_loader"></span>
                                                            </span>
                                                        )}
                                                        <div className={zipUploadLoader.isLoading ? 'pr25' : ''}>
                                                            {typeof zipFileNameText === 'string'
                                                                ? zipFileNameText
                                                                : '' || ''}
                                                        </div>
                                                        {importType === 'import' &&
                        <Fragment>
                                                                {!!zipFileErrorMessage &&
                          <div className="color-primary-red">
                                                                        {zipFileErrorMessage}
                                                                    </div>
                          }
                                                            </Fragment>
                        }
                                                    </div>) :
                      null}
                                            </div>
                                            {showImportResetIcon &&
                    <div className="rs-import-refresh rs-import-refresh--inpage">
                                                    <RSTooltip text="Reset" position="top">
                                                        <i
                          id="rs_data_refresh"
                          className={`${restart_medium} icon-md color-primary-blue cp ${
                          edmContent?.length > 0 ||
                          zipFileNameText?.[0]?.name?.split('.')?.pop() ===
                          'zip' ||
                          getValues(importURLName)?.length ?
                          '' :
                          'click-off'} ${
                          isClickOff ? 'pe-none click-off' : ''}`}
                          onClick={handleImportResetClick} />
                        
                                                    </RSTooltip>
                                                </div>
                    }
                                        </div>
                                        {browserTextExtras}
                                        <MobilePreviewConfig
                    fieldName={fieldName}
                    isSplit={isSplit}
                    index={index}
                    variant="import" />
                  
                                    </Col>
                                    <Col sm={5}>
                                        <div className="position-sticky mobile_Import_scroll rs-mobile-frame-wrapper-new">
                                            <div className="mobile-import-image mt94 css-scrollbar mx15">
                                                {edmContent?.length === 0 &&
                      <small className="no-preview text-center py120 d-block">
                                                        Preview not available
                                                    </small>
                      }
                                                <div id="template" ref={uploadRef} className="p10" />
                                                {interactivity && edmContent?.length ?
                      <InteractivityButtonsPreview
                        buttonText={buttonText}
                        type="andriod"
                        className="mt10" /> :

                      null}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            {isNotification &&
            <ImageUpload
              hideDefaultTrigger
              openImageUploadModal={inPageImageUploadModalOpen}
              onImageUploadModalRequestClose={() =>
              setInPageImageUploadModalOpen(false)
              }
              deferImageApplyUntilUpload
              onApplyImageUrlFromModal={processImportUrl}
              contentType="img/video"
              isSplit={isSplit}
              fieldName={fieldName}
              isbase64
              channelType="mpush"
              handleImageData={handleImageUploadFromModal}
              isNotificationUpload
              isCustomFormat
              isAlertPush={deliveryType?.id === 1}
              size={MAX_IMPORT_FILE_SIZE}
              isDynamicZone={isInPageBannerDeliveryType}
              acceptFormat={{
                accept: FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_VIDEO,
                acceptFormatLabel: FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_VIDEO
              }} />

            }
                        </Fragment>
          }
                </div>
                {!isInPageBannerDeliveryType && browserTextExtras}
                {!!ampValidations &&
        <div className="border p20 color-primary-red">
                        {formatAmpValidations(ampValidations).map((error, index) =>
          <div key={index} className="mb10">
                                {error}
                            </div>
          )}
                    </div>
        }
                {!isInPageBannerDeliveryType &&
        <div className="mt30 import_fileupload_wrapper">
                        <Row>
                            <Col sm={7} className="mobile_Import_form_group">
                                <MobilePreviewConfig
                fieldName={fieldName}
                isSplit={isSplit}
                index={index}
                variant="import" />
              
                            </Col>
                            <Col sm={5}>
                                <>
                                    <div className="position-sticky mobile_Import_scroll rs-mobile-frame-wrapper-new">
                                        <div className="mobile-import-image mt94 css-scrollbar mx15">
                                            {edmContent?.length === 0 &&
                    <small className="no-preview text-center py120 d-block">
                                                    Preview not available
                                                </small>
                    }
                                            <div id="template" ref={uploadRef} className="p10" />
                                            {interactivity && edmContent?.length ?
                    <InteractivityButtonsPreview
                      buttonText={buttonText}
                      type="andriod"
                      className="mt10" /> :

                    null}
                                        </div>
                                    </div>
                                </>
                            </Col>
                        </Row>
                    </div>
        }

                {!!bannerSizeWarning &&
        <RSAlertWarning
          show={true}
          message={bannerSizeWarning}
          showClose={false}
          handleClose={() => setBannerSizeWarning('')} />

        }
                {state?.SpamScoreModal && <SpamScoreModal {...spamScoreModalProps} />}
            </div>
        </>);

};

export default ImportMobile;