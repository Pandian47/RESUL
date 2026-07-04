import { formatNumber } from 'Utils/modules/campaignUtils';
import { useState, useEffect, useContext } from 'react';
import { Col } from 'react-bootstrap';
import { get as _get } from 'Utils/modules/lodashReplacements';
import Icon from 'Components/Icon/Icon';
import CreateWorkFlowContext from '../../../context';
import { getCount, getCustomizedReceipientList, getCustomizedReceipientListRecursiveFlow } from '../PotentialConst';

const AudienceChannelWiseList = ({ isSubSegment = false, segmentChannelWiseCount = [] }) => {
    const [customizedReceipientList, setCustomizedReceipientList] = useState([]);
    const { canvasState } = useContext(CreateWorkFlowContext);
    let receipientList = isSubSegment
        ? segmentChannelWiseCount?.length
            ? segmentChannelWiseCount
            : _get(canvasState, 'Campaign.PotentialRecipients.Recipients', [])
        : _get(canvasState, 'Campaign.PotentialRecipients.Recipients', []);

    useEffect(() => {
        if (receipientList?.length && canvasState?.['MdcType'] === 'RecursivelyTraverse_React') {
            const count = getCount(receipientList, 'recipientCount');
            const { customizedList } = getCustomizedReceipientList({ receipientList });
            setCustomizedReceipientList(customizedList);
        } else if (canvasState?.['MdcType'] === 'RecursivelyTraverse') {
            setTotalCount(canvasState?.ReceipientCount);
            const { customizedList } = getCustomizedReceipientListRecursiveFlow({ receipientList });
            setCustomizedReceipientList(customizedList);
        }
    }, [receipientList, canvasState]);

    return (
        <Col sm="12">
            <div className="mdc-megamenu">
                <div className="popup-megamenu d-flex flex-lg-wrap">
                    {customizedReceipientList.map((receipient, index) => {
                        let dFlex = index % 2 === 0 ? true : false;
                        return (
                            <div className={`col-4 mb30 ${dFlex ? '1' : '2'} `} key={index}>
                                <div className="d-flex align-items-start bg-cover">
                                    <div
                                        className={`rs-notification-icon-wrapper mr10 mdc-alert-popup border-r7 p5 ${receipient.class}`}
                                    >
                                        <Icon
                                            icon={receipient.icon}
                                            tooltip=""
                                            size="lg"
                                            color={'white'}
                                            mainClass={''}
                                            iconClass=""
                                        />
                                    </div>
                                    <div className="rs-notification-content lh22">
                                        <p>{receipient.channelName}</p>
                                        <div className="fs19 font-bold">
                                            {receipient.count > 999 ? formatNumber(receipient.count) : receipient.count}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Col>
    );
};

export default AudienceChannelWiseList;
