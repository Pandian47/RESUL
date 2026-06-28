import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import { ACTIONS_ICONS } from '../../constants';
import { v4 as uuid } from 'uuid';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const LinkBlock = ({ index, insert, remove, uid, styles, ele }) => {
    const { control, watch, setValue, unregister } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const linkBlock = watch(`linkBlock${uid}`) || styles;
    // console.log('Text element ---->> ', linkBlock);
    return (
        // <div
        //     draggable={toggle}
        //     onDragStart={(e) => {
        //         e.dataTransfer.setData('name', 'Link Block');
        //         setValue(`linkBlock${uid}.draggedFromBlock`, true);
        //         e.dataTransfer.setData('textData', JSON.stringify(linkBlock));
        //         e.dataTransfer.setData('dragId', index);
        //         e.dataTransfer.setData('dropElement', `linkBlock${uid}.draggedFromBlock`);
        //     }}
        //     onDragEnd={() => {
        //         if (linkBlock.draggedFromBlock) {
        //             remove(index);
        //             setValue(`linkBlock${uid}.draggedFromBlock`, false);
        //         }
        //     }}
        // >
        <>
            {/* <div
                className={element === `linkBlock${uid}.properties` ? 'selected' : 'element-builder-hover'}
                style={{ width: 'auto' }}
            > */}
            {/* <Controller
                    control={control}
                    name={`linkBlock${uid}.value`}
                    render={() => {
                        return ( */}
            {element === `linkBlock${uid}.properties` && (
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
                                                ele.styles = linkBlock;
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
            <a
                href={linkBlock?.properties?.href}
                draggable={true}
                onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('name', 'Link Block');
                    setValue(`linkBlock${uid}.draggedFromBlock`, true);
                    e.dataTransfer.setData('textData', JSON.stringify(linkBlock));
                    e.dataTransfer.setData('dragId', index);
                    e.dataTransfer.setData('dropElement', `linkBlock${uid}.draggedFromBlock`);
                }}
                onDragEnd={(e) => {
                    e.stopPropagation();
                    if (linkBlock.draggedFromBlock) {
                        remove(index);
                        setValue(`linkBlock${uid}.draggedFromBlock`, false);
                    }
                }}
                className={
                    element === `linkBlock${uid}.properties`
                        ? 'selected m5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover m5'
                }
                onClick={(e) => {
                    e.stopPropagation();
                    setElement(`linkBlock${uid}.properties`);
                    setValue(`linkBlock${uid}.value`, linkBlock?.properties?.title);
                    setTagName('LinkBlock');
                }}
                // id={linkBlock?.properties?.id}
                // title={linkBlock?.properties?.title}
                style={{
                    fontFamily: linkBlock?.properties?.fontStyle?.value,
                    fontSize: linkBlock?.properties?.fontSize,
                    color: linkBlock?.properties?.fontColor,
                    fontWeight: linkBlock?.properties?.fontWeight?.value,
                    lineHeight: linkBlock?.properties?.lineHeight + linkBlock?.properties?.lineHeightExt,
                    letterSpacing: linkBlock?.properties?.letterSpacing,
                    textAlign: linkBlock?.properties?.textAlign,
                    textShadow: linkBlock?.properties?.textShadow,
                    margin:
                        linkBlock?.properties?.marginTop +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.marginRight +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.marginBottom +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.marginLeft +
                        'px',
                    padding:
                        linkBlock?.properties?.paddingTop +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.paddingRight +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.paddingBottom +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.paddingLeft +
                        'px',
                    width: linkBlock?.properties?.width,
                    height: linkBlock?.properties?.height,
                    maxWidth: linkBlock?.properties?.maxWidth,
                    minHeight: linkBlock?.properties?.minHeight,
                    backgroundColor: linkBlock?.properties?.backgroundColor,
                    backgroundAttachment: linkBlock?.properties?.backgroundAttachment,
                    backgroundPosition: linkBlock?.properties?.backgroundPosition,
                    backgroundImage: linkBlock?.properties?.backgroundImage,
                    backgroundRepeat: linkBlock?.properties?.backgroundRepeat,
                    backgroundSize: linkBlock?.properties?.backgroundSize,
                    boxShadow: linkBlock?.properties?.boxShadow,
                    border: linkBlock?.properties?.border,
                    borderRadius:
                        linkBlock?.properties?.borderRadiusTop +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.borderRadiusRight +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.borderRadiusBottom +
                        'px' +
                        ' ' +
                        linkBlock?.properties?.borderRadiusLeft +
                        'px',
                }}
            >
                {linkBlock?.properties?.title || 'Link Block'}
            </a>
            {/* );
                    }}
                /> */}
            {/* </div> */}
        </>
    );
};

export default LinkBlock;
