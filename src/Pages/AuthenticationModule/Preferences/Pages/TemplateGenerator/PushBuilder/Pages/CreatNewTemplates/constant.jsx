import SingleRowContainer from './Components/EmailBuildArea/Components/RowContainers/SingleColumnContainer';

export const CATAGORY = ['Business', 'Promotion', 'Corporate', 'Offer', 'Product/Service', 'My Template'];

export const INITIAL_STATE = {
    defaultValues: {
        templateName: '',
        templateCatagory: '',
        createdDate: 'Thu, 04 May, 2023',
        contents: [
            {
                id: 1,
                name: 'One',
                component: (props) => <SingleRowContainer {...props} />,
            },
            {
                id: 1,
                name: 'One',
                component: (props) => <SingleRowContainer {...props} />,
            },
            {
                id: 1,
                name: 'One',
                component: (props) => <SingleRowContainer {...props} />,
            },
        ],
    },
    mode: 'onTouched',
};

export const BUILDER_TOOLS = {
    heading: {
        label: { value: 'Custom' },
        properties: {
            text: { value: 'Head Tag' },
            textAlign: { value: 'right' },
        },
    },
    image: {
        position: 0,
    },
    form: {
        enabled: true,
    },
    'custom#barcode': {
        properties: {
            Type: {
                editor: {
                    data: {
                        options: [
                            {
                                label: 'Option 1',
                                value: 1,
                            },
                            {
                                label: 'Option 2',
                                value: 2,
                            },
                        ],
                    },
                },
            },
        },
    },
};

export const BUILDER_OPTIONS = {
    customJS: [window.location.protocol + '//' + window.location.host + '/custom.js'],
};

export const communicationGalleryList = {
    status: true,
    message: 'success',
    data: {
        campaignsGalleryList: [],
    },
    totalRows: 168,
};

export const communicationGalleryInfoDetails = {
    status: true,
    message: 'success',
    data: {
        noOfRecipientsCount: 0,
        reachCount: 0,
        interactionCount: 0,
        conversionCount: 0,
        campaignType: 'S',
        campaignAttribute: 'Acquisition',
    },
};
