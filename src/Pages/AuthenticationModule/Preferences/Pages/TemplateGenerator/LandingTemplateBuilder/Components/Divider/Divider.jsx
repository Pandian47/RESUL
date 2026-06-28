import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { Row } from 'react-bootstrap';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const DividerElement = ({ index, remove, uid, styles }) => {
    const { control, watch, setValue, unregister } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const divider = watch(`divider${uid}`);
    // console.log('Text element ---->> ', divider);
    return (
        <Row
            draggable={true}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'Divider');
                setValue(`divider${uid}.draggedFromBlock`, true);
                e.dataTransfer.setData('textData', JSON.stringify(divider));
                e.dataTransfer.setData('dragId', index);
                e.dataTransfer.setData('dropElement', `divider${uid}.draggedFromBlock`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if (divider.draggedFromBlock) {
                    remove(index);
                    setValue(`divider${uid}.draggedFromBlock`, false);
                }
            }}
        >
            {/* {element === `divider${uid}.properties` && (
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
                                                unregister(`divider${uid}`);
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

            <div
                // href={divider?.properties?.href}
                className={
                    element === `divider${uid}.properties`
                        ? 'selected m5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover m5'
                        : 'element-builder-hover m5'
                }
                onClick={(e) => {
                    e.stopPropagation();
                    setElement(`divider${uid}.properties`);
                    setTagName('Divider');
                }}
                // id={divider?.properties?.id}
                // title={divider?.properties?.title}
                style={{
                    margin:
                        divider?.properties?.marginTop +
                        'px' +
                        ' ' +
                        divider?.properties?.marginRight +
                        'px' +
                        ' ' +
                        divider?.properties?.marginBottom +
                        'px' +
                        ' ' +
                        divider?.properties?.marginLeft +
                        'px',
                    padding:
                        divider?.properties?.paddingTop +
                        'px' +
                        ' ' +
                        divider?.properties?.paddingRight +
                        'px' +
                        ' ' +
                        divider?.properties?.paddingBottom +
                        'px' +
                        ' ' +
                        divider?.properties?.paddingLeft +
                        'px',
                    width: divider?.properties?.width || '100%',
                    height: divider?.properties?.height || '10px',
                    maxWidth: divider?.properties?.maxWidth,
                    minHeight: divider?.properties?.minHeight,
                    backgroundColor: divider?.properties?.backgroundColor || 'black',
                }}
            ></div>
        </Row>
    );
};

export default DividerElement;
