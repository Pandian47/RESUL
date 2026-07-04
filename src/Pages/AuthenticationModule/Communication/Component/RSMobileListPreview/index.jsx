import { placeholderImage } from 'Assets/Images';
import { convertToUserTimezone, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { arrow_down_chevron_mini, arrow_up_chevron_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { get as _get } from 'Utils/modules/lodashReplacements';
import parse from 'html-react-parser';

import { getSessionId } from 'Reducers/globalState/selector';
import { getMobileApps } from 'Reducers/communication/createCommunication/smartlink/request';
import RSTooltip from 'Components/RSTooltip';
import InteractivityButtonsPreview from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/MobileNotification/Component/Create/Component/Preview/InteractivityButtonsPreview';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx';
import { PREVIEW_SOURCE } from 'Components/Previews';

const getPreviewBackgroundColor = (color) => {
    if (typeof color === 'string' && color.toLowerCase() === 'transparent') {
        return '#ffffff';
    }
    return color;
};

const MOBILE_HTML_IFRAME_SCALE = 0.3;

const mobileHtmlPreviewCss = `
        <style>
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
                overflow: hidden !important;
                width: 100% !important;
                min-width: 100% !important;
            }
            body > *:first-child {
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
            }
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

const injectMobileHtmlPreviewCss = (html) => {
    if (!html) return '';
    if (html.includes('</head>')) return html.replace('</head>', `${mobileHtmlPreviewCss}</head>`);
    return `${mobileHtmlPreviewCss}${html}`;
};

// Helper functions to derive button labels (copied from RSWebPreview)
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

let globalMobileAppsFetched = false;

const getLabelById = (id) => {
    const staticLabels = {
        1: 'Maybe later',
        2: 'Dismiss',
        4: 'Unsubscribe',
    };
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

const MobilePushCard = ({ slide = {}, previewSource, pushCardMainClassName }) => {
    const dispatch = useDispatch();
    const { parentClientId, departmentId, userId, clientId, isAgency, departmentName } = useSelector((state) =>
        getSessionId(state),
    );
    const { mobileApps: globalMobileApps } = useSelector(({ smartLinkReducer }) => smartLinkReducer);
    const [localMobileApps, setLocalMobileApps] = useState([]);

    const title = slide.title || '';
    const subTitle = slide.subTitle || slide.subtitle || '';
    const body = slide.content || slide.textContent || '';
    const rawImage = slide.mobMediaURL || slide.pushImagePath || slide.webMediaURL || slide.imagePath || slide.imageUrl || slide.mediaContent || slide.contentThumbnail || '';
    const imageSrc = normalizeImageSrc(rawImage);
    const appId = slide?.mobileAppId;

    const [extendView, setExtendView] = useState(false);

    const getAppNameById = (appId) => {
        if (!appId) return '';
        const apps = globalMobileApps?.length > 0 ? globalMobileApps : localMobileApps;
        if (!apps?.length) return '';
        const app = apps.find((app) => app.appId === appId);
        return app ? app.appName : '';
    };

    useEffect(() => {
        const fetchMobileApps = async () => {
            if (globalMobileAppsFetched || globalMobileApps?.length > 0) {
                return;
            }

            globalMobileAppsFetched = true;
            const payload = {
                clientId: clientId,
                departmentId: departmentId || 0,
                userId,
                isAgency,
                departmentName,
            };

            const response = await dispatch(getMobileApps({ payload, loading: false }));
            if (response?.status && response?.data) {
                setLocalMobileApps(response?.data);
            }
        };

        fetchMobileApps();
    }, [dispatch, clientId, departmentId, userId, isAgency, departmentName, globalMobileApps?.length]);

    const appName = getAppNameById(appId);
    const dateObj = convertToUserTimezone(new Date(), { formatAsString: false });
    const timeString = getUserCurrentFormat(dateObj)?.formatTime;

    let htmlContent = '';
    if (slide.contentType === 'Z' && slide.content) {
        htmlContent = slide.content;
    }
    const buttons = [];
    if (slide?.isInteractivebuttonEnabled) {
        if (slide?.interactivebuttonTypes === 'Button') {
            buttons.push(...parseButtonParams(slide?.interactiveCustParameter));
            const id1 = Number(slide?.interactivebuttonValue);
            if (!buttons.length && id1) {
                const label = getLabelById(id1);
                if (label) buttons.push(label);
            }
        }
        if (slide?.interactivebuttonTypes2 === 'Button') {
            buttons.push(...parseButtonParams(slide?.interactiveCustParameter2));
            const id2 = Number(slide?.interactivebuttonValue2);
            if (!buttons.length && id2) {
                const label = getLabelById(id2);
                if (label) buttons.push(label);
            }
        }
    }
    const iframeRef = useRef(null);
    const [iframeHeight, setIframeHeight] = useState(null);
    const observerRef = useRef(null);
    const resizeObserverRef = useRef(null);

    const bodyIsHtml = body && (body.includes('<!DOCTYPE') || body.includes('<html'));
    const displayBodyForIframe = htmlContent || (bodyIsHtml ? body : null);

    useEffect(() => {
        setIframeHeight(null);
        if (!displayBodyForIframe) return;
        const iframe = iframeRef.current;
        if (!iframe) return;

        const measureHeight = () => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc?.body) return;
                const style = doc.createElement('style');
                style.textContent =
                    'html, body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; width: 100% !important; min-width: 100% !important; }';
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
    }, [displayBodyForIframe]);

    const rawHeight = iframeHeight;
    const visualHeight = rawHeight ? Math.round(rawHeight * MOBILE_HTML_IFRAME_SCALE) : null;

    const showTopSection = previewSource === PREVIEW_SOURCE.AUTHORING;

    return (
        <div className={`emojifont preview-inactive ${pushCardMainClassName}`}>
            <div className="rs-web-content-holder mx10">
                <div className={`rswch-content RS-listing-preview-mn border border-r7 p7 top0 ${showTopSection ? (!extendView ? 'extendView' : 'mobilePreview') : ''}`}>
                    {showTopSection && (
                        <div className="top-section justify-content-between align-items-center">
                            <div className="d-flex gap-2 align-items-center">
                                <small className="fs13 AppName">
                                    <TruncatedCell value={appName} noTable={true} />
                                </small>
                                <small className="fs12 ml5 whitespace-nowrap">{timeString}</small>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="rs-browser-close">
                                    <i
                                        className={`${!extendView ? arrow_up_chevron_mini : arrow_down_chevron_mini
                                            } icon-xs cursor-pointer`}
                                        onClick={() => setExtendView(!extendView)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div
                        className={`rs-browser-content-section d-flex whitespace-pre-wrap border-r0 ${htmlContent ? 'p0' : slide?.contentBgColour ? 'p5' : ''
                            }`}
                        style={{
                            backgroundColor: getPreviewBackgroundColor(slide?.contentBgColour),
                            color: slide?.contentTextColour,
                        }}
                    >
                        <div className="rsbcs-text">
                            {title && (
                                <p
                                    className={`rsb-title fs15 font-bold mb5 w-100 lh-sm ${slide?.titleColor ? '' : 'color-primary-black'
                                        }`}
                                    style={{
                                        color: slide?.titleColor,
                                    }}
                                >
                                    {/* {title.length > 20 ? (
                                        <RSTooltip text={title} className="d-inline-flex">
                                            {truncateTitle(title, 20)}
                                        </RSTooltip>
                                    ) : (
                                        title
                                    )} */}
                                    <TruncatedCell value={title} noTable={true} />
                                </p>
                            )}
                            {subTitle && (
                                <p className="rsb-content-subtitle subtitle_android color-primary-black mb5 text-break position-static w-100">
                                    {/* {subTitle.length > 12 ? (
                                        <RSTooltip
                                            text={subTitle}
                                            className="d-inline-flex"
                                            innerContent={false}
                                            tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                                        >
                                            {truncateTitle(subTitle, 12)}
                                        </RSTooltip>
                                    ) : (
                                        subTitle
                                    )} */}
                                    <TruncatedCell value={subTitle} noTable={true} />
                                </p>
                            )}

                            {displayBodyForIframe ? (
                                <div className="rsb-content rsb-content--mobile-html-iframe fs11 color-primary-black">
                                    <div className="html-content-mini-preview" style={{ display: 'block', width: '100%' }}>
                                        <div
                                            className="preview-iframe-clip"
                                            style={visualHeight ? { height: `${visualHeight + 20}px` } : {}}
                                        >
                                            <iframe
                                                ref={iframeRef}
                                                srcDoc={injectMobileHtmlPreviewCss(displayBodyForIframe)}
                                                title="Mobile HTML Preview"
                                                className={`mobile-html-iframe${!iframeHeight ? ' preview-iframe-hidden' : ''}`}
                                                sandbox="allow-scripts allow-same-origin"
                                                style={{
                                                    width: `${(100 / MOBILE_HTML_IFRAME_SCALE).toFixed(2)}%`,
                                                    height: iframeHeight ? `${iframeHeight}px` : '0px',
                                                    transform: `scale(${MOBILE_HTML_IFRAME_SCALE})`,
                                                    transformOrigin: 'top left',
                                                    border: 'none',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                body && (
                                    <div className="rsb-content fs11 text-break whitespace-pre-wrap color-primary-black mb5">
                                        {parse(body)}
                                    </div>
                                )
                            )}
                            {imageSrc && (
                                <div>
                                    <img src={imageSrc} alt="preview" />
                                </div>
                            )}
                            {(buttons?.filter((btn) => btn?.trim() !== '').length > 0) && (
                                <InteractivityButtonsPreview
                                    buttonText={buttons.map((label, idx) => ({
                                        text: { value: label },
                                        customText: label,
                                        backgroundColor: idx === 0 ? slide?.caBgColour : slide?.caBgColour2,
                                        fontColor: idx === 0 ? slide?.caTextColour : slide?.caTextColour2,
                                    }))}
                                    type="chrome"
                                    className="d-flex text-center"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function RSMobileListPreview(props) {
    const {
        variant,
        slides = [],
        errors: errorsProp = {},
        type = 'chrome',
        previewImage,
        previewVideo,
        title,
        subtitle,
        editorText,
        interactivity,
        buttonText,
        customization,
        remainingTime,
        timerBgColor,
        timerTextColor,
        previewActive = '',
        channelType,
        mobileApp,
        campaignType = '',
        mainClassName = '',
        previewSource,
        pushCardMainClassName = ''
    } = props;

    const [extendView, setExtendView] = useState(false);
    const isAuthoring = variant === 'authoring';
    const effectivePreviewSource = previewSource ?? (isAuthoring ? PREVIEW_SOURCE.AUTHORING : PREVIEW_SOURCE.COMM_LISTING);
    const isMulti = Array.isArray(slides) && slides.length > 1;

    if (!isAuthoring && (!Array.isArray(slides) || !slides.length)) return null;

    const parentClassName = [
        'rs-mobile-preview',
        isAuthoring && 'rs-mobile-preview-authoring',
        !isAuthoring && 'mobilepush_frame_wrapper mx-auto float-none',
        `rs-mobile-preview--${effectivePreviewSource || 'authoring'}`,
        mainClassName
    ].filter(Boolean).join(' ');

    const mobileAppName = isAuthoring ? _get(mobileApp, 'appName', null) : null;
    const titleText = isAuthoring ? _get(title, 'text', null) : null;
    const titleColor = isAuthoring ? _get(title, 'fontColor', null) : null;
    const editorBackground = isAuthoring ? _get(customization, 'background', null) : null;
    const dateObj = convertToUserTimezone(new Date(), { formatAsString: false });
    const timeString = getUserCurrentFormat(dateObj)?.formatTime;

    return (
        <div className={parentClassName}>
            {isAuthoring && (
                !!titleText || !!subtitle || editorText?.length>7 || interactivity ?
                    <Fragment>
                        <div className={`rs-web-browser-preview emojifont ${previewActive ? 'preview-active' : 'preview-inactive'} ${campaignType === 'M' ? 'mdc-preview' : ''}`}>
                            <div className="rs-web-content-holder mt105 mx10">
                                <div className={`rswch-content RS-listing-preview-mn border border-r7 p7 top0  ${!extendView ? 'extendView' : 'mobilePreview'}`}>
                                    <div className={`top-section justify-content-between align-items-center ${editorBackground?.length > 0 ? 'mb5' : ''}`}>
                                        {type === 'andriod' ? (
                                            <Fragment>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <small className="fs13 AppName">
                                                        {/* {mobileAppName?.length > 15 ? (
                                                        <RSTooltip text={mobileAppName} innerContent={false}>{truncateTitle(mobileAppName, 15)}</RSTooltip>
                                                    ) : mobileAppName} */}
                                                        <TruncatedCell value={mobileAppName} noTable={true} />
                                                    </small>
                                                    {subtitle && (
                                                        <small className="fs11 SUBtitle">
                                                            {/* {subtitle.length > 7 ? (
                                                            <RSTooltip text={subtitle} innerContent={false}>{truncateTitle(subtitle, 7)}</RSTooltip>
                                                        ) : subtitle} */}
                                                            <TruncatedCell value={subtitle} noTable={true} />
                                                        </small>
                                                    )}
                                                    <small className="fs12 ml5 whitespace-nowrap">{timeString}</small>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <div className="rs-browser-close">
                                                        <i className={`${!extendView ? arrow_up_chevron_mini : arrow_down_chevron_mini} icon-xs cursor-pointer`} onClick={() => setExtendView(!extendView)} />
                                                    </div>
                                                </div>
                                            </Fragment>
                                        ) : (
                                            <Fragment>
                                                <div className="d-flex align-items-center w-100">
                                                    <small className="fs13 ios-Appname">
                                                        {/* {mobileAppName?.length > 15 ? (
                                                        <RSTooltip text={mobileAppName} innerContent={false}>{truncateTitle(mobileAppName, 15)}</RSTooltip>
                                                    ) : mobileAppName} */}
                                                        <TruncatedCell value={mobileAppName} noTable={true} />
                                                    </small>
                                                    <div className="flex-grow-1" />
                                                    <small className="fs12 mr20 whitespace-nowrap">{timeString}</small>
                                                    <div className="rs-browser-close">
                                                        <i className={`${!extendView ? arrow_up_chevron_mini : arrow_down_chevron_mini} icon-xs cursor-pointer`} onClick={() => setExtendView(!extendView)} />
                                                    </div>
                                                </div>
                                            </Fragment>
                                        )}
                                    </div>
                                    <div className="rs-browser-content-section d-flex whitespace-pre-wrap border-r0" style={{ backgroundColor: getPreviewBackgroundColor(editorBackground) }}>
                                        <div className="rsbcs-text">
                                            <span className={`d-flex align-items-baseline ${titleText?.length > 0 ? 'justify-content-between' : 'flex-right'}`}>
                                                {titleText && (
                                                    <p className="rsb-title fs15 w-100 font-bold mt0 text-break whitespace-pre-wrap" style={{ color: titleColor ?? 'inherit' }}>
                                                        {/* {titleText?.length > 23 ? (
                                                        <RSTooltip text={titleText} innerContent={false}>{truncateTitle(titleText, 23)}</RSTooltip>
                                                    ) : titleText} */}
                                                        <TruncatedCell value={titleText} noTable={true} />
                                                    </p>
                                                )}
                                                {!extendView && remainingTime && (
                                                    <p style={{ background: timerBgColor, color: timerTextColor, float: 'right' }} className="my5">{remainingTime}</p>
                                                )}
                                            </span>
                                            {subtitle && type !== 'andriod' && (
                                                <p className={`rsb-content-subtitle fs11 ${editorBackground?.length > 0 ? '' : ''}`} style={{ position: 'unset' }}>
                                                    {/* {subtitle.length > 20 ? (
                                                    <RSTooltip text={subtitle} innerContent={false}>{truncateTitle(subtitle, 20)}</RSTooltip>
                                                ) : subtitle} */}
                                                    <TruncatedCell value={subtitle} noTable={true} />
                                                </p>
                                            )}
                                            {editorText && (
                                                <div className={`rsb-content text-break whitespace-pre-wrap fs11  ${editorBackground?.length > 0 ? '' : ''}`}>
                                                    {parse(editorText)}
                                                </div>
                                            )}
                                            {type !== 'firefox' && previewImage && !previewVideo && !errorsProp?.previewImage ? (
                                                <img src={previewImage} alt="preview" />
                                            ) : Object.entries(errorsProp || {}).length > 0 && errorsProp?.previewImage ? (
                                                <img src={placeholderImage} alt="placeholder" />
                                            ) : null}
                                            {previewVideo && (
                                                <video height="150px" width="auto" controls autoPlay>
                                                    <source src={previewVideo} />
                                                </video>
                                            )}
                                            {interactivity && (
                                                <InteractivityButtonsPreview buttonText={Array.isArray(buttonText) ? buttonText : []} type={type} />
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
                    </Fragment> : <div className="align-items-center bottom0 d-flex justify-content-center left0 position-absolute right0 top0 color-secondary-black">Preview not available</div>
            )}
            {!isAuthoring && isMulti && (
                <Carousel interval={null} indicators={false} controls={slides.length > 1} className="rsmobilelistpreview h-100 w-100">
                    {slides.map((slide, idx) => (
                        <Carousel.Item key={idx}>
                            <MobilePushCard slide={slide} previewSource={previewSource} pushCardMainClassName={pushCardMainClassName} />
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}
            {!isAuthoring && slides.length === 1 && <MobilePushCard slide={slides[0]} previewSource={previewSource} pushCardMainClassName={pushCardMainClassName} />}
        </div>
    );
}

export default RSMobileListPreview;