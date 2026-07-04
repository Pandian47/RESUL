import { REFRESH } from 'Constants/GlobalConstant/Placeholders';
import { recycle_large, refresh_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useEffect, useRef } from 'react';
import { RANDOMCHAR } from 'Utils/modules/passwordUtils';
import { getEnvironment } from 'Utils/modules/environment';
import RSInput from 'Components/FormFields/RSInput';
import { Col, Row } from 'react-bootstrap';

import content from 'Constants/GlobalConstant/Content/content.json';
import { ENTER_CAPTCHA, INVALID_CAPTCHA } from 'Constants/GlobalConstant/ValidationMessage';
import RSTooltip from 'Components/RSTooltip';
export const RSCaptchaGenerator = ({
    control = null,
    isError = false,
    setValue = () => { },
    clearErrors = () => { },
    onValidationChange = () => { },
    setError = () => { },
    isFormsPreviewCaptcha = false,
}) => {
    const [captcha, setCaptcha] = useState('');
    const [attempts, setAttempts] = useState(0);
    const canvasRef = useRef(null);
    const env =  getEnvironment()
    const isRunEnv = env === 'RUN' || false;
    // console.log(import.meta.env.MODE, 'import.meta.env.MODE');


    const generateCaptchaText = () => {
        let uniquechar = '';
        for (let i = 0; i < 5; i++) {
            uniquechar += RANDOMCHAR.charAt(Math.floor(Math.random() * RANDOMCHAR.length));
        }
        return uniquechar;
    };

    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Font styling – CAPTCHA-like
        ctx.font = '17px MuktaLight, sans-serif';
        ctx.fillStyle = '#1a1a1a';
        ctx.textBaseline = 'middle';

        // Variables for spacing and layout
        const startX = 10;
        const centerY = canvas.height / 2;
        const spacing = 20;

        for (let i = 0; i < text.length; i++) {
            const letter = text[i];

            // Optional slight rotation for CAPTCHA effect
            const angle = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2 radians
            ctx.save();
            ctx.translate(startX + i * spacing, centerY);
            ctx.rotate(angle);
            ctx.fillText(letter, 0, 0);
            ctx.restore();
        }
    };



    const generate = () => {
        const newCaptcha = generateCaptchaText();
        setCaptcha(newCaptcha);
        setValue('captcha', '');
        clearErrors('captcha');
        onValidationChange(false);
        setAttempts(0);
        setTimeout(() => drawCaptcha(newCaptcha), 100);
    };

    useEffect(() => {
        generate();
    }, [isError]);

    const handleCaptchaValidation = (e) => {
        const input = e.target.value?.trim();
        const isValid = input === captcha;

        if (!input) {
            setError('captcha', {
                type: 'custom',
                message: ENTER_CAPTCHA,
            });
            onValidationChange(false);
        } else if (!isValid) {
            if (attempts >= 1) {
                const newCaptcha = generateCaptchaText();
                setCaptcha(newCaptcha);
                setTimeout(() => drawCaptcha(newCaptcha), 100);
                setAttempts(0); // Reset attempts for the new captcha
            } else {
                setAttempts(prev => prev + 1);
            }

            setError('captcha', {
                type: 'custom',
                message: INVALID_CAPTCHA,
            });
            onValidationChange(false);
        } else {
            clearErrors('captcha');
            onValidationChange(true);
            setAttempts(0);
        }
    };

    return (
        <Row className="align-items-end">
            {!isFormsPreviewCaptcha && (
                <Col md={7}>
                    <RSInput
                        name={'captcha'}
                        control={control}
                        rules={{
                            required: ENTER_CAPTCHA,
                            validate: (data) => (data !== captcha ? INVALID_CAPTCHA : true),
                        }}
                        placeholder={content.captchaCode}
                        required
                        type="text"
                        handleOnBlur={handleCaptchaValidation}
                        maxLength={5}
                    />
                </Col>
            )}
            <Col md={5} className= {`pl0 ${isFormsPreviewCaptcha ? 'mr27' : ''}`}>
                {isRunEnv  || isFormsPreviewCaptcha ?
                    <div className="captcha-box d-flex align-items-center gap-2">
                        <canvas
                            ref={canvasRef}
                            width={118}
                            height={33}
                            className="border bg-light border-quaternary-blue border-r5"
                        />
                        {!isFormsPreviewCaptcha ? (
                            <div className="d-flex align-items-center justify-content-center">
                                <RSTooltip text={REFRESH} className='position-relative lh0'>
                                    <i
                                        id='rs_data_refresh'
                                        className={`${refresh_medium} icon-md color-primary-blue `}
                                        onClick={generate}
                                    ></i>
                                </RSTooltip>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center justify-content-center">
                                <RSTooltip text={REFRESH} className='position-relative lh0 bg-primary-blue border-r5'>
                                    <i
                                        id='rs_data_refresh'
                                        className={`${recycle_large} icon-lg color-primary-black font-bold color-whites`}
                                    // onClick={generate}
                                    ></i>
                                </RSTooltip>
                            </div>
                        )}
                    </div>
                    : <div className="captcha-box align-items-center d-flex justify-content-center gap10">
                        <div id="image" className="bg-tertiary-grey text-center unselectable w-100">
                            {captcha}
                        </div>
                        <i
                            id='rs_data_refresh'
                            className={`${refresh_medium} icon-md color-primary-blue position-relative`}
                            onClick={generate}
                        ></i>
                    </div>
                }
            </Col>
        </Row>
    );
};
