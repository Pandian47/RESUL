import { truncateTitle } from 'Utils/modules/displayCore';
import { Fragment } from 'react';
import { Col } from 'react-bootstrap';
import { userImg } from 'Assets/Images';

import RSTooltip from 'Components/RSTooltip';

const ListView = ({ users, onUserSelect }) => {
    return (
        <Fragment>
            {/* <Row>
                {users?.map((user) => {
                    return ( */}
            <Col sm={12} md={4} onClick={() => onUserSelect(users)} key={users.recipientGUID}>
                <div className={`audienceCard`}>
                    <div className={`${users.bgColorName} statusColor`}></div>
                    <img src={users.pic || userImg} width="75px" alt="user" className="roundedCircle" />
                    <div>
                        {/* <h4 className="m0">{users.firstName}</h4> */}
                        {users?.firstName?.length > 25 ? (
                            <RSTooltip text={users?.firstName} position="top">
                                <h4 className="mb0">{truncateTitle(users?.firstName, 25)}</h4>
                            </RSTooltip>
                        ) : (
                            <h4 className="mb0">{users?.firstName}</h4>
                        )}
                        <h6>
                            Participated in {users?.count} communication{parseInt(users?.count, 10) === 1 ? '' : 's'}
                        </h6>
                    </div>
                </div>
            </Col>
            {/* );
                })}
            </Row> */}
        </Fragment>
    );
};

export default ListView;
