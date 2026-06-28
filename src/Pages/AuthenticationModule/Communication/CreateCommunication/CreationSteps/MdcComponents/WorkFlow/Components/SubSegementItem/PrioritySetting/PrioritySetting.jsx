import { drag_handle_large } from 'Constants/GlobalConstant/Glyphicons';
import { OK } from 'Constants/GlobalConstant/Placeholders';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState, useContext, useRef } from 'react';
import CreateWorkFlowContext from '../../../context';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
const ItemType = 'PRIORITY_ITEM';

const DraggableItem = ({ item, index, moveItem }) => {
    const ref = useRef(null);

    const [, drag] = useDrag({
        type: ItemType,
        item: { index },
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (draggedItem, monitor) => {
            if (!ref.current) return;

            const dragIndex = draggedItem.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveItem(dragIndex, hoverIndex);
            draggedItem.index = hoverIndex;
        },
    });

    drag(drop(ref));

    return (
        <div ref={ref} className="draggable-item d-flex align-items-center">
            <div className="d-flex pl10 py10">
                <i className={`${drag_handle_large} icon-xmd color-primary-grey`}></i>
            </div>
            <div className="d-flex py10">
                <div
                    className={`elementCircleIconCSSnew ${
                        item?.data?.isSubSegmentSave ? (item?.data?.isExtractionStatus ? 'bg-primary-orange' : 'bg-secondary-green') : 'bg-primary-grey'
                    } `}
                >
                    <i className="icon-rs-subsegment-medium"></i>
                </div>
                <div>
                    <span className="drag-handle pl10">{item?.data?.friendlyName}</span>
                </div>
            </div>
        </div>
    );
};

const PrioritySetting = ({ handlePriority, setPriorityModal }) => {
    const { canvasState } = useContext(CreateWorkFlowContext);
    const {
        Campaign: {
            CanvasChannel: { activeChannel },
        },
        subSegment: { subSegmentList },
    } = canvasState;

    const prioritywiseSubSegmentNodeList = canvasState.nodeState
        .filter((node) => node.type === 'SubSegmentItem')
        .sort((segmentA, segmentB) => segmentA.data.priority - segmentB.data.priority);

    const [priorityList, setPriorityList] = useState(prioritywiseSubSegmentNodeList);

    const moveItem = (fromIndex, toIndex) => {
        const updatedList = [...priorityList];
        const [movedItem] = updatedList.splice(fromIndex, 1);
        updatedList.splice(toIndex, 0, movedItem);

        const newPriorityList = updatedList.map((item, index) => ({
            ...item,
            data: {
                ...item.data,
                priority: index + 1,
            },
        }));
        setPriorityList(newPriorityList);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="priority-list">
                {priorityList.map((item, index) => (
                    <DraggableItem
                        key={item.id || item.data?.id || index}
                        index={index}
                        item={item}
                        moveItem={moveItem}
                    />
                ))}
            </div>
            <div className="d-flex justify-content-end mt20">
                <RSSecondaryButton onClick={() => setPriorityModal(false)}>Cancel</RSSecondaryButton>
                <RSPrimaryButton
                    onClick={() => {
                        handlePriority(priorityList);
                    }}
                >
                    {OK}
                </RSPrimaryButton>
            </div>
        </DndProvider>
    );
};

export default PrioritySetting;
