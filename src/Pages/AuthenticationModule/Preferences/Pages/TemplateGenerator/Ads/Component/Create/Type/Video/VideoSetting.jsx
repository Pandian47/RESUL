import { DIGIPOP_DURATION as DIGIPOP_DURATION_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_BANNER, DIGIPOP_COMPANION, DIGIPOP_COMPANION_HEIGHT, DIGIPOP_COMPANION_URL, DIGIPOP_COMPANION_WIDTH, DIGIPOP_COMPLETION_URL, DIGIPOP_DURATION, DIGIPOP_ERROR_URL, DIGIPOP_FIRST_QUARTILE_URL, DIGIPOP_HTML, DIGIPOP_MIDPOINT_URL, DIGIPOP_SKIP_URL, DIGIPOP_START_URL, DIGIPOP_THIRD_QUARTILE_URL } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { useFormContext } from 'react-hook-form';
import { videoSettingDuration } from '../../../../constant';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import Import from '../Component/Import';
import HTMLImport from '../Html/Import';

const VideoSetting = () => {
    const { control, getValues } = useFormContext();

    const getUniqueName = (name = '') => {
        const uniqueName = 'digipop.videoSetting';
        return `${uniqueName}.${name}`;
    };

    return (
        <div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 8 }}>
                        <Import fieldName={'digipop.videoSetting'} type="video" size={'Upload video'} />
                    </Col>
                </Row>
            </div>
            <div className="form-group mt30">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_DURATION}</label>
                    </Col>
                    <Col sm={6}>
                        {/* <RSInput
                            control={control}
                            required
                            name={getUniqueName('duration')}
                            placeholder={DIGIPOP_DURATION}
                            rules={{
                                required: DIGIPOP_DURATION_MSG,
                            }}
                            onKeyDown={onlyNumbers}
                            maxLength={3}
                        /> */}

                        <Row>
                            {videoSettingDuration?.map((duration) => {
                                return (
                                    <Col sm={2}>
                                        <RSRadioButton
                                            name={getUniqueName('duration')}
                                            labelName={duration?.labelName}
                                            id={duration?.labelName}
                                            control={control}
                                        />
                                    </Col>
                                );
                            })}
                        </Row>
                    </Col>
                </Row>
            </div>
            <div className="form-group mt30">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_COMPANION}</label>
                    </Col>
                    <Col sm={6}>
                        {/* <RSInput
                            control={control}
                            required
                            name={getUniqueName('duration')}
                            placeholder={DIGIPOP_DURATION}
                            rules={{
                                required: DIGIPOP_DURATION_MSG,
                            }}
                            onKeyDown={onlyNumbers}
                            maxLength={3}
                        /> */}

                        <Row>
                            <Col sm={2}>
                                <RSRadioButton
                                    name={getUniqueName('companion')}
                                    labelName={DIGIPOP_BANNER}
                                    id={1}
                                    control={control}
                                />
                            </Col>
                            <Col sm={2}>
                                <RSRadioButton
                                    name={getUniqueName('companion')}
                                    labelName={DIGIPOP_HTML}
                                    id={2}
                                    control={control}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
            {getValues(getUniqueName('companion')) && (
                <>
                    {getValues(getUniqueName('companion')) === 'Banner' ? (
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 8 }}>
                                    <Import fieldName={'digipop.videoSetting'} type={'image'} isVideoImage={true}/>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 8 }}>
                                    <HTMLImport fieldName={getUniqueName('htmlContent')} isSplit />
                                </Col>
                            </Row>
                        </div>
                    )}

                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{DIGIPOP_COMPANION_HEIGHT}</label>
                            </Col>
                            <Col md={6}>
                                <RSInput
                                    control={control}
                                    name={getUniqueName('companionHeight')}
                                    placeholder={DIGIPOP_COMPANION_HEIGHT}
                                    // required
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{DIGIPOP_COMPANION_WIDTH}</label>
                            </Col>
                            <Col md={6}>
                                <RSInput
                                    control={control}
                                    name={getUniqueName('companionWidth')}
                                    placeholder={DIGIPOP_COMPANION_WIDTH}
                                    // required
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{DIGIPOP_COMPANION_URL}</label>
                            </Col>
                            <Col md={6}>
                                <RSInput
                                    control={control}
                                    name={getUniqueName('companionUrl')}
                                    placeholder={DIGIPOP_COMPANION_URL}
                                    // required
                                    //  rules={{
                                    //     validate: (value) => {
                                    //         return value && IsValidURL(value);
                                    //     },
                                    // }}
                                />
                            </Col>
                        </Row>
                    </div>
                </>
            )}

            {/* <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_START_URL}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('startUrl')}
                            placeholder={DIGIPOP_START_URL}
                            rules={{
                                validate: (value) => {
                                    return value ? IsValidURL(value) : true;
                                },
                            }}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_FIRST_QUARTILE_URL}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('firstQuartileUrl')}
                            placeholder={DIGIPOP_FIRST_QUARTILE_URL}
                            rules={{
                                validate: (value) => {
                                    return value ? IsValidURL(value) : true;
                                },
                            }}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_MIDPOINT_URL}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('midpointUrl')}
                            placeholder={DIGIPOP_MIDPOINT_URL}
                            rules={{
                                validate: (value) => {
                                    return value ? IsValidURL(value) : true;
                                },
                            }}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group mb0">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_THIRD_QUARTILE_URL}</label>
                    </Col>
                    <Col sm={6}>
                        <div className="form-group">
                            <RSInput
                                control={control}
                                name={getUniqueName('thirdQuartileUrl')}
                                placeholder={DIGIPOP_THIRD_QUARTILE_URL}
                                rules={{
                                    validate: (value) => {
                                        return value ? IsValidURL(value) : true;
                                    },
                                }}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_COMPLETION_URL}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('completionUrl')}
                            placeholder={DIGIPOP_COMPLETION_URL}
                            rules={{
                                validate: (value) => {
                                    return value ? IsValidURL(value) : true;
                                },
                            }}
                        />
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_ERROR_URL}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('errorUrl')}
                            placeholder={DIGIPOP_ERROR_URL}
                            rules={{
                                validate: (value) => {
                                    return value ? IsValidURL(value) : true;
                                },
                            }}
                        />
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{DIGIPOP_SKIP_URL}</label>
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name={getUniqueName('skipUrl')}
                            placeholder={DIGIPOP_SKIP_URL}
                            rules={{
                                validate: (value) => {
                                    return value ? IsValidURL(value) : true;
                                },
                            }}
                        />
                    </Col>
                </Row>
            </div> */}
        </div>
    );
};

export default VideoSetting;
