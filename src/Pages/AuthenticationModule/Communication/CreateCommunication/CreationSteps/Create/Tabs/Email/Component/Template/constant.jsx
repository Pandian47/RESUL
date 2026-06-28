import TemplateGridView from './Component/TemplateGridview';
 
const ALL_TEMPLATES = 'All templates';
const MY_TEMPLATES = 'My templates';
export const tabData = (
    type,
    setPayload,
    payload,
    categoriesData,
    userId,
    handleCategories,
    onSelect,
    channelId,
    isSplit = false,
    fieldName = '',
    categoriesLoading = false,
) => [
    {
        id: 0,
        text: ALL_TEMPLATES,
        component: () => (
            <TemplateGridView
                text={ALL_TEMPLATES}
                id={1}
                channelId={channelId}
                type={type}
                setPayload={setPayload}
                payload={payload}
                categories={categoriesData}
                categoriesLoading={categoriesLoading}
                userId={userId}
                handleCategories={handleCategories}
                onSelect={onSelect}
                isSplit={isSplit}
                fieldName={fieldName}
            />
        ),
    },
    {
        id: 1,
        text: MY_TEMPLATES,
        component: () => (
            <TemplateGridView
                text={MY_TEMPLATES}
                id={2}
                channelId={channelId}
                type={type}
                setPayload={setPayload}
                payload={payload}
                categories={categoriesData}
                categoriesLoading={categoriesLoading}
                userId={userId}
                handleCategories={handleCategories}
                onSelect={onSelect}
                isSplit={isSplit}
                fieldName={fieldName}
            />
        ),
    },
];

export const currentSplitName = (index) => {
    let splitConfig ={
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D'
    }
   return splitConfig[index] ?? 'A'
}

export const getSplitIndex = (value) => {
    let splitConfig = {
        A: 0,
        B: 1,
        C: 2,
        D: 3
    }

    return splitConfig[value]
}