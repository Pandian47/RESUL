import { useContext, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ACTIONS_ICONS } from '../../constants';
import RSTooltip from 'Components/RSTooltip';
import { Col } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const ImageElement = ({ index, insert, remove, uid, styles, ele }) => {
    const { control, watch, setValue, unregister } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const image = watch(`image${uid}`) || styles;
    
    useEffect(() => {
        if (styles?.properties?.imageSrc) {
            setValue(`image${uid}.properties.imageSrc`, styles?.properties?.imageSrc);
        }
    }, []);

    return (
        <Col
            sm={2}
            draggable={true}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'image');
                setValue(`image${uid}.draggedFromBlock`, true);
                e.dataTransfer.setData('textData', JSON.stringify(image));
                e.dataTransfer.setData('dragId', index);
                e.dataTransfer.setData('dropElement', `image${uid}.draggedFromBlock`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if (image.draggedFromBlock) {
                    remove(index);
                    setValue(`image${uid}.draggedFromBlock`, false);
                }
                // unregister(`textField${index}`);
            }}
        >
            {element === `image${uid}.properties` && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {ACTIONS_ICONS.map((item) => {
                        return (
                            <RSTooltip text={item.tooltip} position="bottom" key={item.id}>
                                <div style={{ backgroundColor: '#0540d3', marginRight: '2px', padding: '2px' }}>
                                    <i
                                        className={`${item.icon} icon-md`}
                                        onClick={(e) => {
                                            if (item.tooltip === 'Remove') {
                                                setElement(`default`);
                                                unregister(`image${uid}`);
                                                remove(index);
                                            } else if (item.tooltip === 'Duplicate') {
                                                // console.log('ELE :::: ', ele);
                                                ele.unique = uuid();
                                                ele.styles = image;

                                                insert(index + 1, ele);
                                            }
                                        }}
                                    />
                                </div>
                            </RSTooltip>
                        );
                    })}
                </div>
            )}

            <img
                className={
                    element === `image${uid}.properties`
                        ? 'selected '
                        : viewComponents
                        ? 'viewComponents element-builder-hover  '
                        : 'element-builder-hover '
                }
                onClick={(e) => {
                    e.stopPropagation();
                    setElement(`image${uid}.properties`);
                    setValue(`image${uid}.value`, image?.properties?.title);
                    setTagName('Image');
                }}
                style={{
                    resize: 'both',
                    margin:
                        image?.properties?.marginTop +
                        'px' +
                        ' ' +
                        image?.properties?.marginRight +
                        'px' +
                        ' ' +
                        image?.properties?.marginBottom +
                        'px' +
                        ' ' +
                        image?.properties?.marginLeft +
                        'px',
                    padding:
                        (image?.properties?.paddingTop ? 8 : image?.properties?.paddingTop) +
                        'px' +
                        ' ' +
                        (image?.properties?.paddingRight ? 16 : image?.properties?.paddingRight) +
                        'px' +
                        ' ' +
                        (image?.properties?.paddingBottom ? 8 : image?.properties?.paddingBottom) +
                        'px' +
                        ' ' +
                        (image?.properties?.paddingLeft ? 16 : image?.properties?.paddingLeft) +
                        'px',
                    width: image?.properties?.width,
                    height: image?.properties?.height,
                    maxWidth: image?.properties?.maxWidth,
                    minHeight: image?.properties?.minHeight,
                    backgroundColor: image?.properties?.backgroundColor,
                    backgroundAttachment: image?.properties?.backgroundAttachment,
                    backgroundPosition: image?.properties?.backgroundPosition,
                    backgroundImage: image?.properties?.backgroundImage,
                    backgroundRepeat: image?.properties?.backgroundRepeat,
                    backgroundSize: image?.properties?.backgroundSize,
                    boxShadow: image?.properties?.boxShadow,
                    border: image?.properties?.border,
                    borderRadius:
                        (image?.properties?.borderRadiusTop === 0 ? 4.8 : image?.properties?.borderRadiusTop) +
                        'px' +
                        ' ' +
                        (image?.properties?.borderRadiusRight === 0 ? 4.8 : image?.properties?.borderRadiusRight) +
                        'px' +
                        ' ' +
                        (image?.properties?.borderRadiusBottom === 0 ? 4.8 : image?.properties?.borderRadiusBottom) +
                        'px' +
                        ' ' +
                        (image?.properties?.borderRadiusLeft === 0 ? 4.8 : image?.properties?.borderRadiusLeft) +
                        'px',
                }}
                src={
                    image?.properties?.imageSrc ||
                    'https://t4.ftcdn.net/jpg/01/43/42/83/360_F_143428338_gcxw3Jcd0tJpkvvb53pfEztwtU9sxsgT.jpg'
                }
                alt={image?.properties?.alt}
            ></img>
        </Col>
    );
};

export default ImageElement;
