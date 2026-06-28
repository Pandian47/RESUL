import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useState } from 'react';
import { MOBILE_USERDEVICE_ACTION_INITIAL_STATE } from '../../constant';

import UserDeviceSetupCreate from './Create';
import UserDeviceSetupGrid from './Grid';
import { Push_MobileUserDeviceSetUpContext } from './Context';

import { useDispatch, useSelector } from 'react-redux';
import { update_disableBU } from 'Reducers/preferences/CommunicationSettings/reducer';

const UserDeviceSetup = () => {
    const dispatch = useDispatch()
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [ failedApi, setFailedApi] = useState('')
    const [gridCreate, setGridCreate] = useState(MOBILE_USERDEVICE_ACTION_INITIAL_STATE);

    const value = { setGridCreate };
     const handleErrClose = () => {
           if(failedApi === 'GetUserDeviceSetupById'){
            setGridCreate(MOBILE_USERDEVICE_ACTION_INITIAL_STATE)
           }
            setFailedApi('')
        }
    useEffect(() => {
        if(!gridCreate?.showGrid){
            dispatch(update_disableBU(true));
        }
        return(() => {
            dispatch(update_disableBU(false));
        })
    },[gridCreate?.showGrid])
    return (
        <Push_MobileUserDeviceSetUpContext.Provider value={value}>
            {gridCreate.showGrid ? (
                    <UserDeviceSetupGrid />
            ) : (
                <UserDeviceSetupCreate
                    config={gridCreate.pushMobileUserDeviceSetUpAction.edit.editState}
                    type={gridCreate.pushMobileUserDeviceSetUpAction.edit.isEdit ? 'edit' : 'create'}
                    handleCancel={(status) => {
                        if (status) {
                            setGridCreate((prev) => ({
                                ...prev,
                                showGrid: status,
                                pushMobileUserDeviceSetUpAction: {
                                    edit: {
                                        editState: [],
                                        isEdit: false,
                                    },
                                    create: false,
                                },
                            }));
                        }
                    }}
                    setFailedApi={setFailedApi}
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose )}
        </Push_MobileUserDeviceSetUpContext.Provider>
    );
};

export default UserDeviceSetup;
