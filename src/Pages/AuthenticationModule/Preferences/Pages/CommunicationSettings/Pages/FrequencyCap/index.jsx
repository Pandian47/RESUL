import { getUserDetails } from 'Utils/modules/crypto';
import { getEnvironment } from 'Utils/modules/environment';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { CustomSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useEffect, useState } from 'react';
import FrequencyCreate from './Component/Create';
import FrequencyGrid from './Component/Grid';
import FrequencyCapCreate from './Component/Create/FrequencyCapCreate';

import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import RSConfirmationModal from 'Components/ConfirmationModal';


import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
export const FrequencyProvider = createContext();

import { update_disableBU } from 'Reducers/preferences/CommunicationSettings/reducer';
const FrequencyCap = () => {
    const dispatch = useDispatch();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [confirmationModal, setConfimrationModal] = useState(false);
    const [gridCreate, setGridCreate] = useState({
        showGrid: true,
        frequencyAction: {
            edit: {
                editState: [],
                isEdit: false,
            },
            create: false,
        },
    });
    const [failedApi, setFailedApi] = useState('')
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const { clientId, userId, departmentId, departmentName } = useSelector((state) => getSessionId(state));

    const { licenseTypeId } = getUserDetails();
    const value = { setGridCreate, gridCreate };
    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') setConfimrationModal(true);
        else {
            setConfimrationModal(false);
        }
    }, [departmentId]);
     useEffect(() => {
        if(!gridCreate?.showGrid){
            dispatch(update_disableBU(true));
        }
        return(() => {
            dispatch(update_disableBU(false));
        })
    },[gridCreate?.showGrid])
    const handleErrClose = () => {
        if(failedApi === 'GetFrequencyCapByID' || failedApi === 'GetAudienceGroupList'){
            setGridCreate({
                showGrid: true,
                frequencyAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: false,
                },
            })
        }
        setFailedApi('')
    }

    const handleAddClick = () => {
        if (!addAccess) return;
        setGridCreate((prev) => ({
            ...prev,
            showGrid: false,
            frequencyAction: {
                edit: {
                    editState: [],
                    isEdit: false,
                },
                create: true,
            },
        }));
    };

    const handleCreateCancel = (status) => {
        if (status) {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: status,
                frequencyAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: false,
                },
            }));
        }
    };

    const createFormType = gridCreate.frequencyAction.edit.isEdit ? 'edit' : 'create';
    const CreateForm = getEnvironment() === 'TEAM' ? FrequencyCapCreate : FrequencyCreate;

    return (
        // Contend holder starts
        <FrequencyProvider.Provider value={value}>
            <div>
                {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                    <>
                        <div className="mt15">
                            <CustomSkeleton isError={true} count={5} height={50} />
                        </div>
                    </>
                ) : (
                    <>
                        {gridCreate.showGrid ? (
                            <div>
                                <div className="flex-row mt21 top-sub-heading">
                                    <div className="fr flex-right tsh-icons">
                                        <ul className="rs-list-group-horizontal jc-right">
                                            <li onClick={handleAddClick}>
                                                <RSTooltip text="Add" position="top" className="lh0">
                                                    <i
                                                        className={`${
                                                            circle_plus_fill_edge_large
                                                        } icon-lg color-primary-blue icon-hover-shadow-primary ${
                                                            !addAccess ? 'click-off' : ''
                                                        }`}
                                                        id="rs_data_circle_plus_fill_edge"
                                                    ></i>
                                                </RSTooltip>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                {/* Content starts */}
                                <FrequencyGrid setGridCreate={setGridCreate} />
                            </div>
                        ) : (
                            <CreateForm
                                type={createFormType}
                                handleCancel={handleCreateCancel}
                                setFailedApi={setFailedApi}
                            />
                        )}
                    </>
                )}
                <RSConfirmationModal
                    show={confirmationModal}
                    text={SELECT_BU}
                    handleClose={() => {
                        setConfimrationModal(false);
                    }}
                    handleConfirm={() => {
                        setConfimrationModal(false);
                    }}
                    secondaryButton={false}
                />
            </div>
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose )}
        </FrequencyProvider.Provider>
        // Content holder ends
    );
};

export default FrequencyCap;
