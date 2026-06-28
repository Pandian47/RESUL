import { SocialLogoIcons } from "../Pages/Component/SocialIcons";
// export const IconURL = 'https://reacuix.resul.io';
export const IconURL = window.location.origin;
export function removeObject(arr, target) {
    const key = target.grid_data_id ? 'grid_data_id' : 'id';
    const val = target.grid_data_id || target.id;

    return arr.filter((item) => {
        if (item.column)
            item.column.forEach((col) => col.children && (col.children = col.children.filter((c) => c[key] !== val)));
        return key === 'grid_data_id' || item.id !== val;
    });
}

export const updateTextInLayout = (data, updatedObj, newText) => {
    return data.map((item) => {
        if (updatedObj.grid_data_id) {
            if (item.type === 'column' && Array.isArray(item.column)) {
                return {
                    ...item,
                    column: item.column.map((col) => {
                        if (Array.isArray(col.children)) {
                            return {
                                ...col,
                                children: col.children.map((child) =>
                                    child.grid_data_id === updatedObj.grid_data_id
                                        ? { ...child, text: newText }
                                        : child,
                                ),
                            };
                        }
                        return col;
                    }),
                };
            }
            return item;
        } else if (item.id === updatedObj.id) {
            return { ...item, text: newText };
        }
        return item;
    });
};

export const updateLayout = (data, updatedObj) => {
    return data.map((item) => {
        if (updatedObj.grid_data_id) {
            if (Array.isArray(item.column)) {
                return {
                    ...item,
                    column: item.column.map((col) => {
                        if (Array.isArray(col.children)) {
                            return {
                                ...col,
                                children: col.children.map((child) =>
                                    child.grid_data_id === updatedObj.grid_data_id ? updatedObj : child,
                                ),
                            };
                        }
                        return col;
                    }),
                };
            }
            return item;
        } else if (item.id === updatedObj.id) {
            return { ...updatedObj };
        }
        return item;
    });
};

export const SOCIAL_CONFIG = {
    MIN_SOCIAL_LINKS: 3,
    MAX_SOCIAL_LINKS: 5,
};

export const ItemTypeLabels = {
    text: 'Text properties',
    image: 'Image properties',
    button: 'Button properties',
    column: 'Block properties',
    divider: 'Divider properties',
    social: 'Social properties',
};

function getBorderStyle(component) {
    let borderStyle = '';
    borderStyle += `border-top: ${
        component.isborder && component.borderTop
            ? `${component.borderthickness || 1}px ${component.borderStyle?.value || 'solid'} ${
                  component.borderColor || '#000000'
              }`
            : '0'
    }; `;
    borderStyle += `border-right: ${
        component.isborder && component.borderRight
            ? `${component.borderthickness || 1}px ${component.borderStyle?.value || 'solid'} ${
                  component.borderColor || '#000000'
              }`
            : '0'
    }; `;
    borderStyle += `border-bottom: ${
        component.isborder && component.borderBottom
            ? `${component.borderthickness || 1}px ${component.borderStyle?.value || 'solid'} ${
                  component.borderColor || '#000000'
              }`
            : '0'
    }; `;
    borderStyle += `border-left: ${
        component.isborder && component.borderLeft
            ? `${component.borderthickness || 1}px ${component.borderStyle?.value || 'solid'} ${
                  component.borderColor || '#000000'
              }`
            : '0'
    }; `;
    return borderStyle.trim();
}

function commonborder(component) {
    let borderStyle = '';
    borderStyle += `border-top: ${
        component.commonborder && component.borderTop
            ? `${component.borderthickness || 1}px ${component.borderStyle?.value || 'solid'} ${
                  component.borderColor || '#000000'
              }`
            : '0'
    }; `;
    borderStyle += `border-right: ${
        component.commonborder && component.borderRight
            ? `${component.borderthickness || 1}px ${component.borderStyle?.value || 'solid'} ${
                  component.borderColor || '#000000'
              }`
            : '0'
    }; `;
    borderStyle += `border-bottom: ${
        component.commonborder && component.borderBottom
            ? `${component.borderthickness || 1}px ${component.borderStyle?.value || 'solid'} ${
                  component.borderColor || '#000000'
              }`
            : '0'
    }; `;
    borderStyle += `border-left: ${
        component.commonborder && component.borderLeft
            ? `${component.borderthickness || 1}px ${component.borderStyle?.value || 'solid'} ${
                  component.borderColor || '#000000'
              }`
            : '0'
    }; `;
    return borderStyle.trim();
}


