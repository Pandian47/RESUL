import { getUserDetails } from 'Utils/modules/crypto';
import { useState, useEffect } from 'react';
import { RCSProvider, RCSDashboard, RCSCreateTemplate } from '@resulticks/trustsignal-rcs';
import RSPageHeader from 'Components/RSPageHeader';
import { useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { baseURL } from 'Constants/EndPoints';


const RCSBuilder = () => {
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [currentView, setCurrentView] = useState('dashboard');
    const { firstName, profileImage, roleId } = getUserDetails();
    const accessToken = localStorage.getItem('accessToken') || '';
    const jwtToken = localStorage.getItem('jwtToken') || '';

    useEffect(() => {
        const cssId = 'trustsignal-rcs-styles';
        if (document.getElementById(cssId)) return;
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = '/node_modules/@resulticks/trustsignal-rcs/dist/trustsignal-rcs.css';
        document.head.appendChild(link);
        return () => {
            document.getElementById(cssId)?.remove();
        };
    }, []);

    const handleCreateTemplate = () => {
        setCurrentView('create');
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
    };

    const handleBackClick = () => {
        if (currentView !== 'dashboard') {
            handleBackToDashboard();
        }
    };

    const title = currentView === 'dashboard' ? 'RCS Templates' : 'Create RCS Template';

    const rightCommonMenus = currentView === 'dashboard' ? true : false;

    return (
        <div className="page-content-holder container" style={{ paddingInline: '0px' }}>
            <RSPageHeader
                title={title}
                isBack
                backAction={handleBackClick}
                backPath={currentView === 'dashboard' ? '/preferences/template-gallery' : undefined}
                isHeaderLine
                rightCommonMenus={rightCommonMenus}
                pageClass="px0"
            />

            <RCSProvider
                pConfig={{
                    baseUrl: baseURL,
                    departmentId,
                    clientId,
                    userId,
                    token: accessToken || null,
                    jwtToken,
                    userDetails: {
                        profileName: firstName,
                        profileImage: profileImage
                            ? `data:image/png;base64,${profileImage}`
                            : undefined,
                        roleId,
                    },
                }}
            >
                {currentView === 'dashboard' ? (
                    <RCSDashboard
                        onCreateTemplate={handleCreateTemplate}
                    />
                ) : (
                    <RCSCreateTemplate
                        onCancel={handleBackToDashboard}
                    />
                )}
            </RCSProvider>
        </div>
    );
};

export default RCSBuilder;