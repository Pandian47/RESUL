import { arrow_up_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { COLUMN_DATA_VALUES, ENTIRE_ELEMENETS_DATA } from '../../../constants';
import { Col, Row } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import RSTooltip from 'Components/RSTooltip';
import { LandingTemplateContext } from '../../../Pages/LandingPageBuilder/LandingPageBuilder';
import { safeParseJSON } from 'Utils/modules/stringUtils';

const TimerNumber = ({ styles, uid, propertyName, data, tag, fontSize, defaultData }) => {
    const { control, getValues, setValue } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);
    const { fields, insert, move, remove, append } = useFieldArray({ control, name: `timer${uid}.${propertyName}` });
    useEffect(() => {
        if (fields?.length === 0) {
            // append({ temp: 'default', first: 'asdas', last: 'asdasd' });
            setValue(`timer${uid}.${propertyName}`, [{ temp: 'default' }]);
            // console.log('Data -- - -- >>>> ', fields);
        }

            }, []);
    // console.log('Data -- - -- >>>> ', fields);
    const dropElements = (e, ind) => {
        e.stopPropagation();
                const getElement = e.dataTransfer.getData('name');
        const getElementData = e.dataTransfer.getData('textData');
                // setDropToggle(false);
        const filterItem = ENTIRE_ELEMENETS_DATA.filter((item) => item.label === getElement);
                const getID = e.dataTransfer.getData('dragId');
        const getDropElement = e.dataTransfer.getData('dropElement');
        const parsedElementData = safeParseJSON(getElementData);
        if (getElementData !== '') {
            if (parsedElementData?.draggedFromBlock) {
                                filterItem[0].unique = uuid();
                filterItem[0].styles = parsedElementData;
                insert(ind, filterItem);
            } else {
                move(+getID, ind);
            }
            setValue(getDropElement, true);
        } else {
            if (filterItem[0].type === 'Blocks') {
                let colName = filterItem[0].colName;
                let length = COLUMN_DATA_VALUES[colName]?.length;
                for (var i = 0; i < length; i++) {
                    COLUMN_DATA_VALUES[colName][i].unique = uuid();
                    if (parsedElementData) COLUMN_DATA_VALUES[colName][i].styles = parsedElementData;
                    if (filterItem[0]?.label !== 'Section') insert(ind, COLUMN_DATA_VALUES[colName][i]);
                }
                            } else {
                                filterItem[0].unique = uuid();
                filterItem[0].styles = {};
                if (filterItem[0]?.label !== 'Section') insert(ind, filterItem);
            }
        }
    };
    return (
        <>
            {element === `timer${uid}.${propertyName}.properties` && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <RSTooltip text={'Move'} position="bottom">
                        <div style={{ backgroundColor: '#0540d3', marginRight: '2px', padding: '2px' }}>
                            <i
                                className={`${arrow_up_medium} icon-md`}
                                onClick={(e) => {
                                    // e.stopPropagation();
                                    // if (item.tooltip === 'Remove') {
                                    //     setElement(`default`);
                                    //     // unregister(`timer${uid}`);
                                    //     remove(index);
                                    // } else if (item.tooltip === 'Drag') {
                                    //     e.stopPropagation();
                                    //     setToggle(true);
                                    // }
                                                                    }}
                            />
                        </div>
                    </RSTooltip>
                </div>
            )}
            <div
                className={
                    element === `timer${uid}.${propertyName}.properties`
                        ? 'selected m5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover m5'
                }
                onDrop={(e) => dropElements(e, 0)}
                onDragOver={(e) => e.preventDefault()}
            >
                {fields.map((ele, idx) => {
                    if (ele.temp === 'default') {
                        return (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setElement(`timer${uid}.${propertyName}.properties`);

                                    setTagName(tag);
                                }}
                                style={{
                                    animationName: styles?.animationName?.value,
                                    animationDuration: styles?.durationSec + 's',
                                    animationDelay: styles?.delaySec + 's',
                                    fontFamily: styles?.fontStyle?.value,
                                    fontSize: styles?.fontSize || fontSize,
                                    color: styles?.fontColor,
                                    fontWeight: styles?.fontWeight?.value,
                                    lineHeight:
                                        styles?.lineHeight + styles?.lineHeightExt ||
                                        (tag === 'Text' ? '25px' : '120px'),
                                    letterSpacing: styles?.letterSpacing,
                                    textAlign: styles?.textAlign,
                                    textShadow: styles?.textShadow,
                                    margin:
                                        styles?.marginTop +
                                        'px' +
                                        ' ' +
                                        styles?.marginRight +
                                        'px' +
                                        ' ' +
                                        styles?.marginBottom +
                                        'px' +
                                        ' ' +
                                        styles?.marginLeft +
                                        'px',
                                    padding:
                                        styles?.paddingTop +
                                        'px' +
                                        ' ' +
                                        styles?.paddingRight +
                                        'px' +
                                        ' ' +
                                        styles?.paddingBottom +
                                        'px' +
                                        ' ' +
                                        styles?.paddingLeft +
                                        'px',
                                    width: styles?.width,
                                    height: styles?.height,
                                    maxWidth: styles?.maxWidth,
                                    minHeight: styles?.minHeight,
                                    backgroundColor: styles?.backgroundColor,
                                    backgroundAttachment: styles?.backgroundAttachment,
                                    backgroundPosition: styles?.backgroundPosition,
                                    backgroundImage: styles?.backgroundImage,
                                    backgroundRepeat: styles?.backgroundRepeat,
                                    backgroundSize: styles?.backgroundSize,
                                    boxShadow: styles?.boxShadow,
                                    border: styles?.border,
                                    borderRadius:
                                        styles?.borderRadiusTop +
                                        'px' +
                                        ' ' +
                                        styles?.borderRadiusRight +
                                        'px' +
                                        ' ' +
                                        styles?.borderRadiusBottom +
                                        'px' +
                                        ' ' +
                                        styles?.borderRadiusLeft +
                                        'px',
                                }}
                            >
                                {data || defaultData ? defaultData : '00'}
                            </span>
                        );
                    } else if (
                        ele.label === 'Buttons' ||
                        ele.label === 'Link Block' ||
                        ele.label === 'Icon' ||
                        ele.label === 'Image'
                    ) {
                        return (
                            <Col
                                sm={ele.colSize}
                                key={ele.id}
                                id="Col-2 data"
                                style={{ display: 'contents' }}
                                onDrop={(e) => dropElements(e, idx)}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {/* <small className="pop">{ele.popoverLabel}</small> */}
                                {}
                                {/* <div className='rs-form-builder-drop-box' >
                    <span className="text-center">Drop here</span>
                </div> */}
                                {ele.component(idx, remove, ele.unique, ele.styles)}
                            </Col>
                        );
                    } else if (ele.type === 'Blocks') {
                        return (
                            <Col
                                sm={ele.colSize}
                                key={ele.id}
                                // id="Col-2 data"
                                style={{ display: 'contents' }}
                                className="mb30 "
                                onDrop={(e) => dropElements(e, idx)}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {/* <small className="pop">{ele.popoverLabel}</small> */}
                                {}
                                {/* <div className='rs-form-builder-drop-box' >
                    <span className="text-center">Drop here</span>
                </div> */}
                                {ele.component(idx, remove, ele.unique, ele.styles)}
                            </Col>
                        );
                    } else {
                        return (
                            <Row
                                key={ele.id}
                                className="mb30 "
                                onDrop={(e) => dropElements(e, idx)}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {/* <small className="pop">{ele.popoverLabel}</small> */}
                                {}
                                {/* <div className='rs-form-builder-drop-box' >
                <span className="text-center">Drop here</span>
            </div> */}
                                {ele.component(idx, remove, ele.unique, ele.styles)}
                            </Row>
                        );
                    }
                })}
            </div>
        </>
    );
};

export default TimerNumber;
