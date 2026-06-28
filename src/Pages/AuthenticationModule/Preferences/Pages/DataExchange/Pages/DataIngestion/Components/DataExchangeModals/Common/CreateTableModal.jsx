import { Fragment } from 'react';
import { Row } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';

const CreateTableMdal = ({ show, setShow }) => {
    const handleClose = () => {
        setShow(false);
    };
    return (
        <>
            <RSModal
                show={show}
                isBorder={true}
                size="md"
                handleClose={handleClose}
                body={
                    <>
                        <Row style={{ height: '75px' }}>
                            The RESUL derived attributes are not mapped with any columns in this table. Are you want to
                            create the attribute in this table?
                        </Row>
                    </>
                }
                footer={
                    <Fragment>
                        <RSSecondaryButton onClick={handleClose} id="rs_CreateTableMdal_cancel">{'cancel'}</RSSecondaryButton>
                        <RSPrimaryButton onClick={handleClose} id="rs_CreateTableMdal_continue">{'Continue'}</RSPrimaryButton>
                    </Fragment>
                }
            />
        </>
    );
};

export default CreateTableMdal;
