import { VALID_MOBILE_NUMBER } from 'Constants/GlobalConstant/Regex';
import { DOMAIN_URL as DOMAIN_URL_MSG, ENTER_ADAPTIVE, ENTER_VALID_MOBILE_NUMBER } from 'Constants/GlobalConstant/ValidationMessage';
import { ALL, ANDROID, DOMAIN_URL, IOS, MOBILE_ADAPTIVE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_edge_large, circle_plus_fill_edge_large, user_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
//packages
import { Container, Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';

//custom comps
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
//components
import UTMParameters from '../UTMParameter/UTMParameters';
import { disableUTMParameters } from '../constant';

const WebSection = (props) => {
    const { fieldName, index, inputType, currentLink, currentName, isDomainValid } = props;

    const { control, setValue, watch } = useFormContext();

    const watchLink = useWatch({
        control,
        name: fieldName,
    });
    const [isMobileAdaptive, setMobileAdaptive] = useState(false);
    const [showUTM, setShowUTM] = useState(false);
    const [selectData, setSelectedData] = useState([
        '[[EmailID]]',
        '[[MobileNo]]',
        '[[Age]]',
        '[[Age group]]',
        '[[Gender]]',
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {}, []);

    const handleWebAllPlatformChange = (currentName, index) => {
        const isChecked = watchLink[index].all;
        if (watchLink?.length > 1 && isChecked) {
            setConfirm({
                show: true,
                type: 'all',
            });
            return;
        } else if (watchLink?.length > 1 && !isChecked) {
            updateParams();
        }
        setValue(`${currentName}.all`, !isChecked);
        setValue(`${currentName}.isAndroid`, !isChecked);
        setValue(`${currentName}.isIOS`, !isChecked);
    };

    const handleUTMParamsChange = (currentName, idx, type, platform) => {
        const allParams = watchLink[idx].all;
        const checked = watchLink[idx][type];
        const otherPlatform = watchLink[idx][platform];
        if (watchLink?.length > 1 && checked) {
            setConfirm({
                type,
                show: true,
            });
            return;
        } else if (watchLink?.length > 1 && !checked) {
            updateParams();
        }
        if (allParams && checked) {
            setValue(`${currentName}.all`, false);
            setValue(`${currentName}.${type}`, false);
        }
        if (!checked && otherPlatform) {
            setValue(`${currentName}.all`, true);
            setValue(`${currentName}.${type}`, true);
        } else {
            setValue(`${currentName}.${type}`, !checked);
        }
    };

    const personalizeUrl = (url, currentName, e) => {
        const [domainUrl, params] = url.split('?');
        if (domainUrl.includes('[')) {
            setError(`${currentName}.domain`, {
                type: 'custom',
                message: 'Multiple personalizations not allowed',
            });
        } else {
            const appendValue = `${domainUrl}${e}${params ? '?' + params : ''}`;
            setValue(`${currentName}.domain`, appendValue);
        }
    };

    const handleUTM = () => {};

    return (
        <div>
            {inputType === 'WEB' && (
                <Container>
                    <div className="form-group mt20 mb0">
                        <Row>
                            <Col sm={11}>
                                <RSInput
                                    control={control}
                                    name={`${fieldName}[${index}].domain`}
                                    placeholder={DOMAIN_URL}
                                    rules={{ required: DOMAIN_URL_MSG }}
                                />
                            </Col>
                            <Col sm={1}>
                                <div className="fg-icons">
                                    <RSTooltip text="Adaptive URL" position="top">
                                        <i
                                             id='rs_data_circle_plus_fill_edge'
                                            className={`${
                                                circle_plus_fill_edge_large
                                            } icon-lg color-primary-blue position-relative top5 ${
                                                isMobileAdaptive || isDomainValid ? 'click-off' : ''
                                            } `}
                                            onClick={() => setMobileAdaptive(!isMobileAdaptive)}
                                        />
                                    </RSTooltip>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={6}>
                                <RSBootstrapdown
                                    defaultItem={
                                        <RSTooltip text="URL personalization">
                                            <i
                                                className={`${user_question_mark_medium} icon-md color-primary-blue cp mr10`}
                                            />
                                        </RSTooltip>
                                    }
                                    className="no_caret"
                                    showUpdate={false}
                                    onSelect={(e, value) => {
                                        personalizeUrl(currentLink.domain, currentName, e);
                                    }}
                                    data={selectData}
                                />
                            </Col>
                            <Col sm={5} className="text-right">
                                <div className={`mr-15 ${isDomainValid ? 'click-off' : ''}`}>
                                    <RSCheckbox
                                        checked={showUTM}
                                        control={control}
                                        name={`${currentName}.utmParameters`}
                                        labelName={'UTM Parameter'}
                                        handleChange={(e) => {
                                            setShowUTM(!showUTM);
                                            // if (showUTM === true) {
                                            //     setShowUTM(false);
                                            // }
                                            // if (showUTM === false) {
                                            //     setShowUTM(true);
                                            // }
                                            // setValue(`${currentName}.adaptiveUrl`, '')
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                    {isMobileAdaptive && (
                        <div className="form-group mt20">
                            <Row>
                                <Col md={11}>
                                    <RSInput
                                        control={control}
                                        name={`${currentName}.adaptiveUrl`}
                                        placeholder={MOBILE_ADAPTIVE}
                                        rules={{
                                            required: ENTER_ADAPTIVE,
                                            // pattern : {
                                            //     value: VALID_MOBILE_NUMBER,
                                            //     message: ENTER_VALID_MOBILE_NUMBER,
                                            // },
                                        }}
                                        // handleOnBlur={() =>
                                        //     handleMobileAdaptiveBlur(currentLink, currentName)
                                        // }
                                    />
                                </Col>
                                <Col>
                                    <RSTooltip text="Delete" position="top">
                                        <i
                                             id='rs_data_circle_minus_fill_edge'
                                            className={`${circle_minus_fill_edge_large} icon-md color-primary-red position-relative top5`}
                                            onClick={() => {
                                                setMobileAdaptive(!isMobileAdaptive);
                                                setValue(`${currentName}.adaptiveUrl`, '');
                                            }}
                                        />
                                    </RSTooltip>
                                </Col>
                            </Row>
                        </div>
                    )}
                    {showUTM && (
                        <>
                            <div className="form-group">
                                <Row>
                                    <Col sm={6}>
                                        <h3>UTM Parameter</h3>
                                    </Col>
                                    <Col sm={5} className="text-right">
                                        <ul className="rs-list-inline rli-space-10 mr-15">
                                            <li>
                                                <span onClick={() => handleWebAllPlatformChange(currentName, index)}>
                                                    <RSCheckbox
                                                        control={control}
                                                        name={`${currentName}.all`}
                                                        labelName={ALL}
                                                        containerClass="pe-none"
                                                    />
                                                </span>
                                            </li>
                                            <li>
                                                <span
                                                    onClick={(e) =>
                                                        handleUTMParamsChange(currentName, index, 'isAndroid', 'isIOS')
                                                    }
                                                >
                                                    <RSCheckbox
                                                        control={control}
                                                        name={`${currentName}.isAndroid`}
                                                        labelName={ANDROID}
                                                        containerClass="pe-none"
                                                    />
                                                </span>
                                            </li>
                                            <li>
                                                <span
                                                    onClick={(e) =>
                                                        handleUTMParamsChange(currentName, index, 'isIOS', 'isAndroid')
                                                    }
                                                >
                                                    <RSCheckbox
                                                        control={control}
                                                        name={`${currentName}.isIOS`}
                                                        labelName={IOS}
                                                        containerClass="pe-none"
                                                    />
                                                </span>
                                            </li>
                                        </ul>
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col>
                                        <UTMParameters
                                            fieldInsertName={`${fieldName}[${index}]`}
                                            fieldArrayName={`${fieldName}[${currentIndex}]`}
                                            className={disableUTMParameters({
                                                currentLink,
                                                webLink: watchLink[0],
                                            })}
                                            modal={false}
                                            fieldName={fieldName}
                                            watchLink={watch(`${fieldName}[${index}]`)}
                                            index={index}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}
                </Container>
            )}
        </div>
    );
};

export default WebSection;
