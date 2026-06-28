import { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import InputController from './InputController';

const units = ['px', 'auto'];

const WidthHeightLabel = ({ label, value, step = 1, onValueChange, targetName, defaultValue = 100, maxWidth }) => {
  const [selectedUnit, setSelectedUnit] = useState('auto');
  const [inputValue, setInputValue] = useState('');
  const [lastNumericValue, setLastNumericValue] = useState(defaultValue); 


  useEffect(() => {
    if (!value) {
      setSelectedUnit('auto');
      setInputValue('');
      return;
    }

    if (['auto', 'cover', 'contain'].includes(value)) {
      setSelectedUnit(value);
      setInputValue('');
    } else if (value.endsWith('px')) {
      setSelectedUnit('px');
      let numericValue = parseFloat(value);
      if (maxWidth && numericValue > maxWidth) {
        numericValue = maxWidth;
        onValueChange(`${numericValue}px`);
      }
      setInputValue(numericValue);
      setLastNumericValue(numericValue); 
    } else if (value.endsWith('%')) {
      setSelectedUnit('%');
      let numericValue = parseFloat(value);
      setInputValue(numericValue);
      setLastNumericValue(numericValue); 
    } else {
      let numericValue = parseFloat(value);
      if (maxWidth && numericValue > maxWidth) {
        numericValue = maxWidth;
        onValueChange(`${numericValue}px`);
      }
      setInputValue(numericValue);
      setLastNumericValue(numericValue); 
    }
  }, [value, maxWidth]);

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    setSelectedUnit(newUnit);

    if (['auto', 'cover', 'contain'].includes(newUnit)) {
      setInputValue('');
      onValueChange(newUnit);
    } else {
      let fallbackValue = inputValue || lastNumericValue || defaultValue; 
      if (!inputValue && selectedUnit === 'auto' && newUnit === 'px') {
        fallbackValue = 100;
      }
      if (newUnit === 'px' && maxWidth && fallbackValue > maxWidth) {
        fallbackValue = maxWidth;
      }
      setInputValue(fallbackValue);
      setLastNumericValue(fallbackValue); 
      onValueChange(`${fallbackValue}${newUnit}`);
    }
  };

  const handleValueChange = (target, change) => {
    let newValue = (parseFloat(inputValue) || 0) + change;
    if (selectedUnit === 'px' && maxWidth) {
      newValue = Math.min(newValue, maxWidth);
    }
    newValue = Math.max(newValue, 0);
    setInputValue(newValue);
    setLastNumericValue(newValue);
    onValueChange(`${newValue}${selectedUnit}`);
  };

  const handleInputChange = (target, newValue) => {
    let numericValue = parseFloat(newValue);
    if (selectedUnit === 'px' && maxWidth) {
      numericValue = Math.min(numericValue, maxWidth);
    }
    numericValue = Math.max(numericValue, 0);
    setInputValue(numericValue);
    setLastNumericValue(numericValue); 
    onValueChange(`${numericValue}${selectedUnit}`);
  };

  return (
    <div className="d-flex align-items-center gap-3 items-select-dropdown">
      <Form.Label>{label}</Form.Label>
      <div>
        {['px', '%'].includes(selectedUnit) && (
          <InputController
            targetname={targetName}
            value={inputValue}
            step={step}
            onValueChange={handleValueChange}
            onChange={handleInputChange}
            maxWidth={selectedUnit === 'px' ? maxWidth : undefined}
          />
        )}
      </div>
      <Form.Select value={selectedUnit} onChange={handleUnitChange}>
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

export default WidthHeightLabel;