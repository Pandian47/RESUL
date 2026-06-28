import { memo, useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import { BODYCONFIG } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import '../../FormGenerator.scss';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';

const Text = ({ index, labelName, preview, name, init, isCustomWidthAdjust = false }) => {
    const { control, clearErrors } = useFormContext();
    const { tag } = useContext(FormGeneratorContext);

    let nameCheck = `formGenerator[${index}].tinyMceLableMain`;
    let nameSet = name === 'defalutText' ? nameCheck : name;

    const handleEditorChange = (value) => {
                clearErrors(nameSet);
    };

    return (
        <div className={`textForm ${preview ? 'fbc-preview' : 'form-builder-component'}`}>
            <div className="rs-form-element-wrapper">
                <div className="text-editor-container" style={{ width: '100%' }}>
                    <RSEditorPopup
                        name={nameSet ?? `formGenerator[${index}].tinyMceLableMain`}
                        //  name={name}
                        control={control}
                        initialValue={labelName}
                        init={BODYCONFIG}
                        disabled={preview}
                        minChars={tag === 'Survey' ? 3 : 3}
                        maxChars={120}
                        handleChange={handleEditorChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(Text);
