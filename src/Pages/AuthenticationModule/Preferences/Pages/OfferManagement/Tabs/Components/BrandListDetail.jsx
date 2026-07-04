import { encodeUrl } from 'Utils/modules/crypto';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getmasterData } from 'Utils/modules/masterData';
import { ARE_YOU_SURE_DELETE, DELETE, EDIT, OK } from 'Constants/GlobalConstant/Placeholders';
import { delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { get as _get, map as _map } from 'Utils/modules/lodashReplacements';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import ResNoDataAvailable from 'Pages/KendoDocs/CommonComponents/ResNoDataAvailable';
import { LIST_DETAIL_EMPTY_MESSAGES } from 'Pages/KendoDocs/CommonComponents/ResGrid/config';

import { getSessionId } from 'Reducers/globalState/selector';

import { deleteStoreOffer } from 'Reducers/preferences/OfferManagements/request';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import ListEntityImage from 'Pages/KendoDocs/CommonComponents/ResGrid/ListEntityImage';

import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const BrandListDetail = ({ dataItem, disabled, onCollapse, onRefresh }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const shopsList = dataItem?.shopsDetails || [];
    const isFailure = dataItem?.isFailure || false;
    const isShopsLoading = Boolean(dataItem?.shopsLoading);
    const hasShopRows =
        shopsList.length > 0 && shopsList.some((shop) => shop?.storeID != null || shop?.shortName);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [shopToDelete, setShopToDelete] = useState(null);
    const deleteApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDeleteLoading = deleteApi.isFetching;

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));


     const masterData = getmasterData();
        const [country, setCountry] = useState('');
    
       useEffect(() => {
        // Match country from master list
        const get_countryMasterList = masterData?.countryMasterList || [];
    
        const matchedCountry = get_countryMasterList.find(
            (item) => item.countryID == dataItem?.shopsDetails[0]?.country
        );
    
        if (matchedCountry) {
            setCountry(matchedCountry.country);
        }
    }, [masterData, dataItem]);

    const handleEditShop = (shop) => {
        const state = { shopId: shop?.storeID, brandId: dataItem?.brandID };
        const encryptState = encodeUrl(state);
        navigate(`/preferences/create-shop?q=${encryptState}`);
    };

    const handleDeleteShop = async (shop) => {
        if (!shop) {
            setShowDeleteModal(false);
            setShopToDelete(null);
            return;
        }
        const payload = {
            departmentId,
            clientId,
            userId,
            storeId: shop?.storeID,
        };
        const res = await deleteApi.refetch({
            fetcher: () => dispatch(deleteStoreOffer(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (res?.status) {
            setShowDeleteModal(false);
            setShopToDelete(null);
            if (onRefresh) {
                onRefresh();
            }
        } else {
            dispatch(
                update_failures_API_Errors({
                    field: 'DeleteStoreOffer',
                    message: res?.message || 'No data available',
                }),
            );
        }
    };

    const getStatusClassName = (status) => {
        return status === 0 ? 'status-draft' : 'status-completed';
    };

    const getStatusText = (status) => {
        return status === 0 ? 'Inactive' : 'Active';
    };

    const brandStatusClass = getStatusClassName(dataItem?.status);

    return (
        <div className={`rs-grid-detail-view brand-shop-detail ${brandStatusClass}`}>
            <table className="grid-detail-content grid-listing-comm">
                <thead >
                    <tr>
                        <th>Shop name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {!isShopsLoading && !isFailure && hasShopRows && (
                        <Fragment>
                            {_map(shopsList, (shop, index) => {
                                const shopStatus = _get(shop, 'status', 0);
                                const statusClassName = getStatusClassName(shopStatus);
                                const statusText = getStatusText(shopStatus);
                                
                                return (
                                    <tr key={index}>
                                        <td>
                                            <div className='shop-name-cell'>
                                                <ListEntityImage
                                                    src={shop?.image}
                                                    alt={shop?.shortName || 'Shop name'}
                                                    variant="shop"
                                                />
                                           <div className='shop-name-text'>
                                                {shop?.shortName?.length > 35 ? (
                                                <RSTooltip text={shop?.shortName} position="top">
                                                    {truncateTitle(shop?.shortName, 35)}
                                                </RSTooltip>
                                            ) : (
                                                shop?.shortName || 'N/A'
                                            )}
                                           </div>
                                            </div>
                                        </td>
                                        <td>
                                            {shop?.city && country
                                                ? `${shop.city}, ${country}`
                                                : shop?.city || country || 'N/A'}
                                        </td>
                                        <td>
                                            <div className={`${statusClassName} communication-status`}>
                                                <small>{statusText}</small>
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            <ul className="rs-communication-icon">
                                                <li>
                                                    <RSTooltip text={EDIT} position="top">
                                                        <i
                                                            id={`rs_BrandListDetail_Edit_${index}`}
                                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                            onClick={() => handleEditShop(shop)}
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <RSTooltip text={DELETE || 'Delete'} position="top">
                                                        <i
                                                            id={`rs_BrandListDetail_Delete_${index}`}
                                                            className={`${delete_medium} icon-md color-primary-red`}
                                                            onClick={() => {
                                                                setShopToDelete(shop);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                            </ul>
                                        </td>
                                    </tr>
                                );
                            })}
                        </Fragment>
                    )}
                    {/* {!isFailure && shopsList.length === 0 && (
                        <RSSkeletonTable text count={2}/>
                    )} */}
                  
                </tbody>
            </table>
            {isShopsLoading && (
                <div className="p15">
                    <RSSkeletonTable count={3} isCustombox />
                </div>
            )}
            {!isShopsLoading && !isFailure && !hasShopRows && (
                <div className="resgrid-detail-empty">
                    <ResNoDataAvailable message={LIST_DETAIL_EMPTY_MESSAGES.brandShops} />
                </div>
            )}
              <div className={`${brandStatusClass} expand-plus`}>
                        <ul className="camp-icon-pannel">
                            <li>
                                <i 
                                    className="k-icon k-i-minus cursor-pointer" 
                                    onClick={() => onCollapse(dataItem)}
                                ></i>
                            </li>
                        </ul>
                    </div>

            <RSConfirmationModal
                show={showDeleteModal}
                text={ARE_YOU_SURE_DELETE || 'Are you sure you want to delete this shop?'}
                primaryButtonText={OK}
                handleClose={() => {
                    if (isDeleteLoading) return;
                    setShowDeleteModal(false);
                    setShopToDelete(null);
                }}
                handleConfirm={(status) => {
                    if (isDeleteLoading) return;
                    if (status) {
                        handleDeleteShop(shopToDelete);
                    }
                }}
                isCloseButton={false}
                isLoading={isDeleteLoading}
                blockBodyPointerEvents
            />
        </div>
    );
};

export default BrandListDetail;
