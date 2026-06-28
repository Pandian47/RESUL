import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { DIGIPOP_ACTION as DIGIPOP_ACTION_MSG, DIGIPOP_SIZE, DIGIPOP_TEXT as DIGIPOP_TEXT_MSG, DIGIPOP_TITLE as DIGIPOP_TITLE_MSG, DIGIPOP_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_ACTION, DIGIPOP_DEVICE_TYPE, DIGIPOP_IMAGE_SIZE, DIGIPOP_TEXT, DIGIPOP_TITLE } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { useFormContext } from 'react-hook-form';
import { digipopDeviceType, digipopImageResolution, initialImageSetting } from '../../../../constant';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { MAX_LENGTH15, MAX_LENGTH150 } from 'Constants/GlobalConstant/Regex';


import Import from '../Component/Import';

const ImageSetting = () => {
    const { control, clearErrors, setError, watch, setValue, formState } = useFormContext();

    const watchImage = watch('digipop.imageSetting');
    const watchSize = watchImage?.size;
    const imageSize = watchSize?.size;
    const type = watchImage?.deviceType?.type;

    const getUniqueName = (name = '') => {
        const uniqueName = 'digipop.imageSetting';
        return `${uniqueName}.${name}`;
    };

    const getResolution = () => {
        return digipopImageResolution[type];
    };

    return (
        <div className="form-group">
            <div className="form-group mb0">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Device type</label>
                    </Col>
                    <Col sm={!type ? 6 : 3}>
                        <div className="form-group">
                            <RSKendoDropDownList
                                data={digipopDeviceType}
                                control={control}
                                name={getUniqueName('deviceType')}
                                label={DIGIPOP_DEVICE_TYPE}
                                dataItemKey={'id'}
                                textField={'name'}
                                required
                                rules={{
                                    required: DIGIPOP_TYPE,
                                }}
                                handleChange={() => {
                                    let tempInitalImageSetting = initialImageSetting;
                                    tempInitalImageSetting.deviceType = watchImage.deviceType;
                                    setValue('digipop.imageSetting', { ...tempInitalImageSetting });
                                }}
                            />
                        </div>
                    </Col>
                    {type && (
                        <>
                            <Col sm={3}>
                                <RSKendoDropDownList
                                    data={getResolution()}
                                    control={control}
                                    name={getUniqueName('size')}
                                    label={DIGIPOP_IMAGE_SIZE}
                                    dataItemKey={'id'}
                                    textField={'size'}
                                    required
                                    rules={{
                                        required: DIGIPOP_SIZE,
                                    }}
                                />
                            </Col>
                        </>
                    )}
                </Row>
            </div>
            {watchSize && (
                <Row>
                    <Col sm={{ offset: 1, span: 8 }}>
                        <Import fieldName={'digipop.imageSetting'} size={imageSize} />
                    </Col>
                </Row>
            )}
            {imageSize && (
                <span>
                    {imageSize && (
                        <>
                            <div className={`form-group ${watchSize ? 'mt30' : ''}`}>
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Image title</label>
                                    </Col>
                                    <Col md={6}>
                                        <RSInput
                                            control={control}
                                            required
                                            name={getUniqueName('title')}
                                            placeholder={DIGIPOP_TITLE}
                                            rules={{
                                                required: DIGIPOP_TITLE_MSG,
                                            }}
                                            maxLength={MAX_LENGTH150}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Alt text</label>
                                    </Col>
                                    <Col md={6}>
                                        <RSInput
                                            control={control}
                                            required
                                            name={getUniqueName('text')}
                                            placeholder={DIGIPOP_TEXT}
                                            rules={{
                                                required: DIGIPOP_TEXT_MSG,
                                            }}
                                            maxLength={MAX_LENGTH150}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Call to action</label>
                                    </Col>
                                    <Col md={6}>
                                        <RSInput
                                            control={control}
                                            name={getUniqueName('action')}
                                            placeholder={DIGIPOP_ACTION}
                                            required
                                            rules={{
                                                required: DIGIPOP_ACTION_MSG,
                                            }}
                                            maxLength={MAX_LENGTH15}
                                            onKeyDown={charNumUnderScore}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}
                </span>
            )}
        </div>
    );
};

export default ImageSetting;
