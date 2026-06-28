import { CATEGORY_NAME_IS_REQUIRED, CATEGORY_NAME_MUST_20, CATEGORY_NAME_MUST_3, ONLY_LETTERS } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, CATEGORIES_NAME, CATEGORIES_NAME_BE_3_CHARACTERS, CATEGORY_MIGHT, CATEGORY_NAME_ALREADY_EXISTS, EDIT_CATEGORIES, ENTER_TEMPLATE_CATEGORIES, MANAGE_CATEGORIES, PROCEED_TO_SAVE, PROCEED_WITH_SAVING, SAVE, UP_TO_20_CATEGORIES, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector, useDispatch } from 'react-redux';
import { templateCategoryManageApi_AI } from 'Reducers/preferences/EmailBuilder/request';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import RSInput from 'Components/FormFields/RSInput';
import { useForm } from 'react-hook-form';
import RSTagsComponent from 'Components/RSTagsComponent';
const ManageCategoriesModal = ({show, handleClose, setCategoriesData: updateCategoriesData}) => {
  const dispatch = useDispatch();
    const templateCategories = useSelector((state) => state.emailBuilderReducer.templateCategories);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
  const [originalCategories, setOriginalCategories] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [showManageModal, setShowManageModal] = useState(show);
  const [categoriesRemoved, setCategoriesRemoved] = useState(false);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editMode, setEditMode] = useState({
    isEdit: false,
    categoryId: null,
    categoryName: "",
  });
  const [createMode, setCreateMode] = useState({
    isCreate: false,
  });
  const [deleteMode, setDeleteMode] = useState({
    isDelete: false,
    categoryId: null,
    categoryName: "",
  });
  const [hasTagError, setHasTagError] = useState(false);
  const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
  const isSaving = saveApi.isFetching;

    const {
        control,
        reset,
        getValues,
        setError,
        clearErrors,
        formState: { errors },
        trigger,
    } = useForm({
        mode: 'onChange',
    });

    const handleCategories = (categories) => {
        return categories?.map((category) => {
            return {
                ...category,
                disabled: category?.isPredefined ?? false,
            };
        });
    };

    useEffect(() => {
        setOriginalCategories(handleCategories(templateCategories));
        setCategoriesData(handleCategories(templateCategories));
        setShowManageModal(show);
        setConfirmingSave(false);
        setCategoriesRemoved(false);
    }, [show, templateCategories]);

  const checkDuplicateName = (name, excludeCategoryId = null) => {
    return categoriesData.some(
      (category) =>
        category.categoryName.toLowerCase() === name.toLowerCase() &&
        category.templateCategoryId !== excludeCategoryId
    );
  };

  const handleEdit = (dataItem) => {
    setEditMode({
      isEdit: true,
      categoryId: dataItem?.templateCategoryId,
      categoryName: dataItem?.categoryName,
    });
    clearErrors("categoryName");
    reset({
      categoryName: dataItem?.categoryName,
    });
    setShowManageModal(false);
  };

  const handleEditSave = async () => {
    // Trigger validation before proceeding
        const isValid = await trigger('categoryName');
    if (!isValid) {
      return;
    }

    const formValues = getValues();

    // Check for duplicate name excluding current category
    if (checkDuplicateName(formValues.categoryName, editMode.categoryId)) {
            setError('categoryName', {
                type: 'manual',
                message: CATEGORY_NAME_ALREADY_EXISTS
      });
      return;
    }

    // Update the category name in the local state
        const updatedCategories = categoriesData.map(category => {
      if (category.templateCategoryId === editMode.categoryId) {
        return {
          ...category,
                    categoryName: formValues.categoryName
        };
      }
      return category;
    });

        // Update local state
        setCategoriesData(handleCategories(updatedCategories));
        setEditMode({
            isEdit: false,
            categoryId: null,
            categoryName: '',
        });
        clearErrors('categoryName');
    reset();
    setShowManageModal(true);
  };

  const handleEditCancel = () => {
    setEditMode({
      isEdit: false,
      categoryId: null,
            categoryName: ''
    });
        clearErrors('categoryName');
    reset();
    setShowManageModal(true);
  };

  const handleManageSave = async () => {
    if (isSaving) {
      return;
    }
    const removed = originalCategories.filter(
      (orig) =>
        !categoriesData.some(
          (cat) => cat.templateCategoryId === orig.templateCategoryId
        )
    );

    if (removed.length > 0 && !confirmingSave) {
      setCategoriesRemoved(true);
      return;
    }
    const dataList = [];

    originalCategories.forEach((originalCat) => {
      if (
        !categoriesData.some(
          (currentCat) =>
            currentCat.templateCategoryId === originalCat.templateCategoryId
        )
      ) {
        dataList.push({
          categoryName: originalCat.categoryName,
          templateCategoryId: originalCat.templateCategoryId,
          isCustom: true,
          isDelete: true,
        });
      }
    });

        categoriesData.forEach(category => {
      dataList.push({
        categoryName: category.categoryName,
        templateCategoryId: category.templateCategoryId,
        isCustom: true,
        isDelete: false,
      });
    });

    const payload = {
      departmentId,
      clientId,
      userId,
      dataList,
    };

    const res = await saveApi.refetch({
      fetcher: () => dispatch(templateCategoryManageApi_AI(payload, { loading: false })),
      loaderConfig: fieldLoaderConfig,
      mode: 'create',
    });
    if (res?.status) {
      updateCategoriesData(categoriesData);
      handleClose();
      setConfirmingSave(false);
      setCategoriesRemoved(false);
    }
  };

  const handleManageCancel = () => {
    if (isSaving) {
      return;
    }
    setConfirmingSave(false);
    handleClose();
  };

  const handleModalClose = () => {
    if (isSaving) {
      return;
    }
    handleClose();
  };

  return (
    <>
      <RSModal
        show={showManageModal}
        size="md"
        header={MANAGE_CATEGORIES}
        handleClose={handleModalClose}
        isCloseDisabled={isSaving}
        isCloseButton={true}
        bodyClassName={'manage-categories-modal'}
               
        body={
          <>
            <RSTagsComponent
              placeholder={ENTER_TEMPLATE_CATEGORIES}
              tags={categoriesData}
              size={20}
              isObject
              isRefresh={false}
                            fieldItemKey={'categoryName'}
                            customTagClass="rs-tags-wrapper-scroll rs-tags-wrapper-big"
                            maxLength={200}
                            isLocalization
                            isCategories
                            onError={(error) => setHasTagError(!!error)}
                            updatedTags={(tags) => {
                                                                const formattedTags = tags.map((tag) => {
                                    const isNewTag =
                                        typeof tag === 'string' ||
                                        (tag.templateCategoryId &&
                                            !categoriesData.some(
                                                (cat) => cat.templateCategoryId === tag.templateCategoryId,
                                            ));
                                    if (isNewTag) {
                                        return {
                                            categoryName: typeof tag === 'string' ? tag : tag.categoryName,
                                            templateCategoryId: 0,
                                            isCustom: true,
                                        };
                                    }
                                    return tag;
                                });
                                
                                setCategoriesData(handleCategories(formattedTags));
                            }}
                            onTagClick={(tag) => {
                                handleEdit(tag);
                            }}
                            returnObj={true}
                        />
                        <small className="mt5 lh-base"> {UP_TO_20_CATEGORIES}</small>
                    </>
                }
                footer={
                    <>
                        <RSSecondaryButton blockInteraction={isSaving} onClick={handleManageCancel}>{CANCEL}</RSSecondaryButton>
                        <RSPrimaryButton
                            isLoading={isSaving}
                            blockBodyPointerEvents={isSaving}
                            onClick={() => {
                                if (hasTagError || isSaving) {
                                    return;
                                }
                                const removed = originalCategories.filter(
                                    (orig) =>
                                        !categoriesData.some(
                                            (cat) => cat.templateCategoryId === orig.templateCategoryId,
                                        ),
                                );

                  if (removed.length > 0 && !confirmingSave) {
                    setCategoriesRemoved(true);
                    setConfirmingSave(true);
                    setShowManageModal(false); 
                    setShowConfirmModal(true); 
                  } else {
                    handleManageSave();
                  }
                }}
                className={hasTagError || isSaving ? "click-off" : ""}
              >
                {!confirmingSave && !categoriesRemoved
                  ? SAVE
                  : PROCEED_TO_SAVE}
              </RSPrimaryButton>
            </>
         
        }
      />

      {/* Delete Modal*/}

      <RSModal
        show={showConfirmModal}
        size="md"
        header={WARNING}
        body={
          <div>
            <p >
              {CATEGORY_MIGHT}
            </p>
          </div>
        }
        handleClose={() => {
          if (isSaving) return;
          setShowConfirmModal(false);
          setShowManageModal(true); 
          setConfirmingSave(false);
          setCategoriesRemoved(false);
        }}
        isCloseDisabled={isSaving}
        isCloseButton={true}
        footer={
          <>
            <RSSecondaryButton
              blockInteraction={isSaving}
              onClick={() => {
                if (isSaving) return;
                setShowConfirmModal(false);
                setShowManageModal(true);
                setConfirmingSave(false);
                setCategoriesRemoved(false);
              }}
            >
               {CANCEL}
            </RSSecondaryButton>
            <RSPrimaryButton
              isLoading={isSaving}
              blockBodyPointerEvents={isSaving}
              onClick={() => {
                if (isSaving) return;
                setShowConfirmModal(false); // Hide confirm modal
                setShowManageModal(false); // Also hide manage modal after save
                handleManageSave(); // Proceed with save
              }}
            >
             {PROCEED_TO_SAVE}
            </RSPrimaryButton>
          </>
        }
      >
        <p className="text-warning mb-0">
         {PROCEED_WITH_SAVING}
        </p>
      </RSModal>

      {/* Edit Modal */}
      <RSModal
        show={editMode.isEdit}
        size="md"
        header={EDIT_CATEGORIES}
        handleClose={handleEditCancel}
        isCloseButton={false}
        body={
          <div className="p15">
            <RSInput
              control={control}
              name="categoryName"
              placeholder={CATEGORIES_NAME}
              label={CATEGORIES_NAME}
              maxLength={20}
              rules={{
                required: CATEGORY_NAME_IS_REQUIRED,
                minLength: {
                  value: 3,
                  message: CATEGORY_NAME_MUST_3,
                },
                maxLength: {
                  value: 20,
                  message: CATEGORY_NAME_MUST_20,
                },
                pattern: {
                  value: /^[a-zA-Z0-9_\-/&\s]+$/,
                  message: ONLY_LETTERS,
                },
              }}
              isNewTheme={true}
            />
            <div className="mt-2 mb-3">
              <small className="text-muted">
                {CATEGORIES_NAME_BE_3_CHARACTERS}
              </small>
            </div>
          </div>
        }
        footer={
          <>
            <RSSecondaryButton onClick={handleEditCancel}>
              {CANCEL}
            </RSSecondaryButton>
            <RSPrimaryButton 
              onClick={handleEditSave}
              className={Object.keys(errors)?.length > 0 ? "click-off" : ""}
            >
              {SAVE}
            </RSPrimaryButton>
          </>
        }
      />
    </>
  );
};

export default ManageCategoriesModal;