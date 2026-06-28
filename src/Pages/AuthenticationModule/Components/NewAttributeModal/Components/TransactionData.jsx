import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { SELECT_CAT_TYPE, SPECIAL_CHATACTERS_NOT_ALlOWED, TYPE_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { close_medium, save_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col } from 'react-bootstrap';
import _find from 'lodash/find';

import RSTooltip from 'Components/RSTooltip';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { getChildListings, isCatTypeNameExists, saveCatType } from 'Reducers/preferences/datacatalogue/request';
import { getSessionId } from 'Reducers/globalState/selector';
import RSInput from 'Components/FormFields/RSInput';

import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import { communicationNamevalidtor } from 'Utils/HookFormValidate';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL };

let tempCategoryData = '';
const TransactionData = ({ isUpdate, catType, editData }) => {
            const { control, watch, setError, setValue, clearErrors, formState, reset, getValues, trigger } = useFormContext();
    const categoryTypeTextValue = watch('categoryTypeText');
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const childCategoryListApi = useApiLoader({
        autoFetch: false,
        loaderConfig: FIELD_LOADER_CONFIG,
        mode: 'create',
    });
    const catTypeNameExistsApi = useApiLoader({
        autoFetch: false,
        loaderConfig: FIELD_LOADER_CONFIG,
        mode: 'create',
    });
    const [isCategoryListLoading, setIsCategoryListLoading] = useState(true);
    const [childList, setChildList] = useState([
        {
            catTypeID: 0,
            catTypeName: 'New category type',
        },
    ]);
    const [isCatType, setIsCatType] = useState(false);

    const [clickOff, setClickOff] = useState(false);
    const attributeFlag = watch('attributeFlag');
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);

    const getChildListingsData = async (catTypeText) => {
        setIsCategoryListLoading(true);
        const payload = {
            catType: 'child',
            departmentId,
            clientId,
            userId,
        };
        try {
            const res = await childCategoryListApi.refetch({
                fetcher: (params) => dispatch(getChildListings(params, { loading: false })),
                mode: isUpdate ? 'edit' : 'create',
                loaderConfig: FIELD_LOADER_CONFIG,
                params: payload,
            });
            if (res?.status) {
                setChildList([...(res?.data || [])]);
                const matchedCategory = res?.data?.find(
                    (item) => item.catTypeName?.toLowerCase()?.trim() === catTypeText?.toLowerCase()?.trim()
                );
                if (matchedCategory) {
                    setValue('categoryType', matchedCategory);
                    trigger('categoryType');
                }
            } else {
                setChildList([]);
            }
        } finally {
            setIsCategoryListLoading(false);
        }
    };

    useEffect(() => {
        setValue('categoryType', '');
        getChildListingsData();
        tempCategoryData = '';
    }, []);

    useEffect(() => {
        if ((catType !== undefined && catType !== '') && !isUpdate) {
            setValue('categoryType', _find(childList, ['catTypeName', catType]));
            trigger('categoryType');
        }

        if (childList?.length !== 0) {
            if (editData?.cattype !== null && isUpdate) {
                setValue('categoryType', _find(childList, ['catTypeName', editData?.cattype]));
                trigger('categoryType');
            }
        }
    }, [catType, childList, isUpdate]);

    const handleCategoryName = async (name) => {
        tempCategoryData = name;
        const payload = {
            catType: 'child',
            catTypeName: name,
            departmentId,
            clientId,
            userId,
        };
        if (communicationNamevalidtor(name) === undefined) {
            const res = await catTypeNameExistsApi.refetch({
                fetcher: (params) => dispatch(isCatTypeNameExists(params)),
                mode: 'create',
                loaderConfig: FIELD_LOADER_CONFIG,
                params,
            });
            if (!res?.status) {
                setClickOff(true);
            } else {
                setClickOff(false);
                setError(`categoryTypeText`, {
                    type: 'custom',
                    message: 'Name already exists',
                });
            }
        } else {
            setTimeout(() => {
                setError(`categoryTypeText`, {
                    type: 'custom',
                    message: SPECIAL_CHATACTERS_NOT_ALlOWED,
                });
                return false;
            }, 10);
        }
    };
    const saveCategoryData = async () => {
        let catTypeText = getValues('categoryTypeText');
        const payload = {
            catType: 'child',
            catTypeName: catTypeText,
            departmentId,
            clientId,
        };
        const saveResponse = await dispatch(saveCatType(payload));
        if (saveResponse?.status) {
            setClickOff(false);
            //setValue('categoryType', tempCategoryData);
           // setValue('categoryTypeText', '');
        }
        getChildListingsData(catTypeText);
        setIsCatType(false);
    };
    // console.log('Data catelogue :::: ', dataCatalogueAttrs);
    return (
        <Fragment>
            {/* <Col sm={12}>
                <div className="form-group">
                    <ul className="rs-list-inline">
                        <li>
                            <RSRadioButton
                                disabled={isUpdate}
                                required
                                control={control}
                                name="attributeFlag"
                                labelName="Parent of"
                                defaultValue={attributeFlag}
                                rules={{
                                    required: TYPE_IS_REQUIRED,
                                }}
                                isError={true}
                            />
                        </li>
                        <li>
                            <RSRadioButton
                                disabled={isUpdate}
                                required
                                control={control}
                                name="attributeFlag"
                                labelName="Child of"
                                defaultValue={attributeFlag}
                                rules={{
                                    required: TYPE_IS_REQUIRED,
                                }}
                                isError={false}
                            />
                        </li>
                    </ul>
                </div>
            </Col> */}
            <Col sm={12}>
                <div className="form-group">
                    {isCatType ? (
                        <Fragment>
                            <RSInput
                                name={'categoryTypeText'}
                                control={control}
                                placeholder={'New category type'}
                                required
                                isLoading={catTypeNameExistsApi.isLoading}
                                onKeyDown={charNumUnderScore}
                                rules={{
                                    required: 'Enter a category name',
                                    validate: (value) => {
                                        if (value && value.trim() !== '') {
                                            return 'Save the category type before proceeding';
                                        }
                                        return true;
                                    }
                                }}
                                maxLength={MAX_LENGTH50}
                                handleOnBlur={(e) => {
                                    // console.log('Check new  :::::::::::::: ', e);
                                    if (e.target.value !== '') {
                                        handleCategoryName(e.target.value);
                                    }
                                }}
                            />
                            {!catTypeNameExistsApi.isLoading &&
                                <div className="align-items-center d-flex justify-content-between position-absolute top4 right5 zIndex2">
                                    <RSTooltip position="top" text="Save" className=" position-absolute right40 top0">
                                        <i
                                            onClick={() => {
                                                saveCategoryData();
                                            }}
                                            className={`${save_mini} ${
                                                clickOff ? '' : 'click-off'
                                            } icon-xs color-primary-blue`}
                                        ></i>
                                    </RSTooltip>
                                    <RSTooltip position="top" text={'Cancel'} className="position-absolute top0 right5">
                                        <i
                                            className={`${close_medium}  color-primary-red`}
                                            onClick={() => {
                                                setValue('categoryTypeText', '');
                                                setIsCatType(false);
                                                setValue('categoryType', '');
                                                clearErrors('categoryTypeText', '');
                                                setClickOff(false);
                                            }}
                                        ></i>
                                    </RSTooltip>
                                </div>
                            }
                        </Fragment>
                    ) : (
                        <RSKendoDropdown
                            disabled={isUpdate || (catType !== undefined && catType !== '')}
                            name={'categoryType'}
                            control={control}
                            data={childList}
                            required
                            isLoading={isCategoryListLoading || childCategoryListApi.isFetching}
                            textField={'catTypeName'}
                            dataItemKey={'catTypeID'}
                            label={`Category type`}
                            rules={{ required: SELECT_CAT_TYPE }}
                            popupSettings={{
                                popupClass: `addImportAudienceDropdownListContainer`,
                            }}
                            footer={
                                <NewAttributeBtn
                                    title="New category type"
                                    handleModalAttribute={() => {
                                        setValue('categoryTypeText', '');
                                        setValue('categoryType', '');
                                        clearErrors('categoryTypeText')
                                        clearErrors('categoryType')
                                        setIsCatType(true);
                                    }}
                                />
                            }
                            // handleChange={(e) => {
                            //     if (e.value?.catTypeName === 'New Category type') {
                            //         setIsCatType(true);
                            //     }
                            // }}
                        />
                    )}
                </div>
            </Col>
        </Fragment>
    );
};

export default memo(TransactionData);
