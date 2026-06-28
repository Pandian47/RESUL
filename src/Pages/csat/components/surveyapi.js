export const fetchSurveySchema = async () => {
    const res = surveySchema; //await fetch("/api/survey/schema");

    //return  res.json();
    return res;
};

export const submitSurvey = async (payload) => {
        const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        // HTML form behavior: checkbox true → "on"
        if (typeof value === 'boolean') {
            formData.append(key, value ? 'on' : '');
        } else {
            formData.append(key, value);
        }
    });

    const res = await fetch(
        'https://forms.resul.io/Subscription/IndexInsertTemp/cust_f464547c_d0b1_4ef7_a91c_a0c5cbc88b2e/14',
        {
            method: 'POST',
            body: formData, //JSON.stringify(payload),
        },
    );
    // return res.json();
};

const surveySchema = {
    title: 'Customer Satisfaction Survey',
    sections: [
        // {
        //   id: "intro",
        //   questions: [
        //     {
        //       id: "intro_text",
        //       type: "heading",
        //       text: "We are collecting our main for the Clients Survey. Kindly Give your feedback."
        //     }
        //   ]
        // },
        // {
        //   id: "personal_info",
        //   questions: [
        //     {
        //       id: "client_name",
        //       type: "text",
        //       label: "1. Your name/name for this survey to be filed",
        //       placeholder: "",
        //       required: true
        //     }
        //   ]
        // },
        {
            id: 'ratings_section',
            questions: [
                // {
                //     id: 'section_heading',
                //     type: 'section_heading',
                //     text: '2. Please fill the following questions:',
                // },
                // {
                //     id: 'main_question',
                //     type: 'description',
                //     text: "Please rate the following on a scale of 1 to 5 (1 being 'Poor' and 5 being 'Excellent')",
                // },
                {
                    id: 'section_heading',
                    type: 'section_heading',
                    text: 'How satisfied are you with RESUL in terms of?',
                },
                {
                    id: 'Question_1',
                    type: 'radio',
                    label: 'A. User experience and navigation',
                    required: true,
                    options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
                    layout: 'horizontal',
                },
                {
                    id: 'Question_2',
                    type: 'radio',
                    label: 'B. Feature and Functions',
                    required: true,
                    options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
                    layout: 'horizontal',
                },
                {
                    id: 'Question_3',
                    type: 'radio',
                    label: 'C. Speed and performance',
                    required: true,
                    options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
                    layout: 'horizontal',
                },
            ],
        },
        {
            id: 'recommendations',
            questions: [
                {
                    id: 'recommendations_text',
                    type: 'section_heading',
                    text: 'Please provide your responses to the following questions:',
                },
                {
                    id: 'Question_4',
                    type: 'radio',
                    label: 'A. How long have you been using RESUL?',
                    required: true,
                    options: ['<= 1 Year', '2-5 Years', '>5 Years'],
                    layout: 'horizontal',
                }, 
                {
                    id: 'Question_5',
                    type: 'checkbox_group',
                    label: 'B. Which three RESUL features are most valuable to you?',
                    required: true,
                    options: ['Target list', 'Dynamic list', 'SDC','MDC/MDC Subsegment', 'AA360', 'Event Triggers',  'Template Builder', 'Forms','Split A/B','Analytics'],
                    layout: 'horizontal',
                }, 
                //  {
                //     id: 'Question_4',
                //     type: 'textarea',
                //     label: 'A. How long have you been using RESUL?',
                //     placeholder: 'Enter your comments',
                //     maxLength: 1000,
                //     required: true,
                // },
                // {
                //     id: 'Question_5',
                //     type: 'textarea',
                //     label: 'B. Which three RESUL features are most valuable to you?',
                //     placeholder: 'Enter your comments',
                //     maxLength: 1000,
                //     required: true,
                // },
                {
                    id: 'Question_6',
                    type: 'textarea',
                    label: 'C. What are the challenges you are solving with RESUL?',
                  //  label: 'C. What is the most critical / biggest problem you are resolving with RESUL?',
                    placeholder: 'Enter your comments',
                    maxLength: 1000,
                    required: true,
                },
                {
                    id: 'Question7',
                    type: 'textarea',
                    label: 'D. What is the one improvement  you would suggest? Please provide reasons',
                    placeholder: 'Enter your comments',
                    maxLength: 1000,
                    required: true,
                },
            ],
        },
        {
            id: 'additional',
            questions: [
                {
                    id: 'section_heading',
                    type: 'section_heading',
                    text: 'Customer service experience',
                },
                {
                    id: 'Question8',
                    type: 'radio',
                    label: 'A. Resolution time',
                    required: true,
                    options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
                    layout: 'horizontal',
                },
                {
                    id: 'Question9',
                    type: 'radio',
                    label: 'B. Quality',
                    required: true,
                    options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
                    layout: 'horizontal',
                },
                {
                    id: 'Question10',
                    type: 'radio',
                    label: 'C. Responsiveness',
                    required: true,
                    options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
                    layout: 'horizontal',
                },
            ],
        },
        {
            id: 'feedback',
            questions: [
                // {
                //     id: 'q3',
                //     type: 'section_heading',
                //     text: 'How long have you been using RESUL?',
                // },
              
                {
                    id: 'Company_authorized_representative',
                    type: 'short_text',
                    label: "Your name",
                    placeholder: "Name",
                    required: true,
                },
                {
                    id: 'Designation',
                    type: 'short_text',
                    label: 'Designation',
                    placeholder: 'Designation',
                    required: true,
                },
                {
                    id: 'EmailID',
                    type: 'email',
                    label: 'Email',
                    placeholder: 'Email',
                    required: true,
                },  {
                    id: 'Company',
                    type: 'short_text',
                    label: 'Company name',
                    placeholder: 'Company name',
                    required: true,
                },
                {
                    id: 'checkbox',
                    type: 'checkbox',
                    label: 'I agree to Terms & Conditions',
                    required: true,
                },
                // {
                //     id: 'captcha',
                //     type: 'captcha',
                //     label: 'Enter the captcha',
                //     required: true,
                // },
            ],
        },
        // {
        //     id: 'final_section',
        //     questions: [
        //         {
        //             id: 'final_heading',
        //             type: 'section_heading',
        //             text: 'Long answer text for responses:',
        //         },
        //         {
        //             id: 'final_comments',
        //             type: 'textarea',
        //             label: 'Long answer text',
        //             placeholder: '',
        //             maxLength: 1000,
        //             required: false,
        //         },
        //     ],
        // },
    ],
};
