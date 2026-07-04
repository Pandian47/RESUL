import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSTooltip from 'Components/RSTooltip';
 
const RSDropdownFooterBtn = ({ title='category', handleClick= ()=>{} }) => {
    return (
        <span className="tsh-icon-with-label dropdown-footer-item cp" onClick={handleClick}>
            <span className="">{title}</span>
            <RSTooltip text={'Add'} position='top' className='lh0'>
                <i
                    className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                />
            </RSTooltip>
        </span>
    );
};
 
export default RSDropdownFooterBtn;