function renderComponent(component) {
    const borderStyle = getBorderStyle(component);

    const colorToHex = (color) => {
        if (color === 'transparent') return 'transparent';

        const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
        if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
            const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
            const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        return color;
    };

    const fontSizeToPx = (size) => {
        const sizeMap = {
            'xx-small': '9px',
            'x-small': '10px',
            small: '13px',
            medium: '16px',
            large: '18px',
            'x-large': '21px',
            'xx-large': '24px',
            'xxx-large': '32px',
        };
        return sizeMap[size.toLowerCase()] || (isNaN(parseInt(size)) ? '16px' : `${parseInt(size)}px`);
    };

    const parseInlineStyles = (styleString) => {
        const supportedStyles = [
            'font-family',
            'font-size',
            'color',
            'background-color',
            'font-weight',
            'font-style',
            'text-decoration',
            'text-align',
        ];
        const styles = {};
        if (!styleString) return styles;
        styleString = styleString.replace(/&quot;/g, '"');

        const stylePairs = styleString
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s);
        stylePairs.forEach((pair) => {
            const [key, value] = pair.split(':').map((s) => s.trim());
            if (key && value && supportedStyles.includes(key.toLowerCase())) {
                let normalizedValue = value;
                if (key.toLowerCase() === 'font-size') {
                    normalizedValue = fontSizeToPx(value);
                } else if (key.toLowerCase() === 'color' || key.toLowerCase() === 'background-color') {
                    normalizedValue = colorToHex(value);
                } else if (key.toLowerCase() === 'font-family') {
                    normalizedValue = value.replace(/['"]/g, '').trim();
                    if (normalizedValue) {
                        normalizedValue += ', Arial, Helvetica, sans-serif';
                    } else {
                        normalizedValue = 'Arial, Helvetica, sans-serif';
                    }
                } else if (key.toLowerCase() === 'font-weight') {
                    if (value === '400' || value.toLowerCase() === 'normal') return;
                    normalizedValue = value;
                } else if (key.toLowerCase() === 'font-style') {
                    if (value.toLowerCase() === 'normal') return;
                    normalizedValue = value;
                } else if (key.toLowerCase() === 'text-decoration') {
                    if (value.toLowerCase() === 'none' || value.toLowerCase() === 'initial') return;
                    normalizedValue = value;
                }
                styles[key.toLowerCase()] = normalizedValue;
            }
        });
        return styles;
    };

    if (component.type === 'text') {
        let defaultAlignment = 'left';
        let resetText = component.text;
        resetText = resetText.replace(
            /display:\s*inline\s*!important;|-webkit-[^;]+;|orphans:[^;]+;|widows:[^;]+;|font-variant-[^;]+;|text-decoration-(thickness|style|color):[^;]+;|float:[^;]+;|letter-spacing:[^;]+;|word-spacing:[^;]+;|text-indent:[^;]+;|text-transform:[^;]+;/gi,
            '',
        );

        resetText = resetText.replace(/<p\s*([^>]*)>([\s\S]*?)<\/p>/gi, function (match, attrs, content) {
            let alignment = defaultAlignment;
            const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i);
            if (styleMatch) {
                const alignMatch = styleMatch[1].match(/text-align:\s*([^;]+)/i);
                if (alignMatch && ['left', 'center', 'right', 'justify'].includes(alignMatch[1].trim().toLowerCase())) {
                    alignment = alignMatch[1].trim().toLowerCase();
                }
            }

            let processedContent = content.replace(/<span\s+([^>]*)>/gi, function (spanMatch, spanAttrs) {
                const spanStyleMatch = spanAttrs.match(/style\s*=\s*["']([^"']*)["']/i);
                if (!spanStyleMatch) return spanMatch;

                const styles = parseInlineStyles(spanStyleMatch[1]);
                let styleString = '';

                if (styles['font-family']) styleString += `font-family: ${styles['font-family'] || 'Arial, Helvetica, sans-serif'}; `;
                if (styles['font-size']) styleString += `font-size: ${styles['font-size'] || '12px'}; `;
                if (styles['color']) styleString += `color: ${styles['color']}; `;
                if (styles['background-color'] && styles['background-color'] !== 'transparent') {
                    styleString += `background-color: ${styles['background-color']}; `;
                }
                if (styles['font-weight']) styleString += `font-weight: ${styles['font-weight']}; `;
                if (styles['font-style']) styleString += `font-style: ${styles['font-style']}; `;
                if (styles['text-decoration']) styleString += `text-decoration: ${styles['text-decoration']}; `;

                return styleString ? `<font style="${styleString}">` : '';
            });

            processedContent = processedContent.replace(/<\/span>/gi, '</font>');
            processedContent = processedContent.replace(/<span[^>]*>/gi, '');

            return `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="${alignment}" style="padding: 0; mso-line-height-rule: exactly;">
                        ${processedContent}
                    </td>
                </tr>
            </table>
        `;
        });

        resetText = resetText.replace(/<p><\/p>/gi, '');
        resetText = resetText.replace(/(<br\s*\/?>){2,}/gi, '<br>');

        let containerStyle = borderStyle;
        if (component.bgColor) {
            containerStyle += `background-color: ${component.bgColor}; `;
        }
        if (component.bgImage) {
            containerStyle += `background-image: url('${component.bgImage}'); background-repeat: ${component.bgRepeat}; background-position: ${component.bgPositionX} ${component.bgPositionY}; background-size: ${component.bgWidth} ${component.bgHeight}; `;
        }
        containerStyle += `padding: ${component.padding.top}px ${component.padding.right}px ${component.padding.bottom}px ${component.padding.left}px; font-family: Arial, Helvetica, sans-serif;`;

        return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600;">
            <tr>
                <td style="${containerStyle}">
                    ${resetText}
                </td>
            </tr>
        </table>
    `;
    } else if (component.type === 'button') {
        let aStyle = `
        background-color: ${component.color || '#000'}; 
        color: ${component.fontcolor || '#fff'}; 
        display: inline-block; 
        box-sizing: border-box; 
        width: ${component.width || 'auto'}; 
        ${borderStyle}
    `;

    let spanStyle = `
        text-decoration: ${component.textDecoration?.value || 'none'}; 
        font-style: ${component.fontStyle?.value || 'normal'}; 
        font-weight: ${component.fontWeight?.value === 'bolder' ? 'bold' : component.fontWeight?.value || 'normal'}; 
        font-family: ${component.fontFamily?.value || 'Arial, Helvetica, sans-serif'}; 
        font-size: ${component.fontsize || 16}px; 
        letter-spacing: ${component.letterSpacing || 0}px; 
        text-align: ${component.textAlign || 'center'}; 
        color: ${component.fontcolor || '#fff'}; 
        display: block;
    `;

    if (component.btnpadding) {
        aStyle += `padding: ${component.btnpadding}px ${component.btnpadding * 2}px; `;
    } else {
        aStyle += 'padding: 0.375rem 0.75rem; ';
    }
    if (component.borderRadius) {
        aStyle += `border-radius: ${component.borderRadius}px; `;
    }

    let parentStyle = '';
    if (component.bgColor) {
        parentStyle += `background-color: ${component.bgColor}; `;
    }
    if (component.bgImage) {
        parentStyle += `background-image: url('${component.bgImage}'); background-repeat: ${component.bgRepeat}; background-position: ${component.bgPositionX} ${component.bgPositionY}; background-size: ${component.bgWidth || 'cover'} ${component.bgHeight || 'auto'}; `;
    }
    parentStyle += `padding: ${component.padding.top}px ${component.padding.right}px ${component.padding.bottom}px ${component.padding.left}px; text-align: ${component.alignment}; width: 100%; max-width: 600px;`;

    let href = '#';
    if (component.siteUrl) {
        href = component.siteUrl;
    } else if (component.mailto) {
        href = `mailto:${component.mailto}`;
    } else if (component.tel) {
        href = `tel:${component.tel}`;
    } else if (component.fileUrl) {
        href = component.fileUrl;
    } else if (component.skype) {
        href = `skype:${component.skype}?call`;
    }

    let vmlWidth = (component.width && component.width !== 'auto') 
    ? Math.round(parseFloat(component.width) * 0.6667) 
    : 100;

    let vmlHeight = 50
    if (component.btnpadding && component.fontsize) {
        vmlHeight = (component.btnpadding * 2 + parseInt(component.fontsize)) + (component.borderthickness ? parseInt(component.borderthickness) * 2 : 0);
    }

    let vmlArcSize = '';
    if (component.borderRadius > 0) {            
        const arcSize = Math.min(component.borderRadius / (vmlWidth / 2), 1);
        vmlArcSize = `arcsize="${arcSize * 100}%"`;

    }

    const vmlButton = `
        <!--[if mso]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
            href="${href}" 
            style="height:${vmlHeight}px;v-text-anchor:middle;width:${vmlWidth}px;" 
            fillcolor="${component.color || '#000'}">
            <w:anchorlock/>
            <center style="color:${component.fontcolor || '#fff'};font-family:${component.fontFamily?.value || 'Arial, Helvetica, sans-serif'};font-size:${component.fontsize || 16}px;font-weight:${component.fontWeight?.value === 'bolder' ? 'bold' : component.fontWeight?.value || 'normal'};text-decoration:${component.textDecoration?.value || 'none'};font-style:${component.fontStyle?.value || 'normal'};">
                ${component.label}
            </center>
        </v:rect>
        <![endif]-->
    `;

    return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="${component.alignment}" style="${parentStyle}">
                    <table cellpadding="0" cellspacing="0" border="0" align="${component.alignment}" 
                    width="${vmlWidth}" style="width: ${component.width || 'auto'};">
                        <tr>
                        <!--[if mso]>
                        <td style="padding: 0; ${borderStyle};border-radius: ${component.borderRadius}px;">
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <td style="padding: 0; border: none;">
                        <!--<![endif]-->
                            ${vmlButton}
                            <!--[if !mso]><!-->
                            <a href="${href}" target="${component.target ? component.target : '_blank'}" style="${aStyle}">
                                <span style="${spanStyle}">${component.label}</span>
                            </a>
                            <!--<![endif]-->
                        </td>
                    </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;
    } else if (component.type === 'divider') {
        const parsedBorderWidth = parseInt(component.borderWidth, 10) || 100;
        const maxWidth = 600;
        const widthPercentage = parsedBorderWidth > 100 ? 100 : parsedBorderWidth;
        const pixelWidth = Math.round((widthPercentage / 100) * maxWidth);
    
        let parentStyle = `padding: ${component.padding.top || 0}px ${component.padding.right || 0}px ${
            component.padding.bottom || 0
        }px ${component.padding.left || 0}px; `;
        if (component.bgColor) parentStyle += `background-color: ${component.bgColor}; `;
        if (component.bgImage) {
            parentStyle += `background-image: url('${component.bgImage}'); `;
            parentStyle += `background-repeat: ${component.bgRepeat || 'no-repeat'}; `;
            parentStyle += `background-position: ${component.bgPositionX || 'center'} ${
                component.bgPositionY || 'center'
            }; `;
            parentStyle += `background-size: ${component.bgWidth || 'auto'} ${component.bgHeight || 'auto'}; `;
        }
    
        const alignment = component.alignment || 'center';
        let alignAttribute = 'align="center"';
        let marginStyle = '';
        
        // Convert alignment to margin for better client support
        if (alignment === 'left') {
            alignAttribute = 'align="left"';
            marginStyle = 'margin-right: auto;';
        } else if (alignment === 'right') {
            alignAttribute = 'align="right"';
            marginStyle = 'margin-left: auto;';
        } else {
            marginStyle = 'margin: 0 auto;';
        }
    
        if (component.spacer) {
            const spacerHeight = parseInt(component.borderHeight, 10) || 10;
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: ${maxWidth}px;">
                    <tr>
                        <td style="${parentStyle}">
                            <div style="${marginStyle} width: ${widthPercentage}%; max-width: ${pixelWidth}px; height: ${spacerHeight}px; font-size: 0; line-height: 0;">&nbsp;</div>
                        </td>
                    </tr>
                </table>
            `;
        } else {
            const dividerThickness = parseInt(component.borderthickness, 10) || 1;
            const dividerStyle = `
                border-top: ${dividerThickness}px ${component.borderStyle?.value || 'solid'} ${
                component.borderColor || '#000000'
            };
                width: 100%;
                font-size: 0;
                line-height: 0;
            `;
            return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: ${maxWidth}px;">
                    <tr>
                        <td style="${parentStyle}">
                            <table ${alignAttribute} width="${widthPercentage}%" cellpadding="0" cellspacing="0" border="0" style="${marginStyle} max-width: ${pixelWidth}px;">
                                <tr>
                                    <td style="${dividerStyle}">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            `;
        }
    }else if (component.type === 'image') {
        // debugger
        let containerStyle = borderStyle;
    
        if (component.bgColor) {
            containerStyle += `background-color: ${component.bgColor}; `;
        }
    
        if (component.bgImage) {
            containerStyle += `
                background-image: url('${component.bgImage}');
                background-repeat: ${component.bgRepeat};
                background-position: ${component.bgPositionX} ${component.bgPositionY};
                background-size: ${component.bgWidth} ${component.bgHeight};
            `;
        }
    
        containerStyle += `
            padding: ${component.padding.top}px ${component.padding.right}px ${component.padding.bottom}px ${component.padding.left}px;
            text-align: ${component.alignment};
        `;
    
        let imgWidthValue = component.imgwidth || '100';
        let imgWidthNumeric = '100'; // Default to 100 if auto or invalid
        if (imgWidthValue !== 'auto') {
            imgWidthNumeric = parseFloat(imgWidthValue.replace('px', '')) || 100;
        }
    
        let vmlWidth = imgWidthValue !== 'auto' 
            ? Math.round(imgWidthNumeric * 0.6667) 
            : 100;
    
        let imgHeightValue = component.imgheight || '100';
        let imgHeightNumeric = imgHeightValue !== 'auto' 
            ? parseFloat(imgHeightValue.replace('px', '')) || 100 
            : null;
    
        let vmlHeight = imgHeightNumeric 
            ? Math.round(imgHeightNumeric * 0.6667) 
            : null;
        // debugger
        const vmlBackground = component.bgColor ? `
            <!--[if mso]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                fill="true" strokecolor="none" strokeweight="0" stroke="false"
                style="height:${vmlHeight}px;${vmlHeight ? `height:${vmlHeight}px;` : ''};"
                fillcolor="${component.bgColor}">
                <w:anchorlock/>
                <center>
            <![endif]-->
        ` : '';
    
        const vmlClose = component.bgColor ? `
            <!--[if mso]>
                </center>
            </v:rect>
            <![endif]-->
        ` : '';
    
        let imgStyle = `border:0;`;
        if (imgWidthValue !== 'auto') {
            imgStyle += `width:${imgWidthNumeric}px;`;
        }
        if (imgHeightNumeric) {
            imgStyle += `height:${imgHeightNumeric}px;`;
        }
    
        let imageTag = `
            <img src="${component.src || ''}" alt="${component.alt || ''}" 
                ${imgWidthValue !== 'auto' ? `width="${imgWidthNumeric}"` : ''} 
                ${imgHeightNumeric ? `height="${imgHeightNumeric}"` : ''} 
                style="${imgStyle}">
        `;
    
        return `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="${component.alignment}" style="${containerStyle}; ${imgWidthValue !== 'auto' ? `width:${imgWidthNumeric}px; max-width:${imgWidthNumeric}px;` : ''} ${imgHeightNumeric ? `height:${imgHeightNumeric}px;` : ''} overflow:hidden;">
                        ${vmlBackground}
                        <table cellpadding="0" cellspacing="0" border="0" align="${component.alignment}" ${imgWidthValue !== 'auto' ? `width="${imgWidthNumeric}"` : ''}>
                            <tr>
                                <td ${imgWidthValue !== 'auto' ? `width="${imgWidthNumeric}" style="width:${imgWidthNumeric}px;` : 'style="'} ${imgHeightNumeric ? `height:${imgHeightNumeric}px;` : ''} overflow:hidden;">
                                    <!--[if mso]>
                                        <v:shape id="theImage" type="#_x0000_t75"
                                            style="width:${vmlWidth}px;${vmlHeight ? 
                                                 `height:${vmlHeight}px;` : ''}"
                                            stroked="f" filled="t">
                                            <v:imagedata src="${component.src}" />
                                        </v:shape>
                                    <![endif]-->
                                    <!--[if !mso]><!-- -->
                                        ${imageTag}
                                    <!--<![endif]-->
                                </td>
                            </tr>
                        </table>
                        ${vmlClose}
                    </td>
                </tr>
            </table>
        `;
    }
    else if (component.type === 'social') {
        const alignment = ['left', 'center', 'right'].includes(component.alignment) ? component.alignment : 'center';
        const spaceBetween = component.SpaceBetweenIcons || 10;
        const iconSize = component.size || 30;

        let containerStyle = '';
        if (component.bgColor) containerStyle += `background-color: ${component.bgColor}; `;
        if (component.bgImage) {
            containerStyle += `background-image: url('${component.bgImage}'); 
                             background-repeat: ${component.bgRepeat || 'no-repeat'}; 
                             background-position: ${component.bgPositionX || 'center'} ${
                component.bgPositionY || 'center'
            }; 
            background-size: ${component.bgWidth || 'auto'} ${component.bgHeight || 'auto'}; `;
        }
        containerStyle += `padding: ${component.padding.top || 0}px ${component.padding.right || 0}px ${
            component.padding.bottom || 0
        }px ${component.padding.left || 0}px; 
                          text-align: ${alignment};
                          width: 100%;
                          max-width: 600px;
                          margin: 0 auto;`;

        const socialIconSet = SocialLogoIcons.find(
            (set) => set.style === (component.socialIcon || 'RoundedColorLogos'),
        );
        if (!socialIconSet) {
            return '<div style="text-align: center; padding: 20px;">Error: Social icon style not found</div>';
        }

        const defaultIcons = ['facebook', 'twitter', 'instagram'];
        let selectedIcons =
            Array.isArray(component.iconLinks) && component.iconLinks.length > 0
                ? component.iconLinks.filter((label) => typeof label === 'string')
                : defaultIcons;

        const icons = selectedIcons
            .map((label) => {
                const icon = socialIconSet.find((icon) => icon.label.toLowerCase() === label.toLowerCase());
                if (!icon) return null;
                const url = component[label.toLowerCase()] || '#'; 
                return {
                    src: IconURL + icon.iconSrc,
                    alt: icon.label || 'Social Icon',
                    url,
                };
            })
            .filter((icon) => icon !== null);

        if (icons.length < SOCIAL_CONFIG.MIN_SOCIAL_LINKS) {
            const additionalIcons = defaultIcons
                .filter((label) => !selectedIcons.includes(label.toLowerCase()))
                .slice(0, SOCIAL_CONFIG.MIN_SOCIAL_LINKS - icons.length)
                .map((label) => {
                    const icon = socialIconSet.find((icon) => icon.label.toLowerCase() === label.toLowerCase());
                    if (!icon) return null;
                    const url = component[label.toLowerCase()] || '#';
                    return {
                        src: baseURL + icon.iconSrc,
                        alt: icon.label || 'Social Icon',
                        url,
                    };
                })
                .filter((icon) => icon !== null);
            icons.push(...additionalIcons);
        }

        let socialHtml = '';
        icons.forEach((icon, index) => {
            const isLast = index === icons.length - 1;
            const paddingRight = isLast ? '0' : `${spaceBetween}px`;

            socialHtml += `
                <td align="center" style="padding-right: ${paddingRight};display: inline-flex;">
                    <a href="${icon.url}" target="_blank" style="display: inline-block;">
                        <img src="${icon.src}" alt="${icon.alt}" width="${iconSize}" height="${iconSize}" style="border: 0; display: block;">
                    </a>
                </td>
            `;
        });

        return `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
                <tr>
                    <td align="${alignment}" style="${containerStyle}">
                        <table cellpadding="0" cellspacing="0" border="0" align="${alignment}" style="margin: 0 auto;">
                            <tr>
                                ${socialHtml}
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        `;
    }
    return '';
}

function generateSubColumnHtml(subColumn) {
    let html = `
        <table cellpadding="0" cellspacing="0" class="es-left" align="left" style="width: ${subColumn.width}px;">
            <tbody>
                <tr>
                    <td class="esd-container-frame">
                        <table cellpadding="0" cellspacing="0" width="100%">
                            <tbody>
    `;
    if (subColumn.children && Array.isArray(subColumn.children)) {
        for (let child of subColumn.children) {
            let tdStyle = `text-align: ${child.alignment}; padding: 0;width: ${subColumn.width}px; `;
            html += `<tr><td class="esd-block-${child.type}" width:${subColumn.width} style="${tdStyle}">${renderComponent(child)}</td></tr>`;
        }
    }
    html += `
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
    return html;
}

