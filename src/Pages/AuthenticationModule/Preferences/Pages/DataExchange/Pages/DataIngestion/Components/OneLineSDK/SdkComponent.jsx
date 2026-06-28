import { circle_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

const SdkComponent = ({ dataExchange }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    let tempSDKData = dataExchange;
    let isSDKData = tempSDKData.filter((e) => e.isSDK);

    const [clickState, setClickState] = useState(false);
    return (
        <Fragment>
            {isSDKData?.map((item, index) => {
                return (
                    <Col
                        md={4}
                        key={index}
                        onClick={(e) => {
                            let isRemoveData = isSDKData[index];
                            isRemoveData.isClick = !clickState;
                            setClickState(!clickState);
                            //console.log('isSDKData: ', isSDKData);
                        }}
                    >
                        <Card>
                            <Card.Body className={`${item?.isClick ? 'active' : ''}`}>
                                <img variant="top" src={item?.img} />
                                {item?.isClick && (
                                    <div className={`addPlusIcon`}>
                                        <i
                                            className={`${circle_tick_medium} icon-md color-primary-green bg-white`}
                                            id='rs_data_circle_tick_medium'
                                        ></i>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Fragment>
    );
};

export default SdkComponent;
