import { useEffect } from 'react';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { useForm } from 'react-hook-form';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';

const TemplateCategoryList = ({
    categoryData,
    list,
    setTemplateFlag,
    setTemplateName,
    userId,
    from,
    type,
    setPayload,
    payload,
    setRenderData,
    onManageCategoriesClick,
    pagerPageConfig,
    setPagerPageConfig,
    onFilterChange,
}) => {
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
        onFilterChange?.();
        const selectedCategoryIds = categoryData
            .filter((category) => selectedOption?.value.includes(category.categoryName))
            .map((category) => category.templateCategoryId);

        // Preserve pagination from pagerPageConfig (source of truth) if available
        if (setPagerPageConfig) {
            setPagerPageConfig((pre) => {
                const currentPageNo = pre?.currentPage || 1;
                const currentPageSize = pre?.pageSize || 4;
                const currentSkip = pre?.skip || 0;
                
                // Update payload with preserved pagination based on selection
                if (!selectedOption?.value || selectedOption.value.length === 0) {
                    currentSetPayload((prev) => ({
                        ...prev,
                        filteration: {
                            ...prev.filteration,
                            templateCategoryId: '',
                        },
                        pagination: {
                            pageNo: currentPageNo,
                            recordLimit: currentPageSize,
                        },
                    }));
                } else if (selectedOption.value.includes('All') && selectedOption.value.length > 1) {
                    const categoriesIdString = selectedCategoryIds.join(',');
                    currentSetPayload((prev) => ({
                        ...prev,
                        filteration: {
                            ...prev.filteration,
                            templateCategoryId: categoriesIdString,
                        },
                        pagination: {
                            pageNo: currentPageNo,
                            recordLimit: currentPageSize,
                        },
                    }));
                } else if (selectedOption.value.includes('All')) {
                    currentSetPayload((prev) => ({
                        ...prev,
                        filteration: {
                            ...prev.filteration,
                            templateCategoryId: '',
                        },
                        pagination: {
                            pageNo: currentPageNo,
                            recordLimit: currentPageSize,
                        },
                    }));
                    setRenderData({ data: list });
                } else if (selectedCategoryIds.length !== 0) {
                    const categoriesIdString = selectedCategoryIds.join(',');
                    currentSetPayload((prev) => ({
                        ...prev,
                        filteration: {
                            ...prev.filteration,
                            templateCategoryId: categoriesIdString,
                        },
                        pagination: {
                            pageNo: currentPageNo,
                            recordLimit: currentPageSize,
                        },
                    }));
                }
                
                // Return preserved config
                return {
                    ...pre,
                    skip: currentSkip,
                    take: currentPageSize,
                    currentPage: currentPageNo,
                    pageSize: currentPageSize
                };
            });
        } else {
            // Fallback if pagerPageConfig is not available
            if (!selectedOption?.value || selectedOption.value.length === 0) {
                currentSetPayload((pre) => ({
                    ...pre,
                    filteration: {
                        ...pre.filteration,
                        templateCategoryId: '',
                    },
                }));
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
                }));
            }
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
            } else {
            setValue('TemplateCatagory', categoriesNames);
            }
        } else {
            setValue('TemplateCatagory', ['All']);
        }
    }, [currentPayload?.filteration?.templateCategoryId, categoryData]);

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

            <RSMultiSelect
                name="TemplateCatagory"
                data={dropDownData}
                control={control}
                handleChange={(e) => handleSelect(e)}
                label={'Template category'}
                className="w-auto"
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
        </>
    );
};

export default TemplateCategoryList;
