import { useState, useEffect } from 'react';

const QuestionRenderer = ({ question, value, onChange, error, captchaValidation }) => {
    const [captchaCode, setCaptchaCode] = useState('');

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    useEffect(() => {
        if (question.type === 'captcha' && !captchaCode) {
            const newCode = generateCaptcha();
            setCaptchaCode(newCode);
            // Store the code for validation
            if (captchaValidation) {
                captchaValidation.setCode(newCode);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question.type]);

    const handleRefreshCaptcha = () => {
        const newCode = generateCaptcha();
        setCaptchaCode(newCode);
        // Update the code for validation
        if (captchaValidation) {
            captchaValidation.setCode(newCode);
        }
        onChange(question.id, '');
    };

    switch (question.type) {
        case 'heading':
            return (
                <div className="survey-heading">
                    <p>{question.text}</p>
                </div>
            );

        case 'section_heading':
            return (
                <div className="question-section-heading">
                    <h4>{question.text}</h4>
                </div>
            );

        case 'description':
            return (
                <div className="question-description">
                    <p>{question.text}</p>
                </div>
            );

        case 'short_text':
        case 'email':
            return (
                <div className={`question-group ${error ? 'error' : ''}`}>
                    <div className="row">
                        <div className="col-5">
                            <label className="question-label">
                                {question.label}
                                {question.required && <span className="required">*</span>}
                            </label>
                        </div>
                        <div className="col-7">
                            {error && <div className="error-message">{error}</div>}
                            <input
                                type={question.type === 'email' ? 'email' : 'text'}
                                className="form-control short-text-input"
                                value={value || ''}
                                placeholder={question.placeholder || ''}
                                onChange={(e) => onChange(question.id, e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            );

        case 'checkbox_group':
            return (
                <div className={`question-group ${error ? 'error' : ''}`}>
                    <div className="row">
                        <div className="col-5">
                            <label className="question-label">
                                {question.label}
                                {question.required && <span className="required">*</span>}
                            </label>
                        </div>
                        <div className="col-7">
                            {error && <div className="error-message">This field is required</div>}
                            <div className="checkbox-group">
                                {question.options.map((opt) => (
                                    <div key={opt} className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            id={`${question.id}-${opt}`}
                                            className="survey-check-input"
                                            checked={value?.includes(opt) || false}
                                            onChange={(e) => {
                                                const currentValues = value || [];
                                                const newValues = e.target.checked
                                                    ? [...currentValues, opt]
                                                    : currentValues.filter((v) => v !== opt);
                                                onChange(question.id, newValues);
                                            }}
                                        />
                                        <label htmlFor={`${question.id}-${opt}`} className="form-check-label">
                                            {opt}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'radio':
            return (
                <div className={`question-group ${error ? 'error' : ''}`}>
                    <div className="row">
                        <div className="col-5">
                            <label className="question-label">
                                {question.label}
                                {question.required && <span className="required">*</span>}
                            </label>
                        </div>
                        <div className="col-7">
                            {error && <div className="error-message">This field is required</div>}
                            <div className="radio-group">
                                {question.options.map((opt) => (
                                    <div key={opt} className="radio-option">
                                        <input
                                            type="radio"
                                            id={`${question.id}-${opt}`}
                                            name={question.id}
                                            value={opt}
                                            checked={value === opt}
                                            onChange={() => onChange(question.id, opt)}
                                        />
                                        <label htmlFor={`${question.id}-${opt}`}>{opt}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'textarea':
            return (
                <div className={`question-group ${error ? 'error' : ''}`}>
                    <div className="row">
                        <div className="col-5">
                            <label className="question-label">
                                {question.label}
                                {question.required && <span className="required">*</span>}
                            </label>
                        </div>
                        <div className="col-7">
                            {error && <div className="error-message">This field is required</div>}
                            <textarea
                                className="form-control"
                                value={value || ''}
                                maxLength={question.maxLength}
                                placeholder={question.placeholder || 'Enter your response...'}
                                onChange={(e) => onChange(question.id, e.target.value)}
                            />
                            <div className="char-counter">
                                <span>{value?.length || 0}</span>/{question.maxLength}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'checkbox':
            return (
                <div className={`question-group ${error ? 'error' : ''}`}>
                    <div className="row">
                        <div className="col-5">
                            <label className="question-label"></label>
                        </div>
                        <div className="col-7">
                            {error && (
                                <div className="error-message checkbox-error-message">This field is required</div>
                            )}
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    id={question.id}
                                    className="survey-check-input"
                                    checked={!!value}
                                    onChange={(e) => onChange(question.id, e.target.checked)}
                                />
                                <label htmlFor={question.id} className="form-check-label">
                                    {question.label} {question.required && <span className="required">*</span>}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'captcha':
            return (
                <div className={`question-group ${error ? 'error' : ''}`}>
                    <div className="row">
                        <div className="col-5">
                            <label className="question-label">
                                {question.label}
                                {question.required && <span className="required">*</span>}
                            </label>
                        </div>
                        <div className="col-7">
                            {error && <div className="error-message">{error}</div>}
                            <div className="captcha-container">
                                <div className="captcha-display">
                                    <span className="captcha-code">{captchaCode}</span>
                                    <button
                                        type="button"
                                        className="captcha-refresh"
                                        onClick={handleRefreshCaptcha}
                                        aria-label="Refresh captcha"
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M13.65 2.35C12.2 0.9 10.21 0 8 0C3.58 0 0.01 3.58 0.01 8C0.01 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="form-control captcha-input"
                                    value={value || ''}
                                    placeholder={question.placeholder || 'Enter the captcha'}
                                    onChange={(e) => {
                                        const inputValue = e.target.value.toUpperCase();
                                        onChange(question.id, inputValue);
                                    }}
                                    maxLength={6}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'rating':
            return (
                <div className={`question-group ${error ? 'error' : ''}`}>
                    <div className="row">
                        <div className="col-5">
                            <label className="question-label">
                                {question.label}
                                {question.required && <span className="required">*</span>}
                            </label>
                        </div>
                        <div className="col-7">
                            {error && <div className="error-message">This field is required</div>}
                            <div className="rating-scale">
                                {question.options.map((opt) => (
                                    <div key={opt} className="rating-option">
                                        <input
                                            type="radio"
                                            id={`${question.id}-${opt}`}
                                            name={question.id}
                                            value={opt}
                                            checked={value === opt}
                                            onChange={() => onChange(question.id, opt)}
                                        />
                                        <label htmlFor={`${question.id}-${opt}`}>{opt}</label>
                                    </div>
                                ))}
                            </div>
                            {question.ratingLabels && (
                                <div className="rating-labels">
                                    <span>{question.ratingLabels.min}</span>
                                    <span>{question.ratingLabels.max}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );

        default:
            return (
                <div className={`question-group ${error ? 'error' : ''}`}>
                    <div className="row">
                        <div className="col-5">
                            <label className="question-label">
                                {question.label}
                                {question.required && <span className="required">*</span>}
                            </label>
                        </div>
                        <div className="col-7">
                            {error && <div className="error-message">This field is required</div>}
                            <input
                                type={question.type}
                                className="form-control"
                                value={value || ''}
                                placeholder={question.placeholder || ''}
                                onChange={(e) => onChange(question.id, e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            );
    }
};

export default QuestionRenderer;
