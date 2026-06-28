import { ALPHA_CHARCTERS, WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_BUTTON_NAME, ENTER_VALID_LINK, SELECT_LINK, SELECT_URL_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { close_large, colorpicker_bg_medium, colorpicker_text_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import _map from 'lodash/map';
import { Row, Col } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSColorPicker from 'Components/ColorPicker';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import NotificationProvider from '../../../../context';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import CreateCustomButton from '../../../CreateCustomButton/CreateCustomButton';

import { selectIcon } from 'Utils/modules/display';
import {
    BUTTON_TEXT,
    BUTTON_TEXT_FOR_MOBILE,
    EXPIRE_CONFIG_FOR_MOBILE,
    URL_TYPE,
    URL_TYPE_FOR_MOBILE,
} from '../../../../constant';
import { renderItem } from '../../../Create/constant';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { SELECT_BUTTON_TEXT } from 'Constants/GlobalConstant/ValidationMessage';
import RSInput from 'Components/FormFields/RSInput';
import { numberOfDaysValidtorMayBeLater } from 'Utils/HookFormValidate';
import { useDispatch, useSelector } from 'react-redux';
import { getSmartLinksListWithLabels } from 'Reducers/communication/createCommunication/smartlink/selectors';
import RenderInput from '../RenderInput/RenderInput';
import RSTooltip from 'Components/RSTooltip';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { handleButtonTextDuplicates } from '../../../../../Notification/constant';
import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';
import { MAX_SMART_LINKS } from 'Constants/GlobalConstant/InputLimit';

const InteractivityLinkInput = memo(({ type, name }) => (
    <Col sm={12} className="mt41 mb5">
        <RenderInput type={type} name={name} />
    </Col>
));

const Interactivity = ({ isSplit, fieldName, interColumnSplit, pushType, isFromImport = false }) => {
    const { type } = useContext(NotificationProvider);
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');

    const {
        control,
        trigger,
        setValue,
        watch,
        clearErrors,
        setFocus,
        unregister,
        resetField,
        getValues,
        setError,
    } = useFormContext();
    const smartLinksWithLabels = useSelector((state) => getSmartLinksListWithLabels(state));
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const buttonTextName = isSplit ? `${fieldName}.buttonText` : 'buttonText';
    // const buttonTextErrorName = isSplit ? `${fieldName}.buttonTextError` : 'buttonTextError';
    const frequencyName = isSplit ? `${fieldName}.frequency` : 'frequency';
    const ratingName = isSplit ? `${fieldName}.rating` : 'rating';

    const { fields, remove, append, update } = useFieldArray({
        control,
        name: buttonTextName,
    });

    const buttonText = useWatch({
        control,
        name: buttonTextName,
    });

    const [deliveryType, frequency] = watch(['deliveryType', frequencyName]);
    const [openEmojiPickerIndex, setOpenEmojiPickerIndex] = useState(null);

    const handleOpenWithAdd = () => {
        if (smartLinksWithLabels.length > 0) {
            dispatch(updateSmartLinkAutoAdd(true));
        }
        dispatch(updateSmartLinkModalState(true));
    };

    // useEffect(() => {
    //     trigger(ratingName);
    // }, [getValues(frequencyName)?.id]);
    const buttonNameOptionsBase = useMemo(() => {
        let smartLinksData = smartLinksWithLabels?.map((item, ind) => {
            const tech = (item.smartLinkTitle || item.id || '').trim();
            let friendly = (item.friendlyName || '').trim();
            if (
                !friendly ||
                friendly.toLowerCase() === tech.toLowerCase() ||
                /^smartlink\d+$/i.test(friendly) ||
                /^smart\s*link\s*\d+$/i.test(friendly)
            ) {
                friendly = '';
            }
            /** RSKendoDropdown: grey `subLabel` row first, then `textField` — put technical name on top, friendly below. */
            return {
                id: ind + 5,
                value: item.id,
                displayLabel: friendly || tech,
                subLabel: friendly ? tech : '',
            };
        });
        let urlType = URL_TYPE?.map((item, index) => {
            return {
                id: index + 10,
                value: item?.value,
            };
        });
        let urlTypeMob = URL_TYPE_FOR_MOBILE?.map((item, idx) => {
            return {
                id: idx + 10,
                value: item?.value,
            };
        });
        let notifyType =
            type === 'web'
                ? [...BUTTON_TEXT, ...urlType, ...smartLinksData]
                : [...BUTTON_TEXT_FOR_MOBILE(deliveryType?.id), ...urlTypeMob, ...smartLinksData];
        
        // Filter out "Maybe later" (id: 1), "Dismiss" (id: 2) and "Unsubscribe" (id: 4) when deliveryType?.id === 5
        if (deliveryType?.id === 5) {
            notifyType = notifyType.filter((item) => item.id !== 1 && item.id !== 2 && item.id !== 4);
        }
        
        return notifyType.map((item) => ({
            ...item,
            displayLabel: item.displayLabel ?? item.value,
            subLabel: item.subLabel ?? '',
        }));
    }, [smartLinksWithLabels, deliveryType?.id, type]);

    /** Keep the current row's selection in `data` so RSKendoDropdown can resolve `subLabel` when collapsed. */
    const buttonNameOptionsForRow = useCallback(
        (rowIdx) =>
            buttonNameOptionsBase.filter(
                (text) =>
                    text?.value === '' ||
                    !buttonText?.some(
                        (row, i) =>
                            i !== rowIdx &&
                            row?.text?.value != null &&
                            String(row.text.value) !== '' &&
                            row.text.value === text.value,
                    ),
            ),
        [buttonNameOptionsBase, buttonText],
    );

    // console.log('Button text ::: ', errors);

    const addCustomButtom = (idx) => {
        // Prevent adding buttons when deliveryType is 5 (only one button allowed)
        if (!idx && deliveryType?.id === 5) {
            return;
        }
        let isError;
        if (!idx) {
            // const findIndex = _findIndex(buttonText, (button) => {
            //     debugger;
            //     if (button?.text?.id < 5) {
            //         return button?.text?.value === '' || button?.type === '';
            //     } else {
            //         if (!button?.subjectLine || !button?.link) {
            //             isError = true;
            //         }
            //         return button?.subjectLine === '' || !!button?.link === '';
            //     }
            // });
            let buttons = buttonText?.map((item) => {
                if (item?.text?.id < 5) {
                    return true;
                } else if (item?.text?.id > 9) {
                    return item?.link;
                } else {
                    return true;
                }
            });

            const statusTrigger = buttonText?.every((button) => {
                const rating = watch(ratingName);
                const frequency = watch(frequencyName);

                const id = button?.text?.id;
                const hasCustomText = button?.customText;
                const hasLink = button?.link;
                if (!button?.text) return true;
                if (
                    (id >= 5 && id <= 9 && !hasCustomText) ||
                    ((id === 2 || id === 10 || id === 4 ) && !hasCustomText) ||
                    ((id === 11)&& (!hasCustomText || !hasLink)) ||
                    (id === 1 && (!rating || !frequency))
                ) {
                    return true;
                }
                return false;
            });

            if (!statusTrigger) {
                clearErrors(buttonTextName);
                append({
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                });
            } else {
                // if (isError) {
                //     setCustomButtonText({
                //         isCustomModal: true,
                //         currentIndex: findIndex,
                //     });
                // }
                // trigger(`${buttonTextName}[${findIndex}]`);
                trigger(frequencyName);
            }
        } else {
            remove(idx);
        }
    };

    return (
        <Fragment>
            {_map(fields, (field, idx) => {
                const name = isSplit ? `${fieldName}.buttonText.${idx}` : `buttonText.${idx}`;
                const selectedText = buttonText?.[idx]?.text;
                const matchedOption = selectedText
                    ? buttonNameOptionsBase.find(
                          (opt) =>
                              (selectedText.id != null && opt.id === selectedText.id) ||
                              (selectedText.value != null && opt.value === selectedText.value),
                      )
                    : null;
                const isSubLabelItem = !!(
                    String(selectedText?.subLabel ?? '').trim() ||
                    String(matchedOption?.subLabel ?? '').trim()
                );

                return (
                    <Fragment key={field.id}>
                        <div className={`${isFromImport && idx > 0 ? 'mt30' : idx > 0 ? 'mt41' : ''} rs-mb-nm0`}>
                            <Row className={`position-relative interactivity_emoji wp_sublable_container ${isSubLabelItem ? 'wp-sublabel-active d-flex align-items-end' : ''}`}>
                                {/* <Col sm={4}>
                                    <RSKendoDropdown
                                        control={control}
                                        name={`${name}.type`}
                                        label="Type"
                                        data={['Button']}
                                        rules={{
                                            required: SELECT_BUTTON_TYPE,
                                        }}
                                    />
                                </Col> */}
                                <Col
                                    sm={
                                        deliveryType?.id === 5 
                                            ? (interColumnSplit ? 12 : 8)
                                            : (!!buttonText[idx]?.text ? (interColumnSplit ? 6 : 4) : interColumnSplit ? 12 : 8)
                                    }
                                    className={`rs-btn-type-wrapper ${
                                        isFromImport ? `` : `${buttonText[idx]?.text?.value ? '' : ''}`
                                    } `}
                                >
                                    {/* {buttonText[idx]?.isNewLink && buttonText[idx]?.urlType !== 'code' && (
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
                                                    setValue(`buttonText.${idx}.isNewLink`, false);
                                                    setValue(`${name}.text`, '');
                                                    setValue(`${name}.customText`, '');
                                                    setValue(`${name}.urlType`, '');
                                                    unregister(`${name}.link`, {
                                                        keepValue: false,
                                                        keepDefaultValue: false,
                                                    });
                                                }}
                                            />
                                        </div>
                                    )} */}
                                    {/* {buttonText?.[idx]?.error && (
                                        <small className="color-primary-red">{buttonText?.[idx]?.error}</small>
                                    )} */}
                                    <RSKendoDropdown
                                        control={control}
                                        name={`${name}.text`}
                                        data={buttonNameOptionsForRow(idx)}
                                        label={
                                            // !!buttonText?.[idx]?.error ? (
                                            //     <small className="color-primary-red">{buttonText?.[idx]?.error}</small>
                                            // ) :
                                            'Button type'
                                        }
                                        required
                                        // isCustomRender
                                        dataItemKey={'id'}
                                        textField={'displayLabel'}
                                        itemRender={(props) => renderItem(props)}
                                        handleChange={async (e) => {
                                            // // if (e.value?.value === 'Enter new link') setValue(`${name}.show`, true);
                                            if (e.value?.id >= 10) {
                                                setValue(`${name}.isNewLink`, true);
                                                setValue(`${name}.link`, '');
                                                // setTimeout(() => setFocus(`${name}.newLink`), 100);
                                                // unregister(`${name}.link`, {
                                                //     keepValue: false,
                                                //     keepDefaultValue: false,
                                                // });
                                            }else{
                                                setValue(`${name}.isNewLink`, false);
                                            }
                                            if (e?.value?.id < 5) {
                                                setValue(`${name}.customText`, e?.value?.value);
                                                // setValue(`${name}.error`, '');
                                            } else if (e?.value?.id >= 5 && e?.value?.id < 10) {
                                                setValue(`${name}.customText`, '');
                                                // let payload = {
                                                //     departmentId,
                                                //     userId,
                                                //     clientId,
                                                //     blastType: fieldName !== '' ? fieldName?.slice(-1) : '',
                                                //     campaignId: _get(location, 'campaignId', 0),
                                                //     channelId: 8, // need to change dynamically from enum
                                                //     goalNo: Number(getValues(`${name}.link`)?.slice(-1)),
                                                //     blastNo: 1,
                                                //     parentChannelDetailId: 0,
                                                //     actionId: 1,
                                                // };
                                                // const { status, data } = await dispatch(
                                                //     getSmartUrlDetailByChannel({ payload }),
                                                // );

                                                // if (status) {
                                                //     let { smartCode, blastSC, urlName } = data;
                                                //     if (!!urlName) {
                                                //         // setValue(`${name}.show`, false)
                                                //         // clearErrors(`${name}.text`);
                                                //         setValue(`${name}.error`, '');
                                                //         setValue(`errorBlock`, false);
                                                //     } else {
                                                //         // setError(`${name}.text`, {
                                                //         //     type: 'custom',
                                                //         //     message: 'Selected SmartLink is not generated',
                                                //         // });
                                                //         setValue(
                                                //             `${name}.error`,
                                                //             'Selected SmartLink is not generated',
                                                //         );
                                                //         setValue(`errorBlock`, true);
                                                //         // debugger;
                                                //         // trigger(`${name}.text`);
                                                //     }
                                                // }
                                                // setValue(`${name}.customText`, '');
                                            } else {
                                                setValue(`${name}.customText`, '');
                                                setValue(`${name}.error`, '');
                                                setValue(`errorBlock`, false);
                                            }
                                            // resetField(`${name}.link`, '');
                                            setValue(`${name}.link`, '');
                                            // setValue(`${name}.customText`, '');
                                            clearErrors(`${name}.customText`);
                                            clearErrors(`${fieldName}.frequency`);
                                            clearErrors(`${fieldName}.rating`);
                                            clearErrors(`${name}.link`, '');
                                        }}
                                        rules={{
                                            required: SELECT_BUTTON_TEXT,
                                            validate: async (value) => {
                                                return handleButtonTextDuplicates(getValues(buttonTextName), value);
                                                //console.log('Validate ::: ', sm);
                                                // if (sm?.id >= 5 && sm?.id < 10) {
                                                //     let payload = {
                                                //         departmentId,
                                                //         userId,
                                                //         clientId,
                                                //         blastType: fieldName !== '' ? fieldName?.slice(-1) : '',
                                                //         campaignId: _get(location, 'campaignId', 0),
                                                //         channelId: 8, // need to change dynamically from enum
                                                //         goalNo: Number(getValues(`${name}.link`)?.slice(-1)),
                                                //         blastNo: 1,
                                                //         parentChannelDetailId: 0,
                                                //         actionId: 1,
                                                //     };
                                                //     // const { status, data } = await dispatch(
                                                //     //     getSmartUrlDetailByChannel({ payload }),
                                                //     // );
                                                //     // if (status) {
                                                //     //     let { smartCode, blastSC, urlName } = data;
                                                //     //     // setValue(`${name}.customText`, '');
                                                //     //     // if (!!smartCode && !!blastSC && !!urlName) {
                                                //     //     if (!!urlName) {
                                                //     //         // setValue(`${name}.show`, false)
                                                //     //         // clearErrors(`${name}.text`);
                                                //     //         setValue(`${name}.error`, '');
                                                //     //         // setValue(`errorBlock`, false);
                                                //     //         return true;
                                                //     //     } else {
                                                //     //         // setError(`${name}.text`, {
                                                //     //         //     type: 'custom',
                                                //     //         //     message: 'Selected SmartLink is not generated',
                                                //     //         // });
                                                //     //         setValue(`errorBlock`, true);
                                                //     //         return 'Selected SmartLink is not generated';
                                                //     //         // setValue(
                                                //     //         //     `${name}.error`,
                                                //     //         //     'Selected SmartLink is not generated',
                                                //     //         // );
                                                //     //         // debugger;
                                                //     //         // trigger(`${name}.text`);
                                                //     //     }
                                                //     // } else {
                                                //     //     return 'Selected SmartLink is not generated';
                                                //     // }
                                                // }
                                            },
                                        }}
                                        footer={
                                            <NewAttributeBtn
                                                show={smartLinksWithLabels?.length >= MAX_SMART_LINKS ? 'click-off' : ''}
                                                title="Add Smart Link"
                                                handleModalAttribute={handleOpenWithAdd}
                                            />
                                        }
                                    />
                                </Col>
                                {/* {buttonText[idx]?.text?.id >= 0 && ( */}
                                <>
                                    {buttonText[idx]?.text?.id >= 0 && deliveryType?.id !== 5 && (
                                        <Col
                                            sm={interColumnSplit ? 6 : 4}
                                            className={`${
                                                buttonText[idx]?.text?.id >= 5 ? 'd-flex' : 'd-flex'
                                            } ${openEmojiPickerIndex !== null && openEmojiPickerIndex !== idx ? 'zIndex2' : ''}`}
                                        >
                                            <RSEmojiPickerInput
                                                inputName={`${name}.customText`}
                                                isPersonalize={false}
                                                placeholder={'Button name'}
                                                className = {'w-100'}
                                                maxLength={15}
                                                customInputClassName='pr28'
                                                required={buttonText[idx]?.text?.id >= 5}
                                                rules={
                                                    buttonText[idx]?.text?.id >= 5
                                                        ? {
                                                              required: ENTER_BUTTON_NAME,
                                                              pattern: {
                                                                  value: ALPHA_CHARCTERS,
                                                                  message: 'Enter valid button text',
                                                              },
                                                          }
                                                        : {}
                                                }
                                                iconTopspace
                                                onEmojiPickerOpen={() => setOpenEmojiPickerIndex(idx)}
                                                onEmojiPickerClose={() => setOpenEmojiPickerIndex(null)}
                                            />
                                            {/* <i
                                            className={`${selectIcon(idx)} icon-md d-flex align-items-center cp ${
                                                fields?.length > 1 && idx == 0 ? 'click-off' : ''
                                            }`}
                                            onClick={() => addCustomButtom(idx)}
                                        /> */}
                                        </Col>
                                    )}
                                    {deliveryType?.id !== 5 && !isFromImport && (
                                        <Col sm={1} className={`d-inline-block Left100 ml65 position-absolute pt5 z-1 align-items-baseline d-flex ${interColumnSplit ? '1' : '2'} `}>
                                            <RSTooltip
                                                text={idx === 0 ? 'Add' : 'Remove'}
                                                className={` d-inline-block ${
                                                    pushType === 'Alert/rich push' && type !== 'mobile'
                                                        ? 'right-20 z-1 mob'
                                                        : ''
                                                }`}
                                            >
                                                <div  className={`${
                                                        fields?.length > 1 && idx == 0 ? 'pe-none click-off' : ''
                                                    }`}>
                                                <i
                                                    className={`${selectIcon(idx)} icon-md d-flex align-items-center cp`}
                                                    onClick={() => addCustomButtom(idx)}
                                                /></div>
                                            </RSTooltip>
                                        </Col>
                                    )}
                                </>
                                {/* )} */}
                                {buttonText[idx]?.text?.id >= 10 && (
                                    // <RSKendoDropdown
                                    //     control={control}
                                    //     required
                                    //     data={type === 'mobile' ? URL_TYPE_FOR_MOBILE : URL_TYPE}
                                    //     dataItemKey={'id'}
                                    //     textField={'value'}
                                    //     label={'URL type'}
                                    //     // defaultValue={'Weburl'}
                                    //     name={`${name}.urlType`}
                                    //     // handleChange={() => setFocus(`${name}.link`)}
                                    //     rules={{
                                    //         required: SELECT_URL_TYPE,
                                    //     }}
                                    // />
                                    <InteractivityLinkInput type={buttonText[idx]?.text?.value} name={name} />
                                )}
                                <Col
                                    sm={isFromImport ? 0 : 3}
                                    className={
                                        isFromImport
                                            ? `fg-icons-wrapper mt5 fg-mobile-wrap Left100 col ${idx > 0 ? '' : ''}`
                                            : ` ${
                                                  (deliveryType?.id !== 1 && deliveryType?.id !== 5) ||
                                                  (type === 'mobile' && deliveryType?.id !== 5)
                                                      ? 'd-block'
                                                      : 'd-none'
                                              } fg-icons-wrapper`
                                    }
                                >
                                    <div className={isFromImport ? 'd-flex float-end' : 'fg-icons position-absolute Left100 ml4 top5'}>
                                        <Fragment>
                                            {/* {buttonText[idx]?.text?.id >= 5 && (
                                                <i
                                                    className={`${settings_medium} icon-md mr5 color-primary-blue`}
                                                    onClick={() => setValue(`${name}.show`, true)}
                                                />
                                            )} */}
                                            {(deliveryType?.id !== 1 && deliveryType?.id !== 5) || (type === 'mobile' && deliveryType?.id !== 5) ? (
                                                <Fragment>
                                                    <RSColorPicker
                                                        icon={colorpicker_bg_medium}
                                                        tooltipText={'Background color'}
                                                        isToolTip
                                                        isOpacity={true}
                                                        onSelect={(e) => {
                                                            if (typeof e === 'object' && e.color && e.opacity !== undefined) {
                                                                // Handle opacity - convert to hex and append to color
                                                                const alpha = Math.round(e.opacity * 255);
                                                                const hexOpacity = alpha.toString(16).padStart(2, '0').toUpperCase();
                                                                const colorWithOpacity = `${e.color}${hexOpacity}`;
                                                                setValue(`${name}.backgroundColor`, colorWithOpacity);
                                                            } else {
                                                                // Handle simple color selection without opacity
                                                                setValue(`${name}.backgroundColor`, e);
                                                            }
                                                        }}
                                                        initColor={buttonText[idx]?.backgroundColor}
                                                        wrapperClass="interactivity-colorpicker"
                                                    />
                                                    <RSColorPicker
                                                        icon={colorpicker_text_medium}
                                                        tooltipText={'Font color'}
                                                        isToolTip
                                                        isOpacity={true}
                                                        onSelect={(e) => {
                                                            if (typeof e === 'object' && e.color && e.opacity !== undefined) {
                                                                // Handle opacity - convert to hex and append to color
                                                                const alpha = Math.round(e.opacity * 255);
                                                                const hexOpacity = alpha.toString(16).padStart(2, '0').toUpperCase();
                                                                const colorWithOpacity = `${e.color}${hexOpacity}`;
                                                                setValue(`${name}.fontColor`, colorWithOpacity);
                                                            } else {
                                                                // Handle simple color selection without opacity
                                                                setValue(`${name}.fontColor`, e);
                                                            }
                                                        }}
                                                        colorValue={(() => {
                                                            const currentValue = buttonText[idx]?.fontColor || '';
                                                            if (typeof currentValue === 'string' && currentValue.length === 9) {
                                                                return currentValue.substring(0, 7); // Extract color part
                                                            }
                                                            return currentValue;
                                                        })()}
                                                        wrapperClass={`interactivity-colorpicker ${isFromImport ? 'ml15' : ''}`}
                                                        defaultIconColor = {'#000000'}
                                                    />
                                                </Fragment>
                                            ) : null}
                                        </Fragment>
                                    </div>
                                    {isFromImport && (
                                        <RSTooltip
                                            text={idx === 0 ? 'Add' : 'Remove'}
                                            className={`position-absolute top2 ${isFromImport && isSubLabelItem ? 'Left100 top20' : isFromImport ? 'Left100 top5' : 'right-10 z-1'}`}
                                        >
                                            <div  className={`${
                                                    fields?.length > 1 && idx == 0 ? 'pe-none click-off' : ''
                                                }`}>
                                            <i
                                                className={`${selectIcon(idx)} icon-md d-flex align-items-center cp`}
                                                onClick={() => addCustomButtom(idx)}
                                            />
                                            </div>
                                        </RSTooltip>
                                    )}
                                </Col>
                            </Row>
                            {buttonText[idx]?.text?.value === 'Maybe later' && (
                                <div className='mt41'>
                                <Row>
                                    <Col sm={6}>
                                        <RSKendoDropdown
                                            control={control}
                                            name={frequencyName}
                                            label="Select frequency"
                                            data={EXPIRE_CONFIG_FOR_MOBILE}
                                            textField={'text'}
                                            dataItemKey={'id'}
                                            handleChange={()=>{
                                                setValue(ratingName, '');
                                                clearErrors(ratingName);
                                            }}
                                            rules={{
                                                required: 'Select frequency time',
                                            }}
                                            required
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={ratingName}
                                            placeholder={'Frequency value'}
                                            onKeyDown={onlyNumbers}
                                            maxLength={3}
                                            required
                                            rules={{
                                                required: 'Enter frequency value',
                                                validate: (value) => {
                                                    const val = Number(value)
                                                    const frequencyId = Number(frequency?.id);
                                                    if (frequencyId === 1) {
                                                        return val && val > 60 ? 'Enter values from 1 to 60' : val < 1 ? 'Enter values greater than 0' : true;
                                                    } else if (frequencyId === 2) {
                                                        return val && val > 4 ? 'Enter values from 1 to 4' : val < 1 ? 'Enter values greater than 0' : true;
                                                    }
                                                    //return numberOfDaysValidtorMayBeLater(Number(value), frequencyId);
                                                },
                                            }}
                                        />
                                    </Col>
                                </Row>
                                </div>
                            )}
                        </div>
                        {/* Modals */}
                        <CreateCustomButton
                            show={buttonText[idx]?.show}
                            currentIndex={idx}
                            isSplit={isSplit}
                            fieldName={fieldName}
                            update={update}
                            confirm={() => setValue(`${name}.show`, false)}
                            handleClose={() => setValue(`${name}.show`, false)}
                        />
                    </Fragment>
                );
            })}
        </Fragment>
    );
};

export default Interactivity;
