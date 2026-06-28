import { useEffect, useState } from 'react';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { useForm } from 'react-hook-form';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';

const TemplateCategoryList = ({
    categoryData,
    categoriesLoading = false,
    list,
    setTemplateFlag,
    setTemplateName,
    userId,
    from,
    type,
    setPayload,
    payload,
    setRenderData,
    onManageCategoriesClick
}) => {
    const [selectedCount, setSelectedCount] = useState(0);
    // const categoryComponents = categoryData?.map((category, index) => {
    //     if (userId === category.templateCategoryId) {
    //         return { data: list };
    //     } else {
    //         return {
    //             data: list.filter((item) => item.templateCategoryID === category.templateCategoryId),
    //         };
    //     }
    // });

    const currentPayload = from === 'preference' ? type?.payload : payload;
    const currentSetPayload = from === 'preference' ? type?.setPayload : setPayload;

    const { control, setValue, setError, clearErrors } = useForm();
    const dropDownData = categoryData.map((category) => {
        return category.categoryName;
    });

    const handleSelect = (selectedOption) => {
        clearErrors('TemplateCatagory');

        // Update selected count for dynamic spacing
        setSelectedCount(selectedOption?.value?.length || 0);

        const selectedCategoryIds = categoryData
            .filter((category) => selectedOption?.value.includes(category.categoryName))
            .map((category) => category.templateCategoryId);

        // Preserve current pagination when changing category filter
        const currentPageNo = currentPayload?.pagination?.pageNo || 1;
        const currentPageSize = currentPayload?.pagination?.recordLimit || 4;
        
        if (!selectedOption?.value || selectedOption.value.length === 0) {
            currentSetPayload((pre) => ({
                ...pre,
                filteration: {
                    ...pre.filteration,
                    templateCategoryId: null,
                },
                pagination: {
                    pageNo: currentPageNo,
                    recordLimit: currentPageSize,
                },
            }));
            setValue('TemplateCatagory', ['All']);
            setSelectedCount(1);
            setRenderData?.({ data: list });
            return;
        }

        if (selectedOption.value.includes('All') && selectedOption.value.length > 1) {
            const categoriesIdString = selectedCategoryIds.join(',');
            currentSetPayload((pre) => ({
                ...pre,
                filteration: {
                    ...pre.filteration,
                    templateCategoryId: categoriesIdString,
                },
                pagination: {
                    pageNo: currentPageNo,
                    recordLimit: currentPageSize,
                },
            }));
            return;
        }

        if (selectedOption.value.includes('All')) {
            currentSetPayload((pre) => ({
                ...pre,
                filteration: {
                    ...pre.filteration,
                    templateCategoryId: '',
                },
                pagination: {
                    pageNo: currentPageNo,
                    recordLimit: currentPageSize,
                },
            }));
            setRenderData({ data: list });
            return;
        }


        if (selectedCategoryIds.length !== 0) {
            const categoriesIdString = selectedCategoryIds.join(',');
            currentSetPayload((pre) => ({
                ...pre,
                filteration: {
                    ...pre.filteration,
                    templateCategoryId: categoriesIdString,
                },
                pagination: {
                    pageNo: currentPageNo,
                    recordLimit: currentPageSize,
                },
            }));
        }
    };

    // const categoryComponents = categoryData?.map((category, index) => {
        //     if (userId === category.templateCategoryId) {
        //         return { data: list };
        //     } else {
        //         return {
        //             data: list.filter((item) => item.templateCategoryID === category.templateCategoryId),
        //         };
        //     }
        // });
        // const selectedData = selectedCategoryIds.reduce((acc, id) => {
        //     const foundCategory = categoryComponents.find((component) =>
        //         component.data.some((item) => item.templateCategoryID === id),
        //     );

        //     if (foundCategory) {
        //         const filteredItems = foundCategory.data.filter((item) => item.templateCategoryID === id);
        //         acc.push(...filteredItems);
        //     }

        //     return acc;
        // }, []);

    useEffect(() => {
        // Only set initial value if payload is not already set
        // if (!currentPayload?.filteration?.templateCategoryId) {
        //     setValue('TemplateCatagory', ['All']);
        // }
        setRenderData({ data: list });
    }, [list]);

    useEffect(() => {
        if (!currentPayload?.filteration?.templateCategoryId) {
            setValue('TemplateCatagory', ['All']);
        }
    }, []);

    // useEffect(() => {
    //     if (currentPayload?.filteration?.templateCategoryId) {
    //         const categoriesNames = categoryData.filter((category) =>
    //             currentPayload.filteration.templateCategoryId.includes(category.templateCategoryId)
    //         ).map((category) => category.categoryName);
    //         setValue('TemplateCatagory', categoriesNames);
    //     }
    // }, [currentPayload?.filteration?.templateCategoryId]);

    useEffect(() => {
        const categoryId = currentPayload?.filteration?.templateCategoryId;

        if (categoryId) {
            // Convert the comma-separated string to an array of numbers
            const idsArray = categoryId.split(',').map(id => Number(id));
                        
            const categoriesNames = categoryData
                .filter((category) => idsArray.includes(category.templateCategoryId))
                .map((category) => category.categoryName);
            if(categoriesNames.includes('All')){
                const values = categoriesNames.filter(name => name !== 'All');
                setValue('TemplateCatagory', values);
                setSelectedCount(values?.length|| 0);
            } else {
                setValue('TemplateCatagory', categoriesNames);
                setSelectedCount(categoriesNames?.length || 0);
            }
        } else {
            setValue('TemplateCatagory', ['All']);
            setSelectedCount(1);
            if (categoryId === null) {
                currentSetPayload((pre) => ({
                    ...pre,
                    filteration: {
                        ...pre.filteration,
                        templateCategoryId: '',
                    },
                }));
            }
        }
    }, [currentPayload?.filteration?.templateCategoryId, categoryData]);

    // Calculate dynamic bottom margin based on selected count
    const calculateBottomMargin = () => {
        if (selectedCount <= 3) return '21px';
        if (selectedCount <= 6) return '71px';
        if (selectedCount <= 9) return '91px';
        if (selectedCount <= 12) return '121px';
        if (selectedCount <= 15) return '151px';
        if (selectedCount <= 18) return '181px';
        if (selectedCount <= 20) return '211px';
        
        // Fallback for any edge cases
        return `${21 + Math.ceil((selectedCount - 3) / 3) * 30}px`;
    };

    return (
        <>
            {/* <RSTabbar
                dynamicTab={`res-tabs-2 row rs-tabs-auto-width email-rs-tab`}
                activeClass={'active'}
                tabData={categoryData?.map((category, index) => ({
                    id: index,
                    text: category.categoryName,
                    component: () => (
                        <TemplateGridViewCategories
                            text={category.categoryName}
                            id={category.templateCategoryId}
                            data={categoryComponents[index]}
                            setTemplateFlag={setTemplateFlag}
                            setTemplateName={setTemplateName}
                            categoryData={categoryData}
                            from={from}
                            type={type}
                        />
                    ),
                }))}
                defaultClass={`col-sm-3`}
                // callBack={handleTemplate}
            /> */}

            <div >
                <RSMultiSelect
                    name="TemplateCatagory"
                    data={dropDownData}
                    control={control}
                    handleChange={(e) => handleSelect(e)}
                    label={'Template category'}
                    className="w-auto"
                    isLoading={categoriesLoading}
                    popupSettings={{
                        popupClass: `addImportAudienceDropdownListContainer`,
                    }}
                    footer={
                        <RSDropdownFooterBtn
                            title="Add new category"
                            handleClick={onManageCategoriesClick}
                        />
                    }
                />
            </div>
        </>
    );
};

export default TemplateCategoryList;
