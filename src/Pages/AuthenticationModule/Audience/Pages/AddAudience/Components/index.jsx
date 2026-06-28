import ManualEntry from './ManualEntry/ManualEntry';
import CSV from './CSV/CSV';
import FTP from './FTP/FTP';
import AddAudienceDataExchange from './RemoteDataSource/Components';
import AddAudienceDataExchangeNew from './RemoteDataSourceNew/Components';

export const RenderComponent = ({ currentComponent, audRefData, listType, fetchAudienceInsight }) => {
    switch (currentComponent) {
        case 'manual entry':
            return <ManualEntry />;
        case 'csv':
        case 'excel':
            return (
                <CSV
                    audRefData={audRefData}
                    listType={listType}
                    fetchAudienceInsight={fetchAudienceInsight}
                />
            );
        case 'sftp':
            return <FTP audRefData={audRefData} />;
        default:
            return null;
    }
};

export const RenderDataExchage = ({ state }) => {
    switch (state) {
        case 'my-sql':
        case 'microsoftDynamicCRM':
        case 'CRM':
        case 'bigquery':
        case 'digipop':
        case 'snowflake':
        case 'oracle':
        case 'shopify':
        case 'pipedrive':
        case 'cassandra':
        case 'aerospike':
        case 'mongodb':
        case 'storehippo':
        case 'eventbrite':
        case 'bigcommerce':
        case 'prestashop':
        case 'leadsquaredcrm':
        case 'blackbaud':
        case 'magento':
        case 'woocommerce':
        case 'wix':
        case 'databricks':
        case 'insightly':
        case 'gotowebinar':
        case 'webex':
        case 'prestodb':
        case 'commercetools':
        case 'google sheets':
            return <AddAudienceDataExchange />;
        case 'hubspot':
        case 'dynamic crm':
        case 'salesforce':
        case 'mysql':
        case 'postgresql':
        case 'mssql':
        case 'c&l':
        case 'versium':
            return <AddAudienceDataExchangeNew />;
        default:
            return null;
    }
};
