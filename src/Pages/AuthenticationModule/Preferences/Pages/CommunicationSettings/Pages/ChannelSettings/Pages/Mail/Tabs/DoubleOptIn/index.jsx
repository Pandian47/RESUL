import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ADD, DOUBLE_OPT_IN_SETTINGS, DOUBLE_OPT_IN_SETTINGS_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useState } from 'react';
import DoubleOptInGrid from './Component/DoubleOptInGrid';
import DoubleOptInCreate from './Component/DoubleOptInCreate';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';

import { useDispatch, useSelector } from 'react-redux';
import RSPPophover from 'Components/RSPPophover';

export const DoubleOptInProvider = createContext();

const DoubleOptIn = () => {
    const [gridCreate, setGridCreate] = useState({
        showGrid: true,
        doubleOptAction: {
            edit: {
                editState: [],
                isEdit: false,
            },
            create: false,
        },
    });
    const dispatch = useDispatch()
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const [ failedApi, setFailedApi ] = useState('')
    const value = { gridCreate, setGridCreate };

    const handleErrClose = () => {
        if(failedApi === 'GetDoubleOptInById'){
            setGridCreate((prev) => ({
                ...prev,
                showGrid: true,
                doubleOptAction: {
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
        <DoubleOptInProvider.Provider value={value}>
            <div className="rsv-tabs-content">
                {gridCreate.showGrid ? (
                    <div className="box-design bd-top-border">
                        {/* Content starts */}
                        <div className="rs-sub-heading">
                        <div className="align-items-center d-flex justify-content-between">
                       <span className='d-flex align-items-center'>
                       <h4 className="mb0">{DOUBLE_OPT_IN_SETTINGS}
                        <RSPPophover text={DOUBLE_OPT_IN_SETTINGS_TEXT}>
                        <i
                            className={`icon-xs color-primary-blue ml5 ${circle_question_mark_mini}`}
                        ></i>                                         
                         </RSPPophover>
                        </h4>
                       </span>
                        <div
                                    onClick={() => {
                                        if (addAccess) {
                                            setGridCreate((prev) => ({
                                                ...prev,
                                                showGrid: false,
                                                doubleOptAction: {
                                                    edit: {
                                                        editState: [],
                                                        isEdit: false,
                                                    },
                                                    create: true,
                                                },
                                            }));
                                        }
                                    }}
                                >
                                    <RSTooltip text={ADD} position="top" className="lh0">
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
                        <DoubleOptInGrid />
                    </div>
                ) : (
                    <DoubleOptInCreate
                        config={gridCreate.doubleOptAction.edit.editState}
                        type={gridCreate.doubleOptAction.edit.isEdit ? 'edit' : 'create'}
                        handleCancel={(status) => {
                            if (status) {
                                setGridCreate((prev) => ({
                                    ...prev,
                                    showGrid: status,
                                    doubleOptAction: {
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
        </DoubleOptInProvider.Provider>
    );
};

export default DoubleOptIn;
