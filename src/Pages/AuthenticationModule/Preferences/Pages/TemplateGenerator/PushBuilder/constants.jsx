import PushBuiderMyTemplates from './Pages/MyTemplates';
import PushBuiderCreatNewTemplates from './Pages/CreatNewTemplates/CreateNewTemplate';
import { TemplateBlank1, TemplateBlank2, TemplateBlank3, TemplateBlank4 } from 'Assets/Images';

const ALL_TEMPLATES = 'All templates';
const MY_TEMPLATES = 'My templates';
const CREATE_NEW_TEMPLATES = 'Create new templates';

const tabData = (payload, setPayload, categoriesData, userId, handleCategories, isLoading) => [
    {
        id: 0,
        text: ALL_TEMPLATES,
        component: () => (
            <PushBuiderMyTemplates
                text={ALL_TEMPLATES}
                id={1}
                payload={payload}
                categories={categoriesData}
                setPayload={setPayload}
                userId={userId}
                handleCategories={handleCategories}
                channelId={payload?.channelId}
                isLoading={isLoading}
            />
        ),
    },
    {
        id: 1,
        text: MY_TEMPLATES,
        component: () => (
            <PushBuiderMyTemplates
                text={MY_TEMPLATES}
                categories={categoriesData}
                id={2}
                payload={payload}
                setPayload={setPayload}
                userId={userId}
                handleCategories={handleCategories}
                channelId={payload?.channelId}
                isLoading={isLoading}
            />
        ),
    },
    {
        id: 2,
        text: CREATE_NEW_TEMPLATES,
        component: () => (
            <PushBuiderCreatNewTemplates
                data={[
                    { name: 'templateBlank1', src: TemplateBlank1, path: 'default1' },
                    { name: 'templateBlank2', src: TemplateBlank2, path: 'default2' },
                    { name: 'templateBlank3', src: TemplateBlank3, path: 'default3' },
                    { name: 'templateBlank4', src: TemplateBlank4, path: 'default4' },
                ]}
                handleCategories={handleCategories}
            />
        ),
    },
];

export { tabData };
