import { social_facebook_ads_medium, social_facebook_medium, social_linkedin_ads_medium, social_linkedin_medium, social_twitter_ads_medium, social_twitter_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { memo } from 'react';
import RSCheckbox from 'Components/FormFields/RSCheckbox';

const SocialMedia = ({ index, labelName, placeHolder, mandatory, preview }) => {
    const { control, watch } = useFormContext();

    const [facebook, twitter, linkedin, brandId] = watch([
        'facebookCheckBox' + index,
        'twitterCheckBox' + index,
        'linkedinCheckBox' + index,
        'brandCheckBox' + index,
    ]);

    return (
        <div className={`${preview ? 'fbc-preview' : 'form-builder-component'}`}>
            <div className="rs-form-element-wrapper">
                {!preview ? (
                    <>
                        <ul className="rs-list-inline rli-space-20">
                            <li>
                                <div className="fbc-social-item">
                                    <div className="fbcsi-checkbox">
                                        <RSCheckbox
                                            className="smaller"
                                            name={`formGenerator[${index}].facebookCheckBox`}
                                            control={control}
                                        />
                                    </div>
                                    <div className="fbcsi-content bg-facebook">
                                        <i className={`${social_facebook_medium} icon-md`}></i>
                                        <span>Connected with Facebook</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="fbc-social-item">
                                    <div className="fbcsi-checkbox">
                                        <RSCheckbox
                                            className="smaller"
                                            name={`formGenerator[${index}].twitterCheckBox`}
                                            control={control}
                                        />
                                    </div>
                                    <div className="fbcsi-content bg-twitter">
                                        <i className={`${social_twitter_medium} icon-md`}></i>
                                        <span>Connected with Twitter</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="fbc-social-item">
                                    <div className="fbcsi-checkbox">
                                        <RSCheckbox
                                            className="smaller"
                                            name={`formGenerator[${index}].linkedinCheckBox`}
                                            control={control}
                                        />
                                    </div>
                                    <div className="fbcsi-content bg-linkedin">
                                        <i className={`${social_linkedin_medium} icon-md`}></i>
                                        <span>Connected with Linkedin</span>
                                    </div>
                                </div>
                            </li>
                            {/* <li>
                            <div className="fbc-social-item">
                                <div className="fbcsi-checkbox">
                                    <RSCheckbox
                                        className="smaller"
                                        name={'brandCheckBox' + index}
                                        control={control}
                                        labelName={'Brand Id'}
                                    />
                                </div>
                            </div>
                        </li> */}
                        </ul>
                    </>
                ) : (
                    <Row className="mt10 ml-1 mr-1 text-center">
                        <Col className="mr2 rsbc-social-wrap" style={{ backgroundColor: '#3a5897' }}>
                            <i className={`${social_facebook_ads_medium} icon-md`}>
                                <h5 className="text-white">Connected with facebook</h5>
                            </i>
                        </Col>
                        <Col className="mr2 rsbc-social-wrap" style={{ backgroundColor: '#5dc8ff' }}>
                            <i className={`${social_twitter_ads_medium} icon-md`}>
                                <h5 className="text-white">Connected with twitter</h5>
                            </i>
                        </Col>
                        <Col className=" mr2 rsbc-social-wrap" style={{ backgroundColor: '#2967ad' }}>
                            <i className={`${social_linkedin_ads_medium} icon-md`}>
                                <h5 className="text-white">Connected with linkedin</h5>
                            </i>
                        </Col>
                        <Col className="mr2">
                            <span>BrandId</span>
                        </Col>
                    </Row>
                )}
            </div>
        </div>
    );
};

export default memo(SocialMedia);
