import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ENTAER_VALID } from 'Constants/GlobalConstant/ValidationMessage';
import { AUDIENCE_LIST_WILL_BE_REMOVED, CANCEL, CANVAS_WILL_BE_RESET, DELETE_AUDIENCE_SEGMENTS, DO_YOU_WISH_TO_CONTINUE, I_AGREE_MDC, OK, RESET_CANVAS_FLOW } from 'Constants/GlobalConstant/Placeholders';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import _cloneDeep from 'lodash/cloneDeep';
import Proptypes from 'prop-types';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSCheckbox from 'Components/FormFields/RSCheckbox';


import { ChannelRemove, SourceRemove } from './ChannelConst';
import { deletMdcChannels, saveMdcCanvasData } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { buildCanvasDataSavePayload, GenerateNodeId, GenerateNodePosition } from '../../constant';
import CreateWorkFlowContext from '../../context';
import useApiLoader from 'Hooks/useApiLoader';
const DeleteChannel = ({
    nodeId,
    mdcCanvas,
    dispatch,
    basePayload,
    channelDeleteUpdate,
    type = 'channel',
    isRemove,
    resetDelete = () => {},
}) => {
    const [isConfirm, setConfirm] = useState(false);
    const deleteChannelLoader = useApiLoader({ autoFetch: false });
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm();
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);

    const handleConfirmDelete = () => {
        setConfirm(true);
    };
    const handleClose = () => {
        if (deleteChannelLoader.isFetching) return;
        setConfirm(false);
        resetDelete(false);
        reset();
    };
    useEffect(() => {
        handleConfirmDelete();
    }, [isRemove]);

    const handleAddPlaceholderInSegment = (deleteAfterUpdateCanvasState) => {
        const originalActiveChannel = mdcCanvas?.Campaign?.CanvasChannel?.activeChannel;

        const updateActiveChannel = deleteAfterUpdateCanvasState?.Campaign?.CanvasChannel?.activeChannel;

        const findMatchActiveChannel = originalActiveChannel?.find((activeChannel) => activeChannel?.DomId === nodeId);
        const updateMatchActiveChannel = updateActiveChannel?.filter(
            (activeChannel) => activeChannel.subSegmentLevel === findMatchActiveChannel?.subSegmentLevel,
        );
        if (
            !updateMatchActiveChannel?.length &&
            deleteAfterUpdateCanvasState?.dataSource?.isSubsegmentJoureny &&
            findMatchActiveChannel
        ) {
            const subSegmentLevel = findMatchActiveChannel?.subSegmentLevel;

            const currentSubSegementList = deleteAfterUpdateCanvasState?.subSegment?.subSegmentList?.find(
                (segment) => segment.subSegmentLevel === subSegmentLevel,
            );

            const [nodeId] = GenerateNodeId(canvasState);
            let placeholderObj = _cloneDeep(canvasState?.defaultEle);
            placeholderObj = {
                ...placeholderObj,
                id: nodeId,
                type: 'Placeholder',
                targetPosition: 'left',
                sourcePosition: 'right',
            };
            placeholderObj = {
                ...placeholderObj,
                position: {
                    x: currentSubSegementList?.position?.x + 180 || 0,
                    y: currentSubSegementList?.position?.y || 0,
                },

                data: {
                    ...placeholderObj['data'],
                    parentWindowId: currentSubSegementList?.id,
                    currentWindowId: nodeId,
                    subSegmentLevel: currentSubSegementList?.data?.subSegmentLevel,
                },
            };
            let updateCanvasJSON = {
                ...deleteAfterUpdateCanvasState,
                Campaign: {
                    ...deleteAfterUpdateCanvasState.Campaign,
                    CanvasChannel: {
                        ...deleteAfterUpdateCanvasState.Campaign.CanvasChannel,
                        Placeholder: [
                            ...deleteAfterUpdateCanvasState.Campaign.CanvasChannel.Placeholder,
                            placeholderObj,
                        ],
                    },
                },
            };
            return updateCanvasJSON;
        } else {
            return deleteAfterUpdateCanvasState;
        }
    };

    const handleFormSubmit = async (data) => {
        if (!data.agree || deleteChannelLoader.isFetching) return;

        const { channelDeleteList, MDCTemplate } =
            type === 'root' ? SourceRemove({ mdcCanvas }) : ChannelRemove({ nodeId, mdcCanvas });
        const { defaultEle, nodeState, Campaign } = mdcCanvas;

        let payload = {
            ...basePayload,
            channels: [...channelDeleteList],
        };

        if (mdcCanvas?.dataSource?.isSubsegmentJoureny && type === 'root') {
            const segmentIdlist = mdcCanvas?.subSegment?.subSegmentList
                ?.map((segment) => segment.data.subSegmentId ?? 0)
                ?.filter(Boolean);
            payload = { ...payload, subsegmentId: segmentIdlist };
        }

        let finalMDCTemplate = handleAddPlaceholderInSegment(MDCTemplate);

        const finishDelete = () => {
            setConfirm(false);
            reset();
            channelDeleteUpdate(finalMDCTemplate);

            const saveCanvasPayload = buildCanvasDataSavePayload({ ...basePayload, canvasState: finalMDCTemplate });
            dispatch(saveMdcCanvasData({ saveCanvasPayload }));
            if (finalMDCTemplate['nodeState']?.length === 2) {
                let finalPlaceholder;
                const {
                    Campaign: {
                        CanvasChannel: { IsChannelSwitched, switchCond, activeChannel },
                        PotentialRecipients: { Recipients },
                    },
                    dataSource: { isAutoRefresh },
                } = finalMDCTemplate;
                let Position = GenerateNodePosition({
                    nodes: finalMDCTemplate,
                    currentNodeId: nodeId,
                    type: 'srcItem',
                    optionList: '',
                })[0];
                let parentWindowId = finalMDCTemplate?.dataSource?.DomId;
                const { x, y } = Position;
                const [nodeid] = GenerateNodeId(finalMDCTemplate);
                let placeholderObjNew = _cloneDeep(defaultEle);
                placeholderObjNew = {
                    ...placeholderObjNew,
                    id: nodeid,
                    type: 'Placeholder',
                    targetPosition: 'left',
                    sourcePosition: 'right',
                    position: { x, y },
                };
                placeholderObjNew = {
                    ...placeholderObjNew,
                    data: {
                        ...placeholderObjNew['data'],
                        parentWindowId: parentWindowId,
                        currentWindowId: nodeid,
                        selectedAudienceList: Recipients,
                        isAutoRefresh,
                    },
                };
                finalPlaceholder = [placeholderObjNew];
                dispatchState({
                    type: 'AUDIENCE_LIST_SAVE',
                    payload: placeholderObjNew,
                });
            }
        };

        if (channelDeleteList?.length) {
            await deleteChannelLoader.refetch({
                fetcher: () => dispatch(deletMdcChannels({ payload })),
            });
        }

        finishDelete();
    };
    return (
        <>
            {/* <Icon
                icon={circle_close_fill_medium}
                iconClass={`color-primary-red`}
                mainClass={'elementTopIcon'}
                size="md"
                callBack={handleConfirmDelete}
            /> */}
            {isConfirm && (
                <RSModal
                    size={'md'}
                    show={isConfirm}
                    handleClose={handleClose}
                    header={
                        <>
                            {/* <i
                                className={`${alert_medium} icon-md color-primary-orange mr5 ml-3 cursor-default`}
                            ></i> */}
                            {type === 'root' ? DELETE_AUDIENCE_SEGMENTS : RESET_CANVAS_FLOW}
                        </>
                    }
                    body={
                        <Row>
                            <Col sm="12">
                                <span>
                                    {type === 'root'
                                        ? AUDIENCE_LIST_WILL_BE_REMOVED
                                        : CANVAS_WILL_BE_RESET}
                                   {" "} {DO_YOU_WISH_TO_CONTINUE}
                                </span>
                            </Col>
                            <Col sm="12" className="mt20">
                                <RSCheckbox
                                    name={`agree`}
                                    labelName={I_AGREE_MDC}
                                    control={control}
                                    required
                                    rules={{
                                        required: ENTAER_VALID,
                                    }}
                                    handleChange={(event) => {
                                                                            }}
                                />
                            </Col>
                        </Row>
                    }
                    footer={
                        <>
                            <RSSecondaryButton onClick={handleClose} disabled={deleteChannelLoader.isFetching}>
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                onClick={handleSubmit((data) => handleFormSubmit(data))}
                                className={!isValid ? 'click-off' : ''}
                                isLoading={deleteChannelLoader.isLoading}
                                disabled={!isValid}
                            >
                                {OK}
                            </RSPrimaryButton>
                        </>
                    }
                ></RSModal>
            )}
        </>
    );
};
export default DeleteChannel;

DeleteChannel.propTypes = {
    nodeId: Proptypes.string.isRequired,
    mdcCanvas: Proptypes.object.isRequired,
    basePayload: Proptypes.object.isRequired,
    dispatch: Proptypes.func.isRequired,
    channelDeleteUpdate: Proptypes.func.isRequired,
    type: Proptypes.string,
};
