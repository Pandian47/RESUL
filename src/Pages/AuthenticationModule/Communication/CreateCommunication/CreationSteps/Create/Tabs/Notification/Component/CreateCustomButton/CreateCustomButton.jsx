import { ALPHA_CHARCTERS, WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_BUTTON_NAME, ENTER_PHONE, ENTER_VALID_LINK, SELECT_LINK, SELECT_URL_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { close_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect } from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { get as _get } from 'Utils/modules/lodashReplacements';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { URL_TYPE } from '../../constant';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';

const CreateCustomButton = ({ handleClose, confirm, show = false, currentIndex = 0, isSplit, fieldName, update }) => {
    const {
        control,
        resetField,
        setValue,
        trigger,
        setError,
        clearErrors,
        getFieldState,
        formState,
        watch,
        setFocus,
        unregister,
    } = useFormContext();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams('/communication');
    const dispatch = useDispatch();
    const name = isSplit ? `${fieldName}.buttonText[${currentIndex}]` : `buttonText[${currentIndex}]`;
    const smartLink = useSelector((state) => getGeneratedLink(state));
    const { smartLink1 } = useSelector((state) => getGeneratedLink(state));
    let smartLinks = [];
    if (Object.values(smartLink1)?.length > 0) {
        smartLinks = [...Object.keys(smartLink), 'Enter new link'];
    } else {
        smartLinks = ['Enter new link'];
    }
    const [isNewLink, urlType, links, customText] = watch([
        `${name}.isNewLink`,
        `${name}.urlType`,
        `${name}.link`,
        `${name}.customText`,
    ]);
    // console.log('links: ', links);
    // console.log('SMart ::::::::::: ', smartLinks);

    // useEffect(() => {
    //     setValue(`${name}.link`, '');
    // }, [isNewLink]);

    const handleModalClose = () => {
        const errorIndex = findErrorIndex();
        if (errorIndex !== -1) {
            resetField(name);
            // update(currentIndex, {
            //     type: 'Button',
            //     text: '',
            //     customText: '',
            //     link: '',
            //     fontColor: '',
            //     backgroundColor: '',
            //     isNewLink: false,
            //     show: false,
            // });
        }
        handleClose();
    };

    const findErrorIndex = () => {
        const buttonState = [getFieldState(`${name}.link`, formState), getFieldState(`${name}.customText`, formState)];
        // console.log('Button state ::::: ', buttonState);
        if (!!links && !!customText) {
            return true;
        } else {
            trigger();
            return false;
        }
        // return _findIndex(
        //     buttonState,
        //     ({ invalid, isDirty, isTouched, error }) => !(!invalid && isDirty && isTouched && !error),
        // );
    };

    return (
        <RSModal
            show={show}
            size={'lg'}
            handleClose={handleModalClose}
            header={'Create custom button'}
            body={
                <Container>
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">Button text</label>
                            </Col>
                            <Col sm={7}>
                                <RSEmojiPickerInput
                                    inputName={`${name}.customText`}
                                    isPersonalize={false}
                                    placeholder={'Button name'}
                                    inputSettings={{
                                        maxLength: 15,
                                    }}
                                    required
                                    rules={{
                                        required: ENTER_BUTTON_NAME,
                                        pattern: {
                                            value: ALPHA_CHARCTERS,
                                            message: 'Enter valid button text',
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group mb0 mt20">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">On click behaviour</label>
                            </Col>
                            <Col sm={7}>
                                {isNewLink && urlType !== 'code' && (
                                    <div className="position-relative">
                                        <RSInput
                                            name={`${name}.link`}
                                            control={control}
                                            required
                                            placeholder={'Url'}
                                            rules={{
                                                required: SELECT_LINK,
                                                pattern: {
                                                    value: WEBSITE_REGEX,
                                                    message: ENTER_VALID_LINK,
                                                },
                                            }}
                                            defaultValue={''}
                                            // handleOnBlur={(e) => {
                                            //     console.log('Input url :: ', e);
                                            //     setValue(`${name}.link`, e.target.value);
                                            // }}
                                        />
                                        <i
                                            className={`${close_large} position-absolute right5 top5 cp zIndex2 color-primary-red`}
                                            onClick={() => {
                                                setValue(`${name}.isNewLink`, false);
                                                unregister(`${name}.link`, {
                                                    keepValue: false,
                                                    keepDefaultValue: false,
                                                });
                                            }}
                                        />
                                    </div>
                                )}
                                {!isNewLink && urlType !== 'code' && (
                                    <RSKendoDropDownList
                                        control={control}
                                        // data={[...smartLinks, 'Enter new link']}
                                        data={smartLinks}
                                        // defaultValue={'SmartLink 1'}
                                        name={`${name}.link`}
                                        label={'Smart link'}
                                        required
                                        rules={{
                                            required: SELECT_LINK,
                                        }}
                                        handleChange={(e) => {
                                            if (e.value === 'Enter new link') {
                                                setValue(`${name}.isNewLink`, true);
                                                setTimeout(() => setFocus(`${name}.newLink`), 100);
                                                unregister(`${name}.link`, {
                                                    keepValue: false,
                                                    keepDefaultValue: false,
                                                });
                                            }
                                        }}
                                    />
                                )}
                                {isNewLink && urlType === 'code' && (
                                    <RSPhoneInput
                                        control={control}
                                        name={`${name}.link`}
                                        placeholder={'Enter a new link'}
                                        required
                                        label={'Enter mobile number'}
                                        setError={setError}
                                        clearErrors={clearErrors}
                                        rules={{
                                            required: ENTER_PHONE,
                                        }}
                                    />
                                )}
                            </Col>
                        </Row>
                    </div>
                    {isNewLink && (
                        <div className="form-group mb0 mt20">
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">Type</label>
                                </Col>
                                <Col sm={7}>
                                    <RSKendoDropDownList
                                        control={control}
                                        required
                                        data={URL_TYPE}
                                        dataItemKey={'id'}
                                        textField={'value'}
                                        // defaultValue={'Weburl'}
                                        name={`${name}.urlType`}
                                        // handleChange={() => setFocus(`${name}.link`)}
                                        rules={{
                                            required: SELECT_URL_TYPE,
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                </Container>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={handleModalClose}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={async () => {
                            const errorIndex = findErrorIndex();

                            if (errorIndex) {
                                if (!links.startsWith('smartLink')) {
                                    confirm();
                                    return;
                                }
                                let payload = {
                                    departmentId,
                                    userId,
                                    clientId,
                                    blastType: fieldName !== '' ? fieldName?.slice(-1) : '',
                                    campaignId: _get(location, 'campaignId', 0),
                                    channelId: 8,
                                    goalNo: Number(links?.slice(-1)),
                                    blastNo: 1,
                                    parentChannelDetailId: 0,
                                    actionId: 1,
                                    subSegmentId:0
                                };
                                const { status, data } = await dispatch(getSmartUrlDetailByChannel({ payload }));

                                if (status) {
                                    let { smartCode, blastSC, urlName } = data;
                                    if (!!smartCode && !!blastSC && !!urlName) {
                                        confirm();
                                        clearErrors(`${name}.urlType`);
                                    } else {
                                        setError(`${name}.urlType`, {
                                            type: 'custom',
                                            message: 'Selected SmartLink is not generated',
                                        });
                                    }
                                }
                            } else {
                                trigger(name);
                            }
                        }}
                    >
                        Save
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default CreateCustomButton;
