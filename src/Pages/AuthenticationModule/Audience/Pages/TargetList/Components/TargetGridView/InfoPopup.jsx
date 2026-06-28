import { dateTimeFormat } from 'Utils/modules/dateTime';
import RSModal from 'Components/RSModal';
import { Col, Row } from 'react-bootstrap';

import {
    AUDIENCE_INFO,
    CREATED_BY,
    EMAIL_NAME,
    MOBILE,
    ON,
    TARGET,
    TARGET_GROUP,
} from 'Constants/GlobalConstant/Placeholders';

export const InfoPopup = ({ show, onHide, viewData }) => {
    return (
        <RSModal
            show={show}
            size="lg"
            header={viewData?.recipientsBunchName}
            handleClose={onHide}
            body={
                <div>
                    <div className="form-group">
                        <Row className="mb20">
                            <Col sm={5} className="text-right">
                                <label className="control-label-left">{AUDIENCE_INFO}</label>
                            </Col>
                        </Row>
                    </div>
                    <Row className="">
                        <span>{AUDIENCE_INFO}</span>
                        <Col md={6}>
                            <h4 className="mt20 mb10">
                                {CREATED_BY}: {viewData?.createdBy}, {ON} : {dateTimeFormat(viewData?.createdDate)}
                            </h4>
                            <ul className="infoTwoColumnDivCSS css-scrollbar">
                                <li>
                                    {EMAIL_NAME}:{viewData?.recipientCountEmail}
                                </li>
                                <li>
                                    {MOBILE}: {viewData?.recipientCountMobile}
                                </li>
                            </ul>
                            <h4 className="mt20 mb10">{TARGET}</h4>
                            <ul className="infoTwoColumnDivCSS css-scrollbar">
                                <li>
                                    {TARGET_GROUP}: {viewData?.recipientCount}
                                </li>
                            </ul>
                        </Col>
                    </Row>
                </div>
            }
        />
    );
};
