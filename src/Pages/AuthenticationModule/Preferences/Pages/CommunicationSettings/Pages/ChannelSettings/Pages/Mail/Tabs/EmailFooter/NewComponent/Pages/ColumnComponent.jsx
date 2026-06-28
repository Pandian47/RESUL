import { createRef, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TextComponent from './TextComponent';
import ImageComponent from './ImageComponent';
import ButtonComponent from './ButtonComponent';
import { useSelectedComponent } from './SelectedComponentContext';
import { removeObject } from '../Utils/functions';
import ToggleMenuBar from './Component/ToggleMenuBar';
import DividerComponent from './DividerComponent';
import SocialMediaComponent from './SocialMediaComponent';

const DropZone = ({
    onDrop,
    data,
    ItemTypes,
    handleEdit,
    handleDelete,
    onDuplicate,
    componentRefs,
    hoverState,
    setHoverState,
    isOtherDragged,
}) => {
    const dropZoneRef = useRef(null);
    const [hoveredColumnId, setHoveredColumnId] = useState(null);

    const [{ isOver }, drop] = useDrop({
        accept: [ItemTypes.TEXT, ItemTypes.IMAGE, ItemTypes.BUTTON, ItemTypes.SOCIAL, ItemTypes.DIVIDER],
        drop: (item, monitor) => {
            if (monitor.isOver({ shallow: true })) {
                if (monitor.didDrop()) return;
                onDrop(item, data, hoverState);
                setHoverState({ hoveredId: null, isBeforeHovered: false });
            }
        },
        hover: (item, monitor) => {
            if (monitor.isOver({ shallow: true })) {
                setHoveredColumnId(data.column_id);
            }
            if (!monitor.isOver({ shallow: true })) {
                setHoverState({ hoveredId: null, isBeforeHovered: false });
                return;
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    });

    useEffect(() => {
        if (!isOver) {
            setHoveredColumnId(null);
        }
    }, [isOver]);

    return (
        <>
        <div className='select-block'>Select</div>
        <div
            key={data?.column_id}
            ref={(node) => {
                dropZoneRef.current = node;
                drop(node);
            }}
            className={`${isOver || isOtherDragged ? 'mark-drop-boxes' : ''} d-flex flex-column`}
        >
            {data && data?.children?.length > 0 ? (
                data?.children?.map((item, i) => {
                    if (!componentRefs.current[item.grid_data_id]) {
                        componentRefs.current[item.grid_data_id] = createRef();
                    }
                    const isHovered = hoverState.hoveredId === item.grid_data_id;
                    const isBeforeHovered = hoverState.isBeforeHovered;
                    return (
                        <DraggableComponent
                            key={item.grid_data_id}
                            id={item.grid_data_id}
                            type={item.type}
                            index={i}
                            componentRefs={componentRefs}
                            ItemTypes={ItemTypes}
                            setHoverState={setHoverState}
                            item={item}
                            onDrop={onDrop}
                            hoverState={hoverState}
                            data={data}
                        >
                            {item?.type === 'text' ? (
                                <div
                                    key={item.grid_data_id}
                                    ref={componentRefs.current[item.grid_data_id]}
                                    className="form-builder-component"
                                >
                                    {isHovered && isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                    <TextComponent
                                        key={i}
                                        id={item.id}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        ItemTypes={ItemTypes}
                                        item={item}
                                        text={item.text}
                                        disable={true}
                                        onDuplicate={onDuplicate}
                                    />
                                    {isHovered && !isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                </div>
                            ) : item?.type === 'button' ? (
                                <div key={item.grid_data_id} ref={componentRefs.current[item.grid_data_id]}>
                                    {isHovered && isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                    <ButtonComponent
                                        key={i}
                                        id={item.id}
                                        item={item}
                                        onDelete={handleDelete}
                                        ItemTypes={ItemTypes}
                                        onEdit={handleEdit}
                                        disable={true}
                                        onDuplicate={onDuplicate}
                                    />
                                    {isHovered && !isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                </div>
                            ) : item?.type === 'image' ? (
                                <div key={item.grid_data_id} ref={componentRefs.current[item.grid_data_id]}>
                                    {isHovered && isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                    <ImageComponent
                                        key={i}
                                        id={item.id}
                                        item={item}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        ItemTypes={ItemTypes}
                                        disable={true}
                                        onDuplicate={onDuplicate}
                                    />
                                    {isHovered && !isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                </div>
                            ) : item?.type === 'social' ? (
                                <div key={item.grid_data_id} ref={componentRefs.current[item.grid_data_id]}>
                                    {isHovered && isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                    <SocialMediaComponent
                                        key={item.id}
                                        id={item.id}
                                        socialIcon={item.socialIcon}
                                        addIcon={item.addIcon}
                                        deleteIcon={item.deleteIcon}
                                        alignment={item.alignment}
                                        SpaceBetweenIcons={item.SpaceBetweenIcons}
                                        ItemTypes={ItemTypes}
                                        item={item}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        size={item.size}
                                        socialAltTexts={item.socialAltTexts}
                                        disable={true}
                                        onDuplicate={onDuplicate}
                                        socialLinks={item.iconLinks}
                                    />
                                    {isHovered && !isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                </div>
                            ) : item?.type === 'divider' ? (
                                <div key={item.grid_data_id} ref={componentRefs.current[item.grid_data_id]}>
                                    {isHovered && isBeforeHovered && (
                                        <div className="drop-line-container">
                                            <span className="drop-text">Drop here</span>
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                    <DividerComponent
                                        key={item.id}
                                        id={item.id}
                                        item={item}
                                        ItemTypes={ItemTypes}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onDuplicate={onDuplicate}
                                        disable={true}
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
                    );
                })
            ) : (
                <div
                    className="d-flex justify-content-center align-items-center h-100 drop-zone-container"
                    style={{ position: 'relative' }}
                >
                    {/* <IoLogoDropbox /> */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <p>Drop here</p>
                    {hoveredColumnId === data.column_id && (
                        <div className='drop-text'
                            // style={{
                            //     position: 'absolute',
                            //     top: '50%',
                            //     left: '50%',
                            //     transform: 'translate(-50%, -50%)',
                            //     background: 'rgba(0,0,0,0.8)',
                            //     color: 'white',
                            //     padding: '5px 10px',
                            //     borderRadius: '5px',
                            //     fontSize: '14px',
                            // }}
                        >
                            Drop here
                        </div>
                    )}
                </div>
            )}
        </div>
        </>
    );
};

const ColumnComponent = ({ ItemTypes, item = {}, onDuplicate, isOtherDragged }) => {
    const {
        selectedComponent,
        setSelectedComponent,
        components,
        setComponents,
        componentRefs,
        hoverState,
        setHoverState,
    } = useSelectedComponent();

    const handleDrop = (dropItem, columnData, hoverState) => {
        const newColumnId = `id-${Date.now()}`;
        let modifiedData = { ...dropItem };
        modifiedData.grid_data_id = newColumnId;

        setComponents((prevLayout) =>
            prevLayout?.map((layout) => {
                const updatedColumns = layout?.column?.map((col) => {
                    if (col.children) {
                        const existingItemIndex = col?.children?.findIndex(
                            (child) => child?.grid_data_id === dropItem?.grid_data_id,
                        );

                        if (existingItemIndex !== -1) {
                            col.children.splice(existingItemIndex, 1);
                        }
                    }
                    return col;
                });

                const finalColumns = updatedColumns?.map((col) => {
                    if (col?.column_id === columnData?.column_id) {
                        const children = [...(col?.children || [])];
                        const hoverIndex = children?.findIndex(
                            (child) => child?.grid_data_id === hoverState?.hoveredId,
                        );

                        if (hoverIndex !== -1) {
                            if (hoverState?.isBeforeHovered) {
                                children?.splice(hoverIndex, 0, modifiedData);
                            } else {
                                children?.splice(hoverIndex + 1, 0, modifiedData);
                            }
                        } else {
                            children?.push(modifiedData);
                        }

                        return {
                            ...col,
                            children,
                        };
                    }
                    return col;
                });

                return {
                    ...layout,
                    column: finalColumns,
                };
            }),
        );
    };

    const handleDelete = async (delData) => {
        await setComponents((prevData) => removeObject(prevData, delData));
        await setSelectedComponent('Layout')
    };

    const handleDuplicate = (item) => {
        const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newItem = { ...item, grid_data_id: generateId(), id: generateId() };

        setComponents((prevComponents) => {
            return prevComponents.map((component) => {
                if (component.type === 'column' && component.column) {
                    const updatedColumns = component.column.map((col) => {
                        const childrenArray = col.children || [];
                        const itemIndex = childrenArray.findIndex((child) => child.grid_data_id === item.grid_data_id);

                        if (itemIndex !== -1) {
                            const updatedChildren = [
                                ...childrenArray.slice(0, itemIndex + 1),
                                newItem,
                                ...childrenArray.slice(itemIndex + 1),
                            ];
                            return { ...col, children: updatedChildren };
                        }
                        return col;
                    });

                    return { ...component, column: updatedColumns };
                }
                return component;
            });
        });
    };
    const handleEdit = (editdata) => {
        setSelectedComponent(editdata);
    };

    const gridTemplateColumns = item && item?.column.map((col) => `${col?.width || 1}fr`).join(' ');

    const onlyColumnData = components?.filter((x) => x.type === 'column');
    const { top = 0, right = 0, bottom = 0, left = 0 } = item?.padding || {};
    const {
        top: margintop = 0,
        right: marginright = 0,
        bottom: marginbottom = 0,
        left: marginleft = 0,
    } = item?.margin || {};

    if (!onlyColumnData || !item?.padding || item?.margin) return;
    const keywords = ['contain', 'cover', 'auto'];

    const isWidthKeyword = keywords.includes(item.bgWidth);
    const isHeightKeyword = keywords.includes(item.bgHeight);

    const bgSize = isWidthKeyword && isHeightKeyword ? 'contain' : `${item.bgWidth} ${item.bgHeight}`;

    return (
        <div className="column-wrapper-container">
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: gridTemplateColumns,
                    gap: `${item.gap}px`,
                    // paddingTop: `${top}px`,
                    // paddingRight: `${right}px`,
                    // paddingBottom: `${bottom}px`,
                    // paddingLeft: `${left}px`,
                    marginTop: `${margintop}px`,
                    marginBottom: `${marginbottom}px`,
                    marginLeft: `${marginleft}px`,
                    marginRight: `${marginright}px`,
                    backgroundColor: item.bgColor ? item.bgColor : 'unset',
                    backgroundImage: `url(${item.bgImage})`,
                    backgroundRepeat: item.bgRepeat,
                    backgroundPosition: `${item.bgPositionX} ${item.bgPositionY}`,
                    backgroundSize: bgSize,
                    position: 'relative',
                    borderTop:
                        item.isborder && item.borderTop
                            ? `${item.borderthickness || 2}px ${item.borderStyle?.value || 'solid'} ${
                                  item.borderColor || 'black'
                              }`
                            : 'unset',
                    borderRight:
                        item.isborder && item.borderRight
                            ? `${item.borderthickness || 2}px ${item.borderStyle?.value || 'solid'} ${
                                  item.borderColor || 'black'
                              }`
                            : 'unset',
                    borderBottom:
                        item.isborder && item.borderBottom
                            ? `${item.borderthickness || 2}px ${item.borderStyle?.value || 'solid'} ${
                                  item.borderColor || 'black'
                              }`
                            : 'unset',
                    borderLeft:
                        item.isborder && item.borderLeft
                            ? `${item.borderthickness || 2}px ${item.borderStyle?.value || 'solid'} ${
                                  item.borderColor || 'black'
                              }`
                            : 'unset',
                    borderRadius: `${item.borderRadius}px` || '0',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedComponent(item);
                }}
                className={`tooltip-container menu-parent-section parenthighlight ${
                    selectedComponent?.id === item.id ? 'parenthighlight-active' : ''
                }`}
            >
                {item?.column?.map((data, index) => (
                    <DropZone
                        key={index}
                        onDrop={handleDrop}
                        data={data}
                        ItemTypes={ItemTypes}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        componentRefs={componentRefs}
                        hoverState={hoverState}
                        setHoverState={setHoverState}
                        isOtherDragged={isOtherDragged}
                    />
                ))}
                <ToggleMenuBar
                    item={item}
                    onDuplicate={onDuplicate}
                    onDelete={handleDelete}
                    className={'parent-menu-toggle-right'}
                    disableDelete={components?.length === 1}
                />
            </div>
        </div>
    );
};

const DraggableComponent = ({
    id,
    type,
    children,
    componentRefs,
    ItemTypes,
    setHoverState,
    item,
    onDrop,
    hoverState,
    data,
}) => {
    const [{ isDragging }, drag] = useDrag({
        type: type,
        item: item,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: [ItemTypes.TEXT, ItemTypes.IMAGE, ItemTypes.BUTTON, ItemTypes.SOCIAL, ItemTypes.DIVIDER],
        hover: (item, monitor) => {
            if (monitor.didDrop()) return;
            if (item.id !== id) {
                const hoverBoundingRect = componentRefs.current[id].current?.getBoundingClientRect();
                if (!hoverBoundingRect) return;
                const clientOffset = monitor.getClientOffset();
                if (!clientOffset) return;
                const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
                const hoverClientY = clientOffset.y - hoverBoundingRect.top;
                const isBefore = hoverClientY < hoverMiddleY;
                setHoverState({ hoveredId: id, isBeforeHovered: isBefore });
            }
        },
        drop: (item) => {
            onDrop(item, data, hoverState);
            setHoverState({ hoveredId: null, isBeforeHovered: false });
        },
    });

    return (
        <div
            ref={(node) => {
                drag(drop(node));
            }}
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
        >
            {children}
        </div>
    );
};

export default ColumnComponent;
