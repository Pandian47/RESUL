import { Form } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';

const PositionControllerWithLabel = ({ label, options, name, selectedValue, onChange, className }) => {
    return (
        <div className={`input-controller-label-conatiner ${className}`}>
            <Form.Label className="m-0">
                {label}
            </Form.Label>
            <div className="radio-controller-container" role="group" aria-label={label}>
                {options.map((option) => (
                    <input
                        style={{ cursor: 'pointer' }}
                        key={option.value}
                        type="radio"
                        className="btn-check"
                        name={name}
                        id={`${name}-${option.value}`}
                        autoComplete="off"
                        checked={selectedValue === option.value}
                        onChange={() => onChange(option.value)}
                    />
                ))}
                {options.map((option, index) => {
                    const includeclass =
                        index === 0
                            ? 'e2e-alignment-left'
                            : index === options?.length - 1
                            ? 'e2e-alignment-right'
                            : 'e2e-alignment-center';
                    return (
                        <label
                            key={option.value}
                            style={{ cursor: 'pointer' }}
                            className={`ue-button-button ${includeclass} ${
                                selectedValue === option.value ? 'active-label' : ''
                            }`}
                            htmlFor={`${name}-${option.value}`}
                        >
                            <RSTooltip
                                text={option.tooltipText}
                                className="lh0"
                                // tooltipOverlayClass={tooltipOverlayClassZindex ? `toolTipOverlayZindexCSS` : ''}
                            >
                                {option.icon && <i className={option.icon}></i>}
                            </RSTooltip>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default PositionControllerWithLabel;
