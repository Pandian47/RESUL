import { useFormContext } from 'react-hook-form';
import { memo } from 'react';
import { FORM_IMAGE_CONFIG } from '../../constant';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';

const Image = ({ index, labelName, mandatory, preview }) => {
    const { control } = useFormContext();

    return (
        <div className={`${preview ? 'fbc-preview' : 'form-builder-component'}`}>
            <RSEditorPopup
                name={`formGenerator[${index}].tinyMceLable`}
                control={control}
                initialValue={labelName}
                init={FORM_IMAGE_CONFIG}
                disabled={preview}
            />
        </div>
    );
};

export default memo(Image);
