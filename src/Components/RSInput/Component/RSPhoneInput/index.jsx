import PhoneInput from 'react-phone-input-2';
//import 'react-phone-input-2/lib/style.css';

const RSPhoneInput = (props) => {
    const { country, value, onChange, className, errorMessage, required, label, ...rest } = props;
    return (
        <div className="position-relative">
            {errorMessage && <div className="validation-message">{errorMessage}</div>}
            <PhoneInput
                className={`${className} ${required ? 'rs-phone-input-required' : ''}`}
                country={country}
                value={value}
                onChange={(data, value, e) => onChange(data, value, e)}
                specialLabel={
                    <span>
                        {label} {required && <span className="required">*</span>}
                    </span>
                }
                // onChange={phone => this.setState({ phone })}
                {...rest}
            />
        </div>
    );
};

export default RSPhoneInput;
