import { QUIET_HOURS, QUIET_HOURS_ADD_RULE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QuietHoursGrid from './Component/QuietHoursGrid';
import QuietHoursCreate from './Component/QuietHoursCreate';
import RSTooltip from 'Components/RSTooltip';
import { getUserDetails } from 'Utils/modules/crypto';
import { useDispatch, useSelector } from 'react-redux';
import { reset_failures_API_Errors } from 'Reducers/globalState/reducer';
import {
    QuietHoursSystemErrorPopup,
    reportQuietHoursSystemFailure,
} from './quietHoursApiError';
import { QUIET_HOURS_CHANNEL_KEYS, isQuietHoursAdminRole, resolveQuietHoursChannel } from './constant';

export const QuietHoursProvider = createContext(null);

const QuietHours = ({ channelKey = QUIET_HOURS_CHANNEL_KEYS.EMAIL }) => {
    const channel = useMemo(() => resolveQuietHoursChannel(channelKey), [channelKey]);
    const embedded = channel.embedded;

    const [gridCreate, setGridCreate] = useState({
        showGrid: true,
        quietHoursAction: {
            edit: {
                editState: [],
                isEdit: false,
            },
            create: false,
            duplicate: false,
        },
    });
    const dispatch = useDispatch();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const roleId = getUserDetails()?.roleId;
    const isAdmin = isQuietHoursAdminRole(roleId);
    const [failedApi, setFailedApi] = useState('');
    const [gridListVersion, setGridListVersion] = useState(0);
    const preloadedGridListRef = useRef(null);

    const consumePreloadedGridList = useCallback(() => {
        const data = preloadedGridListRef.current;
        preloadedGridListRef.current = null;
        return data;
    }, []);

    const closeQuietHoursForm = useCallback(() => {
        setGridListVersion((version) => version + 1);
        setGridCreate((prev) => ({
            ...prev,
            showGrid: true,
        }));
    }, []);

    const closeQuietHoursFormAfterSave = useCallback((listData) => {
        preloadedGridListRef.current = listData;
        setGridCreate((prev) => ({
            ...prev,
            showGrid: true,
        }));
    }, []);

    const setQuietHoursFailedApi = useCallback(
        (apiKey, response) => {
            reportQuietHoursSystemFailure(setFailedApi, dispatch, apiKey, response);
        },
        [dispatch],
    );

    useEffect(() => {
        dispatch(reset_failures_API_Errors());
        return () => dispatch(reset_failures_API_Errors());
    }, [dispatch]);

    const value = {
        gridCreate,
        setGridCreate,
        gridListVersion,
        closeQuietHoursForm,
        ...channel,
    };

    const handleErrClose = () => {
        if (!gridCreate.showGrid && failedApi) {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: true,
                quietHoursAction: {
                    edit: {
                        editState: [],
                        isEdit: false,
                    },
                    create: false,
                    duplicate: false,
                },
            }));
        }
        setFailedApi('');
        dispatch(reset_failures_API_Errors());
    };

    const listContent = gridCreate.showGrid ? (
        <>
            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    <h4 className="m0">{QUIET_HOURS}</h4>
                    <div
                        onClick={() => {
                            if (isAdmin) {
                                setGridCreate((prev) => ({
                                    ...prev,
                                    showGrid: false,
                                    quietHoursAction: {
                                        edit: {
                                            editState: [],
                                            isEdit: false,
                                        },
                                        create: true,
                                        duplicate: false,
                                    },
                                }));
                            }
                        }}
                    >
                        <RSTooltip text={QUIET_HOURS_ADD_RULE} position="top" className="lh0">
                            <i
                                id="rs_data_circle_plus_fill_edge"
                                role="presentation"
                                className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                    circle_plus_fill_edge_large
                                } ${!isAdmin ? 'click-off' : 'cp'}`}
                            />
                        </RSTooltip>
                    </div>
                </div>
            </div>
            <QuietHoursGrid />
        </>
    ) : (
        <QuietHoursCreate
            config={gridCreate.quietHoursAction.edit.editState}
            type={
                gridCreate.quietHoursAction.duplicate
                    ? 'duplicate'
                    : gridCreate.quietHoursAction.edit.isEdit
                      ? 'edit'
                      : 'create'
            }
            handleCancel={closeQuietHoursForm}
            setFailedApi={setQuietHoursFailedApi}
        />
    );

    const systemErrorPopup = (
        <QuietHoursSystemErrorPopup
            failureApiErrors={failureApiErrors}
            failedApi={failedApi}
            dispatch={dispatch}
            onClose={handleErrClose}
        />
    );

    return (
        <QuietHoursProvider.Provider value={value}>
            {embedded ? (
                <>
                    {listContent}
                    {systemErrorPopup}
                </>
            ) : (
                <div className="rsv-tabs-content">
                    {gridCreate.showGrid ? (
                        <div className="box-design bd-top-border">{listContent}</div>
                    ) : (
                        listContent
                    )}
                    {systemErrorPopup}
                </div>
            )}
        </QuietHoursProvider.Provider>
    );
};

export default QuietHours;
