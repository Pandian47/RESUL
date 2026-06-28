import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import WhatsAppGrid from './Grid';

import { WhatsAppProvider } from './Context';
import { ACTION_INITIAL_STATE, WHATSAPP_FORM_ACTIONS_PORTAL_ID } from './constants';

import { useDispatch, useSelector } from 'react-redux';
import WAVendorCreate from './Create/waVendorCreate';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';

const WhatsApp = () => {
    const dispatch = useDispatch();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [failedApi, setFailedApi] = useState('');
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const value = { setGridCreate };

    const handleErrClose = () => {
        if (failedApi === 'GetWhatsAppSettigByID') {
            setGridCreate(ACTION_INITIAL_STATE);
        }
        setFailedApi('');
    };

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={[
                            {
                                id: 2001,
                                text: 'Vendor',
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
                            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.WHATSAPP),
                        ]}
                        className="rs-tabs row"
                        componentClassName={'mt20'}
                    />
                </div>
            </div>
            <div id={WHATSAPP_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default WhatsApp;
