import { Card } from 'react-bootstrap';
import { useDrag } from 'react-dnd';
import { useSelectedComponent } from './SelectedComponentContext';
import ToggleMenuBar from './Component/ToggleMenuBar';

const TextComponent = ({ id, onEdit, onDelete, ItemTypes = {}, item = {}, disable = false, onDuplicate }) => {
    const {
        text,
        bold,
        italic,
        underline,
        alignment,
        color,
        isborder,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        borderthickness,
        borderColor,
        borderStyle,
        borderRadius,
    } = item || {};

    const { selectedComponent, setSelectedComponent } = useSelectedComponent();

    const dragConfig = disable
        ? { ref: null }
        : useDrag({
              type: ItemTypes?.TEXT,
              item: { id },
          });

    const ref = dragConfig[1] || null;

    const textStyle = {
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        textDecoration: underline ? 'underline' : 'none',
        textAlign: alignment || 'left',
        color: color || '#000000',
    };

    const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);

    const { top = 0, right = 0, bottom = 0, left = 0 } = item?.padding || {};
    const keywords = ['contain', 'cover', 'auto'];

    const isWidthKeyword = keywords.includes(item.bgWidth);
    const isHeightKeyword = keywords.includes(item.bgHeight);

    const bgSize = isWidthKeyword && isHeightKeyword ? 'contain' : `${item.bgWidth} ${item.bgHeight}`;

    if (!item?.padding) return;

    return (
        <Card
            ref={ref}
            style={{
                border: 'unset',
                position: 'relative',
                backgroundColor: item.bgColor ? item.bgColor : 'unset',
                backgroundImage: `url(${item.bgImage})`,
                backgroundRepeat: item.bgRepeat,
                backgroundPosition: `${item.bgPositionX} ${item.bgPositionY}`,
                ...(bgSize && { backgroundSize: bgSize }),
            }}
            className={`no-border tooltip-container menu-child-section w-100   ${
                selectedComponent?.id === id ? 'card-active' : ''
            }`}
            onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
                setSelectedComponent(item);
            }}
        >
            <Card.Body
                style={{
                    paddingTop: `${top}px`,
                    paddingRight: `${right}px`,
                    paddingBottom: `${bottom}px`,
                    paddingLeft: `${left}px`,
                    borderTop:
                        isborder && borderTop
                            ? `${borderthickness || 2}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                            : 'unset',
                    borderRight:
                        isborder && borderRight
                            ? `${borderthickness || 2}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                            : 'unset',
                    borderBottom:
                        isborder && borderBottom
                            ? `${borderthickness || 2}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                            : 'unset',
                    borderLeft:
                        isborder && borderLeft
                            ? `${borderthickness || 2}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                            : 'unset',
                    borderRadius: `${borderRadius}px` || '0',
                }}
            >
                {isHTML ? (
                    <div style={textStyle} dangerouslySetInnerHTML={{ __html: text }} />
                ) : (
                    <Card.Text className="m-0">{text}</Card.Text>
                )}

                <ToggleMenuBar item={item} onDuplicate={onDuplicate} onDelete={onDelete} />
            </Card.Body>
        </Card>
    );
};
export default TextComponent;
