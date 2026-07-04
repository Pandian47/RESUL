import { DROP_FIELD_HERE, REMOVE } from 'Constants/GlobalConstant/Placeholders';
import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import move_Icon from 'Assets/Images/icon-move.png';
import { useFormContext } from 'react-hook-form';
import { INPUT_TYPES } from '../../../constant';
import { FormGeneratorContext } from '../FormGenerator';
import { useSelector } from 'react-redux';
import RSTooltip from 'Components/RSTooltip';
import { getAttribute } from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/constant';
import AgreeCancel from './AgreeCancel';
import { uniqueId } from 'Utils/modules/lodashReplacements';

const ListViewComponent = ({
    componentsData,
    selectedColor,
    profilingToggle,
    formDefaultInsert,
    formDefaultSwap,
    formVisibleInsert,
    onMouseLeave,
    onDragStart,
    setInputTypes,
    fieldCount,
    validateDefault,
    formVisibleRemove,
    formVisibleSwap,
    formDefaultMove,
    formDefaultReplace,
}) => {
    const { control, setValue, getValues } = useFormContext();
    const { formState, dispatchState,enforceProfilingLimit } = useContext(FormGeneratorContext);
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);

    const [lastIndexData, setLastIndexData] = useState(false);
    const [indexData, setIndexData] = useState(false);
    const [isDragging, setIsDragging] = useState(false); // Local dragging state for Firefox fix


    const lastIndex = componentsData?.length - 1;

    const orderedDataAttributes = useMemo(() => {
        return dataCatalogueAttrs
            ?.map(getAttribute)
            ?.filter((item) => item?.attributeName && item?.attributeName.trim() !== '')
            ?.sort((a, b) => a.attributeName.localeCompare(b.attributeName));
    }, [dataCatalogueAttrs]);

    useEffect(() => {
        const hasParticipants = componentsData?.some(item => item?.columnType === 'Participants');
        setInputTypes(prev =>
            prev.map(item =>
                item.columnType === 'Participants'
                    ? { ...item, disable: hasParticipants }
                    : item
            )
        );
    }, [componentsData, setInputTypes]);

    const onDrop = useCallback(
        (e, index) => {
            dispatchState({
                type: 'UPDATE_DRAG_OVER',
                payload: { dragIndex: null, isDropped: false },
            });

            const getData = e.dataTransfer.getData('name');
            const { typeOfValue, fromIndex } = formState;
            const filterItem = INPUT_TYPES.find(item => item.name === getData);

            if (profilingToggle) {
                if (typeOfValue === 'default') {
                    formDefaultMove(fromIndex, index);
                } else if (filterItem) {
                    formDefaultInsert(index, { ...filterItem, fieldId: uniqueId(), mapTo: [], mapToValue: '' });
                }
                enforceProfilingLimit();
            } else {
                if (typeOfValue === 'default') {
                    // Skip if dropping at the same position (no change needed)
                    if (fromIndex === index || (fromIndex < index && fromIndex === index - 1)) {
                        return;
                    }
                    formDefaultMove(fromIndex, index);
                } else if (filterItem) {
                    formDefaultInsert(index, { ...filterItem, fieldId: uniqueId(), mapTo: [], mapToValue: '' });
                }
            }
        },
        [dispatchState, formState, profilingToggle, formDefaultInsert, formDefaultMove, enforceProfilingLimit]
    );

    const onDragOver = useCallback(
        (e, index) => {
            e.preventDefault();
            dispatchState({
                type: 'UPDATE_DRAG_OVER',
                payload: { dragIndex: index, isDropped: true },
            });
        },
        [dispatchState]
    );

    const onDragEnd = useCallback(
        (e, index) => {
            dispatchState({
                type: 'UPDATE_SAVE',
                payload: { dragIndex: null, isDropped: false },
            });

            const getData = e.dataTransfer.getData('name');
            const filterItem = INPUT_TYPES.find(item => item.name === getData);
            if (filterItem)
                formVisibleInsert(index, { ...filterItem, fieldId: uniqueId(), mapTo: [], mapToValue: '' });
        },
        [dispatchState, formVisibleInsert]
    );

    const handleDrop = useCallback(
        e => {
            setLastIndexData(false);
            const dropIndex = indexData ? lastIndex : lastIndex + 1;
            onDrop(e, dropIndex);
        },
        [indexData, lastIndex, onDrop]
    );

    const handleDragOver = useCallback(
        (e, setLast = false) => {
            const dragIndex = indexData ? lastIndex : lastIndex + 1;
            onDragOver(e, dragIndex);
            if (setLast) setLastIndexData(true);
        },
        [onDragOver, indexData, lastIndex]
    );

    const handleRemoveField = (index) => {
        dispatchState({
            type: 'UPDATE_REMOVE_FIELD',
            payload: {
                removeIndex: index,
                removeStatus: 'default',
                removePopup: true,
            },
        });
    };

    return (
        <div id="form" style={{ backgroundColor: selectedColor }}>
            {componentsData?.map((item, index) => {
                const Component = item?.component;

                item.mapTo = orderedDataAttributes;

                if (profilingToggle && item?.field) {
                    return (
                        <h4 className="p-2 mt5" key={item?.id || item?.fieldId || index}>
                            {item?.field}
                        </h4>
                    );
                }

                // Determine if the drop placeholder should show before this field
                // Only show if it's not the same position or adjacent position when reordering
                const { fromIndex, typeOfValue } = formState;
                const isReordering = typeOfValue === 'default' && fromIndex !== null;
                const showDropPlaceholder = formState.isDropped && 
                    formState.dragIndex === index && 
                    !lastIndexData &&
                    // When reordering, don't show placeholder at same position or adjacent position
                    (!isReordering || (index !== fromIndex && index !== fromIndex + 1));

                // Determine the correct label property based on field type
                // Some components use tinyMceLableMain (MultiChoice, Rating, Slider, Matrix, etc.)
                // Others use tinyMceLable (Textbox, Radio, Checkbox, etc.)
                const usesMainLabel = [
                    'multichoice', 'starrating', 'RangeSlider', 'Matrix', 
                    'CommentRating', 'Rankrating', 'CustomHeader', 
                    'Consent Checkbox', 'TextBlock'
                ].includes(item?.columnType);

                const displayLabel = usesMainLabel
                    ? (item?.tinyMceLableMain || item?.labelName)
                    : (item?.tinyMceLable || item?.labelName);

                return (
                    <div className="rsbecw-row s" key={item?.id}>
                        {showDropPlaceholder && (
                            <div
                                className="rs-form-builder-drop-box"
                                onDrop={e => onDrop(e, index)}
                                onDragOver={e => onDragOver(e, index)}
                            >
                    <p className="text-center">{DROP_FIELD_HERE}</p>
                            </div>
                        )}

                        <div
                            onDragOver={e => onDragOver(e, index)}
                            className={`rs-pop-view ${formState?.isDropped ? 'dragging-active' : ''}`}
                            style={{ 
                                background: selectedColor,
                                // Firefox-specific: force pointer-events with inline style (higher priority)
                                ...( formState?.isDropped ? {
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    MozUserSelect: 'none',
                                    msUserSelect: 'none',
                                } : {})
                            }}
                            onDrop={e => onDrop(e, index)}
                        >
                            {!profilingToggle && (
                               <RSTooltip position='top' text='Move' className='left-13 position-absolute top-10 test pop'>
                                 <img
                                    className="color-primary-blue icon-md  cp"
                                    src={move_Icon}
                                    draggable={componentsData?.length !== 1}
                                    onDragStart={e => {
                                        // Firefox-specific: Set drag properties to fix cursor issues
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
                                        
                                        // Set local dragging state immediately for Firefox
                                        setIsDragging(true);
                                        setIndexData(true);
                                        
                                        // Call the original handler
                                        onDragStart(e, item?.name, index, 'default');
                                    }}
                                    onDragEnd={e => {
                                        // Clear dragging state immediately for Firefox
                                        setIsDragging(false);
                                        setIndexData(false);
                                        
                                        // Call the original handler
                                        onMouseLeave(e);
                                    }}
                                    onMouseLeave={onMouseLeave}
                                    style={{
                                        // Firefox-specific: prevent stuck drag state
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                        MozUserSelect: 'none',
                                        msUserSelect: 'none',
                                    }}
                                />
                               </RSTooltip>
                            )}

                            <RSTooltip
                                position="top"
                                text={REMOVE}
                                className="right-12 position-absolute top-15 pop"
                            >
                                <i
                                    className={`icon-rs-circle-minus-fill-mini color-primary-red icon-md ${
                                        componentsData?.length === 0 ? 'click-off' : ''
                                    }`}
                                    onClick={() => handleRemoveField(index)}
                                />
                            </RSTooltip>

                            {Component && (
                                <div 
                                    id="formId" 
                                    style={{
                                        // Firefox-specific: inline style has higher priority than class
                                        ...(formState?.isDropped ? {
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                            WebkitUserSelect: 'none',
                                            MozUserSelect: 'none',
                                            msUserSelect: 'none',
                                            cursor: 'grabbing',
                                        } : {})
                                    }}
                                >
                                    <Component
                                        {...item}
                                        index={index}
                                        labelName={displayLabel}
                                        disabled={[]}
                                        validateDefault={validateDefault}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {formState.isDropped && lastIndexData && (
                // When reordering, don't show at last position if dragging from last item
                !(formState.typeOfValue === 'default' && formState.fromIndex !== null && formState.fromIndex === lastIndex)
            ) && (
                <div
                    className="rs-form-builder-drop-box "
                    onDrop={(e) => handleDrop(e)}
                    onDragOver={(e) => handleDragOver(e)}
                >
                    <p className="text-center">{DROP_FIELD_HERE}</p>
                </div>
            )}

            <div
                onDrop={(e) => handleDrop(e)}
                onDragOver={(e) => handleDragOver(e, true)}
                onDragLeave={() => setTimeout(() => setLastIndexData(false), 5000)}
            >
                <AgreeCancel selectedColor={selectedColor} />
            </div>
        </div>
    );
};

export default memo(ListViewComponent);
