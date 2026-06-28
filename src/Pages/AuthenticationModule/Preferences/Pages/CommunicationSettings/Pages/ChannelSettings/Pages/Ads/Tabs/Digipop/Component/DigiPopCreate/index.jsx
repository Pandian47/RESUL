import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { DIGIPOP_ATTRIBUTE as DIGIPOP_ATTRIBUTE_MSG, DIGIPOP_NAME as DIGIPOP_NAME_MSG, DIGIPOP_TYPE as DIGIPOP_TYPE_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { DIGIPOP_ATTRIBUTE, DIGIPOP_DESCRIPTION, DIGIPOP_NAME, DIGIPOP_TYPE } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    GetDigiPop_grid,
    getDigiPopCreative_NameExisit,
    SaveDigiPop_Creative,
    UpdateDigiPop_Creative,
} from 'Reducers/preferences/CommunicationSettings/request';
import { useDispatch, useSelector } from 'react-redux';
import { DigipopProvider } from '../..';
import { getSessionId } from 'Reducers/globalState/selector';
import usePermission from 'Hooks/usePersmission';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import {
    buildPayload,
    digipopAttribute,
    digipopType,
    formInitialState,
    handleOptionalSettingEditData,
    handleSettingEditData,
    initialAudioSetting,
    initialHTMLSetting,
    initialImageSetting,
    initialNativeSetting,
    initialOptionalSetting,
    initialPushNotifySetting,
    initialVideoSetting,
} from '../../constant';
import ListNameExists from 'Components/ListNameExists';
import ImageSetting from './Type/Image/Image';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';

