export const getCompletionStatus = (index, lastIndex) => {
    let tempIndex= lastIndex===-1?1  : lastIndex;
    
    if (index < tempIndex) return 'completed';
    else if (index === tempIndex) return 'active';
    else if (tempIndex ===-1) return 'active';
    return '';
};

const mapCompletionToStepStatus = (legacyStatus) => {
    if (legacyStatus === 'completed') return 'completed';
    if (legacyStatus === 'active') return 'inprogress';
    return '';
};

export const buildCompanyProgressSteps = (stepsList, currentPageName) => {
    const lastUpdate = stepsList.findIndex((item) => item.name === currentPageName);
    return stepsList.map((item, index) => ({
        step: index + 1,
        stepTitle: item.title,
        status: mapCompletionToStepStatus(getCompletionStatus(index, lastUpdate)),
    }));
};