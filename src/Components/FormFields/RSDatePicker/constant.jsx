import { calendar_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ToggleButton } from '@progress/kendo-react-dateinputs';
const CustomIcon = (props) => {
    return (
        <ToggleButton {...props}>
            <span className={`${calendar_medium} icon-md color-primary-blue`} id='rs_data_calendar'/>
        </ToggleButton>
    );
};
export default CustomIcon;
