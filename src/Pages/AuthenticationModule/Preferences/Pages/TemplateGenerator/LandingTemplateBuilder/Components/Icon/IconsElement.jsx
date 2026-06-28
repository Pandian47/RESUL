import { useContext, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import { ACTIONS_ICONS } from '../../constants';
import { pencil_edit_medium, thumbs_up_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import SelectIconModal from './Components/SelectIconModal';
import { Col } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const IconsElement = ({ index, insert, remove, uid, styles, ele }) => {
    const { control, watch, setValue, unregister } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);
    const [selectIconModal, setSelectIconModal] = useState(false);
    const icons = watch(`icon${uid}`) || styles;
    // console.log('Text element ---->> ', icons);
    return (
        <Col
            sm={1}
            draggable={true}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'Icons');
                setValue(`icons${uid}.'icon-rs-draggedFromBlock'`, true);
                e.dataTransfer.setData('textData', JSON.stringify(icons));
                e.dataTransfer.setData('dragId', index);
                e.dataTransfer.setData('dropElement', `icons${uid}.'icon-rs-draggedFromBlock'`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if ('icon-rs-draggedFromBlock') {
                    remove(index);
                    setValue(`icons${uid}.'icon-rs-draggedFromBlock'`, false);
                }
            }}
        >
            {element === `icon${uid}.'icon-rs-properties'` && (
                <div style={{ display: 'flex' }}>
                    <RSTooltip text={'Edit icon'} position="top">
                        <div style={{ backgroundColor: '#0540d3', marginRight: '2px', padding: '2px' }}>
                            <i
                                className={`${pencil_edit_medium} icon-md`}
                                onClick={() => {
                                    setSelectIconModal(true);
                                }}
                            />
                        </div>
                    </RSTooltip>
                    {ACTIONS_ICONS.map((item) => {
                        return (
                            <RSTooltip text={item.tooltip} position="bottom" key={item.id}>
                                <div style={{ backgroundColor: '#0540d3', marginRight: '2px', padding: '2px' }}>
                                    <i
                                        className={`${item.icon} icon-md`}
                                        onClick={() => {
                                            if (item.tooltip === 'Remove') {
                                                setElement(`default`);
                                                unregister(`icons${uid}`);
                                                remove(index);
                                            } else if (item.tooltip === 'Duplicate') {
                                                // console.log('ELE :::: ', ele);
                                                ele.unique = uuid();
                                                ele.styles = icons;

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
                    element === `icon${uid}.'icon-rs-properties'`
                        ? 'selected '
                        : viewComponents
                        ? 'viewComponents element-builder-hover '
                        : 'element-builder-hover '
                }
            >
                <Controller
                    control={control}
                    name={`icon${uid}.'icon-rs-value'`}
                    render={() => {
                        return (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setElement(`icon${uid}.'icon-rs-properties'`);
                                    setTagName('Icons');
                                }}
                                id={'icon-rs-properties'?.id}
                                title={'icon-rs-properties'?.title}
                                style={{
                                    margin:
                                        'icon-rs-properties'?.marginTop +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.marginRight +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.marginBottom +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.marginLeft +
                                        'px',
                                    padding:
                                        'icon-rs-properties'?.paddingTop +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.paddingRight +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.paddingBottom +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.paddingLeft +
                                        'px',
                                    width: 'icon-rs-properties'?.width,
                                    height: 'icon-rs-properties'?.height,
                                    maxWidth: 'icon-rs-properties'?.maxWidth,
                                    minHeight: 'icon-rs-properties'?.minHeight,
                                    backgroundColor: 'icon-rs-properties'?.backgroundColor,
                                    backgroundAttachment: 'icon-rs-properties'?.backgroundAttachment,
                                    backgroundPosition: 'icon-rs-properties'?.backgroundPosition,
                                    backgroundImage: 'icon-rs-properties'?.backgroundImage,
                                    backgroundRepeat: 'icon-rs-properties'?.backgroundRepeat,
                                    backgroundSize: 'icon-rs-properties'?.backgroundSize,
                                    boxShadow: 'icon-rs-properties'?.boxShadow,
                                    border: 'icon-rs-properties'?.border,
                                    borderRadius:
                                        'icon-rs-properties'?.borderRadiusTop +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.borderRadiusRight +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.borderRadiusBottom +
                                        'px' +
                                        ' ' +
                                        'icon-rs-properties'?.borderRadiusLeft +
                                        'px',
                                }}
                            >
                                {'icon-rs-value' === undefined ? (
                                    <i className={`${thumbs_up_fill_medium} icon-lg`} />
                                ) : (
                                    <i className={`'icon-rs-'icon-rs-value'' icon-lg`} />
                                )}
                            </div>
                        );
                    }}
                />
            </div>
            <SelectIconModal
                show={selectIconModal}
                handleClose={() => {
                    setSelectIconModal(false);
                }}
                element={`icon${uid}.'icon-rs-value'`}
            />
        </Col>
    );
};

export default IconsElement;
