import { AVAILABLE_COLUMNS_ATTRIBUTES, CANCEL, CLASSIFICATION_NAME, NO_ATTRIBUTES_AVAILABLE_TABLE, REMOVE, SAVE, SELECTED_COLUMNS_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { close_mini, save_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useRef, useState } from 'react';
import { ListBox, ListBoxToolbar, processListBoxData } from '@progress/kendo-react-listbox';
import { Col, Row } from 'react-bootstrap';
import { map as _map, findIndex as _findIndex } from 'Utils/modules/lodashReplacements';
import { useDispatch } from 'react-redux';

import RSModal from 'Components/RSModal';
import { FALLBACK_ATTRIBUTE_NAME, SELECT_LEFT_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { updateClassificationFallback } from 'Reducers/preferences/datacatalogue/request';
import { ENTER_FALLBACK_ATTRIBUTE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import RSSearchField from 'Components/RSSearchField';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const SELECTED_FIELD = 'selected';

const PersonalizationListbox = ({
    show,
    leftAttributes,
    rightAttributes,
    header,
    InputValue,
    showInput,
    handleClose,
    getSelectedData,
}) => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [state, setState] = useState({
        leftAttributes: leftAttributes,
        rightAttributes: rightAttributes,
    });
    const [loadingAttribute, setLoadingAttribute] = useState(null);
    const [search, setSearch] = useState({
        leftAttributes: '',
        rightAttributes: '',
    });
    const rightListRef = useRef(null);

    const submitFallback = async (dataItem, fallbackAttributeName) => {
        const dataattributeId = dataItem?.dataAttributeId;
        setLoadingAttribute(dataattributeId);
        const payload = {
            departmentId,
            clientId,
            userId,
            dataattributeId,
            fallbackAttributeName,
        };
        const res = await dispatch(updateClassificationFallback(payload));
        if (res?.status) {
            const tmpRight = [...state.rightAttributes];
            const right = _map(tmpRight, (attr) => {
                if (dataattributeId === attr.dataAttributeId) {
                    attr['input'] = false;
                    attr['fallbackAttributeName'] = fallbackAttributeName;
                }
                return attr;
            });
            setState((prev) => ({ ...prev, rightAttributes: right }));
            setLoadingAttribute(null);
        }
    };

    const handleItemClick = (event, data, connectedData) => {
        setState({
            ...state,
            [data]: state[data].map((item) => {
                if (item?.uIPrintableName === event?.dataItem?.uIPrintableName) {
                    item[SELECTED_FIELD] = !item[SELECTED_FIELD];
                } else if (!event.nativeEvent.ctrlKey) {
                    item[SELECTED_FIELD] = false;
                }
                return item;
            }),
            [connectedData]: state[connectedData].map((item) => {
                item[SELECTED_FIELD] = false;
                return item;
            }),
        });
    };

    const handleToolBarClick = (e) => {
        let toolName = e.toolName || '';
        let result = processListBoxData(state.leftAttributes, state.rightAttributes, toolName, SELECTED_FIELD);
        if (toolName === 'transferTo') {
            let tmp = _map(result.listBoxTwoData, (attr) => {
                if (
                    (attr.selected && attr.fallbackAttributeName === '') ||
                    (attr.selected && attr.fallbackAttributeName === null)
                ) {
                    attr['input'] = true;
                }
                return attr;
            });
            result['listBoxTwoData'] = tmp;
        }
        setState({
            leftAttributes: result.listBoxOneData,
            rightAttributes: result.listBoxTwoData,
        });
         if (toolName === 'transferTo') {
                setTimeout(() => {
                    scrollToNewInputField();
                }, 100);
            }
    };

    const handleRemoveAttribute = (dataItem) => {
        const left = [...state.leftAttributes];
        const right = [...state.rightAttributes];
        right.forEach(function (elem) {
            const existingIndex = _findIndex(right, { dataAttributeId: dataItem?.dataAttributeId });
            if (existingIndex !== -1) {
                right.splice(existingIndex, 1);
                left.push(elem);
            }
        });
        setState({ leftAttributes: left, rightAttributes: right });
    };

    const searchedAttrs = (val = 'left') => {
        const finder = `${val}Attributes`;
        if (search[finder])
            return state[finder]?.filter((attr) =>
                attr.uIPrintableName?.toLowerCase()?.includes(search[finder].toLowerCase()),
            );
        return state[finder];
    };

    const submitStatus = () => {
        const invalid = state.rightAttributes?.filter((attr) => attr.input);
        if (invalid?.length) return false;
        return true;
    };


    const scrollToNewInputField = () => {
        // debugger
        if (rightListRef.current) {
            // Find the first input field that needs fallback attribute
            const firstInputField = rightListRef.current.querySelector('.fallBackNameInput');
            if (firstInputField) {
                firstInputField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                // Focus on the input field for better UX
                setTimeout(() => {
                    firstInputField.focus();
                }, 200);
            }
        }
    };

    return (
        <RSModal
            show={show}
            size="lg"
            header={header}
            handleClose={handleClose}
            body={
                <Fragment>
                    {showInput && (
                        <Row>
                             <Col sm={3} className='pr0'>
                                <div className='fs19'>{CLASSIFICATION_NAME}</div>
                            </Col>

                            <Col sm={9}>
                                <div className="form-group rs-input-wrapper">
                                    <input type={'text'} name={'attributeName'} disabled value={InputValue} />
                                </div>
                            </Col>
                        </Row>
                    )}
                    <>
                        {leftAttributes?.length || rightAttributes?.length ? (
                            <>
                                <div className="new-popup-drag">
                                    <div className="multiSelect">
                                        <div className="multiClm multiLftClm">
                                            <h4 className="m0 py10">{AVAILABLE_COLUMNS_ATTRIBUTES}</h4>
                                            {state.leftAttributes?.length > 6 && (
                                                <RSSearchField
                                                    searchedText={(text) => {
                                                        setSearch((prev) => ({ ...prev, leftAttributes: text }));
                                                    }}
                                                    debounceOnChange={true}
                                                />
                                            )}
                                            {searchedAttrs('left')?.length ? (
                                                <ListBox
                                                    data={searchedAttrs('left')}
                                                    textField="uIPrintableName"
                                                    selectedField={SELECTED_FIELD}
                                                    onItemClick={(e) => {
                                                        handleItemClick(e, 'leftAttributes', 'rightAttributes');
                                                    }}
                                                    toolbar={() => {
                                                        return (
                                                            <ListBoxToolbar
                                                                tools={['transferTo', 'transferFrom']}
                                                                data={searchedAttrs('left')}
                                                                dataConnected={state.rightAttributes}
                                                                onToolClick={handleToolBarClick}
                                                            />
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <div className="multiClm k-listbox k-list border">
                                                    <NoDataAvailableRender />
                                                </div>
                                            )}
                                        </div>
                                        <div className="multiClm multiRghtClm">
                                            <h4 className="m0 py10">{SELECTED_COLUMNS_ATTRIBUTES}</h4>
                                            {state.rightAttributes?.length > 6 && (
                                                <RSSearchField
                                                    searchedText={(text) => {
                                                        setSearch((prev) => ({ ...prev, rightAttributes: text }));
                                                    }}
                                                    debounceOnChange={true}
                                                />
                                            )}
                                            {searchedAttrs('right')?.length ? (
                                                <div ref={rightListRef}>
                                                    <ListBox
                                                        data={searchedAttrs('right')}
                                                        textField="uIPrintableName"
                                                        selectedField={SELECTED_FIELD}
                                                        onItemClick={(e) => {
                                                            handleItemClick(e, 'rightAttributes', 'leftAttributes');
                                                        }}
                                                        item={(props) =>
                                                            Component(
                                                                props,
                                                                handleRemoveAttribute,
                                                                loadingAttribute,
                                                                submitFallback,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div className="multiClm k-listbox k-list border"> 
                                                    <NoDataAvailableRender message={SELECT_LEFT_ATTRIBUTES} isShowIcon={false} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <NoDataAvailableRender
                                className="d-flex position-relative text-align-center justify-content-center"
                                message={NO_ATTRIBUTES_AVAILABLE_TABLE}
                            />
                        )}
                    </>
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        className={`${!submitStatus() ? 'click-off' : ''}`}
                        onClick={() => {
                            if (submitStatus()) getSelectedData(state);
                        }}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default PersonalizationListbox;

const Component = ({ dataItem, ...others }, handleRemoveAttribute, loadingAttribute, submitFallback) => {
    const ref = useRef();
    const [error, setError] = useState();

    return (
        <li {...others} key={others.id} className={`${others.className} fallBackNameCSS`}>
            <p> {dataItem?.uIPrintableName}</p>
            {dataItem?.input ? (
                <div className="d-flex justify-content-between">
                    <div className="fallBackNameInput">
                        <input
                            ref={ref}
                            onChange={() => {
                                if (error) setError('');
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={FALLBACK_ATTRIBUTE_NAME}
                        />
                        {error && <span className="text-danger">{error}</span>}
                        <div className="fallBackNameRemove">
                            <RSTooltip position="top" text={REMOVE}>
                                <i
                                    className={`${close_mini} font-xxs`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveAttribute(dataItem);
                                    }}
                                    id="rs_Component_close"
                                ></i>
                            </RSTooltip>
                        </div>
                    </div>
                    {loadingAttribute ? (
                        <div className="fallBackNameLoader">
                            <div className="segment_loader float-start"></div>
                        </div>
                    ) : (
                        <div className="fallBackNameSubmit" style={{ height: '27px' }}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const {
                                        current: { value },
                                    } = ref;
                                    if (!value) {
                                        setError(ENTER_FALLBACK_ATTRIBUTE_NAME);
                                    } else {
                                        submitFallback(dataItem, value);
                                    }
                                }}
                            >
                                <RSTooltip position="top" text={SAVE}>
                                    <i className={`${save_mini} icon-xs`}></i>
                                </RSTooltip>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <small>{dataItem?.fallbackAttributeName}</small>
            )}
        </li>
    );
};
