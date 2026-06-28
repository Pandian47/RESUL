import { ALPHA_CHARCTERS, WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_BUTTON_NAME, ENTER_VALID_LINK, SELECT_LINK, SELECT_URL_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD, BACKGROUND_COLOR, BUTTON_NAME, BUTTON_TYPE, ENTER_VALID_BUTTON, FONT_COLOR, FREQUENCY_VALUE, PROPER_FREQUENCY_VALUE, REMOVE, SELECT_FREQUENCY, SELECT_FREQUENCY_TIME } from 'Constants/GlobalConstant/Placeholders';
import { close_large, colorpicker_bg_medium, colorpicker_text_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useMemo, useState } from 'react';
import _map from 'lodash/map';
import { Row, Col } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSColorPicker from 'Components/ColorPicker';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import CreateCustomButton from '../../../CreateCustomButton/CreateCustomButton';

import { onlyNumbers } from 'Utils/modules/inputValidators';
import { selectIcon } from 'Utils/modules/display';
import {
    BUTTON_TEXT,
    EXPIRE_CONFIG,
    handleButtonTextDuplicates,
    URL_TYPE,
} from '../../../../constant';
import { renderItem } from '../../../Create/constant';
import { SELECT_BUTTON_TEXT } from 'Constants/GlobalConstant/ValidationMessage';
import RSInput from 'Components/FormFields/RSInput';
import { numberOfDaysValidtor } from 'Utils/HookFormValidate';
import { useDispatch, useSelector } from 'react-redux';
import { getSmartLinksListWithLabels } from 'Reducers/communication/createCommunication/smartlink/selectors';
import RenderInput from '../RenderInput/RenderInput';
import RSTooltip from 'Components/RSTooltip';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';
import { MAX_SMART_LINKS } from 'Constants/GlobalConstant/InputLimit';

