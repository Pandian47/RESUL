import { FormProvider, useForm } from 'react-hook-form';
import { GOOGLE_BQ_QUERY } from '../Components/constants';
import RSPageHeader from 'Components/RSPageHeader';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { RSPrimaryButton } from 'Components/Buttons';
import ConnectRDSInputs from '../Components/ConnectRDSInputs';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleBQ = () => {
    const { state } = useLocation();
    const methods = useForm({
        defaultValues: GOOGLE_BQ_QUERY,
    });
    ////state

    const [showTableFlag, setShowTableFlag] = useState(true);

    return (
        <FormProvider {...methods}>
            <div className="page-content-holder">
                <RSPageHeader
                    title="Data exchange"
                    isBack
                    backPath="/preferences"
                    isTabber
                    isHeaderLine
                    rightCommonMenus
                />
                <div className="page-content">
                    <Container>
                        <Card style={{ height: '200px' }}>
                            <Row className="pl20 pr20">
                                <Col>
                                    <div className="text-title">Google Big Query</div>
                                    <div className="text-body">
                                        <div className="dropdown-search-menu">
                                            <form className="row mt20">
                                                <ConnectRDSInputs disable={showTableFlag} />
                                                <div className="d-flex justify-content-end pt25 pr35">
                                                    <RSPrimaryButton
                                                        className={showTableFlag ? 'click-off' : ' '}
                                                        disabled={showTableFlag}
                                                        type="submit"
                                                    >
                                                        Connect
                                                    </RSPrimaryButton>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Container>
                </div>
            </div>
        </FormProvider>
    );
};

export default GoogleBQ;
