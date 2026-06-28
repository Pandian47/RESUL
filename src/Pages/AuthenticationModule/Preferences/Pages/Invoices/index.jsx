import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import RSTabbarFluid from 'Components/RSTabberFluid';
import { INVOICE_TAB_CONFIG } from './constant';

const Invoices = () => {
    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader title="Invoice list" isBack backPath="/preferences" isTabber isHeaderLine rightCommonMenus />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content">
                    <RSTabbarFluid
                        defaultClass={`col-sm-6`}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={INVOICE_TAB_CONFIG}
                        className="rs-tabs row"
                        defaultTab={0}
                    />
                </div>
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default Invoices;
