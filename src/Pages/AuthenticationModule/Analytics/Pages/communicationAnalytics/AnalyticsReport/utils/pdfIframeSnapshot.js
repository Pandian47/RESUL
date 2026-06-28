
import { drawDOM, exportImage } from '@progress/kendo-drawing';
import { defineFont } from '@progress/kendo-drawing/pdf';
import muktaRegularUrl from 'Styles/fonts/Mukta/Muktaregular.ttf?url';
import muktaMediumUrl from 'Styles/fonts/Mukta/Muktamedium.ttf?url';
import muktaBoldUrl from 'Styles/fonts/Mukta/Muktabold.ttf?url';
import muktaSemiBoldUrl from 'Styles/fonts/Mukta/Muktasemibold.ttf?url';
import resulIconsUrl from 'Styles/fonts/rs-icons/resul.ttf?url';
import resulIconsWoffUrl from 'Styles/fonts/rs-icons/resul.woff?url';

let arePdfFontsRegistered = false;
let isResulFontLoaded = false;

const ensureResulFontLoaded = async () => {
    if (isResulFontLoaded || typeof document === 'undefined') {
        return;
    }

    try {
        if (!document.check('24px resul')) {
            const font = new FontFace('resul', `url(${resulIconsWoffUrl}) format('woff'), url(${resulIconsUrl}) format('truetype')`);
            await font.load();
            document.add(font);
        }
        isResulFontLoaded = true;
    } catch {
        isResulFontLoaded = true;
    }
};

export const registerPdfFonts = () => {
    if (arePdfFontsRegistered) {
        return;
    }

    defineFont({
        MuktaRegular: muktaRegularUrl,
        Muktaregular: muktaRegularUrl,
        MuktaMedium: muktaMediumUrl,
        Muktamedium: muktaMediumUrl,
        MuktaBold: muktaBoldUrl,
        Muktabold: muktaBoldUrl,
        MuktaSemiBold: muktaSemiBoldUrl,
        Muktasemibold: muktaSemiBoldUrl,
        resul: resulIconsUrl,
    });

    arePdfFontsRegistered = true;
};

const parseIconContent = (contentValue) => {
    if (!contentValue || contentValue === 'none' || contentValue === 'normal') {
        return null;
    }

    const unquoted = contentValue.replace(/^["']|["']$/g, '');
    if (!unquoted) {
        return null;
    }

    return unquoted.replace(/\\([0-9a-fA-F]{1,6})/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)),
    );
};

const getIconRenderSize = (element, elementStyles) => {
    const rect = element.getBoundingClientRect();
    const fontSize = parseFloat(elementStyles.fontSize) || 24;
    const width = rect.width > 0 ? rect.width : fontSize;
    const height = rect.height > 0 ? rect.height : fontSize;

    return { width, height, fontSize };
};

const renderIconToImage = async (element) => {
    if (!element?.isConnected) {
        return null;
    }

    const beforeStyles = window.getComputedStyle(element, '::before');
    const glyph = parseIconContent(beforeStyles?.content);
    if (!glyph) {
        return null;
    }

    const elementStyles = window.getComputedStyle(element);
    const { width, height, fontSize } = getIconRenderSize(element, elementStyles);
    const color = elementStyles?.color || '#f56701';
    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = Math.ceil(width * devicePixelRatio);
    const canvasHeight = Math.ceil(height * devicePixelRatio);

    await ensureResulFontLoaded();

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return null;
    }

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.font = `${fontSize}px resul`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, width / 2, height / 2);

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.alt = '';
    img.setAttribute('data-pdf-icon-snapshot', 'true');
    img.style.cssText = [
        `width:${width}px`,
        `height:${height}px`,
        'min-width:unset',
        'min-height:unset',
        'max-width:none',
        'max-height:none',
        'display:inline-block',
        'vertical-align:middle',
        'flex-shrink:0',
        elementStyles.marginRight !== '0px' ? `margin-right:${elementStyles.marginRight}` : '',
        elementStyles.marginLeft !== '0px' ? `margin-left:${elementStyles.marginLeft}` : '',
    ]
        .filter(Boolean)
        .join(';');

    return img;
};

