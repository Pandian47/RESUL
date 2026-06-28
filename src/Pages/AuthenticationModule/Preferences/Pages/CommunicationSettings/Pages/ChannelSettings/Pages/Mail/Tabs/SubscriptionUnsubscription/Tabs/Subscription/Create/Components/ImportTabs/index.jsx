import { import_file_edge_large, template_edge_large, text_document_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import Template from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/Template/Template';
import RSKendoTextEditor from 'Components/FormFields/RSKendoTextEditor';
import EDMImport from '../EDMImport/EDMImport';
import { ENTER_EDITOR_TEXT } from 'Constants/GlobalConstant/ValidationMessage';
import { MESSAGE } from 'Constants/GlobalConstant/Placeholders';

export const IMPORT_MAIL_TAB = (control) => [
    {
        id: 'text',
        text: 'Rich text',
        name: 'text',
        iconLeft: `${text_document_edge_large} icon-lg`,
        component: () => (
            <RSKendoTextEditor
                control={control}
                name={'welcomeMail.verificationText'}
                rules={{ required: ENTER_EDITOR_TEXT }}
                errMsg={'ENTER_EDITOR_TEXT'}
                placeholder={MESSAGE}
                resTextEditorClassName='subscription-textEditor'
            />
        ),
    },
    {
        id: 'import',
        text: 'Import',
        iconLeft: `${import_file_edge_large} icon-lg`,
        component: () => <EDMImport fieldName="welcomeMail.importValues" isSplit={true} />,
        disable: false,
    },
    {
        id: 'template',
        text: 'Template',
        iconLeft: `${template_edge_large} icon-lg`,
        component: () => <Template />,
        disable: false,
    },
];

export const IMPORT_SUCESS_CONTENT_TAB = (control) => [
    {
        id: 'text',
        text: 'Rich text',
        name: 'text',
        iconLeft: `${text_document_edge_large} icon-lg`,
        component: () => (
            <RSKendoTextEditor
                control={control}
                name={'success.successMessageText'}
                rules={{ required: ENTER_EDITOR_TEXT }}
                errMsg={'ENTER_EDITOR_TEXT'}
                placeholder={MESSAGE}
                resTextEditorClassName='subscription-textEditor'

            />
        ),
    },
    {
        id: 'import',
        text: 'Import',
        iconLeft: `${import_file_edge_large} icon-lg`,
        component: () => <EDMImport fieldName="success.importValues" isSplit={true} />,
        disable: false,
    },
    {
        id: 'template',
        text: 'Template',
        iconLeft: `${template_edge_large} icon-lg`,
        component: () => <Template />,
        disable: false,
    },
];
