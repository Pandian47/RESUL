import Proptypes from 'prop-types';

const RSCheckbox = (props) => {
    const {
        errorMessage = '',
        type = 'checkbox',
        name = '',
        className = '',
        labelName = '',
        children,
        onChange,
        checked = false,
        containerClass,
        disabledchk = false,
        spanlabelClassName = '',
        ...rest
    } = props;
    return (
        <div className={`position-relative ${!!errorMessage ? 'errorContainerCheckbox' : ''} ${containerClass}`}>
            {errorMessage && <div className="validation-message">{errorMessage}</div>}
            <div className={`${type == 'checkbox' ? 'checkbox-wrapper' : 'radio-wrapper'}`}>
                <label htmlFor={name}>
                    <input
                        type={type}
                        name={name}
                        checked={checked}
                        id={name}
                        className="checkbox"
                        onChange={(e) => props.onChange(e.target.checked)}
                        {...rest}
                    />
                    {/* <span className={props.className}>{props.labelName}</span> */}
                    {/* <span className={`${className} lbl`}>{labelName}</span> */}
                    <span className={`${className} lbl d-flex align-items-center ${disabledchk}`}>
                        {/* <i className={`${checked ? 'icon-rs-checkbox-mini color-primary-green' : ''}`}></i>{' '} */}
                        <span className={`${spanlabelClassName}`}>{labelName}</span>
                    </span>
                    {children}
                </label>
            </div>
        </div>
    );
};

RSCheckbox.propTypes = {
    checked: Proptypes.bool.isRequired,
    errorMessage: Proptypes.string.isRequired,
    type: Proptypes.string,
    name: Proptypes.string,
    className: Proptypes.string,
    containerClass: Proptypes.string,
    labelName: Proptypes.string.isRequired,
};

export default RSCheckbox;
