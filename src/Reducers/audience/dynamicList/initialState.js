const initialState = {
    dynamicListName: '',
    dynamicListID: '',
    departmentID: '',
    ruleCondition1: '',
    exclusionCondition: '',
    ruleGroup1: {},
    ruleGroup2: {},
    ruleGroup3: {},
    approvalList: {
        name: [],
        requestApproval: false,
        approvalFrom: '',
        approvalCount: '',
        followHierarchy: false,
    },

    triggerAttributes: [],
    triggerBaseDDL: [],
    attributeValues: {},
    dynamicListInfo: {},
    listLoading: false,
    listFailure: false,
    triggerSourceData: [],
    // existing_name: false,
};

export default initialState;
