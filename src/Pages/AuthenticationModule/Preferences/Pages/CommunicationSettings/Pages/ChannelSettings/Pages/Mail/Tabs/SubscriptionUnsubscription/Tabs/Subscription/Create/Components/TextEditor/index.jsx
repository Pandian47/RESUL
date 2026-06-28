import { useFormContext } from 'react-hook-form';
import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import { TOOLSDATA } from 'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Mail/Tabs/SubscriptionUnsubscription/constants';

const TextEditor = ({ textErr }) => {
    const { setValue } = useFormContext();

    return (
        <div className="mt20">
            <p className="color-primary-red">{textErr ? 'Enter text' : ''}</p>
            <ResTextEditor
                tools={TOOLSDATA()}
                height={200}
                onBlur={(html) => setValue('text', html)}
            />
        </div>
    );
};

export default TextEditor;
