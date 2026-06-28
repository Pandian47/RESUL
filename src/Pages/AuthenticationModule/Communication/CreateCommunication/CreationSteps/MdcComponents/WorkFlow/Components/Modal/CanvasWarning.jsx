import { OK, POTENTIAL_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { useContext, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RSPrimaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import AudienceChannelWiseList from '../PotentialAudience/AudienceChannelWiseList/AudienceChannelWiseList';
import CreateWorkFlowContext from '../../context';
const CanvasWarning = ({ warnText, show, handleClose, isPotentialAudeinceCount = {} }) => {
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { isShowCountStatus, details = {} } = isPotentialAudeinceCount;
    const { subsegmentDetails = {} } = details;
    const [isShow, setShow] = useState(false);

    const [statusText, setStatusText] = useState('');

    const subsegmentList = canvasState?.subSegment?.subSegmentList;
    const currentSegmentList = subsegmentList?.find(
        (segment) => segment.data.subSegmentLevel === subsegmentDetails?.subSegmentLevel,
    );
    const currentSegmentListChannelCount = currentSegmentList?.channelWiseCount;
    const finalSegmentAudienceList = currentSegmentListChannelCount ? [currentSegmentListChannelCount] : [];

    useEffect(() => {
        setShow(show);
    }, [show]);

    return (
        <>
            {isShow && (
                <RSModal
                    size={'md'}
                    show={isShow}
                    handleClose={handleClose}
                    header={POTENTIAL_AUDIENCE}
                    body={
                        <>
                            <Row>
                                <Col sm={12}>
                                    <span>{warnText}</span>
                                </Col>
                                <Col sm={12} className="mt30">
                                    {isShowCountStatus && (
                                        <AudienceChannelWiseList
                                            isSubSegment={subsegmentDetails?.status}
                                            segmentChannelWiseCount={finalSegmentAudienceList}
                                        />
                                    )}
                                </Col>
                            </Row>
                        </>
                    }
                    footer={
                        <>
                            <RSPrimaryButton onClick={handleClose}>{OK}</RSPrimaryButton>
                        </>
                    }
                ></RSModal>
            )}
        </>
    );
};

export default CanvasWarning;
