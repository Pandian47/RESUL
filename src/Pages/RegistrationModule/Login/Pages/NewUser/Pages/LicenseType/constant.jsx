import { tagLicensePro, tagLicenseEnterprise, tagLicenseStp } from 'Assets/Images';
export const LICENSE_TYPES = [
    {
        type: 'startup',
        mainHeading: 'Startup',
        descritpionText: 'All core features included',
        tag: tagLicenseStp,
        licenseId: 1,
        buttonText: 'Select plan',
        price: '1,999',
        details: [
            {
                text: 'Dashboard',
            },
            {
                text: 'Communication summary report',
            },
            {
                text: 'Adv. behavioural segmentation',
            },
            {
                text: 'Upto 50K audience',
            },
        ],
    },
    {
        type: 'pro',
        mainHeading: 'Professional',
        descritpionText: 'All Startup features included, plus Pro enhancements',
        tag: tagLicensePro,
        licenseId: 2,
        buttonText: 'Select plan',
        price: '9,999',
        details: [
            {
                text: 'Multi-dimensional communication',
            },
            {
                text: 'Benchmark, trend comparison reports',
            },
            {
                text: 'Vanity / Custom URLs',
            },
            {
                text: 'Hackproof security + free features',
            },
            {
                text: 'Upto 500K audience',
            },
        ],
    },
    {
        type: 'enterprise',
        mainHeading: 'Enterprise',
        descritpionText: 'All Pro features included, plus Enterprise-grade capabilites',
        tag: tagLicenseEnterprise,
        licenseId: 3,
        buttonText: 'Select plan',
        // buttonText: 'Let’s talk!',
        price: '16,999',
        details: [
            {
                text: 'Reporting across all geographies',
            },
            {
                text: 'Audience analytics 360',
            },
            {
                text: 'Military grade security + Pro features',
            },
            {
                text: 'Upto 10Mn audience',
            },  
            {
                text: 'Multiple Business units creation',
            }, 
        ],
    },
];
