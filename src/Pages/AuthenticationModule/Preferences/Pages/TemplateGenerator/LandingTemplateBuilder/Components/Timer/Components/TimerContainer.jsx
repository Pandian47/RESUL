import { arrow_up_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect } from 'react';
import TimerNumber from './TimerNumber';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Col } from 'react-bootstrap';
import { COLUMN_DATA_VALUES, ENTIRE_ELEMENETS_DATA } from '../../../constants';
import { v4 as uuid } from 'uuid';
import RSTooltip from 'Components/RSTooltip';
import { LandingTemplateContext } from '../../../Pages/LandingPageBuilder/LandingPageBuilder';
import { safeParseJSON } from 'Utils/modules/stringUtils';

const TimerContainer = ({ propertyName, styles, uid, numberStyles, textStyles, numberData, textData }) => {
    const { control, getValues, setValue } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);
    const { fields, insert, move, remove, append } = useFieldArray({ control, name: `timer${uid}.${propertyName}` });
    useEffect(() => {
        if (fields?.length === 0) {
            // append( { temp: 'default', first: 'asdas', last: 'asdasd' });
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
                onClick={(e) => {
                    e.stopPropagation();
                    setElement(`timer${uid}.${propertyName}.properties`);
                    setTagName('Section');
                }}
                className={
                    element === `timer${uid}.${propertyName}.properties`
                        ? 'selected m5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover m5'
                }
                onDrop={(e) => dropElements(e, 0)}
                style={{
                    display: 'grid',
                    justifyItems: 'center',
                    animationName: styles?.animationName?.value,
                    animationDuration: styles?.durationSec + 's',
                    animationDelay: styles?.delaySec + 's',
                    fontFamily: styles?.fontStyle?.value,
                    fontSize: styles?.fontSize,
                    color: styles?.fontColor,
                    fontWeight: styles?.fontWeight?.value,
                    lineHeight: styles?.lineHeight + styles?.lineHeightExt,
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
                {fields.map((item, idx) => {
                    if (item.temp !== 'default') {
                        return (
                            <Col
                                sm={item.colSize}
                                key={item.id}
                                // id="Col-2 data"
                                style={{ display: 'contents' }}
                                className=" "
                                onDrop={(e) => dropElements(e, idx)}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {item.component(idx, remove, item.unique, item.styles)}
                            </Col>
                        );
                    } else {
                        return (
                            <>
                                <TimerNumber
                                    propertyName={`${propertyName}Number`}
                                    tag={'Section'}
                                    data={numberData}
                                    styles={numberStyles}
                                    uid={uid}
                                    fontSize={'80px'}
                                    // default={propertyName}
                                />

                                <TimerNumber
                                    propertyName={`${propertyName}Text`}
                                    tag={'Text'}
                                    data={textData}
                                    styles={textStyles}
                                    uid={uid}
                                    defaultData={propertyName}
                                />
                            </>
                        );
                    }
                })}
            </div>
        </>
    );
};

export default TimerContainer;
