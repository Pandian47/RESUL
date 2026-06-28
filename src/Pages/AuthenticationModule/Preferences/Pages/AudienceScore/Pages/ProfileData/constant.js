const DATA_ARGUMENTATION = [
    {
        id: 1,
        name: 'ageGroup',
        lable: 'Age group',
    },
    {
        id: 2,
        name: 'gender',
        lable: 'Gender',
    },
    {
        id: 3,
        name: 'income',
        lable: 'Income',
    },

    {
        id: 4,
        name: 'location',
        lable: 'Location',
    },
    {
        id: 5,
        name: 'education',
        lable: 'Education',
    },
];
const OMNI_CHANNEL = [
    {
        id: 1,
        name: 'email',
        lable: 'Email',
    },
    {
        id: 2,
        name: 'sms',
        lable: 'SMS',
    },
    {
        id: 3,
        name: 'whatsApp',
        lable: 'WhatsApp',
    },

    {
        id: 4,
        name: 'facebook',
        lable: 'Facebook',
    },
    {
        id: 5,
        name: 'twitter',
        lable: 'Twitter',
    },
];
const REFERAL_VIRALITY = [
    {
        id: 1,
        name: 'email',
        lable: 'Email',
    },
    {
        id: 2,
        name: 'sms',
        lable: 'SMS',
    },
    {
        id: 3,
        name: 'whatsApp',
        lable: 'WhatsApp',
    },

    {
        id: 4,
        name: 'facebook',
        lable: 'Facebook',
    },
    {
        id: 5,
        name: 'twitter',
        lable: 'Twitter',
    },
];
const NETWORK_WORTH = [
    {
        id: 1,
        name: 'linkedin',
        lable: 'Linkedin',
    },
    {
        id: 2,
        name: 'facebook',
        lable: 'Facebook',
    },

    {
        id: 3,
        name: 'twitter',
        lable: 'Twitter',
    },
    {
        id: 4,
        name: 'instagram',
        lable: 'Instagram',
    },
    {
        id: 5,
        name: 'youtube',
        lable: 'Youtube',
    },
];
const GRADDING = [
    {
        id: 1,
        name: 'email',
        lable: 'Email',
    },
    {
        id: 2,
        name: 'sms',
        lable: 'SMS',
    },
    {
        id: 3,
        name: 'whatsApp',
        lable: 'WhatsApp',
    },

    {
        id: 4,
        name: 'facebook',
        lable: 'Facebook',
    },
    {
        id: 5,
        name: 'twitter',
        lable: 'Twitter',
    },
];
const FREQUENCY_TIME = ['Week', 'Month', 'Quarter', 'Half year'];
const GRADE = ['A', 'B', 'C', 'D', 'E'];

const INITIAL_STATE = {
    defaultValues: {
        dataArguments: {
            // ageGroup: '2',
            // gender: '2',
            // income: '5',
            // location: '2',
            // education: '5',
        },
        omnichannel: {
            // email: '2',
            // sms: '2',
            // whatsApp: '2',
            // facebook: '2',
            // twitter: '2',
        },
        referal: {
            // email: '20',
            // sms: '25',
            // whatsApp: '32',
            // facebook: '12',
            // twitter: '29',
        },
        networkWorth: {
            // linkedin: '2',
            // facebook: '2',
            // twitter: '2',
            // instagram: '2',
            // youtube: '2',
        },
        networkWorthAbove: {
            // linkedin: '50',
            // facebook: '50',
            // twitter: '50',
            // instagram: '50',
            // youtube: '50',
        },
        gradingAboveScore: 'B',
        gradingBelowScore: 'C',
        gradingAbove: '50',
        gradingBelow: '10',
        gradingFromOne: '40',
        gradingToOne: '30',
        gradingFromTwo: '40',
        gradingToTwo: '20',
        gradingScoreOne: 'D',
        gradingScoreTwo: 'C',
        dataArgumentsTotal: '10',
        omnichannelTotal: '10',
        referalTotal: '10',
        networkWorthTotal: '10',
    },
    mode: 'onTouched',
};

export const updateName = (name) => {
    const updatedName = name?.toLowerCase()?.replaceAll(/\s+/g, '');
    return updatedName;
};

const handleSegementName = (name) => {
    const segmentMap = {
        dataaugmentation: 'Data augmentation',
        omnipresence: 'Omni presence',
        referralvirality: 'Referral/virality',
        networkworth: 'Network worth',
        grading: 'Grading',
    };
    return segmentMap[name] || '';
};

