import { HTTPS_REGEX, MAX_LENGTH, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_URL } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, INSERT_LINK } from 'Constants/GlobalConstant/Placeholders';
import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useFormContext } from 'react-hook-form';
const LinkModal = ({ show, onHide, onInsert, currentLabelText = '' }) => {
    const { control, watch, setValue, getValues, setError, clearErrors, formState: { errors } } = useFormContext();

    useEffect(() => {
        if (show) {
            setValue('linkModalText', currentLabelText || '');
            setValue('linkModalUrl', '');
            setValue('linkModalNewTab', true);
        }
    }, [show, currentLabelText, setValue]);

    const handleInsert = () => {
        const linkText = getValues('linkModalText');
        const linkUrl = getValues('linkModalUrl');
        const openInNewTab = getValues('linkModalNewTab');
        
        // Validate URL
        if (linkUrl && linkUrl.trim()) {
            const urlPattern = HTTPS_REGEX;
            if (!urlPattern.test(linkUrl)) {
                setError('linkModalUrl', {
                    type: 'pattern',
                    message: ENTER_VALID_URL,
                });
                return;
            }
        }
        
        if (linkUrl && linkUrl !== 'https://' && linkText) {
            const target = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
            const linkHtml = `<a href="${linkUrl}"${target}>${linkText}</a>`;
            onInsert(linkHtml);
            onHide();
        }
    };

    const handleCancel = () => {
        setValue('linkModalText', '');
        setValue('linkModalUrl', 'https://');
        setValue('linkModalNewTab', true);
        clearErrors('linkModalUrl');
        onHide();
    };

    return (
        <RSModal
            show={show}
            size="md"
            header={"Insert hyperlink"}
            isCloseButton={true}
            handleClose={handleCancel}
            className='formBuilder'
            body={
                <Container>
                   
                    
                    <div className="position-relative form-group ">
                        <RSInput
                            name="linkModalUrl"
                            control={control}
                            maxLength={MAX_LENGTH75}
                            label="Web address"
                            rules={{
                                pattern: {
                                    value: HTTPS_REGEX,
                                    message: ENTER_VALID_URL,
                                },
                            }}
                        />
                    </div>
                     <div className="position-relative form-group mb0">
                        <RSInput
                            name="linkModalText"
                            control={control}
                            maxLength={MAX_LENGTH}
                            label="Title"
                            defaultValue={currentLabelText || ''}
                        />
                    </div>
                    
                    <div className="position-relative">
                        <RSCheckbox
                            name="linkModalNewTab"
                            control={control}
                            labelName="Open in new tab"
                        />
                    </div>
                </Container>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={handleCancel}>
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton 
                        onClick={handleInsert}
                        disabled={errors?.linkModalUrl}
                    >
                        {INSERT_LINK || 'Insert Link'}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default LinkModal;

