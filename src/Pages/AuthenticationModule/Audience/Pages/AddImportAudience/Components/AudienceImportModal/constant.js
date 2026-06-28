const getAudienceStatus = (audienceMode) => {
    if (audienceMode === 'manual entry' || audienceMode === 'csv') {
        return true;
    }
};

export { getAudienceStatus };
