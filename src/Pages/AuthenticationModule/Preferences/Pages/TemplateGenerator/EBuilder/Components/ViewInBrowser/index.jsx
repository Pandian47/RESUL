import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import { useFormContext } from 'react-hook-form';
import { BODYCONFIG } from '../../../EmailBuilder/Pages/CreatNewTemplates/Components/InputControls/Constants';

const ViewInBrowser = () => {

  const {control} = useFormContext()

    return (
        <div>
            <RSEditorPopup
                name={`ViewInBrowser`}
                control={control}
                initialValue={' Email not display correctly ? View in browser'}
                init={BODYCONFIG}
            />
        </div>
    );
};

export default ViewInBrowser;
