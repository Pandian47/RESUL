import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { ENTER_CATEGORY, SELECT_ATTRIBUTE } from 'Constants/GlobalConstant/ValidationMessage';
import { ATTRIBUTE_MAPPING, CANCEL, CATEGORY_TYPE, CSV_ATTRIBUTE_CATEGORY, CSV_CHILD_ATTRIBUTE, NEW_CATEGORY_TYPE, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { close_medium, save_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import RSKendoDropdownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';

import { getSessionId } from 'Reducers/globalState/selector';
import { getChildListings, isCatTypeNameExists, saveCatType } from 'Reducers/preferences/datacatalogue/request';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const NEW_CATEGORY_TYPE_NAME = 'New category type';

const AttributeMappingSection = ({
    mappingFieldName,
    mappingSelectLabel,
    mappingRules,
    beforeFetchChildList,
    onCategoryDropdownChange,
    onCloseCategoryTypeExtras,
    newCategoryRules,
}) => {
    const dispatch = useDispatch();
    const { departmentId, clientId } = useSelector((state) => getSessionId(state));
    const { control, setValue, setError, clearErrors, watch, reset, trigger } = useFormContext();
    const childCategoryListApi = useApiLoader();

    const [clickOff, setClickOff] = useState(false);
    const [childList, setChildList] = useState([
        { catTypeID: 0, catTypeName: NEW_CATEGORY_TYPE_NAME },
    ]);
    const [isCatType, setIsCatType] = useState(false);
    const tempCategoryDataRef = useRef('');

    const listType = watch('listType');
    const mappingValue = watch(mappingFieldName);

    useEffect(() => {
        if (mappingFieldName !== 'attributeMapping') return;
        if (mappingValue !== 'Parent') return;
        reset((formState) => ({
            ...formState,
            categoryType: '',
            categoryTypeText: '',
        }));
    }, [mappingFieldName, mappingValue, reset]);

    const handleCategoryType = async () => {
        beforeFetchChildList?.();
        const payload = {
            catType: 'child',
            departmentId,
            clientId,
        };
        const res = await childCategoryListApi.refetch({
            fetcher: (params) => dispatch(getChildListings(params, { loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
            params: payload,
        });
        if (res?.status) {
            const sortedData = [...(res.data || [])].sort((a, b) => {
                const nameA = (a.catTypeName || '').toLowerCase();
                const nameB = (b.catTypeName || '').toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
            setChildList(sortedData);
        }
    };

    const handleCategoryName = async (name) => {
        tempCategoryDataRef.current = name;
        const payload = {
            catType: 'child',
            catTypeName: name,
            departmentId,
            clientId,
        };
        const res = await dispatch(isCatTypeNameExists(payload));
        if (!res?.status) {
            setClickOff(true);
        } else {
            setClickOff(false);
            setError('categoryTypeText', {
                type: 'custom',
                message: 'Name already exists',
            });
        }
    };

    const saveCategoryData = async () => {
        const payload = {
            catType: 'child',
            catTypeName: tempCategoryDataRef.current,
            departmentId,
            clientId,
        };
        const saveResponse = await dispatch(saveCatType(payload));
        if (saveResponse?.status) {
            setClickOff(false);
            setValue('categoryType', tempCategoryDataRef.current);
            setValue('categoryTypeText', '');
        }
        await handleCategoryType();
        setIsCatType(false);
    };

    const handleMappingChange = (e) => {
        setValue('categoryType', '');
        setValue('categoryTypeText', '');
        if (e?.value === 'Child') {
            handleCategoryType();
        }
    };

    if (listType !== 'Target list') {
        return null;
    }

    const rulesNewCategory =
        newCategoryRules ?? {
            required: ENTER_CATEGORY,
        };

    return (
        <div className="form-group">
            <Row>
                <Col sm={{ span: 3, offset: 1 }} className="text-right">
                    <label className="control-label-left">{ATTRIBUTE_MAPPING}</label>
                </Col>
                <Col sm={4} className="position-relative">
                    <RSKendoDropdownList
                        control={control}
                        name={mappingFieldName}
                        label={mappingSelectLabel}
                        data={['Parent', 'Child']}
                        handleChange={handleMappingChange}
                        handleOnBlur={() => void trigger(mappingFieldName)}
                        rightTooltip = {
                                    mappingValue === 'Parent'
                                        ? CSV_CHILD_ATTRIBUTE
                                        : CSV_ATTRIBUTE_CATEGORY
                                }
                        {...(mappingRules ? { required: true, rules: mappingRules } : {})}
                    />
                </Col>

                {mappingValue === 'Child' && (
                    <Col sm={4}>
                        {isCatType ? (
                            <Fragment>
                                <RSInput
                                    name="categoryTypeText"
                                    control={control}
                                    className="pr70"
                                    placeholder={NEW_CATEGORY_TYPE}
                                    required
                                    onKeyDown={charNumUnderScore}
                                    rules={rulesNewCategory}
                                    maxLength={MAX_LENGTH50}
                                    handleOnBlur={(e) => {
                                        const trimmed = e.target.value?.trim() ?? '';
                                        setValue('categoryTypeText', trimmed, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                        if (trimmed !== '') handleCategoryName(trimmed);
                                    }}
                                    handleOnchange={(e) => {
                                        if (e.target.value?.length === 0) {
                                            setClickOff(false);
                                        }
                                    }}
                                />
                                <div className="align-items-center d-flex justify-content-between position-absolute top4 right5 zIndex2">
                                    <RSTooltip
                                        position="top"
                                        text={SAVE}
                                        className=" position-absolute right40 top0 lh0"
                                    >
                                        <div className={clickOff ? '' : 'pe-none click-off'}>
                                            <i
                                                onClick={() => {
                                                    saveCategoryData();
                                                }}
                                                className={`${save_mini} icon-xs color-primary-blue`}
                                            />
                                        </div>
                                    </RSTooltip>
                                    <RSTooltip
                                        position="top"
                                        text={CANCEL}
                                        className="position-absolute top0 right5 lh0"
                                    >
                                        <i
                                            className={`${close_medium}  color-primary-red`}
                                            onClick={() => {
                                                setClickOff(false);
                                                setValue('categoryTypeText', '');
                                                setIsCatType(false);
                                                setValue('categoryType', '');
                                                clearErrors('categoryTypeText');
                                                onCloseCategoryTypeExtras?.();
                                            }}
                                        />
                                    </RSTooltip>
                                </div>
                            </Fragment>
                        ) : (
                            <RSKendoDropdownList
                                name="categoryType"
                                control={control}
                                data={childList}
                                required
                                textField="catTypeName"
                                dataItemKey="catTypeID"
                                label={CATEGORY_TYPE}
                                isLoading={childCategoryListApi?.isLoading}
                                handleOnBlur={() => void trigger('categoryType')}
                                rules={{ required: SELECT_ATTRIBUTE }}
                                handleChange={(e) => {
                                    if (e.value?.catTypeName === NEW_CATEGORY_TYPE_NAME) {
                                        setIsCatType(true);
                                        clearErrors();
                                    }
                                    onCategoryDropdownChange?.(e);
                                }}
                                popupClass="addImportAudienceDropdownListContainer"
                                footer={null}
                            />
                        )}
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default AttributeMappingSection;
