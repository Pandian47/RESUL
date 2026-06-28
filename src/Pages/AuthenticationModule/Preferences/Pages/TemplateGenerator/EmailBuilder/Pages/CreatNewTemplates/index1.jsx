import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { INITIAL_STATE } from './constant';
import EmailBuildArea from './Components/EmailBuildArea';
import './EmailBuilder.scss';

const Index = () => {
    const methods = useForm(INITIAL_STATE);

    const [templateFlag, setTemplateFlag] = useState(true);
    const [catagoryFlag, setCatagoryFlag] = useState(false);
    const [showProperty, setShowProperty] = useState(false);

    const handleTemplateClose = () => {
        setTemplateFlag(false);
        setCatagoryFlag(true);
    };

    const handlePropertyClose = () => setShowProperty(false);

    return (
        <FormProvider {...methods}>
            <div className="page-content-holder">
                <EmailBuildArea />
            </div>
            <div className="email-builder d-none">
                {/* <TemplateModal
                    show={templateFlag}
                    handleClose={() => handleTemplateClose()}
                />

                <TemplateHeader />
                <HeaderInputComponents /> */}
                <EmailBuildArea />

                {/* <button
                    onClick={() => {
                        setShowProperty(!showProperty);
                    }}
                >
                    Element Property
                </button>

                <ElementProperty showProperty={showProperty} handlePropertyClose={handlePropertyClose} />

                <CatagoryModal
                    show={catagoryFlag}
                    handleClose={(status) => {
                        if (!status) {
                            setCatagoryFlag(status);
                        }
                    }}
                /> */}
            </div>
        </FormProvider>
    );
};

export default Index;
