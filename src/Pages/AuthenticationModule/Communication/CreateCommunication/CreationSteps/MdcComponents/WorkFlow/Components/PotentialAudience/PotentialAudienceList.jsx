import { formatNumber } from 'Utils/modules/campaignUtils';
import { numberWithCommas } from 'Utils/modules/formatters';
import { circle_info_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomToggle from 'Components/RSHeader/Component/CustomToggle';
import RSTooltip from 'Components/RSTooltip';

import Icon from 'Components/Icon/Icon';

import { getCount, getCustomizedReceipientList, getCustomizedReceipientListRecursiveFlow } from './PotentialConst';
import CreateWorkFlowContext from '../../context';
import useQueryParams from 'Hooks/useQueryParams';
import { useDispatch, useSelector } from 'react-redux';

import {
    handlePersonalizationFetchApiCall,
    handleUpdateEditAudienceCount,
    COMMUNICATION_CHANNEL_ID,
    getRecipientCountFieldForNumericChannelId,
    eligibleStatusIdAudienceUpdateCount,
} from '../../../../Create/constant';
import { getSessionId } from 'Reducers/globalState/selector';
import { MDC_CHANNEL_AND_ACTION_TEMPLATE } from '../../mdcJsonConfigConstant';

const MDC_HTML_CH = { WEB_PUSH: 'ch008', MOBILE_PUSH: 'ch0014' };

function getNumericChannelIdFromMdcHtml(htmlChannelId) {
    if (!htmlChannelId || typeof htmlChannelId !== 'string') return null;
    const row = MDC_CHANNEL_AND_ACTION_TEMPLATE.MDCChannel.find((ch) => ch.htmlId === htmlChannelId);
    const v = row?.value;
    if (v == null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
}

function filterRowsBySegmentIds(rows, segmentIdSet) {
    if (!segmentIdSet?.size) return rows ?? [];
    return (rows ?? []).filter((a) => segmentIdSet.has(a.segmentationListId));
}

function sumRowsByField(rows, countField) {
    return (rows ?? []).reduce((sum, row) => sum + (Number(row[countField]) || 0), 0);
}

function getMdcAuthoringPushAudienceTotal({ channelHtmlId, location, notification, isEligibleAudienceUpdate }) {
    const isWeb = channelHtmlId === MDC_HTML_CH.WEB_PUSH;
    const channelId = isWeb
        ? COMMUNICATION_CHANNEL_ID.WEB_NOTIFICATION
        : COMMUNICATION_CHANNEL_ID.MOBILE_NOTIFICATION;
    const countField = isWeb ? 'recipientCountWebPush' : 'recipientCountMobilePush';
    const segmentIdSet = new Set(location?.selectedSegementIds ?? []);
    const pool = isWeb ? notification?.web?.audienceList : notification?.mobile?.audienceList;
    if (location?.audience?.length) {
        const merged = handleUpdateEditAudienceCount({
            channelId,
            audience: location.audience,
            savedAudienceCountList: location?.savedAudienceCountList || [],
            statusId: location?.mdcContentStatusId,
        });
        let finalAudienceList = isEligibleAudienceUpdate ? merged : pool?.length ? pool : location.audience
        return sumRowsByField(filterRowsBySegmentIds(finalAudienceList, segmentIdSet), countField);
    }
}

function getMdcAuthoringChannelAudienceTotal({ numericChannelId, location, isEligibleAudienceUpdate }) {
    const countField = getRecipientCountFieldForNumericChannelId(numericChannelId);
    if (!countField || !location?.audience?.length) return null;

    const merged = handleUpdateEditAudienceCount({
        channelId: numericChannelId,
        audience: location.audience,
        savedAudienceCountList: location?.savedAudienceCountList || [],
        statusId: location?.mdcContentStatusId,
    });
    const segmentIdSet = new Set(location?.selectedSegementIds ?? []);
    let finalAudienceList = isEligibleAudienceUpdate ? merged : location.audience
    return sumRowsByField(filterRowsBySegmentIds(finalAudienceList, segmentIdSet), countField);
}

const PotentialAudienceList = ({ receipientList, tooltipPosition }) => {
    const [totalCount, setTotalCount] = useState(0);
    const [customizedReceipientList, setCustomizedReceipientList] = useState([]);
    const { pathname } = useLocation();
    const location = useQueryParams('/communication/create-mdc-communication');

    const dispatch = useDispatch()
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { listTypeWisePersonlization, personalization } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));

    useEffect(() => {
        if (receipientList?.length && canvasState?.['MdcType'] === 'RecursivelyTraverse_React') {
            const count = getCount(receipientList, 'recipientCount');
            setTotalCount(count);
            const { customizedList } = getCustomizedReceipientList({ receipientList });
            setCustomizedReceipientList(customizedList);
        } else if (canvasState?.['MdcType'] === 'RecursivelyTraverse') {
            setTotalCount(canvasState?.ReceipientCount);
            const { customizedList } = getCustomizedReceipientListRecursiveFlow({ receipientList });
            setCustomizedReceipientList(customizedList);
        } else {
            setTotalCount(0);
        }
    }, [receipientList, canvasState]);

    const handlePersonalizationData = async (audienceList) => {
        const payloadParams = {
            departmentId,
            clientId,
            userId,
        };
        const hasAnyTargetListData = Object.keys(listTypeWisePersonlization || {})
            .filter((key) => key.startsWith('5|'))
            .some((key) => listTypeWisePersonlization[key]?.length > 0);

        const hasType5 = Object.keys(listTypeWisePersonlization || {}).some((key) => key.startsWith('5|'));

        const shouldCallAdhocApi = audienceList?.some((item) => {
            if (item.listType === 1) {
                const key = `1|${item.segmentListId}`;
                return !listTypeWisePersonlization[key]?.length;
            }
            return false;
        });

        const shouldCallTargetApi = !hasType5 && !hasAnyTargetListData && !personalization?.length;
        if ((shouldCallTargetApi || shouldCallAdhocApi)) {
            await handlePersonalizationFetchApiCall({
                audience: audienceList,
                errors: {},
                dispatch,
                payloadParams,
                listTypeWisePersonlization,
            });
        }
    };

    useEffect(() => {
        if (location?.audience?.length) {
            handlePersonalizationData(location?.audience);
        }
    }, [location?.audience]);

    if (pathname.includes('create-mdc-communication')) {
        const isEligibleAudienceUpdate = eligibleStatusIdAudienceUpdateCount?.includes(location?.mdcContentStatusId)
        const mdcChannelId = location?.mdcContentSetupDetails?.channelId;
        const isPushAuthoring =
            mdcChannelId === MDC_HTML_CH.WEB_PUSH || mdcChannelId === MDC_HTML_CH.MOBILE_PUSH;

        if (isPushAuthoring) {
            const authoringTotal = getMdcAuthoringPushAudienceTotal({
                channelHtmlId: mdcChannelId,
                location,
                notification,
                isEligibleAudienceUpdate
            });
            return (
                <RSTooltip
                    text={numberWithCommas(authoringTotal)}
                    position={tooltipPosition ?? 'top'}
                    className="d-inline-block"
                >
                    <h4>{numberWithCommas(authoringTotal)}</h4>
                </RSTooltip>
            );
        }

        const numericChannelId = getNumericChannelIdFromMdcHtml(mdcChannelId);
        const otherChannelTotal =
            numericChannelId != null ? getMdcAuthoringChannelAudienceTotal({ numericChannelId, location, isEligibleAudienceUpdate }) : null;
        if (otherChannelTotal != null) {
            return (
                <RSTooltip
                    text={numberWithCommas(otherChannelTotal)}
                    position={tooltipPosition ?? 'top'}
                    className="d-inline-block"
                >
                    <h4>{numberWithCommas(otherChannelTotal)}</h4>
                </RSTooltip>
            );
        }

        if (location?.potentialAudience) {
            return (
                <RSTooltip
                    text={numberWithCommas(location?.potentialAudience)}
                    position={tooltipPosition ?? 'top'}
                    className="d-inline-block"
                >
                    <h4>{numberWithCommas(location?.potentialAudience)}</h4>
                </RSTooltip>
            );
        }
        return <h4>0</h4>;
    }
    return (
        <ul className="d-flex">
            <div className="mdc-pa-number">{numberWithCommas(totalCount)}</div>
            <div className="mdc-pa-info">
                <div className="rs-platform-dropdown-wrapper">
                    <Dropdown className={`rs-dropdown rsd-header ${!totalCount ? 'click-off' : ''} `}>
                        <Dropdown.Toggle as={CustomToggle} className="no-hover">
                            <Icon
                                icon={circle_info_mini}
                                id="rs_data_circle_info"
                                tooltip="Potential audience"
                                position="top"
                                size="xs"
                                color="color-primary-blue"
                                onClick={() => {
                                }}
                            />
                        </Dropdown.Toggle>
                        {customizedReceipientList && (
                            <div className="mdc-megamenu">
                                <Dropdown.Menu>
                                    {customizedReceipientList.map((receipient, index) => {
                                        let dFlex = index % 2 === 0 ? true : false;
                                        return (
                                            <div className={`col-6 bg ${dFlex ? '1' : '2'} `} key={index}>
                                                <Dropdown.Item
                                                    className={`d-flex align-items-center ${receipient.mainClass}`}
                                                >
                                                    <div className={`rs-notification-icon-wrapper ${receipient.class}`}>
                                                        <Icon
                                                            icon={receipient.icon}
                                                            tooltip=""
                                                            size="md"
                                                            color={'white'}
                                                            mainClass={''}
                                                            iconClass=""
                                                        />
                                                    </div>
                                                    <div className="rs-notification-content lh22">
                                                        <p>{receipient.channelName}</p>
                                                        <div className="fs19 font-bold">
                                                            {receipient.count > 999
                                                                ? formatNumber(receipient.count)
                                                                : receipient.count}
                                                        </div>
                                                    </div>
                                                </Dropdown.Item>
                                            </div>
                                        );
                                    })}
                                </Dropdown.Menu>
                            </div>
                        )}
                    </Dropdown>
                </div>
            </div>
        </ul>
    );
};

export default PotentialAudienceList;