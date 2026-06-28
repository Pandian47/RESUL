import { encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { LAST30DAYS_DATEFILTER, MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { SELECT_CATEGORY } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { ADD_NEW_CATEGORY, ALL_TEMPLATE, CANCEL, SAVE, TEMPLATE_CATEGORY, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import ListNameExists from 'Components/ListNameExists';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import {
    templateDuplicate_aiBuilder,
    aiemailBuilder_nameExisit,
    templateGalleryListApi_AI,
} from 'Reducers/preferences/EmailBuilder/request';
import { TEMPLATE_BUILDER_CHANNEL_ID } from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/constants';

import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const TemplateModal = ({ show, handleClose, templateName, setIsDuplicate, onManageCategoriesClick, templateData }) => {
    const [isValidListname, setIsValidListname] = useState(false);
    const methods = useForm({
        defaultValues: {
            templateName: '',
            templateCategory: ''
        }
    });
    const {
        control,
        reset,
        handleSubmit,
        watch,
        unregister,
        setValue,
        getValues,
        trigger,
        setError,
        clearErrors,
        setFocus,
        formState: { isDirty, isValid },
    } = methods;
    const navigate = useNavigate();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const campaignLocation = useQueryParams('/communication');

    const [categoriesData, setCategoriesData] = useState([]);
    const [isShow, setIsShow] = useState(false);
    const templateCategories = useSelector((state) => state.emailBuilderReducer.templateCategories);
    const duplicateApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDuplicating = duplicateApi.isFetching;
    const isLoadingListName = watch('isLoadingListName');
    const isSubmitting = isDuplicating || isLoadingListName;

    const dispatch = useDispatch();

    useEffect(() => {
        setIsShow(show?.show);
        if (show?.show) {
            setCategoriesData(templateCategories);
            clearErrors();
            setIsValidListname(false);
        }
    }, [show, templateCategories]);

    useEffect(() => {
        if (isShow) {
            setTimeout(() => {
                setFocus('templateName');
            }, 200);
        }
    }, [isShow]);
    const handleSave = (data) => {
        if (data.templateName !== '' && data?.templateCategory !== '') {
            handleDirect();
        } else if (data?.templateCategory === '') {
            setError('templateCategory', {
                type: 'custom',
                message: SELECT_CATEGORY,
            });
        } else {
            trigger();
        }
    };

    const handleDirect = async () => {
        let value = getValues('templateName');
        let temp_templateCategory = getValues('templateCategory');

        let params = {
            campaignId: 0,
            channelId: 1,
            templateId: templateName?.list?.edmTemplateId || 0,
            segList: 0,
            name: value || '',
            SplitType: '',
            channelDetailId: 0,
            departmentId,
            clientId,
            userId,
            edmChannelId: 0,
        };

        let paramsduplicate = {
            channelId: 1,
            templateId: templateName?.list?.edmTemplateId || 0,
            templateName: value || '',
            departmentId,
            clientId,
            userId,
        };
        if (show?.mode === 'duplicate') {
            if (temp_templateCategory === '') {
                setError('templateCategory', {
                    type: 'custom',
                    message: SELECT_CATEGORY,
                });
                return;
            }
            if (isDuplicating) return;
            const payload = {
                departmentId,
                clientId,
                userId,
                templateId: templateName?.list?.templateID || 0,
                templateCategoryType: temp_templateCategory?.templateCategoryId || 0,
                templateName: getValues('templateName'),
                channelId: TEMPLATE_BUILDER_CHANNEL_ID.EMAIL,
            };
            const res = await duplicateApi.refetch({
                fetcher: () => dispatch(templateDuplicate_aiBuilder(payload, { loading: false })),
                loaderConfig: fieldLoaderConfig,
                mode: 'create',
            });
            if (res?.status) {
                const payload = {
                    departmentId,
                    clientId,
                    userId,
                    channelId: 1,
                    templatecategory: ALL_TEMPLATE,
                    pagination: {
                        pageNo: 1,
                        recordLimit: 4,
                    },
                    isFilter: false,
                    filteration: {
                        templateName: '',
                        startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                        endDate: getYYMMDD(new Date()),
                        templateCategoryId: '',
                    },
                };
                setIsDuplicate(true);
                handleClose();
                dispatch(templateGalleryListApi_AI({ ...payload }));
            }
        } else {
            let channelDetails = JSON.stringify(params);
            const token = localStorage.getItem('accessToken');
            let fromEnvi = location.href;
            const state = {
                mode: 'add',
                templateName: value,
                templateCategoryType: temp_templateCategory || 0,
                templateDate: new Date(),
                ...(campaignLocation?.startDate && { startDate: campaignLocation.startDate }),
                ...(campaignLocation?.endDate && { endDate: campaignLocation.endDate }),
                ...(templateData && { data: templateData }),
            };
            const encryptState = encodeUrl(state);
            navigate(`/preferences/template-gallery/email-builder?q=${encryptState}`, {
                state,
            });
            handleClose();
            //     state: { mode: 'add', templateName: value, category: 'Promotion' },
            // });
            // window.location.href = `${baseURL}${'CommunicationEDMTemplate/TemplateBuilder'}?accessToken=${encodeURIComponent(
            //     token,
            // )}&ChannelDetails=${encodeURIComponent(channelDetails)}&from=${fromEnvi}`;
        }
    };

    return (
        <FormProvider {...methods}>
            <RSModal
                show={isShow}
                size="md"
                header={TEMPLATE_NAME}
                isCloseDisabled={isDuplicating}
                handleClose={() => {
                    if (isSubmitting) return;
                    setValue('templateName', '')
                    setValue('templateCategory', '')
                    clearErrors();
                    setIsValidListname(false);
                    handleClose();
                }}
                isCloseButton={true}
                body={
                    <form className="page-content-holder">
                        <div className="page-content-holder">
                            <div className="form-group">
                                {/* <RSInput
                                type={'text'}
                                name={'templateName'}
                                placeholder={TEMPLATE_NAME}
                                control={control}
                                required
                                rules={{ required: TEMPLATE_NAME }}
                            /> */}

                                <ListNameExists
                                    name="templateName"
                                    field="templateName"
                                    maxLength={MAX_LENGTH}
                                    apiCallback={aiemailBuilder_nameExisit}
                                    onValid={(valid) => setIsValidListname(valid)}
                                    condition={({ status }) => {
                                                                                return !status;
                                    }}
                                    defaultValue={templateName?.name}
                                    extraPayload={{ channelId: 1 }}
                                    placeholder={TEMPLATE_NAME}
                                    rules={LIST_NAME_RULES(TEMPLATE_NAME)}
                                    customErrorMessage={TEMPLATE_NAME}
                                />
                            </div>
                            <div className="form-group mb0">
                                <RSKendoDropDown
                                    control={control}
                                    name="templateCategory"
                                    data={categoriesData}
                                    textField="categoryName"
                                    dataItemKey="templateCategoryId"
                                    required
                                    label={TEMPLATE_CATEGORY}
                                    rules={{
                                        required: SELECT_CATEGORY,
                                    }}
                                    popupSettings={{
                                        popupClass: `addImportAudienceDropdownListContainer`,
                                    }}
                                    footer={
                                        <RSDropdownFooterBtn
                                            title={ADD_NEW_CATEGORY}
                                            handleClick={() => {
                                                handleClose();
                                                onManageCategoriesClick();
                                            }}
                                        />
                                    }
                                    // defaultValue={builderCategory[0]}
                                />
                            </div>
                        </div>
                    </form>
                }
                footer={
                    <>
                        <RSSecondaryButton
                            blockInteraction={isSubmitting}
                            onMouseDown={() => {
                                if (isSubmitting) return;
                                setValue('templateName', '')
                                setValue('templateCategory', '')
                                clearErrors();
                                setIsValidListname(false);
                                handleClose();
                            }}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="submit"
                            onClick={handleSubmit(handleSave)}
                            className={isValidListname ? '' : 'click-off'}
                            isLoading={isDuplicating}
                            blockBodyPointerEvents={isDuplicating}
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    </>
                }
            />
        </FormProvider>
    );
};

export default TemplateModal;

