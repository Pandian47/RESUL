import { useState } from 'react';
import PropTypes from 'prop-types';

const RSInputWithIcon = (props) => {
    const {
        errorMessage,
        name,
        register = () => {},
        validationSchema = {},
        isForm = false,
        icon,
        viewEye,
        ...rest
    } = props;
    const [eyeShow, setEyeShow] = useState(false);
    const [type, setType] = useState(props.type);
    return (
        <div className="position-relative">
            {errorMessage && <div className="validation-message">{errorMessage}</div>}
            <div className="input-wrapper">
                {isForm ? (
                    <input {...register(name, validationSchema)} {...rest} type={type ? type : 'text'} />
                ) : (
                    <input {...rest} />
                )}
                <div className="inputIcon-wrapper">
                    {icon && <i className={`${icon} inputIcon-icon`}></i>}
                    {viewEye && (
                        <i
                            className={`icon-lg password-icon cursor-pointer ${
                                eyeShow ? 'icon-view-small' : 'icon-view-hide-small'
                            } `}
                            onClick={() => {
                                setType(eyeShow === false ? 'text' : 'password');
                                setEyeShow(!eyeShow);
                            }}
                        ></i>
                    )}
                </div>
            </div>
        </div>
    );
};

RSInputWithIcon.propTypes = {
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
    icon: PropTypes.string,
    register: PropTypes.func,
    isForm: PropTypes.bool,
    validationSchema: PropTypes.object,
};

export default RSInputWithIcon;
