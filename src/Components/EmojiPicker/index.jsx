import { circle_smile_medium, editor_circle_smile_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useRef, useState } from 'react';
import Picker from '@emoji-mart/react';
import PropTypes from 'prop-types';
import RSTooltip from 'Components/RSTooltip';

const RSEmojiPicker = ({
    onEmojiSelect,
    wrapperClass,
    iconClass = 'color-primary-blue',
    isTitle = false,
    isTextEditor = false,
    closeOnSelect = false,
    onOpen,
    onClose,
}) => {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState('below');
    const [isInitialized, setIsInitialized] = useState(false);
    const iconRef = useRef();
    const pickerRef = useRef();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialized(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const shouldRenderPicker = isInitialized || show;

   useEffect(() => {
    if (!show) return setPosition('below');

    const updatePosition = () => {
        if (!iconRef.current) return;

        const { top, bottom } = iconRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - bottom;
        const spaceAbove = top;

        setPosition(
            spaceBelow < 400 + (isTextEditor ? 50 : 0) && spaceAbove > spaceBelow
                ? 'above'
                : 'below'
        );
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
    };
}, [show, isTextEditor]);

    useEffect(() => {
        if (!show || !pickerRef.current) return;

        let disposed = false;
        let observer = null;

        const applyTitlesInRoot = (root) => {
            if (!root || !root.querySelectorAll) return;

            const buttons = root.querySelectorAll('button[aria-label][title]');

            buttons.forEach((button) => {
                const aria = button.getAttribute('aria-label') || '';
                const title = button.getAttribute('title') || '';

                if (!aria || !title) return;
                if (aria === title) return;

                if (button.getAttribute('data-emoji-title-count') === 'true') return;
                if (/\(\d+\)\s*$/.test(title)) {
                    button.setAttribute('data-emoji-title-count', 'true');
                    return;
                }

                const charCount = aria.length;
                button.setAttribute('title', `${title} (${charCount})`);
                button.setAttribute('data-emoji-title-count', 'true');
            });
        };

        const attach = () => {
            if (disposed) return;

            const container = pickerRef.current;
            if (!container) return;

            const host = container.querySelector('em-emoji-picker');

            if (!host) {
                applyTitlesInRoot(container);

                if (observer) observer.disconnect();
                observer = new MutationObserver(() => attach());

                try {
                    observer.observe(container, { childList: true, subtree: true });
                } catch (e) {
                }
                return;
            }

            const root = host.shadowRoot || host;

            applyTitlesInRoot(root);

            if (observer) observer.disconnect();
            observer = new MutationObserver(() => applyTitlesInRoot(root));

            try {
                observer.observe(root, { childList: true, subtree: true });
            } catch (e) {
            }

            if (!host.shadowRoot) {
                setTimeout(attach, 50);
            }
        };

        const timeoutId = setTimeout(attach, 0);

        return () => {
            disposed = true;
            clearTimeout(timeoutId);
            if (observer) observer.disconnect();
        };
    }, [show]);



    return (
        <div className={`rs-emoji-picker-wrapper position-relative lh0 ${wrapperClass}`}>
            <RSTooltip text="Emoji" className="lh0">
                <i
                    className={` ${
                        isTextEditor ? `${editor_circle_smile_medium}` : `${circle_smile_medium}`
                    } icon-md ${iconClass}`}
                    onMouseDown={(e) => {
                        if (isTextEditor) e.preventDefault();
                    }}
                    onClick={(e) => {
                        const newShow = !show;
                        setShow(newShow);
                        if (newShow && onOpen) {
                            onOpen();
                        } else if (!newShow && onClose) {
                            onClose();
                        }
                    }}
                    ref={iconRef}
                    //title={isTitle ? '' : 'Emoji'}
                    id="rs_RSEmojiPicker_Emoji"
                />
            </RSTooltip>
            {shouldRenderPicker && (
                <div 
                    ref={pickerRef}
                    className={`rs-emoji-picker rs-emoji-picker-${position}`}
                    style={{ display: show ? 'block' : 'none' }}
                >
                    <Picker
                        onClickOutside={(e) => {
                            if (show && iconRef.current && !iconRef.current.contains(e.target) && 
                                pickerRef.current && !pickerRef.current.contains(e.target)) {
                                setShow(false);
                                if (onClose) {
                                    onClose();
                                }
                            }
                        }}
                        previewPosition={'none'}
                        onEmojiSelect={(emoji) => {
                            if (closeOnSelect) setShow(false);
                            onEmojiSelect(emoji);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

RSEmojiPicker.propTypes = {
    onEmojiSelect: PropTypes.func.isRequired,
    isInsideTextEditor: PropTypes.bool,
    iconClass: PropTypes.string,
    wrapperClass: PropTypes.string,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
};

export default memo(RSEmojiPicker);
