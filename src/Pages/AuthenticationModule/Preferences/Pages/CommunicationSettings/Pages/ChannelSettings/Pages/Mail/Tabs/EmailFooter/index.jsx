import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ADD, EMAIL_FOOTER } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, lazy, Suspense, useEffect, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import RSLoader from 'Components/Loader';
import usePermission from 'Hooks/usePersmission';
import EmailFooterGrid from './Component/EmailFooterGrid/EmailFooterGrid';
import useQueryParams from 'Hooks/useQueryParams';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FooterModal from './FooterBuilder/Component/FooterModal';

const FooterBuilder = lazy(() => import('./FooterBuilder'));
export const EmailFooterProvider = createContext();

const EmailFooter = () => {
    const navigate = useNavigate();
    const location = useQueryParams();
    const dispatch = useDispatch();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [failedApi, setFailedApi] = useState('');
    const [templateFlag, setTemplateFlag] = useState({
        mode: null,
        show: false,
    });
    const [templateName, setTemplateName] = useState({ name: '', list: {} });
    const [gridCreate, setGridCreate] = useState({
        showGrid: true,
        emailFooterAction: {
            edit: {
                editState: [],
                isEdit: false,
            },
            create: false,
        },
    });

    useEffect(() => {
        if (!!location?.campaignId) {
            handleCreate();
        }
        // window.history.go(-1);
    }, [location]);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};

    const value = { gridCreate, setGridCreate };

    const handleCreate = () => {
        if (addAccess) {
            // setGridCreate((prev) => ({
            //     ...prev,
            //     showGrid: false,
            //     emailFooterAction: {
            //         edit: {
            //             editState: [],
            //             isEdit: false,
            //         },
            //         create: true,
            //     },
            // }));
            //navigate(`/preferences/communication-settings/footer-builder`);
            setTemplateFlag({
                show: true,
                mode: 'create',
            });
        }
    };

    const handleTemplateClose = (status) => {
        setTemplateFlag({
            show: false,
            mode: 'close',
        });
    };

    const handleErrClose = () => {
        if (failedApi === 'GetEmailFooterById') {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: true,
                emailFooterAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: false,
                },
            }));
        }
        setFailedApi('');
    };

    return (
        <EmailFooterProvider.Provider value={value}>
            <div className="rsv-tabs-content">
                {gridCreate.showGrid ? (
                    <div className="box-design bd-top-border">
                        {/* Content starts */}
                        <div className="rs-sub-heading">
                            <div className="align-items-center d-flex justify-content-between">
                                <h4 className="mb0">{EMAIL_FOOTER}</h4>
                                <div onClick={handleCreate}>
                                    <RSTooltip text={ADD} position="top" className="lh0">
                                        <i
                                            id="rs_data_circle_plus_fill_edge"
                                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                                circle_plus_fill_edge_large
                                            } ${!addAccess ? 'click-off' : ''}`}
                                        ></i>
                                    </RSTooltip>
                                </div>
                            </div>
                        </div>
                        <EmailFooterGrid handleCreate={handleCreate}/>
                    </div>
                ) : (
                    // <EmailFooterCreate
                    //     config={gridCreate.emailFooterAction.edit.editState}
                    //     type={gridCreate.emailFooterAction.edit.isEdit ? 'edit' : 'create'}
                    //     handleCancel={(status) => {
                    //         if (status) {
                    //             setGridCreate((prev) => ({
                    //                 ...prev,
                    //                 showGrid: status,
                    //                 emailFooterAction: {
                    //                     edit: {
                    //                         editState: [],
                    //                         isEdit: false,
                    //                     },
                    //                     create: false,
                    //                 },
                    //             }));
                    //         }
                    //     }}
                    //     setFailedApi={setFailedApi}
                    // />

                    <Suspense fallback={<RSLoader fallback />}>
                        <FooterBuilder />
                    </Suspense>
                )}
                {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
                <FooterModal
                    show={templateFlag}
                    handleClose={(status) => handleTemplateClose(status)}
                    templateName={templateName}
                    from="footer"
                />
            </div>
        </EmailFooterProvider.Provider>
    );
};

export default EmailFooter;
