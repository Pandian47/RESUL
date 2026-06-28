import { createContext, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import TemplateHeader from './Components/Header/TemplateHeader';
import { INITIAL_STATE } from './constant';
import './EmailBuilder.scss';
import EmailEditor from 'react-email-editor';
import Simple from './Components/EBCustomTools/Simple';


export const EBContext = createContext();

const customTools = () => {
    window.unlayer.registerTool({
        name: 'my_tool',
        label: 'My Tool',
        icon: 'fa-smile',
        supportedDisplayModes: ['web', 'email'],
        options: {},
        values: {},
        renderer: {
            Viewer: Simple, // our React Viewer
            exporters: {
                web: function (values) {
                    return '<div>I am a custom tool.</div>';
                },
                email: function (values) {
                    return '<div>I am a custom tool.</div>';
                },
            },
            head: {
                css: function (values) {},
                js: function (values) {},
            },
        },
    });
};

const EmailBuilder = () => {
    const methods = useForm(INITIAL_STATE);

    const [templateFlag, setTemplateFlag] = useState(true);
    const [catagoryFlag, setCatagoryFlag] = useState(false);
    const [showProperty, setShowProperty] = useState(false);

    const selectedComponentTypeRef = useRef(null);
    const selectedComponentIDRef = useRef(null);

    const handleTemplateClose = () => {
        setTemplateFlag(false);
        setCatagoryFlag(true);
    };

    const handlePropertyClose = () => setShowProperty(false);

    const contextValues = {
        selectedComponentTypeRef,
        selectedComponentIDRef,
    };
    const emailEditorRef = useRef(null);

    const exportHtml = () => {
        emailEditorRef.current.editor.exportHtml((data) => {
            const { design, html } = data;
                    });
    };

    const onLoad = () => {
        // editor instance is created
        // you can load your template here;
        // const templateJson = {};
        // emailEditorRef.current.editor.loadDesign(templateJson);
    };

    const onReady = () => {
        // editor is ready
                customTools();
    };

    return (
        <EBContext.Provider value={contextValues}>
            <FormProvider {...methods}>
                <div className="email-builder">
                    <TemplateHeader />
                    <EmailEditor
                        ref={emailEditorRef}
                        onLoad={onLoad}
                        onReady={onReady}
                        options={{
                            customJS: [],
                        }}
                    />
                    {/* Other components can be included here as needed */}
                </div>
            </FormProvider>
        </EBContext.Provider>
    );
};

export default EmailBuilder;