const Interactivity = ({ isSplit, fieldName, interColumnSplit, pushType, isFromImport = false }) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication') || {};

    const { control, trigger, setValue, watch, clearErrors, setFocus, unregister, resetField, getValues, setError } =
        useFormContext();
    const smartLinksWithLabels = useSelector((state) => getSmartLinksListWithLabels(state));
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const buttonTextName = isSplit ? `${fieldName}.buttonText` : 'buttonText';
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
    const [openEmojiPickerIndex, setOpenEmojiPickerIndex] = useState(null);

    const [deliveryType, contentInput] = watch(['deliveryType', 'contentInput']);

    const handleOpenWithAdd = () => {
        if (smartLinksWithLabels.length > 0) {
            dispatch(updateSmartLinkAutoAdd(true));
        }
        dispatch(updateSmartLinkModalState(true));
    };

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
            /** RSKendoDropdown: grey `subLabel` first, then `textField` — technical name on top, friendly below. */
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
        let notifyType = [...BUTTON_TEXT, ...urlType, ...smartLinksData];

        // Filter out "Maybe later" (id: 1), "Dismiss" (id: 2) and "Unsubscribe" (id: 4) when deliveryType?.id === 5
        if (deliveryType?.id === 5) {
            notifyType = notifyType.filter((item) => item.id !== 1 && item.id !== 2 && item.id !== 4);
        }

        return notifyType.map((item) => ({
            ...item,
            displayLabel: item.displayLabel ?? item.value,
            subLabel: item.subLabel ?? '',
        }));
    }, [smartLinksWithLabels, deliveryType?.id]);

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

    // console.log('Button text ::: ', buttonNameOptions);

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
                const id = button?.text?.id;
                const hasCustomText = button?.customText;
                const hasLink = button?.link;
                if (!button?.text) return true;
                if (
                    (id >= 5 && id <= 9 && !hasCustomText) ||
                    ((id === 2 || id === 4) && !hasCustomText) ||
                    (id === 10 && (!hasCustomText || !hasLink))
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
                trigger();
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
                        <div className={`${isFromImport && idx > 0 ? 'mt30' : idx > 0  ? 'mt41' : ''}`}>
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
                                            ? interColumnSplit
                                                ? 12
                                                : 8
                                            : !!buttonText[idx]?.text
                                            ? interColumnSplit
                                                ? 6
                                                : 4
                                            : interColumnSplit
                                            ? 12
                                            : 8
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
                                    <RSKendoDropdown
                                        control={control}
                                        name={`${name}.text`}
                                        data={buttonNameOptionsForRow(idx)}
                                        label={BUTTON_TYPE}
                                        dataItemKey={'id'}
                                        textField={'displayLabel'}
                                        itemRender={(props) => renderItem(props)}
                                        handleChange={async (e) => {
                                                                                        clearErrors();
                                            // // if (e.value?.value === 'Enter new link') setValue(`${name}.show`, true);
                                            if (e.value?.id >= 10) {
                                                setValue(`${name}.isNewLink`, true);
                                                setValue(`${name}.link`, '');
                                                // setTimeout(() => setFocus(`${name}.newLink`), 100);
                                                // unregister(`${name}.link`, {
                                                //     keepValue: false,
                                                //     keepDefaultValue: false,
                                                // });
                                            } else {
                                                setValue(`${name}.isNewLink`, false);
                                            }
                                            if (e?.value?.id < 5) {
                                                setValue(`${name}.customText`, e?.value?.value);
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
                                                //     // console.log('urlName: ', !!urlName);
                                                //     // console.log('blastSC: ', !!blastSC);
                                                //     // console.log('smartCode: ', !!smartCode);
                                                //     // if (!!smartCode && !!blastSC && !!urlName) {
                                                //     if (!!urlName) {
                                                //         // setValue(`${name}.show`, false)
                                                //         clearErrors(`${name}.text`);
                                                //     } else {
                                                //         setError(`${name}.text`, {
                                                //             type: 'custom',
                                                //             message: 'Selected SmartLink is not generated',
                                                //         });
                                                //     }
                                                // }
                                                // setValue(`${name}.customText`, '');
                                            } else {
                                                setValue(`${name}.customText`, '');
                                            }
                                            resetField(`${name}.link`, '');
                                        }}
                                        rules={{
                                            required: SELECT_BUTTON_TEXT,
                                            validate: (value) => {
                                                return handleButtonTextDuplicates(getValues(buttonTextName), value);
                                            },
                                        }}
                                        required
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
                                            className={`d-flex position-relative ${
                                                openEmojiPickerIndex !== null && openEmojiPickerIndex !== idx
                                                    ? 'zIndex2'
                                                    : ''
                                            }`}
                                        >
                                            <RSEmojiPickerInput
                                                inputName={`${name}.customText`}
                                                isPersonalize={false}
                                                className={'w-100'}
                                                customInputClassName="pr28"
                                                placeholder={BUTTON_NAME}
                                                // inputSettings={{
                                                //     maxLength: 15,
                                                // }}
                                                maxLength={15}
                                                required={buttonText[idx]?.text?.id >= 5}
                                                rules={
                                                    buttonText[idx]?.text?.id >= 5
                                                        ? {
                                                              required: ENTER_BUTTON_NAME,
                                                              pattern: {
                                                                  value: ALPHA_CHARCTERS,
                                                                  message: ENTER_VALID_BUTTON,
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
                                </>
                                {/* )} */}
                                {/* {buttonText[idx]?.text?.id < 5 && buttonText[idx]?.text?.id < 10 && ( */}
                                {buttonText[idx]?.text?.id >= 10 && (
                                    // <RSKendoDropdown
                                    //     control={control}
                                    //     required
                                    //     data={URL_TYPE}
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
                                    <Col sm={12} className={`${isFromImport ? 'mt41' : 'mt41'} mb5 `}>
                                        <RenderInput type={buttonText[idx]?.text?.value} name={name} />
                                        {/* <RSInput
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
                                        /> */}
                                    </Col>
                                )}
                                <Col
                                    sm={isFromImport ? 0 : 3}
                                    className={
                                        isFromImport
                                            ? `fg-icons-wrapper mt5 fg-mobile-wrap Left100  col ${
                                                  idx > 0 ? '' : ''
                                              }`
                                            : ` ${
                                                  deliveryType?.id !== 5
                                                      ? `d-flex ${isSubLabelItem ? 'bottom0' : 'pt5'}`
                                                      : 'd-none'
                                              } 
                                                fg-icons-wrapper 
                                                position-absolute 
                                                Left100  
                                                color-bg-fg pl0`
                                    }
                                >
                                    <div
                                        className={
                                            isFromImport
                                                ? 'd-flex float-end'
                                                : deliveryType?.id !== 1 && deliveryType?.id !== 5
                                                ? `fg-icons mr15 ${isSubLabelItem ? '' : 'top0'}`
                                                : `fg-icons ${isSubLabelItem ? '' : 'top0'}`
                                        }
                                    >
                                        <Fragment>
                                            {/* {buttonText[idx]?.text?.id >= 5 && (
                                                <i
                                                    className={`${settings_medium} icon-md mr5 color-primary-blue`}
                                                    onClick={() => setValue(`${name}.show`, true)}
                                                />
                                            )} */}
                                            {deliveryType?.id !== 1 && deliveryType?.id !== 5 ? (
                                                <Fragment>
                                                    <RSColorPicker
                                                        icon={colorpicker_bg_medium}
                                                        tooltipText={BACKGROUND_COLOR}
                                                        onSelect={(color) => setValue(`${name}.backgroundColor`, color)}
                                                        initColor={buttonText[idx]?.backgroundColor}
                                                        colorValue={watch(`${name}.backgroundColor`)}
                                                        wrapperClass="interactivity-colorpicker"
                                                    />
                                                    <RSColorPicker
                                                        icon={colorpicker_text_medium}
                                                        tooltipText={FONT_COLOR}
                                                        onSelect={(color) => setValue(`${name}.fontColor`, color)}
                                                        initColor={buttonText[idx]?.fontColor}
                                                        colorValue={watch(`${name}.fontColor`)}
                                                        wrapperClass={`interactivity-colorpicker ${
                                                            isFromImport ? 'ml15' : ''
                                                        }`}
                                                        defaultIconColor={'#000000'}
                                                    />
                                                </Fragment>
                                            ) : null}
                                        </Fragment>
                                    </div>
                                    <RSTooltip
                                        text={idx === 0 ? ADD : REMOVE}
                                        className={`${isFromImport ? 'position-absolute Left100 top5' : 'z-1'} `}
                                    >
                                        <div className={`${fields?.length > 1 && idx === 0 ? 'pe-none click-off' : ''}`}>
                                            <i
                                                className={`${selectIcon(idx)} icon-md d-flex align-items-center cp`}
                                                onClick={() => addCustomButtom(idx)}
                                            />
                                        </div>
                                    </RSTooltip>
                                </Col>
                            </Row>
                            <></>
                            {buttonText[idx]?.text?.value === 'Maybe later' && (
                                <Row className="mt30">
                                    <Col sm={6}>
                                        <RSKendoDropdown
                                            control={control}
                                            name={frequencyName + idx}
                                            label={SELECT_FREQUENCY}
                                            data={EXPIRE_CONFIG}
                                            textField={'text'}
                                            dataItemKey={'id'}
                                            rules={{
                                                required: SELECT_FREQUENCY_TIME,
                                            }}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={ratingName + idx}
                                            placeholder={FREQUENCY_VALUE}
                                            onKeyDown={onlyNumbers}
                                            maxLength={3}
                                            required
                                            rules={{
                                                required: PROPER_FREQUENCY_VALUE,
                                                validate: (value) => {
                                                    const frequencyId = watch(frequencyName + idx)?.id;
                                                    return numberOfDaysValidtor(
                                                        value,
                                                        'Frequency cannot exceed 180 days',
                                                        frequencyId,
                                                    );
                                                },
                                            }}
                                        />
                                    </Col>
                                </Row>
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
