import { useEffect, useState, useRef } from 'react';
import ProgressBar from './progressbar';
import QuestionRenderer from './question';
import { fetchSurveySchema, submitSurvey } from './surveyapi';

const SurveyForm = ({ onSuccess }) => {
    const [schema, setSchema] = useState(null);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const captchaCodeRef = useRef('');

    useEffect(() => {
        fetchSurveySchema().then(setSchema);
    }, []);

    if (!schema) return <div>Loading...</div>;

    const allQuestions = schema.sections.flatMap((s) => s.questions);

    // Filter out non-input question types for progress tracking
    const inputQuestions = allQuestions.filter((q) => !['heading', 'section_heading', 'description'].includes(q.type));

    const completedCount = inputQuestions.filter((q) => {
        if (q.type === 'checkbox_group') {
            return formData[q.id] && formData[q.id].length > 0;
        }
        return formData[q.id];
    }).length;

    const handleChange = (id, value) => {
        setFormData({ ...formData, [id]: value });
        setErrors({ ...errors, [id]: null });
    };

    const validate = () => {
        const err = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        allQuestions.forEach((q) => {
            // Skip non-input question types
            if (['heading', 'section_heading', 'description'].includes(q.type)) {
                return;
            }

            if (q.required) {
                if (q.type === 'checkbox_group') {
                    // For checkbox groups, check if array has at least one item
                    if (!formData[q.id] || formData[q.id].length === 0) {
                        err[q.id] = 'This field is required';
                    }
                } else if (q.type === 'captcha') {
                    // For CAPTCHA, validate against the generated code
                    if (!formData[q.id]) {
                        err[q.id] = 'Enter the captcha';
                    } else if (formData[q.id] !== captchaCodeRef.current) {
                        err[q.id] = 'Invalid captcha. Try again';
                    }
                } else if (q.type === 'email') {
                    // Validate email field
                    if (!formData[q.id]) {
                        err[q.id] = 'This field is required';
                    } else if (!emailRegex.test(formData[q.id])) {
                        err[q.id] = 'Enter a valid email address';
                    }
                } else {
                    // For other types, check if value exists
                    if (!formData[q.id]) {
                        err[q.id] = 'This field is required';
                    }
                }
            }
        });
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            // Scroll to first error
            setTimeout(() => {
                const firstError = document.querySelector('.question-group.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }

        await submitSurvey(formData);
        onSuccess();
    };

    if (submitted) {
        return <h2>Thank you for your feedback!</h2>;
    }

    const captchaValidation = {
        setCode: (code) => {
            captchaCodeRef.current = code;
        },
    };

    return (
        <form onSubmit={handleSubmit} className="survey-form" id="survey-form">
            <ProgressBar completed={completedCount} total={inputQuestions.length} />
            <input type="hidden" value="[[emailid]]" id="hdnrid" name="rid"></input>
            {schema.sections.map((section) => (
                <div key={section.id} className="form-section">
                    {section.title && <h3 className="section-title">{section.title}</h3>}
                    {section.description && <p className="section-description">{section.description}</p>}

                    {section.questions.map((q) => (
                        <QuestionRenderer
                            key={q.id}
                            question={q}
                            value={formData[q.id]}
                            error={errors[q.id]}
                            onChange={handleChange}
                            captchaValidation={captchaValidation}
                        />
                    ))}
                </div>
            ))}
        </form>
    );
};

export default SurveyForm;
