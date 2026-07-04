import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { get, isNil } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';

import RSPPophover from 'Components/RSPPophover';
import RSTooltip from 'Components/RSTooltip';
import { truncateTitle } from 'Utils/modules/displayCore';

const RSRadioButton = ({
    type = 'radio',
    className = '',
    radio_wrapper_class = '',
    name,
    id,
    isNewTheme,
    rules,
    control,
    defaultValue,
    labelName,
    labelIcon = '',
    children,
    handleChange = () => {},
    isName = false,
    popover = false,
    required,
    isError = true,
    isLabel = true,
    popover_position = 'top',
    popover_icon = `${circle_question_mark_mini} icon-xs color-primary-blue`,
    popover_content,
    popover_overlayClass,
    popover_class = '',
    disabled = false,
    labelIconContainer = false,
    labelImg,
    customLabel = false,
    labelImgName,
    truncateName = false,
    sliceStartNo = 1,
    showLabelName = false,
    customLabelclassName='',
    customSpanClassname='',
    isSplitABScheduler=false,
    ...rest
}) => {
    const controllerProps = useMemo(() => {
        return defaultValue !== undefined ? { defaultValue } : {};
    }, [defaultValue]);

    return (
        <Controller
            rules={rules}
            control={control}
            name={name}
            {...controllerProps}
            render={({ field: { onChange, value, ...restField }, fieldState: { error } }) => {
                const _isEmpty = get(error, 'message', '')?.length > 0;
                return (
                    <div
                        className={`${
                            _isEmpty ? 'errorContainer' : ''
                        } ${radio_wrapper_class} rs-radio-wrapper ${isSplitABScheduler ? '': 'position-relative'} ${
                            popover ? 'rs-popover-enabled' : ''
                        }`}
                    >
                        {_isEmpty && isError && <div className="validation-message">{get(error, 'message', '')}</div>}
                        <div className={`radio-wrapper align-items-center d-flex`}>
                            <label htmlFor={id} className={`${showLabelName ? 'mr0' : ''} ${customLabelclassName}`}>
                                <input
                                    {...restField}
                                    onChange={(e) => {
                                        handleChange(e);
                                        onChange(e.target.value);
                                    }}
                                    type={type}
                                    id={id}
                                    checked={
                                        !isNil(defaultValue)
                                            ? defaultValue === (labelName || labelImgName)
                                            : value === (labelName || labelImgName)
                                    }
                                    value={labelName || labelImgName}
                                    className={`radio ${className}`}
                                    disabled={disabled}
                                    {...rest}
                                />
                                <span
                                    className={`${className} ${
                                        truncateName ? 'align-items-center d-flex position-relative top-15' : ''
                                    } lbl d-flex align-items-center ${disabled ? 'color-secondary-grey' : ''} ${customSpanClassname}`}
                                >
                                    {labelIconContainer && <i className={labelIcon} />}
                                    {isLabel && customLabel ? (
                                        <>
                                            <i className="d-none">{labelName?.slice(0, sliceStartNo)}</i>
                                            {truncateName && (
                                                <RSTooltip text={labelName?.slice(sliceStartNo, labelName?.length)}>
                                                    <span>
                                                        {truncateTitle(
                                                            labelName?.slice(sliceStartNo, labelName?.length),
                                                            25,
                                                        )}
                                                    </span>
                                                </RSTooltip>
                                            )}
                                        </>
                                    ) : (
                                        <span className={`${showLabelName ? 'd-none' : ''}`}>{labelName}</span>
                                    )}
                                    {labelImg && labelImg}
                                </span>
                                {children}
                            </label>
                            {popover && (
                                <RSPPophover
                                    position={popover_position}
                                    pophover={popover_content}
                                    popover_overlay_class={popover_overlayClass}
                                >
                                    <i className={popover_icon + ' ' + popover_class}></i>
                                </RSPPophover>
                            )}
                        </div>
                    </div>
                );
            }}
        />
    );
};

RSRadioButton.propTypes = {
    name: PropTypes.string.isRequired,
    control: PropTypes.object.isRequired,
    radio_wrapper_class: PropTypes.string,
    className: PropTypes.string,
    clearErrors: PropTypes.func,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    rules: PropTypes.object,
    setError: PropTypes.func,
    setValue: PropTypes.func,
    required: PropTypes.bool,
    type: PropTypes.string,
    labelName: PropTypes.string,
    labelIcon: PropTypes.string,
    handleChange: PropTypes.func,
    isName: PropTypes.bool,
    popover: PropTypes.bool,
    popover_class: PropTypes.string,
    popover_icon: PropTypes.string,
    popover_content: PropTypes.string,
    popover_position: PropTypes.string,
    isError: PropTypes.bool,
    disabled: PropTypes.bool,
    labelIconContainer: PropTypes.bool,
    isLabel: PropTypes.bool,
    customLabel: PropTypes.bool,
    truncateName: PropTypes.bool,
    customLabelclassName: PropTypes.string,
    customSpanClassname:PropTypes.string
};

export default memo(RSRadioButton);
