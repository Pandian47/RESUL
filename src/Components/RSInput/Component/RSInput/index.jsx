import PropTypes from 'prop-types';

const RSInput = (props) => {
    const {
        errorMessage,
        register = () => {},
        validationSchema = {},
        name,
        isForm = false,
        onChange,
        value,
        onBlur,
        isNewTheme = true,
        label,
        placeholder,
        ...rest
    } = props;
    return (
        <div className={`rs-input-wrapper ${isNewTheme ? 'rs-input-placeholder-wrapper' : ''}`}>
            {errorMessage && <div className="validation-message">{errorMessage}</div>}
            {isForm ? (
                <input {...register(name, validationSchema)} {...rest} />
            ) : (
                <input
                    {...rest}
                    placeholder={isNewTheme ? ' ' : placeholder}
                    value={value || ''}
                    onChange={(e) => onChange(e)}
                    onBlur={(e) => onBlur && onBlur(e)}
                    // <input {...rest}
                    // value={value|| ""}
                    // onChange={(e) => onChange(e.target.value)}
                    // onBlur={(e) => onBlur&& onBlur(e.target.value, e)}
                />
            )}
            {isNewTheme && (
                <>
                    <label>
                        {placeholder} {rest.required && <span className="required">*</span>}
                    </label>
                </>
            )}
        </div>
    );
};

RSInput.propTypes = {
    type: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    pattern: PropTypes.string,
    errorMessage: PropTypes.string,
    id: PropTypes.string,
    minLength: PropTypes.string,
    maxLength: PropTypes.string,
    register: PropTypes.func,
    isForm: PropTypes.bool,
    validationSchema: PropTypes.object,
    isNewTheme: PropTypes.bool,
    value: PropTypes.any,
};

export default RSInput;
