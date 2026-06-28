import { getMdcGlyph, GenerateNodeId, GenerateNodePosition } from '../../constant';
import { ch_dynamic_audience, ch_list_audience } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { memo, useContext, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes.js';
import { Card, ListGroup } from 'react-bootstrap';
import CreateWorkFlowContext from '../../context';

const SOURCE_ICON_COLORS = {
    ch_list_audience,
    ch_dynamic_audience,
};
const style = {
    border: '1px dashed gray',
    backgroundColor: 'white',
    padding: '0.5rem 1rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    cursor: 'move',
    float: 'left',
};
const SourceBox = ({ itemIndex, sourceObj, name }) => {
    const [isClickOff, setClickOff] = useState(false);
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const [nodeId] = GenerateNodeId(canvasState);
    let dragCnt = 0;
    const { nodeState } = canvasState;
    useEffect(() => {
        if (!nodeState || nodeState?.length === 0) {
            setClickOff(false);
        } else {
            setClickOff(true);
        }
    }, [nodeState]);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.Source,
        options: {
            dropEffect: 'copy',
        },
        item: { name, listType: sourceObj['id'], nodeId },
        end: (item, monitor) => {
            dragCnt = 0;
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                            } else {
                                dispatchState({
                    type: 'TARGET_LIST_DRAG_END',
                    payload: [],
                });
            }
        },
        collect: (monitor) => ({
            isDragging: (() => {
                let isDragStart = monitor.isDragging();
                                if (isDragStart && !dragCnt) {
                    let Position = GenerateNodePosition({
                        nodes: canvasState,
                        currentNodeId: nodeId,
                        type: 'src',
                        optionList: '',
                    })[0];
                    let placeholderObj = { nodeId, Position };
                                        dragCnt++;
                    dispatchState({
                        type: 'TARGET_LIST_DRAG_START',
                        payload: placeholderObj,
                    });
                }
                return isDragStart;
            })(),
            handlerId: monitor.getHandlerId(),
        }),
    }));

    const opacity = isDragging ? 0.4 : '';
    return (
        <>
            <ListGroup.Item
                className={`border-0 ${isClickOff ? 'pe-none click-off' : ''}`}
                as={'li'}
                key={itemIndex}
                // ref={drag}
                style={{ opacity }}
            >
                <span  ref={drag}>
                <i
                    className={`${getMdcGlyph(sourceObj.icon)} color-body-bg-color icon-xl`}
                    style={{ backgroundColor: SOURCE_ICON_COLORS[sourceObj.color] ?? '' }}
                ></i>
                <Card.Text className="font-xxs lh14 pt5" title={sourceObj.label}>
                    {' '}
                    {sourceObj.label}{' '}
                </Card.Text>
                </span>
            </ListGroup.Item>
        </>
    );
};
export default memo(SourceBox);
