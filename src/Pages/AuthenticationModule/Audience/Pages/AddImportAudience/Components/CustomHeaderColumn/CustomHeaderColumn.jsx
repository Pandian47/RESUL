import { NOT_BRAND_LOGO, SELECT_DIFFERENT_ATTRIBUTE } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_REMOVE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import _get from 'lodash/get';
import { useForm } from 'react-hook-form';
import { KendoIconDropdown } from 'Components/RSDropDown';
import ResKendoDropdown from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';
import { setAttrError } from '../../constant';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSTooltip from 'Components/RSTooltip';
import NewAttributeBtn from './NewAttributeBtn';
import {
    getHeaderMappingDropdownErrorClassName,
    getHeaderMappingDropdownErrorMessageClassName,
    HEADER_MAPPING_DD_CLASS,
    shouldUseHeaderMappingDropdownErrorContainer,
} from './constant';
import useQueryParams from 'Hooks/useQueryParams';
import { updateImportAudience } from 'Reducers/audience/addAudience/reducer';
import { useDispatch, useSelector } from 'react-redux';

let deletedAttribute = [];

const getMappingFieldName = (columnIndex) => `mappingAttribute_${columnIndex}`;

const isEmptyAttributeSelection = (value) =>
    !value || value === 'Select ...' || value?.attributeName === 'Select';

