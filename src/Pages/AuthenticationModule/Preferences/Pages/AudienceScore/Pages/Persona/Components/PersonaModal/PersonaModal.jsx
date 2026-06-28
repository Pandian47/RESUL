import { FORM_INITIAL_STATE, GET_PERSONA_LISTS, INITIAL_STATE, LEFT_PANEL_RESPONSE, STATE_REDUCER, _isAttributesErrors, getFieldObject, getFieldType } from './constant';
import { createContext, useEffect, useReducer, useRef, useState } from 'react';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { Col, Row } from 'react-bootstrap';
import Attributes from 'Pages/AuthenticationModule/Components/Attributes/Attributes';
import SegmentationLists from 'Pages/AuthenticationModule/Components/SegmentationLists/SegmentationLists';
import { FormProvider, useForm } from 'react-hook-form';
import PersonaSaveModal from '../PersonaSaveModal/PersonaSaveModal';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFullAttributeJSONValues, getTargetListPanel } from 'Reducers/audience/targetListCreation/request';
export const TargetListContext = createContext();
import { getSessionId } from 'Reducers/globalState/selector';
import { savePersona, updatePersona } from 'Reducers/preferences/audienceScore/request';
import { update_target_list } from 'Reducers/audience/targetListCreation/reducer';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const PersonaModal = ({ show, handleClose, setIsShowPersona }) => {
    const [editData, setEditData] = useState([]);
    const { state } = useLocation();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [targetListState, dispatchState] = useReducer(STATE_REDUCER, INITIAL_STATE);
    const { leftPanelAttributes, filterGroups, attributesError, isSavePersona } = targetListState;
    const filteredLeftPanelAttributes = leftPanelAttributes?.filter((item) => !item?.Source);
    const value = { targetListState, dispatchState };
    const { leftPanelAtt, editList, fullAttributeJSONValues } = useSelector(({ dataTargetListReducer }) => dataTargetListReducer);
    const filterGroupRef = useRef();
    let mode = state?.mode || 'create';
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: mode === 'edit' ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;

    const methods = useForm(FORM_INITIAL_STATE);
    const {
        getValues,
        setValue,
        trigger,
        handleSubmit,
        resetField,
        watch,
        formState: { isValid, isDirty },
    } = methods;
    console.log('watch: ', watch());
    const attributes = getValues();
    const { filterLists } = attributes;

    useEffect(() => {
        if (leftPanelAtt?.attributesList?.length === undefined || leftPanelAtt?.attributesList?.length === 0) {
            dispatchState({
                type: 'UPDATE',
                field: 'attributesLoading',
                payload: true,
            });
            dispatch(
                getTargetListPanel({
                    payload: {
                        departmentId,
                        clientId,
                        userId,
                        partnerID: 0,
                    },
                    dispatchState,
                }),
            );
        }
    }, [leftPanelAtt]);
    const handleFullJSONAPI = async () => {
        if (!fullAttributeJSONValues?.length) {
            let payload = {
                clientId,
                departmentId,
                userId,
            };
           dispatch(getFullAttributeJSONValues({ payload, dispatchState, from: 'targetList' }));
        }
    };
    useEffect(() => {
        handleFullJSONAPI();
    }, [fullAttributeJSONValues?.length]);
    useEffect(() => {
        getDataAttributes(leftPanelAtt, 'default');
        return () => {
            dispatch(update_target_list({ field: 'editList', data: [] }));
        };
    }, [leftPanelAtt]);
    useEffect(() => {
        return () => {
            dispatch(update_target_list({ field: 'editList', data: [] }));
            dispatch(update_target_list({ field: 'fullAttributeJSONValues', data: [] }));
        };
    }, []);
    const getCategoryGroupKey = (categoryGroup) => {
        if (!categoryGroup || typeof categoryGroup !== 'object') return '';
        return Object.keys(categoryGroup).find((key) => key !== 'isExpanded') ?? '';
    };

    const getDataAttributes = (data, field) => {
        const res = data; // LEFT_PANEL_RESPONSE;

        const attributesData = (res?.brand_category ?? []).map((category) => {
            const attributesLists = res?.attributesList?.filter((attribute) => attribute.category === category);
            return { [category]: attributesLists };
        });
        const leftpanelAttributes = (attributesData ?? []).map((attribute) => {
            const categoryKey = getCategoryGroupKey(attribute);
            const value = attribute[categoryKey] ?? [];
            const sortedValues = [...value].sort((a, b) => b.sOLRCountValue - a.sOLRCountValue);
            return { [categoryKey]: sortedValues?.slice(0, 5), isExpanded: 0 };
        });

        const expandedKeys = leftpanelAttributes
            ?.map((attribute) => getCategoryGroupKey(attribute)?.toLowerCase())
            .filter(Boolean);
        const attributes = [];
        attributesData
            ?.filter((attribute, _) => {
                const [entries] = Object.entries(attribute);
                const [key, value] = entries;
                if (expandedKeys?.includes(key?.toLowerCase())) {
                    return value;
                }
            })
            ?.forEach((attribute) => attributes.push(...Object.values(attribute)?.flat()));

        dispatchState({
            type: 'UPDATE_ATTRIBUTES',
            field: field,
            payload: {
                attributesData: attributesData,
                leftPanelAttributes: leftpanelAttributes,
                searchAttributes: attributes,
            },
        });
        dispatchState({
            type: 'UPDATE',
            field: 'attributeTypes',
            payload: LEFT_PANEL_RESPONSE?.data?.filterValues, //res?.data?.filterValues?.filterValues,
        });
        if (mode === 'edit' && editList?.personaRule?.length > 0) {
            setEditData(editList?.personaName);
            getPersonaLists(attributesData, leftpanelAttributes, editList?.personaRule);
        }
    };

    const getPersonaLists = (attributesData, leftpanelAttributes, tempEditData) => {
        const res = GET_PERSONA_LISTS.data;
        let allAtttributes = [];
        attributesData?.forEach((attribute) => {
            let values = Object.values(attribute)[0];
            allAtttributes.push(...values);
        });
        let tempAttributes = [];
        const filterFields =
            tempEditData?.length &&
            tempEditData?.map((field, _) => {
                const findCategory = allAtttributes.find((attribute, _) => {
                    // return field?.SOLRFieldName?.split('_')[0] === attribute?.sOLRFieldName;
                    return field?.SOLRFieldName === attribute?.sOLRFieldName;
                });
                if (!tempAttributes?.includes(field?.SOLRFieldName)) {
                    tempAttributes?.push(field?.SOLRFieldName);
                }
                const fieldType = getFieldType(
                    field.SOLRFieldName?.split('_')[field.SOLRFieldName?.split('_')?.length - 1],
                );
                const fieldObject = getFieldObject(field, fieldType, findCategory?.category);
                return fieldObject;
            });
        tempAttributes?.forEach((attribute) => {
            let labelText = attribute?.split('_')[0];
            filterGroupRef.current?.getAttributes(labelText);
        });
        let filterValues = allAtttributes?.filter((attribute) => {
            return tempAttributes?.includes(attribute?.sOLRFieldName);
        });
        let newLeftPanelAttributes = leftpanelAttributes?.map((attribute) => {
            const categoryKey = getCategoryGroupKey(attribute);
            const getNameForAllAttributes = attribute[categoryKey]?.map((item) => item.name) ?? [];
            const filteredCategory = filterValues?.filter((fitem) => {
                return (
                    categoryKey?.toLowerCase() === fitem.Category?.toLowerCase() &&
                    !getNameForAllAttributes?.includes(fitem?.Field)
                );
            });
            if (filteredCategory?.length) {
                attribute[categoryKey]?.push(...filteredCategory);
            }
            return attribute;
        });
        const newAttributesData = attributesData?.map((categoryGroup) => {
            const categoryKey = getCategoryGroupKey(categoryGroup);
            const existingList = categoryGroup[categoryKey] ? [...categoryGroup[categoryKey]] : [];
            const filteredCategory = filterValues?.filter((fitem) => {
                return (
                    categoryKey?.toLowerCase() === fitem.Category?.toLowerCase() &&
                    !existingList.some((item) => (item.name ?? item.Field) === fitem.Field)
                );
            });
            if (filteredCategory?.length) {
                return { [categoryKey]: [...existingList, ...filteredCategory] };
            }
            return categoryGroup;
        });
        setValue('filterLists', filterFields);
        dispatchState({
            type: 'UPDATE',
            payload: newAttributesData ?? [],
            field: 'attributesData',
        });
        dispatchState({
            type: 'UPDATE',
            payload: newLeftPanelAttributes,
            field: 'leftPanelAttributes',
        });
    };

    const appendSelectedList = (type, payload) => {
        switch (type) {
            case 'filterLists':
                filterGroupRef.current.appendPayload(payload);
                break;
        }
    };

    const findAttributeTypeName = (attrs = {}, val = '', fieldType = '') => {
        let obj = {};
        if (fieldType === '4' || fieldType === '3') obj = attrs['Integer'];
        else if (fieldType === '8') obj = attrs['DateTime'];
        else obj = attrs['String'];
        return Object.keys(obj).find((key) => obj[key] === val);
    };

    const isCreateStatus = () => {
        return isDirty && !!filterLists?.length;
    };
    const savePersonaRule = async (name) => {
        const getSerializedAttributeValue = (rule) => {
            const attributeValue = rule?.attributeValue;
            const attributeValueOne = rule?.attributeValueOne;
            const fieldType = String(rule?.fieldType || '');
            const attributeType = rule?.attributeType;

            if (fieldType === '1') {
                if (Array.isArray(attributeValue)) {
                    return attributeValue
                        .map((item) => (typeof item === 'object' ? item?.data : item))
                        .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
                        .join(', ');
                }
                return attributeValue || '';
            }

            if ((fieldType === '3' || fieldType === '4' || fieldType === '8') && attributeType === 'Between') {
                return `${attributeValue || ''}:${attributeValueOne || ''}`;
            }

            return attributeValue;
        };

        let personalRuleValue = filterLists.map((res, ind) => {
            let betweenValue = findAttributeTypeName(
                LEFT_PANEL_RESPONSE?.data?.filterValues,
                res.attributeType,
                res.fieldType,
            );
            let value = getSerializedAttributeValue(res);
            return {
                SequenceId: ind,
                Category: res?.category,
                FieldName: res?.labelText,
                Value: value,
                // ConditionOperator: 'in',
                ConditionOperator: findAttributeTypeName(
                    LEFT_PANEL_RESPONSE?.data?.filterValues,
                    res.attributeType,
                    res.fieldType,
                ),
                ExpressionOperator: 'And',
                QueryType: 'f',
                FieldTypeID: res?.fieldType,
                SOLRFieldName: res?.sOLRFieldName,
                dataAttributeId: res?.dataAttributeId,
            };
        });
        const payload = {
            clientId,
            departmentId,
            userId,
            personaRule: personalRuleValue,
            personaName: name,
            personaId: mode === 'edit' ? state?.personaListID : 0,
        };

        const res = await saveApi.refetch({
            fetcher: () =>
                dispatch(mode === 'edit' ? updatePersona(payload, false) : savePersona(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: mode === 'edit' ? 'edit' : 'create',
        });
        if (res?.status) {
            dispatchState({
                type: 'UPDATE',
                payload: false,
                field: 'isSavePersona',
            });
            setIsShowPersona(true);
            resetField('filterLists');
        }
    };
    const isDisableFilterGroup = filterLists?.length > 9;
    const isDisableFilterGroupName = 'filterLists';
    return (
        <FormProvider {...methods}>
            <TargetListContext.Provider value={value}>
                <div>
                    <RSModal
                        settings={{ className: 'targetListPage definePersonaCSS' }}
                        show={!isSavePersona && show}
                        size="xxlg"
                        header={`${mode === 'edit' ? 'Edit': 'Create'} persona`}
                        body={
                            <div>
                                <Row>
                                    <Col sm={3} className="sticky">
                                        <Attributes
                                            data={filteredLeftPanelAttributes}
                                            targetListContext={TargetListContext}
                                            getSelectedList={(activegroup, payload) => {
                                                appendSelectedList(activegroup, payload);
                                            }}
                                            isAdd
                                            isDisable={isDisableFilterGroup}
                                            isDisableGroup={isDisableFilterGroupName}
                                        />
                                    </Col>
                                    <Col sm={9} className="rs-targetList-rightSide ml0 mt15">
                                        <form
                                            onSubmit={handleSubmit((data) =>
                                                void 0,
                                            )}
                                        >
                                            {filterGroups.groups?.map((group, groupIndex) => {
                                                return (
                                                    <SegmentationLists
                                                        isUpdate={mode === 'edit'}
                                                        key={group}
                                                        targetListContext={TargetListContext}
                                                        fieldName={group}
                                                        index={groupIndex}
                                                        activeGroup={filterGroups.activeGroup}
                                                        ref={filterGroupRef}
                                                        getSelectedList={(activegroup, payload) =>
                                                            appendSelectedList(activegroup, payload)
                                                        }
                                                        isDisable={isDisableFilterGroup}
                                                        isDisableGroup={isDisableFilterGroupName}
                                                    />
                                                );
                                            })}
                                        </form>
                                        <div className="buttons-holder mt0">
                                            <RSSecondaryButton
                                                onClick={() => {
                                                    handleClose(false);
                                                    resetField('filterLists');
                                                }}
                                            >
                                                Cancel
                                            </RSSecondaryButton>
                                            <RSPrimaryButton
                                                type="submit"
                                                className={!isCreateStatus() ? 'click-off' : ''}
                                                onClick={() => {
                                                    // if (isValid && _isAttributesErrors(attributesError)) {
                                                    if (_isAttributesErrors(attributesError)) {
                                                        //         // setIsShowPersona(false);
                                                        //         // dispatchState({
                                                        //         //     type: 'UPDATE',
                                                        //         //     payload: true,
                                                        //         //     field: 'isSavePersona',
                                                        //         // });
                                                        //     } else {
                                                        //         trigger();}

                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: true,
                                                            field: 'isSavePersona',
                                                        });
                                                    }
                                                }}
                                            >
                                                {mode === 'add' ? 'Create' : 'Save'}
                                            </RSPrimaryButton>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        }
                        handleClose={() => {
                            handleClose(false);
                            resetField('filterLists');
                        }}
                    />
                </div>
                {/* Modal */}
                {isSavePersona && (
                    <PersonaSaveModal
                        show={isSavePersona}
                        isEdit={mode}
                        isEditData={editData}
                        isSaveLoading={isSaveLoading}
                        handleSave={(data) => {
                            if (data?.length > 0) {
                                savePersonaRule(data);
                            }
                        }}
                        handleClose={() => {
                            if (isSaveLoading) return;
                            dispatchState({
                                type: 'UPDATE',
                                payload: false,
                                field: 'isSavePersona',
                            });
                            // resetField('filterLists');
                        }}
                    />
                )}
            </TargetListContext.Provider>
        </FormProvider>
    );
};

export default PersonaModal;
