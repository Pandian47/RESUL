import { minus_mini, plus_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
const InputController = ({
  targetname,
  value,
  step,
  onValueChange,
  className = '',
  onChange,
  inputType = 'number',
  readOnly = false,
  maxWidth, 
}) => {

  const [localValue, setLocalValue] = useState(parseInt(value));
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleChange = (e) => {
    let newValue = Number(e.target.value);
    if (maxWidth !== undefined) {
      newValue = Math.min(newValue, maxWidth); 
    }
    newValue = Math.max(newValue, 0); 
    setLocalValue(newValue);
  };

  const handleBlur = (e) => {
    let newValue = Number(e.target.value);
    if (maxWidth !== undefined) {
      newValue = Math.min(newValue, maxWidth); 
    }
    newValue = Math.max(newValue, 0); 
    setLocalValue(newValue);
    onChange(targetname, newValue);
    setForceUpdate((prev) => prev + 1);
  };

  const handleIncrement = () => {
    let currentValue = Number(localValue) || 0;    
    if (maxWidth !== undefined && currentValue >= maxWidth) {
      return;
    }
  
    let newValue = currentValue + step;  
    if (maxWidth !== undefined) {
      newValue = Math.min(newValue, maxWidth);
    }
  
    newValue = Math.max(newValue, 0);  
    setLocalValue(newValue);
    onValueChange(targetname, newValue - currentValue); 
  };
  

  const handleDecrement = () => {
    let currentValue = Number(localValue) || 0; 
    if (currentValue <= 0) {
      return; 
    }  
    let newValue = currentValue - step;
    newValue = Math.max(newValue, 0);  
    setLocalValue(newValue);
    onValueChange(targetname, newValue - currentValue); 
  };
  

  useEffect(() => {
    let newValue = Number(value);
    if (maxWidth !== undefined) {
      newValue = Math.min(newValue, maxWidth); 
    }
    newValue = Math.max(newValue, 0); 
    setLocalValue(newValue);
  }, [value, maxWidth, forceUpdate]);

  return (
    <div className={`${className}`}>
      <div className="input-controller-container">
        <div className="ue-button-input">
          <button className="ue-button-button minus" onClick={handleDecrement}>
            <i className={`${minus_mini} icon-xs`} />
          </button>
        </div>
        <input
          type={inputType}
          id={targetname}
          value={localValue}
          readOnly={readOnly}
          onChange={handleChange}
          onBlur={handleBlur}
          className="ue-controller-input"
        />
        <div className="ue-button-input">
          <button className="ue-button-button plus" onClick={handleIncrement}>
            <i className={`${plus_mini} icon-xs`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputController;