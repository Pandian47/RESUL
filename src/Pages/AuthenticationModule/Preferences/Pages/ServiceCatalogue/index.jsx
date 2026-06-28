import RSPageHeader from 'Components/RSPageHeader';
import { Container } from 'react-bootstrap';

const ServiceCatalogue = () => {
    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader title="Service catalogue" isBack backPath="/preferences" isHeaderLine rightCommonMenus />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">Service catalogue</Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default ServiceCatalogue;
