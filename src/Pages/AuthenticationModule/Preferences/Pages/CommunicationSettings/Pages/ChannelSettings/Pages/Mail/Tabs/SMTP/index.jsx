import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ADD_DOMAIN_NAME, ADD_SMTP, BACK, SMTP_DOMAIN_SETTINGS, SMTP_SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { arrow_left_mini, circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RSTooltip from 'Components/RSTooltip';
import RSTabbar from 'Components/RSTabber';
import { SMTPContent } from './Pages/SMTPContent/SMTPContent';
import usePermission from 'Hooks/usePersmission';
import { getSmtpDomainSettingsGrid } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';

import { reset_failures_API_Errors } from 'Reducers/globalState/reducer';
const SMTPTabPanel = ({ addAccess, gridData, setActions, setSmtpToggle, setDomainToggle }) => {
    const { actions } = useContext(ActionsType);
    return (
        <>
            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                        {actions?.type === 'SMTP Grid' ? (
                            <h4 className="mb0">{SMTP_SETTINGS}</h4>
                        ) : (
                            <h4 className="mb0">{SMTP_DOMAIN_SETTINGS}</h4>
                        )}
                    </div>
                    {actions?.type !== 'SMTP Create' && actions?.type !== 'Domain Create' && (
                        <ul className="rs-list-inline rli-space-15 lh0 align-items-center d-flex">
                            {actions?.type === 'Domain Settings' && (
                                <>
                                    <li>
                                        <RSTooltip
                                            position="top"
                                            text={ADD_DOMAIN_NAME}
                                            className={`lh0${!addAccess ? ' cursor-not-allowed' : ''}`}
                                        >
                                            <i
                                                id="rs_data_circle_plus_fill_edge"
                                                className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large} ${!addAccess ? 'click-off' : ''}`}
                                                onClick={() => {
                                                    if (addAccess) {
                                                        setActions({ type: 'Domain Create', state: {} });
                                                        setDomainToggle('add');
                                                    }
                                                }}
                                            />
                                        </RSTooltip>
                                    </li>
                                    {/* <li
                                        className="rssr-back-icon cp"
                                        onClick={() => setActions({ type: 'SMTP Grid', state: {} })}
                                    >
                                        <i className={`icon-mini color-primary-blue mt5 ${arrow_left_mini}`} />
                                        <span className="color-secondary-blue">{BACK}</span>
                                    </li> */}
                                </>
                            )}
                            {actions?.type === 'SMTP Grid' && (
                                <li>
                                    <RSTooltip
                                        position="top"
                                        text={ADD_SMTP}
                                        className={`lh0${!addAccess || !gridData?.length ? ' cursor-not-allowed' : ''}`}
                                    >
                                        <i
                                            id="rs_data_circle_plus_fill_edge"
                                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large} ${!addAccess || !gridData?.length ? 'click-off' : ''}`}
                                            onClick={() => {
                                                if (addAccess && gridData?.length > 0) {
                                                    setActions({ type: 'SMTP Create', state: {} });
                                                    setSmtpToggle('add');
                                                }
                                            }}
                                        />
                                    </RSTooltip>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
            <SMTPContent />
        </>
    );
};

const initialState = {
    actions: { type: 'SMTP Grid', state: {} },
    smtpToggle: '',
    domainToggle: '',
    failedApi: '',
    setActions: () => { },
    setSmtpToggle: () => { },
    setDomainToggle: () => { },
    setFailedApi: () => { },
};
export const ActionsType = createContext(initialState);

const SMTP = () => {
    const [actions, setActions] = useState({ type: 'SMTP Grid', state: {} });
    const [smtpToggle, setSmtpToggle] = useState('');
    const [domainToggle, setDomainToggle] = useState('');
    const [failedApi, setFailedApi] = useState('');
    const [showDomainValidateModal, setShowDomainValidateModal] = useState(false);

    const value = { actions, setActions, smtpToggle, setSmtpToggle, domainToggle, setDomainToggle, setFailedApi };
    const [gridData, setGridData] = useState('');
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();

    useEffect(() => {
        handleGridData();
    }, [departmentId, clientId]);

    const handleGridData = async () => {
        const payload = { clientId, userId, departmentId };
        const { status, data } = await dispatch(getSmtpDomainSettingsGrid(payload));
        if (status) {
            setGridData(data);
        } else {
            setGridData([]);
        }
    };
    const handleErrClose = () => {
        if (failedApi === 'GetSmtpDomainbyID') {
            setActions({
                type: 'Domain Settings',
                state: {},
            });
        } else if (failedApi === 'GetClientSmtpbyId') {
            setActions({
                type: 'SMTP Grid',
                state: {},
            });
        }
        setFailedApi('');
    };

    useEffect(() => {
        return () => {
            dispatch(reset_failures_API_Errors());
        };
    }, []);

    const smtpTabData = useMemo(
        () => [
            {
                id: 'smtp',
                text: 'SMTP',
                disable: false,
                component: () => (
                    <SMTPTabPanel
                        addAccess={addAccess}
                        gridData={gridData}
                        setActions={setActions}
                        setSmtpToggle={setSmtpToggle}
                        setDomainToggle={setDomainToggle}
                    />
                ),
            },
            {
                id: 'domain',
                text: 'Domain',
                disable: false,
                component: () => (
                    <SMTPTabPanel
                        addAccess={addAccess}
                        gridData={gridData}
                        setActions={setActions}
                        setSmtpToggle={setSmtpToggle}
                        setDomainToggle={setDomainToggle}
                    />
                ),
            },
        ],
        [addAccess, gridData],
    );

    const smtpDefaultTab = actions.type === 'Domain Settings' || actions.type === 'Domain Create' ? 1 : 0;

    return (
        <ActionsType.Provider value={value}>
            <div className="rsv-tabs-content">
                {/* Content starts */}
                {actions.type === 'SMTP Grid' || actions.type === 'Domain Settings' ? (
                    <div className="box-design bd-top-border">
                        <div className="tabs-right-align pageSub_tab">
                            <RSTabbar
                                defaultClass={`col-md-2 tabTransparent`}
                                dynamicTab={`mb0 mini`}
                                activeClass={`active`}
                                tabData={smtpTabData}
                                className="rs-tabs row"
                                componentClassName="mt20"
                                defaultTab={smtpDefaultTab}
                                callBack={(tab, index) => {
                                    if (index === 0) setActions({ type: 'SMTP Grid', state: {} });
                                    else setActions({ type: 'Domain Settings', state: {} });
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <SMTPContent />
                    </>
                )}
                {/* /Content ends */}
                {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
            </div>
        </ActionsType.Provider>
    );
};

export default SMTP;
