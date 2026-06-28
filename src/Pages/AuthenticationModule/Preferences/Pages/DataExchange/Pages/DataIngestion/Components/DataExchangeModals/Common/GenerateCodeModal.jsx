import { Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RSPrimaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';

const GenerateCodeModal = () => {
    const { control } = useForm();
    const { generateCodeFlag } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const dispatch = useDispatch();
    const generateCode = `<a title="Real Time Web Analytics" href="https://clicky.com/100642641"><img alt="Real Time Web Analytics" src="//static.gxfdsfdsetclicky.com/media/links/badge.gif" border="0"></a>
<script src="//static.getclicky.com/js"></script>
<script>
    try {
        clicky.init(100642641);
    }
    catch (e) {}
</script>
<noscript><img alt="Clicky" width="1" height="1" src="//in.getclicky.com/100642641ns.gif"></noscript>`;

    const handleClose = () => {
        dispatch(updateIntegartedSytem({ field: 'generateCodeFlag', data: false }));
    };
    return (
        <>
            <RSModal
                show={generateCodeFlag}
                header={'Generated code'}
                isBorder={true}
                size="md"
                handleClose={handleClose}
                body={
                    <Row>
                        <Col sm={12}>
                            <RSTextarea rows={5} name="code" control={control} defaultValue={generateCode} id="rs_GenerateCodeModal_code" />
                        </Col>
                    </Row>
                }
                footer={
                    <Fragment>
                        <RSPrimaryButton onClick={handleClose} id="rs_GenerateCodeModal_copy">{'Copy'}</RSPrimaryButton>
                    </Fragment>
                }
            />
        </>
    );
};

export default GenerateCodeModal;
