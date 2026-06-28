import { Col, Row } from 'react-bootstrap';
import List from '../../Components/List/List';
import AnalysisProgress from '../../Components/AnalysisProgress/AnalysisProgress';
import Content from '../../Components/Content/Content';
import PredictiveAnalysis from '../../Components/PredictiveAnalysis/PredictiveAnalysis';
import ApprovalStatus from '../../Components/ApprovalStatus/ApprovalStatus';

const Email = () => {
    return (
        <div className="mt50">
            <AnalysisProgress />
            {/* <RSProgressSteps /> */}
            <div className="mb30">
                <Row className="mb30">
                    <Col sm={6}>
                        <List />
                    </Col>
                    <Col sm={6}>
                        <Content />
                    </Col>
                </Row>
                <Row className="mb30">
                    <Col sm={6}>
                        <PredictiveAnalysis />
                    </Col>
                    <Col sm={6}>
                        <ApprovalStatus />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Email;
