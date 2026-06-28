import { getUserDetails } from 'Utils/modules/crypto';
import { Fragment, useEffect, useState } from 'react';
import AudienceList from './AudienceList';
import AudienceDetail from './AudienceDetail';
import { buildUserInfo } from './constants';

import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { aa_UserInfo, aa_audience_report, aa_audience_timeLineview } from 'Reducers/analytics/aa360/request';
import { AudienceReportSkeleton, AudienceDetailSkeleton } from 'Components/Skeleton/Skeleton';

const Audience = () => {
    const dispatch = useDispatch();
    const [selectedUser, setSelectedUser] = useState({});
    const [isUserDetailInitializing, setIsUserDetailInitializing] = useState(false);
    const [campaingnShortCode, setcampaingnShortCode] = useState([]);
    const { isAgency } = getUserDetails();
    const { accountAdmin, company_clientId } = useSelector(({ globalstate }) => globalstate);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { audience_report, audience_report_loading, audience_details } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    useEffect(() => {
        async function fetchData() {
            const payload = {
                departmentId,
                userId,
                clientId,
                camshotCodes: campaingnShortCode,
            };

            const res = await dispatch(aa_audience_report(payload));
            const userReportsList = res?.data?.userReportsList || [];
            if (userReportsList.length > 0) {
                getuserInfo(userReportsList[0]);
            } else {
                setSelectedUser({});
            }
        }
        if (!isAgencyAccountAdmin) {
            fetchData();
        }
    }, [departmentId, clientId, campaingnShortCode]);
    async function getuserInfo(prop) {
        setIsUserDetailInitializing(true);
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        const payload = {
            departmentId,
            userId,
            clientId,
            passportId: prop?.recipientGUID,
        };
        try {
            let [res_info, res_Time] = await Promise.allSettled([
                dispatch(aa_UserInfo(payload)),
                dispatch(
                    aa_audience_timeLineview({
                        ...payload,
                        month,
                        year,
                    }),
                ),
            ]);
            if (res_info?.status !== 'fulfilled') return;
            const data = res_info.value?.data;
            if (!data) return;
            let obj = buildUserInfo(data, prop?.recipientGUID);
            setSelectedUser(obj);
        } finally {
            setIsUserDetailInitializing(false);
        }
    }

    const hasReportData = audience_report?.userReportsList?.length > 0;

    return (
        <Fragment>
            {audience_report_loading ? (
                <>
                    <AudienceReportSkeleton />
                    <AudienceDetailSkeleton />
                </>
            ) : !hasReportData ? (
                <>
                    <AudienceReportSkeleton isError />
                    <AudienceDetailSkeleton showNoData />
                </>
            ) : (
                <>
                    <AudienceList
                        users={audience_report?.userReportsList}
                        communicationDDL={audience_report?.campaignList}
                        onUserSelect={(user) => {
                            getuserInfo(user);
                        }}
                        setcampaingnShortCode={setcampaingnShortCode}
                    />
                    <AudienceDetail
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                        isUserDetailInitializing={isUserDetailInitializing}
                    />
                </>
            )}
        </Fragment>
    );
};

export default Audience;
