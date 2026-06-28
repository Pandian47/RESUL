import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { CANCEL, SAVE, TEMPLATE_NAME, TEMPLATE_NAME_ALREADY_EXISTS } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { templateDuplicate_aiBuilder, aiemailBuilder_nameExisit } from 'Reducers/preferences/EmailBuilder/request';

import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const LandingPageModalDupliacte = ({
    templateName,
    show,
    handleClose,
    fetchList,
    setPayload,
    setPagerPageConfig,
    setIsCloseSearch,
}) => {
    const [isValidListname, setIsValidListname] = useState(false);
    const methods = useForm({
        defaultValues: {
            templateName: '',
        },
    });
    const { handleSubmit, getValues, trigger, setError, clearErrors, setFocus, setValue, watch } = methods;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const disPatch = useDispatch();
    const [isShow, setIsShow] = useState(false);
    const duplicateApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDuplicating = duplicateApi.isFetching;
    const isLoadingListName = watch('isLoadingListName');
    const isSubmitting = isDuplicating || isLoadingListName;

    useEffect(() => {
        const shouldShow = show?.show === true || show === true;
        setIsShow(shouldShow);
        if (shouldShow) {
            clearErrors();
            setIsValidListname(false);
        }
    }, [show]);

    useEffect(() => {
        if (isShow) {
            setTimeout(() => {
                setFocus('templateName');
            }, 200);
        }
    }, [isShow]);

    const handleSave = (data) => {
        if (data.templateName !== '' && isValidListname) {
            handleDuplicate();
        } else {
            trigger();
        }
    };

    const handleDuplicate = async () => {
        if (isDuplicating) return;

        const payload = {
            departmentId,
            clientId,
            userId,
            templateId: templateName?.list?.templateID || 0,
            templateName: getValues('templateName'),
            channelId: 32,
        };
        const res = await duplicateApi.refetch({
            fetcher: () => disPatch(templateDuplicate_aiBuilder(payload, { loading: false })),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (res?.status) {
            if (setPayload && setPagerPageConfig && setIsCloseSearch) {
                setPayload((pre) => ({
                    ...pre,
                    pagination: {
                        pageNo: 1,
                        recordLimit: 4,
                    },
                    isFilter: true,
                    filteration: {
                        templateName: '',
                        startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                        endDate: getYYMMDD(new Date()),
                    },
                }));
                setPagerPageConfig((pre) => ({
                    ...pre,
                    skip: 0,
                    take: 4,
                }));
                setIsCloseSearch(true);
            }
            handleClose();
            if (fetchList) {
                fetchList();
            }
        } else {
            setError('templateName', {
                type: 'custom',
                message: TEMPLATE_NAME_ALREADY_EXISTS,
            });
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
                    setValue('templateName', '');
                    clearErrors();
                    setIsValidListname(false);
                    handleClose();
                }}
                isCloseButton={true}
                body={
                    <form className="page-content-holder">
                        <div className="page-content-holder">
                            <div className="form-group mb0">
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
                                    extraPayload={{ channelId: 32 }}
                                    placeholder={TEMPLATE_NAME}
                                    rules={LIST_NAME_RULES(TEMPLATE_NAME)}
                                    customErrorMessage={TEMPLATE_NAME}
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
                                setValue('templateName', '');
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

export default LandingPageModalDupliacte;
