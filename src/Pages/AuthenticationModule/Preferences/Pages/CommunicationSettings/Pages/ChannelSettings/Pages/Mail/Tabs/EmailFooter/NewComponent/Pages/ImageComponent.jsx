import { Card } from 'react-bootstrap';
import { useDrag } from 'react-dnd';
import { useSelectedComponent } from './SelectedComponentContext';
import ToggleMenuBar from './Component/ToggleMenuBar';

const ImageComponent = ({ id, onEdit, onDelete, ItemTypes = {}, item = {}, disable = false, onDuplicate }) => {
    const dragConfig = disable
        ? { ref: null }
        : useDrag({
              type: ItemTypes?.IMAGE,
              item: { id },
          });

    const ref = dragConfig[1] || null;

    const { selectedComponent, setSelectedComponent, isActive, setIsActive } = useSelectedComponent();

    const { top = 0, right = 0, bottom = 0, left = 0 } = item?.padding || {};
    const {
        imgwidth,
        imgheight,
        isborder,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        borderthickness,
        borderColor,
        borderStyle,
        src,
        alt,
        alignment,
        imgborderRadius,
        imgText,
    } = item || {};

    if (!item?.padding) return;

    const keywords = ['contain', 'cover', 'auto'];

    const isWidthKeyword = keywords.includes(item.bgWidth);
    const isHeightKeyword = keywords.includes(item.bgHeight);

    const bgSize = isWidthKeyword && isHeightKeyword ? 'contain' : `${item.bgWidth} ${item.bgHeight}`;

    return (
        <Card
            ref={ref}
            className={`drop-zone-container no-border image-container-card tooltip-container menu-child-section ${
                selectedComponent?.id === id ? 'card-active' : ''
            }`}
            onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
                setSelectedComponent(item);
                setIsActive(true);
            }}
            style={{
                display: 'flex',
                alignItems: alignment || 'center',
                border: 'unset',
                position: 'relative',
                backgroundColor: item.bgColor ? item.bgColor : 'unset',
                backgroundImage: `url(${item.bgImage})`,
                backgroundRepeat: item.bgRepeat,
                backgroundPosition: `${item.bgPositionX} ${item.bgPositionY}`,
                ...(bgSize && { backgroundSize: bgSize }),
            }}
        >
            {src ? (
                <>
                    <Card.Img
                        variant="top"
                        src={src}
                        alt={alt}
                        className={`${imgText ? 'image-has-text' : ''}`}
                        style={{
                            paddingTop: `${top}px`,
                            paddingRight: `${right}px`,
                            paddingBottom: `${bottom}px`,
                            paddingLeft: `${left}px`,
                            borderTop:
                                isborder && borderTop
                                    ? `${borderthickness || 1}px ${borderStyle?.value || 'solid'} ${
                                          borderColor || 'black'
                                      }`
                                    : 'unset',
                            borderRight:
                                isborder && borderRight
                                    ? `${borderthickness || 1}px ${borderStyle?.value || 'solid'} ${
                                          borderColor || 'black'
                                      }`
                                    : 'unset',
                            borderBottom:
                                isborder && borderBottom
                                    ? `${borderthickness || 1}px ${borderStyle?.value || 'solid'} ${
                                          borderColor || 'black'
                                      }`
                                    : 'unset',
                            borderLeft:
                                isborder && borderLeft
                                    ? `${borderthickness || 1}px ${borderStyle?.value || 'solid'} ${
                                          borderColor || 'black'
                                      }`
                                    : 'unset',
                            width: imgwidth ? `${imgwidth}` : 'auto',
                            height: imgheight ? `${imgheight}` : 'auto',
                            borderRadius: imgborderRadius ? `${imgborderRadius}` : '0',
                        }}
                    />
                    {imgText && <div className="overlay-text">{imgText}</div>}
                </>
            ) : (
                <>
                {/* <FaImage className="toolbar-icon m-0" /> */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image w-8 h-8 text-gray-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                <p>Image</p>
                </>
                
            )}

            <ToggleMenuBar item={item} onDuplicate={onDuplicate} onDelete={onDelete} />
        </Card>
    );
};
export default ImageComponent;
