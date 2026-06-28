import { APPLY, CANCEL, FONT_COLOR } from 'Constants/GlobalConstant/Placeholders';
import { file_lock_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const PRESET_COLORS = [
    '#D0021B',
    '#F5A623',
    '#F8E71C',
    '#8B572A',
    '#7ED321',
    '#417505',
    '#BD10E0',
    '#9013FE',
    '#4A90E2',
    '#50E3C2',
    '#B8E986',
    '#000000',
    '#4A4A4A',
    '#9B9B9B',
    '#FFFFFF',
    'transparent',
];

const TRANSPARENT_COLOR = 'transparent';
const TRANSPARENT_HEX = '#00000000';

    const isTransparentColor = (color) => {
  if (typeof color !== 'string') return false;
  const lowered = color.toLowerCase();
  return lowered === 'transparent' || lowered === '#00000000';
};

const normalizeHexInputValue = (color) => {
    if (isTransparentColor(color)) return TRANSPARENT_HEX;
    return (color || '').replace('#', '').substring(0, 6);
};

    const updateHexInputValue = (containerRef, color) => {
        const hexInput = containerRef.current?.querySelector('.sketch-picker input[id^="rc-editable-input"]');
        if (hexInput) {
            hexInput.setAttribute('maxlength', isTransparentColor(color) ? TRANSPARENT_HEX.length.toString() : '6');
            hexInput.value = isTransparentColor(color) ? TRANSPARENT_HEX : normalizeHexInputValue(color);
        }
    };

const RSColorPicker = ({
    onSelect = () => {},
    icon = file_lock_medium,
    tooltipText = FONT_COLOR,
    tooltipClass = '',
    isToolTip = false,
    isOpacity = false,
    wrapperClass,
    initColor = '#333333',
    colorValue,
    defaultIconColor = '',
    pickerIconColor = 'color-primary-blue',
    alignRight = false,
    ...rest
}) => {
    const colorRef = useRef();
    const [show, setShow] = useState(false);
    const [colorPreview, setColorPreview] = useState('');
    const [iconColor, setIconColor] = useState(defaultIconColor);
    const [background, setBackground] = useState('');
    const [opacityBg, setOpacityBg] = useState('1');
    useEffect(() => {
        window.addEventListener('mousedown', handlemouseDownEvent);
        return () => {
            window.removeEventListener('mousedown', handlemouseDownEvent);
        };
    }, []);

    function handlemouseDownEvent(e) {
        if (colorRef?.current && !colorRef.current?.contains(e.target)) {
            setShow(false);
        }
    }

    const sketchRef = useRef(null);
    const buttonsRef = useRef(null);
    const isTransparentSelectionRef = useRef(false);

    const applyTransparentSelection = useCallback(() => {
        isTransparentSelectionRef.current = false;
        setColorPreview(TRANSPARENT_COLOR);
        setBackground(TRANSPARENT_HEX);
        setOpacityBg(0);
        updateHexInputValue(colorRef, TRANSPARENT_COLOR);
    }, []);

    const shouldTreatAsTransparent = useCallback(
        (data) =>
            isTransparentColor(data?.hex) ||
            isTransparentSelectionRef.current ||
            (data?.rgb?.a === 0 &&
                (isTransparentColor(background) || isTransparentColor(colorPreview))),
        [background, colorPreview],
    );

    useEffect(() => {
        if (colorValue != null && colorValue !== '') {
            setIconColor(colorValue);
        }
    }, [colorValue]);

    useEffect(() => {
        if (show) {
            const appliedColor = colorValue || iconColor || initColor;
        const bg = isTransparentColor(appliedColor) ? TRANSPARENT_HEX : appliedColor;
        setBackground(bg);
        setColorPreview(bg);

            const sketchPickerEl = colorRef.current?.querySelector('.sketch-picker');
            if (sketchPickerEl && buttonsRef.current && !sketchPickerEl?.contains(buttonsRef.current)) {
                sketchPickerEl.appendChild(buttonsRef.current);
                buttonsRef.current.style.display = 'flex';
            }

            requestAnimationFrame(() => updateHexInputValue(colorRef, appliedColor));
        }
    }, [show, colorValue, iconColor, initColor]);

    useEffect(() => {
        if (!show) return;

        const transparentSwatch = colorRef.current?.querySelector(
            '.sketch-picker > div:nth-child(4) .flexbox-fix > *:last-child',
        );

        if (!transparentSwatch || transparentSwatch.dataset.rsTransparentSwatch) return;

        transparentSwatch.dataset.rsTransparentSwatch = 'true';

        const handleTransparentClick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            isTransparentSelectionRef.current = true;
            applyTransparentSelection();
        };

        transparentSwatch.addEventListener('click', handleTransparentClick, true);

        return () => {
            transparentSwatch.removeEventListener('click', handleTransparentClick, true);
            delete transparentSwatch.dataset.rsTransparentSwatch;
        };
    }, [show, applyTransparentSelection]);

    // Restrict hex input to valid hex characters or the transparent hex value
    useEffect(() => {
        if (show) {
            const hexInput = colorRef.current?.querySelector('.sketch-picker input[id^="rc-editable-input"]');
            if (hexInput) {
                const appliedColor = colorValue || iconColor || initColor;
                hexInput.setAttribute('maxlength', isTransparentColor(appliedColor) ? TRANSPARENT_COLOR.length.toString() : '6');

                const handleKeyDown = (e) => {
                    if (
                        e.key === 'Backspace' ||
                        e.key === 'Delete' ||
                        e.key === 'Tab' ||
                        e.key === 'Escape' ||
                        e.key === 'Enter' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowDown' ||
                        e.key === 'Home' ||
                        e.key === 'End' ||
                        (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
                    ) {
                        return;
                    }

                    const input = e.target;
                    const hasSelection = input.selectionStart !== input.selectionEnd;
                    const currentValue = input.value;
                    const selectionLength = hasSelection ? input.selectionEnd - input.selectionStart : 0;
                    const nextValue =
                        currentValue.substring(0, input.selectionStart) +
                        e.key +
                        currentValue.substring(input.selectionEnd);

                    const isValidHexChar = /^[0-9a-fA-F]$/.test(e.key);
                    const isTransparentPrefix = TRANSPARENT_COLOR.startsWith(nextValue.toLowerCase());
                    const isTransparentChar = /^[a-zA-Z]$/.test(e.key) && isTransparentPrefix;

                    if (!isValidHexChar && !isTransparentChar) {
                        e.preventDefault();
                        return;
                    }

                    const maxLength = isTransparentPrefix ? TRANSPARENT_COLOR.length : 6;
                    if (!hasSelection && currentValue.length - selectionLength >= maxLength) {
                        e.preventDefault();
                    }
                };

                const handlePaste = (e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData?.getData('text') || '';
                    const input = e.target;
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    const currentValue = input.value;
                    const cleanedTransparent = pastedText.replace(/[^a-zA-Z]/g, '').toLowerCase();

                    if (TRANSPARENT_COLOR.startsWith(cleanedTransparent) || cleanedTransparent.startsWith(TRANSPARENT_COLOR)) {
                        input.value = TRANSPARENT_COLOR;
                        isTransparentSelectionRef.current = true;
                        applyTransparentSelection();
                        return;
                    }

                    const cleanedText = pastedText.replace(/[^0-9a-fA-F]/g, '');
                    const remainingLength = 6 - (currentValue.length - (end - start));
                    const textToInsert = cleanedText.substring(0, Math.max(0, remainingLength));
                    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
                    input.value = newValue.substring(0, 6);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                };

                const handleInput = (e) => {
                    if (e.target.value.toLowerCase() === TRANSPARENT_COLOR) {
                        isTransparentSelectionRef.current = true;
                        applyTransparentSelection();
                    }
                };

                hexInput.addEventListener('keydown', handleKeyDown);
                hexInput.addEventListener('paste', handlePaste);
                hexInput.addEventListener('input', handleInput);

                return () => {
                    hexInput.removeEventListener('keydown', handleKeyDown);
                    hexInput.removeEventListener('paste', handlePaste);
                    hexInput.removeEventListener('input', handleInput);
                };
            }
        }
    }, [show, colorValue, iconColor, initColor, applyTransparentSelection]);

    return (
        <div className={`rs-builder-colorpicker-container ${wrapperClass}`}>
            <div className="rs-colorpicker-wrapper" ref={colorRef}>
                {isToolTip ? (
                    <RSTooltip text={tooltipText} className={`lh0 ${tooltipClass ? tooltipClass : ''}`}>
                        <i
                            icon-title={tooltipText}
                            style={{
                                // '--editorbgcolor': `${colorValue }`,
                                '--editorbgcolor': `${colorValue ?? iconColor}`,
                            }}
                            className={`${icon} icon-md ${pickerIconColor}`}
                            onClick={() => setShow(!show)}
                        />
                    </RSTooltip>
                ) : (
                    <RSTooltip text={tooltipText} className={`lh0 p0 ${tooltipClass ? tooltipClass : ''}`}>
                        <i
                            icon-title={tooltipText}
                            style={{
                                // '--editorbgcolor': `${colorValue }`,
                                '--editorbgcolor': `${colorValue ?? iconColor}`,
                            }}
                            className={`${icon} icon-md ${pickerIconColor}`}
                            onClick={() => setShow(!show)}
                        />
                    </RSTooltip>
                )}
                {show && (
                    <div 
                        className={`rscw-content ${alignRight ? 'align-right' : ''}`}
                        style={alignRight ? { right: 0, left: 'auto' } : {}}
                    >
                        <div className="horizontal-picker-container" ref={sketchRef}>
                            <SketchPicker
                                color={background}
                                className="d-inline-block"
                                presetColors={PRESET_COLORS}
                                onChange={(data) => {
                                    if (shouldTreatAsTransparent(data)) {
                                        applyTransparentSelection();
                                        return;
                                    }

                                    if (data.hsl !== background) {
                                        setColorPreview(data.hex);
                                        setBackground(data.hsl);
                                        setOpacityBg(data.hsl.a);
                                        updateHexInputValue(colorRef, data.hex);
                                    }
                                }}
                                {...rest}
                            />
                        </div>
                        <div className="rscw-bottom buttons-holder" ref={buttonsRef} style={{ display: 'none' }}>
                            <RSSecondaryButton onClick={() => setShow(false)}>{CANCEL}</RSSecondaryButton>
                            <RSPrimaryButton
                                onClick={() => {
                                    // Determine selected color; if transparent, use the hex representation
                                    const selectedColor = isTransparentColor(colorPreview)
                                        ? TRANSPARENT_HEX
                                        : colorPreview;

                                    setShow(false);
                                    setIconColor(selectedColor);

                                    // If selected is transparent (hex), pass the hex value to the parent
                                    if (isTransparentColor(selectedColor)) {
                                        onSelect(TRANSPARENT_HEX);
                                        return;
                                    }

                                    if (isOpacity) {
                                        onSelect({
                                            color: selectedColor,
                                            opacity: opacityBg,
                                        });
                                    } else {
                                        onSelect(selectedColor);
                                    }
                                }}
                               
                            >
                                {APPLY}
                            </RSPrimaryButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

RSColorPicker.propTypes = {
    onSelect: PropTypes.func,
    icon: PropTypes.string,
    tooltipText: PropTypes.string,
    isToolTip: PropTypes.bool,
    isOpacity: PropTypes.bool,
    initColor: PropTypes.string,
    pickerIconColor: PropTypes.string,
    alignRight: PropTypes.bool,
};

export default RSColorPicker;
