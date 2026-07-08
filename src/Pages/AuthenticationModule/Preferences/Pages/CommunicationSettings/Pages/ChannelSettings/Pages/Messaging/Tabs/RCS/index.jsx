import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import RCSGrid from './Grid';
import { RCSProvider } from './Context';
import { ACTION_INITIAL_STATE, RCS_FORM_ACTIONS_PORTAL_ID } from './constants';

import { useDispatch, useSelector } from 'react-redux';
import RCSVendorCreate from './Create/RCSVendorCreate';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';
import { RCS_INNER_TAB_CONFIG, resolveRcsInnerTabState, syncRcsInnerTabQuery } from '../../../../constant';
import useQueryParams from 'Hooks/useQueryParams';
import { useLocation } from 'react-router-dom';

const RCS = () => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [failedApi, setFailedApi] = useState('');
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const addVendorFromComm =
        queryState?.from === 'CreateCommunication' && queryState?.mode === 'add';
    const [tabState, setTabState] = useState(() => resolveRcsInnerTabState(navState));
    const value = { setGridCreate, addVendorFromComm };
    useLayoutEffect(() => {
        if (addVendorFromComm) {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                rcsAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: true,
                },
            }));
        }
    }, [addVendorFromComm]);

    useEffect(() => {
        setTabState(resolveRcsInnerTabState({ ...queryState, ...state }));
    }, [queryState, state]);

    const handleErrClose = () => {
        if (failedApi === 'GetRCSSettigByID') {
            setGridCreate(ACTION_INITIAL_STATE);
        }
        setFailedApi('');
    };
    const rcsTabData = useMemo(() => {
        const [vendorTab, quietHoursTab] = RCS_INNER_TAB_CONFIG;
        return [
            {
                id: vendorTab.id,
                text: vendorTab.text,
                disable: false,
                component: () => (
                    <RCSProvider.Provider value={value}>
                        {gridCreate.showGrid ? (
                            <RCSGrid />
                        ) : (
                            <RCSVendorCreate
                                config={gridCreate.rcsAction.edit.editState}
                                type={gridCreate.rcsAction.edit.isEdit ? 'edit' : 'create'}
                                handleCancel={(status) => {
                                    if (status) {
                                        setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: status,
                                            rcsAction: {
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
                        {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
                    </RCSProvider.Provider>
                ),
            },
            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.RCS).map((tab) => ({
                ...tab,
                id: quietHoursTab.id,
                text: quietHoursTab.text,
            })),
        ];
    }, [dispatch, failureApiErrors, gridCreate, value]);

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={rcsTabData}
                        className="rs-tabs row"
                        componentClassName={'mt20'}
                        defaultTab={tabState}
                        callBack={(tab) => {
                            syncRcsInnerTabQuery(tab.id);

                        }}
                    />
                </div>
            </div>
            <div id={RCS_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default RCS;
