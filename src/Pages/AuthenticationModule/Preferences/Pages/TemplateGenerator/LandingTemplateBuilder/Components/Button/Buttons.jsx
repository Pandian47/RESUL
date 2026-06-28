import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { Col } from 'react-bootstrap';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const Buttons = ({ index, remove, uid, styles }) => {
    const { control, watch, setValue, unregister } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const buttons = styles === undefined ? watch(`buttons${uid}`) : styles;
    // console.log('Text element ---->> ', buttons);
    return (
        <Col
            sm={2}
            draggable={true}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'Buttons');
                setValue(`buttons${uid}.draggedFromBlock`, true);
                e.dataTransfer.setData('textData', JSON.stringify(buttons));
                e.dataTransfer.setData('dragId', index);
                e.dataTransfer.setData('dropElement', `buttons${uid}.draggedFromBlock`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if (buttons.draggedFromBlock) {
                    remove(index);
                    setValue(`buttons${uid}.draggedFromBlock`, false);
                }
                // unregister(`textField${index}`);
            }}
        >
            {/* {element === `buttons${uid}.properties` && (
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
                                                unregister(`buttons${uid}`);
                                                remove(index);
                                            } else if (item.tooltip === 'Drag') {
                                                e.stopPropagation();
                                                setToggle(true);
                                            }
                                        }}
                                    />
                                </div>
                            </RSTooltip>
                        );
                    })}
                </div>
            )} */}

            <a
                // href={buttons?.properties?.href}
                // draggable={toggle}
                // onDragStart={(e) => {
                //     e.dataTransfer.setData('name', 'Buttons');
                //     setValue(`buttons${uid}.draggedFromBlock`, true);
                //     e.dataTransfer.setData('textData', JSON.stringify(buttons));
                //     e.dataTransfer.setData('dragId', index);
                //     e.dataTransfer.setData('dropElement', `buttons${uid}.draggedFromBlock`);
                // }}
                // onDragEnd={() => {
                //     if (buttons.draggedFromBlock) {
                //         remove(index);
                //         setValue(`buttons${uid}.draggedFromBlock`, false);
                //     }
                //     // unregister(`textField${index}`);
                // }}
                className={
                    element === `buttons${uid}.properties`
                        ? 'selected btn btn-info'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover btn btn-info'
                }
                onClick={(e) => {
                    e.stopPropagation();
                    setElement(`buttons${uid}.properties`);
                    setValue(`buttons${uid}.value`, buttons?.properties?.title);
                    setTagName('Buttons');
                }}
                // id={buttons?.properties?.id}
                // title={buttons?.properties?.title}
                style={{
                    fontFamily: buttons?.properties?.fontStyle?.value,
                    fontSize: buttons?.properties?.fontSize || '20px',
                    color: buttons?.properties?.fontColor,
                    fontWeight: buttons?.properties?.fontWeight?.value,
                    lineHeight: buttons?.properties?.lineHeight + buttons?.properties?.lineHeightExt || '30px',
                    letterSpacing: buttons?.properties?.letterSpacing,
                    textAlign: buttons?.properties?.textAlign,
                    textShadow: buttons?.properties?.textShadow,
                    margin:
                        buttons?.properties?.marginTop +
                        'px' +
                        ' ' +
                        buttons?.properties?.marginRight +
                        'px' +
                        ' ' +
                        buttons?.properties?.marginBottom +
                        'px' +
                        ' ' +
                        buttons?.properties?.marginLeft +
                        'px',
                    padding:
                        (buttons?.properties?.paddingTop ? 8 : buttons?.properties?.paddingTop) +
                        'px' +
                        ' ' +
                        (buttons?.properties?.paddingRight ? 16 : buttons?.properties?.paddingRight) +
                        'px' +
                        ' ' +
                        (buttons?.properties?.paddingBottom ? 8 : buttons?.properties?.paddingBottom) +
                        'px' +
                        ' ' +
                        (buttons?.properties?.paddingLeft ? 16 : buttons?.properties?.paddingLeft) +
                        'px',
                    width: buttons?.properties?.width,
                    height: buttons?.properties?.height,
                    maxWidth: buttons?.properties?.maxWidth,
                    minHeight: buttons?.properties?.minHeight,
                    backgroundColor: buttons?.properties?.backgroundColor,
                    backgroundAttachment: buttons?.properties?.backgroundAttachment,
                    backgroundPosition: buttons?.properties?.backgroundPosition,
                    backgroundImage: buttons?.properties?.backgroundImage,
                    backgroundRepeat: buttons?.properties?.backgroundRepeat,
                    backgroundSize: buttons?.properties?.backgroundSize,
                    boxShadow: buttons?.properties?.boxShadow,
                    border: buttons?.properties?.border,
                    borderRadius:
                        (buttons?.properties?.borderRadiusTop === 0 ? 4.8 : buttons?.properties?.borderRadiusTop) +
                        'px' +
                        ' ' +
                        (buttons?.properties?.borderRadiusRight === 0 ? 4.8 : buttons?.properties?.borderRadiusRight) +
                        'px' +
                        ' ' +
                        (buttons?.properties?.borderRadiusBottom === 0
                            ? 4.8
                            : buttons?.properties?.borderRadiusBottom) +
                        'px' +
                        ' ' +
                        (buttons?.properties?.borderRadiusLeft === 0 ? 4.8 : buttons?.properties?.borderRadiusLeft) +
                        'px',
                }}
            >
                {buttons?.properties?.title || 'Button'}
            </a>
        </Col>
    );
};

export default Buttons;
