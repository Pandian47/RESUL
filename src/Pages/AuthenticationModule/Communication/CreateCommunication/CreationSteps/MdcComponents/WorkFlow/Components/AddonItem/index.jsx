import { memo, useContext, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';
import { Switch } from '@progress/kendo-react-inputs';
import CreateWorkFlowContext from '../../context';
import { getSessionId } from 'Reducers/globalState/selector';
import { updatAllOrAny } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { buildAllOrAnyPayload } from './AddonConst';
import useQueryParams from 'Hooks/useQueryParams';

export default memo(({ data, isConnectable }) => {
    const dispatch = useDispatch();
    //const { state: locationState } = useLocation();
    const locationState = useQueryParams('/communication');
    const [campaignId, setCampaignId] = useState(0);

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { nodeState } = canvasState;
    const [allOrAny, setAllOrAny] = useState(true);
    
    useEffect(() => {
        if (locationState && Object.keys(locationState)?.length) {
            const { campaignId } = locationState;
            setCampaignId(campaignId);
        }
    }, [locationState]);
    const handleAllOrAny = (event) => {
        const isALLorAny = event.target.value ? 'All' : 'Any';
        const { currentWindowId } = data;
        const payload = { userId, clientId, departmentId, campaignId, isALLorAny };
        const rsltPayload = buildAllOrAnyPayload({ currentWindowId, canvasState, payload });
        dispatch(updatAllOrAny({ payload: rsltPayload })).then(() => {
            dispatchState({
                type: 'UPDATE_ALL_OR_ANY',
                payload: { currentWindowId, isALLorAny },
            });
        });
        setAllOrAny(!allOrAny);
    };

    useEffect(() => {
        let checked = data?.SelectionMode === 'All' ? true : false;
        setAllOrAny(checked);
    }, [data['SelectionMode']]);
    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                style={{ bottom: 0, top: 12, left: -3, right: 'auto', visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="single"
            />
            {/* <Handle
                type="source"
                position={Position.Top}
                style={{ bottom: 5, top: 'auto', right: -7, left: 'auto', visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="A1"
            /> */}

            <Handle
                type="source"
                position={Position.Top}
                style={
                    !data?.isCurveLine
                        ? { bottom: 5, top: 'auto', right: 20, left: 'auto', visibility: 'hidden' }
                        : { bottom: 3, top: 'auto', right: 10, left: 'auto', visibility: 'hidden' }
                }
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="A1"
            />
            <div className={`position-relative bottom3 ${data.disabled ? 'pe-none click-off' : ''}`}>
            <Switch
                disabled={false}
                onChange={handleAllOrAny}
                checked={allOrAny}
                onLabel={'All'}
                offLabel={'Any'}
            />
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                style={
                    !data?.isCurveLine
                        ? { bottom: 10, top: 'auto', right: 20, left: 'auto', visibility: 'hidden' }
                        : { bottom: 10, top: 'auto', right: -7, left: 'auto', visibility: 'hidden' }
                }
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="A2"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                style={
                    !data?.isCurveLine
                        ? { bottom: 10, top: 'auto', right: 20, left: 'auto', visibility: 'hidden' }
                        : { bottom: 9, top: 'auto', right: -7, left: 'auto', visibility: 'hidden' }
                }
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="A3"
            />

            <Handle
                type="source"
                position={Position.Bottom}
                style={
                    !data?.isCurveLine
                        ? { bottom: 10, top: 'auto', right: 20, left: 'auto', visibility: 'hidden' }
                        : { bottom: 9, top: 'auto', right: -7, left: 'auto', visibility: 'hidden' }
                }
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="A4"
            />
        </>
    );
});
