import { SELECT_APP_SCREEN, SELECT_MOBILE_APP, SELECT_SUB_APP_SCREEN, SELECT_YOUR_DEVICE } from 'Constants/GlobalConstant/ValidationMessage';
import { ALL, ANDROID, APP_SCREEN as APP_SCREEN_PH, DEVICE_TYPE, IOS, MOBILE_APP, SUB_APP_SCREEN, URI_PARAMETER } from 'Constants/GlobalConstant/Placeholders';
import { Fragment } from 'react';
///packages
import { Container, Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
//constants
import { APP_SCREEN, disableUTMParameters } from '../constant';
//custom comps
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
//components
import UTMParameters from '../UTMParameter/UTMParameters';

const MobileSection = ({
    fieldName,
    index,
    inputType,
    currentLink,
    currentName,
    platforms,
    handleMobilePlaformChange,
    disableDiv,
}) => {
    const { control, setValue, watch } = useFormContext();

    const watchLink = useWatch({
        control,
        name: fieldName,
    });

    const checkParamsforPlatform = ({ type, index }) => {
        var tempTabs = [...watchLink];
        // tempTabs.shift();
        const { isAndroid, isIOS } = tempTabs[1];
        const { parameters } = tempTabs[index];
        const name = type === 'android' ? 'isAndroid' : 'isIOS';
        const params = !isIOS || !isAndroid ? parameters : [];
        // tempTabs.forEach(({ mobilePlatform }, tabsIndex) => {
        //     if (mobilePlatform.startsWith('IP') && type === 'ios') {
        //         setValue(`${fieldName}[${tabsIndex + 1}].parameters`, params);
        //         setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
        //     } else {
        //         setValue(`${fieldName}[${tabsIndex + 1}].parameters`, params);
        //         setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
        //     }
        // });
        // setValue(`${fieldName}[1].${name}`, true);
        tempTabs = tempTabs.map((platform, index) => {
            if (index !== 0) {
                const { mobilePlatform } = platform;
                if (mobilePlatform.startsWith('IP') && type === 'ios') {
                    platform.parameters = params;
                    platform.isURIParameter = true;
                    // setValue(`${fieldName}[${tabsIndex + 1}].parameters`, params);
                    // setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
                } else {
                    platform.parameters = params;
                    platform.isURIParameter = true;
                    // setValue(`${fieldName}[${tabsIndex + 1}].parameters`, params);
                    // setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
                }
            }
            return platform;
        });
        tempTabs[1][name] = true;
        setValue(fieldName, tempTabs);

        // if (!isAndroid) {
        //     // setValue(`${fieldName}[${idx}].parameters`, parameters);
        //     // setValue(`${fieldName}[${idx}].isURIParameter`, true);
        //     control._formValues.smartLink1.map((el, index) => {
        //         if (el.isAndroid) {
        //             let tempParams;
        //             tempParams = [...new Set(parameters.concat(el.parameters))];
        //             // setValue(`${fieldName}[${index}].parameters`, tempParams);
        //             console.log(tempParams, 'tempParams');
        //         }
        //     });
        // }
        // if (name === 'isIOS' && isIOS) {
        //     setValue(`${fieldName}[${idx}].parameters`, parameters);
        //     setValue(`${fieldName}[${idx}].isURIParameter`, true);
        // }
        // const findParamsIndex = _findIndex(
        //     tempTabs,
        //     (tabs) => tabs.isURIParameter && mobilePlatform.toLowerCase().includes(type),
        // );
        // if (type === 'android') {
        //     const params = !isAndroid ? parameters : [];
        //     tempTabs.forEach(({ mobilePlatform }, tabsIndex) => {
        //         if (mobilePlatform.startsWith('Android')) {
        //             setValue(`${fieldName}[${tabsIndex + 1}].parameters`, params);
        //             setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
        //         }
        //         setValue(`${fieldName}[${tabsIndex + 1}].isAndroid`, !isAndroid);
        //     });
        // }
        // if (type === 'ios') {
        //     const params = !isIOS ? parameters : [];
        //     tempTabs.forEach(({ mobilePlatform }, tabsIndex) => {
        //         if (mobilePlatform.startsWith('IP')) {
        //             setValue(`${fieldName}[${tabsIndex + 1}].parameters`, params);
        //             setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
        //         }
        //         setValue(`${fieldName}[${tabsIndex + 1}].isIOS`, !isIOS);
        //     });
        // }
    };

    return (
        <div>
            {inputType === 'Mobile' && (
                <Container>
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={4} className="pl20">
                                <label className="control-label-left">Mobile platform</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={`${currentName}.mobilePlatform`}
                                    data={platforms}
                                    label={DEVICE_TYPE}
                                    rules={{
                                        required: SELECT_YOUR_DEVICE,
                                    }}
                                    handleChange={(e) => handleMobilePlaformChange(e, index, 'android')}
                                />
                            </Col>
                        </Row>
                    </div>
                    {!!currentLink?.mobilePlatform && (
                        <div className="form-group mt20 mb0">
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">Mobile app</label>
                                </Col>
                                <Col sm={7}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${currentName}.mobileApp`}
                                        label={MOBILE_APP}
                                        // data={MOBILE_APPS}
                                        textField={'appName'}
                                        dataItemKey={'appguid'}
                                        data={mobileApps}
                                        rules={{
                                            required: SELECT_MOBILE_APP,
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                    {!!currentLink?.mobileApp && (
                        <Fragment>
                            <Row>
                                <Col sm={4}></Col>
                                <Col sm={7} className="text-right">
                                    <div className="mr-15">
                                        <RSCheckbox
                                            control={control}
                                            name={`${currentName}.isURIParameter`}
                                            labelName={URI_PARAMETER}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4}>
                                        <label className="control-label-left">Deferred deep linking</label>
                                    </Col>
                                    <Col sm={7}>
                                        <RSSwitch control={control} name={`${currentName}.deferredDeepLink`} />
                                    </Col>
                                </Row>
                            </div>
                            {!!currentLink.deferredDeepLink && (
                                <Row>
                                    <Col sm={4}></Col>
                                    <Col sm={4}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={`${currentName}.appScreen`}
                                            label={APP_SCREEN_PH}
                                            data={APP_SCREEN}
                                            rules={{
                                                required: SELECT_APP_SCREEN,
                                            }}
                                        />
                                    </Col>
                                    <Col sm={3}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={`${currentName}.subappScreen`}
                                            label={SUB_APP_SCREEN}
                                            data={APP_SCREEN}
                                            rules={{
                                                required: SELECT_SUB_APP_SCREEN,
                                            }}
                                        />
                                    </Col>
                                </Row>
                            )}
                            {currentLink.isURIParameter && (
                                <div className="form-group mt30">
                                    <div
                                        className={`${disableUTMParameters({
                                            currentLink,
                                            webLink: watchLink[0],
                                        })}`}
                                    >
                                        <Row className="mb20">
                                            <Col sm={6}>
                                                <h3>UTM Parameter</h3>
                                            </Col>
                                            <Col sm={5} className="text-right">
                                                <ul className="rs-list-inline rli-space-10 mr-15">
                                                    <li>
                                                        <RSCheckbox
                                                            control={control}
                                                            labelName={ALL}
                                                            name={`${currentName}.all`}
                                                            disabled
                                                        />
                                                    </li>
                                                    <li>
                                                        <span
                                                            onClick={() =>
                                                                checkParamsforPlatform({
                                                                    type: 'android',
                                                                    index: index,
                                                                })
                                                            }
                                                        >
                                                            <RSCheckbox
                                                                control={control}
                                                                name={`${fieldName}[1].isAndroid`}
                                                                labelName={ANDROID}
                                                                containerClass="pe-none"
                                                                onClick={(e) => {
                                                                    if (e.checked === true) {
                                                                    } else {
                                                                    }
                                                                }}
                                                            />
                                                        </span>
                                                    </li>
                                                    <li>
                                                        <span
                                                            onClick={(e) =>
                                                                checkParamsforPlatform({
                                                                    type: 'ios',
                                                                    index: index,
                                                                })
                                                            }
                                                        >
                                                            <RSCheckbox
                                                                control={control}
                                                                name={`${fieldName}[1].isIOS`}
                                                                labelName={IOS}
                                                                // defaultValue={
                                                                //     !currentMobilePlatform
                                                                //         ? watchLink[0].isIOS
                                                                //         : false
                                                                // }
                                                                // disabled={currentMobilePlatform}
                                                                // disabled={
                                                                //     !!disableUTMParameters({
                                                                //         currentLink,
                                                                //         webLink: watchLink[0],
                                                                //     })?.length
                                                                // }
                                                            />
                                                        </span>
                                                    </li>
                                                </ul>
                                            </Col>
                                        </Row>
                                    </div>
                                    <UTMParameters
                                        key={'mobileparameters' + index}
                                        //    fieldArrayName={`${fieldName}[${currentIndex}]`}
                                        fieldInsertName={`${fieldName}[${index}]`}
                                        modal={false}
                                        watchLink={watch(`${fieldName}[${index}]`)}
                                        index={index}
                                        fieldName={'smartLink1'}
                                    />
                                </div>
                            )}
                        </Fragment>
                    )}
                </Container>
            )}
        </div>
    );
};

export default MobileSection;
