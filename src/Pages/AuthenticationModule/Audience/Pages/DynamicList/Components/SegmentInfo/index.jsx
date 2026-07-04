import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { truncateTitle } from 'Utils/modules/displayCore';
import { decodeBase64 } from 'Utils/base64';
import { AUDIENCE_BY_CHANNEL, BOUNCED, CREATED_BY, DELIVERABILITY, DYNAMIC_COMMUNICATION_LINKED, EMAIL_NAME, LIST_INFO, MOBILE, NO_COMMUNICATIONS_BLASTED, SPAM, UNSUBSCRIBED, WEB_PUSH, WHATS_APP } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Col, Row } from 'react-bootstrap';


import { getListMoreInfo } from 'Reducers/audience/dynamicList/request';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall.jsx';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

import { getSessionId } from 'Reducers/globalState/selector';
import RSTooltip from 'Components/RSTooltip';
import RSModal from 'Components/RSModal';
import useApiLoader from 'Hooks/useApiLoader';

import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';

const SegmentInfo = ({ handleClose, viewData = {}, listInfoModal = false }) => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state)) ?? {};
    const [listInfo, setListInfo] = useState({});
    const listMoreInfoAPI = useApiLoader({
        actionCreator: getListMoreInfo,
    });

    const { isMounted } = useComponentWillUnmount(() => {
        listMoreInfoAPI.reset();
    });

    useEffect(() => {
        if (!listInfoModal || !viewData?.dynamicListId) return;
        const payload = {
            dynamicListId: viewData.dynamicListId,
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
                setListInfo({});
            }
        })();

    }, [listInfoModal, viewData?.dynamicListId, departmentId, clientId, userId]);

    const handleModalClose = useCallback(() => {
        handleClose?.(false);
    }, [handleClose]);

    const isListInfoLoading = listMoreInfoAPI?.isLoading ?? false;
    const campaignsList = listInfo?.campaignsList ?? [];
    const commsCount = viewData?.blastedCount ?? campaignsList?.length ?? 0;
    const createdDateFormat = getUserCurrentFormat(viewData?.createdDate, { isOffset: true })?.dateTimeFormat ?? '';

    return (
        <>
            <RSModal
                show={listInfoModal}
                className="modal-w-carousel"
                handleClose={handleModalClose}
                header={LIST_INFO}
                size="xxlg"
                bodyClassName="pt0"
                body={
                    <div className="master-recip-data-popup-del">
                        <Row className="listinfo-header-line py12">
                            <Col md={6} className="d-flex align-items-center gap-2">
                                <h4 className="mb0">
                                    {(viewData?.dynamicListName?.length ?? 0) > 50 ? (
                                        <RSTooltip
                                            text={viewData?.dynamicListName ?? ''}
                                            position="top"
                                            className="modalOverlayZindexCSS"
                                        >
                                            <span>{truncateTitle(viewData?.dynamicListName ?? '', 50)}</span>
                                        </RSTooltip>
                                    ) : (
                                        viewData?.dynamicListName ?? ''
                                    )}
                                </h4>
                            </Col>
                            <Col md={6} className="d-flex justify-content-between align-items-center">
                                <h6>
                                    <span>
                                        {CREATED_BY}:{' '}
                                        <span className="RSfirstLetterCaps">{viewData?.createdName ?? ''}</span>
                                        {', '}
                                    </span>
                                    <span>on: {createdDateFormat}</span>
                                </h6>
                            </Col>
                        </Row>

                        <div className="target-info-crossfade-wrapper">
                            <div className="target-info-pane list-panel is-active">
                                <Row className="mt16">
                                    <Col sm={6} className="position-relative">
                                        <h5 className="font-medium mb10">
                                            {DYNAMIC_COMMUNICATION_LINKED}
                                            {!isListInfoLoading && ` (${commsCount})`}
                                        </h5>
                                        {campaignsList?.length === 0 && (
                                            <div className="position-relative">
                                                {[0, 1, 2].map((blockIdx) => (
                                                    <div className="p10" key={blockIdx}>
                                                        <CommonSkeleton width="200px" height={25} box stopAnimation />
                                                        <CommonSkeleton width="300px" height={28} box stopAnimation />
                                                    </div>
                                                ))}
                                                {!isListInfoLoading && (
                                                    <NoDataAvailableRender
                                                        message={NO_COMMUNICATIONS_BLASTED}
                                                        showMessage={!isListInfoLoading}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {campaignsList?.length > 0 && (
                                            <ul
                                                className="infoTwoColumnDivCSS css-scrollbar"
                                                style={{ height: '377px' }}
                                            >
                                                {campaignsList.map((infoItem, index) => (
                                                    <li key={infoItem?.campaignId ?? index}>
                                                        <small>
                                                            {getUserCurrentFormat(infoItem?.startDate)?.dateFormat ?? ''}
                                                        </small>
                                                        <div>{decodeBase64(infoItem?.campaignName)}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </Col>
                                    <Col sm={6}>
                                        <div className="css-scrollbar" style={{ height: '406px' }}>
                                            <Row className="d-none">
                                                <Col sm={12} className="border-bottom mb15 pb15">
                                                    <h5 className="font-medium mb15">
                                                        {AUDIENCE_BY_CHANNEL} (
                                                        {numberWithCommas(viewData?.audienceCount) || 0})
                                                    </h5>
                                                    <ul className="infoTwoColumnSpanCSS px15">
                                                        <li>
                                                            <span>{EMAIL_NAME}</span>
                                                            <span>
                                                                {numberWithCommas(
                                                                    listInfo?.emailPushChannelList?.length,
                                                                ) || 0}
                                                            </span>
                                                        </li>
                                                        <li>
                                                            <span>{MOBILE}</span>
                                                            <span>
                                                                {numberWithCommas(
                                                                    listInfo?.mobilePushChannelList?.length,
                                                                ) || 0}
                                                            </span>
                                                        </li>
                                                        <li>
                                                            <span>{WEB_PUSH}</span>
                                                            <span>
                                                                {numberWithCommas(
                                                                    listInfo?.webPushChannelList?.length,
                                                                ) || 0}
                                                            </span>
                                                        </li>
                                                        <li>
                                                            <span>{WHATS_APP}</span>
                                                            <span>
                                                                {numberWithCommas(
                                                                    listInfo?.whatsappPushChannelList?.length,
                                                                ) || 0}
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </Col>
                                                <Col sm={12} className="border-bottom mb15 pb15">
                                                    <h5 className="font-medium mb15">{DELIVERABILITY}</h5>
                                                    <ul className="infoTwoColumnSpanCSS px15">
                                                        <li>
                                                            <span>{SPAM}</span>
                                                            <span>{numberWithCommas(0) || 0}</span>
                                                        </li>
                                                        <li>
                                                            <span>{BOUNCED}</span>
                                                            <span>{numberWithCommas(0) || 0}</span>
                                                        </li>
                                                        <li>
                                                            <span>{UNSUBSCRIBED}</span>
                                                            <span>{numberWithCommas(0) || 0}</span>
                                                        </li>
                                                    </ul>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                }
            />
        </>
    );
};

export default SegmentInfo;
