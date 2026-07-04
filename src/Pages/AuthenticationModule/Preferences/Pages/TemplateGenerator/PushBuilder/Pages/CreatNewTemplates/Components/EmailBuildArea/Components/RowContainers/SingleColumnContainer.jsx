import { menu_dot_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { find as _find } from 'Utils/modules/lodashReplacements';

import { DROP_TEXT_CONTENT, TEMPLATE_COMPONENTS } from '../../Constant';
import EBElementActions from '../../../InputControls/EBElementActions';

const SingleColumnContainer = ({ index, handleParentAction, actions, id }) => {
    const { control } = useFormContext();

    const { fields, insert, move, remove } = useFieldArray({ control, name: `contents[${index}]` });

    const [selectedElement, setSelectedElement] = useState(null);
    const [align, setAlign] = useState(false);

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const onDragStart = (ev, ind) => {
        ev.dataTransfer.setData('ebChildId', ind);
        setAlign(true);
    };

    const handleDoDrop = (e, index) => {
        let ID = e.dataTransfer.getData('ebChildId');
                                if (align) {
                        move(+ID, index);
            setAlign(false);
        } else {
            let component = _find(TEMPLATE_COMPONENTS, ['id', +ID]);
            insert(index, component);
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

    return (
        <Card className="workbook">
            <div className={actions ? 'elementActionIconsShow' : 'elementActionIconsHide'}>
                <EBElementActions handleActions={handleParentAction} />
            </div>
            {fields?.length ? (
                fields.map((elementComponent, index) => {
                    const Component = elementComponent.component;
                    return (
                        <div
                            key={elementComponent.id}
                            onDrop={(e) => {
                                handleDoDrop(e, index);
                            }}
                            className="ebformfield position-relative"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement(index);
                            }}
                        >
                            <i
                                className={`${menu_dot_mini}  icon-md moveIcon`}
                                draggable
                                onDragStart={(e) => onDragStart(e, index)}
                            />
                            <div onDragOver={handleDragOver}>
                                <div
                                    className={
                                        selectedElement === index ? 'elementActionIconsShow' : 'elementActionIconsHide'
                                    }
                                >
                                    <EBElementActions handleActions={handleActions} />
                                </div>
                                <Component index={index} />
                            </div>{' '}
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
                    className="ebformfield"
                >
                    <div onDragOver={handleDragOver}>
                        <p>
                            {' '}
                            {DROP_TEXT_CONTENT} {id}{' '}
                        </p>
                    </div>{' '}
                </div>
            )}
        </Card>
    );
};

export default SingleColumnContainer;
