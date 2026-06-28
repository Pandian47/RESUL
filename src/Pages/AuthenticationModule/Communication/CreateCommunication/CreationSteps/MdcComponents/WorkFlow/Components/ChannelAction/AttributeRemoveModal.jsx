import { CANCEL, OK } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
const AttributeRemoveModal = ({ isShow, handleClose, handleOk }) => {
    return (
        <>
            {isShow && (
                <RSModal
                    size={'md'}
                    show={isShow}
                    handleClose={handleClose}
                    header={'Edit action'}
                    body={
                        <Row>
                            <Col sm="12">
                                <span>Are you sure, want to remove attribute?</span>
                            </Col>
                        </Row>
                    }
                    footer={
                        <>
                            <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                            <RSPrimaryButton onClick={handleOk}>{OK}</RSPrimaryButton>
                        </>
                    }
                ></RSModal>
            )}
        </>
    );
};

export default AttributeRemoveModal;
