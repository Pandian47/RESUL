import { MAX_LENGTH250 } from 'Constants/GlobalConstant/Regex';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import RSTextarea from 'Components/FormFields/RSTextarea';

// Helper function to parse HTML and extract metadata
const parseHtmlMetadata = (htmlString) => {
    if (!htmlString) return {};
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Extract title
    const title = doc.querySelector('title')?.textContent || '';
    
    // Extract description from meta tag
    const descriptionMeta = doc.querySelector('meta[name="description"]');
    const description = descriptionMeta?.getAttribute('content') || '';
    
    // Extract keywords from meta tag
    const keywordsMeta = doc.querySelector('meta[name="keywords"]');
    const keywords = keywordsMeta?.getAttribute('content') || '';
    
    // Extract favicon
    const faviconLink = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    const favicon = faviconLink?.getAttribute('href') || '';
    
    // Extract header code (everything in <head>)
    const headElement = doc.querySelector('head');
    const headerCode = headElement ? headElement.innerHTML : '';
    
    // Extract footer code (scripts at end of body or specific footer scripts)
    const bodyElement = doc.querySelector('body');
    const footerScripts = bodyElement?.querySelectorAll('script[data-footer="true"], script:last-of-type');
    let footerCode = '';
    if (footerScripts && footerScripts.length > 0) {
        footerCode = Array.from(footerScripts).map(script => script.outerHTML).join('\n');
    }
    
    return {
        title,
        description,
        keywords,
        favicon,
        headerCode,
        footerCode,
    };
};

const SettingModal = ({ show, handleClose, templateName, landingPageTemplateId, list }) => {
    const { handleSubmit, trigger, control, getValues, setError, clearErrors, reset } = useForm();
    const [isShow, setIsShow] = useState(false);
    useEffect(() => {
        setIsShow(show);
        clearErrors();
        
        // Initialize form with existing template data when modal opens
        if (show && list) {
            // Try to get data from direct properties first, then parse HTML
            const htmlData = parseHtmlMetadata(list.html || list.emailhtml);
            
            reset({
                templateTitle: list.pageTitle || list.templateTitle || htmlData.title || '',
                templatedescription: list.pageDescription || list.templatedescription || htmlData.description || '',
                templateSocialIcon: list.pageKeywords || list.templateSocialIcon || htmlData.keywords || '',
                templateFavIcon: list.faviconURL || list.templateFavIcon || htmlData.favicon || '',
                templateHeaderCode: '',
                templateFooterCode: '',
            });
        }
    }, [show, list, reset]);
    const handleSave = (data) => {
            };
    return (
        <RSModal
            show={isShow}
            size="xl"
            header={templateName + '- Settings'}
            handleClose={handleClose}
            isCloseButton={true}
            closeTooltipPosition={true}
            body={
                <form className="page-content-holder" onSubmit={handleSubmit(handleSave)}>
                    <div className="page-content-holder">
                        <div className="form-group mt10">
                            <RSInput
                                control={control}
                                required
                                placeholder={'Page title'}
                                rules={{ required: 'Enter page title' }}
                                name={'templateTitle'}
                                maxlength={MAX_LENGTH250}
                            />
                        </div>
                        <div className="form-group">
                            <RSInput control={control} placeholder={'Keywords'} name={'templateSocialIcon'} />
                        </div>
                        <div className="form-group">
                            <RSInput
                                control={control}
                                required
                                placeholder={'Page description'}
                                name={'templatedescription'}
                                rules={{ required: 'Enter page description' }}
                                maxlength={MAX_LENGTH250}
                            />
                        </div>
                        <div className="form-group">
                            <RSInput control={control} placeholder={'Favicon URL'} name={'templateFavIcon'} />
                        </div>
                        <div className="form-group setting-modal-message">
                            <RSTextarea
                                control={control}
                                required
                                placeholder={'Header code'}
                                name={'templateHeaderCode'}
                                rules={{ required: 'Enter header code' }}
                            />
                        </div>
                        <div className="form-group setting-modal-message">
                            <RSTextarea
                                control={control}
                                required
                                placeholder={'Footer code'}
                                rules={{ required: 'Enter footer code' }}
                                name={'templateFooterCode'}
                            />
                        </div>

                        <div className="buttons-holder">
                            <RSSecondaryButton onClick={handleClose}>Cancel</RSSecondaryButton>
                            <RSPrimaryButton type="submit">Save</RSPrimaryButton>
                        </div>
                    </div>
                </form>
            }
        />
    );
};

export default SettingModal;
