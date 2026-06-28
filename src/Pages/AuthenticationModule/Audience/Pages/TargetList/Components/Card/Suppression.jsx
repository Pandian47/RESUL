
import RSModal from 'Components/RSModal';
import { useDispatch } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';

export const SuppressionList = ({ show, onHide }) => {
    const dispatch = useDispatch();


    return (
        <RSModal
            show={show}
            size="md"
            header={'Match input list'}
            handleClose={onHide}
            body={
                <div>
                    <Row>
                        <Col sm={6}>
                            <span>Input list</span>
                        </Col>
                        <Col sm={6}>
                            <BootstrapDropdown
                                data={['loan', 'RESUL']}
                                alignRight
                                defaultItem={'loan'}
                            />
                        </Col>
                    </Row>
                </div>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={onHide}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton className={'ml15'}>Save</RSPrimaryButton>
                </>
            }
        />
    );
};
