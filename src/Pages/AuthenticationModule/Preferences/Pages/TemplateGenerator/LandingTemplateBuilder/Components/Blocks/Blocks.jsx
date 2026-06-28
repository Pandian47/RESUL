import { useContext, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { ACTIONS_ICONS, LANDING_PAGE_ELEMENTS } from '../../constants';
import { Col } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';
import { v4 as uuid } from 'uuid';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';
import { safeParseJSON } from 'Utils/modules/stringUtils';

const Blocks = ({ index }) => {
    const { control, watch, setValue } = useFormContext();
    const { element, setElement, tagName, setTagName, dropToggle, setDropToggle, remove } =
        useContext(LandingTemplateContext);
    const [blocksElements, setBlocksElements] = useState([]);
    const [blocks2Elements, setBlocks2Elements] = useState([]);

    const blocks = watch(`blocks${index}`);
    // console.log('Text element ---->> ', blocks);
    const {
        fields: bfields,
        append: bAppend,
        remove: bRemove,
    } = useFieldArray({ name: `blockElements`, control: control });
    const {
        fields: b2fields,
        append: b2Append,
        remove: b2Remove,
    } = useFieldArray({ name: `blockElements2`, control: control });

    const dropElements = (e) => {
        e.stopPropagation();
        const getElement = e.dataTransfer.getData('name');
        const getElementData = e.dataTransfer.getData('textData');
                // setDropToggle(false);
        const filterItem = LANDING_PAGE_ELEMENTS.filter((item) => item.label === getElement);
        
        filterItem[0].uid = uuid();
        const parsedStyles = safeParseJSON(getElementData);
        if (parsedStyles) filterItem[0].styles = parsedStyles;
                if (filterItem[0].label !== 'Section') bAppend(filterItem);
    };
    const drop2Elements = (e) => {
        e.stopPropagation();
        const getElement = e.dataTransfer.getData('name');
        const getElementData = e.dataTransfer.getData('textData');
                // setDropToggle(false);
        const filterItem = LANDING_PAGE_ELEMENTS.filter((item) => item.label === getElement);
        
        filterItem[0].uid = uuid();
        const parsedStyles2 = safeParseJSON(getElementData);
        if (parsedStyles2) filterItem[0].styles = parsedStyles2;
                if (filterItem[0].label !== 'Section') b2Append(filterItem);
    };
    return (
        <>
            {element === `blocks${index}.properties` && (
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
                                            } else if (item.tooltip === 'Move') {
                                                                                            }
                                        }}
                                    />
                                </div>
                            </RSTooltip>
                        );
                    })}
                </div>
            )}

            <Controller
                control={control}
                name={`blocks${index}.value`}
                render={() => {
                    return (
                        <>
                            {(element === `blocks${index}.col1.properties` ||
                                element === `blocks${index}.col2.properties`) && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <RSTooltip text={'Move'} position="bottom">
                                        <div
                                            style={{
                                                backgroundColor: '#0540d3',
                                                marginRight: '2px',
                                                padding: '2px',
                                            }}
                                        >
                                            <i
                                                className={`icon-rs-arrow-up-medium icon-md`}
                                                onClick={(e) => {
                                                                                                    }}
                                            />
                                        </div>
                                    </RSTooltip>
                                </div>
                            )}
                            <>
                                <Col
                                    sm={6}
                                    onDrop={(e) => dropElements(e)}
                                    className={
                                        element === `blocks${index}.col1.properties`
                                            ? 'selected p-5'
                                            : 'element-builder-hover p-5'
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setElement(`blocks${index}.col1.properties`);
                                        setTagName('Section');
                                    }}
                                >
                                    {bfields.map((item, idx) => {
                                        return item.component(item.uid, bRemove, item.styles);
                                    })}
                                </Col>
                                <Col
                                    sm={6}
                                    onDrop={(e) => drop2Elements(e)}
                                    className={
                                        element === `blocks${index}.col2.properties`
                                            ? 'selected p-5'
                                            : 'element-builder-hover p-5'
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setElement(`blocks${index}.col2.properties`);
                                        setTagName('Section');
                                    }}
                                >
                                    {b2fields.map((item, idx) => {
                                        return item.component(item.uid, b2Remove, item.styles);
                                    })}
                                </Col>
                            </>
                            {/* </Row> */}
                        </>
                    );
                }}
            />
        </>
    );
};

export default Blocks;
