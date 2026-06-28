import { circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import Icon from 'Components/Icon/Icon';
import RSTooltip from 'Components/RSTooltip';

const NewAttributeBtn = ({ title ='' , handleModalAttribute =() =>{} , show= '', titleClassName = '', iconSize = 'md' }) => {
    return (
        <>
            <span className={`${show} tsh-icon-with-label`}   onClick={handleModalAttribute}>
                <span className = {titleClassName}>{title}</span>
                <RSTooltip text={'Add'} position='top' className='lh0'>
                <Icon
                    icon={circle_plus_medium}
                    position="bottom"
                    size={iconSize}
                    color="primary-color"
                    // callBack={handleModalAttribute}
                />
                </RSTooltip>
            </span>
        </>
    );
};

export default NewAttributeBtn;