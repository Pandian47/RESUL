import { circle_info_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo } from 'react';
import { Accordion } from 'react-bootstrap';
const AccordInfo = ({ icon, children }) => {
    return (
        <Accordion className="analytics-timeline-accordion">
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    <i className={icon || circle_info_medium} id='rs_data_circle_info'/>
                </Accordion.Header>
                <Accordion.Body>{children}</Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export default memo(AccordInfo);
