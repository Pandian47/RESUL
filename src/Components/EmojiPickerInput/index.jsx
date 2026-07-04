import { SMART_LINK_POPUP } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium, colorpicker_text_medium, editor_smart_link_medium, user_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import { MAX_SMART_LINKS, SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID } from 'Constants/GlobalConstant/InputLimit';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';

import RSEmojiPicker from 'Components/EmojiPicker';
import RSInput from 'Components/FormFields/RSInput';
import { useDispatch, useSelector } from 'react-redux';
import { splitTextForPersonalize } from './constant';
import RSColorPicker from 'Components/ColorPicker';
import RSTooltip from 'Components/RSTooltip';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { getSmartLinksListWithLabels } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';
import { handlePersonalization } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/constant';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';

const RSEmojiPickerInput = ({
    inputName,
    placeholder = 'Subject line',
    rules = {},
    personalizeData = ['[[Firstname]]|[[name]]', '[[Lastname]]|[[name]]'],
    isPersonalize = true,
    isColorPicker = false,
    inputSettings = {},
    colorPickerName = '',
    required = false,
    personalizationSettings = {},
    initColor = '',
    iconTopspace,
    maxLength = null,
    isTop = false,
    isEmoji = true,
    isClickOff = false,
    isClickOffInput = false,
    className = '',
    isSmartLink = false,
    getPayload = () => { },
    onlySmartCode = false,
    iconTopspaceValue,
    customRender = null,
    customInputClassName = '',
    onEmojiPickerOpen,
    onEmojiPickerClose,
    insertOption = { beforeSpace: true, afterSpace: true },
    isHighlight = false,
    preserveConsecutiveSpaces = true,
}) => {
    const inputRef = useRef();
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const smartLinkInsertLoader = useApiLoader();

    const { control, setValue, getValues, trigger, setError, watch } = useFormContext();
    const { personalization, listTypeWisePersonlization } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );
    const smartLinks = useSelector((state) => getSmartLinksListWithLabels(state));
    const handleSelectionChange = (e) => {
        inputRef.current = {
            startPosition: e.target.selectionStart,
            endPosition: e.target.selectionEnd,
        };
    };
    const handleSmartLink = async (e) => {
        const channelPayload = getPayload(e);
        const res = await smartLinkInsertLoader.refetch({
            fetcher: ({ payload } = {}) => dispatch(getSmartUrlDetailByChannel({ payload, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload: channelPayload },
        });
        if (res?.status) {
            handleChange({
                data: onlySmartCode
                    ? `${res?.data?.smartCode || ''}${res?.data?.blastSC || ''}`
                    : `${res?.data?.urlName || ''}${res?.data?.smartCode || ''}${res?.data?.blastSC || ''}`,
            });
        }
    };

    const handleOpenWithAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (smartLinks.length > 0) {
            dispatch(updateSmartLinkAutoAdd(true));
        }
        dispatch(updateSmartLinkModalState(true));
    };

    const handleChange = ({ data, insertOption: insertOptionOverride }) => {
        const spacing = insertOptionOverride ?? insertOption;
        const shouldAddBeforeSpace = spacing?.beforeSpace ?? false;
        const shouldAddAfterSpace = spacing?.afterSpace ?? false;

        var currentValue = getValues(inputName) || '';
        let newValue;
        let newCursorPosition;

        if (inputRef.current === undefined) {
            let dataToInsert = data;
            if (isHighlight && /^\[\[.*\]\]$/.test(data)) {
                dataToInsert = `{{${data}}}`;
            }
            const beforeSpace =
                currentValue && shouldAddBeforeSpace && currentValue.trim() !== '' ? ' ' : '';
            newValue = currentValue + beforeSpace + dataToInsert;
            newCursorPosition = newValue.length;
        } else {
            const selStart = inputRef.current.startPosition;
            const selEnd = inputRef.current.endPosition;
            let replacedPlaceholder = false;

            if (selStart !== undefined && selEnd !== undefined) {
                // Find if selection lies inside or on the boundaries of a placeholder: {{...}} or {...} or [[...]]
                const regex = /\{\{[^}]*\}\}|(?<!\{)\{[^{}]*\}(?!\})|\[\[[^\]]*\]\]/g;
                let match;
                while ((match = regex.exec(currentValue)) !== null) {
                    const matchStart = match.index;
                    const matchEnd = match.index + match[0].length;

                    const isInside = selStart !== selEnd
                        ? (selStart >= matchStart && selEnd <= matchEnd)
                        : (selStart > matchStart && selEnd < matchEnd);

                    if (isInside) {
                        if (match[0].startsWith('{{') && match[0].endsWith('}}')) {
                            const innerStart = matchStart + 2;
                            const innerEnd = matchEnd - 2;
                            const start = currentValue.slice(0, innerStart);
                            const end = currentValue.slice(innerEnd);
                            newValue = start + data + end;
                            newCursorPosition = innerStart + data.length;
                            replacedPlaceholder = true;
                            break;
                        } else if (match[0].startsWith('{') && match[0].endsWith('}')) {
                            if (isHighlight) {
                                const start = currentValue.slice(0, matchStart);
                                const end = currentValue.slice(matchEnd);
                                const wrappedData = /^\[\[.*\]\]$/.test(data) ? `{{${data}}}` : data;
                                newValue = start + wrappedData + end;
                                newCursorPosition = matchStart + wrappedData.length;
                            } else {
                                const innerStart = matchStart + 1;
                                const innerEnd = matchEnd - 1;
                                const start = currentValue.slice(0, innerStart);
                                const end = currentValue.slice(innerEnd);
                                newValue = start + data + end;
                                newCursorPosition = innerStart + data.length;
                            }
                            replacedPlaceholder = true;
                            break;
                        } else {
                            // Personalization token [[...]] (replace the entire token)
                            const start = currentValue.slice(0, matchStart);
                            const end = currentValue.slice(matchEnd);
                            if (isHighlight) {
                                const wrappedData = /^\[\[.*\]\]$/.test(data) ? `{{${data}}}` : data;
                                newValue = start + wrappedData + end;
                                newCursorPosition = matchStart + wrappedData.length;
                            } else {
                                newValue = start + data + end;
                                newCursorPosition = matchStart + data.length;
                            }
                            replacedPlaceholder = true;
                            break;
                        }
                    }
                }
            }

            if (!replacedPlaceholder) {
                let dataToInsert = data;
                if (isHighlight && /^\[\[.*\]\]$/.test(data)) {
                    dataToInsert = `{{${data}}}`;
                }
                var start = currentValue.slice(0, selStart);
                var end = currentValue.slice(selEnd);

                var beforeSpace = start && shouldAddBeforeSpace && start.trim() !== '' ? ' ' : '';
                var afterSpace = end && shouldAddAfterSpace && end.trim() !== '' ? ' ' : '';

                newValue = start + beforeSpace + dataToInsert + afterSpace + end;
                newCursorPosition =
                    selStart + beforeSpace.length + dataToInsert.length + afterSpace.length;
            }
        }
        if (newValue.length <= maxLength || !maxLength) {
            setValue(inputName, newValue);

            // Update cursor position reference
            if (inputRef.current !== undefined) {
                inputRef.current = {
                    startPosition: newCursorPosition,
                    endPosition: newCursorPosition,
                };
            }
            trigger(inputName);
        } else {
            setError(inputName, {
                type: 'custom',
                message: `Enter max. ${maxLength} characters`,
            });
        }
    };

    return (
        <Fragment>
            <div className={className}>
                <RSInput
                    control={control}
                    name={inputName}
                    placeholder={placeholder}
                    required={required}
                    className={customInputClassName}
                    isHighlight={isHighlight}
                    rules={{
                        ...rules,
                        validate: {
                            ...(rules.validate
                                ? typeof rules.validate === 'function'
                                    ? { originalValidation: rules.validate }
                                    : rules.validate
                                : {}),
                            personalizationValidation: (data) => {
                                const tokens = splitTextForPersonalize(data);
                                const pairs = [];
                                for (let i = 0; i < tokens.length - 1; i += 2) {
                                    pairs.push(`${tokens[i]}|${tokens[i + 1]}`);
                                }

                                const seen = new Set();
                                for (const pair of pairs) {
                                    if (seen.has(pair)) {
                                        return 'Duplicate personalization pair is not allowed';
                                    }
                                    seen.add(pair);
                                }
                                return true;
                            },
                        },
                    }}
                    onKeyUp={(e) => handleSelectionChange(e)}
                    onClick={(e) => handleSelectionChange(e)}
                    onMouseUp={(e) => handleSelectionChange(e)}
                    disabled={isClickOffInput}
                    maxLength={maxLength}
                    preserveConsecutiveSpaces={preserveConsecutiveSpaces}
                    {...inputSettings}
                />
                {customRender && (
                    customRender
                )}
            </div>
            <ul className={`align-items-center d-flex rli-space-5 rs-list-inline  ${!iconTopspace ? 'mt5' : iconTopspaceValue ? iconTopspaceValue : 'mt6'}`}>
                {isPersonalize && (
                    <li className={` mr15 ${isClickOff ? 'click-off' : ''}`}>
                        {/* <RSKendoIconDropdown
                                data={personalizeData}
                                icon={` ${user_question_mark_medium} icon-md color-primary-blue cp`}
                                control={control}
                                onItemClick={(e) => handleChange({ data: e.item.personalizationKey })}
                                name={'personalize'}
                                dataItemKey={'dataAttributeId'}
                                textField={'key'}
                                {...personalizationSettings}
                            /> */}

                        <RSBootstrapdown
                            data={handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization)}
                            flatIcon
                            isObject
                            fieldKey="key"
                            defaultItem={{
                                key: (
                                    <RSTooltip text="Personalization" className="lh0">
                                        <i
                                            className={`${user_question_mark_medium} icon-md`}
                                            id="rs_Emojipicker_personalization"
                                        />
                                    </RSTooltip>
                                ),
                            }}
                            // defaultItem={<i className={`${user_question_mark_medium} icon-md`} />}
                            className="no_caret"
                            showUpdate={false}
                            onSelect={(datas) => {
                                const tempData = datas.personalizationKey;

                                handleChange({ data: tempData });
                            }}
                            showSearch
                        />
                    </li>
                )}
                {isEmoji && (
                    <li className={`ml0 mr15 ${isClickOff ? 'click-off' : ''}`}>
                        <RSEmojiPicker
                            onEmojiSelect={(emoji) => handleChange({ data: emoji?.native })}
                            isTitle={true}
                            onOpen={onEmojiPickerOpen}
                            onClose={onEmojiPickerClose}
                        />
                    </li>
                )}
                {isColorPicker && (
                    <li className={`ml0 position-relative ${isTop ? '' : ''} custome_colorpicker`}>
                        <RSColorPicker
                            icon={colorpicker_text_medium}
                            onSelect={(e) => setValue(colorPickerName, e)}
                            initColor={initColor}
                            defaultIconColor={'#000000'}
                        />
                    </li>
                )}
                {isSmartLink &&
                    <li className="position-relative right-15 mt4">
                        <RSTooltip text={SMART_LINK_POPUP} className="lh0">
                            <RSBootstrapdown
                                data={smartLinks}
                                flatIcon
                                isObject
                                idKey="id"
                                fieldKey="menuLabel"
                                defaultItem={{
                                    id: SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
                                    menuLabel: (
                                        <i
                                            //title="Smart link"
                                            className={`${editor_smart_link_medium} icon-md`}
                                        />
                                    ),
                                }}
                                showUpdate={false}
                                name="smartlink"
                                className="no_caret"
                            isLoading={smartLinkInsertLoader.isLoading}
                                popupSettings={{
                                    popupClass: 'addImportSmartLinkDropdownListContainer',
                                }}
                                footer={
                                    smartLinks.length < MAX_SMART_LINKS ? (
                                        <div
                                            className="dropdown-footer-item"
                                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                            onClick={handleOpenWithAdd}
                                        >
                                            <span>Add Smart Link</span>
                                            <i className={`${circle_plus_fill_medium} icon-md color-primary-blue`} />
                                        </div>
                                    ) : null
                                }
                                onSelect={(e) => handleSmartLink(e, 'dynamic')}
                            />
                        </RSTooltip>
                    </li>}
            </ul>
        </Fragment>
    );
};

RSEmojiPickerInput.propTypes = {
    inputName: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    rules: PropTypes.object,
    personalizeData: PropTypes.array,
    isPersonalize: PropTypes.bool,
    isColorPicker: PropTypes.bool,
    inputSettings: PropTypes.object,
    colorPickerName: PropTypes.string,
    personalizationSettings: PropTypes.object,
    initColor: PropTypes.string,
    className: PropTypes.string,
    isSmartLink: PropTypes.bool,
    getPayload: PropTypes.func,
    onlySmartCode: PropTypes.bool,
    customInputClassName: PropTypes.string,
    onEmojiPickerOpen: PropTypes.func,
    onEmojiPickerClose: PropTypes.func,
    insertOption: PropTypes.shape({
        beforeSpace: PropTypes.bool,
        afterSpace: PropTypes.bool,
    }),
    isHighlight: PropTypes.bool,
    preserveConsecutiveSpaces: PropTypes.bool,
};

export default memo(RSEmojiPickerInput);
