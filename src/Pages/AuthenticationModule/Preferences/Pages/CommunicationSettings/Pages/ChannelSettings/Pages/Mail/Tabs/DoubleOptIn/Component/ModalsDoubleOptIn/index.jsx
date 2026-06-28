import { CANCEL, CONFIRMATION_URL_TEXT, SAVE, VERIFICATION_TEXT, WELCOME_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import TextEditor from 'Components/TextEditor';
import { useFormContext } from 'react-hook-form';
const ModalsDoubleOptIn = ({ show, handleClose, type, data, handleSaveContent }) => {
    const [isShow, setShow] = useState(show);
    const [currentValue, setCurrentValue] = useState(data);
    const [iniVal, setIniVal] = useState(data);
    const {
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext();

    useEffect(() => {
        setShow(show);
    }, [show]);

    useEffect(() => {
        setCurrentValue(data);
        setIniVal(data);
        clearErrors('content');
    }, [data]);

    const isVerificationMail = type === 'VERIFICATION_MAIL';
    const isEmptyContent = (content) => {
        const trimmedContent = content?.toString().trim();
        return trimmedContent === '' || trimmedContent === '<p></p>' || trimmedContent === '<p><br></p>';
    };

    const handleBlur = (content) => {
        if (isEmptyContent(content)) {
            setCurrentValue('');
        } else {
            setCurrentValue(content);
        }
    };

    const handleChange = (content) => {
        const updatedContent = content?.html || '';
        if (isEmptyContent(updatedContent)) {
            setCurrentValue('');
        } else {
            setCurrentValue(updatedContent);
        }

        if (updatedContent.trim()?.length > 0) {
            clearErrors('content');
        }
    };
    setTimeout(() => {
        const clearAttributeEl = document.querySelector('.clearAttribute');
        if (clearAttributeEl) clearAttributeEl.removeAttribute('tabindex');
    }, 100);

    return (
        <RSModal
            show={isShow}
            handleClose={() => {
                handleClose(false);
                setCurrentValue(iniVal);
                clearErrors('content');
            }}
            size="lg"
            className="clearAttribute"
            header={<>
            {isVerificationMail ? 'Verification email' : 'Welcome note'}
            </>}
            body={
                <Container>
                    <TextEditor value={currentValue ?? ''} onBlurHandler={handleBlur} onChange={handleChange} />
                    {content && (
                        <small className={'color-primary-red position-absolute top-0'}>{content.message}</small>
                    )}
                    {isVerificationMail && (
                        <small className="mt5">
                           {CONFIRMATION_URL_TEXT}
                        </small>
                    )}
                      <div className='align-items-center d-flex mt10'>
                                     <i className={`${circle_info_mini} icon-xs color-primary-blue mr5 cursor-default`}></i>
                    <small> {isVerificationMail ? VERIFICATION_TEXT : WELCOME_TEXT}</small>
                    </div>
                </Container>
            }
            footer={
                <>
                    <RSSecondaryButton
                        onClick={() => {
                            handleClose(false);
                            setCurrentValue(iniVal);
                            clearErrors('content');
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        onClick={() => {
                            if (!currentValue || currentValue.trim() === '') {
                                setError('content', {
                                    type: 'custom',
                                    message: isVerificationMail
                                        ? 'You have to complete the verification email'
                                        : 'You have to complete the welcome email',
                                });
                                return;
                            }
                            handleSaveContent(currentValue);
                            handleClose(true);
                            setIniVal(currentValue);
                        }}
                        // className={Object.keys(errors)?.length > 0 ? 'click-off' : ''}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default ModalsDoubleOptIn;
