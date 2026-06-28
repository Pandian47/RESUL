import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import { Fragment, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import RSTextarea from 'Components/FormFields/RSTextarea';

const ResulAnalyticsModal = () => {
    const { control } = useForm();
    const { resulAnalyticsFlag, resulGenerateCodewithInputs, integratedSystem, addCard } = useSelector(
        ({ dataExchangeReducer }) => dataExchangeReducer,
    );
    const dispatch = useDispatch();
    const closeModal = () => {
        dispatch(updateIntegartedSytem({ field: 'resulAnalyticsFlag', data: false }));
    };
    const [generate, setGenerateFlag] = useState(false);

    const generateCode = `<a title="Real Time Web Analytics" href="https://clicky.com/100642641"><img alt="Real Time Web Analytics" src="//static.gxfdsfdsetclicky.com/media/links/badge.gif" border="0"></a>
    <script src="//static.getclicky.com/js"></script>
    <script>
        try {
            clicky.init(100642641);
        }
        catch (e) {}
    </script>
    <noscript><img alt="Clicky" width="1" height="1" src="//in.getclicky.com/100642641ns.gif"></noscript>`;

    const handleSave = () => {
        let _integratedSystem = [...integratedSystem];
        _integratedSystem.push(addCard);
        dispatch(updateIntegartedSytem({ field: 'integratedSystem', data: _integratedSystem }));
        dispatch(updateIntegartedSytem({ field: 'resulAnalyticsFlag', data: false }));
    };
    return (
        <>
            <RSModal
                show={resulAnalyticsFlag}
                header={resulGenerateCodewithInputs[0]?.head}
                isBorder={true}
                size="md"
                handleClose={closeModal}
                body={
                    <>
                        <Row className="mt20">
                            {resulGenerateCodewithInputs?.map(({ name, placeHolder, value, type, lable }) => {
                                return (
                                    <>
                                        {/* <Col sm={4}>
                                            <label className="control-label-left">{lable}</label>
                                        </Col> */}
                                        <Col sm={12} className="form-group">
                                            <RSInput
                                                control={control}
                                                name={name}
                                                placeholder={placeHolder}
                                                //className="mt-3"
                                                defaultValue={value}
                                                type={type}
                                            />
                                        </Col>
                                    </>
                                );
                            })}
                        </Row>
                        <Row>
                            <Col sm={12} className="d-flex justify-content-end mb30">
                                <RSPrimaryButton
                                    className={`${generate ? 'click-off' : ''} bg-secondary-blue`}
                                    onClick={() => setGenerateFlag(true)}
                                >
                                    {'Generate'}
                                </RSPrimaryButton>
                            </Col>
                            {generate && (
                                <Col sm={12}>
                                    <RSTextarea rows={5} name="code" control={control} defaultValue={generateCode} />
                                    <small>*Embed the generated code in the corresponding domain page.</small>
                                </Col>
                            )}
                        </Row>
                    </>
                }
                footer={
                    <Fragment>
                        <RSSecondaryButton onClick={closeModal}>{'Cancel'}</RSSecondaryButton>
                        <RSPrimaryButton onClick={handleSave}>{'Save'}</RSPrimaryButton>
                    </Fragment>
                }
            />
        </>
    );
};

export default ResulAnalyticsModal;
