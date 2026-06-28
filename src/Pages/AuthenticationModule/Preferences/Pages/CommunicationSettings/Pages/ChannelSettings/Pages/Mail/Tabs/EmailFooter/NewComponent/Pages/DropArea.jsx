import { Fragment, createRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import ColumnComponent from './ColumnComponent';
import { useSelectedComponent } from './SelectedComponentContext';

const ItemTypes = {
    TEXT: 'text',
    IMAGE: 'image',
    BUTTON: 'button',
    COLUMN: 'column',
    DIVIDER: 'divider',
};

const DropArea = ({ ItemTypes = {}, droparea, onDuplicate }) => {
    const {
        components,
        setComponents,
        setSelectedComponent,
        isOtherDragged,
        componentRefs,
        hoverState,
        setHoverState,
        isColumnDragged,
    } = useSelectedComponent();

    const handleClick = (e) => {
        setSelectedComponent('Layout');
    };

    const keywords = ['contain', 'cover', 'auto'];

    const isWidthKeyword = keywords.includes(droparea.bgWidth);
    const isHeightKeyword = keywords.includes(droparea.bgHeight);

    const bgSize = isWidthKeyword && isHeightKeyword ? 'contain' : `${droparea.bgWidth} ${droparea.bgHeight}`;

    return (
        <div className="drop-area-outer">
            <div className="">
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: `${droparea.width}px` || '',
                        backgroundColor: droparea.bgColor ? droparea.bgColor : '#ffffff',
                        backgroundImage: `url(${droparea.bgImage})`,
                        backgroundRepeat: droparea.bgRepeat,
                        backgroundPosition: `${droparea.bgPositionX} ${droparea.bgPositionY}`,
                        backgroundSize: bgSize,
                        position: 'relative',
                        padding: '5px',
                        borderRadius: `${droparea.borderRadius}px` || '',
                        textAlign: droparea.alignment || '',
                        gap: `${droparea.gap}px` || '4px',
                        borderTop:
                            droparea.commonborder && droparea.borderTop
                                ? `${droparea.borderthickness || 1}px ${droparea.borderStyle.value || 'solid'} ${
                                      droparea.borderColor || 'black'
                                  }`
                                : 'unset',
                        borderRight:
                            droparea.commonborder && droparea.borderRight
                                ? `${droparea.borderthickness || 1}px ${droparea.borderStyle.value || 'solid'} ${
                                      droparea.borderColor || 'black'
                                  }`
                                : 'unset',
                        borderBottom:
                            droparea.commonborder && droparea.borderBottom
                                ? `${droparea.borderthickness || 1}px ${droparea.borderStyle.value || 'solid'} ${
                                      droparea.borderColor || 'black'
                                  }`
                                : 'unset',
                        borderLeft:
                            droparea.commonborder && droparea.borderLeft
                                ? `${droparea.borderthickness || 1}px ${droparea.borderStyle.value || 'solid'} ${
                                      droparea.borderColor || 'black'
                                  }`
                                : 'unset',
                        border: '1px dotted color-primary-blue',
                    }}
                    onClick={handleClick}
                >
                    {components.map((component, index) => {
                        if (!componentRefs.current[component.id]) {
                            componentRefs.current[component.id] = createRef();
                        }
                        const isHovered = hoverState.hoveredId === component.id;
                        const isBeforeHovered = hoverState.isBeforeHovered;

                        return (
                            <Fragment key={component.id}>
                                <DraggableComponent
                                    item={component}
                                    id={component.id}
                                    type={component.type}
                                    index={index}
                                    isOtherDragged={isOtherDragged}
                                    componentRefs={componentRefs}
                                    setHoverState={setHoverState}
                                    hoverState={hoverState}
                                    isColumnDragged={isColumnDragged}
                                    components={components}
                                    setComponents={setComponents}
                                >
                                    {component.type === ItemTypes.COLUMN ? (
                                        <div ref={componentRefs.current[component.id]} key={component.id}>
                                            {isHovered && isBeforeHovered && (
                                                <div className="drop-line-container">
                                                    <span className="drop-text">Drop here</span>
                                                    <div className="drop-line"></div>
                                                </div>
                                            )}

                                            <ColumnComponent
                                                ItemTypes={ItemTypes}
                                                item={component}
                                                onDuplicate={onDuplicate}
                                                isOtherDragged={isOtherDragged}
                                            />
                                            {isHovered && !isBeforeHovered && (
                                                <div className="drop-line-container">
                                                    <span className="drop-text">Drop here</span>
                                                    <div className="drop-line"></div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </DraggableComponent>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const DraggableComponent = ({
    id,
    type,
    children,
    index,
    setHoverState,
    componentRefs,
    isColumnDragged,
    components,
    setComponents,
    item,
}) => {
    const [{ isDragging }, drag] = useDrag({
        type: type,
        item: item,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: [ItemTypes.TEXT, ItemTypes.IMAGE, ItemTypes.BUTTON, ItemTypes.COLUMN, ItemTypes.DIVIDER],
        hover: (item, monitor) => {
            if (item.id !== id) {
                if (item && item.type === 'column') {
                    const hoverBoundingRect = componentRefs.current[id].current?.getBoundingClientRect();
                    if (!hoverBoundingRect) return;
                    const clientOffset = monitor.getClientOffset();
                    if (!clientOffset) return;
                    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
                    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
                    const isBefore = hoverClientY < hoverMiddleY;
                    setHoverState({ hoveredId: id, isBeforeHovered: isBefore });
                }
            }
        },
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            setHoverState({ hoveredId: null, isBeforeHovered: false });
            const hoverBoundingRect = componentRefs.current[id].current?.getBoundingClientRect();
            if (!hoverBoundingRect) return;
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            const isBefore = hoverClientY < hoverMiddleY;

            const newIndex = isBefore ? index : index + 1;
            const existingItemIndex = components.findIndex((comp) => comp.id === item.id);

            if (existingItemIndex !== -1) {
                const updatedComponents = [...components];
                const [movedItem] = updatedComponents.splice(existingItemIndex, 1);
                updatedComponents.splice(newIndex, 0, movedItem);
                setComponents(updatedComponents);
            } else {
                const newItem = { ...item, id: `col-${Date.now()}-${Math.random()}` };
                const updatedComponents = [...components.slice(0, newIndex), newItem, ...components.slice(newIndex)];
                setComponents(updatedComponents);
            }
        },
    });

    return (
        <div
            className={`${isColumnDragged && 'mark-drop-boxes'}`}
            ref={(node) => {
                drag(drop(node));
            }}
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
        >
            {children}
        </div>
    );
};

export default DropArea;
