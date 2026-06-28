import { pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import { useNavigate } from 'react-router-dom';

export const GOALS_AND_BENCHMARK = [
    {
        BenchmarkId: 0,
        BenchmarkName: 'Awareness Communication',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Awareness',
        CampaignTypeId: 1,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 1,
        BenchmarkName: 'New Product Launch Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'New product launch',
        CampaignTypeId: 2,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 2,
        BenchmarkName: 'Promotion Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Promotion',
        CampaignTypeId: 3,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 3,
        BenchmarkName: 'Lead Generation Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Lead generation',
        CampaignTypeId: 4,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 4,
        BenchmarkName: 'Greetings Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Greetings',
        CampaignTypeId: 5,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 5,
        BenchmarkName: 'Activation Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Activation',
        CampaignTypeId: 7,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 0,
        BenchmarkName: 'Acquisition Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Acquisition',
        CampaignTypeId: 8,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 0,
        BenchmarkName: 'Cross sell Bennchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Cross Sell',
        CampaignTypeId: 9,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 0,
        BenchmarkName: 'Usage Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Usage',
        CampaignTypeId: 10,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 0,
        BenchmarkName: 'Retention Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Retention',
        CampaignTypeId: 11,
        BusinessType: 'B2C',
    },
    {
        BenchmarkId: 0,
        BenchmarkName: 'Service Benchmark',
        RegionName: null,
        MarketName: 'India',
        IndustryName: 'Banking',
        LastModified: '',
        CampaignType: 'Service',
        CampaignTypeId: 12,
        BusinessType: 'B2C',
    },
];
export const editBenchmart = (props) => {
    // return <span>{props}</span>;
};

export const GOALS_AND_BENCHMARK_GRID_CONFIG = [
    {
        field: 'benchMarkname',
         filter: 'text',
        title: 'Name',
    },
    {
        field: 'businessType',
         filter: 'text',
        title: 'Business type',
    },
    {
        field: 'attributeName',
         filter: 'text',
        title: 'Communication type',
        width: 250,
    },
    {
        field: 'country',
         filter: 'text',
        title: 'Country',
    },
    {
        field: 'industryName',
         filter: 'text',
        title: 'Industry',
    },
    {
        field: 'action',
        title: 'Action',
        width: '165px',
        sortable: false,
        cell: ({ dataItem }) => {
            const navigate = useNavigate();
            const {
                permissions: { updateAccess },
            } = usePermission();

            return (
                <td>
                    <ul className="rs-list-inline rli-space-5">
                        <li>
                            <RSTooltip text="Edit" position="top">
                                <div  className={`${
                                        !updateAccess ? 'pe-none click-off' : ''
                                    }`}>
                                <i
                                    id="rs_data_pencil_edit"
                                    className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                    onClick={() => {
                                        if (updateAccess) {
                                            navigate('/preferences/goals-and-benchmark/channel-benchmark', {
                                                state: {
                                                    benchmarkOverView: dataItem,
                                                    mode: 'edit',
                                                },
                                            });
                                        }
                                    }}
                                    // onClick={() => editBenchmart(dataItem?.BenchmarkId)}
                                ></i></div>
                            </RSTooltip>
                        </li>
                    </ul>
                </td>
            );
        },
    },
];
