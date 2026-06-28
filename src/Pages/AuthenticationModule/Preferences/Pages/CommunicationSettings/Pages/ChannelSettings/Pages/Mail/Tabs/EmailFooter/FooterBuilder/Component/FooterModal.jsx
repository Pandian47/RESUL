import { encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { LAST30DAYS_DATEFILTER, MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_FOOTER as ENTER_FOOTER_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { CANCEL, ENTER_FOOTER, SAVE, TEMPLATE_CATEGORY, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { getEmailFooterNameExist } from 'Reducers/preferences/CommunicationSettings/request';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import ListNameExists from 'Components/ListNameExists';
import { templateDuplicate_aiBuilder, templateGalleryListApi_AI } from 'Reducers/preferences/EmailBuilder/request';


import predefinedFooterData from '../EmailFooterPredefined.json';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const FooterModal = ({ show, handleClose, templateName, setIsDuplicate, from = 'template' }) => {
    const [isValidListname, setIsValidListname] = useState(false);
    const methods = useForm();
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
        formState: { isDirty, isValid, errors },
    } = methods;
        // const { handleSubmit, trigger, control, getValues } = useForm();
    const navigate = useNavigate();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [categoriesData, setCategoriesData] = useState([]);
    const [isShow, setIsShow] = useState(false);
    const duplicateApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDuplicating = duplicateApi.isFetching;
    const isLoadingListName = watch('isLoadingListName');
    const isSubmitting = isDuplicating || isLoadingListName;

    const dispatch = useDispatch();

    const locationState = useQueryParams('/preferences/communication-settings');

    useEffect(() => {
        setIsShow(show?.show);
        if (show?.show) {
            handleCategories();
            reset();
            clearErrors();
            setIsValidListname(false);
        }
    }, [show]);

    const handleSave = async (data) => {
                if (data.footerName !== '') {
            try {
                // Clear any existing errors for footerName
                clearErrors('footerName');

                                const payload = {
                    footerName: data.footerName,
                    channelId: 1,
                    departmentId,
                    clientId,
                    userId,
                };

                const response = await dispatch(
                    getEmailFooterNameExist({
                        payload,
                        setError,
                        name: 'footerName',
                    }),
                );

                                if (response?.status) {
                    // Name exists, error is already set by the API function
                    return;
                }

                // Name doesn't exist, proceed with save
                await handleDirect();
            } catch (error) {
                setError('footerName', {
                    type: 'server',
                    message: 'Error validating footer name',
                });
            }
        } else {
            trigger();
        }
    };
    const handleCategories = async () => {
        // const payload = {
        //     departmentId,
        //     clientId,
        //     userId,
        // };
        // let { status, data } = await dispatch(templateCategoryListApi_AI(payload));
        // if (status) {
        //     setCategoriesData(data);
        // } else {
        //     setCategoriesData([]);
        // }
    };

    const handleDirect = async () => {
        let value = getValues('footerName');
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
                    message: 'Select category',
                });
                return;
            }
            const payload = {
                departmentId,
                clientId,
                userId,
                templateId: templateName?.list?.templateID || 0,
                templateCategoryType: temp_templateCategory?.templateCategoryId || 0,
                templateName: getValues('templateName'),
            };
            if (isDuplicating) return;
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
                    templatecategory: 'All template',
                    pagination: {
                        pageNo: 1,
                        recordLimit: 4,
                    },
                    isFilter: false,
                    filteration: {
                        templateName: '',
                        startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                        endDate: getYYMMDD(new Date()),
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
            const footerData = JSON.stringify(predefinedFooterData);
            let state = {
                mode: 'add',
                templateName: value,
                templateCategoryType: temp_templateCategory || 0,
                templateDate: new Date(),
                data: footerData,
            };

            if (locationState?.from === 'communication') {
                state = {
                    ...state,
                    communicationState: {
                        ...locationState,
                    },
                };
            }

            const encryptState = encodeUrl(state);

            const navigationPath =
                from === 'footer'
                    ? `/preferences/communication-settings/footer-builder?q=${encryptState}`
                    : `/preferences/template-gallery/email-builder?q=${encryptState}`;

            navigate(navigationPath, {
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
                header={ENTER_FOOTER}
                isCloseDisabled={isDuplicating}
                handleClose={() => {
                    if (isSubmitting) return;
                    reset();
                    clearErrors();
                    setIsValidListname(false);
                    handleClose();
                }}
                isCloseButton={locationState?.campaignId ? false : true}
                body={
                    <form className="page-content-holder" onSubmit={handleSubmit(handleSave)}>
                        <div className="page-content-holder">
                            <>
                                {/* <RSInput
                                type={'text'}
                                name={'templateName'}
                                placeholder={TEMPLATE_NAME}
                                control={control}
                                required
                                rules={{ required: TEMPLATE_NAME }}
                            /> */}

                                <ListNameExists
                                    name="footerName"
                                    field="footerName"
                                    maxLength={MAX_LENGTH}
                                    apiCallback={getEmailFooterNameExist}
                                    onValid={(valid) => setIsValidListname(valid)}
                                    condition={({ status }) => {
                                                                                if (!status) clearErrors();
                                        return !status;
                                    }}
                                    defaultValue={templateName?.name}
                                    extraPayload={{ channelId: 1 }}
                                    placeholder={ENTER_FOOTER}
                                    rules={LIST_NAME_RULES(ENTER_FOOTER_MSG)}
                                    customErrorMessage={ENTER_FOOTER_MSG}
                                />
                            </>
                            {/* <div className="form-group mb0">
                                <RSKendoDropDown
                                    control={control}
                                    name="templateCategory"
                                    data={categoriesData}
                                    textField="categoryName"
                                    dataItemKey="templateCategoryId"
                                    required
                                    label={TEMPLATE_CATEGORY}
                                    // defaultValue={builderCategory[0]}
                                />
                            </div> */}
                        </div>
                    </form>
                }
                footer={
                    <>
                        {!locationState?.campaignId && (
                            <RSSecondaryButton
                                blockInteraction={isSubmitting}
                                onMouseDown={() => {
                                    if (isSubmitting) return;
                                    reset();
                                    clearErrors();
                                    setIsValidListname(false);
                                    handleClose();
                                }}
                            >
                                {CANCEL}
                            </RSSecondaryButton>
                        )}
                        <RSPrimaryButton
                            type="submit"
                            onClick={handleSubmit(handleSave)}
                            disabledClass={isValidListname ? '' : 'pe-none click-off'}
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

export default FooterModal;

