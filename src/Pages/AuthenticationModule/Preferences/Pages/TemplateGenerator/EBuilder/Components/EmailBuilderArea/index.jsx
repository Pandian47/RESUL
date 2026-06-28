import { menu_dot_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useRef, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import ViewInBrowser from '../ViewInBrowser';
import { TEMPLATE_COMPONENTS } from '../../../EmailBuilder/Pages/CreatNewTemplates/Components/EmailBuildArea/Constant';
import { DROP_TEXT } from '../../constant';
import { EmailBuilderContext } from '../../Context/context';

const EmailBuildArea = () => {
    const methods = useFormContext();
    const { watch, control } = methods;

    const { fields, insert, move, remove } = useFieldArray({ control, name: 'contents' });

    const ruleCondition = watch('ruleCondition');
    const { setEmailSettingModal, builderBodyColor, ViewInBrowserColor } = useContext(EmailBuilderContext);

    const draggingRef = useRef(null);
    const [align, setAlign] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);

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
        let ID = e.dataTransfer.getData('ebChildId');
        let type = draggingRef.current;

        if (type !== 'child') {
            if (align) {
                move(+ID, index);
                setAlign(false);
            } else {
                let component = TEMPLATE_COMPONENTS?.find((block) => block?.id == ID);
                insert(index, component);
            }
        }
        draggingRef.current = null;
    };

    const handleActions = (action, index) => {
        switch (action) {
            case 'delete':
                remove(index);
                setSelectedElement(null);
                break;
            default:
                break;
        }
    };

    const handleBrowserModal = (type) => {
        setEmailSettingModal((pre) => ({
            ...pre,
            emailSettingToggle: false,
            rowStyle: {
                modal: true,
                type,
            },
        }));
    };

    const handleContentModal = (type) => {
        setEmailSettingModal((pre) => ({
            ...pre,
            emailSettingToggle: false,
            rowStyle: {
                modal: true,
                type,
            },
        }));
    };

    return (
        <section className="p30">
            <div
                className="viewbrowser"
                style={{ backgroundColor: `${ViewInBrowserColor.backgroundColor}` }}
                onClick={() => handleBrowserModal('emailBrowserStyle')}
            >
                <div className="w-50 mx-auto">{ruleCondition && <ViewInBrowser />}</div>
            </div>
            <div onClick={() => handleContentModal('contentStyle')} className="buildercontent" draggable>
                <div className="w-50 mx-auto" style={{ backgroundColor: `${builderBodyColor.backgroundColorContent}` }}>
                    {fields?.length ? (
                        fields.map((rowComponent, index) => {
                            const Component = rowComponent.component;
                            return (
                                <div
                                    onDrop={(e) => {
                                        handleDoDrop(e, index);
                                    }}
                                    onDragOver={(e) => {
                                        handleDragOver(e);
                                    }}
                                    key={rowComponent.id}
                                    className="element"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElement(index);
                                    }}
                                >
                                    <span draggable onDragStart={(e) => onDragStart(e, index)}>
                                        <i className={`${menu_dot_mini}`}></i>
                                    </span>
                                    <div>
                                        <Component
                                            actions={selectedElement === index}
                                            handleParentAction={(action) => handleActions(action, index)}
                                            handleDragging={(type) => handleDragging(type)}
                                            index={index}
                                            id={rowComponent.id}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div
                            draggable
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                                handleDoDrop(e, 0);
                            }}
                            className="ebformfield p20"
                        >
                            <div onDragOver={handleDragOver} className="w-50 mx-auto">
                                <p>{DROP_TEXT}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default EmailBuildArea;
