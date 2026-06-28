import { useContext } from 'react';
import { ActionsType } from '../..';
import SMTPGrid from '../SMTP';
import SMTPDomainNameSettingsGrid from '../DomainSettings';
import Edit from '../SMTP/Create';
import QuickAddDomain from '../../Component/QuickAddDomain';

export const SMTPContent = () => {
    const { actions } = useContext(ActionsType || 'SMTP Grid');

    switch (actions && actions?.type) {
        case 'SMTP Create':
            return <Edit />;
        case 'SMTP Grid':
            return <SMTPGrid />;
        case 'Domain Settings':
            return <SMTPDomainNameSettingsGrid />;
        case 'Domain Create':
            return (
                <QuickAddDomain
                    mode={actions.state.mode}
                    settingsId={actions.state.settingsId}
                    domainStatus={actions.state.domainStatus}
                />
            );
    }
};
