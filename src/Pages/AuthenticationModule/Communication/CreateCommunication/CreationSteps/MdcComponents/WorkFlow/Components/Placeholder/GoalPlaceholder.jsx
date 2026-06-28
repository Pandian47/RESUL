import { memo, useContext, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Handle, Position } from 'reactflow';
import { useSelector } from 'react-redux';
import CreateWorkFlowContext from '../../context';
import { ItemTypes } from '../MdcSidebar/ItemTypes';
import { getSessionId } from 'Reducers/globalState/selector';
import { findChannelExistForLp } from '../../constant';
import { DROP_WARN_CHANNEL } from 'Constants/GlobalConstant/Placeholders';
export default memo(({ data, allowedDropEffect }) => {
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { defaultEle, nodeState } = canvasState;
        const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [canvasNode, setCanvasNode] = useState([...nodeState]);
    useEffect(() => {
        setCanvasNode(nodeState);
    }, [nodeState]);
    const [{ canDrop, isOver }, drop] = useDrop(
        () => ({
            accept: ['LP', ItemTypes.Source],
            drop: (item, monitor) => {
                                                if (item.listType.includes('goal00')) {
                    let stateVal = canvasNode.filter((canvasItem) => canvasItem.id === data.currentWindowId)[0];
                                        let friendlyNameWindowId = data.currentWindowId.split('flowchartWindow')[1];
                    let rslt = findChannelExistForLp(
                        canvasState['Campaign']['CanvasChannel']['activeChannel'],
                        item.listType,
                    );
                    let custChannelId = 0;
                    if (rslt?.value && Object.keys(rslt.value)?.length) {
                        custChannelId = 'goal002';
                    }
                                        stateVal.type = 'GoalItem';
                    stateVal.className = 'goal-item-dropped';
                    stateVal.sourcePosition = 'right';
                    stateVal.targetPosition = 'left';
                    let tempData = {
                        channelId: !custChannelId ? item.listType : custChannelId,
                        channelIcon: item.icon,
                        channelBgClassName: item.bgClassName,
                        channelFriendlyName: `{ ${item.friendlyName}${friendlyNameWindowId} }`,
                        nodeId: stateVal.id,
                        selectedAudienceList: data.selectedAudienceList,
                    };
                    stateVal.data = { ...stateVal['data'], ...tempData };
                                        dispatchState({
                        type: 'CHANNEL_DROP',
                        payload: stateVal,
                    });
                } else {
                    return {
                        dropError: {
                            type: 'channelSource',
                            message: DROP_WARN_CHANNEL,
                            isGoalPlaceholder: true,
                        },
                    };
                }
            },
            collect: (monitor, connect) => ({
                isOver: (() => {
                                        return monitor.isOver();
                })(),
                canDrop: (() => {
                                        return monitor.canDrop();
                })(),
            }),
        }),
        [allowedDropEffect],
    );

    const isActive = canDrop && isOver;
    const borderColor = selectBackgroundColor(isActive, canDrop);
    return (
        <div className="placeholder-text res-mdc-placeholder" ref={drop} style={{ borderColor }}>
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#555', visibility: 'hidden', right: 0, left: -2 }}
                onConnect={(params) => {}}
                isConnectable={`true`}
            />
            <div> {isActive ? 'Release to drop' : 'Drop here'} </div>
        </div>
    );
});

const selectBackgroundColor = (isActive, canDrop) => {
    if (isActive) {
        return '#2914d3';
    } else if (canDrop) {
        return 'red';
    } else {
        return '#a99c9c';
    }
};
