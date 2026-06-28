import { MAXIMUM5_ATRIBUTES_ALLOWED, OK, SELECT_LEFT_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Container, Row, Col } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ResKendoListbox from 'Pages/KendoDocs/CommonComponents/ResKendoListbox';
const AttributeModal = ({ show, onCancel, attributeList, updateAttributeList, isWebHook = false }) => {
    const [isShow, setShow] = useState(show);
    const [allAttributes, setAllAttributes] = useState(attributeList);
    const [btnStatus, setBtnStatus] = useState(false);
    const [selectedLength, setSelectedLength] = useState(0);
    const {
        control,
        register,
        formState: { errors },
    } = useFormContext();
    useEffect(() => {
        setShow(show);
    }, [show]);
    useEffect(() => {
        if (allAttributes?.selectedAttributeList?.length) setAllAttributes(attributeList);
    }, [attributeList]);

    useEffect(() => {
        if (!allAttributes?.selectedAttributeList?.length || allAttributes?.selectedAttributeList?.length > 5) {
            setBtnStatus(false);
        } else {
            setBtnStatus(true);
        }
    }, [allAttributes]);
    const handleCancel = () => {
        setShow(false);
        onCancel();
    };
    const handleAttributes = (data) => {
        setAllAttributes({
            availableAttributeList: data?.leftColumnValues,
            selectedAttributeList: data?.rightColumnValues,
        });
    };
    return (
        <RSModal
            size={'lg'}
            show={isShow}
            handleClose={handleCancel}
            header={'Select personalisation attributes'}
            body={
                <Container>
                    <Row>
                        {/* <div class="validation-message">Enter description</div> */}
                        <Col sm={12}>
                            <ResKendoListbox
                                leftColumnValues={allAttributes?.availableAttributeList}
                                rightColumnValues={allAttributes?.selectedAttributeList}
                                textField={'uiPrintableName'}
                                setSelectedLength={setSelectedLength}
                                getSelectedData={(data) => {
                                    handleAttributes(data);
                                }}
                                customText={SELECT_LEFT_ATTRIBUTES}
                                // {...register('attributes', {
                                //     validate: () => allAttributes?.selectedAttributeList?.length > 0,
                                // })}
                            />
                        </Col>
                    </Row>
                    {isWebHook && <small className='mt5'>{MAXIMUM5_ATRIBUTES_ALLOWED}</small>}
                </Container>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={handleCancel}>Cancel</RSSecondaryButton>

                    <RSPrimaryButton
                        className={`${!btnStatus ? 'click-off' : ''}`}
                        onClick={() => {
                            updateAttributeList(allAttributes);
                        }}
                    >
                        {OK}
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default AttributeModal;
