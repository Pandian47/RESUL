import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import WhatsAppGrid from './Grid';
import { WhatsAppProvider } from './Context';
import { ACTION_INITIAL_STATE, WHATSAPP_FORM_ACTIONS_PORTAL_ID } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import WAVendorCreate from './Create/waVendorCreate';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';
import {
    resolveWhatsappInnerTabState,
    syncWhatsappInnerTabQuery,
    WHATSAPP_INNER_TAB_CONFIG,
} from '../../../../constant';
import useQueryParams from 'Hooks/useQueryParams';
import { useLocation } from 'react-router-dom';
const WhatsApp = () => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [failedApi, setFailedApi] = useState('');
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const addVendorFromComm = queryState?.from === 'CreateCommunication' && queryState?.mode === 'add';
    const [tabState, setTabState] = useState(() => resolveWhatsappInnerTabState(navState));
    const value = { setGridCreate, addVendorFromComm };

    useLayoutEffect(() => {
        if (addVendorFromComm) {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                whatsAppAction: {
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
        setTabState(resolveWhatsappInnerTabState({ ...queryState, ...state }));
    }, [queryState, state]);

    const handleErrClose = () => {
        if (failedApi === 'GetWhatsAppSettigByID') {
            setGridCreate(ACTION_INITIAL_STATE);
        }
        setFailedApi('');
    };

    const whatsappTabData = useMemo(() => {
        const [vendorTab, quietHoursTab] = WHATSAPP_INNER_TAB_CONFIG;
        return [
            {
                id: vendorTab.id,
                text: vendorTab.text,
                disable: false,
                component: () => (
                    <WhatsAppProvider.Provider value={value}>
                        {gridCreate.showGrid ? (
                            <WhatsAppGrid />
                        ) : (
                            <WAVendorCreate
                                config={gridCreate.whatsAppAction.edit.editState}
                                type={gridCreate.whatsAppAction.edit.isEdit ? 'edit' : 'create'}
                                handleCancel={(status) => {
                                    if (status) {
                                        setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: status,
                                            whatsAppAction: {
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
                    </WhatsAppProvider.Provider>
                ),
            },
            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.WHATSAPP).map((tab) => ({
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
                        tabData={whatsappTabData}
                        className="rs-tabs row"
                        componentClassName={'mt20'}
                        defaultTab={tabState}
                        callBack={(tab) => {
                            syncWhatsappInnerTabQuery(tab.id);
                        }}
                    />
                </div>
            </div>
            <div id={WHATSAPP_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default WhatsApp;
