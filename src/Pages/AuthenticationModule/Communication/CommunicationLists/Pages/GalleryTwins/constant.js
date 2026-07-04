import { STATUS_LIST } from 'Utils/modules/communicationChannels';
import { CHANNELSSOCIAL_LIST } from 'Constants/GlobalConstant/channelSocialList';
import { uniqBy } from 'Utils/modules/lodashReplacements';

export const communicationGalleryInfoDetails = {
    data: {
        noOfRecipientsCount: 0,
        reachCount: 0,
        interactionCount: 0,
        conversionCount: 0,
        campaignType: 'S',
        campaignAttribute: 'Acquisition',
    },
};
 

export const advanceSearchAvailableChannels = (channels) => {
    let notAvailableChannels = [4,13,15,26,30,34];
    return channels.filter(channel => !notAvailableChannels.includes(channel.id));
};

export const advanceSearchStatusList = (statusList) => {
    let notAvailableStatus = [3, 6, 20, 27, 26];
    return statusList.filter(status => !notAvailableStatus.includes(status.id));
}

export const SEARCH_CONFIG = ({ userId = 0, productType, communicationType, tags, users }) => [
    {
        type: 'input',
        label: 'Communication name',
        config: {
            name: 'communication_name',
            maxLength: 200,
        },
    },
    {
        type: 'dropdown',
        label: 'Delivery type',
        className: 'searchType',
        fieldKey: 'name',
        config: {
            name: 'delivery_type',
            data: [
                { id: '', name: 'All' },
                { id: 'S', name: 'Single dimension' },
                { id: 'M', name: 'Multi dimension' },
                { id: 'T', name: 'Event trigger' },
            ],
            textField: 'name',
            dataItemKey: 'id',
        },
    },
    {
        type: 'dropdown',
        label: 'Communication type',
        fieldKey: 'attributename',
        config: {
            name: 'communication_type',
            data: communicationType,
            textField: 'attributename',
            dataItemKey: 'campaignAttributeId',
        },
    },
    {
        type: 'dropdown',
        label: 'Product type',
        fieldKey: 'categoryname',
        config: {
            name: 'product_type',
            data: productType,
            textField: 'categoryname',
            dataItemKey: 'categoryId',
        },
    },
    {
        type: 'multiselect',
        label: 'Status',
        fieldKey: 'label',
        config: {
            name: 'status',
            data: advanceSearchStatusList(STATUS_LIST)?.map((list)=>list?.label),
            // data: ['In progress', 'Paused', 'Scheduled', 'Completed', 'Alert', 'Multi status', 'Draft', 'Archived'],
        },
    },
    {
        type: 'dropdown',
        label: 'Channel type',
        fieldKey: 'lable',
        isMandatory: true,
        config: {
            name: 'channel_type',
            //data: ['Email', 'Messaging', 'Notification', 'QR code', 'SMS', 'Voice'],
            data: uniqBy(CHANNELSSOCIAL_LIST, 'lable'),
            textField: 'lable',
            dataItemKey: 'id',
        },
    },
    // {
    //     type: 'input',
    //     label: 'Created by',
    //     config: {
    //         name: 'created_by',
    //         maxlength: '50',
    //     },
    // },
    {
        type: 'dropdown',
        label: 'Created by',
        fieldKey: 'firstName',
        config: {
            name: 'created_by',
            data: users,
            textField: 'firstName',
            dataItemKey: 'userId',
        },
    },
    //
    {
        type: 'dropdown',
        label: 'Tags',
        fieldKey: 'tags',
        config: {
            name: 'tags',
            data: tags,
            textField: 'tags',
            dataItemKey: 'id',
        },
        // config: {
        //     name: 'listname',
        //     data: ['Mutual funds', 'Stocks', 'Flipkart Best Buying Days', 'Gold bon'],
        // },
    },
    // {
    //     type: 'datepicker',
    //     label: 'Start Date',
    //     config: {
    //         name: 'start_date',
    //     },
    // },
    // {
    //     type: 'datepicker',
    //     label: 'End Date',
    //     config: {
    //         name: 'end_date',
    //     },
    // },
];

export const SEARCH_FORM_STATE = {
    communication_name: '',
    delivery_type: '',
    communication_type: '',
    product_type: '',
    status: '',
    channel_type: { lable: 'Email', id: 1, subChannelId: 1, sno: 1 },
    tags: '',
    start_date: '',
    end_date: '',
};