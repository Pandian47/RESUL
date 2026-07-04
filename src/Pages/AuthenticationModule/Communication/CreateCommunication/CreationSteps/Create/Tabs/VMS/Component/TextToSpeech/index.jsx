import { REPEAT_TIMES, TEXT_EDITOR_INFO } from '../../constant';
import { ENTER_EDITOR_TEXT, SELECT_LANGUAGE, SELECT_REPEAT_TIMES, SELECT_TEMPLATE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { LANGUAGE, NO_OF_REPEATS, REPEAT, TEMPLATE_NAME, TEXT } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useRef } from 'react';
import { get as _get, isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
import { useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, Controller } from 'react-hook-form';
import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import { ProseMirror } from '@progress/kendo-react-editor';
const { Plugin, PluginKey, Decoration, DecorationSet, InputRule, inputRules } = ProseMirror;
import { convert } from 'html-to-text';

import RSPPophover from 'Components/RSPPophover';
import Timer from '../../../../Component/Timer/Timer';
import Personalize from '../../../../Component/Personalize';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import InsertOffer from './../../../../Component/InsertOffer/index';

import { getVmsDetails } from 'Reducers/communication/createCommunication/Create/selectors';
import VMSContext from '../../context';

const TextToSpeech = () => {
    const {
        control,
        setValue,
        clearErrors,
        formState: { errors },
        watch,
    } = useFormContext();

    const { language, template } = useSelector((state) => getVmsDetails(state));
    const { isTemplateLoading, isLanguageLoading } = useContext(VMSContext);
    const editableRef = useRef();
    const editableToggle = useRef(true);
    const editorText = watch('editorText');
    let editorErrorMessage = _get(errors, `editorText.message`, '');
    if (editorText?.length > 500) {
        editorErrorMessage = 'Max. 500 characters';
    }

    
    const inputRule = (nodes) => {
        return inputRules({
            rules: [
                new InputRule(/^.{0,350}$/, (data, match, start, end) => {
                    editableToggle.current = match?.[0];
                }),
            ],
        });
    };

    const onMount = (event) => {
        const state = event.viewProps.state;
        const plugins = [
            ...state.plugins,
            //   placeholder('{Your content goes here...}'),
            new Plugin({
                key: new PluginKey('readonly'),
                props: {
                    editable: () => editableToggle.current,
                },
                filterTransaction: (tr, _st) => editableToggle.current || !tr.docChanged,
            }),
            inputRule(state.schema.nodes),
            // new Plugin({
            //     key: new PluginKey('readonly'),
            //     props: {
            //         editable: () => editableToggle.current,
            //     },
            //     filterTransaction: (tr, _st) => editableToggle.current || !tr.docChanged,
            // }),
        ];
        const editorDocument = event.dom.ownerDocument;
        const styleElement = editorDocument && editorDocument.querySelector('style');
        if (styleElement) {
            styleElement.appendChild(editorDocument.createTextNode(styles));
        }
        return new ProseMirror.EditorView(
            {
                mount: event.dom,
            },
            {
                ...event.viewProps,
                state: ProseMirror.EditorState.create({
                    doc: state.doc,
                    plugins,
                }),
            },
        );
    };
    const styles = `p.placeholder:first-child:before {
        content: attr(data-placeholder);
        float: left;
        color: rgb(0, 0, 0, 0.5);
        cursor: text;
        height: 0;
    }`;
    return (
        <Fragment>
            <div className="form-group mt20">
                <Row>
                <Col sm={3}  style={{ width: '20%' }}>
                <label className="control-label-left">{TEMPLATE_NAME}</label>
                    </Col>
                    <Col
                        sm={6}
                        style={{ width: '544px' }}
                    >                        <RSKendoDropdown
                            control={control}
                            name={'templateName'}
                            data={template}
                            textField={'templateName'}
                            dataItemKey={'vmsTemplateId'}
                            label={TEMPLATE_NAME}
                            required
                            isLoading={isTemplateLoading}
                            rules={{
                                required: SELECT_TEMPLATE_NAME,
                            }}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                <Col sm={3}  style={{ width: '20%' }}>
                        <label className="control-label-left">{LANGUAGE}</label>
                    </Col>
                    <Col
                        sm={6}
                        style={{ width: '544px' }}
                    >                           <RSKendoDropdown
                            control={control}
                            name={'language'}
                            data={language}
                            textField={'displayLanguageName'}
                            dataItemKey={'vMSLanguageId'}
                            label={LANGUAGE}
                            required
                            isLoading={isLanguageLoading}
                            rules={{
                                required: SELECT_LANGUAGE,
                            }}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                <Col sm={3}  style={{ width: '20%' }}>
                        <label className="control-label-left">{TEXT}</label>
                    </Col>
                    <Col
                        sm={6}
                        style={{ width: '544px' }}
                    >                           <div className="rs-textarea-wrapper form-floating rs-kendo-editor-wrapper VMS_textarea_wrapper">
                            {editorErrorMessage && <div className="validation-message">{editorErrorMessage}</div>}
                            <Controller
                                control={control}
                                name="editorText"
                                rules={{
                                    required: ENTER_EDITOR_TEXT,
                                    validate: (values, formvalues) => {
                                        return values === '<p></p>' || _isEmpty(values)
                                            ? ENTER_EDITOR_TEXT
                                            : true;
                                    },
                                }}
                                render={({ field: { onFocus, onChange, onBlur, value, onKeyDown } }) => (
                                    <ResTextEditor
                                        ref={editableRef}
                                        tools={[Personalize, InsertOffer, Timer]}
                                        defaultContent={editorText}
                                        height={200}
                                        preserveWhitespace
                                        defaultEditMode="div"
                                        onFocus={() => {
                                            if (editorErrorMessage) clearErrors('editorText');
                                        }}
                                        onChange={(html) => {
                                            const options = { wordwrap: false };
                                            const plainTextContent = convert(html, options);
                                            const textLength = plainTextContent?.length;
                                            if (textLength <= 500) {
                                                setValue('editorText', plainTextContent);
                                            }
                                        }}
                                        onKeyDown={(event) => {
                                            if (editorText?.length >= 200) {
                                                event.preventDefault();
                                            }
                                        }}
                                        onMount={onMount}
                                    />
                                )}
                            />
                        </div>
                        <div className="rs-editor-bottom-message">
                            <div className="editor-message-right">
                                <small>
                                    <span className="emr-length d-flex justify-content-end gap-2">
                                        {editorText?.length} / 500
                                        <RSPPophover text={TEXT_EDITOR_INFO}>
                                            <i
                                                className={`${circle_question_mark_mini} icon-xs color-primary-blue editor-help-icon ml3`}
                                                id="circle_question_mark"
                                            />
                                        </RSPPophover>
                                    </span>
                                </small>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                <Col sm={3}  style={{ width: '20%' }}>
                        <label className="control-label-left">{REPEAT}</label>
                    </Col>
                    <Col
                        sm={6}
                        style={{ width: '544px' }}
                    >                           <RSKendoDropdown
                            control={control}
                            name={'repeat'}
                            required
                            data={REPEAT_TIMES}
                            label={NO_OF_REPEATS}
                            rules={{
                                required: SELECT_REPEAT_TIMES,
                            }}
                        />
                    </Col>
                </Row>
            </div>
        </Fragment>
    );
};

export default TextToSpeech;
