import { CANCEL, CANVAS_WILL_BE_RESET_SEGMENT, DO_YOU_WISH_TO_CONTINUE, I_AGREE_MDC, OK, PLEASE_ENTER_VALID, RESET_CANVAS_FLOW } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import Proptypes from 'prop-types';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSCheckbox from 'Components/FormFields/RSCheckbox';


import { ChannelRemove } from '../ChannelItem/ChannelConst';
import { getSubSegmentModule } from '../../constant';
import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector } from 'react-redux';
import { deletMdcChannels } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
const DeleteSubSegment = ({
    nodeId,
    canvasState,
    dispatch,
    basePayload,
    type,
    isRemove,
    resetDelete,
    segmentLevel,
    subSegementUpdateCanvasState,
}) => {
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const locationState = useQueryParams('/communication');

    const [isConfirm, setConfirm] = useState(false);
    const [deleteApiError, setDeleteApiError] = useState('');
    const deleteSubSegmentLoader = useApiLoader({ autoFetch: false });
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
        watch,
    } = useForm();

    const agreeWatch = watch('agree');

    const handleConfirmDelete = () => {
        setConfirm(true);
    };
    const handleClose = () => {
        if (deleteSubSegmentLoader.isFetching) return;
        setConfirm(false);
        resetDelete(false);
        reset();
    };
    useEffect(() => {
        handleConfirmDelete();
    }, [isRemove]);

    const handleCloseAfterDelete = (canvaseState, closeStatus) => {
        setConfirm(closeStatus ?? false);
        reset();
        subSegementUpdateCanvasState(canvaseState);
    };

    const handleSubSegmentDeleteApi = (canvaseState) => {
        const subSegmentList = canvaseState.subSegment.subSegmentList;
        const currentSubSegmentList = subSegmentList.find((subSegment) => subSegment.id === nodeId);
        if (currentSubSegmentList.data.subSegmentId) {
            return {
                status: true,
                subSegmentId: currentSubSegmentList.data.subSegmentId ?? 0,
            };
        } else {
            return {
                status: false,
            };
        }
    };

    const handleFormSubmit = async (data) => {
        if (!data.agree || deleteSubSegmentLoader.isFetching) return;

        const matchActiveChannelList = getSubSegmentModule(
            canvasState['Campaign']['CanvasChannel']['activeChannel'],
            segmentLevel,
        );

        let updateAfterDeleteChannelCanvasState;

        let deleteChannelList = [];

        if (matchActiveChannelList?.length) {
            matchActiveChannelList.map((activeChannel) => {
                if (activeChannel.subSegmentLevel === segmentLevel) {
                    const { MDCTemplate, channelDeleteList } = ChannelRemove({
                        mdcCanvas: updateAfterDeleteChannelCanvasState ?? canvasState,
                        nodeId: activeChannel?.DomId,
                    });
                    updateAfterDeleteChannelCanvasState = MDCTemplate;
                    deleteChannelList.push(...channelDeleteList);
                }
            });
        }

        updateAfterDeleteChannelCanvasState = updateAfterDeleteChannelCanvasState ?? canvasState;

        if (updateAfterDeleteChannelCanvasState) {
            const subSegmentList = updateAfterDeleteChannelCanvasState.subSegment.subSegmentList;
            let finalSubSegmentList = subSegmentList?.filter((segment) => segment.id !== nodeId);
            updateAfterDeleteChannelCanvasState = {
                ...updateAfterDeleteChannelCanvasState,
                subSegment: {
                    ...updateAfterDeleteChannelCanvasState.subSegment,
                    subSegmentList: finalSubSegmentList,
                },
            };

            const placeholder = updateAfterDeleteChannelCanvasState?.Campaign?.CanvasChannel?.Placeholder ?? [];
            if (placeholder?.length) {
                const updatePlaceholder = placeholder?.filter(
                    (place) => place?.data.subSegmentLevel !== segmentLevel,
                );
                updateAfterDeleteChannelCanvasState = {
                    ...updateAfterDeleteChannelCanvasState,
                    Campaign: {
                        ...updateAfterDeleteChannelCanvasState.Campaign,
                        CanvasChannel: {
                            ...updateAfterDeleteChannelCanvasState.Campaign.CanvasChannel,
                            Placeholder: updatePlaceholder,
                        },
                    },
                };
            }

            if (updateAfterDeleteChannelCanvasState?.subSegment?.subSegmentList?.length === 1) {
                updateAfterDeleteChannelCanvasState = {
                    ...updateAfterDeleteChannelCanvasState,
                    subSegment: {
                        ...updateAfterDeleteChannelCanvasState.subSegment,
                        IsSubSegmentSwitched: false,
                        switchCond: {
                            DomId: '',
                            SelectionMode: '',
                            Position: {
                                left: '',
                                top: '',
                            },
                        },
                    },
                };
            }
        }
        const subSegmentStatus = await handleSubSegmentDeleteApi(canvasState);
        if (subSegmentStatus?.status) {
            const payload = {
                userId,
                clientId,
                departmentId,
                channels: deleteChannelList,
                subsegmentId: subSegmentStatus?.subSegmentId ? [subSegmentStatus?.subSegmentId] : [],
                campaignId: locationState?.campaignId ?? 0,
            };
            const response = await deleteSubSegmentLoader.refetch({
                fetcher: () => dispatch(deletMdcChannels({ payload })),
            });
            if (response?.status) {
                handleCloseAfterDelete(updateAfterDeleteChannelCanvasState);
            } else {
                setDeleteApiError(response?.message || 'Something went wrong...');
                handleCloseAfterDelete(canvasState, true);
            }
        } else {
            handleCloseAfterDelete(updateAfterDeleteChannelCanvasState);
        }
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
                    header={RESET_CANVAS_FLOW}
                    body={
                        <Row>
                            <Col sm="12">
                                <span>
                                    {CANVAS_WILL_BE_RESET_SEGMENT} {" "}
                                     {DO_YOU_WISH_TO_CONTINUE}.
                                </span>
                            </Col>
                            <Col sm="12" className="mt20">
                                <RSCheckbox
                                    name={`agree`}
                                    labelName={I_AGREE_MDC}
                                    control={control}
                                    required
                                    rules={{
                                        required: PLEASE_ENTER_VALID,
                                    }}
                                />
                            </Col>

                            {deleteApiError && (
                                <Col className="mt10">
                                    <span className="color-primary-red">{deleteApiError}</span>
                                </Col>
                            )}
                        </Row>
                    }
                    footer={
                        <>
                            <RSSecondaryButton onClick={handleClose} disabled={deleteSubSegmentLoader.isFetching}>
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                onClick={handleSubmit((data) => handleFormSubmit(data))}
                                className={!agreeWatch ? 'click-off' : ''}
                                isLoading={deleteSubSegmentLoader.isLoading}
                                disabled={!agreeWatch}
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
export default DeleteSubSegment;

DeleteSubSegment.defaultProps = {
    type: 'subSegment',
};
DeleteSubSegment.propTypes = {
    nodeId: Proptypes.string.isRequired,
    // mdcCanvas: Proptypes.object.isRequired,
    basePayload: Proptypes.object.isRequired,
    dispatch: Proptypes.func.isRequired,
    // channelDeleteUpdate: Proptypes.isRequired,
    type: Proptypes.string,
};
