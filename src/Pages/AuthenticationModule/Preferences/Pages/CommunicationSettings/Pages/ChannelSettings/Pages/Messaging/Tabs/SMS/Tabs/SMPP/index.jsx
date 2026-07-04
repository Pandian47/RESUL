import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ACTION_INITIAL_STATE } from '../../constant';
import { SMPPProvider } from './Context';
import SMPPCreate from './Create';
import SMPPList from './Grid/index.jsx';

import { useDispatch, useSelector } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';

const SMPP = () => {
    const dispatch = useDispatch()
    const queryState = useQueryParams('/preferences/communication-settings');
    let addSenderFromComm = queryState?.from === 'messaging' && queryState?.addType === 'addSenderId';
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [ failedApi, setFailedApi] = useState('')
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const value = { setGridCreate, gridCreate, addSenderFromComm };

    const handleErrClose = () => {
        if (failedApi === 'GetClientSMSSettingsbyID' || failedApi === 'GetSMSSettingsbyID') {
            setGridCreate(ACTION_INITIAL_STATE)
        }
        setFailedApi('')
    }
    useLayoutEffect(() => {
        if (addSenderFromComm) {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                smppAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: true,
                },
            }));
        }
    }, [addSenderFromComm]);
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
