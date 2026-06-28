import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useState } from 'react';
import { Push_WebContext } from './Context';
import { ACTION_INITIAL_STATE } from '../../constant';
import PushWebCreate from './Create';
import WebOnboardingNew from './Create/WebOnboardingNew';
import PushWebGrid from './Grid';
import Goal from '../Goal/Grid';
import Create from '../Goal/Create';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { update_disableBU } from 'Reducers/preferences/CommunicationSettings/reducer';
const Web = () => {
    const dispatch = useDispatch()
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [failedApi, setFailedApi] = useState('')
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const [useStepperView, setUseStepperView] = useState(false);
    const value = { setGridCreate, gridCreate, useStepperView, setUseStepperView };
    const { state } = useLocation();

    useEffect(() => {
        if (state?.type === false) {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                pushWebAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: true,
                    show: true,
                },
            }));
        } else if (state?.from === 'WN') {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                pushWebAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: true,
                    show: true,
                },
            }));
        }
        else if (state?.mode === 'add') {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                pushWebAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: true,
                    show: true,
                },
            }));
        }
    }, [state]);
    const handleErrClose = () => {
        if (failedApi === 'GetWebPushbyID') {
            setGridCreate(ACTION_INITIAL_STATE)
        } else if (failedApi === 'GetWebnotifyGoalSettingbyID') {
            setGridCreate((prev) => {
                return {
                    ...prev,
                    showGrid: false,
                    pushWebAction: {
                        edit: {
                            editState: prev?.pushWebGoalAction?.edit?.editState,
                            isEdit: false,
                        },
                        create: false,
                        show: false,
                    },
                    pushWebGoalAction: {
                        edit: {
                            editState: [],
                            isEdit: false,
                        },
                        create: false,
                        showGrid: true,
                        show: false,
                    },
                };
            });

        }
        setFailedApi('')
    }
    useEffect(() => {
        if (!gridCreate?.showGrid) {
            dispatch(update_disableBU(true));
        }
        return (() => {
            dispatch(update_disableBU(false));
        })
    }, [gridCreate?.showGrid])
    return (
        <Push_WebContext.Provider value={value}>
            {/* {gridCreate.showGrid ? (
                <PushWebGrid />
            ) : (
                <PushWebCreate
                    config={gridCreate.pushWebAction.edit.editState}
                    type={gridCreate.pushWebAction.edit.isEdit ? 'edit' : 'create'}
                    handleCancel={(status) => {
                        if (status) {
                            setGridCreate((prev) => ({
                                ...prev,
                                showGrid: status,
                                pushWebAction: {
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
            {gridCreate.showGrid && <PushWebGrid />}
            {gridCreate.pushWebAction.show && (
                false ? (
                    <WebOnboardingNew
                        config={gridCreate.pushWebAction.edit.editState}
                        type={gridCreate.pushWebAction.edit.isEdit ? 'edit' : 'create'}
                        handleCancel={(status) => {
                            if (status) {
                                setGridCreate((prev) => ({
                                    ...prev,
                                    showGrid: status,
                                    pushWebAction: {
                                        edit: {
                                            editState: [],
                                            isEdit: false,
                                        },
                                        create: false,
                                        show: false,
                                    },
                                    pushWebGoalAction: {
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
                ) : (
                    <PushWebCreate
                        config={gridCreate.pushWebAction.edit.editState}
                        type={gridCreate.pushWebAction.edit.isEdit ? 'edit' : 'create'}
                        handleCancel={(status) => {
                            if (status) {
                                setGridCreate((prev) => ({
                                    ...prev,
                                    showGrid: status,
                                    pushWebAction: {
                                        edit: {
                                            editState: [],
                                            isEdit: false,
                                        },
                                        create: false,
                                        show: false,
                                    },
                                    pushWebGoalAction: {
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
                )
            )}
            {gridCreate.pushWebGoalAction.showGrid && <Goal config={gridCreate.pushWebAction.edit.editState} setFailedApi={setFailedApi} />}
            {gridCreate.pushWebGoalAction.show && (
                <Create
                    config={gridCreate.pushWebGoalAction.edit}
                    type={gridCreate.pushWebGoalAction.edit.isEdit ? 'edit' : 'create'}
                    setFailedApi={setFailedApi}
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </Push_WebContext.Provider>
    );
};

export default Web;
