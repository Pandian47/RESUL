import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { ENTER_CATEGORY, SELECT_ATTRIBUTE } from 'Constants/GlobalConstant/ValidationMessage';
import {
    ATTRIBUTE_MAPPING,
    CANCEL,
    CATEGORY_TYPE,
    CHILD_ATTRIBUTE,
    NEW_CATEGORY_TYPE,
    SAVE,
} from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini, close_medium, save_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSKendoDropdownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import SpinnerLoader from 'Components/Skeleton/Components/common/SpinnerLoader';
import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import { getSessionId } from 'Reducers/globalState/selector';
import { getChildListings, isCatTypeNameExists, saveCatType } from 'Reducers/preferences/datacatalogue/request';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const NEW_CATEGORY_TYPE_NAME = 'New category type';
const FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL };

const hasCategoryTypeValue = (value) => {
    if (!value) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return !!(value?.catTypeName || value?.catTypeID);
};

const ChildAttrModal = ({ show, onClose }) => {
    const dispatch = useDispatch();
    const { control, setValue, setError, clearErrors, trigger, getValues } = useFormContext();
    const { departmentId, clientId } = useSelector((state) => getSessionId(state));
    const childCategoryList = useSelector(({ addAudienceReducer }) => addAudienceReducer.childCategoryList);
    const childCategoryListApi = useApiLoader();
    const catTypeNameExistsApi = useApiLoader({
        autoFetch: false,
        loaderConfig: FIELD_LOADER_CONFIG,
        mode: 'create',
    });
    const saveCatTypeApi = useApiLoader({
        autoFetch: false,
        loaderConfig: FIELD_LOADER_CONFIG,
        mode: 'create',
    });

    const [clickOff, setClickOff] = useState(false);
    const [isCatType, setIsCatType] = useState(false);
    const tempCategoryDataRef = useRef('');
    const initialCategoryTypeRef = useRef(null);

    const childList = useMemo(
        () => childCategoryList.filter((item) => item.catTypeName !== NEW_CATEGORY_TYPE_NAME),
        [childCategoryList],
    );

    const handleOpenNewCategoryType = () => {
        setValue('categoryTypeText', '');
        setValue('categoryType', '');
        clearErrors('categoryTypeText');
        clearErrors('categoryType');
        clearErrors('csvFiles');
        setIsCatType(true);
    };

    const handleCategoryType = async (catTypeName) => {
        const payload = {
            catType: 'child',
            departmentId,
            clientId,
        };
        const res = await childCategoryListApi.refetch({
            fetcher: (params) => dispatch(getChildListings(params, { loading: false, isAudience: true })),
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
            params: payload,
        });

        if (catTypeName && res?.status) {
            const matchedCategory = (res?.data || []).find(
                (item) => item.catTypeName?.toLowerCase()?.trim() === catTypeName?.toLowerCase()?.trim(),
            );
            if (matchedCategory) {
                setValue('categoryType', matchedCategory);
                void trigger('categoryType');
            }
        }

        return res;
    };

    const isCategoryActionLoading = catTypeNameExistsApi.isLoading || saveCatTypeApi.isLoading;

    const handleCategoryName = async (name) => {
        tempCategoryDataRef.current = name;
        const payload = {
            catType: 'child',
            catTypeName: name,
            departmentId,
            clientId,
        };
        const res = await catTypeNameExistsApi.refetch({
            fetcher: (params) => dispatch(isCatTypeNameExists(params)),
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
            params: payload,
        });
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
        const savedCategoryName = tempCategoryDataRef.current;
        const payload = {
            catType: 'child',
            catTypeName: savedCategoryName,
            departmentId,
            clientId,
        };
        const saveResponse = await saveCatTypeApi.refetch({
            fetcher: (params) => dispatch(saveCatType(params, { loading: false })),
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
            params: payload,
        });
        if (saveResponse?.status) {
            setClickOff(false);
            setValue('categoryTypeText', '');
            await handleCategoryType(savedCategoryName);
        }
        setIsCatType(false);
    };

    const handleCloseNewCategory = () => {
        setClickOff(false);
        setValue('categoryTypeText', '');
        setIsCatType(false);
        const initial = initialCategoryTypeRef.current;
        if (hasCategoryTypeValue(initial)) {
            setValue('categoryType', initial);
        } else {
            setValue('categoryType', '');
        }
        clearErrors('categoryTypeText');
        clearErrors('csvFiles');
    };

    const handleModalDismiss = (shouldPersistSelection = false) => {
        setIsCatType(false);
        setClickOff(false);
        setValue('categoryTypeText', '');
        clearErrors('categoryTypeText');
        clearErrors('categoryType');

        if (!shouldPersistSelection) {
            const initial = initialCategoryTypeRef.current;
            if (hasCategoryTypeValue(initial)) {
                setValue('categoryType', initial);
            } else {
                setValue('categoryType', '');
            }
        }

        onClose();
    };

    useEffect(() => {
        if (!show) {
            setIsCatType(false);
            setClickOff(false);
            catTypeNameExistsApi.reset();
            saveCatTypeApi.reset();
            return;
        }

        initialCategoryTypeRef.current = getValues('categoryType');

        if (!childCategoryList?.length) {
            void handleCategoryType();
        }
    }, [show]);

    return (
        <RSModal
            show={show}
            size="md"
            header={CHILD_ATTRIBUTE}
            isCloseButton={true}
            handleClose={() => handleModalDismiss(false)}
            body={
                <Fragment>
                    <div className="form-group mb0">
                        <Row>
                            <Col sm={5}>
                                <label>{ATTRIBUTE_MAPPING}</label>
                            </Col>
                            <Col sm={7} className="position-relative">
                                {isCatType ? (
                                    <Fragment>
                                        <RSInput
                                            name="categoryTypeText"
                                            control={control}
                                            className="pr70"
                                            placeholder={NEW_CATEGORY_TYPE}
                                            required
                                            onKeyDown={charNumUnderScore}
                                            rules={{ required: ENTER_CATEGORY }}
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
                                        <div className="align-items-center d-flex gap-3 position-absolute top0 right15 zIndex2">
                                            {isCategoryActionLoading ? (
                                                <SpinnerLoader className ='mt5'/>
                                            ) : (
                                                <Fragment>
                                                    <RSTooltip
                                                        position="top"
                                                        text={SAVE}
                                                    >
                                                        <div className={clickOff ? '' : 'pe-none click-off'}>
                                                            <i
                                                                onClick={() => {
                                                                    void saveCategoryData();
                                                                }}
                                                                className={`${save_mini} icon-xs color-primary-blue`}
                                                            />
                                                        </div>
                                                    </RSTooltip>
                                                    <RSTooltip
                                                        position="top"
                                                        text={CANCEL}
                                                    >
                                                        <i
                                                            className={`${close_medium} color-primary-red`}
                                                            onClick={handleCloseNewCategory}
                                                        />
                                                    </RSTooltip>
                                                </Fragment>
                                            )}
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
                                        handleChange={() => clearErrors('csvFiles')}
                                        popupClass="addImportAudienceDropdownListContainer"
                                        footer={
                                            <NewAttributeBtn
                                                title={NEW_CATEGORY_TYPE}
                                                handleModalAttribute={handleOpenNewCategoryType}
                                            />
                                        }
                                    />
                                )}
                            </Col>
                        </Row>
                    </div>
                    <small className="mt20">
                        <i
                            id="rs_data_circle_info"
                            className={`${circle_info_mini} icon-xs position-relative top2 color-primary-blue mr5`}
                        />
                        Note: Child file must include <span className="font-bold">BrandID</span> column so record
                        link to the right customer.
                    </small>
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={() => handleModalDismiss(false)}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton onClick={() => handleModalDismiss(true)}>{SAVE}</RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default ChildAttrModal;
