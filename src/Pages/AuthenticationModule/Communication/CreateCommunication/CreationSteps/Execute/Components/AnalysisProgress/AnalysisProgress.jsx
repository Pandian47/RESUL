import { checkbox_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ListGroup, Row } from 'react-bootstrap';
import { ANALYSIS_PROGRESS_DATA } from './constant';
const AnalysisProgress = ({ data }) => {
    return (
        <div className="mt50">
            <Row>
                <ListGroup variant="steps" className="list-group-steps-secondary">
                    {ANALYSIS_PROGRESS_DATA.map((data, idx) => {
                        return (
                            <ListGroup.Item className="completed" key={idx}>
                                <span className="step">
                                    <i className={`${checkbox_medium} icon-md cursor-normal`}></i>
                                </span>
                                <span className="title">{data}</span>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </Row>
        </div>
    );
};

export default AnalysisProgress;
