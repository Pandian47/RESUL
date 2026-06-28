import { useFormContext } from 'react-hook-form';
import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import { TOOLSDATA } from 'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Mail/Tabs/SubscriptionUnsubscription/constants';

const TextEditorMessage = ({ tools = TOOLSDATA(), fieldName }) => {
    const { setValue } = useFormContext();

    return (
        <ResTextEditor
            tools={tools}
            height={200}
            onBlur={(html) => setValue(fieldName, html)}
        />
    );
};

export default TextEditorMessage;
