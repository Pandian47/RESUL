import { Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useDrag } from 'react-dnd';
import { useSelectedComponent } from './SelectedComponentContext';
import ToggleMenuBar from './Component/ToggleMenuBar';

const ButtonComponent = ({ id, onEdit, onDelete, ItemTypes = {}, item = {}, disable = false, onDuplicate }) => {
    const {
        label,
        link,
        width,
        height,
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
        fontsize,
        fontStyle,
        fontcolor,
        letterSpacing,
        fontWeight,
        fontFamily,
        textAlign,
        textDecoration,
        alignment,
        btnpadding
    } = item || {};

    const methods = useForm({ defaultValues: {}, mode: 'onTouched' });
    const {
        formState: { isValid },
    } = methods;

    const dragConfig = disable
        ? { ref: null }
        : useDrag({
              type: ItemTypes?.BUTTON,
              item: { id },
          });

    const ref = dragConfig[1] || null;

    const { selectedComponent, setSelectedComponent } = useSelectedComponent();

    const { top = 0, right = 0, bottom = 0, left = 0 } = item?.padding || {};
    if (!item?.padding) return;

    const keywords = ['contain', 'cover', 'auto'];

    const isWidthKeyword = keywords.includes(item.bgWidth);
    const isHeightKeyword = keywords.includes(item.bgHeight);

    const bgSize = isWidthKeyword && isHeightKeyword ? 'contain' : `${item.bgWidth} ${item.bgHeight}`;

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
                backgroundSize: bgSize,
            }}
            className={`no-border tooltip-container menu-child-section w-100 ${
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
                    display: 'flex',
                    justifyContent: alignment || 'center',
                    border: 'unset',
                    // backgroundColor: item.bgColor ? item.bgColor : 'unset',
                    // backgroundImage: `url(${item.bgImage})`,
                    // backgroundRepeat: item.bgRepeat,
                    // backgroundPosition: `${item.bgPositionX} ${item.bgPositionY}`,
                    // backgroundSize: bgSize,
                }}
            >
                <button
                    variant="primary"
                    href={link || '#'}
                    style={{
                        width: width || 'auto',
                        height: `${height}px` || 'auto',
                        backgroundColor: color || '#007bff',
                        fontSize: `${fontsize}px` || '18px',
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
                        fontWeight: fontWeight.value || 'normal',
                        fontFamily: fontFamily.value || '',
                        fontStyle: fontStyle.value || 'normal',
                        textAlign: textAlign || 'center',
                        textDecoration: textDecoration.value || 'none',
                        color: fontcolor || 'white',
                        letterSpacing: `${letterSpacing}px` || '1px',
                        padding:`${btnpadding}px` || 'auto',
                    }}
                >
                    {label}
                </button>
            </Card.Body>
            <ToggleMenuBar item={item} onDuplicate={onDuplicate} onDelete={onDelete} />
        </Card>
    );
};

export default ButtonComponent;
