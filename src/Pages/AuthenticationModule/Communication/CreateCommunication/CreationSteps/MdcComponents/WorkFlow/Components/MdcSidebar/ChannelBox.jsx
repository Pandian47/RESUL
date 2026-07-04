import { AUDIENCE_COUNT_ZERO, DROP_WARN_CHANNEL } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes.js';
import { Card, ListGroup } from 'react-bootstrap';
import CanvasWarning from '../Modal/CanvasWarning';
import CreateWorkFlowContext from '../../context';
import { cloneDeep as _cloneDeep, filter, some } from 'Utils/modules/lodashReplacements';
import { getMdcGlyph, rootNodeLength, checkChannelExistInRoot, GenerateNodeId, GenerateNodePosition } from '../../constant';
const style = {
    border: '1px dashed gray',
    backgroundColor: 'white',
    padding: '0.5rem 1rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    cursor: 'move',
    float: 'left',
};
const ChannelBox = ({ itemIndex, channelObj, name }) => {
    const [isClickOff, setClickOff] = useState(false);
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    //console.log('wwwwww', canvasState, channelObj);
    const { defaultEle, nodeState, edgeState, dataSource } = canvasState;
    const isSubsegmentJoureny = dataSource?.isSubsegmentJoureny ?? false;
    const nodeStateLength = nodeState.length;
    let dragCnt = 0;
    useEffect(() => {
        if (!nodeState || nodeState?.length <= 1) {
            setClickOff(true);
        } else {
            setClickOff(false);
        }

        if (isSubsegmentJoureny && canvasState?.nodeState?.length) {
            const subSegmentNodeList = filter(canvasState?.nodeState, { type: 'SubSegmentItem' });
            const hasTrueIsSubSegmentSave =
                some(subSegmentNodeList, 'data.isSubSegmentSave') ||
                some(canvasState?.subSegment?.subSegmentList, 'data.isSubSegmentSave');
            if (hasTrueIsSubSegmentSave) {
                setClickOff(false);
            } else {
                setClickOff(true);
            }
        }

        if (nodeState?.length == 0 && !canvasState['dataSource']['Type'] && channelObj['id'] === 'ch003') {
            setClickOff(false);
        } else if (nodeState?.length > 0 && canvasState['dataSource']['Type'] && channelObj['id'] === 'ch003') {
            setClickOff(true);
        }
    }, [nodeState, isSubsegmentJoureny, canvasState?.subSegment?.subSegmentList]);
    const [isShowCanvasWarning, setCanvasWarning] = useState({
        showModal: false,
        warningMessage: AUDIENCE_COUNT_ZERO,
        otherDetails: {},
    });

    const { showModal, warningMessage, otherDetails } = isShowCanvasWarning;

    const [{ isDragging, handlerId }, drag] = useDrag(() => ({
        type: ItemTypes.Source,
        item: {
            name,
            listType: channelObj['id'],
            icon: channelObj['icon'],
            bgClassName: channelObj['className'],
            friendlyName: channelObj['friendlyName'],
        },
        options: { dropEffect: 'copy', nodeState },
        end: (item, monitor) => {
            dragCnt = 0;
            const dropResult = monitor.getDropResult();
                        if (item && dropResult && !dropResult.hasOwnProperty('dropError')) {
                                if (item['listType'] === 'ch003') {
                    dispatchState({
                        type: 'QR_CODE_DRAG_END',
                        payload: [],
                    });
                } else {
                    dispatchState({
                        type: 'CHANNEL_DRAG_END',
                        payload: [],
                    });
                }
            } else {
                                if (item['listType'] === 'ch003') {
                    dispatchState({
                        type: 'QR_CODE_DRAG_END',
                        payload: [],
                    });
                } else {
                    if (dropResult?.hasOwnProperty('dropError')) {
                                                setCanvasWarning((pre) => ({
                            ...pre,
                            showModal: true,
                            warningMessage: dropResult?.dropError?.isGoalPlaceholder
                                ? dropResult?.dropError?.message
                                : pre?.warningMessage ||
                                  AUDIENCE_COUNT_ZERO,
                            otherDetails: {
                                ...pre?.otherDetails,
                                subsegmentDetails: { ...dropResult?.dropError?.isSubSegment },
                            },
                        }));
                    }
                    dispatchState({
                        type: 'CHANNEL_DRAG_END',
                        payload: [],
                    });
                }
            }
        },
        collect: (monitor) => ({
            isDragging: (() => {
                let isDragStart = monitor.isDragging() ? true : false;
                                const length = rootNodeLength(canvasState);
                // if (isDragStart && !dragCnt && length > 0) {
                //     console.log(dragCnt, 'dragCntdragCntdragCnt');
                //     const [nodeId] = GenerateNodeId(canvasState);
                //     let Position = GenerateNodePosition({
                //         nodes: canvasState,
                //         currentNodeId: nodeId,
                //         type: 'rootChannelAddon',
                //         optionList: '',
                //     })[0];
                //     const { x, y } = Position;

                //     let placeholderObj = _cloneDeep(canvasState?.defaultEle);
                //     placeholderObj = {
                //         ...placeholderObj,
                //         id: nodeId,
                //         type: 'Placeholder',
                //         targetPosition: 'left',
                //         sourcePosition: 'right',
                //         data: { ...placeholderObj.data, elementAddOnType: 'rootAddon' },
                //     };
                //     placeholderObj = { ...placeholderObj, position: { x, y } };
                //     dragCnt++;
                //     dispatchState({
                //         type: 'ROOT_CHANNEL_ADDON_START',
                //         payload: placeholderObj,
                //     });
                // }
                return isDragStart;
            })(),
            handlerId: monitor.getHandlerId(),
        }),
    }));

    useEffect(() => {
        const length = rootNodeLength(canvasState);
        const isExist = checkChannelExistInRoot(canvasState, channelObj['id']);

        const saveSubSegmentList = filter(canvasState?.subSegment?.subSegmentList, 'data.isSubSegmentSave');

        // console.log(saveSubSegmentList, 'saveSubSegmentListIds');

        let availablePlaceholder = [];

        function getNextNodeId(availablePlaceholder, nodeId) {
            if (availablePlaceholder.length) {
                const lastItem = availablePlaceholder.at(-1);
                const lastNodeId = lastItem?.data?.currentWindowId?.split('flowchartWindow')[1];

                const lastId = +lastNodeId + 1;

                return `flowchartWindow${lastId}`;
            } else {
                return nodeId;
            }
        }

        saveSubSegmentList?.forEach((segment) => {
            const currentSubSegmentActiveChannelList = canvasState?.Campaign?.CanvasChannel?.activeChannel?.filter(
                (activeChannel) => activeChannel?.subSegmentLevel === segment?.data?.subSegmentLevel,
            );

            let channelAlreadyExists = false;
            let isExistSubSegmentChannel;

            if (currentSubSegmentActiveChannelList?.length) {
                isExistSubSegmentChannel =
                    currentSubSegmentActiveChannelList[currentSubSegmentActiveChannelList?.length - 1];
                const existStatus = currentSubSegmentActiveChannelList?.every((activeChannel) => {
                    return activeChannel.ChannelId !== channelObj.id;
                });
                if (existStatus) {
                    channelAlreadyExists = false;
                } else {
                    channelAlreadyExists = true;
                }
            }

            if (currentSubSegmentActiveChannelList?.length && !channelAlreadyExists && currentSubSegmentActiveChannelList?.length < 4 ) {
                const [nodeId] = GenerateNodeId(canvasState);

                let dummyPlaceholder = _cloneDeep(canvasState?.defaultEle);
                dummyPlaceholder = {
                    ...dummyPlaceholder,
                    id: getNextNodeId(availablePlaceholder, nodeId),
                    position: {
                        x: isExistSubSegmentChannel?.Position?.left,
                        y: isExistSubSegmentChannel?.Position?.top + 100,
                    },
                    data: {
                        ...dummyPlaceholder.data,
                        elementAddOnType: 'rootAddon',
                        currentWindowId: getNextNodeId(availablePlaceholder, nodeId),
                        audienceCount: isExistSubSegmentChannel?.audienceCount,
                        subSegmentLevel: isExistSubSegmentChannel?.subSegmentLevel,
                        isSubSegmentSave: false,
                    },
                };
                availablePlaceholder.push(dummyPlaceholder);
            }
        });

        if (availablePlaceholder?.length && !dragCnt && isDragging) {
            dragCnt++;

            dispatchState({
                type: 'ROOT_CHANNEL_ADDON_START',
                payload: availablePlaceholder,
            });
        }

        if (!dragCnt && length >= 1 && length < 5 && isDragging && !isExist) {
            const [nodeId] = GenerateNodeId(canvasState);
            let Position = GenerateNodePosition({
                nodes: canvasState,
                currentNodeId: nodeId,
                type: 'rootChannelAddon',
                optionList: '',
            })[0];
            const { x, y } = Position;

            let placeholderObj = _cloneDeep(canvasState?.defaultEle);
            placeholderObj = {
                ...placeholderObj,
                id: nodeId,
                type: 'Placeholder',
                targetPosition: 'left',
                sourcePosition: 'right',
                data: { ...placeholderObj.data, elementAddOnType: 'rootAddon' },
            };
            placeholderObj = { ...placeholderObj, position: { x, y } };

            placeholderObj = {
                ...placeholderObj,
                data: { ...placeholderObj['data'], currentWindowId: nodeId },
            };

            dragCnt++;
            dispatchState({
                type: 'ROOT_CHANNEL_ADDON_START',
                payload: placeholderObj,
            });
        } else if (!dragCnt && length === 0 && isDragging && !isExist && channelObj['id'] === 'ch003') {
            const [nodeId] = GenerateNodeId(canvasState);
            let Position = GenerateNodePosition({
                nodes: canvasState,
                currentNodeId: nodeId,
                type: 'qr',
                optionList: '',
            })[0];
            const { x, y } = Position;
            let placeholderObj = _cloneDeep(canvasState?.defaultEle);
            placeholderObj = {
                ...placeholderObj,
                id: nodeId,
                type: 'qr',
                targetPosition: 'left',
                sourcePosition: 'right',
                data: { ...placeholderObj.data },
            };
            placeholderObj = { ...placeholderObj, position: { x, y } };

            placeholderObj = {
                ...placeholderObj,
                data: { ...placeholderObj['data'], currentWindowId: nodeId },
            };
                        dragCnt++;
            dispatchState({
                type: 'QR_CODE_DRAG_START',
                payload: placeholderObj,
            });
        }
    }, [handlerId, isDragging]);
        const opacity = isDragging ? 0.4 : '';

    if (showModal) {
        return (
            <CanvasWarning
                show={showModal}
                warnText={warningMessage}
                handleClose={() => {
                    setCanvasWarning((pre) => ({
                        showModal: false,
                        warningMessage: '',
                    }));
                }}
                isPotentialAudeinceCount={{
                    isShowCountStatus: warningMessage === DROP_WARN_CHANNEL ? false : true,
                    details: otherDetails,
                }}
            />
        );
    }
    return (
        <>
            <ListGroup.Item
                className={`border-0 ${isClickOff || channelObj['draggable'] == false ? 'pe-none click-off' : ''}`}
                as="li"
                key={itemIndex}
                // style={{ opacity }}
            >
              <span draggable={channelObj.draggable} ref={drag}>
                  <i className={`color-body-bg-color icon-xl ${getMdcGlyph(channelObj.icon)} ${channelObj.className}`}></i>
                <Card.Text className="font-xxs lh14 pt5" title={channelObj.label}>
                    {channelObj.label}
                </Card.Text>
              </span>
            </ListGroup.Item>
        </>
    );
};
export default memo(ChannelBox);
