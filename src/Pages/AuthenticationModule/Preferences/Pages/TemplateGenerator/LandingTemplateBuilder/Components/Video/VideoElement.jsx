import { useContext, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ACTIONS_ICONS } from '../../constants';
import { v4 as uuid } from 'uuid';

import RSTooltip from 'Components/RSTooltip';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const VideoElement = ({ index, insert, remove, uid, styles, ele }) => {
    const { watch, setValue } = useFormContext();
    const { element, setElement, tagName, setTagName, viewComponents } = useContext(LandingTemplateContext);

    const video = watch(`video${uid}`) || styles;

    // console.log('Text element ---->> ', video);

    // const dropElements = (e, ind) => {
    //     e.stopPropagation();
    //     const getElement = e.dataTransfer.getData('name');
    //     const getElementData = e.dataTransfer.getData('textData');
    //     console.log('data :::  ', getElement, getElementData);
    //     // setDropToggle(false);
    //     const filterItem = ENTIRE_ELEMENETS_DATA.filter((item) => item.label === getElement);
    //     console.log('Filter item =----> ', filterItem);
    //     const getID = e.dataTransfer.getData('dragId');
    //     const getDropElement = e.dataTransfer.getData('dropElement');
    //     if (getValues(getDropElement)) {
    //         if (getElementData !== '' && JSON.parse(getElementData).draggedFromBlock) {
    //             console.log('getting dragged');
    //             filterItem[0].unique = uuid();
    //             filterItem[0].styles = JSON.parse(getElementData);
    //             insert(ind, filterItem);
    //         } else {
    //             move(+getID, ind);
    //         }
    //         setValue(getDropElement, true);
    //     } else {
    //         if (filterItem[0].type === 'Blocks') {
    //             let colName = filterItem[0].colName;
    //             let length = COLUMN_DATA_VALUES[colName]?.length;
    //             for (var i = 0; i < length; i++) {
    //                 COLUMN_DATA_VALUES[colName][i].unique = uuid();
    //                 if (getElementData !== '') COLUMN_DATA_VALUES[colName][i].styles = JSON.parse(getElementData);
    //                 if (filterItem[0]?.label !== 'Video') insert(ind, COLUMN_DATA_VALUES[colName][i]);
    //             }
    //             console.log('Blocks------ >>>> ', COLUMN_DATA_VALUES[colName][0]);
    //         } else {
    //             console.log('Testinggg ----- - - >>>> ', filterItem, getDropElement);
    //             filterItem[0].unique = uuid();
    //             if (getElementData !== '') filterItem[0].styles = JSON.parse(getElementData);
    //             if (filterItem[0]?.label !== 'Video') insert(ind, filterItem);
    //         }
    //     }
    // };
    // useEffect(() => {
    //     setValue(`video${uid}.properties.provider`, 'Youtube');
    // }, []);
        return (
        <div
            draggable={true}
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('name', 'Text');
                setValue(`video${uid}.draggedFromBlock`, true);
                e.dataTransfer.setData('textData', JSON.stringify(video));
                e.dataTransfer.setData('dragId', index);
                // e.dataTransfer.setData('dropElement', `video${uid}.draggedFromBlock`);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                if (!video.dragged) {
                    remove(index);
                    setValue(`video${uid}.draggedFromBlock`, false);
                }
                // unregister(`textField${index}`);
            }}
        >
            {element === `video${uid}.properties` && (
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
                                                ele.styles = video;
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
                    element === `video${uid}.properties`
                        ? 'selected p-5'
                        : viewComponents
                        ? 'viewComponents element-builder-hover p-5'
                        : 'element-builder-hover p-5'
                }
                onClick={(e) => {
                    e.stopPropagation();
                                        setElement(`video${uid}.properties`);
                    setTagName('Video');
                }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    fontFamily: video?.properties?.fontStyle?.value,
                    fontSize: video?.properties?.fontSize,
                    color: video?.properties?.fontColor,
                    fontWeight: video?.properties?.fontWeight?.value,
                    lineHeight: video?.properties?.lineHeight + video?.properties?.lineHeightExt,
                    letterSpacing: video?.properties?.letterSpacing,
                    textAlign: video?.properties?.textAlign,
                    textShadow: video?.properties?.textShadow,
                    margin:
                        video?.properties?.marginTop +
                        'px' +
                        ' ' +
                        video?.properties?.marginRight +
                        'px' +
                        ' ' +
                        video?.properties?.marginBottom +
                        'px' +
                        ' ' +
                        video?.properties?.marginLeft +
                        'px',
                    padding:
                        video?.properties?.paddingTop +
                        'px' +
                        ' ' +
                        video?.properties?.paddingRight +
                        'px' +
                        ' ' +
                        video?.properties?.paddingBottom +
                        'px' +
                        ' ' +
                        video?.properties?.paddingLeft +
                        'px',
                    width: video?.properties?.width,
                    height: video?.properties?.height,
                    maxWidth: video?.properties?.maxWidth,
                    minHeight: video?.properties?.minHeight,
                    backgroundColor: video?.properties?.backgroundColor,
                    backgroundAttachment: video?.properties?.backgroundAttachment,
                    backgroundPosition: video?.properties?.backgroundPosition,
                    backgroundImage: video?.properties?.backgroundImage,
                    backgroundRepeat: video?.properties?.backgroundRepeat,
                    backgroundSize: video?.properties?.backgroundSize,
                    boxShadow: video?.properties?.boxShadow,
                    border: video?.properties?.border,
                    borderRadius:
                        video?.properties?.borderRadiusTop +
                        'px' +
                        ' ' +
                        video?.properties?.borderRadiusRight +
                        'px' +
                        ' ' +
                        video?.properties?.borderRadiusBottom +
                        'px' +
                        ' ' +
                        video?.properties?.borderRadiusLeft +
                        'px',
                }}
            >
                {
                    <>
                        {video?.properties?.provider === 'HTML5 Source' && (
                            <iframe src={video?.properties?.videoLink} />
                        )}
                        {video?.properties?.provider === 'Youtube' && (
                            <iframe src={'https://www.youtube.com/embed/' + video?.properties?.videoLink} />
                        )}
                        {video?.properties?.provider === 'Vimeo' && (
                            <iframe
                                src={'https://player.vimeo.com/video/' + video?.properties?.videoLink || '831751272'}
                            ></iframe>
                        )}
                    </>
                }
            </div>
        </div>
    );
};

export default VideoElement;
