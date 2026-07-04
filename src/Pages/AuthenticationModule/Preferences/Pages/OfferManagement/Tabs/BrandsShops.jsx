import { encodeUrl } from 'Utils/modules/crypto';
import { ADD, MANAGE_CATEGORY } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { findIndex as _findIndex, map as _map } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { process } from '@progress/kendo-data-query';
import ResGrid from 'Pages/KendoDocs/CommonComponents/ResGrid';
import { getSessionId } from 'Reducers/globalState/selector';
import { fetchOfferBrand, fetchOfferStore } from 'Reducers/preferences/OfferManagements/request';
import RSTooltip from 'Components/RSTooltip';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import BrandListRowCell from './Components/BrandListRowCell';
import BrandListDetail from './Components/BrandListDetail';

import useQueryParams from 'Hooks/useQueryParams';
import { fetchOfferSubCategory, fetchOfferCategory } from 'Reducers/preferences/OfferManagements/request';
import RSModal from 'Components/RSModal';

import ManageCategories from '../ManageCategories';

const initialDataState = {
    skip: 0,
    take: 5,
};

const pagerSettings = {
    info: true,
    pageSizes: [5, 10, 20],
    previousNext: true,
    buttonCount: 4,
    className: 'rs-kendo-pager',
};

const BrandsShops = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const queryState = useQueryParams('/preferences/offer-management');
    const tabIndex = queryState?.index !== undefined ? queryState.index : 1; // Default to tab 1 (Brands & Shops)
    const [brandsList, setBrandsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [brandData, setBrandData] = useState({
        dataState: initialDataState,
        brandList: [],
    });
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [offModalVisiple, setOffModalVisiple] = useState(false);
    const [productData, setProdectData] = useState(['Brand']);

    const fetchBrands = useCallback(async () => {
        setIsLoading(true);
        let mode = 0;
        let payload = { departmentId, clientId, userId, mode };
        let brandRes = await dispatch(fetchOfferBrand(payload));
        if (brandRes?.status && brandRes?.data) {
            const brandsData = Array.isArray(brandRes.data) ? brandRes.data : [];
            // Initialize expanded field for each brand
            const brandsWithExpanded = brandsData.map((brand) => ({
                ...brand,
                expanded: false,
            }));
            setBrandsList(brandsWithExpanded);

            if (brandRes?.data?.length > 0) {
                setProdectData(['Brand', 'Shop']);
            } else {
                setProdectData(['Brand']);
            }
        } else {
            setBrandsList([]);
            setProdectData(['Brand']);
        }
        setIsLoading(false);
    }, [departmentId, clientId, userId, dispatch]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (departmentId && clientId && userId) {
            fetchBrands();
        }
        // setBrandData((prev) => ({
        //     ...prev,
        //     dataState: initialDataState,
        // }));
    }, [departmentId, clientId, userId, fetchBrands]);

    useEffect(() => {
        if (brandsList?.length) {
            let { data } = process(brandsList, brandData.dataState);
            setBrandData((prev) => ({
                ...prev,
                brandList: data,
            }));
        } else {
            setBrandData((prev) => ({
                ...prev,
                brandList: [],
            }));
        }
    }, [brandsList, brandData.dataState]);

    const fetchCategories = async () => {
        if (!departmentId || !clientId || !userId) return;

        if (brandsList?.length == 0) return;

        const payload = { departmentId, clientId, userId };

        // ================= FETCH CATEGORY ===================
        const categoryRes = await dispatch(fetchOfferCategory(payload));

        // ================= FETCH SUBCATEGORY ===================
        const subcategoryRes = await dispatch(fetchOfferSubCategory(payload));

        if (categoryRes?.status && subcategoryRes?.status) {
            // Merge categoryName + subCategoryName into brandList
            const updatedBrandList = (brandsList || []).map((item) => {
                // Match Category
                const categoryMatch = categoryRes?.data?.find((c) => c.categoryTypeID == item.categoryID);

                // Match SubCategory
                const subCategoryMatch = subcategoryRes?.data?.find((sc) => sc.categoryTypeID == item.categoryID);

                return {
                    ...item,
                    categoryName: categoryMatch ? categoryMatch.categoryName : '',
                    subCategoryName: subCategoryMatch ? subCategoryMatch.subCategoryName : '',
                };
            });

            // Final single update
            // setBrandData((prev) => ({
            //     ...prev,
            //     brandList: updatedBrandList,
            // }));
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [brandsList]);

    useEffect(() => {
        const replaceIcons = () => {
            const mappings = [
                {
                    selector: '.k-i-caret-alt-to-left, .k-i-arrow-double-left',
                    classes: ['icon-rs-pagination-first-medium', 'icon-xs'],
                },
                {
                    selector: '.k-i-arrow-60-left, .k-i-caret-alt-left, .k-i-chevron-left',
                    classes: ['icon-rs-pagination-previous-medium', 'icon-xs'],
                },
                {
                    selector: '.k-i-arrow-60-right, .k-i-caret-alt-right, .k-i-chevron-right',
                    classes: ['icon-rs-pagination-next-medium', 'icon-xs'],
                },
                {
                    selector: '.k-i-caret-alt-to-right, .k-i-arrow-double-right',
                    classes: ['icon-rs-pagination-last-medium', 'icon-xs'],
                },
            ];
            mappings.forEach(({ selector, classes }) => {
                document.querySelectorAll(selector).forEach((element) => {
                    element.classList.remove('k-icon');
                    element.classList.add(...classes);
                });
            });
        };
        replaceIcons();
        const observer = new MutationObserver(replaceIcons);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [brandsList]);

    const dataStateChange = (event) => {
        const { data } = process(brandsList, event.dataState);
        setBrandData({
            dataState: event.dataState,
            brandList: data,
        });
        fetchCategories();
        window.scrollTo(0, 0);
    };

    const expandChange = async ({ dataItem }) => {
        const shops = dataItem?.shopsDetails;
        const isExpand = dataItem?.expanded || false;
        let temp = [...brandsList];
        const brandIndex = _findIndex(temp, ['brandID', dataItem?.brandID]);
        const tempBrand = { ...brandsList[brandIndex] };

        if (!isExpand && (!shops || shops.length === 0 || JSON.stringify(shops) === '[{}]')) {
            const payload = {
                userId,
                departmentId,
                clientId,
                brandId: dataItem?.brandID,
                mode: 0,
            };
            // Expand immediately and show local skeleton rows while the API resolves.
            tempBrand.shopsDetails = [];
            tempBrand.isFailure = false;
            tempBrand.shopsLoading = true;
            tempBrand.extendedBrandId = dataItem?.brandID;
            tempBrand.expanded = true;
            temp[brandIndex] = tempBrand;
            setBrandsList(temp);

            const { data, status } = await dispatch(fetchOfferStore(payload, false));
            tempBrand.shopsLoading = false;
            if (status) {
                tempBrand.shopsDetails = data || [];
                tempBrand.isFailure = false;
            } else {
                tempBrand.shopsDetails = [{}];
                tempBrand.isFailure = true;
            }
            tempBrand.extendedBrandId = dataItem?.brandID;
            tempBrand.expanded = true;
        } else {
            tempBrand.expanded = !isExpand;
            tempBrand.extendedBrandId = null;
            tempBrand.shopsLoading = false;
        }
        temp[brandIndex] = tempBrand;
        temp = _map(temp, (brand, index) => {
            const tempBrandItem = { ...brand };
            if (index !== brandIndex) tempBrandItem.expanded = false;
            return tempBrandItem;
        });
        setBrandsList(temp);
    };

    const listColumns = useMemo(
        () => [
            {
                cell: (props) => (
                    <BrandListRowCell
                        {...props}
                        onRefresh={fetchBrands}
                        onExpandChange={expandChange}
                    />
                ),
            },
        ],
        [fetchBrands, expandChange],
    );

    const fetchCategoriesData = async () => {
        // setIsLoadingCategories(true);
        try {
            // let payload = { departmentId, clientId, userId };
            // let categoryRes = await disPatch(getCommunicationProductsList(payload));
            // let categories = categoryRes?.status ? categoryRes?.data : [];

            // setCategoriesData(categories);
            setShowCategoriesModal(true);
        } catch (error) {
            // setCategoriesData([]);
        } finally {
            // setIsLoadingCategories(false);
        }
    };

    return (
        <div className="page-content">
            <div className="flex-row justify-content-end top-sub-heading mt0">
                <ul className="rs-list-group-horizontal">
                    <li>
                        <RSTooltip position="top" text={MANAGE_CATEGORY} className="lh0">
                            <i
                                className={`${settings_medium} icon-lg color-primary-blue`}
                                onClick={async () => {
                                    await fetchCategoriesData();
                                }}
                            ></i>
                        </RSTooltip>
                    </li>
                    <li>
                        <RSBootstrapdown
                            data={productData}
                            flatIcon
                            defaultItem={
                                <>
                                    <RSTooltip text={ADD} className="position-relative top3">
                                        <i
                                            className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                            id="rs_data_circle_plus_fill_edge"
                                        />
                                    </RSTooltip>
                                </>
                            }
                            showUpdate={false}
                            className="no_caret"
                            onSelect={(e) => {
                                const state = { index: tabIndex };
                                const encryptState = encodeUrl(state);
                                if (e === 'Brand') {
                                    navigate(`/preferences/create-brand?q=${encryptState}`, {
                                        state,
                                    });
                                } else if (e === 'Shop') {
                                    navigate(`/preferences/create-shop?q=${encryptState}`, {
                                        state,
                                    });
                                }
                            }}
                        />
                    </li>
                </ul>
            </div>

            <RSModal
                show={showCategoriesModal}
                size="lg"
                header="Categories"
                className={`${offModalVisiple ? 'opacity-0' : ''}`}
                handleClose={() => setShowCategoriesModal(false)}
                body={
                    <div className="rs-kendo-table-hide-header">
                        <ManageCategories
                            OffModalVisiple={(val) => {
                                setOffModalVisiple(val);
                            }}
                            back={(val) => {
                                if (val) {
                                    setShowCategoriesModal(false);
                                }
                            }}
                            isAgencyValue={false}
                            companies={null}
                        />
                    </div>
                }
            />
            <ResGrid
                layout="list"
                listPreset="brand"
                listConfig={{ rowGap: 15, detailOverlap: 22 }}
                skeletonVariant="brand"
                skeletonRows={5}
                loading={isLoading}
                data={brandData.brandList}
                columns={listColumns}
                dataItemKey="brandID"
                detail={(props) => (
                    <BrandListDetail
                        {...props}
                        onRefresh={fetchBrands}
                        onCollapse={(dataItem) => expandChange({ dataItem })}
                    />
                )}
                expandField="expanded"
                onExpandChange={expandChange}
                sortable
                pageable={brandsList.length > 5 ? pagerSettings : false}
                scrollable="none"
                dataState={brandData.dataState}
                onDataStateChange={dataStateChange}
                total={brandsList.length}
                isServerSide
                className="custom-rspager"
                // wrapperClassName={!isLoading && brandsList.length > 0 ? 'mt-21' : 'mt21'}
                emptyMessage="No brands found"
            />
        </div>
    );
};

export default BrandsShops;
