import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo } from 'react';
import './resCheckbox.scss';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import RSPPophover from 'Components/RSPPophover';
import ResTooltip from '../ResTooltip';
import { truncateTitle } from 'Utils/modules/displayCore';
import { RES_COMPONENT_CLASS } from '../../kendoDocsVariables';

const ResCheckbox = ({
    className = '',
    name,
    rules,
    control,
    defaultValue = false,
    labelName,
    children,
    handleChange = () => {},
    popover = false,
    inlineFlex = false,
    popover_position = 'top',
    popover_icon = `${circle_question_mark_mini} icon-xs color-primary-blue`,
    popover_content,
    popover_class = '',
    popover_overlayClass = '',
    containerClass = '',
    labelClass = '',
    isError = true,
    disabledchk = false,
    disabled = false,
    spanlabelClassName = '',
    isDynamic = false,
    truncateName = false,
    optiontexttruncateCount = 15,
    hideTooltipOnScroll = false,
    ...rest
}) => (
    <Controller
        rules={rules}
        control={control}
        name={name}
        defaultValue={defaultValue ?? false}
        render={({ field: { onChange, ...restField }, fieldState: { error } }) => {
            const _isEmpty = _get(error, 'message', '')?.length > 0;
            return (
                <div
                    className={`${RES_COMPONENT_CLASS.checkbox} ${_isEmpty ? 'errorContainerCheckbox' : ''} position-relative ${
                        popover ? 'rs-popover-enabled' : ''
                    } ${containerClass}`}
                >
                    {_isEmpty && isError && (
                        <div className="validation-message">{_get(error, 'message', '')}</div>
                    )}
                    <div className="checkbox-wrapper">
                        <label
                            htmlFor={name}
                            className={`${labelClass} ${
                                inlineFlex ? 'd-inline-flex' : 'd-flex'
                            } align-items-center`}
                        >
                            <input
                                {...restField}
                                onChange={(e) => {
                                    handleChange(e);
                                    onChange(e.target.checked);
                                }}
                                type="checkbox"
                                name={name}
                                id={name}
                                checked={!!restField.value}
                                disabled={disabledchk || disabled}
                                className={`checkbox ${className}`}
                                {...rest}
                            />
                            <span
                                className={`${className} lbl d-flex align-items-center ${
                                    disabledchk || disabled ? 'disable-cls' : ''
                                }`}
                            >
                                <span className="res-checkbox-icon" aria-hidden="true">
                                    <svg viewBox="0 0 15 15" focusable="false">
                                        <rect
                                            className="res-checkbox-box"
                                            x="1"
                                            y="1"
                                            width="13"
                                            height="13"
                                        />
                                        <g className="res-checkbox-tick-layer">
                                            <polygon
                                                className="res-checkbox-tick-outline"
                                                points="4.2 6.8 2.7 8.3 6.7 12.3 15.7 1.2 14.3 -.2 6.7 9.2 4.2 6.8"
                                            />
                                            <polygon
                                                className="res-checkbox-tick"
                                                points="4.2 6.8 2.7 8.3 6.7 12.3 15.7 1.2 14.3 -.2 6.7 9.2 4.2 6.8"
                                            />
                                        </g>
                                    </svg>
                                </span>
                                {truncateName ? (
                                    <ResTooltip
                                        position="top"
                                        text={labelName}
                                        innerContent={false}
                                        className={spanlabelClassName}
                                        show={hideTooltipOnScroll ? false : undefined}
                                    >
                                        <h4 className="truncate224 mb0">
                                            {labelName?.length > optiontexttruncateCount
                                                ? truncateTitle(labelName, optiontexttruncateCount)
                                                : labelName}
                                        </h4>
                                    </ResTooltip>
                                ) : (
                                    <span className={spanlabelClassName}>{labelName}</span>
                                )}
                            </span>
                            {children}
                        </label>
                        {isDynamic ? <span className="color-primary-red ml-5 mr5">*</span> : null}
                        {popover && (
                            <RSPPophover
                                popover_overlay_class={popover_overlayClass}
                                position={popover_position}
                                pophover={popover_content}
                            >
                                <i className={`${popover_icon} ${popover_class}`} />
                            </RSPPophover>
                        )}
                    </div>
                </div>
            );
        }}
    />
);

ResCheckbox.propTypes = {
    name: PropTypes.string.isRequired,
    control: PropTypes.object.isRequired,
    className: PropTypes.string,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    rules: PropTypes.object,
    isDynamic: PropTypes.bool,
    labelName: PropTypes.string,
    handleChange: PropTypes.func,
    popover: PropTypes.bool,
    popover_class: PropTypes.string,
    popover_overlayClass: PropTypes.string,
    popover_icon: PropTypes.string,
    popover_content: PropTypes.string,
    popover_position: PropTypes.string,
    containerClass: PropTypes.string,
    labelClass: PropTypes.string,
    isError: PropTypes.bool,
    disabledchk: PropTypes.bool,
    disabled: PropTypes.bool,
    truncateName: PropTypes.bool,
    optiontexttruncateCount: PropTypes.number,
    hideTooltipOnScroll: PropTypes.bool,
    inlineFlex: PropTypes.bool,
    children: PropTypes.node,
};

export default memo(ResCheckbox);
