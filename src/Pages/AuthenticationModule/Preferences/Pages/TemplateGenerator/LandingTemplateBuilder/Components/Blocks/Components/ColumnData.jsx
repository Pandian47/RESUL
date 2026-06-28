import { useContext, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Col, Row } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';
import { v4 as uuid } from 'uuid';
import { ACTIONS_ICONS, COLUMN_DATA_VALUES, ENTIRE_ELEMENETS_DATA } from '../../../constants';
import { LandingTemplateContext } from '../../../Pages/LandingPageBuilder/LandingPageBuilder';
import { safeParseJSON } from 'Utils/modules/stringUtils';

const ColumnData = ({ index, insert, remove, uid, styles, ele, size }) => {
    const { control, watch, setValue, getValues } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const Column = watch(`Col${size}${uid}`) || styles;
    const {
        fields: bfields,
        append: bAppend,
        remove: bRemove,
        move,
        insert: bInsert,
    } = useFieldArray({ name: `Col${size}${uid}.data`, control: control });

    useEffect(() => {
        if (styles?.data) {
            setValue(`Col${size}${uid}.data`, styles?.data);
        }
    }, []);

    const dropElements = (e, ind) => {
        e.stopPropagation();
        const getElement = e.dataTransfer.getData('name');
        const getElementData = e.dataTransfer.getData('textData');
        // console.log('data :::  ', getElement, getElementData);
        // setDropToggle(false);
        const filterItem = ENTIRE_ELEMENETS_DATA.filter((item) => item.label === getElement);

        const getID = e.dataTransfer.getData('dragId');
        const getDropElement = e.dataTransfer.getData('dropElement');
        const parsedElementData = safeParseJSON(getElementData);
                if (getValues(getDropElement)) {
                        filterItem[0].unique = uuid();
            if (parsedElementData) filterItem[0].styles = parsedElementData;
            insert(ind, filterItem);

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
        // filterItem[0].unique = uuid();
        // if (getElementData !== '') {
        //     filterItem[0].styles = JSON.parse(getElementData);
        //     console.log('dropped Column ---- >', filterItem, JSON.parse(getElementData));
        // }
        // console.log('dsdfsdfsdfd ', filterItem);
        // if (filterItem[0]?.label !== 'Section') bAppend(filterItem);
    };

    return (
        <Col
            sm={size}
            onDrop={(e) => dropElements(e, 0)}
            onDragOver={(e) => e.preventDefault()}
            className={
                element === `Col${size}${uid}.properties`
                    ? 'selected p-5'
                    : viewComponents
                    ? 'viewComponents element-builder-hover p-5'
                    : 'element-builder-hover p-5'
            }
            onClick={(e) => {
                e.stopPropagation();
                setElement(`Col${size}${uid}.properties`);
                setTagName('Section');
            }}
            style={{
                animationName: Column?.properties?.animationName?.value,
                animationDuration: Column?.properties?.durationSec + 's',
                animationDelay: Column?.properties?.delaySec + 's',
                fontFamily: Column?.properties?.fontStyle?.value,
                fontSize: Column?.properties?.fontSize,
                color: Column?.properties?.fontColor,
                fontWeight: Column?.properties?.fontWeight?.value,
                lineHeight: Column?.properties?.lineHeight + Column?.properties?.lineHeightExt,
                letterSpacing: Column?.properties?.letterSpacing,
                textAlign: Column?.properties?.textAlign,
                textShadow: Column?.properties?.textShadow,
                margin:
                    Column?.properties?.marginTop +
                    'px' +
                    ' ' +
                    Column?.properties?.marginRight +
                    'px' +
                    ' ' +
                    Column?.properties?.marginBottom +
                    'px' +
                    ' ' +
                    Column?.properties?.marginLeft +
                    'px',
                padding:
                    Column?.properties?.paddingTop +
                    'px' +
                    ' ' +
                    Column?.properties?.paddingRight +
                    'px' +
                    ' ' +
                    Column?.properties?.paddingBottom +
                    'px' +
                    ' ' +
                    Column?.properties?.paddingLeft +
                    'px',
                width: Column?.properties?.width,
                height: Column?.properties?.height,
                maxWidth: Column?.properties?.maxWidth,
                minHeight: Column?.properties?.minHeight,
                backgroundColor: Column?.properties?.backgroundColor,
                backgroundAttachment: Column?.properties?.backgroundAttachment,
                backgroundPosition: Column?.properties?.backgroundPosition,
                backgroundImage: Column?.properties?.backgroundImage,
                backgroundRepeat: Column?.properties?.backgroundRepeat,
                backgroundSize: Column?.properties?.backgroundSize,
                boxShadow: Column?.properties?.boxShadow,
                border: Column?.properties?.border,
                borderRadius:
                    Column?.properties?.borderRadiusTop +
                    'px' +
                    ' ' +
                    Column?.properties?.borderRadiusRight +
                    'px' +
                    ' ' +
                    Column?.properties?.borderRadiusBottom +
                    'px' +
                    ' ' +
                    Column?.properties?.borderRadiusLeft +
                    'px',
            }}
        >
            {element === `Col${size}${uid}.properties` && (
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
                                                remove(index);
                                                // setDropToggle(true);
                                            } else if (item.tooltip === 'Duplicate') {
                                                ele.unique = uuid();
                                                ele.styles = Column;
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
            <Row>
                {
                    // fields?.length ? (
                    bfields.map((ele, idx) => {
                        // console.log('ele', ele);
                        if (ele.label === 'Buttons' || ele.label === 'Link Block' || ele.label === 'Image') {
                            return (
                                <Col
                                    sm={ele.colSize}
                                    key={ele.id}
                                    id="Col-2 data"
                                    style={{ display: 'contents' }}
                                    onDrop={(e) => dropElements(e, idx)}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="p-2"
                                >
                                    {/* <small className="pop">{ele.popoverLabel}</small> */}
                                    {}
                                    {/* <div className='rs-form-builder-drop-box' >
                                        <span className="text-center">Drop here</span>
                                    </div> */}
                                    {ele.component(idx, bInsert, bRemove, ele.unique, ele.styles, ele)}
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
                                    className="p-2"
                                >
                                    {/* <small className="pop">{ele.popoverLabel}</small> */}
                                    {}
                                    {/* <div className='rs-form-builder-drop-box' >
                                        <span className="text-center">Drop here</span>
                                    </div> */}
                                    {ele.component(idx, bInsert, bRemove, ele.unique, ele.styles, ele)}
                                </Col>
                            );
                        } else if (ele.type === 'Blocks') {
                            return (
                                <Col
                                    sm={ele.colSize}
                                    key={ele.id}
                                    // id="Col-2 data"
                                    style={{ display: 'contents' }}
                                    className="mb30 p-2"
                                    onDrop={(e) => dropElements(e, idx)}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {/* <small className="pop">{ele.popoverLabel}</small> */}
                                    {}
                                    {/* <div className='rs-form-builder-drop-box' >
                                        <span className="text-center">Drop here</span>
                                    </div> */}
                                    {ele.component(idx, bInsert, bRemove, ele.unique, ele.styles, ele)}
                                </Col>
                            );
                        } else {
                            return (
                                <Row
                                    key={ele.id}
                                    className="mb30 p-2"
                                    onDrop={(e) => dropElements(e, idx)}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {/* <small className="pop">{ele.popoverLabel}</small> */}
                                    {}
                                    {/* <div className='rs-form-builder-drop-box' >
                                    <span className="text-center">Drop here</span>
                                </div> */}
                                    {ele.component(idx, bInsert, bRemove, ele.unique, ele.styles, ele)}
                                </Row>
                            );
                        }
                    })
                    // ) : (
                    //     <div className="mb30" onDrop={(e) => onDrop(e, 0)} onDragOver={onDragOver}>
                    //         <p>Hello</p>
                    //     </div>
                    // )
                }
            </Row>
            {/* {bfields.map((item, idx) => {
                                // console.log('item in blocks...', item);
                                return (
                                <div>
                                    {item.component(idx, bRemove, item.unique, item.styles)}
                                </div>
                                );
                            })} */}
        </Col>
    );
};

export default ColumnData;
