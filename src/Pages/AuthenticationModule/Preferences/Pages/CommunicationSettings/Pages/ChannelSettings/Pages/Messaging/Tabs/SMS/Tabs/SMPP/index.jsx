import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useState } from 'react';
import { ACTION_INITIAL_STATE } from '../../constant';
import { SMPPProvider } from './Context';
import SMPPCreate from './Create';
import SMPPList from './Grid/index.jsx';

import { useDispatch, useSelector } from 'react-redux';

const SMPP = () => {
    const dispatch = useDispatch()
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [ failedApi, setFailedApi] = useState('')
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const value = { setGridCreate, gridCreate };

    const handleErrClose = () => {
        if (failedApi === 'GetClientSMSSettingsbyID' || failedApi === 'GetSMSSettingsbyID') {
            setGridCreate(ACTION_INITIAL_STATE)
        }
        setFailedApi('')
    }
    return (
        <SMPPProvider.Provider value={value}>
            {gridCreate.showGrid ? (
                <SMPPList />
            ) : (
                <SMPPCreate
                    config={gridCreate.smppAction.edit.editState}
                    type={gridCreate.smppAction.edit.isEdit ? 'edit' : 'create'}
                    handleCancel={(status) => {
                        if (status) {
                            setGridCreate((prev) => ({
                                ...prev,
                                showGrid: status,
                                smppAction: {
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
        </SMPPProvider.Provider>
    );
};

export default SMPP;