import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import VideoSetting from './Type/Video/VideoSetting';
import AudioSetting from './Type/Audio/AudioSetting';
import NativeSetting from './Type/Native/Native';
import PushNotifySetting from './Type/PushNotify/PushNotify';
import HtmlSetting from './Type/Html/html';
import RSTooltip from 'Components/RSTooltip';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const DigiPopCreate = ({ type, handleCancel, setFailedApi }) => {
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector(getSessionId);
    const methods = useForm({
        defaultValues: formInitialState,
        mode: 'onTouched',
    });
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const context = useContext(DigipopProvider);
    const isUpdate = context?.gridCreate?.digipopAction?.edit?.isEdit;
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: isUpdate ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;
    const [editData, setEditData] = useState([]);
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        getValues,
        watch,
        formState: { errors },
        trigger,
        setFocus,
    } = methods;
    const uniqueName = 'digipop';

    const watchDigipop = watch('digipop');
    
    const getUniqueName = (name = '') => {
        return `${uniqueName}.${name}`;
    };
    
    const getDigipopDataById = async (id) => {
        const payload = {
            userId,
            clientId,
            type: '', //optional - category //type: image / native / video / audio / html / pushnotif
            departmentId,
            partnerId: 41,
            id: id,
        };
        const { status, data } = await dispatch(GetDigiPop_grid(payload));
        if (status) {
            setEditData(data);
        } else {
            setEditData([]);
        }
    };

    useEffect(() => {
        if (isUpdate) {
            getDigipopDataById(context?.gridCreate?.digipopAction?.edit?.editState?.id);
        }
    }, [isUpdate]);

    const handleSave = async (data) => {
        if (isSaveLoading) return;
        // debugger;
        const userDetails = {
            clientId,
            departmentId,
            userId,
            partnerId: 41,
            id: context?.gridCreate?.digipopAction?.edit?.editState?.id || 0,
        };

        const handleTriggerError = () => {
            // debugger;
            const { digipop } = data;
            if (digipop?.type?.type === 'pushnotif') {
                const { pushNotifySetting } = digipop;
                const { pushNotifyResolution } = pushNotifySetting;
                const checkAllTabImageType = pushNotifyResolution?.findIndex(
                    (resolution) => !resolution?.imageContent?.imageType,
                );
                if (checkAllTabImageType >= 0) {
                    setValue(`digipop.pushNotifySetting.pushNotifyDefaultTab`, checkAllTabImageType);
                    setValue(
                        `digipop.pushNotifySetting.pushNotifyResolution[${checkAllTabImageType}].imageContent.errorImport`,
                        'Please upload image',
                    );
                    setFocus(`digipop.type`);
                    return false;
                } else {
                    const checkAllTabImageValue = pushNotifyResolution?.findIndex(
                        ({ imageContent }) =>
                            (imageContent?.imageType === 'URL' &&
                                (!imageContent?.imageUrl || !imageContent?.isPreviewImageUrl)) ||
                            (imageContent?.imageType === 'Upload' && !imageContent?.image),
                    );
                    if (checkAllTabImageValue >= 0) {
                        setValue(`digipop.pushNotifySetting.pushNotifyDefaultTab`, checkAllTabImageValue);
                        setValue(
                            `digipop.pushNotifySetting.pushNotifyResolution[${checkAllTabImageValue}].imageContent.errorImport`,
                            'Please upload image',
                        );
                        setFocus(`digipop.type`);
                        return false;
                    } else {
                        return true;
                    }
                }
            } else if (digipop?.type?.type === 'native') {
                const { nativeSetting } = digipop;
                const { nativeResolution } = nativeSetting;
                const checkAllTabImageType = nativeResolution?.findIndex(
                    (resolution) => !resolution?.imageContent?.imageType,
                );
                if (checkAllTabImageType >= 0) {
                    setValue(`digipop.nativeSetting.nativeDefaultTab`, checkAllTabImageType);
                    setValue(
                        `digipop.nativeSetting.nativeResolution[${checkAllTabImageType}].imageContent.errorImport`,
                        'Please upload image',
                    );
                    setFocus(`digipop.type`);
                    return false;
                } else {
                    const checkAllTabImageValue = nativeResolution?.findIndex(
                        ({ imageContent }) =>
                            (imageContent?.imageType === 'URL' &&
                                (!imageContent?.imageUrl || !imageContent?.isPreviewImageUrl)) ||
                            (imageContent?.imageType === 'Upload' && !imageContent?.image),
                    );
                    if (checkAllTabImageValue >= 0) {
                        setValue(`digipop.nativeSetting.nativeDefaultTab`, checkAllTabImageValue);
                        setValue(
                            `digipop.nativeSetting.nativeResolution[${checkAllTabImageValue}].imageContent.errorImport`,
                            'Please upload image',
                        );
                        setFocus(`digipop.type`);
                        return false;
                    } else {
                        return true;
                    }
                }
            } else {
                return true;
            }
        };
        const errorStatus = handleTriggerError();

        if (errorStatus) {
            const payload = buildPayload(data, userDetails, isUpdate);
            const result = await saveApi.refetch({
                fetcher: () =>
                    dispatch(
                        isUpdate ? UpdateDigiPop_Creative(payload, false) : SaveDigiPop_Creative(payload, false),
                    ),
                loaderConfig: fieldLoaderConfig,
                mode: isUpdate ? 'edit' : 'create',
            });

            if (result?.status) {
                handleCancel(true);
            } else {
            }
        }
    };

    const handleSettingResetValue = () => {
        setValue('digipop.type', '');
        setValue('digipop.imageSetting', { ...initialImageSetting });
        setValue('digipop.videoSetting', { ...initialVideoSetting });
        setValue('digipop.audioSetting', { ...initialAudioSetting });
        setValue('digipop.nativeSetting', { ...initialNativeSetting });
        setValue('digipop.pushNotifySetting', { ...initialPushNotifySetting });
        setValue('digipop.htmlSetting', { ...initialHTMLSetting });
        ['digipop.type','imageSetting', 'videoSetting', 'audioSetting', 'nativeSetting', 'pushNotifySetting'].forEach((value) => {
            clearErrors(`digipop.${value}`);
        });
    };

    useEffect(() => {
        if (editData?.length) {
            const { description, name, type, attributes, optionalSetting } = editData[0]?.requestBody;
            const findType = digipopType?.find((data) => data?.type === type);
            const setting = handleSettingEditData(editData);
            const optSetting = optionalSetting && handleOptionalSettingEditData(optionalSetting);
            const findAttribute = digipopAttribute?.filter((attr) => attributes?.includes(attr?.id));
            const finalResetValue = {
                digipop: {
                    ...setting,
                    description: description || '',
                    name: name || '',
                    type: findType || '',
                    attribute: findAttribute || [],
                    isOptionSetting: optionalSetting ? true : false,
                    optionalSetting: optSetting?.optionalSetting
                        ? optSetting?.optionalSetting
                        : {
                              ...initialOptionalSetting,
                          },
                },
            };
            reset(finalResetValue);
        }
    }, [editData]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleSave)}>
                <div className="box-design bd-top-border">
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>Digipop - {type}</h4>
                        </div>
                    </div>

                    <div>
                        <Row>
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Name</label>
                                    </Col>
                                    <Col md={6}>
                                        <ListNameExists
                                            name={getUniqueName('name')}
                                            field="name"
                                            condition={(data) => {
                                                const { status } = data;
                                                return status;
                                            }}
                                            apiCallback={getDigiPopCreative_NameExisit}
                                            placeholder={DIGIPOP_NAME}
                                            extraPayload={{
                                                partnerId: 41,
                                            }}
                                            onKeyDown={charNumUnderScore}
                                            rules={LIST_NAME_RULES(DIGIPOP_NAME_MSG)}
                                            customErrorMessage={DIGIPOP_NAME_MSG}
                                            maxLength={MAX_LENGTH50}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Description</label>
                                    </Col>
                                    <Col md={6}>
                                        <RSTextarea
                                            control={control}
                                            name={getUniqueName('description')}
                                            placeholder={DIGIPOP_DESCRIPTION}
                                            onKeyDown={charNumUnderScore}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Attribute</label>
                                    </Col>
                                    <Col md={6}>
                                        <RSMultiSelect
                                            name={getUniqueName('attribute')}
                                            data={digipopAttribute}
                                            control={control}
                                            placeholder={DIGIPOP_ATTRIBUTE}
                                            textField={'attributeType'}
                                            dataItemKey={'id'}
                                            // rules={{
                                            //     required: DIGIPOP_ATTRIBUTE_MSG,
                                            // }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Source type</label>
                                    </Col>
                                    <Col md={6}>
                                        <RSKendoDropDownList
                                            data={digipopType}
                                            control={control}
                                            name={getUniqueName('type')}
                                            label={DIGIPOP_TYPE}
                                            className={`${watchDigipop?.type?.type ? 'click-off' : ''}`}
                                            dataItemKey={'id'}
                                            textField={'name'}
                                            required
                                            rules={{
                                                required: DIGIPOP_TYPE_MSG,
                                            }}
                                            // handleChange={() => {
                                            //     handleSettingResetValue();
                                            // }}
                                        />
                                    </Col>
                                    {watchDigipop?.type?.type && (
                                        <Col className="d-flex">
                                            <RSTooltip
                                                className="lh0 rs-tooltip-wrapper position-relative ml-16"
                                                text="Reset"
                                                position="top"
                                            >
                                                <i
                                                    className={`${restart_medium} icon-md color-primary-blue`}
                                                    onClick={() => {
                                                        handleSettingResetValue();
                                                    }}
                                                ></i>
                                            </RSTooltip>
                                        </Col>
                                    )}
                                </Row>
                            </div>

                            {/* {watchDigipop?.type?.name && <h3> {watchDigipop?.type?.name} setting</h3>} */}
                            {watchDigipop?.type?.type === 'image' && <ImageSetting />}
                            {watchDigipop?.type?.type === 'video' && <VideoSetting />}
                            {watchDigipop?.type?.type === 'audio' && <AudioSetting />}
                            {watchDigipop?.type?.type === 'native' && <NativeSetting />}
                            {watchDigipop?.type?.type === 'pushnotif' && <PushNotifySetting />}
                            {watchDigipop?.type?.type === 'html' && <HtmlSetting />}
                            {watchDigipop?.type?.type && (
                                <>
                                    {/* <h3>Optional setting</h3>
                                    <RSSwitch
                                        control={control}
                                        name={getUniqueName('isOptionSetting')}
                                        handleChange={(e) => {
                                            if (!e) {
                                                setValue('digipop.optionalSetting', {
                                                    ...initialOptionalSetting,
                                                });
                                            }
                                            clearErrors('digipop.optionalSetting');
                                        }}
                                    /> */}
                                    {/* <div className="form-group mt30">
                                        <Row>
                                            <Col sm={3} className="d-flex">
                                                <h3 className="mr15">Optional setting</h3>
                                                <RSSwitch
                                                    control={control}
                                                    name={getUniqueName('isOptionSetting')}
                                                    handleChange={(e) => {
                                                        if (!e) {
                                                            setValue('digipop.optionalSetting', {
                                                                ...initialOptionalSetting,
                                                            });
                                                        }
                                                        clearErrors('digipop.optionalSetting');
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div> */}
                                </>
                            )}
                            {/* {watchDigipop?.isOptionSetting && <OptionalSetting />} */}
                        </Row>
                    </div>
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        type="button"
                        blockInteraction={isSaveLoading}
                        onClick={() => {
                            if (isSaveLoading) return;
                            handleCancel(true);
                        }}
                        id="rs_DigiPopCreate_Cancel"
                    >
                        Cancel
                    </RSSecondaryButton>
                    {addAccess && (
                        <RSPrimaryButton
                            type="submit"
                            isLoading={isSaveLoading}
                            className={`   `}
                            id="rs_DigiPopCreate_Save"
                        >
                            {isUpdate ? 'Update' : 'Save'}
                        </RSPrimaryButton>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

export default DigiPopCreate;
