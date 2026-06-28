import { WEBURL_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_IMAGE_URL } from 'Constants/GlobalConstant/ValidationMessage';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { RSPrimaryButton } from 'Components/Buttons';

const AddImageModal = ({ show, handleClose, name }) => {
    const { control, setValue, getValues, watch } = useFormContext();
    const [addedImages] = watch([`addedImages`]);
    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={'Select Image'}
            body={
                <div>
                    <Row className="mb30">
                        <Row className="d-flex justify-content-center">
                            <span>Click here to upload image</span>
                        </Row>
                        <Row className="d-flex justify-content-center">
                            <small>jpg, jpeg, png, webp, gif, svg only</small>
                        </Row>
                    </Row>
                    <Row className="mb30">
                        <Col sm={9}>
                            <RSInput
                                control={control}
                                name={name}
                                rules={{
                                    required: ENTER_IMAGE_URL,
                                    pattern: {
                                        value: WEBURL_REGEX,
                                        message: 'Enter a proper url',
                                    },
                                }}
                            />
                        </Col>
                        <Col sm={3}>
                            <RSPrimaryButton
                                onClick={() => {
                                    let tempImg = getValues(name);
                                    let tempArr = addedImages === undefined ? [] : [...addedImages];
                                    tempArr.push(tempImg);
                                    setValue('addedImages', tempArr);
                                }}
                            >
                                Add Image
                            </RSPrimaryButton>
                        </Col>
                    </Row>
                    <Row className="mb30">
                        {addedImages?.map((item, idx) => {
                            return (
                                <Col sm={2} className="mb30" key={idx + 'bg'}>
                                    <img
                                        src={item}
                                        alt={'image' + idx}
                                        height={'100px'}
                                        width={'100px'}
                                        onClick={() => {
                                            setValue(name, item);
                                            handleClose();
                                        }}
                                    />
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            }
        />
    );
};

export default AddImageModal;
