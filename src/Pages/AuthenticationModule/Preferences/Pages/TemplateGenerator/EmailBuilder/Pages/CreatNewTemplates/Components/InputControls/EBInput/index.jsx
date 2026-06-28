import { useFormContext } from 'react-hook-form';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import { BODYCONFIG } from '../Constants';

const EBInput = ({ index }) => {
    const { control,watch} = useFormContext();
    const data = watch()

        return (
        <div>
            {/* <RSTinyMceInlineEditor
                name={`eb[${index}]text`}
                control={control}
                initialValue={'Your text here.'}
                init={BODYCONFIG}
                // onNodeChange={onNodeChange}
            /> */}
            <RSEditorPopup
                name={`ebText[${index}]`}
                control={control}
                initialValue={'lewwe'}
                init={BODYCONFIG}
            />
        </div>
    );
};

export default EBInput;
