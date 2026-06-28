import { circle_close_fill_mini, circle_close_mini } from 'Constants/GlobalConstant/Glyphicons';
import RSIcon from 'Components/RSIcon';

export const getToastCloseButton = ({ closeToast }) => (
    <RSIcon
        className="icon-xs color-primary-blue"
        closeTooltipPosition="left"
        defaultItem={circle_close_mini}
        hoverItem={circle_close_fill_mini}
        customCloseClass="top7 right7"
        onClick={closeToast}
    />
);
/**
 * Checks if value is a valid Date
 * 
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a valid Date
 */
export const isValidDate = (value) => {
  return value instanceof Date && !isNaN(value.getTime());
};

