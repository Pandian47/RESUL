import { menu_dot_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, createContext, useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import _find from 'lodash/find';
import { useFieldArray, useFormContext } from 'react-hook-form';
import EmailEditor from 'react-email-editor';
import { TEMPLATE_BLOCKS } from './Constant';
import sample from './sample.json';
export const EBContext = createContext();

const EmailBuildArea = () => {
    const { control } = useFormContext();

    const { fields, insert, move, remove } = useFieldArray({ control, name: 'contents' });

    const [selectedElement, setSelectedElement] = useState();
    const [align, setAlign] = useState(false);

    const draggingRef = useRef();

    const handleDragging = (type) => {
        draggingRef.current = type;
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const onDragStart = (ev, ind) => {
        ev.dataTransfer.setData('ebCompoId', ind);
        setAlign(true);
    };

    const handleDoDrop = (e, index) => {
        let ID = e.dataTransfer.getData('ebCompoId');
        let type = e.dataTransfer.getData('ebCompoType');

        if (type !== 'child') {
            if (align) {
                move(+ID, index);
                setAlign(false);
            } else {
                let component = _find(TEMPLATE_BLOCKS, ['id', +ID]);
                insert(index, component);
            }
        }
    };

    const handleActions = (action) => {
        switch (action) {
            case 'delete':
                remove(selectedElement);
                setSelectedElement(null);
                break;
            default:
                break;
        }
    };
    const emailEditorRef = useRef(null);

    const exportHtml = () => {
        emailEditorRef.current.editor.exportHtml((data) => {
            const { design, html } = data;
                    });
    };
    const onDesignLoad = (data) => {
            };
    const onLoad = () => {
        // editor instance is created
        // you can load your template here;
        // const templateJson = {};
        setIsEditorLoading(false);

        emailEditorRef.current.editor.addEventListener('onDesignLoad', onDesignLoad);
        emailEditorRef.current.editor.loadDesign(sample);
    };

    const onReady = () => {
        // editor is ready
            };
    const [isEditorLoading, setIsEditorLoading] = useState(true);
    useEffect(() => {
        if (isEditorLoading) return;

        emailEditorRef.current.editor.loadDesign(sample);
        emailEditorRef.current.editor.setMergeTags({
            first_name: {
                name: 'First Name',
                value: '{{first_name}}',
                sample: '[[first_name]]',
            },
            last_name: {
                name: 'Last Name',
                value: '{{last_name}}',
                sample: '[[last_name]]',
            },
        });
        emailEditorRef.current.editor.loadBlank({
            backgroundColor: '#e7e7e7',
        });
        // emailEditorRef.current.editor.features({
        //     textEditor: {
        //         customButtons: [
        //             {
        //                 name: 'my_button',
        //                 text: 'My Button',
        //                 icon: 'bookmark',
        //                 onSetup: () => {},
        //                 onAction: (data, callback) => {
        //                     console.log(data.text);
        //                     callback(data.text + ' Updated');
        //                 },
        //             },
        //         ],
        //     },
        // });
        emailEditorRef.current.editor.setAppearance({
            loader: {
                html: '<div class="custom-spinner"></div>',
                css: '.custom-spinner { color: red; }',
            },
            panels: {
                tools: {
                    dock: 'left',
                },
            },
        });
    }, [isEditorLoading]);

    return (
        <Fragment>
            <EmailEditor ref={emailEditorRef} onLoad={onLoad} minHeight="90vh" />
            <Card className="rowComponent d-none" onClick={() => setSelectedElement(null)}>
                <table>
                    {/* <tbody>
                        {
                            fields?.length ?
                                fields.map((rowComponent, index) => {
                                    const Component = rowComponent.component;
                                    return (
                                        <tr
                                            onDrop={(e) => {
                                                handleDoDrop(e, index);
                                            }}
                                            onDragOver={(e) => {
                                                handleDragOver(e, index);
                                            }}
                                            key={rowComponent.id}
                                            className="ebformfield position-relative"
                                            onClick={(e) => { e.stopPropagation(); setSelectedElement(index) }}
                                        >
                                            <td draggable onDragStart={(e) => onDragStart(e, index)}>
                                                <i className={`${menu_dot_mini} icon-md moveIcon`} />
                                            </td>
                                            <td>
                                                <Component
                                                    actions={selectedElement === index}
                                                    handleParentAction={(action) => handleActions(action, index)}
                                                    handleDragging={(type) => handleDragging(type)}
                                                    index={index}
                                                    id={rowComponent.id}
                                                />
                                                {' '}
                                            </td>
                                        </tr>
                                    )
                                })
                                :
                                <tr
                                    draggable
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => {
                                        handleDoDrop(e, 0);
                                    }}
                                    className="ebformfield"
                                >
                                    <td
                                        onDragOver={handleDragOver}
                                    >
                                        <p> {DROP_TEXT_CONTENT}</p>
                                    </td>{' '}
                                </tr>
                        }
                    </tbody> */}
                    {/* <EmailEditor ref={emailEditorRef} onLoad={onLoad} onReady={onReady} /> */}
                </table>
            </Card>
            {/* <RSConfirmationModal

            /> */}
        </Fragment>
    );
};

export default EmailBuildArea;
