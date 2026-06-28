import { arrow_left_medium, arrow_right_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import ElementProperty from './Components/Canvas/ElementProperty';
import { FormProvider, useForm } from 'react-hook-form';
import EmailBuildArea from './Components/EmailBuilderArea';
import { EmailBuilderContext } from './Context/context';
import HeaderInputComponents from '../EmailBuilder/Pages/CreatNewTemplates/Components/Header/HeaderInputComponents';
import RowStyle from './Components/RowStyle';
// import '@resulticks/email-builder/dist/style.css';

const EBuilder = () => {
    const methods = useForm();
    const { watch } = methods;

    const [emailSettingModal, setEmailSettingModal] = useState({
        emailSettingToggle: true,
        elementPropertyModal: false,
        rowStyle: {
            modal: false,
            type: '',
        },
    });

    const [builderBodyColor, setBuilderBodyColor] = useState({
        backgroundColor: '',
        backgroundColorContent: '',
    });

    const [ViewInBrowserColor, setViewInBrowserColor] = useState({
        backgroundColor: '',
        backgroundColorContent: '',
    });

    const { emailSettingToggle, rowStyle, elementPropertyModal } = emailSettingModal;

    const contextValue = {
        builderBodyColor,
        ViewInBrowserColor,
        emailSettingModal,
        setBuilderBodyColor,
        setViewInBrowserColor,
        setEmailSettingModal,
    };

    const handleEmailSettingModal = () => {
        setEmailSettingModal((pre) => ({
            ...pre,
            elementPropertyModal: !elementPropertyModal,
        }));
    };

    return (
        <EmailBuilderContext.Provider value={contextValue}>
            <HeaderInputComponents />

            <FormProvider {...methods}>
                <div style={{ backgroundColor: `${builderBodyColor?.backgroundColor}`, height: '100vh' }}>
                    <div>
                        <EmailBuildArea />
                    </div>
                    <div className={`w-25 position-absolute ${elementPropertyModal ? 'right-40' : 'right0'} `}>
                        <button onClick={handleEmailSettingModal}>
                            <i
                                className={`${
                                    elementPropertyModal ? arrow_left_medium : arrow_right_medium
                                } color-gray icon-xs`}
                            ></i>
                        </button>
                        <div className={`${emailSettingToggle ? 'd-block' : 'd-none'}`}>
                            <ElementProperty />
                        </div>
                        <div className={`${rowStyle?.modal ? 'd-block' : 'd-none'}`}>
                            <RowStyle />
                        </div>
                    </div>
                </div>
            </FormProvider>
        </EmailBuilderContext.Provider>
    );
};

export default EBuilder;
