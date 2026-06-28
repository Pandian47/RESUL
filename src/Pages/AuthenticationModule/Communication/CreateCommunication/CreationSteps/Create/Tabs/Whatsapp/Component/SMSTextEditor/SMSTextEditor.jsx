import { useFormContext } from 'react-hook-form';
import TextEditor from 'Components/TextEditor';
import Personalize from '../../../../Component/Personalize';
import SmartLink from '../../../../Component/SmartLink/SmartLink';
import EditorEmojiPicker from '../../../../Component/EmojiPicker';
import InsertOffer from '../../../../Component/InsertOffer/index';
import MessagingPreview from '../../../../Component/MessagingPreview';

const SMSTextEditor = ({ fieldname = 'editorText' }) => {
    const { setValue, getValues, clearErrors } = useFormContext();

    return (
        <>
            <TextEditor
                tools={[Personalize, EditorEmojiPicker, SmartLink, InsertOffer, MessagingPreview]}
                onBlurHandler={(e) => {
                    setValue(fieldname, e);
                    clearErrors(fieldname);
                }}
                defaultContent={getValues(fieldname)}
            />
            <small>SMS/audience count may vary if the content has any multilingual/unicode content.</small>
        </>
    );
};

export default SMSTextEditor;
