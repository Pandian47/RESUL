import { useContext, useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { ACTIONS_ICONS, COLUMN_DATA_VALUES, ENTIRE_ELEMENETS_DATA } from '../../constants';
import { Col, Row } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';
import { v4 as uuid } from 'uuid';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';
import { safeParseJSON } from 'Utils/modules/stringUtils';

const SectionElement = ({ index, insert, remove, uid, styles, ele }) => {
    const { control, watch, setValue, getValues } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);
    // const [toggle, setToggle] = useState(false);
    // const [sectionData, setSectionData] = useState([]);
    const section = watch(`section${uid}`) || styles;
    const {
        fields: sectionData,

        remove: removeSectionData,
        move,
        insert: insertSectionData,
    } = useFieldArray({ name: `section${uid}.data`, control: control });
    
    // const insertSectionData = (index, item) => {
    //     // item[0].unique = uuid();
    //     let temp = [...sectionData];
    //     temp.splice(index, 0, ...item);
    //     console.log('Data :::::: ', uuid());
    //     setSectionData(temp);
    // };

    // const removeSectionData = (index) => {
    //     let temp = [...sectionData];
    //     temp.splice(index, 1);
    //     setSectionData(temp);
    // };

    useEffect(() => {
        if (styles?.data) {
            setValue(`section${uid}.data`, styles?.data);
        }
    }, []);

    const dropElements = (e, ind) => {
        e.stopPropagation();
        const getElement = e.dataTransfer.getData('name');
        const getElementData = e.dataTransfer.getData('textData');
                // setDropToggle(false);
        const filterItem = ENTIRE_ELEMENETS_DATA.filter((item) => item.label === getElement);
                const getID = e.dataTransfer.getData('dragId');
        const getDropElement = e.dataTransfer.getData('dropElement');
        const parsedElementData = safeParseJSON(getElementData);
        if (getValues(getDropElement)) {
            if (parsedElementData?.draggedFromBlock) {
                                filterItem[0].unique = uuid();
                filterItem[0].styles = parsedElementData;
                // sInsert(ind, filterItem);
                insertSectionData(ind, filterItem);
            } else {
                // move(+getID, ind);
            }
            setValue(getDropElement, true);
        } else {
            if (filterItem[0].type === 'Blocks') {
                let colName = filterItem[0].colName;
                let length = COLUMN_DATA_VALUES[colName]?.length;
                for (var i = 0; i < length; i++) {
                    COLUMN_DATA_VALUES[colName][i].unique = uuid();
                    if (parsedElementData) COLUMN_DATA_VALUES[colName][i].styles = parsedElementData;
                    if (filterItem[0]?.label !== 'Section') {
                        // sInsert(ind, COLUMN_DATA_VALUES[colName][i])

                        insertSectionData(ind, COLUMN_DATA_VALUES[colName][i]);
                    }
                }
                            } else {
                                filterItem[0].unique = uid;
                if (parsedElementData) filterItem[0].styles = parsedElementData;
                if (filterItem[0]?.label !== 'Section') {
                    // sInsert(ind, filterItem)
                    insertSectionData(ind, filterItem);
                }
            }
        }
    };
    return (
        <div
            draggable={true}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'Text');
                setValue(`section${uid}.draggedFromBlock`, true);
                e.dataTransfer.setData('textData', JSON.stringify(section));
                e.dataTransfer.setData('dragId', index);
                // e.dataTransfer.setData('dropElement', `section${uid}.draggedFromBlock`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if (!section.dragged) {
                    remove(index);
                    setValue(`section${uid}.draggedFromBlock`, false);
                }
                // unregister(`textField${index}`);
            }}
        >
            {element === `section${uid}.properties` && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {ACTIONS_ICONS.map((item) => {
                        return (
                            <RSTooltip text={item.tooltip} position="bottom" key={item.id}>
                                <div style={{ backgroundColor: '#0540d3', marginRight: '2px', padding: '2px' }}>
                                    <i
                                        className={`${item.icon} icon-md`}
                                        onClick={(e) => {
                                            if (item.tooltip === 'Remove') {
                                                remove(index);
                                                // setDropToggle(true);
                                            } else if (item.tooltip === 'Duplicate') {
                                                ele.unique = uuid();
                                                ele.styles = section;
                                                // ele.styles.data = section?.data;
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
                    element === `section${uid}.properties`
                        ? 'selected p-5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover p-5'
                        : 'element-builder-hover p-5'
                }
            >
                <Controller
                    control={control}
                    name={`section${uid}.value`}
                    render={() => {
                        return (
                            <section
                                // contentEditable
                                // suppressContentEditableWarning={true}
                                onClick={(e) => {
                                    // if (dropToggle) {
                                    //     e.stopPropagation();
                                    // }
                                    e.stopPropagation();
                                    // console.log('adsdkthjnd', dropToggle);
                                    setElement(`section${uid}.properties`);
                                    setTagName('Section');
                                }}
                                onBlur={(e) => {
                                                                        setValue(`section${uid}.value`, e.target.textContent);
                                }}
                                id={section?.properties?.id}
                                title={section?.properties?.title}
                                style={{
                                    animationName: section?.properties?.animationName?.value,
                                    animationDuration: section?.properties?.durationSec + 's',
                                    animationDelay: section?.properties?.delaySec + 's',
                                    fontFamily: section?.properties?.fontStyle?.value,
                                    fontSize: section?.properties?.fontSize,
                                    color: section?.properties?.fontColor,
                                    fontWeight: section?.properties?.fontWeight?.value,
                                    lineHeight: section?.properties?.lineHeight + section?.properties?.lineHeightExt,
                                    letterSpacing: section?.properties?.letterSpacing,
                                    textAlign: section?.properties?.textAlign,
                                    textShadow: section?.properties?.textShadow,
                                    margin:
                                        section?.properties?.marginTop +
                                        'px' +
                                        ' ' +
                                        section?.properties?.marginRight +
                                        'px' +
                                        ' ' +
                                        section?.properties?.marginBottom +
                                        'px' +
                                        ' ' +
                                        section?.properties?.marginLeft +
                                        'px',
                                    padding:
                                        section?.properties?.paddingTop +
                                        'px' +
                                        ' ' +
                                        section?.properties?.paddingRight +
                                        'px' +
                                        ' ' +
                                        section?.properties?.paddingBottom +
                                        'px' +
                                        ' ' +
                                        section?.properties?.paddingLeft +
                                        'px',
                                    width: section?.properties?.width,
                                    height: section?.properties?.height,
                                    maxWidth: section?.properties?.maxWidth,
                                    minHeight: section?.properties?.minHeight,
                                    backgroundColor: section?.properties?.backgroundColor,
                                    backgroundAttachment: section?.properties?.backgroundAttachment,
                                    backgroundPosition: section?.properties?.backgroundPosition,
                                    backgroundImage: section?.properties?.backgroundImage,
                                    backgroundRepeat: section?.properties?.backgroundRepeat,
                                    backgroundSize: section?.properties?.backgroundSize,
                                    boxShadow: section?.properties?.boxShadow,
                                    border: section?.properties?.border,
                                    borderRadius:
                                        section?.properties?.borderRadiusTop +
                                        'px' +
                                        ' ' +
                                        section?.properties?.borderRadiusRight +
                                        'px' +
                                        ' ' +
                                        section?.properties?.borderRadiusBottom +
                                        'px' +
                                        ' ' +
                                        section?.properties?.borderRadiusLeft +
                                        'px',
                                }}
                            >
                                <div
                                    onDrop={(e) => dropElements(e, 0)}
                                    onDragOver={(e) => e.preventDefault()}
                                    className={sectionData?.length === 0 ? 'd-flex justify-content-center bg-info' : ''}
                                >
                                    <Row>
                                        {sectionData?.length ? (
                                            sectionData.map((ele, idx) => {
                                                // console.log('ele', ele);
                                                if (
                                                    ele.label === 'Buttons' ||
                                                    ele.label === 'Link Block' ||
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
                                                            {element === `${ele.name}${ele.unique}.properties` && (
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'flex-end',
                                                                    }}
                                                                >
                                                                    {ACTIONS_ICONS.map((item) => {
                                                                        return (
                                                                            <RSTooltip
                                                                                text={item.tooltip}
                                                                                position="bottom"
                                                                                key={item.id}
                                                                            >
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
                                                                                            if (
                                                                                                item.tooltip ===
                                                                                                'Remove'
                                                                                            ) {
                                                                                                setElement(`default`);

                                                                                                removeSectionData(idx);
                                                                                            } else if (
                                                                                                item.tooltip === 'Drag'
                                                                                            ) {
                                                                                                e.stopPropagation();
                                                                                                // setToggle(true);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </RSTooltip>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            {/* <small className="pop">{ele.popoverLabel}</small> */}
                                                            {}
                                                            {/* <div className='rs-form-builder-drop-box' >
                                        <span className="text-center">Drop here</span>
                                    </div> */}
                                                            {ele.component(
                                                                idx,
                                                                insertSectionData,
                                                                removeSectionData,
                                                                ele.unique,
                                                                ele.styles,
                                                            )}
                                                        </Col>
                                                    );
                                                } else if (ele.label === 'Icons') {
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
                                                            {ele.component(
                                                                idx,
                                                                removeSectionData,
                                                                ele.unique,
                                                                ele.styles,
                                                            )}
                                                        </Col>
                                                    );
                                                } else if (ele.type === 'Blocks') {
                                                    return (
                                                        <Col
                                                            sm={ele.colSize}
                                                            key={ele.id}
                                                            // id="Col-2 data"
                                                            style={
                                                                ele.colName === 'columnCenter'
                                                                    ? { display: 'flex', justifyContent: 'center' }
                                                                    : { display: 'contents' }
                                                            }
                                                            className="mb30 "
                                                            onDrop={(e) => dropElements(e, idx)}
                                                            onDragOver={(e) => e.preventDefault()}
                                                        >
                                                            {/* <small className="pop">{ele.popoverLabel}</small> */}
                                                            {}
                                                            {/* <div className='rs-form-builder-drop-box' >
                                        <span className="text-center">Drop here</span>
                                    </div> */}
                                                            {ele.component(
                                                                idx,
                                                                removeSectionData,
                                                                ele.unique,
                                                                ele.styles,
                                                            )}
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
                                                            {ele.component(
                                                                idx,
                                                                insertSectionData,
                                                                removeSectionData,
                                                                ele.unique,
                                                                ele.styles,
                                                                ele,
                                                            )}
                                                        </Row>
                                                    );
                                                }
                                            })
                                        ) : (
                                            <div
                                                className="mb30"
                                                // onDrop={(e) => dropElements(e, 0)}
                                                // onDragOver={(e) => e.preventDefault()}
                                            >
                                                <span>Drag your elements here</span>
                                            </div>
                                        )}
                                    </Row>
                                </div>
                            </section>
                        );
                    }}
                />
            </div>
        </div>
    );
};

export default SectionElement;
