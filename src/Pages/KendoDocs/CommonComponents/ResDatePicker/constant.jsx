import { calendar_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ToggleButton } from '@progress/kendo-react-dateinputs';
const CustomIcon = (props) => {
    return (
        <ToggleButton {...props} data-rs-datepicker-toggle-button="true">
            <span className={`${calendar_medium} icon-md color-primary-blue`} id='rs_data_calendar'/>
        </ToggleButton>
    );
};
export default CustomIcon;
