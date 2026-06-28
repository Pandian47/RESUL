import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { ACTIONS_ICONS } from '../../constants';
import RSTooltip from 'Components/RSTooltip';
import { v4 as uuid } from 'uuid';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const TextElement = ({ index, insert, remove, uid, styles, ele }) => {
    const { control, watch, setValue, resetField } = useFormContext();
    const { element, setElement, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const textField = watch(`textField${uid}`);
    // console.log('Textfield --- - - >>> ', styles);

    return (
        <>
            {element === `textField${uid}.properties` && (
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
                                                // unregister(`textField${uid}`);
                                                remove(index);
                                            } else if (item.tooltip === 'Drag') {
                                                e.stopPropagation();
                                            } else if (item.tooltip === 'Duplicate') {
                                                ele.unique = uuid();
                                                ele.styles = textField;
                                                // console.log('ELE :::: ', ele);
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

            <p
                draggable={true}
                onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('name', 'Text');
                    setValue(`textField${uid}.draggedFromBlock`, true);
                    e.dataTransfer.setData('textData', JSON.stringify(textField));
                    e.dataTransfer.setData('dragId', index);
                    e.dataTransfer.setData('dropElement', `textField${uid}.draggedFromBlock`);
                }}
                onDragEnd={(e) => {
                    e.stopPropagation();
                    if (textField?.draggedFromBlock) {
                                                remove(index);
                        setValue(`textField${uid}.draggedFromBlock`, false);
                    }
                    // unregister(`textField${index}`);
                }}
                contentEditable
                suppressContentEditableWarning={true}
                className={
                    element === `textField${uid}.properties`
                        ? 'selected m5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover m5'
                }
                onClick={(e) => {
                    e.stopPropagation();
                                        // if (textField === undefined) {
                    //     console.log('First time');
                    //     resetField(`textField${uid}.properties`);
                    //     setValue(`textField${uid}.properties`, {});
                    // } else {
                    //     console.log('When changed');
                    //     // setElement(`textField${uid}.properties`);
                    //     setValue(`textField${uid}.properties`, textField?.properties);
                    // }
                    setElement(`textField${uid}.properties`);
                    setTagName('Text');
                }}
                onBlur={(e) => {
                                        setValue(`textField${uid}.value`, e.target.textContent);
                }}
                id={textField?.properties?.id}
                title={textField?.properties?.title}
                style={{
                    fontFamily: textField?.properties?.fontStyle?.value,
                    fontSize: textField?.properties?.fontSize,
                    color: textField?.properties?.fontColor,
                    fontWeight: textField?.properties?.fontWeight?.value,
                    lineHeight: textField?.properties?.lineHeight + textField?.properties?.lineHeightExt,
                    letterSpacing: textField?.properties?.letterSpacing,
                    textAlign: textField?.properties?.textAlign,
                    textShadow: textField?.properties?.textShadow,
                    margin:
                        textField?.properties?.marginTop +
                        'px' +
                        ' ' +
                        textField?.properties?.marginRight +
                        'px' +
                        ' ' +
                        textField?.properties?.marginBottom +
                        'px' +
                        ' ' +
                        textField?.properties?.marginLeft +
                        'px',
                    padding:
                        textField?.properties?.paddingTop +
                        'px' +
                        ' ' +
                        textField?.properties?.paddingRight +
                        'px' +
                        ' ' +
                        textField?.properties?.paddingBottom +
                        'px' +
                        ' ' +
                        textField?.properties?.paddingLeft +
                        'px',
                    width: textField?.properties?.width,
                    height: textField?.properties?.height,
                    maxWidth: textField?.properties?.maxWidth,
                    minHeight: textField?.properties?.minHeight,
                    backgroundColor: textField?.properties?.backgroundColor,
                    backgroundAttachment: textField?.properties?.backgroundAttachment,
                    backgroundPosition: textField?.properties?.backgroundPosition,
                    backgroundImage: textField?.properties?.backgroundImage,
                    backgroundRepeat: textField?.properties?.backgroundRepeat,
                    backgroundSize: textField?.properties?.backgroundSize,
                    boxShadow: textField?.properties?.boxShadow,
                    border: textField?.properties?.border,
                    borderRadius:
                        textField?.properties?.borderRadiusTop +
                        'px' +
                        ' ' +
                        textField?.properties?.borderRadiusRight +
                        'px' +
                        ' ' +
                        textField?.properties?.borderRadiusBottom +
                        'px' +
                        ' ' +
                        textField?.properties?.borderRadiusLeft +
                        'px',
                }}
            >
                {styles?.value || 'Insert your text here...'}
            </p>
        </>
    );
};

export default TextElement;
