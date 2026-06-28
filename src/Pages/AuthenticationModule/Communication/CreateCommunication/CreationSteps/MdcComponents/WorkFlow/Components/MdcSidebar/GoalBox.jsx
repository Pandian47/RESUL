import { getMdcGlyph } from '../../constant';
import { useState, useContext, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Card, ListGroup } from 'react-bootstrap';
import CreateWorkFlowContext from '../../context';
import { rootNodeLength } from '../../constant';

import CanvasWarning from '../Modal/CanvasWarning.jsx';
import { DROP_WARN_GOAL } from 'Constants/GlobalConstant/Placeholders';
const style = {
    border: '1px dashed gray',
    backgroundColor: 'white',
    padding: '0.5rem 1rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    cursor: 'move',
    float: 'left',
};

const GoalBox = ({ itemIndex, channelObj, name }) => {
    const [isClickOff, setClickOff] = useState(false);
    const [isShowCanvasWarning, setCanvasWarning] = useState({
        showModal: false,
        warningMessage: DROP_WARN_GOAL,
    });
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { nodeState, edgeState } = canvasState;
    const { showModal, warningMessage } = isShowCanvasWarning;
    const nodeStateLength = nodeState?.length;
    let dragCnt = 0;
        useEffect(() => {
        if (!nodeState || nodeState?.length === 0 || rootNodeLength(canvasState) == 0) {
            setClickOff(true);
        } else {
            setClickOff(false);
        }
    }, [nodeState]);
    const [{ isDragging, handlerId }, drag] = useDrag(() => ({
        type: 'LP',
        item: {
            name,
            listType: channelObj['id'],
            icon: channelObj['icon'],
            bgClassName: channelObj['className'],
            friendlyName: channelObj['friendlyName'],
        },
        options: { dropEffect: 'copy', nodeState },
        end: (item, monitor) => {
            dragCnt = 0;
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                                if (dropResult?.hasOwnProperty('dropError')) {
                    setCanvasWarning((pre) => ({
                        ...pre,
                        showModal: true,
                        warningMessage: dropResult?.dropError?.isChannelPlaceholder
                            ? dropResult?.dropError?.message
                            : pre?.warningMessage || DROP_WARN_GOAL,
                    }));
                }

                dispatchState({
                    type: 'CHANNEL_DRAG_END',
                    payload: [],
                });
            }
        },
        collect: (monitor) => ({
            isDragging: (() => {
                let isDragStart = monitor.isDragging() ? true : false;
                return isDragStart;
            })(),
            handlerId: monitor.getHandlerId(),
        }),
    }));

    const opacity = isDragging ? 0.4 : '';

    if (showModal) {
        return (
            <CanvasWarning
                show={showModal}
                warnText={warningMessage}
                handleClose={() => {
                    setCanvasWarning((pre) => ({
                        showModal: false,
                        warningMessage: '',
                    }));
                }}
            />
        );
    }

    return (
        <>
            <ListGroup.Item
                className={`border-0 ${isClickOff || channelObj['draggable'] == false ? 'click-off' : ''}`}
                as="li"
                key={itemIndex}
                draggable={channelObj.draggable}
                ref={drag}
                style={{ opacity }}
            >
                <i
                    className={`color-body-bg-color text-center icon-md ${getMdcGlyph(channelObj.icon)} ${
                        channelObj.className
                    }`}
                ></i>
                <Card.Text className="card-text font-xxs lh14 pt5 text-center width68" title={channelObj.label}>
                    {channelObj.label}
                </Card.Text>
            </ListGroup.Item>
        </>
    );
};

export default GoalBox;
