import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useState } from 'react';
import { ACTION_INITIAL_STATE } from './constant';
import { PushMobileContext } from './context';
import AppNotificationOnBoarding from './Create';
import AppNotificationGrid from './Grid';
import Goal from '../Goal/Grid';
import Create from '../Goal/Create';
import { useLocation } from 'react-router-dom';
import useQueryParams from 'Hooks/useQueryParams';

import { useDispatch, useSelector } from 'react-redux';
import { update_disableBU } from 'Reducers/preferences/CommunicationSettings/reducer';
const Apps = () => {
    const dispatch = useDispatch()
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [ failedApi, setFailedApi] = useState('')
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };
    useEffect(() => {
        if (navState?.type === true || navState?.mode === 'add') {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                pushMobileAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: true,
                    show: true,
                },
            }));
        }
    }, [queryState, state]);
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const value = { setGridCreate };

     const handleErrClose = () => {
            if(failedApi === 'GetMobilePushById'){
                setGridCreate(ACTION_INITIAL_STATE)
            }else if(failedApi === 'GetPushnotifyGoalSettingbyID'){
                setGridCreate((prev) => ({
                    ...prev,
                    showGrid: false,
                    pushMobileAction: {
                        edit: {
                            editState: prev?.pushMobileGoalAction?.edit?.editState,
                            isEdit: false,
                        },
                        create: false,
                        show: false,
                    },
                    pushMobileGoalAction: {
                        edit: {
                            editState: [],
                            isEdit: false,
                        },
                        create: false,
                        showGrid: true,
                        show: false,
                    },
                }));
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
        <PushMobileContext.Provider value={value}>
            {/* {gridCreate.showGrid ? (
                <AppNotificationGrid />
            ) : (
                <AppNotificationOnBoarding
                    config={gridCreate.pushMobileAction.edit.editState}
                    type={gridCreate.pushMobileAction.edit.isEdit ? 'edit' : 'create'}
                    handleCancel={(status) => {
                        if (status) {
                            setGridCreate((prev) => ({
                                ...prev,
                                showGrid: status,
                                pushMobileAction: {
                                    edit: {
                                        editState: [],
                                        isEdit: false,
                                    },
                                    create: false,
                                },
                            }));
                        }
                    }}
                />
            )} */}

            {gridCreate.showGrid && <AppNotificationGrid />}
            {gridCreate.pushMobileAction.show && (
                <AppNotificationOnBoarding
                    config={gridCreate.pushMobileAction.edit.editState}
                    type={gridCreate.pushMobileAction.edit.isEdit ? 'edit' : 'create'}
                    handleCancel={(status) => {
                        if (status) {
                            setGridCreate((prev) => ({
                                ...prev,
                                showGrid: status,
                                pushMobileAction: {
                                    edit: {
                                        editState: [],
                                        isEdit: false,
                                    },
                                    create: false,
                                    show: false,
                                },
                                pushMobileGoalAction: {
                                    edit: {
                                        editState: [],
                                        isEdit: false,
                                    },
                                    create: false,
                                    showGrid: false,
                                    show: false,
                                },
                            }));
                        }
                    }}
                    setFailedApi={setFailedApi}
                />
            )}
            {gridCreate.pushMobileGoalAction.showGrid && <Goal config={gridCreate.pushMobileAction.edit.editState} />}
            {gridCreate.pushMobileGoalAction.show && (
                <Create
                    config={gridCreate.pushMobileGoalAction.edit}
                    type={gridCreate.pushMobileGoalAction.edit.isEdit ? 'edit' : 'create'}
                    setFailedApi={setFailedApi}
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose )}
        </PushMobileContext.Provider>
    );
};

export default Apps;
