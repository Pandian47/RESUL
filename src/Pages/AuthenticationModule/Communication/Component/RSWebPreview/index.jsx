import { FirefoxLogo, GoogleChromeLogo, androidLogo, iosLogo, userImg } from 'Assets/Images';
import { truncateTitle } from 'Utils/modules/displayCore';
import { arrow_down_chevron_mini, arrow_up_chevron_mini, close_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import RSTooltip from 'Components/RSTooltip';
import { Carousel } from 'react-bootstrap';

import useQueryParams from 'Hooks/useQueryParams';
import parse from 'html-react-parser';
import InteractivityButtonsPreview from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/MobileNotification/Component/Create/Component/Preview/InteractivityButtonsPreview';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx';
import { PREVIEW_SOURCE } from 'Components/Previews';
import { useSelector } from 'react-redux';

const WEB_HTML_IFRAME_SCALE = 0.3;

const webHtmlPreviewCss = `
        <style>
            html, body { margin: 0 !important; padding: 0 !important; box-sizing: border-box; overflow: hidden !important; }
            table.main-column.social-table td { font-size: 0 !important; }
            table.main-column.social-table td table.pc-w620-width-auto {
                display: inline-block !important;
                width: auto !important;
                vertical-align: middle !important;
            }
            a, button, input, textarea, select, img {
                pointer-events: none !important;
                cursor: default !important;
            }
            h1, h2, h3, h4, h5, h6, p {
            word-wrap:break-word !important;
            }
            p {
  font-size: 2.0625rem !important;
            line-height: 1.25 !important;
            margin : 0 !important;
            padding:0  !important;
            }
         h1 {
  font-size: 3rem !important;
}

h2 {
  font-size: 2.4375rem !important;
}

h3 {
  font-size: 2.3125rem !important;
}

h4 {
  font-size: 2.1875rem !important;
}

h5 {
  font-size: 2.0625rem !important;
}

h6 {
  font-size: 1.9375rem !important;
}

        </style>
    `;

const injectWebHtmlPreviewCss = (html) => {
    if (!html) return '';
    if (html.includes('</head>')) return html.replace('</head>', `${webHtmlPreviewCss}</head>`);
    return `${webHtmlPreviewCss}${html}`;
};

const getBrowserTitleText = (type) => {
    switch (type) {
        case 'chrome':
            return { name: 'Google chrome', logo: GoogleChromeLogo };
        case 'firefox':
            return { name: 'Firefox', logo: FirefoxLogo };
        case 'andriod':
            return { name: 'Android', logo: androidLogo };
        case 'ios':
            return { name: 'iOS', logo: iosLogo };
        default:
            return { name: 'Google chrome', logo: FirefoxLogo };
    }
};

const parseButtonParams = (paramStr) => {
    if (!paramStr) return [];
    const trimmed = typeof paramStr === 'string' ? paramStr.trim() : '';
    if (trimmed.startsWith('[')) {
        try {
            const arr = JSON.parse(trimmed);
            return Array.isArray(arr) ? arr.map((o) => o.key || o.text || '') : [];
        } catch {
            return [];
        }
    }
    return [trimmed];
};

const getLabelById = (id) => {
    const staticLabels = { 1: 'Maybe later', 2: 'Dismiss', 4: 'Unsubscribe' };
    if (staticLabels[id]) return staticLabels[id];
    if (id >= 5 && id <= 9) return `Smart link ${id - 4}`;
    if (id === 10) return 'WebURL';
    return '';
};

const normalizeImageSrc = (val) => {
    if (!val || typeof val !== 'string') return '';
    const t = val.trim();
    if (t.startsWith('data:')) return t;
    if (t.startsWith('http://') || t.startsWith('https://')) return t;
    if (t.length > 100 && !t.startsWith('{') && !t.startsWith('[') && !t.startsWith('<')) return `data:image/jpeg;base64,${t}`;
    return t;
};

const SingleNotificationCard = ({
    notification = {},
    previewImage,
    staticPos = false,
    hasMultipleNotifications = false,
    isAnalytics = false,
}) => {
    const location = useQueryParams('/communication') || {};
    const title = notification?.title || '';
    const body = notification?.content || '';
    const rawImage = notification?.webMediaURL || notification?.pushImagePath || previewImage || '';
    const imageSrc = normalizeImageSrc(rawImage);
    let htmlContent = '';
    if (notification?.contentType === 'Z' && notification?.content) htmlContent = notification?.content;
    const iframeRef = useRef(null);
    const [iframeHeight, setIframeHeight] = useState(null);
    const observerRef = useRef(null);
    const resizeObserverRef = useRef(null);

    const isHtml = body && (body.includes('<!DOCTYPE') || body.includes('<html'));
    const displayBody = htmlContent || (isHtml ? body : null);

    useEffect(() => {
        setIframeHeight(null);
        if (!displayBody) return;
        const iframe = iframeRef.current;
        if (!iframe) return;

        const measureHeight = () => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc?.body) return;
                const style = doc.createElement('style');
                style.textContent = 'html, body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }';
                if (!doc.head.querySelector('[data-height-reset]')) {
                    style.setAttribute('data-height-reset', '');
                    doc.head.appendChild(style);
                }
                const height = doc.body.offsetHeight;
                if (height > 0) setIframeHeight(height);
            } catch {
                // cross-origin — ignore
            }
        };

        const onLoad = () => {
            const retryDelays = [50, 200, 500, 1000];
            retryDelays.forEach((ms) => setTimeout(measureHeight, ms));

            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc?.body) return;

                observerRef.current?.disconnect();
                observerRef.current = new MutationObserver(measureHeight);
                observerRef.current.observe(doc.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });

                resizeObserverRef.current?.disconnect();
                resizeObserverRef.current = new ResizeObserver(measureHeight);
                resizeObserverRef.current.observe(doc.body);

                doc.querySelectorAll('img').forEach((img) => {
                    if (!img.complete) img.addEventListener('load', measureHeight);
                });
            } catch {
                // cross-origin — ignore
            }
        };

        iframe.addEventListener('load', onLoad);

        if (iframe.contentDocument?.readyState === 'complete') {
            onLoad();
        }

        return () => {
            iframe.removeEventListener('load', onLoad);
            observerRef.current?.disconnect();
            resizeObserverRef.current?.disconnect();
        };
    }, [displayBody]);

    const buttons = [];
    if (notification?.isInteractivebuttonEnabled) {
        if (notification?.interactivebuttonTypes === 'Button') {
            buttons.push(...parseButtonParams(notification?.interactiveCustParameter));
            const id1 = Number(notification?.interactivebuttonValue);
            if (!buttons.length && id1) { const l = getLabelById(id1); if (l) buttons.push(l); }
        }
        if (notification?.interactivebuttonTypes2 === 'Button') {
            buttons.push(...parseButtonParams(notification?.interactiveCustParameter2));
            const id2 = Number(notification?.interactivebuttonValue2);
            if (!buttons.length && id2) { const l = getLabelById(id2); if (l) buttons.push(l); }
        }
    }


    const contentStyle = staticPos ? { position: 'relative', bottom: 'auto', right: 'auto', margin: '0 auto' } : {};
    const maxLength = isAnalytics ? 50 : 20;
    const rawHeight = iframeHeight;
    const visualHeight = rawHeight ? Math.round(rawHeight * WEB_HTML_IFRAME_SCALE) : null;

    return (
        <div
            className={`rswch-content css-scrollbar ${location?.campaignType === 'M' && !hasMultipleNotifications ? '' : ''
                } p7 ${hasMultipleNotifications ? 'left0' : ''}`}
            style={{ ...contentStyle, backgroundColor: notification?.contentBgColour || undefined }}
        >
            {!displayBody && <div className="p0" style={{ backgroundColor: notification?.contentBgColour || undefined }}>
                <div className="rsbcs-text">
                    {title && (
                        <h4 className="rsb-title fs15 font-bold mb0 text-left" style={{ color: notification?.titleColor || undefined }}>
                            <TruncatedCell value={title} noTable={true} />
                        </h4>
                    )}
                    {body ? (
                        <p
                            className={`rsb-content fs11 whitespace-pre-wrap text-left ${notification?.contentTextColour ? '' : 'color-primary-black'}`}
                            style={{ color: notification?.contentTextColour || undefined }}
                        >
                            {parse(body)}
                        </p>) : null}
                    {imageSrc && (
                        <div className="mb5">
                            <img src={imageSrc} alt="preview" className="rswb-img" />
                        </div>
                    )}
                    {!!buttons.length && (
                        <InteractivityButtonsPreview
                            buttonText={buttons.map((label, idx) => ({
                                text: { value: label },
                                customText: label,
                                backgroundColor: idx === 0 ? notification?.caBgColour : notification?.cBgColour2,
                                fontColor: idx === 0 ? notification?.caTextColour : notification?.caTextColour2,
                            }))}
                            type="chrome"
                            className="my5"
                        />
                    )}
                </div>
            </div>}
            {
                !!displayBody && <div>
                    <div className="rsb-content fs11 color-primary-black">
                        <div className="html-content-mini-preview" style={{ display: 'block', width: '100%' }}>
                            <div
                                className="preview-iframe-clip"
                                style={visualHeight ? { height: `${visualHeight + 20}px` } : {}}
                            >
                                <iframe
                                    ref={iframeRef}
                                    srcDoc={injectWebHtmlPreviewCss(displayBody)}
                                    title="Web HTML Preview"
                                    className={`mobile-html-iframe${!iframeHeight && !isAnalytics ? ' preview-iframe-hidden' : ''}`}
                                    sandbox="allow-scripts allow-same-origin"
                                    style={{
                                        width: `${(100 / WEB_HTML_IFRAME_SCALE).toFixed(2)}%`,
                                        height: iframeHeight ? `${iframeHeight}px` : '0px',
                                        transform: `scale(${WEB_HTML_IFRAME_SCALE})`,
                                        transformOrigin: 'top left',
                                        border: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    {!!buttons.length && (
                        <InteractivityButtonsPreview
                            buttonText={buttons.map((label, idx) => ({
                                text: { value: label },
                                customText: label,
                                backgroundColor: idx === 0 ? notification?.caBgColour : notification?.cBgColour2,
                                fontColor: idx === 0 ? notification?.caTextColour : notification?.caTextColour2,
                            }))}
                            type="chrome"
                            className="mt5"
                        />
                    )}
                </div>
            }
        </div>
    );
};

function RSWebPreview(props) {
    const {
        variant,
        notification = {},
        previewImage,
        notifications = [],
        isAnalytics,
        templateRef,
        templateId = 'template',
        edmContent = [],
        interactivity,
        buttonText,
        emptyMessage = 'Preview not available',
        className = '',
        type = 'chrome',
        previewVideo,
        title,
        subtitle,
        editorText,
        customization,
        remainingTime,
        timerBgColor,
        timerTextColor,
        previewActive = '',
        channelType,
        mainClassName = '',
        previewSource
    } = props;

    const isAuthoring = variant === 'authoring';
    const effectivePreviewSource = previewSource ?? (isAuthoring ? PREVIEW_SOURCE.AUTHORING : PREVIEW_SOURCE.COMM_LISTING);
    const isAuthoringImport = isAuthoring && templateRef != null;
    const isAuthoringRichText = isAuthoring && templateRef == null;
    const isMulti = Array.isArray(notifications) && notifications.length > 1;
    const singleNotification = (Array.isArray(notifications) ? notifications[0] : {}) ?? notification;

    const parentClassName = `postion-relative rs-web-frame ${mainClassName} rs-web-preview--${effectivePreviewSource || 'authoring'}`.trim();


    const { logo, name } = isAuthoringRichText ? getBrowserTitleText(type) : {};
    const titleText = isAuthoringRichText ? _get(title, 'text', null) : null;
    const titleColor = isAuthoringRichText ? _get(title, 'fontColor', null) : null;
    const editorBackground = isAuthoringRichText ? _get(customization, 'background', null) : null;
    const editorColor = isAuthoringRichText ? _get(customization, 'color', null) : null;
    const [extendView, setExtendView] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { clientId } = useSelector(({ globalstate }) => globalstate);

    return (
        <div className={parentClassName}>
            {/* For authoring page Import only */}
            {isAuthoringImport && (
                <div className={`import-edm-block ${edmContent?.length ? 'css-scrollbar' : ''}`}>
                    <div className="p10">
                        {edmContent?.length && _get(title, 'text', null) ? <span className='title'>{_get(title, 'text', null)}</span> : null}
                        {!edmContent?.length ? (
                            <small className="no-preview text-center py105 d-block">{emptyMessage}</small>
                        ) : null}
                        <div id={templateId} ref={templateRef} />

                        {interactivity && edmContent?.length ? (
                            <InteractivityButtonsPreview buttonText={buttonText} type="chrome" className="mt10" />
                        ) : null}
                    </div>
                </div>
            )}
            {/* For authoring page Rich text only */}

            {isAuthoringRichText && (
                <>
                    {!!editorText || !!subtitle || !!titleText || interactivity ?
                        <>
                            <div className={`rs-web-browser-preview emojifont ${previewActive ? 'preview-active' : 'preview-inactive'}`}>
                                {/* <div className="rswch-content css-scrollbar top0 position-static Web-notification-block"> */}
                                <div className={`rswch-content  top0 position-static   ${!extendView ? 'extendView' : 'Web-notification-block'}`}>
                                    {effectivePreviewSource === PREVIEW_SOURCE.AUTHORING && (
                                        <div className="top-section">
                                            {/* <div className="rs-browser-name top-2 whitespace-no-wrap">{name}</div> */}
                                            <div className="d-flex align-items-center">
                                                <div className="rs-browser-close">
                                                    <i
                                                        className={`${!extendView ? arrow_up_chevron_mini : arrow_down_chevron_mini
                                                            } icon-xs fs12 cursor-pointer`}
                                                        onClick={() => setExtendView(!extendView)}
                                                    />
                                                </div>
                                            </div>
                                            {/* <div className="rs-browser-close">
                                        <i className={`${close_mini} icon-mini`} id="rs_Preview_close" />
                                    </div> */}
                                        </div>
                                    )}
                                    <div className="rs-browser-content-section p0" style={{ backgroundColor: editorBackground }}>
                                        <div className={"d-flex gap-3 w-100"}>
                                            <div className="logo">
                                                {clientId?.logoPath && !imageError ? (
                                                    <img
                                                        src={clientId?.logoPath.startsWith('data:') ? clientId.logoPath : `data:image/jpeg;base64,${clientId?.logoPath}`}
                                                        alt="preview"
                                                        className="mobileProfileImg"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            setImageError(true)
                                                        }}
                                                        width={35}
                                                        height={35}
                                                    />
                                                ) : (
                                                 <img src={userImg} alt="" width={24} height={24} className="border-r100" />
                                                )}
                                                {/* <img src={logo} alt="Logo" className="rs-browser-logo"  width="25"/> */}
                                            </div>
                                            <div className="rsbcs-text text-break">
                                                {titleText && (
                                                    <h4 className="rsb-title fs15 font-bold m0" style={{ color: titleColor ?? 'inherit' }}>
                                                        {/* {titleText?.length > 30 ? (
                                                    <RSTooltip text={titleText} innerContent={false}>{truncateTitle(titleText, 30)}</RSTooltip>
                                                ) : titleText} */}
                                                        <TruncatedCell value={titleText} noTable={true} />
                                                    </h4>

                                                )}
                                                {subtitle && (
                                                    <p className={`rsb-content-subtitle fs11 ${type === 'andriod' ? 'subtitle_android' : ''}`}>{subtitle}</p>
                                                )}
                                                {editorText && (
                                                    <div className="rsb-content fs11 whitespace-pre-wrap lh-sm" style={{ color: editorColor }}>
                                                        {parse(editorText)}
                                                    </div>
                                                )}
                                                {previewImage && !previewVideo && <img src={previewImage} alt="preview" />}
                                                {previewVideo && (
                                                    <video height="150px" width="auto" controls autoPlay>
                                                        <source src={previewVideo} />
                                                    </video>
                                                )}
                                                {remainingTime && (
                                                    <p style={{ background: timerBgColor, color: timerTextColor, float: 'right' }}>{remainingTime}</p>
                                                )}

                                                {interactivity && (
                                                    <InteractivityButtonsPreview
                                                        buttonText={Array.isArray(buttonText) ? buttonText : []}
                                                        type={type}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={channelType === 'web' ? 'rs-editor-bottom-message web' : 'rs-editor-bottom-message web mobile_varies'}>
                                <div className="editor-message-right">
                                    <small><span className="emr-length mandatory">{channelType === 'web' ? 'Varies by browser' : 'Varies by device'}</span></small>
                                </div>
                            </div>
                        </> : <div className="align-items-center bottom0 d-flex justify-content-center left0 position-absolute right0 top0 color-secondary-black">Preview not available</div>}
                </>
            )}
            {/* For other preview like Analytics / Communication , MDC Preview Carousel only */}

            {!isAuthoring && isMulti && (
                <Carousel interval={null} indicators={false} controls={notifications.length > 1} className="rsweblistpreview h-100 w-100">
                    {notifications.map((notif, idx) => (
                        <Carousel.Item key={idx}>
                            <SingleNotificationCard
                                notification={notif}
                                previewImage={previewImage}
                                staticPos
                                hasMultipleNotifications={notifications.length > 1}
                                isAnalytics={isAnalytics}
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}
            {/* For other preview like Analytics / Communication , MDC Preview without carousel only */}

            {!isAuthoring && !isMulti && (
                <SingleNotificationCard
                    notification={singleNotification}
                    previewImage={previewImage}
                    isAnalytics={isAnalytics}
                />
            )}
        </div>
    );
}

export default RSWebPreview;