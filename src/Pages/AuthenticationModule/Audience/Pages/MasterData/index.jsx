import { UPLOAD_PARENT_ATTRIBUTES, UPLOAD_PARENT_ATTRIBUTES_ADD_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { circle_history_fill_edge_large, circle_plus_fill_edge_large, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { getUserDetails, encodeUrl, getPermissions } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ListAqusitionSekelton } from 'Components/Skeleton/Skeleton';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
// import { keys, map } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isEmpty as _isEmpty,find as _find } from 'Utils/modules/lodashReplacements';
import { MASTERDATA_INITIAL_STATE, AUDIENCE_TYPE_FLAGS } from './constant';
import usePermission from 'Hooks/usePersmission';
import { getMasterDataAudience, getMasterGridData ,getRecommendationJson} from 'Reducers/audience/masterdata/request';
import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';
import Overview from './Component/Overview/Overview';
import ListActivity from './Component/ListActivity/ListActivity';
import AudienceList from './Component/AudienceList/AudienceList';
import RSTooltip from 'Components/RSTooltip';
import { getSessionId } from 'Reducers/globalState/selector';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import { reset_mdm } from 'Reducers/audience/masterdata/reducer';
import SkeletonMDMOverviewCard from 'Components/Skeleton/Components/SkeletonMDMOverviewCard';
import { globalStateSelector } from 'Utils/Selectors/app';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
const MasterData = () => {
    const { audienceOverview = {}, audienceOverviewLoading = false } = useSelector(
        ({ masterDataReducer = {} }) => masterDataReducer,
    );
    const { permissions = {} } = usePermission() ?? {};
    const userDetails = getUserDetails() ?? {};
    const { isAgency = false, licenseTypeId = '', isHybrid = false } = userDetails;
    const { showSessionModal = false } = useSelector((state) => globalStateSelector(state) ?? {});
    const { accountAdmin = {}, company_clientId = {}, failureApiErrors } = useSelector(
        ({ globalstate = {} }) => globalstate,
    );
    const isAgencyAccountAdmin =
        isAgency && accountAdmin?.clientId != null && accountAdmin?.clientId === company_clientId?.clientId;
    const { addAccess = false } = permissions;

    const permissionList = getPermissions();
    const { addAccess: addAudienceAccess = false } = _find(permissionList, { featureId: 55 }) ?? {};
    const navigate = useNavigate();
    const { pathname = '' } = useLocation() ?? {};
    const { t: translation } = useTranslation();
    const [show, setIsShow] = useState(MASTERDATA_INITIAL_STATE);
    const isMountedRef = useRef(true);

    const dispatch = useDispatch();
    const masterDataAudienceRequest = useApiLoader({
        actionCreator: getMasterDataAudience,
    });
    const masterGridRequest = useApiLoader({
        actionCreator: getMasterGridData,
    });
    const recommendationRequest = useApiLoader({
        actionCreator: getRecommendationJson,
    });
    const sessionIds = useSelector((state) => getSessionId(state) ?? {});
    const { departmentId, clientId, userId, departmentName = '' } = sessionIds;
    const { currentTabConfig: { audienceType = 'Brand audience' } = {} } = useSelector(
        ({ globalstate = {} }) => globalstate,
    );
    const audienceFlags = AUDIENCE_TYPE_FLAGS[audienceType] ?? { isPartner: false, isInternal: false };
    const isInternalOrPartner = audienceType === 'Internal audience' || audienceType === 'Partner audience';
    const isDepartmentBlocked = departmentName?.toLowerCase() === 'all' && licenseTypeId === '3';
    const hasSessionIds = Boolean(departmentId && clientId && userId);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!hasSessionIds) return;

        const payload = {
            departmentId,
            userId,
            clientId,
            isPartner: audienceFlags.isPartner,
            isInternal: audienceFlags.isInternal,
        };
        const gridPayload = { ...payload, Isupdate: false, updateattribute: [] };
        const recommendationPayload = {
            departmentId,
            userId,
            clientId,
            isBrand: audienceFlags.isPartner ? 0 : 1,
        };

        try {
            if (!isDepartmentBlocked) {
                if (!isAgencyAccountAdmin) {
                    masterDataAudienceRequest.refetch(payload);
                }
                masterGridRequest.refetch(gridPayload);
            }
            recommendationRequest.refetch(recommendationPayload);
        } catch {
            // API dispatch failures are surfaced via failureApiErrors popup
        }
    }, [
        departmentId,
        clientId,
        userId,
        showSessionModal,
        audienceType,
        audienceFlags.isPartner,
        audienceFlags.isInternal,
        hasSessionIds,
        isAgencyAccountAdmin,
        isDepartmentBlocked,
        masterDataAudienceRequest.refetch,
        masterGridRequest.refetch,
        recommendationRequest.refetch,
    ]);

    const handleInfo = useCallback((field, value) => {
        if (!field || !isMountedRef.current) return;
        setIsShow((prev) => ({ ...(prev ?? {}), [field]: value }));
    }, []);

    const navigateToAddAudience = useCallback(() => {
        if (!addAccess || !pathname) return;

        const stateRedirect = { from: 'master-data' };
        try {
            const stateredirectEncode = encodeUrl(stateRedirect);
            navigate(`${pathname}/add-audience?q=${stateredirectEncode}`, { state: stateRedirect });
        } catch {
            navigate(`${pathname}/add-audience`, { state: stateRedirect });
        }
    }, [addAccess, navigate, pathname]);

    useComponentWillUnmount(() => {
        resetAbortableRequests(masterDataAudienceRequest, masterGridRequest, recommendationRequest);
        dispatch(reset_mdm());
    });

    const showAudienceListSection = audienceOverviewLoading || !_isEmpty(audienceOverview);

    return (
        <Fragment>
            {/* Title Band */}
            <div className="flex-row top-sub-heading sp-mt-space-sm sp-mb-space-sm">
                <div className="fr flex-left">
                    <h3>{translation('Overview')}</h3>
                </div>
                <ul
                    className={`${
                        departmentName?.toLowerCase() === 'all' && licenseTypeId == '3' ? 'click-off' : ''
                    }  rs-list-group-horizontal jc-right`}
                >
                    {!_isEmpty(audienceOverview) && (
                        <li>
                            <RSTooltip text={translation('Sync_history')} position="top" className="lh0">
                                <i
                                    id="rs_data_circle_history_fill_edge"
                                    className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_history_fill_edge_large}`}
                                    onClick={() => {
                                        if (pathname) navigate(`${pathname}/sync-history`);
                                    }}
                                ></i>
                            </RSTooltip>
                        </li>
                    )}
                    <li className={isHybrid && !addAudienceAccess ? 'd-none' : ''}>
                        <RSTooltip text={translation('Add audience')} position="top" className="lh0">
                            <i
                                id="rs_data_circle_plus_fill_edge"
                                className={`${
                                    !addAccess ? 'click-off' : ''
                                }  icon-lg color-primary-blue icon-hover-shadow-primary ${
                                    circle_plus_fill_edge_large
                                }`}
                                onClick={navigateToAddAudience}
                            ></i>
                        </RSTooltip>
                    </li>
                </ul>
            </div>
            {/* Title Band */}
            {audienceOverviewLoading ? (
                <>
                    <SkeletonMDMOverviewCard />
                    {!isInternalOrPartner && <ListAqusitionSekelton />}
                </>
            ) : _isEmpty(audienceOverview) ? (
                <RSSkeletonTable
                    count={7}
                    text
                    isAlertIcon={false}
                    message={
                        <>
                            {UPLOAD_PARENT_ATTRIBUTES}
                            <i
                                onClick={navigateToAddAudience}
                                className={`${isDepartmentBlocked ? 'click-off' : ''} ${circle_plus_fill_medium} icon-md px5 color-primary-blue`}
                                id="rs_data_circle_plus_fill"
                                style={{
                                    cursor: addAccess && !isDepartmentBlocked ? 'pointer' : 'default',
                                }}
                            />
                            {UPLOAD_PARENT_ATTRIBUTES_ADD_AUDIENCE}
                        </>
                    }
                />
            ) : (
                <Fragment>
                    {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                        <div className="box-design">
                            <NoDataAvailableRender />
                        </div>
                    ) : (
                        <Fragment>
                            {/* Profile Data */}
                            <Overview show={show} handleInfo={handleInfo} />
                            {/* List activity - hidden for Internal and Partner audience */}
                            {!isInternalOrPartner && <ListActivity show={show} setIsShow={setIsShow} />}
                        </Fragment>
                    )}
                </Fragment>
            )}

            {showAudienceListSection && !isDepartmentBlocked && (
                <AudienceList show={show ?? {}} setIsShow={setIsShow} />
            )}

            {getWarningPopupMessage(failureApiErrors, dispatch) ?? null}
        </Fragment>
    );
};

export default MasterData;
