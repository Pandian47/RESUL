import { dateTimeFormat, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';

import { useCallback, useEffect, useState } from 'react';
import RSIcon from 'Components/RSIcon';
import { Col, Row } from 'react-bootstrap';

import { useSelector } from 'react-redux';
import { getListMoreInfo } from 'Reducers/audience/dynamicList/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader from 'Hooks/useApiLoader';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import {
    AUDIENCE_BY_CHANNEL,
    BOUNCED,
    CREATED_BY,
    DELIVERABILITY,
    EMAIL_NAME,
    LINKED_COMMUNICATION,
    MOBILE,
    ON,
    SPAM,
    UNSUBSCRIBED,
    WEB_PUSH,
    WHATS_APP,
} from 'Constants/GlobalConstant/Placeholders';

const formatDisplayDate = (viewData = {}) => {
    try {
        const useCreatedDate =
            viewData?.modifiedDate === 'None' || viewData?.modifiedBy === 'NaT';
        return useCreatedDate
            ? dateTimeFormat(viewData?.createdDate)
            : dateTimeFormat(viewData?.modifiedDate);
    } catch {
        return '';
    }
};

const SegmentInfo = ({ handleClose, viewData = {} }) => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state)) ?? {};
    const [listInfo, setListInfo] = useState({});
    const listMoreInfoAPI = useApiLoader({
        actionCreator: getListMoreInfo,
    });

    const { isMounted } = useComponentWillUnmount(() => {
        listMoreInfoAPI.reset();
    });

    useEffect(() => {
        if (!viewData?.dynamicListId) return;

        const payload = {
            dynamicListId: [viewData?.dynamicListId],
            departmentId,
            clientId,
            userId,
        };

        void (async () => {
            try {
                const res = await listMoreInfoAPI.refetch({ payload });
                if (!isMounted.current) return;
                setListInfo(res?.status ? res?.data ?? {} : {});
            } catch {
                if (isMounted.current) setListInfo({});
            }
        })();

        return () => {
            listMoreInfoAPI.reset();
        };
    }, [viewData?.dynamicListId, departmentId, clientId, userId]);

    const handleClosePopup = useCallback(() => {
        handleClose?.(false);
    }, [handleClose]);

    const displayDate = formatDisplayDate(viewData) ?? '';
    const linkedCommunicationCount = viewData?.linkedCommunication ?? 0;
    const emailChannelCount = listInfo?.emailPushChannelList?.length ?? 0;
    const mobileChannelCount = listInfo?.mobilePushChannelList?.length ?? 0;
    const webPushChannelCount = listInfo?.webPushChannelList?.length ?? 0;
    const whatsappChannelCount = listInfo?.whatsappPushChannelList?.length ?? 0;

    const listDateFormat =
        viewData?.modifiedDate === 'None' || viewData?.modifiedBy === 'NaT'
            ? getUserCurrentFormat(viewData?.createdDate)?.dateFormat ?? ''
            : getUserCurrentFormat(viewData?.modifiedDate)?.dateFormat ?? '';

    return (
        <div className="master-recip-data-popup">
            <div className="float-end mr10 mt10" onClick={handleClosePopup}>
                <RSIcon className={'icon-md color-primary-blue'} />
            </div>
            <div className="d-block h-50">
                <Row>
                    <span>{viewData?.dynamicListName ?? ''}</span>
                    <Col md={6}>
                        <h4 className="mb10">
                            {CREATED_BY}:{' '}
                            <span className="RSfirstLetterCaps">
                                {viewData?.modifiedBy == null
                                    ? viewData?.createdBy ?? ''
                                    : viewData?.modifiedBy ?? ''}
                            </span>
                            , {ON}: {displayDate}
                        </h4>
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <div>
                            {linkedCommunicationCount > 0 ? (
                                <span>
                                    {LINKED_COMMUNICATION} ({linkedCommunicationCount})
                                </span>
                            ) : null}
                            <span>{listDateFormat}</span>
                        </div>
                    </Col>
                    <Col sm={6}>
                        <div>
                            <span>
                                {AUDIENCE_BY_CHANNEL} ({numberWithCommas(viewData?.audienceCount) || 0})
                            </span>
                            <Row>
                                <Col sm={6}>
                                    <div>
                                        <span>{EMAIL_NAME}</span>
                                        <br />
                                        <span>{MOBILE}</span>
                                        <br />
                                        <span>{WEB_PUSH}</span>
                                        <br />
                                        <span>{WHATS_APP}</span>
                                        <br />
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div>
                                        <span>{numberWithCommas(emailChannelCount) || 0}</span>
                                        <br />
                                        <span>{numberWithCommas(mobileChannelCount) || 0}</span>
                                        <br />
                                        <span>{numberWithCommas(webPushChannelCount) || 0}</span>
                                        <br />
                                        <span>{numberWithCommas(whatsappChannelCount) || 0}</span>
                                        <br />
                                    </div>
                                </Col>
                            </Row>
                            <span>{DELIVERABILITY}</span>
                            <Row>
                                <Col sm={6}>
                                    <div>
                                        <span>{SPAM}</span>
                                        <br />
                                        <span>{BOUNCED}</span>
                                        <br />
                                        <span>{UNSUBSCRIBED}</span>
                                        <br />
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div>
                                        <span>{numberWithCommas(0) || 0}</span>
                                        <br />
                                        <span>{numberWithCommas(0) || 0}</span>
                                        <br />
                                        <span>{numberWithCommas(0) || 0}</span>
                                        <br />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default SegmentInfo;
