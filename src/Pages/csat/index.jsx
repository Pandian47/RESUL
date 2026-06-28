import { useState } from 'react';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import SurveyForm from './components/surveyform';
import ThankYou from './components/thankyou';
import './components/style.css';
// import Footer from "../components/Footer";
// import "./CustomerSurvey.css"; // move your <style> content here

const CustomerSurvey = () => {
    const [submitted, setSubmitted] = useState(false);

    return (
        <>
            {/* <Header /> */}
            <div className="page-content-holder surveycsat">
                <RSPageHeader title={'Customer Satisfaction Survey'} isHeaderLine />
                <Container className="page-content px0">
                    <h3 className="top-sub-heading mt0">Your feedback helps us improve our services</h3>
                    <div className="box-design mt20">
                        {!submitted ? <SurveyForm onSuccess={() => setSubmitted(true)} /> : <ThankYou />}
                    </div>
                    {!submitted && (
                        <div className="submit-section mt20">
                            <button type="submit" form="survey-form" className="btn btn-submit">
                                Submit
                            </button>
                        </div>
                    )}
                </Container>
            </div>
            {/* <Footer /> */}
        </>
    );
};

export default CustomerSurvey;