const createDropdownCaretImage = (color = '#999999') => {
    const width = 12;
    const height = 7;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * devicePixelRatio);
    canvas.height = Math.ceil(height * devicePixelRatio);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return null;
    }

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width / 2, height);
    ctx.closePath();
    ctx.fill();

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.alt = '';
    img.setAttribute('data-pdf-caret-snapshot', 'true');
    img.style.cssText = [
        `width:${width}px`,
        `height:${height}px`,
        'margin-left:5px',
        'display:inline-block',
        'vertical-align:middle',
        'flex-shrink:0',
    ].join(';');

    return img;
};

export const inlineDropdownCaretsForPdfExport = (rootEl) => {
    if (!rootEl) {
        return () => {};
    }

    const replacements = [];
    const caretTargets = rootEl.querySelectorAll(
        '.pdf-export-dropdown-label, .rs-dropdown:not(.no_caret) .dropdown-toggle',
    );

    caretTargets.forEach((target) => {
        if (!target?.isConnected) {
            return;
        }

        if (target.querySelector('[data-pdf-caret-snapshot="true"]')) {
            return;
        }

        const targetStyles = window.getComputedStyle(target);
        if (targetStyles?.display === 'none' || targetStyles?.visibility === 'hidden') {
            return;
        }

        const caretColor = target.classList?.contains('dropdown-toggle')
            ? window.getComputedStyle(target, '::after')?.borderTopColor || '#999999'
            : '#999999';
        const caret = createDropdownCaretImage(caretColor);
        if (!caret) {
            return;
        }

        target.classList?.add('pdf-export-hide-native-caret');
        target.appendChild(caret);
        replacements.push({ target, caret });
    });

    return () => {
        replacements.forEach(({ target, caret }) => {
            target?.classList?.remove('pdf-export-hide-native-caret');
            caret?.remove?.();
        });
    };
};

export const inlineResulIconsForPdfExport = async (rootEl) => {
    if (!rootEl) {
        return () => {};
    }

    const iconElements = Array.from(rootEl.querySelectorAll('i[class*="icon-rs-"]'));
    const replacements = [];

    for (const icon of iconElements) {
        if (!icon?.isConnected) {
            continue;
        }

        if (
            icon.hasAttribute('data-pdf-icon-hidden') ||
            icon.classList?.contains('pdf-export-icon-replaced')
        ) {
            continue;
        }

        const iconStyles = window.getComputedStyle(icon);
        if (iconStyles?.display === 'none' || iconStyles?.visibility === 'hidden') {
            continue;
        }

        const parent = icon.parentNode;
        if (parent?.querySelector('[data-pdf-icon-snapshot="true"]')) {
            continue;
        }

        const img = await renderIconToImage(icon);
        if (!img) {
            continue;
        }

        parent?.insertBefore(img, icon);
        icon.setAttribute('data-pdf-icon-hidden', 'true');
        icon.classList?.add('pdf-export-icon-replaced');

        replacements.push({ icon, img });
    }

    return () => {
        replacements.forEach(({ icon, img }) => {
            icon?.removeAttribute?.('data-pdf-icon-hidden');
            icon?.classList?.remove('pdf-export-icon-replaced');
            img?.remove?.();
        });
    };
};

export const reflowChartsForPdfExport = (rootEl) => {
    if (!rootEl || typeof window === 'undefined') {
        return;
    }

    window.Highcharts?.forEach((chart) => {
        if (renderTo && rootEl.contains(renderTo)) {
            reflow();
        }
    });

    window.dispatchEvent(new Event('resize'));
};

export const preparePdfExport = async (rootEl) => {
    const noopRestore = () => {};

    if (!rootEl) {
        return noopRestore;
    }

    try {
        registerPdfFonts();
        reflowChartsForPdfExport(rootEl);
        const restoreIcons = await inlineResulIconsForPdfExport(rootEl);
        const restoreCarets = inlineDropdownCaretsForPdfExport(rootEl);
        const restoreIframes = await replaceIframesForPdfExport(rootEl);

        return () => {
            try {
                restoreIcons?.();
                restoreCarets?.();
                restoreIframes?.();
            } catch {
                // Ignore cleanup failures after PDF export
            }
        };
    } catch {
        return noopRestore;
    }
};

