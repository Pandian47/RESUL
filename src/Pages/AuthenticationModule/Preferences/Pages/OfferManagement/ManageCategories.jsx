import { ENTER_MINIMUM_PURCHASE_VALUE } from 'Constants/GlobalConstant/ValidationMessage';
import { CLEAR_ALL_TEXT, ENTER_KEYWORDS, LINKED_CATEGORIES_CLEAR_INFO, MAXIMUM_TEN_OFFER_TYPES, OFFER_TYPES, OK, PRODUCT_CATEGORIES, PRODUCTType, SUBPRODUCTS } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTagsComponent from 'Components/RSTagsComponent';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { saveOfferCategory, offerCategoryFetch } from 'Reducers/preferences/OfferManagements/request';
import { ManageCategoriesSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { preferencesSkeletonCriticalCss } from 'Components/Skeleton/Components/preferencesSkeletonCriticalCss';
import useApiLoader from 'Hooks/useApiLoader';
import { PREFERENCES_SUBPAGE_LOADER_CONFIG } from 'Hooks/usePreferencesSubPageApi';

const LinkedCategoriesClearHint = () => (
    <div className="d-flex align-items-center justify-content-end">
        <RSTooltip
            text={LINKED_CATEGORIES_CLEAR_INFO}
            position="top"
            className="lh0"
        >
            <i
                className={`${circle_question_mark_mini} icon-xs color-primary-blue cp`}
                aria-label={LINKED_CATEGORIES_CLEAR_INFO}
            />
        </RSTooltip>
    </div>
);

const ManageCategories = ({
    initialProductCategories = null,
    back = (val) => { val },
    onSave = () => { },
    getData = (key) => null,
    OffModalVisiple = (val) => { val }
}) => {
    const domain = location.pathname.split('/')[1];
    const { control, setValue, watch , setError, clearErrors} = useForm({
        mode: 'onChange',
    });

    // Product related states
    const [isProductCategoryModalOpen, setIsProductCategoryModalOpen] = useState(false);
    const [selectedProductType, setSelectedProductType] = useState(null);
    const [selectedSubProducts, setSelectedSubProducts] = useState([]);
    const [initialSubProducts, setInitialSubProducts] = useState([]);
    const [selectedProductTypes, setSelectedProductTypes] = useState([]);
    const [productTypesWithSubProducts, setProductTypesWithSubProducts] = useState({});
    const productTypeName = watch('productname');

    // Category related states (separate from products)
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategoryType, setSelectedCategoryType] = useState(null);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [initialSubCategories, setInitialSubCategories] = useState([]);
    const [selectedCategoryTypes, setSelectedCategoryTypes] = useState([]);
    const [initialCategoryTypes, setInitialCategoryTypes] = useState([]);
    const [categoryTypesWithSubCategories, setCategoryTypesWithSubCategories] = useState({});
    const categoryTypeName = watch('categoryname');
    const [removedData, setRemovedData] = useState([]);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [categoryID, setCategoryID] = useState(0);
    const [savedCategoryData, setSavedCategoryData] = useState([]);
    const [removedCategory, setRemovedCategory] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });
    const isSaveLoading = saveApi.isFetching;
    const [sampleData, setSampleData] = useState([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

    const normalizeCategoryIsUsed = (val) => {
        if (val === true) return true;
        if (val === false || val == null) return false;
        if (typeof val === 'string') return val.trim().toLowerCase() === 'true';
        return false;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!departmentId || !clientId || !userId) {
                setIsCategoriesLoading(false);
                return;
            }
            setIsCategoriesLoading(true);
            try {
                let payload = { departmentId, clientId, userId };

                let { data, status } = await dispatch(offerCategoryFetch(payload, false));

                if (!status || !Array.isArray(data)) {
                    setSelectedCategoryTypes([]);
                    setInitialCategoryTypes([]);
                    setSavedCategoryData([]);
                    setSampleData([]);
                    return;
                }

                let filterData = data.map(cat => ({
                    categoryName: cat.categoryName,
                    categoryID: cat.categoryID,
                    isCustom: true,
                    isDelete: false,
                    isUsed: normalizeCategoryIsUsed(cat.isUsed),
                    subCategory: cat.subCategory.map(sub => ({
                        subCategoryID: Number(sub.subCategoryID),    // ensure number
                        subCategoryName: sub.subCategoryName,
                        isCustom: true,
                        isDelete: false,
                        isUsed: normalizeCategoryIsUsed(sub.isUsed),
                    }))
                }));

                const updatedData = filterData.map(item => ({
                    ...item,
                    categoryname: item.categoryName,  // rename key
                    subCategory: item.subCategory.map(sub => ({
                        ...sub,
                        subCategoryname: sub.subCategoryName // rename key
                    }))
                }));
                setSelectedCategoryTypes(updatedData);

                setInitialCategoryTypes(updatedData);

                const convertData = filterData.map(item => ({
                    dataList: [{
                        categoryName: item.categoryName,
                        categoryID: item.categoryID,
                        isCustom: item.isCustom == "true",   // convert string → boolean
                        isDelete: item.isDelete == "true",
                        isUsed: normalizeCategoryIsUsed(item.isUsed),
                    }],
                    dataListSubCategory: item.subCategory.map(sub => ({
                        subCategoryName: sub.subCategoryName,
                        subCategoryID: sub.subCategoryID,
                        isCustom: sub.isCustom == "true",
                        isDelete: sub.isDelete == "true",
                        isUsed: normalizeCategoryIsUsed(sub.isUsed),
                    }))
                }));
                setSavedCategoryData(convertData);
                setSampleData(filterData)


            } catch (error) {
                setSelectedCategoryTypes([]);
                setInitialCategoryTypes([]);
                setSavedCategoryData([]);
                setSampleData([]);
            } finally {
                setIsCategoriesLoading(false);
            }
        };

        fetchData();
    }, [departmentId, clientId, userId, dispatch]);


    // Category helper functions (separate from products)
    const getCategoryTypeSubcategoryCount = (categoryType) => {
        if (!categoryType || typeof categoryType !== 'object') {
            return 0;
        }

        // First, check if the category has subCategory array directly
        if (categoryType.subCategory && Array.isArray(categoryType.subCategory)) {
            const activeSubCategories = categoryType.subCategory.filter(
                sub => sub && sub.isDelete !== true && sub.isDelete !== "true"
            );
            if (activeSubCategories.length > 0) {
                return activeSubCategories.length;
            }
        }

        // Check saved subcategories using both categoryId and key
        const savedSubCategories = categoryTypesWithSubCategories[categoryType.categoryId] ||
            categoryTypesWithSubCategories[categoryType.key] ||
            categoryTypesWithSubCategories[categoryType.categoryID];

        if (savedSubCategories && Array.isArray(savedSubCategories) && savedSubCategories.length > 0) {
            return savedSubCategories.length;
        }

        // Fallback to default subcategories if nothing is saved
        // const defaultSubCategories = getSubProducts(domain)?.[categoryType.key]?.filter(
        //     (item) => item.subCategoryName && item.subCategoryName.trim() !== ''
        // ) || [];

        const defaultSubCategories = getSubProducts()?.filter(
            (item) => item.subCategoryName && item.subCategoryName.trim() !== ''
        ) || [];

        return defaultSubCategories.length;
    };

    const getCategoryTypeDisplayText = (categoryType) => {
        if (!categoryType || typeof categoryType !== 'object') {
            return '';
        }

        const categoryName = categoryType.categoryname || categoryType.categoryName || '';
        return categoryName;
    };

    const handleCategoryTypeClick = (categoryType) => {
        // Safety check: ensure selectedCategoryTypes is an array
        if (!Array.isArray(selectedCategoryTypes)) {
            return;
        }

        const matchedIndex = selectedCategoryTypes.findIndex(
            item => item != null && item.categoryName == categoryType
        );
        setCategoryIndex(matchedIndex);

        const matchedItem = selectedCategoryTypes.find(
            item => item != null && item.categoryName === categoryType
        );

        const matchedCategoryID = matchedItem ? matchedItem.categoryID : null;
        setCategoryID(matchedCategoryID);

        let clickedCategoryType = null;

        if (typeof categoryType === 'string') {
            // Search by categoryName (case-insensitive for better matching)
            clickedCategoryType = (Array.isArray(selectedCategoryTypes) ? selectedCategoryTypes : [])
                .filter(ct => ct != null) // Filter out null/undefined items
                .find(
                    (ct) => (ct.categoryName && ct.categoryName === categoryType) || 
                            (ct.categoryname && ct.categoryname === categoryType)
                ) || (Array.isArray(productTypes) ? productTypes : [])
                    .filter(ct => ct != null) // Filter out null/undefined items
                    .find(
                        (ct) => (ct.categoryName && ct.categoryName === categoryType) || 
                                (ct.categoryname && ct.categoryname === categoryType)
                    );
        } else if (typeof categoryType === 'object' && categoryType !== null) {
            // Find the most up-to-date version from selectedCategoryTypes
            clickedCategoryType = (Array.isArray(selectedCategoryTypes) ? selectedCategoryTypes : [])
                .filter(ct => ct != null) // Filter out null/undefined items
                .find(
                    (ct) =>
                        (ct.categoryId && categoryType.categoryId && ct.categoryId === categoryType.categoryId) ||
                        (ct.key && categoryType.key && ct.key === categoryType.key) ||
                        ((ct.categoryname || ct.categoryName) === (categoryType.categoryname || categoryType.categoryName))
                ) || categoryType;
        }

        if (categoryType != null) {

            // Step 1: Filter category by categoryType (handle both string and object)
            const categoryNameToMatch = typeof categoryType === 'string' 
                ? categoryType 
                : (categoryType?.categoryName || categoryType?.categoryname);
            
            const filterSelectedCategoryType = (Array.isArray(selectedCategoryTypes) ? selectedCategoryTypes : [])
                .filter(val => val != null) // Filter out null/undefined items
                .filter(
                    val => val.categoryName == categoryNameToMatch || 
                           val.categoryname == categoryNameToMatch ||
                           (typeof categoryType === 'object' && categoryType !== null && 
                            (val.categoryID === categoryType.categoryID || 
                             val.categoryId === categoryType.categoryId))
                );

            // Step 2: Extract subCategory correctly (with safety check)
            const filtersubCategoryName =
                filterSelectedCategoryType.length > 0 && filterSelectedCategoryType[0]
                    ? (filterSelectedCategoryType[0].subCategory || [])
                    : [];

            // Ensure clickedCategoryType exists, otherwise use the matched item or filterSelectedCategoryType[0]
            if (!clickedCategoryType && filterSelectedCategoryType.length > 0 && filterSelectedCategoryType[0]) {
                clickedCategoryType = filterSelectedCategoryType[0];
            }

            // If still not found, try to create a default structure for newly created categories
            if (!clickedCategoryType) {
                const categoryNameStr = typeof categoryType === 'string' 
                    ? categoryType 
                    : (categoryType?.categoryName || categoryType?.categoryname || '');
                
                // Create a default category structure for newly created categories
                clickedCategoryType = {
                    categoryName: categoryNameStr,
                    categoryname: categoryNameStr,
                    categoryID: 0,
                    isCustom: true,
                    isDelete: false,
                    isUsed: false,
                    subCategory: []
                };
                
            }

            let cleanedData = {
                ...clickedCategoryType,
                subCategory: (clickedCategoryType.subCategory || []).filter(sub => sub.isDelete != "true")
            };

            // Use the actual category name from clickedCategoryType if available
            const categoryNameForForm = clickedCategoryType.categoryName || 
                                       clickedCategoryType.categoryname || 
                                       (typeof categoryType === 'string' ? categoryType : categoryType?.categoryName || categoryType?.categoryname);
            
            setSelectedCategoryType(categoryType);
            setValue('categoryname', categoryNameForForm);
            // getSubCategoriesData(clickedCategoryType)

            let filtersubCategoryNameData = (filtersubCategoryName || []).filter(item => item.isDelete !== "true");

            setSelectedSubCategories(filtersubCategoryNameData)
            setInitialSubCategories(filtersubCategoryNameData)
            // setSubCategoryList(fetchedSubCategories);
            OffModalVisiple(true)
            setIsCategoryModalOpen(true);
        }

    };

    // Export data function
    const getManagementData = () => {
        return {
            productTypes: selectedProductTypes,
            productTypesWithSubProducts,
            categoryTypes: selectedCategoryTypes,
            categoryTypesWithSubCategories,
        };
    };

    // Expose the data getter to parent via callback
    useEffect(() => {
        if (onSave) {
            onSave(getManagementData);
        }
    }, [selectedProductTypes, productTypesWithSubProducts, selectedCategoryTypes, categoryTypesWithSubCategories]);

    const hasOfferTypes = getData && getData('offerTypes');

    if (isCategoriesLoading) {
        return (
            <div className="preferences-skeleton-scope preferences-subpage-skeleton-scope">
                <style>{preferencesSkeletonCriticalCss}</style>
                <ManageCategoriesSkeleton hasOfferTypes={Boolean(hasOfferTypes)} />
            </div>
        );
    }

    const offerCategorySave = async (categoryName, selectedSubCategories) => {
        if (categoryName && selectedSubCategories) {

            const matchedCategory = sampleData.find(
                item => item.categoryName === categoryName
            );
            const existingCategoryRow =
                selectedCategoryTypes.find(
                    (item) =>
                        item?.categoryName === categoryName || item?.categoryname === categoryName,
                ) || matchedCategory;

            // Build selected subcategories first
            const initialSubCategoryList = selectedSubCategories.map(sc => ({
                categoryName: categoryName,
                categoryID: categoryID || sc.categoryId || 0,
                categoryId: categoryID || sc.categoryId || 0,
                subCategoryID: sc.subCategoryID || sc.subCategoryId || 0,
                subCategoryName: sc.subCategoryName || sc.subCategoryname || '',
                subCategoryname: sc.subCategoryName || sc.subCategoryname || '', // Ensure both formats
                isCustom: sc?.isCustom ?? true,
                isDelete: sc?.isDelete ?? false,
                isUsed: normalizeCategoryIsUsed(sc?.isUsed),
            }));

            // Now add removedData (ONLY items where subCategoryID !== 0)
            const validRemoved = removedData
                .filter((r) => r.subCategoryID !== 0 && !normalizeCategoryIsUsed(r.isUsed))  // IMPORTANT condition
                .map(r => ({
                    subCategoryID: r.subCategoryID,
                    subCategoryName: r.subCategoryName,
                    isCustom: r.isCustom,
                    isDelete: true
                }));

            // Final merge
            const finalStructure = [
                {
                    categoryName: categoryName,
                    categoryID: categoryID || 0,
                    // subCategory: [...initialSubCategoryList, ...validRemoved]
                    subCategory: [...initialSubCategoryList]

                }
            ];

            let formatChange = finalStructure.map(item => ({
                categoryName: item.categoryName,
                categoryID: item.categoryID,
                categoryname: item.categoryName, // Ensure categoryname is also set
                // convert boolean → string ("true" / "false")
                isCustom: true,
                isDelete: false,
                isUsed: normalizeCategoryIsUsed(existingCategoryRow?.isUsed),
                subCategory: item.subCategory.map(sub => ({
                    categoryName: item.categoryName,
                    categoryID: item.categoryID,
                    subCategoryID: sub.subCategoryID || sub.subCategoryId || 0,
                    subCategoryName: sub.subCategoryName || sub.subCategoryname || '',
                    subCategoryname: sub.subCategoryName || sub.subCategoryname || '', // Ensure subCategoryname is also set
                    isCustom: sub.isCustom ?? true,
                    isDelete: sub.isDelete ?? false,
                    isUsed: normalizeCategoryIsUsed(sub.isUsed),
                }))
            }));

            // Update the category in selectedCategoryTypes
            // First try by index, then by name matching (for newly created categories)
            let updatedData;
            if (categoryIndex >= 0 && categoryIndex < selectedCategoryTypes.length) {
                // Update by index (works for existing categories)
                updatedData = selectedCategoryTypes.map((item, index) =>
                    index === categoryIndex ? formatChange[0] : item
                );
            } else {
                // Update by name matching (works for newly created categories)
                updatedData = selectedCategoryTypes.map(item => {
                    const match = formatChange.find(fc => 
                        fc.categoryName === item.categoryName || 
                        fc.categoryName === item.categoryname ||
                        (item.categoryName && item.categoryName === categoryName) ||
                        (item.categoryname && item.categoryname === categoryName)
                    );
                    return match ? match : item;
                });
                
                // If category not found in selectedCategoryTypes, add it (shouldn't happen, but safety check)
                const categoryExists = updatedData.some(item => 
                    item.categoryName === categoryName || item.categoryname === categoryName
                );
                if (!categoryExists && formatChange[0]) {
                    updatedData = [...updatedData, formatChange[0]];
                }
            }
            setSelectedCategoryTypes(updatedData);
            
            // Update sampleData to keep it in sync
            setSampleData(prev => {
                const updatedSample = prev.map(item => {
                    if (item.categoryName === categoryName || item.categoryname === categoryName) {
                        return {
                            ...item,
                            subCategory: formatChange[0].subCategory
                        };
                    }
                    return item;
                });
                
                // If category not found in sampleData, add it
                const existsInSample = updatedSample.some(item => 
                    item.categoryName === categoryName || item.categoryname === categoryName
                );
                if (!existsInSample && formatChange[0]) {
                    updatedSample.push(formatChange[0]);
                }
                
                return updatedSample;
            });
            
            setIsCategoryModalOpen(false);
            setSelectedCategoryType(null);
            setSelectedSubCategories([]);
            setInitialSubCategories([]);
            setRemovedData([]); // Clear removedData after saving
            setValue('categoryname', '');
            OffModalVisiple(false)

            // Passing merged structure to your function
            // convertCategoryStructure(finalStructure);
        }
    };

    const buildFinalStructure = () => {
        let getInitialData = initialCategoryTypes.map(item => {
            return {
                dataList: {
                    categoryName: item.categoryName,
                    categoryID: item.categoryID,
                    isCustom: item.isCustom,
                    isDelete: item.isDelete
                },
                dataListSubCategory: (item.subCategory || []).map(sub => ({
                    categoryID: item.categoryID,
                    categoryName: item.categoryName,
                    subCategoryName: sub.subCategoryName,
                    subCategoryID: sub.subCategoryID,
                    isCustom: sub.isCustom,
                    isDelete: sub.isDelete
                }))
            };
        });

        let get_SelectedCategoryTypes = selectedCategoryTypes?.map(item => {
            return {
                dataList: {
                    categoryName: item.categoryName,
                    categoryID: item.categoryID,
                    isCustom: item.isCustom,
                    isDelete: item.isDelete
                },
                dataListSubCategory: (item.subCategory || []).map(sub => ({
                    categoryID: item.categoryID,
                    categoryName: item.categoryName,
                    subCategoryName: sub.subCategoryName,
                    subCategoryID: sub.subCategoryID,
                    isCustom: sub.isCustom,
                    isDelete: sub.isDelete
                }))
            };
        });


        const updatedSelected = get_SelectedCategoryTypes.map(selectedItem => {
    const initialItem = getInitialData.find(
        init => Number(init.dataList.categoryID) === Number(selectedItem.dataList.categoryID)
    );


    // If no matching category found → return as-is
    if (!initialItem) return selectedItem;

    const selectedSubCats = selectedItem.dataListSubCategory || [];
    const initialSubCats = initialItem.dataListSubCategory || [];

    // Create a Set of existing subCategoryID to check missing ones
    const existingIDs = new Set(selectedSubCats.map(sc => Number(sc.subCategoryID)));

    // Find missing subcategories
    const missingSubCats = initialSubCats
        .filter(sc => !existingIDs.has(Number(sc.subCategoryID)))
        .map(sc => ({
            ...sc,
            isCustom: false,
            isDelete: true
        }));

    // Combine existing + missing
    return {
        ...selectedItem,
        dataListSubCategory: [...selectedSubCats, ...missingSubCats]
    };
});

        mergeCategoryData(getInitialData, updatedSelected)
    };

    function mergeCategoryData(GetInitialData, get_SelectedCategoryTypes) {
        const result = [];

        // Convert arrays to lookup maps for faster matching
        // For categories with ID > 0, use categoryID as key
        // For categories with ID = 0 (new categories), use categoryName as key to avoid overwriting
        const initialMap = new Map();
        GetInitialData.forEach(item => {
            const catId = Number(item.dataList.categoryID);
            if (catId === 0) {
                // New categories: use categoryName as key
                initialMap.set(`name_${item.dataList.categoryName}`, item);
            } else {
                // Existing categories: use categoryID as key
                initialMap.set(catId, item);
            }
        });

        const selectedMap = new Map();
        get_SelectedCategoryTypes.forEach(item => {
            const catId = Number(item.dataList.categoryID);
            if (catId === 0) {
                // New categories: use categoryName as key to handle multiple new categories
                selectedMap.set(`name_${item.dataList.categoryName}`, item);
            } else {
                // Existing categories: use categoryID as key
                selectedMap.set(catId, item);
            }
        });

        // 1️⃣ ADD ALL ITEMS FROM SELECTED (highest priority)
        // This includes both existing categories and new categories
        for (const [key, selectedItem] of selectedMap) {
            const catId = Number(selectedItem.dataList.categoryID);
            
            if (catId === 0) {
                // New category (categoryID = 0) - always add it (don't check initialMap)
                result.push({
                    dataList: {
                        ...selectedItem.dataList,
                        isCustom: true,
                        isDelete: false
                    },
                    dataListSubCategory: selectedItem.dataListSubCategory || []
                });
            } else {
                // Existing category - check if it exists in initial
                if (initialMap.has(catId)) {
                    // category exists in both → pick SELECTED DATA
                    result.push({
                        dataList: {
                            ...selectedItem.dataList,
                            isCustom: true,
                            isDelete: false
                        },
                        dataListSubCategory: selectedItem.dataListSubCategory || []
                    });
                } else {
                    // exists only in SELECTED → keep as is
                    result.push({
                        dataList: {
                            ...selectedItem.dataList,
                            isCustom: true,
                            isDelete: false
                        },
                        dataListSubCategory: selectedItem.dataListSubCategory || []
                    });
                }
            }
        }

        // 2️⃣ ADD MISSING INITIAL DATA → marked as isDelete:true, isCustom:false
        // This handles the case when a category is removed (exists in initial but not in selected)
        for (const [key, initialItem] of initialMap) {
            const catId = Number(initialItem.dataList.categoryID);
            
            // Only check for deletion if it's an existing category (ID > 0)
            // New categories (ID = 0) in initial shouldn't exist, but if they do, skip them
            if (catId > 0) {
                if (!selectedMap.has(catId)) {
                    result.push({
                        dataList: {
                            ...initialItem.dataList,
                            isCustom: false,
                            isDelete: true
                        },
                        dataListSubCategory: initialItem.dataListSubCategory || []
                    });
                }
            }
        }

        mergeFinal(result, GetInitialData)

        return result;
    }


    function mergeFinal(resultData, getInitialData) {
        const result = JSON.parse(JSON.stringify(resultData)); // deep clone

        result.forEach(resultItem => {
            const { categoryName, categoryID } = resultItem.dataList;

            // If it's a new category (categoryID = 0), just ensure subcategories are properly formatted
            if (categoryID === 0) {
                resultItem.dataListSubCategory = (resultItem.dataListSubCategory || []).map(sub => ({
                    categoryID: 0,
                    categoryName: categoryName,
                    subCategoryName: sub.subCategoryName || '',
                    subCategoryID: sub.subCategoryID || 0,
                    isCustom: sub.isCustom ?? true,
                    isDelete: sub.isDelete ?? false
                }));
                return; // move to next result item - new categories don't need merging with initial
            }

            // For existing categories, find matching initial category by both ID and name
            const initialItem = getInitialData.find(
                item => Number(item.dataList.categoryID) === Number(categoryID) ||
                        (item.dataList.categoryName === categoryName && Number(item.dataList.categoryID) > 0)
            );
            
            // If no match found for existing category, ensure subcategories are properly formatted
            if (!initialItem) {
                resultItem.dataListSubCategory = (resultItem.dataListSubCategory || []).map(sub => ({
                    ...sub,
                    categoryID: categoryID,
                    categoryName: categoryName
                }));
                return; // move to next result item
            }

            // --- 1️⃣ OVERWRITE CATEGORY ID (for existing categories) ---
            resultItem.dataList.categoryID = initialItem.dataList.categoryID;

            // --- 2️⃣ MERGE SUBCATEGORIES ---
            const existingSubs = resultItem.dataListSubCategory || [];
            const initialSubs = initialItem.dataListSubCategory || [];

            // Create a Set of existing subCategoryIDs
            const existingSubIDs = new Set(
                existingSubs.map(sub => Number(sub.subCategoryID || 0))
            );

            // Find subcategories that exist in initial but not in existing (to mark as deleted)
            initialSubs.forEach(initSub => {
                const initSubID = Number(initSub.subCategoryID || 0);
                // Only add if it's not a new subcategory (ID !== 0) and not already in existing
                if (initSubID !== 0 && !existingSubIDs.has(initSubID)) {
                    const toAdd = {
                        categoryID: initialItem.dataList.categoryID,
                        categoryName: initialItem.dataList.categoryName,
                        subCategoryName: initSub.subCategoryName || '',
                        subCategoryID: initSub.subCategoryID || 0,
                        isCustom: false,
                        isDelete: true
                    };
                    existingSubs.push(toAdd);
                }
            });

            // Ensure all existing subcategories have proper categoryID and categoryName
            resultItem.dataListSubCategory = existingSubs.map(sub => ({
                ...sub,
                categoryID: initialItem.dataList.categoryID,
                categoryName: initialItem.dataList.categoryName
            }));
        });

        saveCateNetWorkCall(result)
        return result;
    }

    const saveCateNetWorkCall = async (result) => {
        try {
            // Ensure result is an array
            if (!Array.isArray(result) || result.length === 0) {
                return;
            }

            let convertListData = {
                // --- Collect all category objects ---
                dataList: result
                    .filter(item => item && item.dataList) // Filter out any invalid items
                    .map(item => ({
                        categoryName: item.dataList.categoryName || '',
                        categoryID: item.dataList.categoryID || 0,
                        isCustom: item.dataList.isCustom ?? true,
                        isDelete: item.dataList.isDelete ?? false
                    })),

                // --- Collect all subcategories from all items ---
                dataListSubCategory: result
                    .filter(item => item && item.dataListSubCategory) // Filter out items without subcategories
                    .flatMap(item =>
                        (item.dataListSubCategory || [])
                            .filter(sub => sub) // Filter out null/undefined subcategories
                            .map(sub => ({
                                categoryName: sub.categoryName || item.dataList.categoryName || '',
                                categoryID: sub.categoryID || item.dataList.categoryID || 0,
                                subCategoryName: sub.subCategoryName || '',
                                subCategoryID: sub.subCategoryID || 0,
                                isCustom: sub.isCustom ?? true,
                                isDelete: sub.isDelete ?? false
                            }))
                    )
            };


            const payload = {
                departmentId,
                clientId,
                userId,
                dataList: convertListData?.dataList,
                dataListSubCategory: convertListData?.dataListSubCategory
            };
            const res = await saveApi.refetch({
                fetcher: () => dispatch(saveOfferCategory(payload, false)),
                loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
                mode: 'create',
            });

            if (res?.status) {
                back(true)
            }
        } catch (err) {
        }
    };

    return (
        <>
            <Row>
                <Col sm={hasOfferTypes ? 6 : 12} xs={hasOfferTypes ? 6 : 12}>
                    {/* <h4 className="mb10">Manage Product/Category</h4> */}
                    <>
                        <div className="">

                            {/* <h4 className='mb15'></h4> */}
                            <RSTagsComponent
                            maxLength = {40}
                            headerText='Category/Sub category'
                            isShowHeader={true}
                                key={`categories-panel-${JSON.stringify(Object.keys(categoryTypesWithSubCategories).sort())}`}
                                tags={selectedCategoryTypes}
                                count={selectedCategoryTypes}
                                isRemove={true}
                                 isRefreshTooltip={CLEAR_ALL_TEXT}
                                deletedTags={(remove, tagIndex) => {
                                    // setTimeout(() => {
                                    //     deleteCategory(remove, tagIndex);
                                    // }, 1000)
                                }}
                                // maxLength = {40}

                                updatedTags={(tags, deleItem, tagIndex) => {

                                    // Handle deletion case - even if tags is empty, we need to update state
                                    if (deleItem != undefined) {
                                        setSelectedCategoryTypes(tags || []);
                                        // If tags is empty after deletion, return early (no new item to add)
                                        if (!tags || tags.length === 0) return;
                                    } else {
                                        // If no deletion and tags is empty, return early
                                        if (!tags || tags.length === 0) return;
                                    }

                                    const lastItem = tags[tags.length - 1];
                                    const finalValue = typeof lastItem === "string" && lastItem != null ? lastItem : null;

                                    // -----------------------------
                                    // 1️CASE: USER ADDED NEW CATEGORY
                                    // -----------------------------
                                    if (finalValue != null) {
                                        const addSelectedCategoryTypes = {
                                            categoryName: finalValue,
                                            categoryID: 0,
                                            isCustom: true,
                                            isDelete: false,
                                            isUsed: false,
                                            subCategory: [],
                                            categoryname: finalValue
                                        };
                                        // Update selected category list
                                        setSelectedCategoryTypes(prev => [...prev, addSelectedCategoryTypes]);
                                        // Update sample list
                                        setSampleData(prev => [...prev, addSelectedCategoryTypes]);

                                        // Save structure
                                        let savePayloadData = {
                                            dataList: [{
                                                categoryName: finalValue,
                                                categoryID: 0,
                                                isCustom: true,
                                                isDelete: false,
                                                isUsed: false,
                                            }],
                                            dataListSubCategory: []
                                        };

                                        // Save category to updated payload array
                                        setSavedCategoryData(prev => [...prev, savePayloadData]);

                                    }

                                }}
                                isLocalization
                                tagsBig
                                // customTagClass='communication-reference-scroll'
                                isObject={true}
                                offerCategory={true}
                                fieldItemKey="categoryName"
                                onTagClick={handleCategoryTypeClick}
                                getTagCount={getCategoryTypeSubcategoryCount}
                                getTagDisplayText={getCategoryTypeDisplayText}
                                scrollLastTagIntoViewOnAdd
                            />
                        </div>
                        <div className='d-flex justify-content-between align-items-center mt7'>
                            <small className='lh-base '>Note: Click the item name to edit and manage sub category.</small>
                        <LinkedCategoriesClearHint />
                        </div>
                        <small className='lh-base'>Note: Only alphanumeric characters, spaces, underscores and hyphens are allowed.</small>
                        <div className="buttons-holder">
                            <RSSecondaryButton
                                blockInteraction={isSaveLoading}
                                onClick={() => {
                                    if (isSaveLoading) return;
                                    setSelectedSubCategories(initialSubCategories);
                                    setIsCategoryModalOpen(false);

                                    setSelectedCategoryType(null);
                                    setSelectedSubCategories([]);
                                    setInitialSubCategories([]);
                                    setValue('categoryname', '');
                                    back(true)
                                }}
                                
                            >
                                Cancel
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                onClick={() => {
                                    buildFinalStructure()
                                }}
                                isLoading={isSaveLoading}
                                blockBodyPointerEvents={isSaveLoading}
                            >
                                Save
                            </RSPrimaryButton>
                        </div>
                    </>
                </Col>
                {hasOfferTypes && (
                    <Col sm={6} xs={6}>
                        {/* <h4 className="mb10">{OFFER_TYPES}</h4> */}
                        <div className="form-group">
                            <RSTagsComponent
                             isShowHeader = {true}
                              headerText={OFFER_TYPES}
                                placeholder={ENTER_KEYWORDS}
                                tags={getData('offerTypes')}
                                disabled
                                isObject
                                tagsBig
                                fieldItemKey="offerName"
                                size={10}
                                maxLength={40}
                                updatedTags={(tags) => {
                                    setValue('offerTag', tags);
                                }}
                                isLocalization
                                customTagClass='communication-reference-scroll'
                            />
                            <small className="mr25 mt5">{MAXIMUM_TEN_OFFER_TYPES}</small>
                        </div>
                    </Col>
                )}
            </Row>

            {/* Product Categories Modal */}
            <RSModal
                show={isProductCategoryModalOpen}
                handleClose={() => {
                    setIsProductCategoryModalOpen(false);
                    setSelectedProductType(null);
                    setSelectedSubProducts([]);
                    setInitialSubProducts([]);
                    setValue('productname', '');
                }}
                header={selectedProductType ? `${selectedProductType.categoryname} - ${SUBPRODUCTS}` : `${PRODUCT_CATEGORIES}`}
                body={
                    <div>
                        {selectedProductType && (
                            <>
                                <div className='form-group'>
                                    <Row>
                                        <Col sm={3}>
                                            <label>{PRODUCTType}</label>
                                        </Col>
                                        <Col sm={9}>
                                            <RSInput
                                                control={control}
                                                name='productname'
                                                placeholder='Product type'
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                <div className="">
                                    <RSTagsComponent
                                        key={`subproducts-${selectedSubProducts.length}`}
                                        placeholder={'Enter keywords'}
                                        tags={selectedSubProducts}
                                        size={10}
                                        maxLength={40}
                                        isEdit={true}
                                        updatedTags={(tags) => {
                                            const normalizedTags = tags.map((tag) => {
                                                if (typeof tag === 'string') {
                                                    // const availableSubProducts = getSubProducts(domain)?.[selectedProductType?.key] || [];
                                                    const availableSubProducts = getSubProducts() || [];

                                                    const existingSubProduct = availableSubProducts.find(
                                                        (sp) => sp.subCategoryName === tag
                                                    );

                                                    if (existingSubProduct) {
                                                        return existingSubProduct;
                                                    } else {
                                                        return {
                                                            categoryId: selectedProductType?.categoryId,
                                                            subCategoryId: Date.now() + Math.random(),
                                                            subCategoryName: tag,
                                                        };
                                                    }
                                                }
                                                return tag;
                                            });
                                            setSelectedSubProducts(normalizedTags);
                                        }}
                                        isLocalization
                                        tagsBig
                                        customTagClass='communication-reference-scroll'
                                        isObject={true}
                                        fieldItemKey="subCategoryName"
                                        isRemove={true}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                }
                footer={
                    <>
                        <RSSecondaryButton
                            onClick={() => {
                                setSelectedSubProducts(initialSubProducts);
                                setIsProductCategoryModalOpen(false);
                                setSelectedProductType(null);
                                setSelectedSubProducts([]);
                                setInitialSubProducts([]);
                                setValue('productname', '');
                            }}
                            className="mr10"
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={() => {
                                const updatedProductTypeName = productTypeName || selectedProductType?.categoryname || '';

                                if (selectedProductType) {
                                    // Update the product type name in selectedProductTypes
                                    setSelectedProductTypes((prev) => {
                                        return prev.map((pt) => {
                                            if ((pt.categoryId && selectedProductType.categoryId && pt.categoryId === selectedProductType.categoryId) ||
                                                (pt.key && selectedProductType.key && pt.key === selectedProductType.key)) {
                                                return {
                                                    ...pt,
                                                    categoryname: updatedProductTypeName,
                                                    categoryName: updatedProductTypeName,
                                                };
                                            }
                                            return pt;
                                        });
                                    });

                                    // Save the subproducts with both categoryId and key as keys
                                    setProductTypesWithSubProducts((prev) => {
                                        const updated = { ...prev };

                                        // Save with categoryId
                                        if (selectedProductType.categoryId) {
                                            updated[selectedProductType.categoryId] = [...selectedSubProducts];
                                        }

                                        // Save with key
                                        if (selectedProductType.key) {
                                            updated[selectedProductType.key] = [...selectedSubProducts];
                                        }

                                        return updated;
                                    });
                                }
                                setIsProductCategoryModalOpen(false);
                                setSelectedProductType(null);
                                setSelectedSubProducts([]);
                                setInitialSubProducts([]);
                                setValue('productname', '');
                            }}
                        >
                            {OK}
                        </RSPrimaryButton>
                    </>
                }
            />

            {/* Category Modal */}
            <RSModal
                show={isCategoryModalOpen}
                handleClose={() => {
                    OffModalVisiple(false)
                    setIsCategoryModalOpen(false);
                    setSelectedCategoryType(null);
                    setSelectedSubCategories([]);
                    setInitialSubCategories([]);
                    setValue('categoryname', '');
                }}
                header={selectedCategoryType ? `${selectedCategoryType} - Subcategories` : "Category Types"}
                body={
                    <div>
                        {selectedCategoryType && (
                            <>
                                <div className='form-group'>
                                    <Row>
                                        <Col sm={3}>
                                            <label>Category type</label>
                                        </Col>
                                        <Col sm={9}>
                                            <RSInput
                                                control={control}
                                                name='categoryname'
                                                placeholder='Category type'
                                                required
                                                disabled
                                                maxLength={40}
                                            // rules={{
                                            //     required: ENTER_MINIMUM_PURCHASE_VALUE,                                                
                                            // }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                <div>
                                    <RSTagsComponent
                                        key={`subcategories-${selectedSubCategories.length}`}
                                        placeholder={'Enter keywords'}
                                        tags={selectedSubCategories}
                                        isRefreshTooltip={CLEAR_ALL_TEXT}
                                        maxLength={40}
                                        isEdit={true}
                                        offerCategory={true}
                                        deletedTags={(remove) => {

                                            const itemsToRemove = Array.isArray(remove) ? remove : [remove];
                                            const withFlagsList = itemsToRemove.map(cleanRemove => ({
                                                ...cleanRemove,
                                                isDelete: true,
                                                isCustom: cleanRemove?.isCustom ?? false
                                            }));

                                            setRemovedData(prev => [...prev, ...withFlagsList]);
                                        }}

                                        updatedTags={(tags) => {

                                            const normalizedTags = tags.map((tag) => {

                                                // 🔹 If tag is a string (ex: "vhj")
                                                if (typeof tag === "string") {
                                                    return {
                                                        categoryId: 0,
                                                        subCategoryID: 0,
                                                        subCategoryName: tag,
                                                        isCustom: true,
                                                        isDelete: false,
                                                        isUsed: false,
                                                    };
                                                }

                                                // 🔹 If tag is an object
                                                let subCategoryID = tag?.subCategoryID ?? tag?.subCategoryId ?? 0;
                                                let subCategoryName = tag?.subCategoryName ?? "";
                                                let CategoryID = tag?.categoryId ?? 0;

                                                return {
                                                    categoryId: CategoryID,
                                                    subCategoryID,
                                                    subCategoryName,
                                                    isCustom: true,
                                                    isDelete: false,
                                                    isUsed: normalizeCategoryIsUsed(tag?.isUsed),
                                                };
                                            });

                                            setSelectedSubCategories(normalizedTags);
                                        }}
                                        isLocalization
                                        tagsBig
                                        customTagClass='communication-reference-scroll'
                                        isObject={true}
                                        fieldItemKey="subCategoryName"
                                        isRemove={true}
                                    />
                                   <div className='d-flex justify-content-between align-items-center mt7'>
                            <small className='lh-base'>Note: Only alphanumeric characters, spaces, underscores and hyphens are allowed.</small>
                        <LinkedCategoriesClearHint />
                        </div>
                                </div>

                                {/* <small className="mt5 lh-base">You can add up to 5 subcategories per category.</small> */}
                            </>
                        )}
                    </div>
                }
                footer={
                    <>
                        <RSSecondaryButton
                            onClick={() => {
                                setSelectedSubCategories(initialSubCategories);
                                setIsCategoryModalOpen(false);
                                setSelectedCategoryType(null);
                                setSelectedSubCategories([]);
                                setInitialSubCategories([]);
                                setValue('categoryname', '');
                                clearErrors('categoryname');
                                OffModalVisiple(false)
                            }}
                           
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={() => {
                                const updatedCategoryTypeName = categoryTypeName || (typeof selectedCategoryType === 'string' ? selectedCategoryType : (selectedCategoryType?.categoryName || selectedCategoryType?.categoryname)) || '';
                                if (updatedCategoryTypeName?.length > 0) {
                                    offerCategorySave(updatedCategoryTypeName, selectedSubCategories)
                                } else {
                                    // Handle case where category name is empty
                                    setError('categoryname', {
                                        type: 'categoryname',
                                        message: 'Enter category name',
                                    });
                                }
                            }}
                        >
                            {OK}
                        </RSPrimaryButton>
                    </>
                }
            />
        </>
    );
};

export default ManageCategories;
