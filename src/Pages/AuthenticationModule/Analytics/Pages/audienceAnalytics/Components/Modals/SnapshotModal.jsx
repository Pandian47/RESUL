import { ENTER_SNAPSHOT_NAME } from 'Constants/GlobalConstant/Placeholders';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton } from 'Components/Buttons';
const SnapshotModal = ({ show, handleClose }) => {
    const { control } = useForm();

    return (
        <Fragment>
            <RSModal
                show={show === 'Take a snapshot'}
                handleClose={handleClose}
                header="Snapshot"
                size="md"
                body={
                    <Row>
                        {/* <Col sm="4"><label>Snapshot name</label></Col>
                        <Col sm="8"> <RSInput name={"snapshot"} control={control} /></Col> */}
                        <Col>
                            <div className="form-group mt30">
                                <RSInput
                                    name={'snapshot'}
                                    defaultValue={'2nd week of the communication'}
                                    control={control}
                                    placeholder={ENTER_SNAPSHOT_NAME}
                                    className="ellispis"
                                />
                            </div>
                        </Col>
                    </Row>
                }
                footer={<RSPrimaryButton onClick={handleClose}>Save</RSPrimaryButton>}
            />
        </Fragment>
    );
};

export default SnapshotModal;
