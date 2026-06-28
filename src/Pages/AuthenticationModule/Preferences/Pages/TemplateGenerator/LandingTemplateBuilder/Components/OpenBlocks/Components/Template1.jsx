import { useContext, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import { Row } from 'react-bootstrap';
import { ACTIONS_ICONS } from '../../../constants';
import { LandingTemplateContext } from '../../../Pages/LandingPageBuilder/LandingPageBuilder';

const Template1 = ({ index, remove, uid, styles }) => {
    const { control, watch, setValue, unregister } = useFormContext();
    const { element, setElement, setTagName, viewComponents } = useContext(LandingTemplateContext);
    const [toggle, setToggle] = useState(false);
    const template1 = watch(`template1${uid}`);
    // console.log('Styles --- - - >>> ', styles);
    return (
        <Row
            draggable={toggle}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'Template1');
                setValue(`template1${uid}.draggedFromBlock`, true);
                e.dataTransfer.setData('textData', JSON.stringify(template1));
                e.dataTransfer.setData('dragId', index);
                e.dataTransfer.setData('dropElement', `template1${uid}.draggedFromBlock`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if (template1.draggedFromBlock) {
                                        remove(index);
                    setValue(`template1${uid}.draggedFromBlock`, false);
                }
                // unregister(`template1${index}`);
            }}
            // onDragExit={() => {
            //     // setDragToggle(true)
            //     console.log('Hello drag exit...');
            // }}
            // onDragEnter={() => {
            //     //  setDragToggle(false)
            //     console.log('Hello drag enter...');
            // }}
        >
            {/* {element === `template1${uid}.properties` && (
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
                                                unregister(`template1${uid}`);
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

            <section
                className={
                    element === `template1${uid}.properties`
                        ? 'selected m5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover m5'
                }
                onClick={(e) => {
                    e.stopPropagation();

                    setElement(`template1${uid}.properties`);
                    setTagName('Section');
                }}
                style={{
                    animationName: template1?.properties?.animationName?.value,
                    animationDuration: template1?.properties?.durationSec + 's',
                    animationDelay: template1?.properties?.delaySec + 's',
                    fontFamily: template1?.properties?.fontStyle?.value,
                    fontSize: template1?.properties?.fontSize,
                    color: template1?.properties?.fontColor,
                    fontWeight: template1?.properties?.fontWeight?.value,
                    lineHeight: template1?.properties?.lineHeight + template1?.properties?.lineHeightExt,
                    letterSpacing: template1?.properties?.letterSpacing,
                    textAlign: template1?.properties?.textAlign,
                    textShadow: template1?.properties?.textShadow,
                    margin:
                        template1?.properties?.marginTop +
                        'px' +
                        ' ' +
                        template1?.properties?.marginRight +
                        'px' +
                        ' ' +
                        template1?.properties?.marginBottom +
                        'px' +
                        ' ' +
                        template1?.properties?.marginLeft +
                        'px',
                    padding:
                        template1?.properties?.paddingTop +
                        'px' +
                        ' ' +
                        template1?.properties?.paddingRight +
                        'px' +
                        ' ' +
                        template1?.properties?.paddingBottom +
                        'px' +
                        ' ' +
                        template1?.properties?.paddingLeft +
                        'px',
                    width: template1?.properties?.width,
                    height: template1?.properties?.height,
                    maxWidth: template1?.properties?.maxWidth,
                    minHeight: template1?.properties?.minHeight,
                    backgroundColor: template1?.properties?.backgroundColor,
                    backgroundAttachment: template1?.properties?.backgroundAttachment,
                    backgroundPosition: template1?.properties?.backgroundPosition,
                    backgroundImage: template1?.properties?.backgroundImage,
                    backgroundRepeat: template1?.properties?.backgroundRepeat,
                    backgroundSize: template1?.properties?.backgroundSize,
                    boxShadow: template1?.properties?.boxShadow,
                    border: template1?.properties?.border,
                    borderRadius:
                        template1?.properties?.borderRadiusTop +
                        'px' +
                        ' ' +
                        template1?.properties?.borderRadiusRight +
                        'px' +
                        ' ' +
                        template1?.properties?.borderRadiusBottom +
                        'px' +
                        ' ' +
                        template1?.properties?.borderRadiusLeft +
                        'px',
                }}
            >
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6 text-center">
                            {element === `template1${uid}.heading.properties` && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    {ACTIONS_ICONS.map((item) => {
                                        return (
                                            <RSTooltip text={item.tooltip} position="bottom" key={item.id}>
                                                <div
                                                    style={{
                                                        backgroundColor: '#0540d3',
                                                        marginRight: '2px',
                                                        padding: '2px',
                                                    }}
                                                >
                                                    <i
                                                        className={`${item.icon} icon-md`}
                                                        onClick={(e) => {
                                                            if (item.tooltip === 'Remove') {
                                                                setElement(`default`);
                                                                // unregister(`template1${uid}`);
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
                            )}
                            <h1
                                className={
                                    element === `template1${uid}.heading.properties`
                                        ? 'selected m5'
                                        : viewComponents
                                        ? 'viewComponents element-builder-hover m5'
                                        : 'element-builder-hover m5'
                                }
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setElement(`template1${uid}.heading.properties`);
                                    setTagName('Header');
                                }}
                            >
                                Call to Action
                            </h1>
                            {element === `template1${uid}.textField.properties` && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    {ACTIONS_ICONS.map((item) => {
                                        return (
                                            <RSTooltip text={item.tooltip} position="bottom" key={item.id}>
                                                <div
                                                    style={{
                                                        backgroundColor: '#0540d3',
                                                        marginRight: '2px',
                                                        padding: '2px',
                                                    }}
                                                >
                                                    <i
                                                        className={`${item.icon} icon-md`}
                                                        onClick={(e) => {
                                                            if (item.tooltip === 'Remove') {
                                                                setElement(`default`);
                                                                // unregister(`template1${uid}`);
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
                            )}
                            <p
                                className={
                                    element === `template1${uid}.textField.properties`
                                        ? 'selected m5'
                                        : viewComponents
                                        ? 'viewComponents element-builder-hover m5'
                                        : 'element-builder-hover m5'
                                }
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setElement(`template1${uid}.textField.properties`);
                                    setTagName('Text');
                                }}
                            >
                                {' '}
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry
                            </p>
                            {element === `template1${uid}.textField2.properties` && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    {ACTIONS_ICONS.map((item) => {
                                        return (
                                            <RSTooltip text={item.tooltip} position="bottom" key={item.id}>
                                                <div
                                                    style={{
                                                        backgroundColor: '#0540d3',
                                                        marginRight: '2px',
                                                        padding: '2px',
                                                    }}
                                                >
                                                    <i
                                                        className={`${item.icon} icon-md`}
                                                        onClick={(e) => {
                                                            if (item.tooltip === 'Remove') {
                                                                setElement(`default`);
                                                                // unregister(`template1${uid}`);
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
                            )}
                            <p
                                className={
                                    element === `template1${uid}.textField2.properties`
                                        ? 'selected mt-5 mt-sm-4'
                                        : viewComponents
                                        ? 'viewComponents element-builder-hover mt-5 mt-sm-4'
                                        : 'element-builder-hover mt-5 mt-sm-4'
                                }
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setElement(`template1${uid}.textField2.properties`);
                                    setTagName('Text');
                                }}
                            >
                                {element === `template1${uid}.buttons.properties` && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        {ACTIONS_ICONS.map((item) => {
                                            return (
                                                <RSTooltip text={item.tooltip} position="bottom" key={item.id}>
                                                    <div
                                                        style={{
                                                            backgroundColor: '#0540d3',
                                                            marginRight: '2px',
                                                            padding: '2px',
                                                        }}
                                                    >
                                                        <i
                                                            className={`${item.icon} icon-md`}
                                                            onClick={(e) => {
                                                                if (item.tooltip === 'Remove') {
                                                                    setElement(`default`);
                                                                    // unregister(`template1${uid}`);
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
                                )}
                                <a
                                    className={
                                        element === `template1${uid}.buttons.properties`
                                            ? 'selected btn btn-secondary'
                                            : viewComponents
                                            ? 'viewComponents element-builder-hover btn btn-secondary'
                                            : 'element-builder-hover btn btn-secondary'
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        setElement(`template1${uid}.buttons.properties`);
                                        setTagName('Buttons');
                                    }}
                                    href="#"
                                >
                                    Download
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </Row>
    );
};

export default Template1;
