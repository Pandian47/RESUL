import { calendar_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ToggleButton } from '@progress/kendo-react-dateinputs';
const CustomIcon = (props) => (
    <ToggleButton {...props}>
        <span className={`${calendar_medium} icon-md color-primary-blue`} id="rs_datetime_calendar" />
    </ToggleButton>
);

export default CustomIcon;
