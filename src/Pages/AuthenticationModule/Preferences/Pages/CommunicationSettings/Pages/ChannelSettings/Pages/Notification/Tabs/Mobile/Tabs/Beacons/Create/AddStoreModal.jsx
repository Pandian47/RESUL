import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import RSModal from 'Components/RSModal';
import * as placeholder from 'Constants/GlobalConstant/Placeholders';
import { getSessionId } from 'Reducers/globalState/selector';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import { saveBrandOffer } from 'Reducers/preferences/OfferManagements/request';
import { buildBrandPayload } from 'Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/CreateBrand/constant';
import BrandOfferForm from 'Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/CreateBrand/BrandOfferForm';

const AddStoreModal = ({ show, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector(getSessionId);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = useCallback(async (data) => {
        setIsSaving(true);
        const payload = buildBrandPayload(data, clientId, departmentId, userId);
        const { status: apiStatus, message = 'No data available' } = await dispatch(saveBrandOffer(payload));
        setIsSaving(false);

        if (apiStatus) {
            onSuccess({ legalName: data.legalName?.trim() });
            onClose();
            return;
        }

        dispatch(
            update_failures_API_Errors({
                field: 'SaveBrandOffer',
                message: message || 'No data available',
            }),
        );
    }, [clientId, departmentId, dispatch, onClose, onSuccess, userId]);

    if (!show) {
        return null;
    }

    return (
        <RSModal
            show={show}
            size="xxlg"
            settings={{ enforceFocus: false }}
            header={placeholder.ADD_STORE}
            handleClose={onClose}
            isCustomScroll
            className="beacons-add-store-modal pr15"
            body={
                <div className="page-content">
                    <Container className="px0">
                        <BrandOfferForm
                            isActive={show}
                            onSubmit={handleSave}
                            onCancel={onClose}
                            submitLabel={placeholder.SAVE}
                            cancelLabel={placeholder.CANCEL}
                            isSaving={isSaving}
                            saveButtonId="rs_BeaconsAddStore_Save"
                            cancelButtonId="rs_BeaconsAddStore_Cancel"
                        />
                    </Container>
                </div>
            }
        />
    );
};

AddStoreModal.propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func,
    onSuccess: PropTypes.func,
};

AddStoreModal.defaultProps = {
    show: false,
    onClose: () => {},
    onSuccess: () => {},
};

export default AddStoreModal;
