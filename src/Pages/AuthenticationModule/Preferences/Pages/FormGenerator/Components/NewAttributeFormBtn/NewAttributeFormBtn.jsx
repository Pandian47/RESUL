import { circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import Icon from 'Components/Icon/Icon';

const NewAttributeFormBtn = ({ title , handleModalAttribute }) => {
    return (
        <>
            <span className="tsh-icon-with-label"  onClick={handleModalAttribute}>
                <span className="">{title}</span>
                <Icon
                    icon={circle_plus_medium}
                    size="md"
                    color="primary-color"
                    tooltip='Add'
                    // callBack={handleModalAttribute}
                />
            </span>
        </>
    );
};

export default NewAttributeFormBtn;