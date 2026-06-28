import { useDrag } from 'react-dnd';
import { useSelectedComponent } from './SelectedComponentContext';
import { Card } from 'react-bootstrap';
import ToggleMenuBar from './Component/ToggleMenuBar';

export default function DividerComponent({
    id,
    onEdit,
    item = {},
    onDelete,
    onDuplicate,
    disable = false,
    ItemTypes = {},
}) {
    const { selectedComponent, setSelectedComponent } = useSelectedComponent();

    const {
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        borderthickness,
        borderColor,
        borderStyle,
        borderRadius,
        borderWidth,
        borderHeight,
        alignment,
        spacer,
    } = item || {};

    const dragConfig = disable
        ? { ref: null }
        : useDrag({
              type: ItemTypes?.DIVIDER,
              item: { id },
          });

    const ref = dragConfig[1] || null;

    const { top = 0, right = 0, bottom = 0, left = 0 } = item?.padding || {};

    const keywords = ['contain', 'cover', 'auto'];

    const isWidthKeyword = keywords.includes(item.bgWidth);
    const isHeightKeyword = keywords.includes(item.bgHeight);

    const bgSize = isWidthKeyword && isHeightKeyword ? 'contain' : `${item.bgWidth} ${item.bgHeight}`;

    const alignmentMap = {
        left: 'flex-start',
        right: 'flex-end',
        center: 'center',
    };

    const dividerAlignment = alignmentMap[alignment] || 'center';

    const parsedBorderThickness = parseInt(borderthickness, 10) || 2; 
    const effectiveHeight = spacer
        ? borderHeight
            ? `${parseInt(borderHeight, 10) || 0}px`
            : 'auto'
        : `${parsedBorderThickness}px`;

    return (
        <Card
            ref={ref}
            style={{
                border: 'unset',
                minHeight: effectiveHeight, 
                position: 'relative',
                paddingTop: `${top}px`,
                paddingRight: `${right}px`,
                paddingBottom: `${bottom}px`,
                paddingLeft: `${left}px`,
                backgroundColor: item.bgColor ? item.bgColor : 'unset',
                backgroundImage: `url(${item.bgImage})`,
                backgroundRepeat: item.bgRepeat,
                backgroundPosition: `${item.bgPositionX} ${item.bgPositionY}`,
                backgroundSize: bgSize,
                display: 'flex',
                alignItems: dividerAlignment,
                overflow: 'visible', 
            }}
            className={`w-100 no-border tooltip-container menu-child-section ${
                selectedComponent?.id === id ? 'card-active' : ''
            }`}
            onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
                setSelectedComponent(item);
            }}
        >
            {!spacer && (
                <Card.Body
                    style={{
                        width: borderWidth ? `${borderWidth}%` : '100%',
                        height: effectiveHeight, 
                        minHeight: effectiveHeight,
                        border: borderthickness
                            ? `${parsedBorderThickness}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                            : 'unset',
                        borderRadius: borderRadius ? `${borderRadius}px` : '0',
                        padding: '0',
                        backgroundColor: 'rgba(200, 200, 200, 0.3)', 
                        boxSizing: 'border-box', 
                    }}
                >
                    <div  ref={ref}
                        style={{
                            cursor: 'row-resize',
                            height: '100%', 
                        }}
                    />
                </Card.Body>
            )}

            <ToggleMenuBar item={item} onDuplicate={onDuplicate} onDelete={onDelete} />
        </Card>
    );
}
