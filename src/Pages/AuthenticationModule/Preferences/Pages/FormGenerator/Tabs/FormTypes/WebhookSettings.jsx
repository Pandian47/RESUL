import { HTTPS_REGEX, MAX_LENGTH, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_URL } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, REDIRECTING_AND_WEBHOOK_CONFIGURATION, REDIRECTING_CONFIGURATION, SAVE, WEBHOOK_SETTINGS_HELP_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getExtendedSystem } from 'Reducers/preferences/FormGenerator/request';

export const WebhookSettings = ({ show, handleClose, dispatchState, tag }) => {
    const { control, handleSubmit, setValue, clearErrors, setError, getValues, watch, formState: { errors } } = useFormContext();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [url, setUrl] = useState(getValues('webHookURL'));
    const [redirectUrl, setRedirectUrl] = useState(getValues('redirectURL') || '');
    const [redirectTitle, setRedirectTitle] = useState(getValues('redirectTitle') || 'Submit');
    const [openInNewTab, setOpenInNewTab] = useState(getValues('redirectOpenInNewTab') || false);
    const [webhookList, setWebhookList] = useState([]);

    // Watch for URL changes and clear errors
    const watchedRedirectUrl = watch('redirectURL');

    useEffect(() => {
        if (watchedRedirectUrl && errors?.redirectURL) {
            // Only clear error if the URL is now valid
            const urlPattern = HTTPS_REGEX;
            if (urlPattern.test(watchedRedirectUrl)) {
                clearErrors('redirectURL');
            }
        }
    }, [watchedRedirectUrl, errors?.redirectURL, clearErrors]);

    useEffect(() => {
        if (show && tag !== 'Survey' && departmentId && clientId && userId) {
            const fetchWebhooks = async () => {
                const payload = {
                    departmentId,
                    clientId,
                    userId,
                    type: 'W'
                };
                const response = await dispatch(getExtendedSystem(payload));
                if (response?.status && response?.data) {
                                        const transformedData = Array.isArray(response?.data)
                        ? response?.data?.map(item => ({
                            ...item,
                            webHookName: item.webHookName || ''
                        }))
                        : [];
                    setWebhookList(transformedData);
                }
            };
            fetchWebhooks();
        }
    }, [show, tag, departmentId, clientId, userId, dispatch]);

    // Pre-fill redirect fields when modal opens
    useEffect(() => {
        if (show) {
            const currentRedirectUrl = getValues('redirectURL') || '';
            const currentRedirectTitle = getValues('redirectTitle') || 'Submit';
            const currentOpenInNewTab = getValues('redirectOpenInNewTab') || false;

            setRedirectUrl(currentRedirectUrl);
            setRedirectTitle(currentRedirectTitle);
            setOpenInNewTab(currentOpenInNewTab);
        }
    }, [show, getValues]);

    const onSave = () => {
        const formData = {
            url: getValues('redirectURL'),
            title: getValues('redirectTitle'),
            openInNewTab: getValues('redirectOpenInNewTab')
        };

        // Get the current Submit button's visible text (strip any existing HTML tags)
        const currentSubmit = getValues('Submit') || '';
        const currentVisibleText = currentSubmit.replace(/<[^>]*>/g, '').trim() || formData?.title || '';

        let newSubmitText = currentVisibleText;

        // Validate redirect URL if it's provided
        if (formData.url && formData.url.trim()) {
            const urlPattern = HTTPS_REGEX;
            if (!urlPattern.test(formData.url)) {
                setError('redirectURL', {
                    type: 'pattern',
                    message: ENTER_VALID_URL,
                });
                return; // Stop execution if redirect URL is invalid
            }

            const target = formData.openInNewTab ? ' target="_blank"' : '';
            // Use redirectTitle as the title attribute; keep existing visible text as anchor text
            const titleAttr = formData.title?.trim() ? ` title="${formData.title.trim()}"` : '';
            newSubmitText = `<a href="${formData.url}"${target}${titleAttr}>${currentVisibleText}</a>`;
        }

        // Update the submit button text (either plain text or hyperlink)
        setValue('Submit', newSubmitText);

        // Update the dispatch state as well
        dispatchState({
            type: 'UPDATE',
            field: 'Submit',
            payload: newSubmitText,
        });

        // Save local state for restoration on cancel
        setUrl(getValues('webHookURL'));
        setRedirectUrl(getValues('redirectURL'));
        setRedirectTitle(getValues('redirectTitle'));
        setOpenInNewTab(getValues('redirectOpenInNewTab'));

        dispatchState({
            type: 'UPDATE',
            field: 'webHookPopup',
            payload: false,
        });
    };
    return (
        <RSModal
            show={show}
            size="md"
            header={<div className='d-flex gap-2'>
                {tag === 'Survey' ? REDIRECTING_CONFIGURATION : REDIRECTING_AND_WEBHOOK_CONFIGURATION}
                {tag !== 'Survey' && (
                    <RSTooltip text={WEBHOOK_SETTINGS_HELP_TEXT} position={'top'}>
                        <i className={`${circle_question_mark_mini} color-primary-blue icon-xs`} />
                    </RSTooltip>
                )}
            </div>}
            handleClose={() => {
                handleClose();
                setValue('webHookURL', url);
                setValue('redirectURL', redirectUrl);
                setValue('redirectTitle', redirectTitle);
                setValue('redirectOpenInNewTab', openInNewTab);
            }}
            body={
                <Container>
                    {tag !== 'Survey' && (
                        <div className="position-relative form-group">
                            <RSKendoDropdown
                                name="webHookURL"
                                control={control}
                                data={webhookList}
                                textField="webHookName"
                                dataItemKey="webHookSettingId"
                                label="Webhook name"
                                placeholder="Select webhook name"
                            />
                        </div>
                    )}

                    <div className="position-relative form-group">
                        <RSInput
                            name="redirectURL"
                            control={control}
                            maxLength={MAX_LENGTH75}
                            label="Form redirect URL"
                            placeholder="Enter redirect URL"
                            rules={{
                                pattern: {
                                    value: HTTPS_REGEX,
                                    message: ENTER_VALID_URL,
                                },
                            }}
                        />
                    </div>

                    <div className="position-relative ">
                        <RSInput
                            name="redirectTitle"
                            control={control}
                            maxLength={MAX_LENGTH}
                            label="Link title"
                            placeholder="Enter link title"
                            defaultValue="Submit"
                        />
                    </div>

                    <div className="position-relative ">
                        <RSCheckbox
                            name="redirectOpenInNewTab"
                            control={control}
                            labelName="Open link in new tab"
                            defaultValue={false}
                        />
                    </div>
                </Container>
            }
            footer={
                <>
                    <RSSecondaryButton
                        onClick={() => {
                            handleClose();
                            setValue('webHookURL', url);
                            setValue('redirectURL', redirectUrl);
                            setValue('redirectTitle', redirectTitle);
                            setValue('redirectOpenInNewTab', openInNewTab);
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => onSave()}
                        disabled={errors?.redirectURL}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};
