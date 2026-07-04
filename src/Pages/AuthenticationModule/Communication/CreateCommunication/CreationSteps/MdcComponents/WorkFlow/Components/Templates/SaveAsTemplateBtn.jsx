import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import Icon from 'Components/Icon/Icon';
import { useContext } from 'react';
import CreateWorkFlowContext from '../../context';

const SaveAsTemplateBtn = ({ showSaveAsTemplate }) => {
    const { canvasState } = useContext(CreateWorkFlowContext);
    return (
        <>
            <span className={`tsh-icon-with-label ${canvasState?.nodeState?.length === 0 ? 'click-off' : ''} `} onClick={showSaveAsTemplate}>
                <span className="">Save as new template</span>
                <Icon
                    icon={circle_plus_fill_medium}
                    position="bottom"
                    size="md"
                    color="color-primary-blue"
                    // callBack={showSaveAsTemplate}
                />
            </span>
        </>
    );
};

export default SaveAsTemplateBtn;
