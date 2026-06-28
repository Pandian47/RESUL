import { useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import { ACTIONS_ICONS } from '../../constants';
import { Row } from 'react-bootstrap';
import TimerContainer from './Components/TimerContainer';
import { v4 as uuid } from 'uuid';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const TimerElement = ({ index, insert, remove, uid, styles, ele }) => {
    const { control, watch, setValue, unregister, getValues } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const timer = watch(`timer${uid}`) || styles;
    const countDownDate = new Date(timer?.properties?.start).getTime();

    const [countDown, setCountDown] = useState(countDownDate - new Date().getTime());
    const [count, setCount] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            let temp = countDownDate - new Date().getTime();
            setCountDown(temp);
            if (temp <= 0) {
                                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [countDownDate]);

    // useEffect(() => {
    //     if (countDown <= 0) {
    //         clearInterval(interval);
    //         console.log('sDFSDSDF');
    //     }
    // }, [countDown]);

    const getReturnValues = () => {
        // calculate time left
        const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
        const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

        // console.log('Time ---- >>>> ', days, hours, minutes, seconds, countDown);
        return [days, hours, minutes, seconds];
    };

    return (
        <div
            draggable={true}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'Timer');
                setValue(`timer${uid}.draggedFromBlock`, true);
                e.dataTransfer.setData('textData', JSON.stringify(timer));
                e.dataTransfer.setData('dragId', index);
                e.dataTransfer.setData('dropElement', `timer${uid}.draggedFromBlock`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if (timer.draggedFromBlock) {
                    remove(index);
                    setValue(`timer${uid}.draggedFromBlock`, false);
                }
                // unregister(`textField${index}`);
            }}
        >
            {element === `timer${uid}.properties` && (
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
                                                unregister(`timer${uid}`);
                                                remove(index);
                                            } else if (item.tooltip === 'Duplicate') {
                                                ele.unique = uuid();
                                                ele.styles = timer;
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
            <div
                className={
                    element === `timer${uid}.properties`
                        ? 'selected m5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover m5'
                }
                style={{ width: '100%' }}
            >
                <Row
                    onClick={(e) => {
                        e.stopPropagation();
                        setElement(`timer${uid}.properties`);
                        setTagName('Timer');
                    }}
                    className="m5 p3"
                    style={{
                        fontFamily: timer?.properties?.fontStyle?.value,
                        fontSize: timer?.properties?.fontSize,
                        color: timer?.properties?.fontColor,
                        fontWeight: timer?.properties?.fontWeight?.value,
                        lineHeight: timer?.properties?.lineHeight + timer?.properties?.lineHeightExt,
                        letterSpacing: timer?.properties?.letterSpacing,
                        textAlign: timer?.properties?.textAlign,
                        textShadow: timer?.properties?.textShadow,
                        margin:
                            timer?.properties?.marginTop +
                            'px' +
                            ' ' +
                            timer?.properties?.marginRight +
                            'px' +
                            ' ' +
                            timer?.properties?.marginBottom +
                            'px' +
                            ' ' +
                            timer?.properties?.marginLeft +
                            'px',
                        padding:
                            timer?.properties?.paddingTop +
                            'px' +
                            ' ' +
                            timer?.properties?.paddingRight +
                            'px' +
                            ' ' +
                            timer?.properties?.paddingBottom +
                            'px' +
                            ' ' +
                            timer?.properties?.paddingLeft +
                            'px',
                        width: timer?.properties?.width,
                        height: timer?.properties?.height,
                        maxWidth: timer?.properties?.maxWidth,
                        minHeight: timer?.properties?.minHeight,
                        backgroundColor: timer?.properties?.backgroundColor,
                        backgroundAttachment: timer?.properties?.backgroundAttachment,
                        backgroundPosition: timer?.properties?.backgroundPosition,
                        backgroundImage: timer?.properties?.backgroundImage,
                        backgroundRepeat: timer?.properties?.backgroundRepeat,
                        backgroundSize: timer?.properties?.backgroundSize,
                        boxShadow: timer?.properties?.boxShadow,
                        border: timer?.properties?.border,
                        borderRadius:
                            timer?.properties?.borderRadiusTop +
                            'px' +
                            ' ' +
                            timer?.properties?.borderRadiusRight +
                            'px' +
                            ' ' +
                            timer?.properties?.borderRadiusBottom +
                            'px' +
                            ' ' +
                            timer?.properties?.borderRadiusLeft +
                            'px',
                    }}
                >
                    {countDown <= 0 ? (
                        <span>{timer?.properties?.endText || 'Expired'}</span>
                    ) : (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setElement(`timer${uid}.container.properties`);
                                setTagName('Section');
                            }}
                            className={
                                element === `timer${uid}.container.properties`
                                    ? 'selected m5'
                                    : viewComponents
                                    ? 'viewComponents element-builder-hover m5'
                                    : 'element-builder-hover m5'
                            }
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                animationName: timer?.container?.properties?.animationName?.value,
                                animationDuration: timer?.container?.properties?.durationSec + 's',
                                animationDelay: timer?.container?.properties?.delaySec + 's',
                                fontFamily: timer?.container?.properties?.fontStyle?.value,
                                fontSize: timer?.container?.properties?.fontSize,
                                color: timer?.container?.properties?.fontColor,
                                fontWeight: timer?.container?.properties?.fontWeight?.value,
                                lineHeight:
                                    timer?.container?.properties?.lineHeight +
                                    timer?.container?.properties?.lineHeightExt,
                                letterSpacing: timer?.container?.properties?.letterSpacing,
                                textAlign: timer?.container?.properties?.textAlign,
                                textShadow: timer?.container?.properties?.textShadow,
                                margin:
                                    timer?.container?.properties?.marginTop +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.marginRight +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.marginBottom +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.marginLeft +
                                    'px',
                                padding:
                                    timer?.container?.properties?.paddingTop +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.paddingRight +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.paddingBottom +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.paddingLeft +
                                    'px',
                                width: timer?.container?.properties?.width,
                                height: timer?.container?.properties?.height,
                                maxWidth: timer?.container?.properties?.maxWidth,
                                minHeight: timer?.container?.properties?.minHeight,
                                backgroundColor: timer?.container?.properties?.backgroundColor,
                                backgroundAttachment: timer?.container?.properties?.backgroundAttachment,
                                backgroundPosition: timer?.container?.properties?.backgroundPosition,
                                backgroundImage: timer?.container?.properties?.backgroundImage,
                                backgroundRepeat: timer?.container?.properties?.backgroundRepeat,
                                backgroundSize: timer?.container?.properties?.backgroundSize,
                                boxShadow: timer?.container?.properties?.boxShadow,
                                border: timer?.container?.properties?.border,
                                borderRadius:
                                    timer?.container?.properties?.borderRadiusTop +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.borderRadiusRight +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.borderRadiusBottom +
                                    'px' +
                                    ' ' +
                                    timer?.container?.properties?.borderRadiusLeft +
                                    'px',
                            }}
                        >
                            <TimerContainer
                                propertyName={`days`}
                                styles={timer?.days?.properties}
                                uid={uid}
                                numberStyles={timer?.daysNumber?.properties}
                                textStyles={timer?.daysText?.properties}
                                numberData={
                                    getReturnValues()[0] < 10 ? '0' + getReturnValues()[0] : getReturnValues()[0]
                                }
                                textData={'Days'}
                            />
                            <TimerContainer
                                propertyName={`hours`}
                                styles={timer?.hours?.properties}
                                uid={uid}
                                numberStyles={timer?.hoursNumber?.properties}
                                textStyles={timer?.hoursText?.properties}
                                numberData={
                                    getReturnValues()[1] < 10 ? '0' + getReturnValues()[1] : getReturnValues()[1]
                                }
                                textData={'Hours'}
                            />
                            <TimerContainer
                                propertyName={`minutes`}
                                styles={timer?.minutes?.properties}
                                uid={uid}
                                numberStyles={timer?.minutesNumber?.properties}
                                textStyles={timer?.minutesText?.properties}
                                numberData={
                                    getReturnValues()[2] < 10 ? '0' + getReturnValues()[2] : getReturnValues()[2]
                                }
                                textData={'Minutes'}
                            />
                            <TimerContainer
                                propertyName={`seconds`}
                                styles={timer?.seconds?.properties}
                                uid={uid}
                                numberStyles={timer?.secondsNumber?.properties}
                                textStyles={timer?.secondsText?.properties}
                                numberData={
                                    getReturnValues()[3] < 10 ? '0' + getReturnValues()[3] : getReturnValues()[3]
                                }
                                textData={'Seconds'}
                            />
                        </div>
                    )}
                </Row>
            </div>
        </div>
    );
};

export default TimerElement;