function generateSectionHtml(section) {
    // debugger
    const sectionBorderStyle = getBorderStyle(section);
    let sectionStyle = sectionBorderStyle;
    if (section.bgColor) sectionStyle += `background-color: ${section.bgColor}; `;
    if (section.bgImage) {
        sectionStyle += `background-image: url('${section.bgImage}'); background-repeat: ${section.bgRepeat}; background-position: ${section.bgPositionX} ${section.bgPositionY}; background-size: ${section.bgWidth} ${section.bgHeight}; `;
    }

    let html = `
        <table cellspacing="0" cellpadding="0" class="es-section" style="${sectionStyle}" width="100%">
            <tbody>
                <tr>
                    <td class="esd-stripe">
                        <table width="100%" cellspacing="0" cellpadding="0" class="es-section-body">
                            <tbody>
                                <tr>
                                    <td class="esd-structure">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
    `;
    let totalWidth = 0;
    const columnWidths = section.column?.map((col) => parseInt(col.width)) || [];
    const gapWidth = parseInt(section.gap) || 0;
    const totalColumnWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const totalGapsWidth = gapWidth * (section.column?.length - 1 || 0);
    const containerWidth = totalColumnWidth + totalGapsWidth;

    for (let i = 0; i < section.column?.length; i++) {
        let subColumn = section.column[i];
        html += `
            <td style="padding: 0; vertical-align: top;" width="${subColumn.width}">
                ${generateSubColumnHtml(subColumn)}
            </td>
        `;
        if (i < section.column?.length - 1) {
            html += `
                <td style="padding: 0; min-height: 1px;" width="${section.gap}"></td>
            `;
        }
        totalWidth += parseInt(subColumn.width) + (i < section.column?.length - 1 ? gapWidth : 0);
    }
    html += `
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
    return html;
}

function convertJsonToHtml(emailLayout, droparea) {
    // debugger
    const wrapperBorderStyle = commonborder(droparea);
    let wrapperStyle = wrapperBorderStyle;
    if (droparea.bgColor) wrapperStyle += `background-color: ${droparea.bgColor}; `;
    if (droparea.bgImage) {
        wrapperStyle += `background-image: url('${droparea.bgImage}'); background-repeat: no-repeat; background-position: center center; background-size: cover; `;
    }
    wrapperStyle += `padding: 0px; width: ${droparea.width}px; max-width: 600;`;

    let html = `
        <!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <title>Email Preview</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <!--[if gte mso 9]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <style>
                body { margin: 0; padding: 0; }
                table, td {mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
                a { text-decoration: none; }
                p, ul, ol { margin: 0; padding: 0; }
            </style>
        </head>
        <body style="margin: 0; padding: 0;">
            <table width="${droparea.width}" align="center" cellpadding="0" cellspacing="0" class="es-wrapper" style="${wrapperStyle}">
                <tbody>
                    <tr>
                        <td valign="top" style="padding: 0;">
    `;
    for (let i = 0; i < emailLayout?.length; i++) {
        html += generateSectionHtml(emailLayout[i]);
        if (i < emailLayout?.length - 1) {
            html += `
                <table cellpadding="0" cellspacing="0" class="es-section-gap" style="width: 100%; height: ${droparea.gap}px;">
                    <tbody>
                        <tr>
                            <td style="padding: 0;height: ${droparea.gap}px; font-size: 0px;">&nbsp;</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
    }
    html += `
                        </td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
    `;
    return html;
}

export { convertJsonToHtml };

