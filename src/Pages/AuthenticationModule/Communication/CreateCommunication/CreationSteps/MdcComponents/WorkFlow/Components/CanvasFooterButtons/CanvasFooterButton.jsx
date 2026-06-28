import { encodeUrl } from 'Utils/modules/crypto';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RSButton, RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';

import SaveAsTemplate from '../Templates/SaveAsTemplate';

import { getSessionId } from 'Reducers/globalState/selector';
import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import useQueryParams from 'Hooks/useQueryParams';

import { resetMDC } from 'Reducers/communication/createCommunication/Mdc/Canvas/reducer';
const CanvasFooterButton = ({ canvasReset, onSave, onCancel }) => {
    const [isShowSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
    const [primaryGoal, setPrimaryGoal] = useState('R');
    const [campaignId, setCampaignId] = useState(0);
    const [isChannelEnabled, setChannelEnabled] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    //const { state: locationState } = useLocation();
    const locationState = useQueryParams('/communication') || {};
    //const { campaignId, primaryGoal } = locationState;
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { handlePriorityApi } = useContext(CreateWorkFlowOtherContext);

    useEffect(() => {
        const { campaignId, primaryGoal } = locationState;
        setPrimaryGoal(primaryGoal);
        setCampaignId(campaignId);
    }, [locationState]);
    const handleClose = () => {
        setShowSaveAsTemplate(false);
    };
    const handleCanvasReset = () => {
        canvasReset(true);
    };
    const handlePreCampaignSummary = async () => {
        if (
            canvasState?.dataSource?.Type === 'QR' &&
            canvasState?.Campaign?.CanvasChannel?.activeChannel[0]?.ChannelId === 'ch003' &&
            canvasState?.Campaign?.CanvasChannel?.activeChannel?.length === 1 &&
            !canvasState?.Campaign?.CanvasChannel?.activeChannel[0]?.activeChannel[0]?.ScheduleDate &&
            !canvasState?.Campaign?.CanvasChannel?.activeChannel[0]?.activeChannel[0]?.ContentThumbnailPath
        ) {
            dispatch(resetMDC());
            navigate('/communication', {
                index: 0,
            });
        } else {
            const response = await handlePriorityApi();
            if (response?.status) {
                dispatch(resetMDC());
                let url = '/communication/execute';
                const encryptState = encodeUrl(locationState);
                navigate(`${url}?q=${encryptState}`, {
                    locationState,
                });
            }
        }
    };
    useEffect(() => {
        if (canvasState?.Campaign?.CanvasChannel?.activeChannel?.length) {
            const channelDetailIdList = canvasState?.Campaign?.CanvasChannel?.activeChannel.filter(
                (item) => item.ChannelDetailID > 0,
            );
            if (channelDetailIdList?.length) {
                setChannelEnabled(true);
            } else {
                setChannelEnabled(false);
            }
        } else {
            setChannelEnabled(false);
        }
    }, [canvasState]);
    return (
        <>
            <RSSecondaryButton onClick={onCancel}>Cancel</RSSecondaryButton>
            {/* <RSSecondaryButton onClick={handleCanvasReset}>Reset</RSSecondaryButton> */}
            <RSButton as="span" className={`mdc-save-btn`}>
                <RSBootstrapdown
                    data={['Save', 'Save as new template']}
                    defaultItem={'Save |'}
                    className=""
                    alignRight
                    disbleItems={canvasState?.nodeState?.length === 0 ? ['Save as new template'] : []}
                    showUpdate={false}
                    onSelect={(item) => {
                        if (item === 'Save') onSave();
                        else if ('Save as new template') setShowSaveAsTemplate(true);
                    }}
                />
            </RSButton>
            {/* <Dropdown as={ButtonGroup} drop={'down'} align={'right'} className="mdc-save-btn">
                <RSButton onClick={onSave}>Save</RSButton>
                <Dropdown.Toggle split />
                <Dropdown.Menu>
                    <Dropdown.Item as="button" onClick={onSave}>
                        Save
                    </Dropdown.Item>
                    <Dropdown.Item as="button" onClick={() => setShowSaveAsTemplate(true)}>
                        Save as template
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown> */}
            <RSPrimaryButton className={`${!isChannelEnabled ? 'click-off' : ''}`} onClick={handlePreCampaignSummary}>
                Next
            </RSPrimaryButton>

            {isShowSaveAsTemplate && (
                <SaveAsTemplate
                    isShowSaveAsTemplate={isShowSaveAsTemplate}
                    primaryGoal={primaryGoal}
                    handleClose={handleClose}
                />
            )}
        </>
    );
};

export default CanvasFooterButton;
