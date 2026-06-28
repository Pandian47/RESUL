import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import EditorEmojiPicker from '../../../../Component/EmojiPicker';
import Personalize from '../../../../Component/Personalize';
import SmartLink from '../../../../Component/SmartLink/SmartLink';
import InsertOffer from '../../../../Component/InsertOffer';
import InsertTemplate from '../../../../Component/InsertTemplate';
import MessagingPreview from '../../../../Component/MessagingPreview';

const WebTextEditor = () => (
    <ResTextEditor
        tools={[Personalize, EditorEmojiPicker, SmartLink, InsertOffer, InsertTemplate, MessagingPreview]}
        height={200}
    />
);

export default WebTextEditor;
