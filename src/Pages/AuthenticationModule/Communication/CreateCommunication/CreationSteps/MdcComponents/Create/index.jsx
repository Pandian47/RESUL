import { useEffect, useLayoutEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Container } from 'react-bootstrap';

import _get from 'lodash/get';

import CampaignInfoCard from '../../Component/CampaignInfoCard/CampaignInfoCard';
import MdcContentHeader from './Components/MdcContentHeader';
import PotentialAudienceList from '../WorkFlow/Components/PotentialAudience/PotentialAudienceList';
import { MDC_AUTHORING_CHANNEL_CONFIG } from './constant';
import { isGenie } from '../../Create/constant';
import { getSessionId } from 'Reducers/globalState/selector';
import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import { updateMDCEditMode } from 'Reducers/communication/createCommunication/Create/reducer';
import { updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import useQueryParams from 'Hooks/useQueryParams';
import { getUserListCampaign } from 'Reducers/globalState/request';
import { MDC_SUPPRESS_GLOBAL_LOADER } from 'Components/Skeleton/pages/communication/authoring';
import { MdcAuthoringLoadSkeleton } from 'Components/Skeleton/pages/communication/mdcAuthoring';
const CreateMdcCommunication = () => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');

    const { selectedRecipientList } = useSelector(({ mdcCanvasFlowReducer }) => mdcCanvasFlowReducer);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));

    const [authoringChannel, SetAuthoringChannel] = useState(null);
    const [channelName, setChannelName] = useState('');
    const [channelId, setChannelId] = useState('');

    useEffect(() => {
        if (location?.savedChannelsId) {
            dispatch(updateSaveChannelsId(location.savedChannelsId));
        }
        if (_get(location, 'mode', 'create') === 'edit') {
            dispatch(updateMDCEditMode('edit'));
        }
    }, [location, dispatch]);
    const [mdcChannelNumericId, setMdcChannelNumericId] = useState(1);
    const [isMdcBootstrapping, setIsMdcBootstrapping] = useState(true);

    useLayoutEffect(() => {
        if (!location || !Object.keys(location)?.length) {
            return;
        }
        const mdcChannelId = _get(location, 'mdcContentSetupDetails.channelId', 0);
        const selectedChannel = MDC_AUTHORING_CHANNEL_CONFIG.find((item) => item.channelId === mdcChannelId);
        if (selectedChannel) {
            const { component, channelName: name } = selectedChannel;
            SetAuthoringChannel(component);
            setChannelName(name);
            setChannelId(mdcChannelId);
            setMdcChannelNumericId(selectedChannel.id ?? 1);
        }
    }, [location]);

    useEffect(() => {
        let cancelled = false;

        async function bootstrapMdcAuthoring() {
            if (!location || !Object.keys(location)?.length) {
                if (!cancelled) {
                    setIsMdcBootstrapping(false);
                }
                return;
            }

            setIsMdcBootstrapping(true);
            const payload = { departmentId, clientId, userId };
            const smartUrlPayload = { ...payload, campaignId: _get(location, 'campaignId', 0) };

            if (cancelled) {
                return;
            }
            try {
                await Promise.all([
                    dispatch(getPersonalizationFields({ payload, ...MDC_SUPPRESS_GLOBAL_LOADER })),
                    dispatch(
                        getUserListCampaign({
                            payload: { ...payload, loggedinusertype: 0 },
                            ...MDC_SUPPRESS_GLOBAL_LOADER,
                        }),
                    ),
                    dispatch(
                        getSmartUrl({
                            payload: smartUrlPayload,
                            reduceLoad: true,
                            ...MDC_SUPPRESS_GLOBAL_LOADER,
                        }),
                    ),
                ]);
            } finally {
                if (!cancelled) {
                    setIsMdcBootstrapping(false);
                }
            }
        }

        bootstrapMdcAuthoring();
        return () => {
            cancelled = true;
        };
    }, [location, clientId, departmentId, userId, dispatch]);

    const showMdcLoadSkeleton = isMdcBootstrapping || !authoringChannel;

    return (
        <>
            {showMdcLoadSkeleton ? (
                <div className="mdc-authoring-skeleton-scope mdc-authoring-skeleton-scope--no-header">
                    <MdcAuthoringLoadSkeleton channelId={mdcChannelNumericId} showPageShell />
                </div>
            ) : (
                <Container className="col-10">
                    <div className="page-content">
                        <CampaignInfoCard
                            type="create"
                            className="mt21"
                            tooltipPosition="bottom"
                            PotentialAudienceList={
                                <PotentialAudienceList
                                    tooltipPosition="bottom"
                                    receipientList={selectedRecipientList}
                                />
                            }
                        />
                        <MdcContentHeader
                            title={`${channelName} ${channelId !== 'ch003' ? 'content' : ''}`}
                        />
                        {authoringChannel}
                    </div>
                </Container>
            )}
        </>
    );
};

export default CreateMdcCommunication;
