import { CANCEL, SAVE, TEMPLATE_CATEGORY, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { lock_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import { CATAGORY } from '../../constant';
import { SELECT_TEMPLATE_CATEGORY } from 'Constants/GlobalConstant/ValidationMessage';

const CatagoryModal = ({ show, handleClose }) => {
    const { handleSubmit, trigger, control, getValues } = useFormContext();

    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        setIsShow(show);
    }, [show]);

    const handleSave = (data) => {
        if (data.templateCatagory !== '') {
            handleClose(false);
        } else {
            trigger();
        }
    };

    return (
        <RSModal
            show={isShow}
            size="md"
            header={TEMPLATE_NAME}
            handleClose={handleClose}
            isCloseButton={true}
            body={
                <form className="page-content-holder" onSubmit={handleSubmit(handleSave)}>
                    <div className="form-group mb0">
                        <Row>
                            <Col sm={11}>
                                <RSInput
                                    type={'text'}
                                    name={'templateName'}
                                    placeholder={TEMPLATE_NAME}
                                    control={control}
                                    disabled
                                    defaultValue={getValues('templateName')}
                                    required
                                    // rules={{ required: TEMPLATE_NAME }}
                                />
                            </Col>
                            <Col className="pl0 text-right">
                                <i
                                    className={`${lock_medium} icon-md position-relative top5 color-primary-grey`}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group mt40 mb20">
                        <RSKendoDropDownList
                            control={control}
                            name={'templateCatagory'}
                            data={CATAGORY}
                            label={TEMPLATE_CATEGORY}
                            required
                            defaultValue={CATAGORY[0]}
                            rules={{ required: SELECT_TEMPLATE_CATEGORY }}
                            placeholder={TEMPLATE_CATEGORY}
                        />
                    </div>                   
                </form>
            }
            footer={
                <>
                 <RSSecondaryButton>{CANCEL}</RSSecondaryButton>
                <RSPrimaryButton type="submit">{SAVE}</RSPrimaryButton>
                </>
            }
   
        />
    );
};

export default CatagoryModal;
