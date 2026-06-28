import { cursor_medium, divider_horizontal_medium, grid_medium, image_medium, social_communication_medium, text_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { useSelectedComponent } from './SelectedComponentContext';
const Toolbar = ({ onClick, type, item }) => {
    const { setIsOtherDragged, setHoverState, dropZoneRef, setIsDraggingColumn } = useSelectedComponent();
    const [{ isDragging }, ref] = useDrag({
        type,
        item,
        end: (item, monitor) => {
            setHoverState({ hoveredId: null, isBeforeHovered: false });
            dropZoneRef.current = { hoveredId: null, showMessage: false };
            setIsDraggingColumn(false);
            setIsOtherDragged(false);
        },
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.4 : 1,
            isDragging: monitor.isDragging(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
        }),
    });

    useEffect(() => {
        if (isDragging) {
            if (type === 'column') {
                setIsDraggingColumn(true);
                setIsOtherDragged(false);
            } else {
                setIsOtherDragged(true);
                setIsDraggingColumn(false);
            }
        } else {
            setIsDraggingColumn(false);
            setIsOtherDragged(false);
        }
    }, [isDragging]);

    return (
        <>
            {type === 'column' ? (
                <div className="toolbar-widget" onClick={onClick} ref={ref} key={item.id}>
                    <i className={`${grid_medium} icon-md`} />
                    <span>Blocks</span>
                </div>
            ) : type === 'text' ? (
                <div className="toolbar-widget" onClick={onClick} ref={ref} key={item.id}>
                    <i className={`${text_medium} icon-md`} />
                    <span>Text</span>
                </div>
            ) : type === 'image' ? (
                <div className="toolbar-widget" onClick={onClick} ref={ref} key={item.id}>
                    <i className={`${image_medium} icon-md`} />
                    <span>Image</span>
                </div>
            ) : type === 'button' ? (
                <div className="toolbar-widget" onClick={onClick} ref={ref} key={item.id}>
                    <i className={`${cursor_medium} icon-md`} />
                    <span>Button</span>
                </div>
            ) : type === 'divider' ? (
                <div className="toolbar-widget" onClick={onClick} ref={ref} key={item.id}>
                    <i className={`${divider_horizontal_medium} icon-md`} />
                    <span>Divider</span>
                </div>
            ) : type === 'social' ? (
                <div className="toolbar-widget" onClick={onClick} ref={ref} key={item.id}>
                    <i className={`${social_communication_medium} icon-md`} />
                    <span>Social</span>
                </div>
            ) : null}
        </>
    );
};

export default Toolbar;
