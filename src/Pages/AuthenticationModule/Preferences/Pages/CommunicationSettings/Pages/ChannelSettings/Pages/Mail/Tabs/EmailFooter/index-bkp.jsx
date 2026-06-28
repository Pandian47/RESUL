import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useEffect, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import EmailFooterCreate from './Component/EmailFooterCreate';
import EmailFooterGrid from './Component/EmailFooterGrid/EmailFooterGrid';
import useQueryParams from 'Hooks/useQueryParams';

import { useDispatch, useSelector } from 'react-redux';

export const EmailFooterProvider = createContext();

const EmailFooter = () => {
    const location = useQueryParams();
    const dispatch = useDispatch()
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [ failedApi, setFailedApi] = useState('')
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
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                emailFooterAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: true,
                },
            }));
        }
    };
    const handleErrClose = () => {
        if(failedApi === 'GetEmailFooterById'){
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
        setFailedApi('')
    }

    return (
        <EmailFooterProvider.Provider value={value}>
            <div className="rsv-tabs-content">
                {gridCreate.showGrid ? (
                    <div className="box-design bd-top-border">
                        {/* Content starts */}
                        <div className="rs-sub-heading">
                            <div className="align-items-center d-flex justify-content-between">
                                <h4 className="mb0">Email footer</h4>
                                <div onClick={handleCreate}>
                                    <RSTooltip text="Add" position="top" className="lh0">
                                        <i
                                             id='rs_data_circle_plus_fill_edge'
                                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                                circle_plus_fill_edge_large
                                            } ${!addAccess ? 'click-off' : ''}`}
                                        ></i>
                                    </RSTooltip>
                                </div>
                            </div>
                        </div>
                        <EmailFooterGrid />
                    </div>
                ) : (
                    <EmailFooterCreate
                        config={gridCreate.emailFooterAction.edit.editState}
                        type={gridCreate.emailFooterAction.edit.isEdit ? 'edit' : 'create'}
                        handleCancel={(status) => {
                            if (status) {
                                setGridCreate((prev) => ({
                                    ...prev,
                                    showGrid: status,
                                    emailFooterAction: {
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
            </div>
        </EmailFooterProvider.Provider>
    );
};

export default EmailFooter;