const getIframeScale = (iframeStyle) => {
    const transform = iframeStyle.transform;
    if (!transform || transform === 'none') return 0.4;
    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
        const scaleX = parseFloat(matrixMatch[1].split(',')[0]);
        if (Number.isFinite(scaleX) && scaleX > 0) return scaleX;
    }
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
        const scale = parseFloat(scaleMatch[1]);
        if (Number.isFinite(scale) && scale > 0) return scale;
    }
    return 0.4;
};

const createImageSnapshot = async (iframe, clip) => {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc?.body) return null;

    const iframeStyle = window.getComputedStyle(iframe);
    const scale = getIframeScale(iframeStyle);
    const clipHeight = clip.offsetHeight || 310;

    const group = await drawDOM(doc.body, { scale });
    const dataUrl = await exportImage(group);

    const img = document.createElement('img');
    img.setAttribute('data-pdf-iframe-snapshot', 'true');
    img.className = 'pdf-export-iframe-image';
    img.src = dataUrl;
    img.alt = 'Channel preview';
    img.style.cssText = `width:100%;height:${clipHeight}px;object-fit:cover;object-position:top center;display:block;`;

    return img;
};

const createHtmlSnapshot = (iframe, clip) => {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc?.body) return null;

    const bodyHtml = doc.body.innerHTML?.trim();
    if (!bodyHtml) return null;

    const iframeStyle = window.getComputedStyle(iframe);
    const bodyHeight = doc.body.scrollHeight || doc.body.offsetHeight || parseInt(iframe.style.height, 10) || 0;
    if (!bodyHeight) return null;

    const scale = getIframeScale(iframeStyle);
    const clipHeight = clip.offsetHeight || Math.round(bodyHeight * scale) + 20;

    const headStyles = Array.from(doc.head?.querySelectorAll('style') || [])
        .map((node) => node.outerHTML)
        .join('');

    const snapshot = document.createElement('div');
    snapshot.setAttribute('data-pdf-iframe-snapshot', 'true');
    snapshot.className = 'pdf-export-iframe-snapshot';
    snapshot.style.cssText = `overflow:hidden;width:100%;height:${clipHeight}px;position:relative;`;

    const content = document.createElement('div');
    content.className = 'pdf-export-iframe-content';
    content.innerHTML = `${headStyles}${bodyHtml}`;
    content.style.cssText = [
        `width:${iframe.style.width || '250%'}`,
        `height:${iframe.style.height || `${bodyHeight}px`}`,
        `transform:${iframeStyle.transform !== 'none' ? iframeStyle.transform : `scale(${scale})`}`,
        `transform-origin:${iframeStyle.transformOrigin || 'top left'}`,
        'overflow:hidden',
        'pointer-events:none',
    ].join(';');

    snapshot.appendChild(content);
    return snapshot;
};

export const replaceIframesForPdfExport = async (rootEl) => {
    if (!rootEl) return () => {};

    const replacements = [];
    const iframes = Array.from(rootEl.querySelectorAll('iframe'));

    for (const iframe of iframes) {
        try {
            const clip = iframe.parentElement;
            if (!clip) continue;

            let snapshot = null;
            try {
                snapshot = await createImageSnapshot(iframe, clip);
            } catch {
                snapshot = createHtmlSnapshot(iframe, clip);
            }

            if (!snapshot) continue;

            const previousDisplay = iframe.style.display;
            clip.insertBefore(snapshot, iframe);
            iframe.style.display = 'none';

            replacements.push({ iframe, snapshot, previousDisplay });
        } catch {
            // Skip inaccessible iframes
        }
    }

    return () => {
        replacements.forEach(({ iframe, snapshot, previousDisplay }) => {
            snapshot?.remove?.();
            if (iframe) {
                iframe.style.display = previousDisplay ?? '';
            }
        });
    };
};
