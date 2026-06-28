import { memo } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { close_medium } from 'Constants/GlobalConstant/Glyphicons';

const RSPPophover = ({
    position = 'top',
    text,
    className = '',
    popover_overlay_class = '',
    image,
    children,
    pophover,
    imgClass = '',
    trigger = 'click',
    closeButton = false,
    customText = '',
}) => {
    return (
        <OverlayTrigger
            trigger={trigger}
            placement={position}
            rootClose
            overlay={
                <Popover
                    className={`res-pophover ${popover_overlay_class} ${text?.length ? 'phover-text' : ''} ${
                        image ? `phover-img` : ''
                    } ${className ? className : ''} rs-popover-${position}`}
                >
                    {closeButton && (
                        <i
                            className={`${close_medium} float-end fs23 text-white`}
                            onClick={() => document.body.click()}
                        />
                    )}
                    {text && (
                        <Popover.Body>
                            {/* <small>{text}</small> */}
                            {text}
                        </Popover.Body>
                    )}
                    {customText && (
                        <Popover.Body>
                            <div dangerouslySetInnerHTML={{ __html: customText }} />
                        </Popover.Body>
                    )}
                    {image && (
                        <Popover.Body>
                            <img src={image} alt="" className={imgClass ? imgClass : ''} />
                        </Popover.Body>
                    )}
                    {pophover && <Popover.Body className="multi-column">{pophover}</Popover.Body>}
                </Popover>
            }
        >
            {children}
        </OverlayTrigger>
    );
};

RSPPophover.propTypes = {
    position: PropTypes.string,
    text: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.object]),
    className: PropTypes.string,
    popover_overlay_class: PropTypes.string,
    image: PropTypes.string,
    children: PropTypes.object,
    pophover: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    imgClass: PropTypes.string,
    trigger: PropTypes.string,
    closeButton: PropTypes.bool,
};

export default memo(RSPPophover);
