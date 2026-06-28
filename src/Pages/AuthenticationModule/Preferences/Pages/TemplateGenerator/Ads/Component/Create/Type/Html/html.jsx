import { DIGIPOP_IMAGE_URL, DIGIPOP_MARID, DIGIPOP_RESPONSIVE_SIZE as DIGIPOP_RESPONSIVE_SIZE_MSG, DIGIPOP_SECURE } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_RESPONSIVE_SIZE, DIGIPOP_THUMBNAIL_URL } from 'Constants/GlobalConstant/Placeholders';
import RSSwitch from 'Components/FormFields/RSSwitch';
import { Col, Row } from 'react-bootstrap';
import { commonResolution } from '../../../../constant';
import { useFormContext } from 'react-hook-form';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import Import from './Import';
import ImportImage from '../Component/Import';

const HtmlSetting = () => {
    const { control, clearErrors, setError, watch, setValue } = useFormContext();
    const watchImage = watch('digipop.htmlSetting');
    const watchSize = watchImage?.size?.size;
    const fieldName = 'digipop.htmlSetting';
    const getUniqueName = (name = '') => {
        return `${fieldName}.${name}`;
    };

    const watchHtmlSetting = watch('digipop.htmlSetting');

    const handleIsResponsive = (e) => {
        if (!e) {
            setValue('digipop.htmlSetting.responsiveSize', '');
        }
    };

    return (
        <div>
            <div className="form-group">
                <Row>
                    {/* <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Thumbnail URL</label>
                    </Col>
                    <Col md={6} className="Digipopup-switch">
                        <RSInput
                            control={control}
                            name={getUniqueName('thumbnailUrl')}
                            placeholder={DIGIPOP_THUMBNAIL_URL}
                            rules={{
                                required: DIGIPOP_IMAGE_URL,
                                validate: (val) => {
                                    let urlTypeValue = val?.split('.')?.pop();
                                    let allowedExtensions = ['gif', 'jpg', 'jpeg'];
                                    let isValid = allowedExtensions.includes(urlTypeValue?.toLowerCase());
                                    if (!isValid) {
                                        return 'Enter valid URL';
                                    }
                                    return true;
                                },
                            }}
                            required
                        />
                    </Col> */}
                    <Col sm={{ offset: 1, span: 8 }}>
                        <Col sm={2}>
                            <label className="control-label-left">Thumbnail Url</label>
                        </Col>
                        <ImportImage fieldName={getUniqueName('thumbnailUrl')} size={watchSize} />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 8 }}>
                        <Import fieldName={getUniqueName('htmlContent')} isSplit />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Mraid</label>
                    </Col>
                    <Col md={6} className="Digipopup-switch">
                        <RSSwitch
                            control={control}
                            name={getUniqueName('isMarid')}
                            rules={{
                                required: DIGIPOP_MARID,
                            }}
                        />
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Responsive</label>
                    </Col>
                    <Col md={1}>
                        <RSSwitch
                            control={control}
                            name={getUniqueName('isResponsive')}
                            handleChange={(e) => handleIsResponsive(e)}
                        />
                    </Col>
                    <Col md={5}>
                        {watchHtmlSetting?.isResponsive && (
                            <RSMultiSelect
                                name={getUniqueName('responsiveSize')}
                                data={commonResolution}
                                control={control}
                                placeholder={DIGIPOP_RESPONSIVE_SIZE}
                                textField={'size'}
                                dataItemKey={'id'}
                                rules={{
                                    required: DIGIPOP_RESPONSIVE_SIZE_MSG,
                                }}
                                required
                            />
                        )}
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Secure</label>
                    </Col>
                    <Col md={6} className="Digipopup-switch">
                        <RSSwitch
                            control={control}
                            name={getUniqueName('isSecure')}
                            rules={{
                                required: DIGIPOP_SECURE,
                            }}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default HtmlSetting;