const getUpdatePayloadData = (apiData, currdata, userId, formState) => {
    const { fieldName, currFromStateData, id, apiKeysDetail } = currdata;
    const filterProfileData = apiData?.filter(
        (item) => updateName(item?.dataSegment) === updateName(handleSegementName(fieldName)),
    );
    let finalData = [];

    const updateCurrentValue = !currFromStateData?.length
        ? []
        : currFromStateData?.map((curr) => {
              if (fieldName === 'networkworth') {
                  return {
                      Score: curr?.score,
                      [apiKeysDetail?.type]: curr?.type?.[apiKeysDetail?.typeValue],
                      condition: '',
                      IsCreate: curr.isCreate ?? false,
                      network: curr?.aboveValue ?? 0,
                  };
              } else if (fieldName === 'grading') {
                  return {
                      Score: curr?.score,
                      OperatorFromKey: curr.from || '',
                      OperatorToKey: curr.to || '',
                      IsCreate: curr.isCreate ?? false,
                  };
              } else {
                  return {
                      Score: curr?.score,
                      [apiKeysDetail?.type]: curr?.type?.[apiKeysDetail?.typeValue],
                      condition: '',
                      IsCreate: curr.isCreate ?? false,
                  };
              }
          });

    finalData = filterProfileData?.map((profile) => {
        return {
            ...profile,
            dataSegmentRule: formState[`${fieldName}ToggleValue`] ? updateCurrentValue : [],
            dataSegmentScore: currFromStateData?.Total ?? 0,
            modifiedBy: userId,
            modifiedDate: new Date()?.getTime(),
            dataSegmentKey: handleSegementName(fieldName),
        };
    });

    return finalData[0];
};

const getSavePayloadData = (currAllVal, currentUserDetail, formState) => {
    // console.log('currAllVal: ', currAllVal);
    const { currFromStateData, fieldName, id, apiKeysDetail } = currAllVal;
    const { userId, departmentId, clientId } = currentUserDetail;

    const updateCurrentValue = !currFromStateData?.length
        ? []
        : currFromStateData?.map((curr) => {
              if (fieldName === 'networkworth') {
                  return {
                      Score: curr?.score,
                      [apiKeysDetail?.type]: curr?.type?.[apiKeysDetail?.typeValue],
                      condition: '',
                      IsCreate: curr.isCreate ?? false,
                      network: curr?.aboveValue ?? 0,
                  };
              } else if (fieldName === 'grading') {
                  return {
                      Score: curr?.score,
                      OperatorFromKey: curr.from || '',
                      OperatorToKey: curr.to || '',
                      IsCreate: curr.isCreate ?? false,
                  };
              } else {
                  return {
                      Score: curr?.score,
                      [apiKeysDetail?.type]: curr?.type[apiKeysDetail?.typeValue],
                      condition: '',
                      IsCreate: curr.isCreate ?? false,
                  };
              }
          });

    return {
        businessTypeId: 2,
        businessUnitId: departmentId,
        clientId: clientId,
        createdBy: userId,
        createdDate: new Date()?.getTime(),
        isSwitchOverall: 1,
        modifiedBy: 0,
        modifiedDate: 0,
        patternSegment: handleSegementName(fieldName),
        patternSegmentRule: formState[`${fieldName}ToggleValue`] ? updateCurrentValue : [],
        patternSegmentScore: currFromStateData?.Total || 0,
        profileDataId: 0,
        tenantId: 0,
        dataSegmentKey: handleSegementName(fieldName),
    };
};

export const buildPayloadProfileData = (apidata, formState, currentUserDetail, isSave) => {
    const { userId } = currentUserDetail;
    const {
        dataaugmentationProfile,
        omnipresenceProfile,
        referralviralityProfile,
        networkworthProfile,
        gradingProfile,
    } = formState;

    const currentallValue = [
        {
            currFromStateData: dataaugmentationProfile,
            id: 22,
            fieldName: 'dataaugmentation',
            apiKeysDetail: {
                type: 'byData',
                typeValue: 'attributeName',
            },
        },
        {
            currFromStateData: omnipresenceProfile,
            id: 23,
            fieldName: 'omnipresence',
            apiKeysDetail: {
                type: 'byChannel',
                typeValue: 'ChannelName',
            },
        },
        {
            currFromStateData: referralviralityProfile,
            id: 24,
            fieldName: 'referralvirality',
            apiKeysDetail: {
                type: 'byChannel',
                typeValue: 'ChannelName',
            },
        },
        {
            currFromStateData: networkworthProfile,
            id: 25,
            fieldName: 'networkworth',
            apiKeysDetail: {
                type: 'byChannel',
                typeValue: 'ChannelName',
            },
        },
        {
            currFromStateData: gradingProfile,
            id: 26,
            fieldName: 'grading',
            apiKeysDetail: {
                type: 'byChannel',
                typeValue: 'ChannelName',
            },
        },
    ];
    let finalPayloadData = [];
    currentallValue?.map((currAllVal) => {
        if (isSave) {
            const currPayloadData = getSavePayloadData(currAllVal, currentUserDetail, formState);
            finalPayloadData.push(currPayloadData);
        } else {
            const currPayloadData = getUpdatePayloadData(apidata, currAllVal, userId, formState, isSave);
            finalPayloadData.push(currPayloadData);
        }
    });
    return {
        profileData: finalPayloadData,
    };
};

export { DATA_ARGUMENTATION, FREQUENCY_TIME, OMNI_CHANNEL, GRADE, REFERAL_VIRALITY, INITIAL_STATE, NETWORK_WORTH };
