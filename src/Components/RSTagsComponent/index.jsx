import { CATEGORY_NAME_ALLOWED_CHARACTERS, CATEGORY_NAME_MIN_LENGTH, MAXIMUM_CATEGORIES_ALLOWED, SAVE_CATEGORIES, SAVE_LABELS, SAVE_TAGS } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_REMOVE, ARE_YOU_SURE_WANT_TO_RESET, CANCEL, CLEAR, CLEAR_ALL_TAGS, ENTER_KEYWORDS, OK } from 'Constants/GlobalConstant/Placeholders';
import { clear_medium, clear_mini, pencil_edit_mini, recycle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import RSTooltip from 'Components/RSTooltip';

import RSConfirmationModal from 'Components/ConfirmationModal';
import { sanitizeAlphaNumUnderScoreHyphen } from 'Utils/modules/inputValidators';


const RSTagsComponent = ({
    tags: defaultTags,
    updatedTags = () => { },
    removedTags = () => { },
    deletedTags = () => { },
    errorMessage = '',
    isRefresh = true,
    isNoOfCharacters = false,
    maxLength = 80,
    required = false,
    cssScrollbar = false,
    tagsBig = false,
    size = null,
    placeholder = ENTER_KEYWORDS,
    isObject = false,
    offerCategory = false,
    scrollLastTagIntoViewOnAdd = false,
    fieldItemKey,
    isHash = false,
    isRemove = true,
    isallowSpecialCharacter = false,
    onTagClick = () => { },
    disabled = false,
    resultValue = () => { },
    isHashTag,
    returnObj = false,
    elementType = false,
    isRefreshTooltip = CLEAR_ALL_TAGS,
    customTagClass = 'rs-tags-wrapper-scroll',
    isLocalization = false,
    isCategories = false,
    isSubProductTypes = true,
    isDisabledRemove = false,
    onError = () => { },
    tooltipPosition = '',
    ignoreLength = false,
    isRemoveWarning = false,
    isRefreshWarning = false,
    removeText = ARE_YOU_SURE_REMOVE,
    fromForms = false,
    isEdit = false,
    preventSingleTagDeletion = false,
    isShowHeader = false,
    multiHeaderText = '',
    headerText = '',
    customRender = null,
    hideTagsSection = false,
    isAddTag = true,
    minChars = 3,
    showDeleteWarnig = false,
    tagWarningKey = '',
    tagWarningText = '',
    noBorder = false,
    ...props
}) => {
    const inputRef = useRef();
    const tagsListScrollRef = useRef(null);
    const tagsListScrollPositionRef = useRef(0);
    const prevTagsLengthForScrollRef = useRef(undefined);
    const skipApplyScrollAfterSingleAddRef = useRef(false);
    const [tags, setTags] = useState(defaultTags);
    const isRadioCheckbox = elementType === 'radio' || elementType === 'checkbox' ? true : false;
    const [newTags, setNewTags] = useState([]);
    const [tagKeyword, setTagKeyword] = useState('');
    const [error, setError] = useState(errorMessage);
    const [removeConfirmation, setRemoveConfirmation] = useState({
        show: false,
        tag: null,
        index: null,
    });
    const [refreshConfirmation, setRefreshConfirmation] = useState({
        show: false,
    });
    const [removalNotAllowedModal, setRemovalNotAllowedModal] = useState({
        show: false,
    });
    const [editingIndex, setEditingIndex] = useState(null);

    const focusInputKeepScroll = useCallback((inputEl) => {
        if (!inputEl) return;
        try {
            inputEl.focus({ preventScroll: true });
        } catch {
            inputEl.focus();
        }
    }, []);

    useEffect(() => {
        setError(errorMessage);
        onError(errorMessage);
    }, [errorMessage]);

    useEffect(() => {
        if (tags?.length < size) setTags(newTags);
    }, [newTags]);

    useEffect(() => {
        setTags(defaultTags);
    }, [defaultTags]);

    useEffect(() => {
        // Reset editing state when tags change externally
        if (editingIndex !== null && editingIndex >= tags.length) {
            setEditingIndex(null);
            setTagKeyword('');
        }
    }, [tags, editingIndex]);

    const captureTagsListScroll = () => {
        const el = tagsListScrollRef.current;
        if (el) {
            tagsListScrollPositionRef.current = el.scrollTop;
        }
    };

    const applyTagsListScroll = useCallback(() => {
        const el = tagsListScrollRef.current;
        if (!el) return;
        const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
        const next = Math.min(Math.max(0, tagsListScrollPositionRef.current), maxScroll);
        el.scrollTop = next;
    }, []);

    const handleTagsListScroll = useCallback((e) => {
        tagsListScrollPositionRef.current = e.currentTarget.scrollTop;
    }, []);

    useLayoutEffect(() => {
        const prevLen = prevTagsLengthForScrollRef.current;
        const currLen = tags?.length ?? 0;

        if (scrollLastTagIntoViewOnAdd) {
            if (skipApplyScrollAfterSingleAddRef.current && currLen === prevLen) {
                skipApplyScrollAfterSingleAddRef.current = false;
                prevTagsLengthForScrollRef.current = currLen;
                return;
            }
        }

        if (
            scrollLastTagIntoViewOnAdd
            && prevLen !== undefined
            && currLen === prevLen + 1
        ) {
            const id = requestAnimationFrame(() => {
                const ul = tagsListScrollRef.current;
                const lastLi = ul?.querySelector?.('li:last-child');
                if (lastLi && typeof lastLi.scrollIntoView === 'function') {
                    lastLi.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
            });
            skipApplyScrollAfterSingleAddRef.current = true;
            prevTagsLengthForScrollRef.current = currLen;
            return () => cancelAnimationFrame(id);
        }

        skipApplyScrollAfterSingleAddRef.current = false;
        applyTagsListScroll();
        const id = requestAnimationFrame(() => {
            applyTagsListScroll();
        });
        prevTagsLengthForScrollRef.current = currLen;
        return () => cancelAnimationFrame(id);
    }, [tags, applyTagsListScroll, scrollLastTagIntoViewOnAdd]);

    const tagIsUsed = (tag) => {
        if (!isObject || !tag) return false;
        const v = tag.isUsed;
        if (v === true) return true;
        if (v === false || v == null) return false;
        if (typeof v === 'string') return v.trim().toLowerCase() === 'true';
        return false;
    };

    const handleEditTag = (tagIndex) => {
        if (disabled || !isEdit) return;

        const tag = tags[tagIndex];
        if (tagIsUsed(tag)) return;

        let editText = '';

        if (isObject && tag) {
            editText = tag[fieldItemKey] || '';
        } else if (tag) {
            editText = typeof tag === 'string' ? tag : '';
        }

        setTagKeyword(editText);
        setEditingIndex(tagIndex);

        // Focus the input after state update
        setTimeout(() => {
            if (inputRef.current) {
                focusInputKeepScroll(inputRef.current);
                inputRef.current.select();
            }
        }, 0);
    };

    const getTotalTagsLength = () => (tags?.join?.('')?.length ?? 0);
    const getInputMaxLength = () => {
        if (ignoreLength) return maxLength;
        return isNoOfCharacters ? Math.max(0, maxLength - getTotalTagsLength()) : maxLength;
    };

    const onChange = (e) => {
        let { value } = e.target;
        let suppressSaveHint = false;

        if (offerCategory) {
            const rawValue = value;
            value = sanitizeAlphaNumUnderScoreHyphen(value);
            suppressSaveHint = rawValue !== value;
        } else {
            if (value.startsWith(' ')) {
                return;
            }
            // Remove leading spaces
            value = value.replace(/^\s+/, '');

            // Allow only single space between words
            value = value.replace(/\s{2,}/g, ' ');
        }

        const saveHint = isRadioCheckbox
            ? SAVE_LABELS
            : isCategories
              ? SAVE_CATEGORIES
              : SAVE_TAGS;
        const totalLimit = isNoOfCharacters ? Math.max(0, maxLength - getTotalTagsLength()) : maxLength;

        if (value.length <= totalLimit || ignoreLength) {
            setTagKeyword(value);
            if (!suppressSaveHint && value.length > 0) {
                setError(saveHint);
                onError(saveHint);
            } else if (suppressSaveHint) {
                setError('');
                onError('');
            }
        } else if (isNoOfCharacters && totalLimit > 0) {
            setTagKeyword(value.slice(0, totalLimit));
            if (!suppressSaveHint && value.length > 0) {
                setError(saveHint);
                onError(saveHint);
            } else if (suppressSaveHint) {
                setError('');
                onError('');
            }
        }
    };

    useEffect(() => {
        if (error && !tagKeyword) {
            setError('');
            onError('');
        }
    }, [tagKeyword, tags]);

    function updateTags(tags) {
        captureTagsListScroll();
        setTags(tags);
        setTagKeyword('');
        setEditingIndex(null);
        updatedTags(tags);
    }

    const getHashTag = (hastag) => {
        let finalHashtag;
        if (/\s+/.test(hastag)) {
            const splitValue = hastag.split(/\s+/);
            finalHashtag = `#${splitValue.join('')}`;
        } else {
            finalHashtag = `#${hastag}`;
        }
        return finalHashtag;
    };

    const getObjectFormatValue = (inputValue) => {
        let formatValue = {};
        const tagsLength = tags?.length + 1;
        if (tags?.length > 0) {
            Object.entries(tags[0]).map(([key, value]) => {
                if (typeof value === 'number') {
                    formatValue[key] = tagsLength;
                } else {
                    formatValue[fieldItemKey] = inputValue;
                }
            });
            return formatValue;
        } else if (defaultTags?.length > 0) {
            Object.entries(defaultTags[0]).map(([key, value]) => {
                if (typeof value === 'number') {
                    formatValue[key] = tagsLength;
                } else {
                    formatValue[fieldItemKey] = inputValue;
                }
            });
            return formatValue;
        } else {
            formatValue['id'] = tagsLength;
            formatValue[fieldItemKey] = inputValue;
            return formatValue;
        }
    };

    const onKeyDown = (e) => {
        const { key } = e;

        if (
            offerCategory &&
            key.length === 1 &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey &&
            !/^[a-zA-Z0-9_\-\s]$/.test(key)
        ) {
            e.preventDefault();
            return;
        }

        const trimmedInput = offerCategory
            ? sanitizeAlphaNumUnderScoreHyphen(tagKeyword.trim())
            : tagKeyword.trim();
        const normalizedInput = trimmedInput?.toLowerCase();
        const isSubmitKey = key === 'Enter' || key === ',';
        const isTotalLimitReached = isNoOfCharacters && getTotalTagsLength() >= maxLength;
        if (!trimmedInput?.length && isTotalLimitReached) {
            e.preventDefault();
            e.stopPropagation();
            setError(`Total character limit (${maxLength}) reached. Cannot add more.`);
            onError(`Total character limit (${maxLength}) reached. Cannot add more.`);
            return;
        }

        if (key === 'Enter' && !trimmedInput
            ?.length
        ) {
            e.preventDefault()
            e.stopPropagation();
            setError(`Minimum ${minChars} characters required`);
            onError(`Minimum ${minChars} characters required`);
            return
        }

        if (key === 'Enter' || key === ',') {

            // ✅ Category limit validation
            if (isCategories && tags?.length >= size) {
                e.preventDefault()
                e.stopPropagation();
                setError(MAXIMUM_CATEGORIES_ALLOWED);
                onError(MAXIMUM_CATEGORIES_ALLOWED);
                return;
            }

            // ✅ Empty validation
            // if (!trimmedInput.length) {
            //     setError("Minimum 3 characters required");
            //     onError("Minimum 3 characters required");
            //     return;
            // }

            // ✅ Minimum length validation
            if (trimmedInput.length < minChars || !trimmedInput.length) {
                e.preventDefault()
                e.stopPropagation();
                setError(`Minimum ${minChars} characters required`);
                onError(`Minimum ${minChars} characters required`);
                return;
            }
        }
        // Handle editing mode
        if ((key === 'Enter' || key === ',') && trimmedInput?.length) {
            if (isCategories) {
                // Check category limit first
                if (tags?.length >= size) {
                    setError(MAXIMUM_CATEGORIES_ALLOWED);
                    onError(MAXIMUM_CATEGORIES_ALLOWED);
                    return;
                }

                // Validate the entire input for categories
                if (trimmedInput.length < 3) {
                    setError(CATEGORY_NAME_MIN_LENGTH);
                    onError(CATEGORY_NAME_MIN_LENGTH);
                    return;
                }

            }
        }


        // Handle editing mode
        if (editingIndex !== null && editingIndex >= 0) {
            // When editing, allow all characters unless offerCategory (alphanumeric + _ - only)
            if (key === 'Enter' && trimmedInput.length) {
                e.preventDefault();
                const tempTags = [...tags];
                let valueToSet = trimmedInput;
                if (isNoOfCharacters) {
                    const otherLength = tempTags.reduce(
                        (sum, t, i) =>
                            i === editingIndex
                                ? sum
                                : sum + (typeof t === 'string' ? t.length : String(t?.[fieldItemKey] ?? '').length),
                        0,
                    );
                    const maxAllowed = maxLength - otherLength;
                    if (trimmedInput.length > maxAllowed) valueToSet = trimmedInput.slice(0, Math.max(0, maxAllowed));
                }
                if (isObject && tempTags[editingIndex]) {
                    // Update object tag
                    const updatedTag = { ...tempTags[editingIndex] };
                    updatedTag[fieldItemKey] = valueToSet;
                    tempTags[editingIndex] = updatedTag;
                } else {
                    // Update string tag
                    tempTags[editingIndex] = valueToSet;
                }

                updateTags(tempTags);
                return;
            }

            if (key === 'Escape') {
                e.preventDefault();
                setTagKeyword('');
                setEditingIndex(null);
                return;
            }

            // Allow all other keys when editing (don't prevent default)
            return;
        }

        const isDuplicate = tags?.some((tag) => {
            const normalizedTagValue =
                typeof tag === 'string' ? tag?.toLowerCase() : String(tag?.[fieldItemKey] ?? '').toLowerCase();
            return normalizedTagValue === normalizedInput;
        });

        if (isDuplicate && (key === 'Enter' || key === ',')) {
            e.preventDefault();
            e.stopPropagation();
            setError('Duplicate entries are not allowed');
            onError('Duplicate entries are not allowed');
            return;
        }


        // Handle adding new tag
        if ((key === 'Enter' || key === ',') && trimmedInput.length && editingIndex === null) {
            if (isNoOfCharacters) {
                const currentTotal = getTotalTagsLength();
                if (currentTotal + trimmedInput.length > maxLength) {
                    e.preventDefault();
                    e.stopPropagation();
                    setError(`Total character limit (${maxLength}) reached. Cannot add more.`);
                    onError(`Total character limit (${maxLength}) reached. Cannot add more.`);
                    return;
                }
            }
            let newTag;
            if (isObject && !offerCategory) {
                newTag = getObjectFormatValue(trimmedInput);
            } else {
                newTag = trimmedInput;
            }
            let tempTags = [...tags, newTag];
            if (key === ',') e.preventDefault();
            if (size !== null) {
                if (tempTags.length <= size) updateTags(tempTags);
                else setError('Cannot add more than ' + size);
            } else {
                updateTags(tempTags);
            }
        }

        if (key === 'Enter') e.preventDefault();
        // if (!tagKeyword.length && key === 'Backspace' && tags?.length && editingIndex === null) {
        //     if (preventSingleTagDeletion) {
        //         const lastTag = tags[tags.length - 1];
        //         if (lastTag?.disabled) {
        //             e.preventDefault();
        //             return;
        //         }
        //     }
        //     const tempTags = [...tags];
        //     tempTags.splice(-1, 1);
        //     setTags(tempTags);
        //     updateTags(tempTags);
        // }
    };

    const handleClearAllTags = () => {
        const isTagLocked = (tag) => {
            if (tagIsUsed(tag)) return true;
            if (tag?.[tagWarningKey] === true && showDeleteWarnig) return true;
            return false;
        };

        const linkedTags = tags?.filter((tag) => isTagLocked(tag)) || [];
        const unlinkedTags = tags?.filter((tag) => !isTagLocked(tag)) || [];

        setTags(linkedTags);
        updatedTags(linkedTags);

        if (unlinkedTags.length > 0) {
            deletedTags(unlinkedTags);
        }

        setTagKeyword('');
    };

    const deleteSelectedTag = (tagIndex, tag) => {
        if (tagIsUsed(tag)) {
            return;
        }
        // Check if tag has connected property set to true
        if (tag?.[tagWarningKey] === true && showDeleteWarnig) {
            setRemovalNotAllowedModal({ show: true });
            return;
        }

        const temp = [...tags].filter((_, index) => index !== tagIndex);
        removedTags(tag);
        const deletedData = [...tags].filter((_, index) => index == tagIndex);
        deletedTags(deletedData, tagIndex);
        captureTagsListScroll();
        setTags(temp);
        updatedTags(temp, deletedData, tagIndex);
    };

    return (
        <Fragment>
            <div
                className={`position-relative ${isEdit ? 'isEditTag' : ''}  p0 ${noBorder ? '' : 'border-r7 border'} 
    ${required ? 'required' : ''} 
    `}
                onClick={() => !hideTagsSection && focusInputKeepScroll(inputRef.current)}
            >
                {(!!error || !!errorMessage) && <div className="rs-tags-component validation-message">{error || errorMessage}</div>}
                {isShowHeader && (
                    <div className="border-bottom p10 mb0 d-flex align-items-center justify-content-between gap-3 flex-wrap">
                        <h4 className="mb0">{headerText}</h4>
                        {customRender ? <div className="d-flex align-items-center flex-shrink-0">{customRender}</div> : null}
                    </div>
                )}
                {multiHeaderText && (<h5 className='px10 py5 mx0'>{multiHeaderText}</h5>)}
                {!hideTagsSection && (
                <div className={`d-flex flex-column justify-content-between rs-tags-wrapper  
                    ${tagsBig ? 'rs-tags-wrapper-big' : ''}    
                      ${cssScrollbar ? 'css-scrollbar' : ''} 
                       ${customTagClass}   `}>
                    <ul
                        ref={tagsListScrollRef}
                        onScroll={handleTagsListScroll}
                        className={`py10 mx5 css-scrollbar mb-auto ${fromForms ? 'form-options' : ''}`.trim()}
                    >
                        {tags?.map((tag, tagIndex) => (
                            <li
                                key={tag + tagIndex}
                                className={`rs-tag ${disabled ? 'click-off pe-none' : !tag?.disabled ? 'cp' : preventSingleTagDeletion ? 'pe-none click-off' : ''}`}
                            >
                                <span
                                    className="rst-text"
                                    onClick={() => onTagClick(returnObj ? tag : isObject ? tag[fieldItemKey] : tag)}
                                >
                                    {isObject ? tag[fieldItemKey] : tag}
                                </span>
                                <span className="rst-tag-actions d-flex">
                                    {isEdit && !disabled && !tagIsUsed(tag) && (
                                        <span className="rst-tag-edit ">
                                            <RSTooltip
                                                text="Edit"
                                                position="top"
                                                innerContent={false}
                                                className="tag-tooltip lh0 mb5"
                                            >
                                                <i
                                                    className={`${pencil_edit_mini} color-primary-blue cp icon-sm`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditTag(tagIndex);
                                                    }}
                                                />
                                            </RSTooltip>
                                        </span>
                                    )}
                                    {isRemove && !tagIsUsed(tag) && (
                                        <span className="rst-tag-remove">
                                            <RSTooltip
                                                text="Remove"
                                                position="top"
                                                innerContent={false}
                                                className="tag-tooltip lh0"
                                                tooltipOverlayClass="toolTipOverlayZindexCSS"
                                            >
                                                <i
                                                    className="icon-rs-circle-minus-fill-mini color-primary-red"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteSelectedTag(tagIndex, tag);
                                                    }}
                                                />
                                            </RSTooltip>
                                        </span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                    {isAddTag ? (
                        <div className={` bg-tertiary-blue border-blr7 border-brr7 p5`}>
                            <div className='d-flex align-items-center gap-2'>

                                <span className={`d-flex align-items-center justify-content-between ${isLocalization ? 'localization_categories_keyword ' : ''}  p0  bg-white w-100 group`} style={{ position: 'unset' }}>
                                    <input
                                        placeholder={placeholder}
                                        ref={inputRef}
                                        value={tagKeyword}
                                        onChange={onChange}
                                        onKeyDown={onKeyDown}
                                        onFocus={(e) => e.target.parentNode.classList.add('active')}
                                        onBlur={(e) => {
                                            e.target.parentNode.classList.remove('active');
                                            resultValue(e.target.value);
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            let pasteContent = (e.clipboardData || window?.clipboardData).getData('text');
                                            if (offerCategory) {
                                                pasteContent = sanitizeAlphaNumUnderScoreHyphen(pasteContent);
                                                if (pasteContent.length > 40) {
                                                    setError(
                                                        'Pasted content is too long. Please enter text manually or paste shorter content.',
                                                    );
                                                    onError(
                                                        'Pasted content is too long. Please enter text manually or paste shorter content.',
                                                    );
                                                    return;
                                                }
                                                setError('');
                                                onError('');
                                                onChange({ target: { value: pasteContent } });
                                                if (inputRef.current) {
                                                    inputRef.current.value = pasteContent;
                                                }
                                                return;
                                            }
                                            // Check if content is too long and would be truncated to a React component
                                            if (
                                                !offerCategory &&
                                                pasteContent &&
                                                pasteContent.length > (isSubProductTypes ? 30 : 15)
                                            ) {
                                                setError(
                                                    'Pasted content is too long. Please enter text manually or paste shorter content.',
                                                );
                                                onError(
                                                    'Pasted content is too long. Please enter text manually or paste shorter content.',
                                                );
                                                return;
                                            }

                                            // Check for special characters that might cause issues
                                            const hasSpecialChars = /[^a-zA-Z0-9\s_\-/&]/.test(pasteContent);
                                            if (hasSpecialChars && !isallowSpecialCharacter) {
                                                setError('Pasted content contains invalid characters. Please enter text manually.');
                                                onError('Pasted content contains invalid characters. Please enter text manually.');
                                                return;
                                            }

                                            // If categories mode, apply category-specific validation
                                            if (isCategories) {
                                                if (!/^[a-zA-Z0-9_\-/&\s]+$/.test(pasteContent)) {
                                                    setError(CATEGORY_NAME_ALLOWED_CHARACTERS);
                                                    onError(CATEGORY_NAME_ALLOWED_CHARACTERS);
                                                    return;
                                                }
                                            }

                                            onChange({ target: { value: pasteContent } });
                                            if (inputRef.current) {
                                                inputRef.current.value = pasteContent;
                                            }
                                        }}
                                        disabled={disabled}
                                        {...props}
                                        maxLength={getInputMaxLength()}
                                    />
                                    {tagKeyword?.length > 0 ? (
                                        <div className="group-hidden group-hover-visible">
                                            <RSTooltip
                                                text={CLEAR}
                                                position="top"
                                                className="lh0"
                                                innerContent={false}
                                            >
                                                <i
                                                    className={`icon-xs color-primary-red ${clear_mini} cp mr5`}
                                                    onClick={() => {
                                                        setTagKeyword('');
                                                        focusInputKeepScroll(inputRef.current);
                                                    }}
                                                />
                                            </RSTooltip>
                                        </div>
                                    ) : null}
                                </span>

                                {isRefresh && (
                                    <div className='d-flex gap-2'>
                                        {/* <RSTooltip
                                    text={'Clear input'}
                                    position="left"
                                    className={`${isLocalization ? '' : ''} lh0`}

                                >
                                    <div className={`${disabled ? 'pe-none click-off' : ''}`}>
                                        <i
                                            id="rs_data_refresh"
                                            className={`${clear_medium} icon-md color-primary-blue cp rst-clear-tags`}
                                            onClick={() => {
                                                setTagKeyword('');
                                            }}
                                        ></i>
                                    </div>
                                </RSTooltip> */}
                                        <RSTooltip
                                            text={isRefreshTooltip}
                                            position="left"
                                            className={`${isLocalization ? '' : ''} lh0`}

                                        >
                                            <div className={`${disabled || !tags?.length ? 'pe-none click-off' : ''}`}>
                                                <i
                                                    id="rs_data_refresh"
                                                    className={`${recycle_medium} icon-md color-primary-blue cp rst-clear-tags`}
                                                    onClick={() => {
                                                        if (isRefreshWarning) {
                                                            setRefreshConfirmation({
                                                                show: true,
                                                            });
                                                        } else {
                                                            handleClearAllTags();
                                                        }
                                                    }}
                                                ></i>
                                            </div>
                                        </RSTooltip>
                                    </div>
                                )}
                            </div>
                        </div>) : null}
                </div>
                )}
            </div>
            {isNoOfCharacters && (
                <small className="text-end">
                    {getTotalTagsLength() + (tagKeyword?.length || 0)} / {maxLength}
                </small>
            )}

            {isRemoveWarning && removeConfirmation?.show && (
                <RSConfirmationModal
                    show={removeConfirmation?.show}
                    text={removeText}
                    primaryButtonText={OK}
                    handleClose={() => {
                        setRemoveConfirmation({
                            show: false,
                            tag: null,
                            index: null,
                        });
                    }}
                    handleConfirm={() => {
                        setRemoveConfirmation({
                            show: false,
                            tag: null,
                            index: null,
                        });
                        deleteSelectedTag(removeConfirmation?.index, removeConfirmation?.tag);
                    }}
                    secondaryButtonText={CANCEL}
                />
            )}
            {isRefreshWarning && refreshConfirmation?.show && (
                <RSConfirmationModal
                    show={refreshConfirmation?.show}
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    primaryButtonText={OK}
                    handleClose={() => {
                        setRefreshConfirmation({
                            show: false,
                        });
                    }}
                    handleConfirm={() => {
                        setRefreshConfirmation({
                            show: false,
                        });
                        handleClearAllTags();
                    }}
                    secondaryButtonText={CANCEL}
                />
            )}
            {removalNotAllowedModal?.show && (
                <RSConfirmationModal
                    show={removalNotAllowedModal?.show}
                    header="Removal not allowed"
                    text={tagWarningText}
                    primaryButtonText={OK}
                    handleClose={() => {
                        setRemovalNotAllowedModal({ show: false });
                    }}
                    handleConfirm={() => {
                        setRemovalNotAllowedModal({ show: false });
                    }}
                    primaryButton={true}
                    secondaryButton={false}
                />
            )}
        </Fragment>
    );
};

RSTagsComponent.propTypes = {
    updatedTags: PropTypes.func,
    removedTags: PropTypes.func,
    errorMessage: PropTypes.string,
    tags: PropTypes.array,
    isRefresh: PropTypes.bool,
    isNoOfCharacters: PropTypes.bool,
    maxLength: PropTypes.number,
    required: PropTypes.bool,
    cssScrollbar: PropTypes.bool,
    tagsBig: PropTypes.bool,
    placeholder: PropTypes.string,
    isObject: PropTypes.bool,
    fieldItemKey: PropTypes.string,
    isRemove: PropTypes.bool,
    onTagClick: PropTypes.func,
    resultValue: PropTypes.func,
    disabled: PropTypes.bool,
    isHash: PropTypes.bool,
    returnObj: PropTypes.bool,
    isSubProductTypes: PropTypes.bool,
    isDisabledRemove: PropTypes.bool,
    preventSingleTagDeletion: PropTypes.bool,
    isShowHeader: PropTypes.bool,
    multiHeaderText: PropTypes.string,
    headerText: PropTypes.string,
    customRender: PropTypes.node,
    hideTagsSection: PropTypes.bool,
    scrollLastTagIntoViewOnAdd: PropTypes.bool,
};

export default RSTagsComponent;
