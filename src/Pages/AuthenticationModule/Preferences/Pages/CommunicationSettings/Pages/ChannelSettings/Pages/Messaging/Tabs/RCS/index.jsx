import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import RCSGrid from './Grid';

import { RCSProvider } from './Context';
import { ACTION_INITIAL_STATE, RCS_FORM_ACTIONS_PORTAL_ID } from './constants';

import { useDispatch, useSelector } from 'react-redux';
import RCSVendorCreate from './Create/RCSVendorCreate';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';

const RCS = () => {
    const dispatch = useDispatch();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [failedApi, setFailedApi] = useState('');
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const value = { setGridCreate };

    const handleErrClose = () => {
        if (failedApi === 'GetRCSSettigByID') {
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
                                id: 3001,
                                text: 'Vendor',
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
                            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.RCS),
                        ]}
                        className="rs-tabs row"
                        componentClassName={'mt20'}
                    />
                </div>
            </div>
            <div id={RCS_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default RCS;
