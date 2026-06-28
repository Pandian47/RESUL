import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getmasterData } from 'Utils/modules/masterData';
import { ARE_YOU_SURE_DELETE, DELETE, EDIT, LOCATION, OK } from 'Constants/GlobalConstant/Placeholders';
import { delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import _get from 'lodash/get';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import { LAYOUT_CLASSES } from 'Pages/KendoDocs/CommonComponents/ResGrid/config';

import { getSessionId } from 'Reducers/globalState/selector';
import RSConfirmationModal from 'Components/ConfirmationModal';

import { deleteBrandOffer } from 'Reducers/preferences/OfferManagements/request';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';

import ListEntityImage from 'Pages/KendoDocs/CommonComponents/ResGrid/ListEntityImage';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const BrandListRowCell = (props) => {
    let { dataItem, onRefresh, onExpandChange } = props;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const status = _get(dataItem, 'status', 0);
    const className = status === 0 ? 'status-draft' : 'status-completed';
    const statusText = status === 0 ? 'Inactive' : 'Active';
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const deleteApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDeleteLoading = deleteApi.isFetching;

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const userDetail = getUserDetails();
    const masterData = getmasterData();
    const [country, setCountry] = useState('');

    useEffect(() => {
        // Match country from master list
        const get_countryMasterList = masterData?.countryMasterList || [];

        const matchedCountry = get_countryMasterList.find((item) => item.countryID == dataItem?.country);

        if (matchedCountry) {
            setCountry(matchedCountry.country);
        }
    }, [masterData, dataItem]);

    const handleEdit = () => {
        const state = { brandId: dataItem?.brandID };
        const encryptState = encodeUrl(state);
        navigate(`/preferences/create-brand?q=${encryptState}`);
    };

    const handleExpandClick = (e) => {
        const tr = e.currentTarget.closest('tr');
        if (!tr) return;
        const expandTarget = tr.querySelector(
            '.k-hierarchy-cell .k-icon-button, .k-hierarchy-cell a, .k-hierarchy-cell button, .k-hierarchy-cell .k-icon',
        );
        if (expandTarget && typeof expandTarget.click === 'function') {
            expandTarget.click();
        }
    };

    const handleDelete = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
            brandId: dataItem?.brandID,
        };
        const res = await deleteApi.refetch({
            fetcher: () => dispatch(deleteBrandOffer(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (res?.status) {
            setShowDeleteModal(false);
            if (onRefresh) {
                onRefresh();
            }
        } else {
            dispatch(
                update_failures_API_Errors({
                    field: 'DeleteBrandOffer',
                    message: res?.message || 'No data available',
                }),
            );
        }
    };

    return (
        <>
            <td>
                <div
                    className={`rs-communication-list ${className} comm-listing brand-shops-card mb0 ${
                        dataItem?.expanded ? 'sp-grid-expanded' : ''
                    }`}
                >
                    <div className="communication-content">
                        <div className="d-flex align-items-center resgrid-brand-title-row">
                            <ListEntityImage
                                src={dataItem?.image}
                                alt={dataItem?.shortName || dataItem?.legalName || 'Brand logo'}
                                variant="brand"
                            />
                            {/* </div> */}

                            {/* <div className="communication-content"> */}
                            <div className="">
                                <span className="badge">{dataItem?.shortName || 'N/A'}</span>
                                <p className={LAYOUT_CLASSES.listCardTitle}>
                                    {dataItem?.legalName?.length > 60 ? (
                                        <RSTooltip
                                            text={dataItem?.legalName}
                                            position="bottom"
                                            className="d-inline-block"
                                        >
                                            {truncateTitle(dataItem?.legalName, 60)}
                                        </RSTooltip>
                                    ) : (
                                        dataItem?.legalName
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="communication-content">
                        <small className="mb3">{LOCATION}</small>
                        <p>
                            {dataItem?.city && dataItem?.country
                                ? `${dataItem?.city}, ${country}`
                                : dataItem?.city || dataItem?.country || 'N/A'}
                        </p>
                    </div>

                    <div className="communication-content"></div>

                    <div className="communication-content">
                        <div className={`${className} communication-status`}>
                            <small>{statusText}</small>
                        </div>

                        <ul className="rs-communication-icon d-flex justify-content-evenly">
                            <li>
                                <RSTooltip text={EDIT} position="top" className = 'position-relative left20'>
                                    <i
                                        id="rs_data_pencil_edit"
                                        className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                        onClick={handleEdit}
                                    ></i>
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip text={DELETE || 'Delete'} position="top">
                                    <i
                                        id="rs_BrandListRowCell_Delete"
                                        className={`${delete_medium} icon-md color-primary-red`}
                                        onClick={() => setShowDeleteModal(true)}
                                    ></i>
                                </RSTooltip>
                            </li>
                        </ul>
                    </div>
                    <div
                        className={` expand-plus  ${className} ${dataItem?.expanded ? 'd-none pe-none' : ''}`}
                        onClick={handleExpandClick}
                        role="button"
                        aria-label="Expand row"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    >
                        <ul className="camp-icon-pannel">
                            <li className={`${dataItem?.expanded ? 'pe-none' : ''}`}>
                                <i className="k-icon k-i-plus" style={{ pointerEvents: 'auto' }}></i>
                            </li>
                        </ul>
                    </div>
                </div>
                <RSConfirmationModal
                    show={showDeleteModal}
                    text={ARE_YOU_SURE_DELETE || 'Are you sure you want to delete this brand?'}
                    primaryButtonText={OK}
                    handleClose={() => {
                        if (isDeleteLoading) return;
                        setShowDeleteModal(false);
                    }}
                    handleConfirm={(status) => {
                        if (isDeleteLoading) return;
                        if (status) {
                            handleDelete();
                        }
                    }}
                    isCloseButton={false}
                    isLoading={isDeleteLoading}
                    blockBodyPointerEvents
                />
            </td>
        </>
    );
};

export default BrandListRowCell;
