import { Form } from "react-bootstrap";
import InputController from "./InputController";

const InputControllerWithLabel = ({
  label,
  targetname,
  value,
  step,
  onValueChange,
  className = "",
  onChange,
  inputType = "number",
  readOnly = false,
  maxWidth
}) => {
  return (
    <div className={`input-controller-label-conatiner mt-4 ${className}`}>
      <Form.Label className="m-0">
        {label}
      </Form.Label>
      <InputController
        targetname={targetname}
        value={value}
        step={step}
        onValueChange={onValueChange}
        onChange={onChange}
        className={className}
        inputType={inputType}
        readOnly={readOnly}
        maxWidth={maxWidth}
      />
    </div>
  );
};

export default InputControllerWithLabel;
