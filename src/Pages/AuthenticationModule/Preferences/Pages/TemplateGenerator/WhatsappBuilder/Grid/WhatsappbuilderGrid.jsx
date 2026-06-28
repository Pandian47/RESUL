import { getUserDetails } from 'Utils/modules/crypto';
import { WHATSAPP_TEMPLATE_BUILDER } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Dashboard, CreateTemplate, TrustSignalProvider } from '@resulticks/trustsignal-wa-hsm';
import RSPageHeader from 'Components/RSPageHeader';
import { useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { baseURL } from 'Constants/EndPoints';
import usePermission from 'Hooks/usePersmission';

import { userImg } from 'Assets/Images';

const WhatsappBuilder = () => {
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [currentView, setCurrentView] = useState('dashboard');
    const [editId, setEditId] = useState(null);
    const { permissions } = usePermission();
    const { firstName, profileImage, roleId, ...userDetails } = getUserDetails();
    const profilePicture = profileImage ? `data:image/png;base64,${profileImage}` : userImg;

    useEffect(() => {
        const cssId = 'trustsignal-wa-hsm-styles';
        let linkElement = null;
        
        const loadCSS = async () => {
            try {
                // Check if link already exists
                const existingLink = document.getElementById(cssId);
                if (existingLink) {
                    linkElement = existingLink;
                    return;
                }

                // Create link element manually
                linkElement = document.createElement('link');
                linkElement.id = cssId;
                linkElement.rel = 'stylesheet';
                linkElement.type = 'text/css';
                
                // Try to resolve the CSS path using Vite's ?url syntax
                try {
                    const module = await import('@resulticks/trustsignal-wa-hsm/style.css?url');
                    linkElement.href = module.default;
                } catch (e) {
                    // Fallback to node_modules path
                    linkElement.href = '/node_modules/@resulticks/trustsignal-wa-hsm/style.css';
                }

                // Append to head
                document.head.appendChild(linkElement);
            } catch (error) {
            }
        };

        loadCSS();

        // Cleanup function to remove CSS when component unmounts
        return () => {
            const link = document.getElementById(cssId);
            if (link) {
                link.remove();
            }
        };
    }, []);

    const handleCreateTemplate = () => {
        setEditId(null);
        setCurrentView('create');
    };

    const handleEditTemplate = (id) => {
        setEditId(id);
        setCurrentView('edit');
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setEditId(null);
    };

    /**
     * Back button handler for RSPageHeader
     * - If inside create/edit → go back to dashboard
     * - If already on dashboard → RSPageHeader will use backPath
     */
    const handleBackClick = () => {
        if (currentView !== 'dashboard') {
            handleBackToDashboard();
        }
    };
    return (
        <div className="page-content-holder container">
            <RSPageHeader
                title={
                    WHATSAPP_TEMPLATE_BUILDER ||
                    'WhatsApp Template Builder'
                }
                isBack
                backAction={handleBackClick}
                backPath={
                    currentView === 'dashboard'
                        ? '/preferences/template-gallery'
                        : undefined
                }
                isHeaderLine
                rightCommonMenus
            />

            <TrustSignalProvider
                pConfig={{
                    baseUrl: baseURL,
                    departmentId,
                    clientId,
                    userId,
                    token: localStorage.getItem('accessToken') || null,
                    userDetails: {
                        profileName: firstName,
                        profileImage: profilePicture,
                        roleId : roleId
                    }
                }}
            >
                {currentView === 'dashboard' ? (
                    <Dashboard
                        onCreateTemplate={handleCreateTemplate}
                        onEditTemplate={handleEditTemplate}
                    />
                ) : (
                    <CreateTemplate
                        editId={editId || undefined}
                        onCancel={handleBackToDashboard}
                    />
                )}
            </TrustSignalProvider>
        </div>
    );
};

export default WhatsappBuilder;
