import { getChannelId } from 'Utils/modules/communicationChannels';
export const goalSettingsAccord = [
    {
        title: 'Credit card onboarding',
        updatedOn: 'Wed, Mar 29, 2023',
        chartData: {
            Parent: {
                FriendlyName: 'Activate the Card',
                FailPercentage: '23.08',
                SuccessPercentage: '76.92',
                WindowID: 1,
                AudienceCount: 3,
                Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Location selected';",
                ActualCount: '13',
            },
            Child: [
                {
                    FriendlyName: 'Created the PIN',
                    FailPercentage: '-70.0',
                    SuccessPercentage: '20',
                    WindowID: 2,
                    AudienceCount: -7,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Doctor selected';",
                    ActualCounty: '10',
                },
                {
                    FriendlyName: 'Registered in Mobile app',
                    FailPercentage: '17.65',
                    SuccessPercentage: '20',
                    WindowID: 3,
                    AudienceCount: 3,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Consultation method selected with proceed';",
                    ActualCounty: '17',
                },
                {
                    FriendlyName: 'Set the Prefrences',
                    FailPercentage: '0',
                    SuccessPercentage: '0',
                    WindowID: 4,
                    AudienceCount: 0,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Appointment slot Selected with proceed';",
                    ActualCounty: '0',
                },
                {
                    FriendlyName: 'Completed the first transaction',
                    FailPercentage: '0',
                    SuccessPercentage: '0',
                    WindowID: 5,
                    AudienceCount: 0,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Appointment slot Selected with proceed';",
                    ActualCounty: '0',
                },
            ],
            EndPoint: {
                FriendlyName: 'Failed',
                WindowID: 6,
            },
        },
    },
    {
        title: 'Credit card journey',
        updatedOn: 'Wed, Mar 29, 2023',
        chartData: {
            Parent: {
                FriendlyName: 'Apply for credit card',
                FailPercentage: '23.08',
                SuccessPercentage: '76.92',
                WindowID: 1,
                AudienceCount: 3,
                Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Location selected';",
                ActualCount: '13',
            },
            Child: [
                {
                    FriendlyName: 'Applicant details',
                    FailPercentage: '-70.0',
                    SuccessPercentage: '76.92',
                    WindowID: 2,
                    AudienceCount: -7,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Doctor selected';",
                    ActualCounty: '10',
                },
                {
                    FriendlyName: 'Company details',
                    FailPercentage: '17.65',
                    SuccessPercentage: '76.92',
                    WindowID: 3,
                    AudienceCount: 3,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Consultation method selected with proceed';",
                    ActualCounty: '17',
                },
                {
                    FriendlyName: 'Upload documents',
                    FailPercentage: '0',
                    SuccessPercentage: '76.92',
                    WindowID: 4,
                    AudienceCount: 0,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Appointment slot Selected with proceed';",
                    ActualCounty: '0',
                },
                {
                    FriendlyName: 'Verify details',
                    FailPercentage: '0',
                    SuccessPercentage: '76.92',
                    WindowID: 5,
                    AudienceCount: 0,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Appointment slot Selected with proceed';",
                    ActualCounty: '0',
                },
                {
                    FriendlyName: 'Success',
                    FailPercentage: '0',
                    SuccessPercentage: '76.92',
                    WindowID: 6,
                    AudienceCount: 0,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Appointment slot Selected with proceed';",
                    ActualCounty: '0',
                },
            ],
            EndPoint: {
                FriendlyName: 'Failed',
                WindowID: 7,
            },
        },
    },
    {
        title: 'Fixed deposit application journey',
        updatedOn: 'Wed, Mar 29, 2023',
        chartData: {
            Parent: {
                FriendlyName: 'Apply - new user',
                FailPercentage: '23.08',
                SuccessPercentage: '76.92',
                WindowID: 1,
                AudienceCount: 3,
                Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Location selected';",
                ActualCount: '13',
            },
            Child: [
                {
                    FriendlyName: 'Personal Details',
                    FailPercentage: '-70.0',
                    SuccessPercentage: '76.92',
                    WindowID: 2,
                    AudienceCount: -7,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Doctor selected';",
                    ActualCounty: '10',
                },
                {
                    FriendlyName: 'Additional Details',
                    FailPercentage: '17.65',
                    SuccessPercentage: '76.92',
                    WindowID: 3,
                    AudienceCount: 3,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Consultation method selected with proceed';",
                    ActualCounty: '17',
                },
                {
                    FriendlyName: 'Verify Details',
                    FailPercentage: '0',
                    SuccessPercentage: '76.92',
                    WindowID: 4,
                    AudienceCount: 0,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Appointment slot Selected with proceed';",
                    ActualCounty: '0',
                },
                {
                    FriendlyName: 'Success',
                    FailPercentage: '0',
                    SuccessPercentage: '76.92',
                    WindowID: 5,
                    AudienceCount: 0,
                    Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Appointment slot Selected with proceed';",
                    ActualCounty: '0',
                },
            ],
            EndPoint: {
                FriendlyName: 'Failed',
                WindowID: 6,
            },
        },
    },
];

 

export const goalSettingsCampaignDropdown = [
    'Credit card acquisition',
    'Amazon great shopping festival',
    'Gold bonds',
    'Effortless mobile banking',
    'Promotional offer',
    'Fixed deposit promo',
    'Personal loan promo',
];

export const buildUserInfo = (user, passId = '') => {
    let {
        firstName,
        avaliableChannels,
        lifeTimeValue,
        twitterFollowingCount,
        facebookFriendsCount,
        mostActiveChannel,
        leastActiveChannel,
        campaignParticipatedCount,
        campaignSentCount,
        campaignParticipatedList,
        campaignSentList,
        behaviour,
        imagePath,
    } = user;
    let getChannel = avaliableChannels?.map((e) => getChannelId(e));
    // console.log('getChannel: ', getChannel);
    return {
        name: firstName || '',
        age: '',
        campaigns: campaignSentCount,
        pic: '',
        place: '',
        notifications: getChannel,
        roleDescription: 'Provides positive comment',
        lifetimeValue: lifeTimeValue || 'NA',
        audienceScore: 'NA',
        role: 'Brand admirer',
        virality: {
            facebook: facebookFriendsCount,
            twitter: twitterFollowingCount,
        },
        behavior: behaviour,
        passId: passId,
        // interests: interests,
        // bestProducts: bestProducts,
        // bestOffers: bestOffers,
        activeChannel: [
            {
                title: 'Most active',
                icon: mostActiveChannel,
            },
            {
                title: 'Least active',
                icon: leastActiveChannel,
            },
        ],
        campaign: [
            {
                title: 'Received',
                total: campaignSentCount,
                moreValue: true,
                moreData: campaignParticipatedList?.map((ele) => ({
                    title: ele?.campaignName,
                    channelId: ele?.channel?.split(','),
                })),
            },
            {
                title: 'Participated',
                total: campaignParticipatedCount,
                moreValue: true,
                moreData: campaignSentList?.map((ele) => ({
                    title: ele?.campaignName,
                    channelId: ele?.channel?.split(','),
                })),
            },
        ],
    };
};
 
 