const CustomHeaderColumn = (prop, index, audienceState, dispatchState) => {
    const [show, setShow] = useState(false);
    const state = useQueryParams('/audience/add-import-audience');
    const listType = _get(state, 'data.listType', 'Target list');
    const { attributeMappingData } = useSelector(({ addAudienceReducer }) => addAudienceReducer);
    const dispatch = useDispatch();

    const {
        selectedAttribute,
        uniqueKeyIndex: keyIndex,
        dataAttributes,
        attributesError,
        primarykey,
        ResulToCRM,
    } = audienceState;

    const fieldName = getMappingFieldName(index);
    const { control, setValue, setError, clearErrors } = useForm({
        defaultValues: {
            [fieldName]: selectedAttribute?.[index] ?? null,
        },
    });

    useEffect(() => {
        setValue(fieldName, selectedAttribute?.[index] ?? null);
    }, [fieldName, index, selectedAttribute, setValue]);

    useEffect(() => {
        const fieldError = attributesError?.[index];
        if (fieldError && fieldError !== 'Brand attribute does not selected') {
            setError(fieldName, { type: 'manual', message: fieldError });
            return;
        }
        clearErrors(fieldName);
    }, [attributesError, clearErrors, fieldName, index, setError]);

    const iconSelection = (e, iconIdx, manual) => {
        dispatchState({ type: 'UPDATE', payload: [], field: 'attributesError' });
        if (!manual && selectedAttribute[iconIdx]?.isBrandId && e.name === 'user') {
            setAttrError(audienceState, dispatchState, NOT_BRAND_LOGO, index, false);
        } else {
            const tempPrimaryKey = [...primarykey];
            const tempIconState = [...tempPrimaryKey[index].iconList];
            const removeSelectedIcon = tempIconState.splice(iconIdx, 1)[0];
            const currentItem = tempPrimaryKey[index].selectedIcon;
            tempIconState.push(currentItem);
            tempPrimaryKey[index] = {
                selectedIcon: removeSelectedIcon,
                iconList: tempIconState,
            };
            let uniqueKeyIndex = null;
            if (index !== keyIndex && e.name === 'user') uniqueKeyIndex = index;
            else if (index === keyIndex && e.name !== 'user') uniqueKeyIndex = null;
            dispatchState({
                type: 'PRIMARY_KEY',
                payload: {
                    primarykey: tempPrimaryKey,
                    uniqueKeyIndex,
                },
            });
        }
    };

    const validateSelectedAttribute = ({ value }) => {
        const findDuplicateAttribute = selectedAttribute?.find(
            (att) => att?.attributeName === value?.attributeName,
        );
        const tempData = [...selectedAttribute];
        const tempError = [...attributesError];

        if (findDuplicateAttribute) {
            tempData[index] = undefined;
            tempError[index] = SELECT_DIFFERENT_ATTRIBUTE;
            setValue(fieldName, null);
        } else {
            tempError[index] = null;
            if (value?.attributeName === 'New attribute') {
                // handled via footer modal
            } else if (isEmptyAttributeSelection(value)) {
                tempData[index] = undefined;
            } else {
                if (value.isBrandId) iconSelection({ name: 'user' }, 0, 'manual');
                else if (primarykey[index]?.selectedIcon.name === 'user')
                    iconSelection({ name: 'settings' }, 0, 'manual');
                tempData[index] = { ...value, index };
            }
        }

        dispatchState({
            type: 'UPDATE_ATTRIBUTE',
            payload: {
                selectedAttribute: tempData,
                attributesError: tempError,
            },
        });
    };

    const handleModalAttribute = () => {
        dispatchState({
            type: 'NEW_ATTRIBUTE',
            payload: {
                isNewAttributeModal: true,
                selectedNewAttribute: {
                    props: prop,
                    index,
                },
            },
        });
    };

    const canRemoveColumn =
        audienceState?.audienceColumn?.length > 1 && primarykey[index]?.selectedIcon.name !== 'user';
    const isPrimaryKeyColumn = primarykey[index]?.selectedIcon.name === 'user';
    const selectedValue = selectedAttribute?.[index];

    return (
        <div className="aud_mappingScreen">
            {canRemoveColumn && (
                <span className="aud_mappingRemoveSlot">
                    <RSTooltip text="Remove column" innerContent={false}>
                        <span
                            className="aud_mappingRemoveBtn"
                            role="button"
                            tabIndex={0}
                            onClick={() => setShow(true)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setShow(true);
                                }
                            }}
                        >
                            <i
                                id="rs_data_circle_minus_fill_edge"
                                className={`${circle_minus_fill_edge_medium} remove_aud_mappingIcon icon-md color-primary-red`}
                            />
                        </span>
                    </RSTooltip>
                </span>
            )}
            <div className={`addImportAudienceDropdown ${isPrimaryKeyColumn ? 'pe-none' : ''}`}>
                <ResKendoDropdown
                    control={control}
                    name={fieldName}
                    data={dataAttributes}
                    dataItemKey="dataAttributeId"
                    textField="attributeName"
                    label={selectedValue?.attributeName ? '' : 'Select'}
                    placeholder="Select"
                    popupClass="addImportAudienceDropdownListContainer"
                    className={HEADER_MAPPING_DD_CLASS}
                    isError
                    useErrorContainer={shouldUseHeaderMappingDropdownErrorContainer}
                    errorClassName={getHeaderMappingDropdownErrorClassName}
                    errorMessageClassName={getHeaderMappingDropdownErrorMessageClassName}
                    handleChange={(e) => validateSelectedAttribute({ value: e.value })}
                    footer={
                        listType !== 'Seed list' && !ResulToCRM ? (
                            <NewAttributeBtn title="New attribute" handleModalAttribute={handleModalAttribute} titleClassName = {'fs15'} iconSize = {'sm'}/>
                        ) : null
                    }
                />
            </div>
            <div className="addImportAudienceKendoIconDropdown pe-none click-off">
                <KendoIconDropdown
                    icon={` ${primarykey[index]?.selectedIcon?.iconSource} white icon-md`}
                    data={primarykey[index]?.iconList}
                    isCustomRender
                    itemRender={({ item }) => <>{item.icon}</>}
                    popupSettings={{
                        popupClass: 'addImportAudienceDropdownContainer',
                    }}
                />
            </div>
            <RSConfirmationModal
                show={show}
                text={ARE_YOU_SURE_REMOVE}
                primaryButtonText="OK"
                handleClose={() => setShow(false)}
                handleConfirm={() => {
                    if (primarykey[index]?.selectedIcon.name !== 'user' && audienceState?.audienceColumn?.length > 1) {
                        const columnName = audienceState.audienceColumn[index]?.attributeName;
                        if (!columnName) {
                            setShow(false);
                            return;
                        }

                        const newAudienceList = audienceState.audienceList.map((row) => {
                            const { [columnName]: _removed, ...rest } = row;
                            return rest;
                        });
                        deletedAttribute.push(columnName);

                        const newSelectedAttribute = selectedAttribute
                            .filter((_, idx) => idx !== index)
                            .map((attr, newIdx) => (attr ? { ...attr, index: newIdx } : attr));
                        const newPrimarykey = primarykey.filter((_, idx) => idx !== index);
                        const newAudienceColumn = audienceState.audienceColumn.filter((_, idx) => idx !== index);
                        const newAttributesError = (attributesError || []).filter((_, idx) => idx !== index);
                        const filteredArrData = attributeMappingData.map((row) =>
                            row.filter((_, idx) => idx !== index),
                        );

                        dispatch(updateImportAudience({ field: 'attributeMappingData', data: filteredArrData }));

                        const primaryIndex = newPrimarykey.findIndex((item) => item?.selectedIcon?.name === 'user');
                        const newUniqueKeyIndex = primaryIndex >= 0 ? primaryIndex : null;

                        dispatchState({
                            type: 'UPDATE',
                            payload: newAudienceColumn,
                            field: 'audienceColumn',
                        });
                        dispatchState({
                            type: 'UPDATE',
                            payload: newAudienceList,
                            field: 'audienceList',
                        });
                        dispatchState({
                            type: 'UPDATE',
                            payload: newPrimarykey,
                            field: 'primarykey',
                        });
                        dispatchState({
                            type: 'UPDATE',
                            payload: newSelectedAttribute,
                            field: 'selectedAttribute',
                        });
                        dispatchState({
                            type: 'UPDATE',
                            payload: newAttributesError,
                            field: 'attributesError',
                        });
                        dispatchState({
                            type: 'UPDATE',
                            payload: newUniqueKeyIndex,
                            field: 'uniqueKeyIndex',
                        });
                        dispatchState({
                            type: 'UPDATE',
                            payload: [...deletedAttribute],
                            field: 'deletedColumn',
                        });
                        setShow(false);
                    }
                }}
            />
        </div>
    );
};

export default CustomHeaderColumn;
