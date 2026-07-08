import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ADD_DOMAIN_NAME, ADD_SMTP, SMTP_DOMAIN_SETTINGS, SMTP_SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import RSTooltip from 'Components/RSTooltip';
import RSTabbar from 'Components/RSTabber';
import { SMTPContent } from './Pages/SMTPContent/SMTPContent';
import usePermission from 'Hooks/usePersmission';
import { getSmtpDomainSettingsGrid } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';

import { reset_failures_API_Errors } from 'Reducers/globalState/reducer';
import {
    resolveSmtpInnerActionType,
    resolveSmtpInnerTabState,
    syncSmtpInnerTabQuery,
} from '../../../../constant';
import { getSmtpActionTypeByTabId, SMTP_INNER_TAB_CONFIG } from './constants';

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
    setActions: () => {},
    setSmtpToggle: () => {},
    setDomainToggle: () => {},
    setFailedApi: () => {},
};
export const ActionsType = createContext(initialState);

const SMTP = () => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };

    const [actions, setActions] = useState(() => ({
        type: resolveSmtpInnerActionType(navState),
        state: {},
    }));
    const [tabState, setTabState] = useState(() => resolveSmtpInnerTabState(navState));
    const [smtpToggle, setSmtpToggle] = useState('');
    const [domainToggle, setDomainToggle] = useState('');
    const [failedApi, setFailedApi] = useState('');

    const value = { actions, setActions, smtpToggle, setSmtpToggle, domainToggle, setDomainToggle, setFailedApi };
    const [gridData, setGridData] = useState('');
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();

    useEffect(() => {
        const mergedNavState = { ...queryState, ...state };
        setTabState(resolveSmtpInnerTabState(mergedNavState));
        const nextActionType = resolveSmtpInnerActionType(mergedNavState);
        if (nextActionType === 'SMTP Grid' || nextActionType === 'Domain Settings') {
            setActions((prev) =>
                prev.type === nextActionType ? prev : { type: nextActionType, state: {} },
            );
        }
        if (mergedNavState?.from === 'CreateCommunication' && mergedNavState?.mode === 'add') {
            setActions({ type: 'Domain Create', state: {} });
            setDomainToggle('add');
        }
    }, [queryState, state]);

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
            syncSmtpInnerTabQuery('domain');
        } else if (failedApi === 'GetClientSmtpbyId') {
            setActions({
                type: 'SMTP Grid',
                state: {},
            });
            syncSmtpInnerTabQuery('smtp');
        }
        setFailedApi('');
    };

    useEffect(() => {
        return () => {
            dispatch(reset_failures_API_Errors());
        };
    }, []);

    const smtpTabData = useMemo(
        () =>
            SMTP_INNER_TAB_CONFIG.map((tab) => ({
                id: tab.id,
                text: tab.text,
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
            })),
        [addAccess, gridData],
    );

    const isGridTabView = actions.type === 'SMTP Grid' || actions.type === 'Domain Settings';
    const smtpDefaultTab = isGridTabView ? tabState : resolveSmtpInnerTabState(navState);

    return (
        <ActionsType.Provider value={value}>
            <div className="rsv-tabs-content">
                {isGridTabView ? (
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
                                callBack={(tab) => {
                                    syncSmtpInnerTabQuery(tab.id);
                                    setActions({
                                        type: getSmtpActionTypeByTabId(tab.id),
                                        state: {},
                                    });
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <SMTPContent />
                )}
                {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
            </div>
        </ActionsType.Provider>
    );
};

export default SMTP;
