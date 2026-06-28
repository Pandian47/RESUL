export const CLIENT_BRANCH_TYPE_MESSAGES = {
    1: 'Client name already exists in GHQ.',
    2: 'Client name already exists in RHQ.',
    3: 'Client name already exists in LOC.',
};

const CLIENT_BRANCH_SUFFIX = {
    1: 'GHQ',
    2: 'RHQ',
    3: 'LOC',
};

export const getClientBranchTypeMessage = (clientBranchTypeID, clientName = '') => {
    const branch = CLIENT_BRANCH_SUFFIX[clientBranchTypeID];
    if (clientName && branch) {
        return `Client name already exists in ${branch}.`;
    }
    return CLIENT_BRANCH_TYPE_MESSAGES[clientBranchTypeID] || 'Client name already exists.';
};
