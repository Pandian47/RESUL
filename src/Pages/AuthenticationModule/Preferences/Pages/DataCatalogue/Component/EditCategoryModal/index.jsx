import { ALERT, DO_YOU_WISH_TO_CONTINUE, PERSONALISATION } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _map from 'lodash/map';

import SelectAttributeListboxModal from 'Components/SelectAttributeListboxModal';
import { getDataAttributes, updateClassifications, updateFilterGroup, updateFilterGroups } from 'Reducers/preferences/datacatalogue/request';
import { getSessionId } from 'Reducers/globalState/selector';
import PersonalizationListbox from './PersonalizationListbox';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
const EditModal = ({ handleClose, show, categoryData }) => {
    const { dataCatalogueAttrs, filterGroups } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [warningModal, setWarningModal] = useState({
        show: false,
        data: {},
    });

    let selectedAttrs = categoryData?.data?.map((attr) => ({ id: attr.dataAttributeId, ...attr })) || [];
    let availableAttrs =
    dataCatalogueAttrs
    .filter((x) => !selectedAttrs.filter((y) => y.id === x.dataAttributeId)?.length)
    ?.map((attr) => ({ id: attr.dataAttributeId, ...attr })) || [];
    availableAttrs = availableAttrs?.sort((a, b) =>
        a?.uIPrintableName?.toLowerCase() > b?.uIPrintableName?.toLowerCase() ? 1 : -1,
    );
    if (categoryData?.isFilter === 'F') {
        availableAttrs = availableAttrs.filter(
            (e) => e.filterGroupId === 0 || e.filterGroupId === '' || e.filterGroupId === null,
        );
    }
    if (categoryData?.isFilter === 'N') {
        let filterGroupIds = filterGroups?.map((item) => item?.filterGroupId);
        availableAttrs = availableAttrs.filter(
            (e) =>
                e.filterGroupId === 0 ||
                e.filterGroupId === '' ||
                e.filterGroupId === null ||
                !filterGroupIds.includes(+e.filterGroupId),
        );
    }
    if (categoryData?.name === 'Audience overview' || categoryData?.isFilter === 'F' || categoryData?.isFilter === 'N') {
        availableAttrs = availableAttrs.filter((e) => !e.dataClassificationId?.includes('5'));
    }
    const handleUpdateClassifications = (data) => {
        if(categoryData?.name === 'Advanced analytics' || categoryData?.name === 'Audience overview' || categoryData?.name === 'Profile completeness' || categoryData?.name === 'Offline conversion'){
        // Check if any attributes were moved from right to left (removed)
        const removedAttributes = selectedAttrs?.filter(
            (attr) => !data?.rightAttributes?.some((newAttr) => newAttr.id === attr.id)
        );
        
        // Only show warning popup if attributes were removed (moved from right to left)
        if (removedAttributes?.length > 0) {
            setWarningModal({
                data: data,
                show: true,
            });
        } else {
            submitUpdatedData(data);
        }
        }else{
             setWarningModal({
                data: data,
                show: true,
            });
        }
      
    };

    const submitUpdatedData = async (data) => {
        let result = categoryData?.data.filter(
            (o) => !data.rightAttributes.some((v) => v.dataAttributeId === o.dataAttributeId),
        );
        let payload = {
            departmentId,
            dataClassificationId: categoryData.id,
            dataClassificationName: categoryData.name === 'Personalization' ? 'Personalisation' : categoryData.name,
            dataAttributeIDs: _map(data.rightAttributes, 'id'),
            removedataAttributeIDs: result.map((e) => e.dataAttributeId),
            clientId,
            userId,
        };
        if (categoryData?.isFilter === 'F') {
            payload = {
                departmentId,
                filterGroupId: categoryData.id,
                filterGroupName: categoryData.name,
                dataAttributeIDs: _map(data.rightAttributes, 'id'),
                removedataAttributeIDs: result.map((e) => e.dataAttributeId),
                clientId,
                userId,
            };
        }
        if (categoryData?.isFilter === 'F') {
            const { status } = await dispatch(updateFilterGroup(payload));
            if (status) handleClose(false);
            else{handleClose(false)}
        } else {
            const { status } = await dispatch(updateClassifications(payload));
            if (status) handleClose(false);
            else{handleClose(false)}
        }
    };
    const [popupContent, setPopupContent] = useState('')
    useEffect(() => {
        switch (categoryData?.name) {
            case 'Advanced analytics':
                setPopupContent('Data will not be shown in Detailed analytics for the removed attributes.');
                break;
            case 'Audience base':
            case 'Content target':
            case 'Personalisation':
                setPopupContent("This will impact your 'Scheduled' and 'In-progress' communications if these attributes were used.");
                break;
            case 'Audience overview':
            case 'Profile completeness':
                setPopupContent('Data will not be shown in Master Data screen for the removed attributes.');
                break;
            case 'Offline conversion':
                setPopupContent('Data will not be shown in analytics for the removed attributes.');
                break;
            default:
                setPopupContent("This will impact your 'Scheduled' and 'In-progress' communications if these attributes were used.");
        }

    },[categoryData?.name])
    const handleNameCheck = (name) => {
        const avlFilterGroups = filterGroups?.map(item => item?.filterGroupName?.toLowerCase());
        if(avlFilterGroups?.includes(name?.toLowerCase())){
            return true;
        }else{
            return false
        }
    }
    const updateNewCategory = async (data, name) => {
        const dataAttIds = data?.rightAttributes?.map((item) => item?.dataAttributeId)?.toString();
        const payload =  {
            departmentId,
            userId,
            clientId,
            filterGroupId: 0,
            filterGroupName: name,
            dataAttributeIDs: dataAttIds || '',
        }
        const payloadGroups = {
            clientId,
            userId,
            departmentId,
        };
        const { status } = await dispatch(updateFilterGroups({payload}));
        if (status) {
            handleClose(false);
            dispatch(getDataAttributes(payloadGroups,false,''))
            // dispatch(getFilterGroups(payloadGroups));
        }else{
            handleClose(false);
        }
    }
    return (
        <Fragment>
            {categoryData?.name === 'Personalisation' || categoryData?.name === PERSONALISATION ? (
                <PersonalizationListbox
                    show={warningModal?.show ? !show : show}
                    handleClose={handleClose}
                    leftAttributes={availableAttrs}
                    rightAttributes={selectedAttrs}
                    header={categoryData?.isFilter === 'F' ? 'Edit filter group' : 'Edit  classification'}
                    showInput
                    InputValue={categoryData?.name}
                    getSelectedData={handleUpdateClassifications}
                    isLabel
                />
            ) : (
                <SelectAttributeListboxModal
                    show={warningModal?.show ? !show :show}
                    handleClose={handleClose}
                    leftAttributes={availableAttrs}
                    rightAttributes={selectedAttrs}
                    header={categoryData?.isFilter === 'F' ? 'Edit filter group' : categoryData?.isFilter === 'N' ? 'New filter group': 'Edit classification'}
                    showInput
                    InputValue={categoryData?.name}
                    textField={'uIPrintableName'}
                    getSelectedData={categoryData?.isFilter === 'N'? updateNewCategory : handleUpdateClassifications}
                    isLabel
                    disabled={categoryData?.isFilter === 'N' ? false : true}
                    isNewCategory={categoryData?.isFilter === 'N' ? true : false}
                    handleNameCheck={(inputName) => handleNameCheck(inputName)}
                />
            )}
            <WarningPopup
                show={warningModal?.show}
                handleClose={(type) => {
                    setWarningModal((prev) => ({
                        ...prev,
                        show: false,
                    }));
                    if (type === 1) {
                        submitUpdatedData(warningModal?.data);
                    }
                }}
                content={popupContent}
                text={DO_YOU_WISH_TO_CONTINUE}
                type={'Edit Category'}
                showCancel={true}
                customHeader= {<div className='d-flex gap-2'>
                <i
                    className={`${alert_medium} pointer-event-none icon-md color-primary-orange mr5`}
                ></i>
                <p>{ALERT}</p> 
                </div>}
            />
        </Fragment>
    );
};

export default EditModal;
