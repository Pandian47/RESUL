import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import { ACTIONS_ICONS } from '../../constants';
import { Row } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const Heading = ({ index, insert, remove, uid, styles, ele }) => {
    const { control, watch, setValue, unregister } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const heading = watch(`heading${uid}`);
    // console.log('Heading element ---->> ', heading);

    return (
        <Row
            draggable={true}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'Heading');
                setValue(`heading${uid}.draggedFromBlock`, true);
                e.dataTransfer.setData('textData', JSON.stringify(heading));
                e.dataTransfer.setData('dragId', index);
                e.dataTransfer.setData('dropElement', `heading${uid}.draggedFromBlock`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if (heading.draggedFromBlock) {
                    remove(index);
                    setValue(`heading${uid}.draggedFromBlock`, false);
                }
                // unregister(`textField${index}`);
            }}
        >
            {element === `heading${uid}.properties` && (
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
                                            } else if (item.tooltip === 'Duplicate') {
                                                ele.unique = uuid();
                                                ele.styles = heading;
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
                    element === `heading${uid}.properties`
                        ? 'selected m5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover m5'
                }
            >
                <Controller
                    control={control}
                    name={`heading${uid}.value`}
                    render={() => {
                        switch (heading?.properties?.headingType) {
                            case 'Heading 1':
                                return (
                                    <h1
                                        contentEditable
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setElement(`heading${uid}.properties`);
                                            setTagName('Heading');
                                        }}
                                        onBlur={(e) => {
                                            setValue(`heading${uid}.value`, e.target.textContent);
                                        }}
                                        style={{
                                            fontFamily: heading?.properties?.fontStyle?.value,
                                            fontSize: heading?.properties?.fontSize,
                                            color: heading?.properties?.fontColor,
                                            fontWeight: heading?.properties?.fontWeight?.value,
                                            lineHeight:
                                                heading?.properties?.lineHeight + heading?.properties?.lineHeightExt,
                                            letterSpacing: heading?.properties?.letterSpacing,
                                            textAlign: heading?.properties?.textAlign,
                                            textShadow: heading?.properties?.textShadow,
                                            margin:
                                                heading?.properties?.marginTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginLeft +
                                                'px',
                                            padding:
                                                heading?.properties?.paddingTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingLeft +
                                                'px',
                                            width: heading?.properties?.width,
                                            height: heading?.properties?.height,
                                            maxWidth: heading?.properties?.maxWidth,
                                            minHeight: heading?.properties?.minHeight,
                                            backgroundColor: heading?.properties?.backgroundColor,
                                            backgroundAttachment: heading?.properties?.backgroundAttachment,
                                            backgroundPosition: heading?.properties?.backgroundPosition,
                                            backgroundImage: heading?.properties?.backgroundImage,
                                            backgroundRepeat: heading?.properties?.backgroundRepeat,
                                            backgroundSize: heading?.properties?.backgroundSize,
                                            boxShadow: heading?.properties?.boxShadow,
                                            border: heading?.properties?.border,
                                            borderRadius:
                                                heading?.properties?.borderRadiusTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusLeft +
                                                'px',
                                        }}
                                    >
                                        {styles?.value || 'Insert your heading here...'}
                                    </h1>
                                );
                            case 'Heading 2':
                                return (
                                    <h2
                                        contentEditable
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setElement(`heading${uid}.properties`);
                                            setTagName('Heading');
                                        }}
                                        onBlur={(e) => {
                                            setValue(`heading${uid}.value`, e.target.textContent);
                                        }}
                                        style={{
                                            fontFamily: heading?.properties?.fontStyle?.value,
                                            fontSize: heading?.properties?.fontSize,
                                            color: heading?.properties?.fontColor,
                                            fontWeight: heading?.properties?.fontWeight?.value,
                                            lineHeight:
                                                heading?.properties?.lineHeight + heading?.properties?.lineHeightExt,
                                            letterSpacing: heading?.properties?.letterSpacing,
                                            textAlign: heading?.properties?.textAlign,
                                            textShadow: heading?.properties?.textShadow,
                                            margin:
                                                heading?.properties?.marginTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginLeft +
                                                'px',
                                            padding:
                                                heading?.properties?.paddingTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingLeft +
                                                'px',
                                            width: heading?.properties?.width,
                                            height: heading?.properties?.height,
                                            maxWidth: heading?.properties?.maxWidth,
                                            minHeight: heading?.properties?.minHeight,
                                            backgroundColor: heading?.properties?.backgroundColor,
                                            backgroundAttachment: heading?.properties?.backgroundAttachment,
                                            backgroundPosition: heading?.properties?.backgroundPosition,
                                            backgroundImage: heading?.properties?.backgroundImage,
                                            backgroundRepeat: heading?.properties?.backgroundRepeat,
                                            backgroundSize: heading?.properties?.backgroundSize,
                                            boxShadow: heading?.properties?.boxShadow,
                                            border: heading?.properties?.border,
                                            borderRadius:
                                                heading?.properties?.borderRadiusTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusLeft +
                                                'px',
                                        }}
                                    >
                                        {styles?.value || 'Insert your heading here...'}
                                    </h2>
                                );
                            case 'Heading 3':
                                return (
                                    <h3
                                        contentEditable
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setElement(`heading${uid}.properties`);
                                            setTagName('Heading');
                                        }}
                                        onBlur={(e) => {
                                            setValue(`heading${uid}.value`, e.target.textContent);
                                        }}
                                        style={{
                                            fontFamily: heading?.properties?.fontStyle?.value,
                                            fontSize: heading?.properties?.fontSize,
                                            color: heading?.properties?.fontColor,
                                            fontWeight: heading?.properties?.fontWeight?.value,
                                            lineHeight:
                                                heading?.properties?.lineHeight + heading?.properties?.lineHeightExt,
                                            letterSpacing: heading?.properties?.letterSpacing,
                                            textAlign: heading?.properties?.textAlign,
                                            textShadow: heading?.properties?.textShadow,
                                            margin:
                                                heading?.properties?.marginTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginLeft +
                                                'px',
                                            padding:
                                                heading?.properties?.paddingTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingLeft +
                                                'px',
                                            width: heading?.properties?.width,
                                            height: heading?.properties?.height,
                                            maxWidth: heading?.properties?.maxWidth,
                                            minHeight: heading?.properties?.minHeight,
                                            backgroundColor: heading?.properties?.backgroundColor,
                                            backgroundAttachment: heading?.properties?.backgroundAttachment,
                                            backgroundPosition: heading?.properties?.backgroundPosition,
                                            backgroundImage: heading?.properties?.backgroundImage,
                                            backgroundRepeat: heading?.properties?.backgroundRepeat,
                                            backgroundSize: heading?.properties?.backgroundSize,
                                            boxShadow: heading?.properties?.boxShadow,
                                            border: heading?.properties?.border,
                                            borderRadius:
                                                heading?.properties?.borderRadiusTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusLeft +
                                                'px',
                                        }}
                                    >
                                        {styles?.value || 'Insert your heading here...'}
                                    </h3>
                                );
                            case 'Heading 4':
                                return (
                                    <h4
                                        contentEditable
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setElement(`heading${uid}.properties`);
                                            setTagName('Heading');
                                        }}
                                        onBlur={(e) => {
                                            setValue(`heading${uid}.value`, e.target.textContent);
                                        }}
                                        style={{
                                            fontFamily: heading?.properties?.fontStyle?.value,
                                            fontSize: heading?.properties?.fontSize,
                                            color: heading?.properties?.fontColor,
                                            fontWeight: heading?.properties?.fontWeight?.value,
                                            lineHeight:
                                                heading?.properties?.lineHeight + heading?.properties?.lineHeightExt,
                                            letterSpacing: heading?.properties?.letterSpacing,
                                            textAlign: heading?.properties?.textAlign,
                                            textShadow: heading?.properties?.textShadow,
                                            margin:
                                                heading?.properties?.marginTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginLeft +
                                                'px',
                                            padding:
                                                heading?.properties?.paddingTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingLeft +
                                                'px',
                                            width: heading?.properties?.width,
                                            height: heading?.properties?.height,
                                            maxWidth: heading?.properties?.maxWidth,
                                            minHeight: heading?.properties?.minHeight,
                                            backgroundColor: heading?.properties?.backgroundColor,
                                            backgroundAttachment: heading?.properties?.backgroundAttachment,
                                            backgroundPosition: heading?.properties?.backgroundPosition,
                                            backgroundImage: heading?.properties?.backgroundImage,
                                            backgroundRepeat: heading?.properties?.backgroundRepeat,
                                            backgroundSize: heading?.properties?.backgroundSize,
                                            boxShadow: heading?.properties?.boxShadow,
                                            border: heading?.properties?.border,
                                            borderRadius:
                                                heading?.properties?.borderRadiusTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusLeft +
                                                'px',
                                        }}
                                    >
                                        {styles?.value || 'Insert your heading here...'}
                                    </h4>
                                );
                            case 'Heading 5':
                                return (
                                    <h5
                                        contentEditable
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setElement(`heading${uid}.properties`);
                                            setTagName('Heading');
                                        }}
                                        onBlur={(e) => {
                                            setValue(`heading${uid}.value`, e.target.textContent);
                                        }}
                                        style={{
                                            fontFamily: heading?.properties?.fontStyle?.value,
                                            fontSize: heading?.properties?.fontSize,
                                            color: heading?.properties?.fontColor,
                                            fontWeight: heading?.properties?.fontWeight?.value,
                                            lineHeight:
                                                heading?.properties?.lineHeight + heading?.properties?.lineHeightExt,
                                            letterSpacing: heading?.properties?.letterSpacing,
                                            textAlign: heading?.properties?.textAlign,
                                            textShadow: heading?.properties?.textShadow,
                                            margin:
                                                heading?.properties?.marginTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginLeft +
                                                'px',
                                            padding:
                                                heading?.properties?.paddingTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingLeft +
                                                'px',
                                            width: heading?.properties?.width,
                                            height: heading?.properties?.height,
                                            maxWidth: heading?.properties?.maxWidth,
                                            minHeight: heading?.properties?.minHeight,
                                            backgroundColor: heading?.properties?.backgroundColor,
                                            backgroundAttachment: heading?.properties?.backgroundAttachment,
                                            backgroundPosition: heading?.properties?.backgroundPosition,
                                            backgroundImage: heading?.properties?.backgroundImage,
                                            backgroundRepeat: heading?.properties?.backgroundRepeat,
                                            backgroundSize: heading?.properties?.backgroundSize,
                                            boxShadow: heading?.properties?.boxShadow,
                                            border: heading?.properties?.border,
                                            borderRadius:
                                                heading?.properties?.borderRadiusTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusLeft +
                                                'px',
                                        }}
                                    >
                                        {styles?.value || 'Insert your heading here...'}
                                    </h5>
                                );
                            case 'Heading 6':
                                return (
                                    <h6
                                        contentEditable
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setElement(`heading${uid}.properties`);
                                            setTagName('Heading');
                                        }}
                                        onBlur={(e) => {
                                            setValue(`heading${uid}.value`, e.target.textContent);
                                        }}
                                        style={{
                                            fontFamily: heading?.properties?.fontStyle?.value,
                                            fontSize: heading?.properties?.fontSize,
                                            color: heading?.properties?.fontColor,
                                            fontWeight: heading?.properties?.fontWeight?.value,
                                            lineHeight:
                                                heading?.properties?.lineHeight + heading?.properties?.lineHeightExt,
                                            letterSpacing: heading?.properties?.letterSpacing,
                                            textAlign: heading?.properties?.textAlign,
                                            textShadow: heading?.properties?.textShadow,
                                            margin:
                                                heading?.properties?.marginTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginLeft +
                                                'px',
                                            padding:
                                                heading?.properties?.paddingTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingLeft +
                                                'px',
                                            width: heading?.properties?.width,
                                            height: heading?.properties?.height,
                                            maxWidth: heading?.properties?.maxWidth,
                                            minHeight: heading?.properties?.minHeight,
                                            backgroundColor: heading?.properties?.backgroundColor,
                                            backgroundAttachment: heading?.properties?.backgroundAttachment,
                                            backgroundPosition: heading?.properties?.backgroundPosition,
                                            backgroundImage: heading?.properties?.backgroundImage,
                                            backgroundRepeat: heading?.properties?.backgroundRepeat,
                                            backgroundSize: heading?.properties?.backgroundSize,
                                            boxShadow: heading?.properties?.boxShadow,
                                            border: heading?.properties?.border,
                                            borderRadius:
                                                heading?.properties?.borderRadiusTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusLeft +
                                                'px',
                                        }}
                                    >
                                        {styles?.value || 'Insert your heading here...'}
                                    </h6>
                                );
                            default:
                                return (
                                    <h1
                                        contentEditable
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setElement(`heading${uid}.properties`);
                                                                                        setTagName('Heading');
                                        }}
                                        onBlur={(e) => {
                                            setValue(`heading${uid}.value`, e.target.textContent);
                                        }}
                                        style={{
                                            fontFamily: heading?.properties?.fontStyle?.value,
                                            fontSize: heading?.properties?.fontSize,
                                            color: heading?.properties?.fontColor,
                                            fontWeight: heading?.properties?.fontWeight?.value,
                                            lineHeight:
                                                heading?.properties?.lineHeight + heading?.properties?.lineHeightExt,
                                            letterSpacing: heading?.properties?.letterSpacing,
                                            textAlign: heading?.properties?.textAlign,
                                            textShadow: heading?.properties?.textShadow,
                                            margin:
                                                heading?.properties?.marginTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.marginLeft +
                                                'px',
                                            padding:
                                                heading?.properties?.paddingTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.paddingLeft +
                                                'px',
                                            width: heading?.properties?.width,
                                            height: heading?.properties?.height,
                                            maxWidth: heading?.properties?.maxWidth,
                                            minHeight: heading?.properties?.minHeight,
                                            backgroundColor: heading?.properties?.backgroundColor,
                                            backgroundAttachment: heading?.properties?.backgroundAttachment,
                                            backgroundPosition: heading?.properties?.backgroundPosition,
                                            backgroundImage: heading?.properties?.backgroundImage,
                                            backgroundRepeat: heading?.properties?.backgroundRepeat,
                                            backgroundSize: heading?.properties?.backgroundSize,
                                            boxShadow: heading?.properties?.boxShadow,
                                            border: heading?.properties?.border,
                                            borderRadius:
                                                heading?.properties?.borderRadiusTop +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusRight +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusBottom +
                                                'px' +
                                                ' ' +
                                                heading?.properties?.borderRadiusLeft +
                                                'px',
                                        }}
                                    >
                                        {styles?.value || 'Insert your heading here...'}
                                    </h1>
                                );
                        }
                    }}
                />
            </div>
        </Row>
    );
};

export default Heading;
